/**
 * 价格提醒控制器
 * 用户订阅价格提醒，触发时发送通知
 */

const emailService = require('../services/emailService');
const redis = require('../services/redisService');

// 内存存储提醒订阅（生产环境应使用数据库）
const alerts = new Map();

/**
 * 创建价格提醒订阅
 */
async function createAlert(req, res) {
  try {
    const { email, symbol, condition, price, channels = ['email'] } = req.body;

    // 参数验证
    if (!email || !symbol || !condition || !price) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    if (!['above', 'below'].includes(condition)) {
      return res.status(400).json({ error: '条件必须是 above 或 below' });
    }

    const alertId = `${symbol}_${condition}_${price}_${Date.now()}`;
    const alert = {
      id: alertId,
      email,
      symbol: symbol.toUpperCase(),
      condition,
      targetPrice: parseFloat(price),
      channels,
      createdAt: new Date().toISOString(),
      triggered: false
    };

    // 存储提醒
    alerts.set(alertId, alert);

    // 同时存储到 Redis（如果可用）
    await redis.set(`alert:${alertId}`, alert, 86400 * 7); // 7天过期

    res.json({
      success: true,
      data: {
        id: alertId,
        message: `已创建提醒：${symbol} ${condition === 'above' ? '突破' : '跌破'} $${price}`
      }
    });
  } catch (error) {
    console.error('Create Alert Error:', error.message);
    res.status(500).json({ error: '创建提醒失败' });
  }
}

/**
 * 获取用户的所有提醒
 */
async function getUserAlerts(req, res) {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: '邮箱参数不能为空' });
    }

    const userAlerts = Array.from(alerts.values())
      .filter(a => a.email === email && !a.triggered);

    res.json({
      success: true,
      data: userAlerts
    });
  } catch (error) {
    console.error('Get Alerts Error:', error.message);
    res.status(500).json({ error: '获取提醒失败' });
  }
}

/**
 * 删除提醒
 */
async function deleteAlert(req, res) {
  try {
    const { id } = req.params;

    if (!alerts.has(id)) {
      return res.status(404).json({ error: '提醒不存在' });
    }

    alerts.delete(id);
    await redis.del(`alert:${id}`);

    res.json({ success: true, message: '提醒已删除' });
  } catch (error) {
    console.error('Delete Alert Error:', error.message);
    res.status(500).json({ error: '删除提醒失败' });
  }
}

/**
 * 触发价格检查（由价格监控服务调用）
 */
async function checkPriceAlerts(symbol, currentPrice) {
  const symbolUpper = symbol.toUpperCase();
  const triggeredAlerts = [];

  for (const [id, alert] of alerts.entries()) {
    if (alert.triggered) continue;
    if (alert.symbol !== symbolUpper) continue;

    let shouldTrigger = false;

    if (alert.condition === 'above' && currentPrice > alert.targetPrice) {
      shouldTrigger = true;
    } else if (alert.condition === 'below' && currentPrice < alert.targetPrice) {
      shouldTrigger = true;
    }

    if (shouldTrigger) {
      alert.triggered = true;
      triggeredAlerts.push(alert);

      // 发送通知
      for (const channel of alert.channels) {
        if (channel === 'email') {
          await emailService.sendPriceAlert(
            alert.email,
            alert.symbol,
            currentPrice,
            alert.targetPrice,
            alert.condition
          );
        }
      }
    }
  }

  return triggeredAlerts;
}

/**
 * 手动触发测试（仅用于测试）
 */
async function testAlert(req, res) {
  try {
    const { id } = req.params;

    if (!alerts.has(id)) {
      return res.status(404).json({ error: '提醒不存在' });
    }

    const alert = alerts.get(id);

    // 发送测试邮件
    await emailService.sendPriceAlert(
      alert.email,
      alert.symbol,
      alert.targetPrice,
      alert.targetPrice,
      alert.condition
    );

    res.json({ success: true, message: '测试邮件已发送' });
  } catch (error) {
    console.error('Test Alert Error:', error.message);
    res.status(500).json({ error: '测试失败' });
  }
}

/**
 * 获取热门提醒币种
 */
async function getPopularSymbols(req, res) {
  try {
    const symbolCounts = new Map();

    for (const alert of alerts.values()) {
      const count = symbolCounts.get(alert.symbol) || 0;
      symbolCounts.set(alert.symbol, count + 1);
    }

    const sorted = Array.from(symbolCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([symbol, count]) => ({ symbol, count }));

    res.json({
      success: true,
      data: sorted
    });
  } catch (error) {
    console.error('Get Popular Symbols Error:', error.message);
    res.status(500).json({ error: '获取热门币种失败' });
  }
}

module.exports = {
  createAlert,
  getUserAlerts,
  deleteAlert,
  checkPriceAlerts,
  testAlert,
  getPopularSymbols
};
