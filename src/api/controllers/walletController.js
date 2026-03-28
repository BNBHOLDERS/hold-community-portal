/**
 * 钱包控制器
 */

const gmgnService = require('../services/gmgnService');
const aiService = require('../services/aiService');

/**
 * 获取钱包持仓
 */
async function getWalletHoldings(req, res) {
  try {
    const { address, chain = 'bsc' } = req.query;

    if (!address) {
      return res.status(400).json({ error: '地址参数必填' });
    }

    const data = await gmgnService.getWalletHoldings(address, chain);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * 获取钱包交易记录
 */
async function getWalletActivity(req, res) {
  try {
    const { address, chain = 'bsc', limit = 50 } = req.query;

    if (!address) {
      return res.status(400).json({ error: '地址参数必填' });
    }

    const data = await gmgnService.getWalletActivity(address, chain, parseInt(limit));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * 获取钱包统计
 */
async function getWalletStats(req, res) {
  try {
    const { address, chain = 'bsc', period = '7d' } = req.query;

    if (!address) {
      return res.status(400).json({ error: '地址参数必填' });
    }

    const data = await gmgnService.getWalletStats(address, chain, period);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * AI 诊断钱包
 */
async function diagnoseWallet(req, res) {
  try {
    const { address, chain = 'bsc' } = req.query;

    if (!address) {
      return res.status(400).json({ error: '地址参数必填' });
    }

    // 并行获取数据
    const [holdings, activity, stats] = await Promise.all([
      gmgnService.getWalletHoldings(address, chain),
      gmgnService.getWalletActivity(address, chain, 100),
      gmgnService.getWalletStats(address, chain, '30d')
    ]);

    // 构建 AI 分析数据
    const walletData = {
      address,
      holdingCount: holdings.data?.list?.length || 0,
      totalValue: 0, // 需要计算
      transactionCount: activity.data?.activities?.length || 0,
      totalPnL: 0,
      winRate: 0
    };

    // AI 诊断
    const aiDiagnosis = await aiService.diagnoseWallet(walletData);

    res.json({
      success: true,
      data: {
        holdings: holdings.data?.list,
        activity: activity.data?.activities,
        stats: stats.data,
        aiDiagnosis
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getWalletHoldings,
  getWalletActivity,
  getWalletStats,
  diagnoseWallet
};
