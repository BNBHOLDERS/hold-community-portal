/**
 * AI 控制器 - 带示例回复和上下文记忆
 * 免费开放的 AI 工具接口
 */

const aiService = require('../services/aiService');
const gmgnService = require('../services/gmgnService');
const questionAnalytics = require('../services/questionAnalytics');
const queryStats = require('../services/queryStatsService');

// 示例 AI 回复（当 API 不可用时使用）
const sampleResponses = {
    chat: [
        '好的，让我来帮你分析一下。首先要注意的是，不要轻易相信别人的推荐，要学会自己看链上数据。',
        '这个问题很关键。在币圈，最重要的是风险控制。建议你：1）只用闲钱投资 2）设置止损 3）不要追高。',
        '从我的经验来看，这个项目需要注意以下几点：流动性是否充足、合约是否经过审计、项目方持仓比例是否合理。',
        '记住一句话：不要 FOMO！好的机会永远都有，但本金没了就没有翻身的机会了。',
        '关于安全方面，建议你在买入前先检查：1）是否通过 Token Sniffer 检测 2）流动性是否锁定 3）税率是否合理。',
        '关于代币分析，我建议你关注这些指标：流动性池大小、持币地址数、前10持仓比例、交易量。',
        '钱包诊断方面，主要看交易频率、盈亏比、持仓时间。新手容易犯的错误是频繁交易和追涨杀跌。',
        '你想了解的是链上数据吗？BscScan 是最好的工具，可以查看交易记录、持仓分布、合约代码等。',
        '关于空投，建议多关注项目方的官方公告，不要轻易泄露私钥，谨慎授权。',
        '心态方面，亏损后最重要的是总结教训，而不是急于回本。每次交易都是学习的机会。'
    ],
  token: {
    symbol: 'UNKNOWN',
    name: 'Unknown Token',
    price: 'N/A',
    liquidity: 'N/A',
    isHoneypot: false,
    aiAnalysis: '由于 API 限制，无法获取实时数据。建议你使用 GMGN、DEX Screener 等工具自行查询。'
  },
  wallet: {
    diagnosis: '由于 API 限制，无法获取完整数据。建议你查看钱包的交易记录，分析买卖时机和盈亏情况。'
  }
};

/**
 * AI 聊天 - AI 道友（支持上下文记忆）
 */
async function chat(req, res) {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: '消息内容不能为空' });
    }

    // 尝试调用真实 AI
    try {
      const reply = await aiService.chat(message, history);

      // 记录问题用于分析（异步，不阻塞响应）
      questionAnalytics.recordQuestion(message, reply).catch(err => {
        console.error('Question analytics error:', err.message);
      });

      return res.json({ success: true, reply });
    } catch (aiError) {
      // AI 不可用时使用示例回复
      const randomReply = sampleResponses.chat[Math.floor(Math.random() * sampleResponses.chat.length)];

      // 同样记录示例回复
      questionAnalytics.recordQuestion(message, randomReply).catch(err => {
        console.error('Question analytics error:', err.message);
      });

      return res.json({
        success: true,
        reply: randomReply + '（示例回复，配置 ANTHROPIC_API_KEY 后生效）'
      });
    }
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    res.status(500).json({ error: 'AI 道友正在休息，请稍后再试' });
  }
}

/**
 * 代币 AI 分析
 */
async function tokenAnalyze(req, res) {
  try {
    const { address, chain = 'bsc' } = req.query;

    if (!address) {
      return res.status(400).json({ error: '代币地址不能为空' });
    }

    // 检查是否配置了 API Key
    const hasApiKey = process.env.GMGN_API_KEY && process.env.GMGN_API_KEY !== 'your_gmgn_api_key_here';

    if (!hasApiKey) {
      // 记录查询统计
      queryStats.record('token', address);
      // 返回示例数据
      return res.json({
        success: true,
        data: {
          ...sampleResponses.token,
          address,
          message: '请配置 GMGN_API_KEY 以获取真实数据'
        }
      });
    }

    // 并行获取数据
    const [info, security] = await Promise.all([
      gmgnService.getTokenInfo(address, chain).catch(() => null),
      gmgnService.getTokenSecurity(address, chain).catch(() => null)
    ]);

    // 构建分析数据
    const tokenData = {
      symbol: info?.data?.symbol || 'UNKNOWN',
      name: info?.data?.name || 'Unknown Token',
      price: info?.data?.price || 'N/A',
      liquidity: info?.data?.liquidity || 'N/A',
      holderCount: info?.data?.holder_count || 0,
      isHoneypot: security?.data?.is_honeypot || false,
      buyTax: security?.data?.buy_tax || 0,
      sellTax: security?.data?.sell_tax || 0,
      top10HolderRate: info?.data?.stat?.top_10_holder_rate || 0,
      creatorHoldRate: info?.data?.stat?.creator_hold_rate || 0
    };

    // 记录查询统计
    queryStats.record('token', address, { symbol: tokenData.symbol });

    // 尝试 AI 分析
    try {
      const aiAnalysis = await aiService.analyzeToken(tokenData);
      res.json({ success: true, data: { ...tokenData, aiAnalysis } });
    } catch {
      res.json({ success: true, data: tokenData });
    }
  } catch (error) {
    console.error('Token Analyze Error:', error.message);
    res.status(500).json({ error: '分析失败，请检查代币地址' });
  }
}

/**
 * 钱包 AI 诊断
 */
async function walletDiagnose(req, res) {
  try {
    const { address, chain = 'bsc' } = req.query;

    if (!address) {
      return res.status(400).json({ error: '钱包地址不能为空' });
    }

    // 检查是否配置了 API Key
    const hasApiKey = process.env.GMGN_API_KEY && process.env.GMGN_API_KEY !== 'your_gmgn_api_key_here';

    if (!hasApiKey) {
      // 记录查询统计
      queryStats.record('wallet', address);
      return res.json({
        success: true,
        data: {
          ...sampleResponses.wallet,
          address,
          message: '请配置 GMGN_API_KEY 以获取真实数据'
        }
      });
    }

    // 并行获取数据
    const [holdings, activity, stats] = await Promise.all([
      gmgnService.getWalletHoldings(address, chain).catch(() => null),
      gmgnService.getWalletActivity(address, chain, 50).catch(() => null),
      gmgnService.getWalletStats(address, chain, '30d').catch(() => null)
    ]);

    // 构建诊断数据
    const walletData = {
      address,
      holdingCount: holdings?.data?.list?.length || 0,
      transactionCount: activity?.data?.activities?.length || 0,
      totalValue: 0,
      winRate: 0,
      totalPnL: 0
    };

    // 记录查询统计
    queryStats.record('wallet', address);

    // 尝试 AI 诊断
    try {
      const diagnosis = await aiService.diagnoseWallet(walletData);
      res.json({
        success: true,
        data: {
          diagnosis,
          holdings: holdings?.data?.list?.slice(0, 10) || [],
          recentActivity: activity?.data?.activities?.slice(0, 10) || []
        }
      });
    } catch {
      res.json({
        success: true,
        data: {
          diagnosis: '数据获取成功，但 AI 分析暂时不可用。',
          holdings: holdings?.data?.list?.slice(0, 10) || [],
          recentActivity: activity?.data?.activities?.slice(0, 10) || []
        }
      });
    }
  } catch (error) {
    console.error('Wallet Diagnose Error:', error.message);
    res.status(500).json({ error: '诊断失败，请检查钱包地址' });
  }
}

/**
 * 通用 AI 分析
 */
async function analyze(req, res) {
  try {
    const { content, type = 'general' } = req.body;

    if (!content) {
      return res.status(400).json({ error: '分析内容不能为空' });
    }

    try {
      const result = await aiService.analyze(content, type);
      res.json({ success: true, result });
    } catch {
      res.json({
        success: true,
        result: 'AI 分析暂时不可用，请配置 ANTHROPIC_API_KEY。'
      });
    }
  } catch (error) {
    console.error('AI Analyze Error:', error.message);
    res.status(500).json({ error: '分析失败' });
  }
}

/**
 * 获取问题统计（用于了解用户困难）
 */
async function getQuestionStats(req, res) {
  try {
    const stats = questionAnalytics.getStats();
    const painPoints = questionAnalytics.getCurrentPainPoints();
    const commonQuestions = questionAnalytics.getCommonQuestions(10);

    res.json({
      success: true,
      data: {
        total: stats.total,
        byType: stats.byType,
        byDifficulty: stats.byDifficulty,
        painPoints,
        commonQuestions
      }
    });
  } catch (error) {
    console.error('Get Stats Error:', error.message);
    res.status(500).json({ error: '获取统计失败' });
  }
}

/**
 * 获取热门查询
 */
async function getPopularQueries(req, res) {
  try {
    const { limit = 20, type } = req.query;

    let data;
    if (type === 'token') {
      data = queryStats.getPopularTokens(parseInt(limit, 10));
    } else if (type === 'wallet') {
      data = queryStats.getPopularWallets(parseInt(limit, 10));
    } else {
      data = queryStats.getPopular(parseInt(limit, 10));
    }

    res.json({
      success: true,
      data,
      stats: queryStats.getStats()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  chat,
  tokenAnalyze,
  walletDiagnose,
  analyze,
  getQuestionStats,
  getPopularQueries
};
