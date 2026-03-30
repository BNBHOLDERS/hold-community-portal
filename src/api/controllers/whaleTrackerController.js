/**
 * 巨鲸追踪控制器
 */

const whaleTracker = require('../services/whaleTrackerService');

/**
 * 获取所有巨鲸
 */
async function getWhales(req, res) {
    try {
        const whales = whaleTracker.getAllWhales();
        res.json({
            success: true,
            data: whales,
            stats: whaleTracker.getStats()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * 获取巨鲸详情
 */
async function getWhale(req, res) {
    try {
        const { address } = req.params;
        const whale = whaleTracker.getWhale(address);

        if (!whale) {
            return res.status(404).json({ error: '巨鲸地址不存在' });
        }

        // 获取最近交易
        const { limit = 20 } = req.query;
        const transactions = whaleTracker.getWhaleTransactions(address, parseInt(limit, 10));

        res.json({
            success: true,
            data: {
                ...whale,
                transactions
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * 添加巨鲸
 */
async function addWhale(req, res) {
    try {
        const { address, label, balance } = req.body;

        if (!address) {
            return res.status(400).json({ error: '地址不能为空' });
        }

        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return res.status(400).json({ error: '无效的地址格式' });
        }

        const whale = whaleTracker.addWhale(address, label || '自定义巨鲸', balance || 0);

        res.json({
            success: true,
            data: whale,
            message: '巨鲸添加成功'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * 删除巨鲸
 */
async function removeWhale(req, res) {
    try {
        const { address } = req.params;

        const deleted = whaleTracker.removeWhale(address);

        if (!deleted) {
            return res.status(404).json({ error: '巨鲸地址不存在' });
        }

        res.json({
            success: true,
            message: '巨鲸已删除'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * 创建交易提醒
 */
async function createAlert(req, res) {
    try {
        const { whaleAddress, minAmount, alertType } = req.body;
        const userId = req.user?.id || req.body.userId || 'anonymous';

        if (!whaleAddress || !minAmount) {
            return res.status(400).json({ error: '巨鲸地址和最小金额不能为空' });
        }

        const alert = whaleTracker.createAlert(userId, whaleAddress, minAmount, alertType || 'all');

        res.json({
            success: true,
            data: alert,
            message: '提醒创建成功'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * 获取用户提醒
 */
async function getUserAlerts(req, res) {
    try {
        const userId = req.user?.id || req.query.userId || 'anonymous';

        const alerts = whaleTracker.getUserAlerts(userId);

        // 获取关联的巨鲸信息
        const alertsWithWhaleInfo = alerts.map(alert => {
            const whale = whaleTracker.getWhale(alert.whaleAddress);
            return {
                ...alert,
                whaleLabel: whale?.label || '未知巨鲸',
                whaleBalance: whale?.balance || 0
            };
        });

        res.json({
            success: true,
            data: alertsWithWhaleInfo
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * 删除提醒（需要所有权验证）
 */
async function deleteAlert(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const alert = whaleTracker.getAlert(id);

        if (!alert) {
            return res.status(404).json({ error: '提醒不存在' });
        }

        // 验证所有权
        if (alert.userId !== userId) {
            return res.status(403).json({ error: '无权限删除此提醒' });
        }

        const deleted = whaleTracker.deleteAlert(id);

        if (!deleted) {
            return res.status(404).json({ error: '提醒不存在' });
        }

        res.json({
            success: true,
            message: '提醒已删除'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * 模拟巨鲸交易（用于测试）
 */
async function simulateTransaction(req, res) {
    try {
        const { fromAddress, toAddress, amount, symbol } = req.body;

        const whales = whaleTracker.getAllWhales();
        const fromWhale = whales.find(w => w.address === fromAddress);

        const transaction = {
            fromAddress: fromAddress || (whales.length > 0 ? whales[0].address : '0x' + '1'.repeat(40)),
            toAddress: toAddress || '0x' + '0'.repeat(40),
            amount: amount || Math.random() * 100000,
            symbol: symbol || 'BNB',
            type: 'transfer'
        };

        const triggered = whaleTracker.recordTransaction(transaction);

        res.json({
            success: true,
            data: {
                transaction,
                triggeredAlerts: triggered.length
            },
            message: triggered.length > 0 ? `触发了 ${triggered.length} 个提醒` : '交易记录完成'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * 获取巨鲸交易列表
 */
async function getTransactions(req, res) {
    try {
        const { address, limit = 50 } = req.query;

        if (address) {
            const transactions = whaleTracker.getWhaleTransactions(address, parseInt(limit, 10));
            res.json({ success: true, data: transactions });
        } else {
            // 返回所有最近交易
            res.json({ success: true, data: whaleTracker.transactions.slice(-parseInt(limit, 10)).reverse() });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getWhales,
    getWhale,
    addWhale,
    removeWhale,
    createAlert,
    getUserAlerts,
    deleteAlert,
    simulateTransaction,
    getTransactions
};
