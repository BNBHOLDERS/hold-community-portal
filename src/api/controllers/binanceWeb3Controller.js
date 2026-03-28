/**
 * Binance Web3 Skills 控制器
 * 集成 Binance 官方 Web3 技能
 */

const binanceWeb3Service = require('../services/binanceWeb3Service');

// 支持的链列���
const SUPPORTED_CHAINS = {
  '56': 'BSC',
  '8453': 'Base',
  'CT_501': 'Solana',
  '1': 'Ethereum'
};

/**
 * 代币搜索
 */
async function searchToken(req, res) {
  try {
    const { keyword, chains = '56,8453,CT_501' } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: '搜索关键词不能为空' });
    }

    const result = await binanceWeb3Service.searchTokens(keyword, chains);
    res.json(result);
  } catch (error) {
    console.error('Search Token Error:', error.message);
    res.status(500).json({ error: '搜索失败，请稍后重试' });
  }
}

/**
 * 代币详情（元数据 + 动态数据）
 */
async function getTokenDetail(req, res) {
  try {
    const { chainId = '56', address } = req.query;

    if (!address) {
      return res.status(400).json({ error: '代币地址不能为空' });
    }

    const result = await binanceWeb3Service.analyzeTokenFull(chainId, address);
    res.json(result);
  } catch (error) {
    console.error('Get Token Detail Error:', error.message);
    res.status(500).json({ error: '获取代币详情失败' });
  }
}

/**
 * 代币安全审计
 */
async function auditToken(req, res) {
  try {
    const { chainId = '56', address } = req.query;

    if (!address) {
      return res.status(400).json({ error: '代币地址不能为空' });
    }

    const result = await binanceWeb3Service.auditToken(chainId, address);
    res.json(result);
  } catch (error) {
    console.error('Audit Token Error:', error.message);
    res.status(500).json({ error: '安全审计失败' });
  }
}

/**
 * 钱包持仓查询
 */
async function getWalletTokens(req, res) {
  try {
    const { address, chainId = '56', offset = 0 } = req.query;

    if (!address) {
      return res.status(400).json({ error: '钱包地址不能为空' });
    }

    const result = await binanceWeb3Service.getWalletHoldings(address, chainId, offset);
    res.json(result);
  } catch (error) {
    console.error('Get Wallet Tokens Error:', error.message);
    res.status(500).json({ error: '查询钱包持仓失败' });
  }
}

/**
 * 聪明钱信号
 */
async function getSmartMoney(req, res) {
  try {
    const { chainId = 'CT_501', page = 1, pageSize = 20 } = req.query;

    const result = await binanceWeb3Service.getSmartMoneySignals(chainId, page, pageSize);
    res.json(result);
  } catch (error) {
    console.error('Get Smart Money Error:', error.message);
    res.status(500).json({ error: '获取聪明钱信号失败' });
  }
}

/**
 * 市场排行榜
 */
async function getMarketRank(req, res) {
  try {
    const { chainId = '56', sortField = 'volume24h', page = 1, pageSize = 50 } = req.query;

    const result = await binanceWeb3Service.getMarketRank(chainId, sortField, page, pageSize);
    res.json(result);
  } catch (error) {
    console.error('Get Market Rank Error:', error.message);
    res.status(500).json({ error: '获取市场排行失败' });
  }
}

/**
 * Binance Skills 概览（前端展示用）
 */
async function getSkillsOverview(req, res) {
  try {
    const skills = [
      {
        id: 'token-search',
        name: '代币搜索',
        icon: '🔍',
        description: '搜索任意代币，获取价格、市值、流动性等数据',
        category: 'market',
        chains: ['BSC', 'Base', 'Solana']
      },
      {
        id: 'token-audit',
        name: '安全审计',
        icon: '🛡️',
        description: '检测蜜罐、假币、恶意合约，评估交易风险',
        category: 'security',
        chains: ['BSC', 'Base', 'Solana', 'Ethereum']
      },
      {
        id: 'wallet-query',
        name: '钱包查询',
        icon: '👛',
        description: '查询任意地址的代币持仓和资产分布',
        category: 'wallet',
        chains: ['BSC', 'Base', 'Solana']
      },
      {
        id: 'smart-money',
        name: '聪明钱信号',
        icon: '📈',
        description: '跟踪聪明钱交易信号，发现潜在机会',
        category: 'signals',
        chains: ['BSC', 'Solana']
      },
      {
        id: 'market-rank',
        name: '市场排行',
        icon: '🏆',
        description: '查看各链代币排行，按交易量/市值排序',
        category: 'market',
        chains: ['BSC', 'Base', 'Solana']
      }
    ];

    res.json({
      success: true,
      data: {
        skills,
        supportedChains: SUPPORTED_CHAINS,
        poweredBy: 'Binance Web3',
        version: '1.4'
      }
    });
  } catch (error) {
    console.error('Get Skills Overview Error:', error.message);
    res.status(500).json({ error: '获取技能列表失败' });
  }
}

module.exports = {
  searchToken,
  getTokenDetail,
  auditToken,
  getWalletTokens,
  getSmartMoney,
  getMarketRank,
  getSkillsOverview
};
