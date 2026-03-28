/**
 * 链上活动监控控制器
 */

const activityMonitor = require('../services/activityMonitorService');

/**
 * 获取所有监控
 */
async function getMonitors(req, res) {
    try {
        const monitors = activityMonitor.getAllMonitors();
        res.json({
            success: true,
            data: monitors,
            stats: activityMonitor.getStats()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * 创建监控
 */
async function createMonitor(req, res) {
    try {
        const { type, target } = req.body;
        const userId = req.user?.id || req.body.userId || 'anonymous';

        if (!type || !target) {
            return res.status(400).json({ error: '类型和目标不能为空' });
        }

        if (!['address', 'token'].includes(type)) {
            return res.status(400).json({ error: '类型必须是 address 或 token' });
        }

        const monitor = activityMonitor.createMonitor(type, target, userId);

        res.json({
            success: true,
            data: monitor,
            message: '监控创建成功'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * 删除监控
 */
async function deleteMonitor(req, res) {
    try {
        const { id } = req.params;

        const deleted = activityMonitor.deleteMonitor(id);

        if (!deleted) {
            return res.status(404).json({ error: '监控不存在' });
        }

        res.json({
            success: true,
            message: '监控已删除'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * 获取监控活动
 */
async function getMonitorActivities(req, res) {
    try {
        const { id } = req.params;
        const { limit = 50 } = req.query;

        const activities = activityMonitor.getMonitorActivities(id, parseInt(limit));

        res.json({
            success: true,
            data: activities
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * 手动触发检查（用于测试）
 */
async function triggerCheck(req, res) {
    try {
        const results = await activityMonitor.checkActivities();

        res.json({
            success: true,
            data: results,
            message: `检查完成，发现 ${results.length} 条新活动`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * 获取统计信息
 */
async function getStats(req, res) {
    try {
        const stats = activityMonitor.getStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getMonitors,
    createMonitor,
    deleteMonitor,
    getMonitorActivities,
    triggerCheck,
    getStats
};
