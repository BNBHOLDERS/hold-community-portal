/**
 * 链上活动监控服务
 * 监控指定地址和代币的活动
 */

class ActivityMonitorService {
    constructor() {
        // 监控目标: { id, type, target, createdBy, createdAt }
        this.monitors = new Map();
        // 活动记录: { monitorId, activities[] }
        this.activities = new Map();
        // 轮询间隔（毫秒）
        this.pollInterval = 60000; // 1分钟
        this.pollingTimer = null;
    }

    /**
     * 创建监控
     */
    createMonitor(type, target, createdBy = 'system') {
        const id = `monitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const monitor = {
            id,
            type, // 'address' | 'token'
            target,
            status: 'active',
            createdBy,
            createdAt: new Date().toISOString(),
            lastChecked: null,
            activityCount: 0
        };

        this.monitors.set(id, monitor);
        this.activities.set(id, []);

        return monitor;
    }

    /**
     * 获取所有监控
     */
    getAllMonitors() {
        return Array.from(this.monitors.values());
    }

    /**
     * 获取用户创建的监控
     */
    getUserMonitors(userId) {
        return Array.from(this.monitors.values()).filter(m => m.createdBy === userId);
    }

    /**
     * 删除监控
     */
    deleteMonitor(id) {
        const deleted = this.monitors.delete(id);
        this.activities.delete(id);
        return deleted;
    }

    /**
     * 获取监控活动
     */
    getMonitorActivities(id, limit = 50) {
        const activities = this.activities.get(id) || [];
        return activities.slice(-limit);
    }

    /**
     * 添加活动记录
     */
    addActivity(monitorId, activity) {
        const monitorActivities = this.activities.get(monitorId);
        if (!monitorActivities) return;

        const newActivity = {
            ...activity,
            timestamp: new Date().toISOString(),
            id: `${monitorId}_${Date.now()}`
        };

        monitorActivities.push(newActivity);

        // 限制记录数量
        if (monitorActivities.length > 1000) {
            monitorActivities.shift();
        }

        // 更新监控统计
        const monitor = this.monitors.get(monitorId);
        if (monitor) {
            monitor.activityCount++;
            monitor.lastChecked = newActivity.timestamp;
        }

        return newActivity;
    }

    /**
     * 模拟检查活动（实际应从区块链获取）
     */
    async checkActivities() {
        const results = [];

        for (const [id, monitor] of this.monitors.entries()) {
            if (monitor.status !== 'active') continue;

            // 模拟活动检测
            const shouldGenerateActivity = Math.random() > 0.7;

            if (shouldGenerateActivity) {
                const activityTypes = monitor.type === 'token'
                    ? ['large_transaction', 'liquidity_change', 'holder_change']
                    : ['transaction', 'token_transfer', 'approval'];

                const activity = {
                    type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
                    description: this.generateActivityDescription(monitor),
                    data: this.generateActivityData(monitor)
                };

                this.addActivity(id, activity);
                results.push({ monitorId: id, activity });
            }
        }

        return results;
    }

    /**
     * 生成活动描述
     */
    generateActivityDescription(monitor) {
        const templates = {
            address: [
                '检测到大额转账',
                '新的代币授权',
                '流动性添加',
                '代币交换'
            ],
            token: [
                '巨鲸地址增持',
                '流动性池变化',
                '新持币地址',
                '交易量激增'
            ]
        };

        const typeTemplates = templates[monitor.type] || templates.address;
        return typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
    }

    /**
     * 生成模拟活动数据
     */
    generateActivityData(monitor) {
        return {
            amount: (Math.random() * 100000).toFixed(2),
            usdValue: (Math.random() * 50000).toFixed(2),
            relatedAddress: '0x' + Math.random().toString(16).substr(2, 40)
        };
    }

    /**
     * 启动轮询
     */
    startPolling() {
        if (this.pollingTimer) return;

        this.pollingTimer = setInterval(async () => {
            await this.checkActivities();
        }, this.pollInterval);

        console.log('链上活动监控已启动');
    }

    /**
     * 停止轮询
     */
    stopPolling() {
        if (this.pollingTimer) {
            clearInterval(this.pollingTimer);
            this.pollingTimer = null;
            console.log('链上活动监控已停止');
        }
    }

    /**
     * 获取统计信息
     */
    getStats() {
        return {
            totalMonitors: this.monitors.size,
            activeMonitors: Array.from(this.monitors.values()).filter(m => m.status === 'active').length,
            totalActivities: Array.from(this.activities.values()).reduce((sum, acts) => sum + acts.length, 0)
        };
    }
}

module.exports = new ActivityMonitorService();
