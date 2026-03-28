/**
 * 巨鲸追踪服务
 * 追踪大额持有者地址的交易行为
 */

const crypto = require('crypto');

class WhaleTrackerService {
    constructor() {
        // 巨鲸地址列表: { address, label, balance, trackedAt }
        this.whales = new Map();
        // 交易提醒: { userId, whaleAddress, minAmount, alertType }
        this.alerts = new Map();
        // 交易记录
        this.transactions = [];
    }

    /**
     * 添加巨鲸地址
     */
    addWhale(address, label = '未知巨鲸', balance = 0) {
        this.whales.set(address.toLowerCase(), {
            address: address.toLowerCase(),
            label,
            balance,
            trackedAt: new Date().toISOString(),
            transactionCount: 0
        });
        return this.whales.get(address.toLowerCase());
    }

    /**
     * 获取所有巨鲸
     */
    getAllWhales() {
        return Array.from(this.whales.values());
    }

    /**
     * 获取巨鲸详情
     */
    getWhale(address) {
        return this.whales.get(address.toLowerCase());
    }

    /**
     * 删除巨鲸
     */
    removeWhale(address) {
        return this.whales.delete(address.toLowerCase());
    }

    /**
     * 创建交易提醒
     */
    createAlert(userId, whaleAddress, minAmount, alertType = 'all') {
        const alertId = `alert_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

        this.alerts.set(alertId, {
            id: alertId,
            userId,
            whaleAddress: whaleAddress.toLowerCase(),
            minAmount: parseFloat(minAmount),
            alertType, // 'all' | 'buy' | 'sell' | 'transfer'
            createdAt: new Date().toISOString(),
            active: true
        });

        return this.alerts.get(alertId);
    }

    /**
     * 获取用户提醒
     */
    getUserAlerts(userId) {
        return Array.from(this.alerts.values()).filter(a => a.userId === userId && a.active);
    }

    /**
     * 删除提醒
     */
    deleteAlert(alertId) {
        const alert = this.alerts.get(alertId);
        if (alert) {
            alert.active = false;
            return true;
        }
        return false;
    }

    /**
     * 记录交易
     */
    recordTransaction(transaction) {
        const tx = {
            ...transaction,
            id: `tx_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
            timestamp: new Date().toISOString()
        };

        this.transactions.push(tx);

        // 限制记录数量
        if (this.transactions.length > 10000) {
            this.transactions.shift();
        }

        // 更新巨鲸交易计数
        const whale = this.whales.get(tx.fromAddress?.toLowerCase());
        if (whale) {
            whale.transactionCount++;
        }

        // 检查是否触发提醒
        return this.checkAlerts(tx);
    }

    /**
     * 检查提醒
     */
    checkAlerts(transaction) {
        const triggered = [];

        for (const [alertId, alert] of this.alerts.entries()) {
            if (!alert.active) continue;

            // 检查是否匹配巨鲸地址
            const fromWhale = this.whales.get(transaction.fromAddress?.toLowerCase());
            const toWhale = this.whales.get(transaction.toAddress?.toLowerCase());

            const isFromWhale = fromWhale && fromWhale.address === alert.whaleAddress;
            const isToWhale = toWhale && toWhale.address === alert.whaleAddress;

            if (!isFromWhale && !isToWhale) continue;

            // 检查交易类型
            if (alert.alertType !== 'all') {
                const txType = isFromWhale ? 'sell' : 'buy';
                if (txType !== alert.alertType) continue;
            }

            // 检查金额
            if (transaction.amount && transaction.amount < alert.minAmount) continue;

            triggered.push({
                alertId,
                alert,
                transaction,
                whale: isFromWhale ? fromWhale : toWhale,
                direction: isFromWhale ? '卖出' : '买入'
            });
        }

        return triggered;
    }

    /**
     * 获取巨鲸最近交易
     */
    getWhaleTransactions(address, limit = 20) {
        const addrLower = address.toLowerCase();
        return this.transactions
            .filter(tx =>
                tx.fromAddress?.toLowerCase() === addrLower ||
                tx.toAddress?.toLowerCase() === addrLower
            )
            .slice(-limit)
            .reverse();
    }

    /**
     * 获取统计信息
     */
    getStats() {
        return {
            totalWhales: this.whales.size,
            activeAlerts: Array.from(this.alerts.values()).filter(a => a.active).length,
            totalTransactions: this.transactions.length
        };
    }

    /**
     * 初始化默认巨鲸
     */
    initDefaultWhales() {
        // BSC 链知名巨鲸地址（示例）
        const defaultWhales = [
            { address: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3', label: 'Binance Hot Wallet', balance: 1000000 },
            { address: '0x0eD1439dd78D029C65F54E4Ae6EA4f24B832af7c', label: 'Binance Cold Wallet', balance: 5000000 },
            { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0', label: 'Whale Alert', balance: 2000000 }
        ];

        for (const whale of defaultWhales) {
            if (!this.whales.has(whale.address.toLowerCase())) {
                this.addWhale(whale.address, whale.label, whale.balance);
            }
        }
    }
}

module.exports = new WhaleTrackerService();
