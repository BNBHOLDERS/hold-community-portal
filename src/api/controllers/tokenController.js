/**
 * 代币控制器
 */

const gmgnService = require('../services/gmgnService');
const aiService = require('../services/aiService');

/**
 * 获取代币信息
 */
async function getTokenInfo(req, res) {
  try {
    const { address, chain = 'bsc' } = req.query;

    if (!address) {
      return res.status(400).json({ error: '地址参数必填' });
    }

    const data = await gmgnService.getTokenInfo(address, chain);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * 获取代币安全信息
 */
async function getTokenSecurity(req, res) {
  try {
    const { address, chain = 'bsc' } = req.query;

    if (!address) {
      return res.status(400).json({ error: '地址参数必填' });
    }

    const data = await gmgnService.getTokenSecurity(address, chain);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * 获取 Top 持有者
 */
async function getTokenHolders(req, res) {
  try {
    const { address, chain = 'bsc', limit = 20 } = req.query;

    if (!address) {
      return res.status(400).json({ error: '地址参数必填' });
    }

    const data = await gmgnService.getTokenHolders(address, chain, parseInt(limit));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * 获取 Top 交易者
 */
async function getTokenTraders(req, res) {
  try {
    const { address, chain = 'bsc', limit = 20 } = req.query;

    if (!address) {
      return res.status(400).json({ error: '地址参数必填' });
    }

    const data = await gmgnService.getTokenTraders(address, chain, parseInt(limit));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * AI 综合分析代币
 */
async function analyzeToken(req, res) {
  try {
    const { address, chain = 'bsc' } = req.query;

    if (!address) {
      return res.status(400).json({ error: '地址参数必填' });
    }

    // 并行获取数据
    const [info, security, holders] = await Promise.all([
      gmgnService.getTokenInfo(address, chain),
      gmgnService.getTokenSecurity(address, chain),
      gmgnService.getTokenHolders(address, chain, 10)
    ]);

    // 构建 AI 分析数据
    const tokenData = {
      symbol: info.data.symbol,
      name: info.data.name,
      price: info.data.price,
      liquidity: info.data.liquidity,
      holderCount: info.data.holder_count,
      exchange: info.data.pool?.exchange || info.data.launchpad,
      isHoneypot: security.data.is_honeypot,
      buyTax: security.data.buy_tax,
      sellTax: security.data.sell_tax,
      top10HolderRate: info.data.stat?.top_10_holder_rate,
      creatorHoldRate: info.data.stat?.creator_hold_rate
    };

    // AI 分析
    const aiAnalysis = await aiService.analyzeToken(tokenData);

    res.json({
      success: true,
      data: {
        info: info.data,
        security: security.data,
        holders: holders.data?.list,
        aiAnalysis
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getTokenInfo,
  getTokenSecurity,
  getTokenHolders,
  getTokenTraders,
  analyzeToken
};
