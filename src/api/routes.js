const express = require('express');
const router = express.Router();

// ========== 认证 ==========
const authController = require('./controllers/authController');
const { auth, optionalAuth } = require('./middleware/auth');

router.post('/auth/send-code', authController.sendCode);
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', auth, authController.getMe);
router.put('/auth/profile', auth, authController.updateProfile);
router.patch('/auth/profile', auth, authController.updateProfile);
router.get('/auth/stats', authController.getStats);

// ========== AI 工具 ==========
const aiController = require('./controllers/aiController');
router.post('/ai/chat', aiController.chat);
router.get('/ai/token-analyze', aiController.tokenAnalyze);
router.get('/ai/wallet-diagnose', aiController.walletDiagnose);
router.post('/ai/analyze', aiController.analyze);
router.get('/ai/stats', aiController.getQuestionStats);
router.get('/ai/popular', aiController.getPopularQueries);

// ========== 内容管理 ==========
const contentController = require('./controllers/contentController');

// 讨论区
router.get('/content/discussions', contentController.getDiscussions);
router.post('/content/discussions', contentController.createDiscussion);

// 投稿区
router.get('/content/articles', contentController.getArticles);
router.post('/content/articles', contentController.createArticle);

// 分享区
router.get('/content/shares', contentController.getShares);
router.post('/content/shares', contentController.createShare);

// 最新动态（首页）
router.get('/content/latest', contentController.getLatest);

// 热门排行榜
router.get('/content/trending', contentController.getTrending);

// 点赞
router.post('/content/:type(articles|shares|discussions)/:id/like', contentController.like);

// ========== 文档 ==========
const docsController = require('./controllers/docsController');
const { admin } = require('./middleware/admin');

// 公开路由
router.get('/docs', docsController.getDocs);
router.get('/docs/:slug', docsController.getDoc);
router.get('/docs/search', docsController.searchDocs);

// 管理员路由（需要认证 + 管理员权限）
router.post('/docs/admin', auth, admin, docsController.createDoc);
router.put('/docs/admin/:slug', auth, admin, docsController.updateDoc);
router.delete('/docs/admin/:slug', auth, admin, docsController.deleteDoc);
router.get('/docs/admin/list', auth, admin, docsController.getAdminDocs);

// ========== 代币 API（GMGN）==========
const tokenController = require('./controllers/tokenController');
router.get('/token/info', tokenController.getTokenInfo);
router.get('/token/security', tokenController.getTokenSecurity);
router.get('/token/holders', tokenController.getTokenHolders);
router.get('/token/traders', tokenController.getTokenTraders);

// ========== 钱包 API（GMGN）==========
const walletController = require('./controllers/walletController');
router.get('/wallet/holdings', walletController.getWalletHoldings);
router.get('/wallet/activity', walletController.getWalletActivity);
router.get('/wallet/stats', walletController.getWalletStats);

// ========== Binance Web3 Skills（官方）==========
const binanceWeb3Controller = require('./controllers/binanceWeb3Controller');

// 技能概览
router.get('/binance/skills', binanceWeb3Controller.getSkillsOverview);

// 代币相关
router.get('/binance/token/search', binanceWeb3Controller.searchToken);
router.get('/binance/token/detail', binanceWeb3Controller.getTokenDetail);
router.get('/binance/token/audit', binanceWeb3Controller.auditToken);

// 钱包相关
router.get('/binance/wallet/tokens', binanceWeb3Controller.getWalletTokens);

// 市场相关
router.get('/binance/signals/smart-money', binanceWeb3Controller.getSmartMoney);
router.get('/binance/market/rank', binanceWeb3Controller.getMarketRank);

// ========== 价格提醒 ==========
const alertsController = require('./controllers/alertsController');

router.post('/alerts', alertsController.createAlert);
router.get('/alerts', alertsController.getUserAlerts);
router.delete('/alerts/:id', alertsController.deleteAlert);
router.post('/alerts/:id/test', alertsController.testAlert);
router.get('/alerts/popular', alertsController.getPopularSymbols);

// ========== 功能建议 ==========
const featureController = require('./controllers/featureController');

router.get('/features/requests', featureController.getRequests);
router.post('/features/requests', featureController.createRequest);
router.get('/features/requests/:id', featureController.getRequest);
router.post('/features/requests/:id/vote', featureController.voteRequest);
router.post('/features/requests/:id/status', featureController.updateStatus);
router.post('/features/requests/:id/comment', featureController.addComment);
router.get('/features/stats', featureController.getStats);

// ========== 链上活动监控 ==========
const activityMonitorController = require('./controllers/activityMonitorController');

router.get('/monitor/monitors', activityMonitorController.getMonitors);
router.post('/monitor/monitors', activityMonitorController.createMonitor);
router.delete('/monitor/monitors/:id', activityMonitorController.deleteMonitor);
router.get('/monitor/monitors/:id/activities', activityMonitorController.getMonitorActivities);
router.post('/monitor/check', activityMonitorController.triggerCheck);
router.get('/monitor/stats', activityMonitorController.getStats);

// ========== 巨鲸追踪 ==========
const whaleTrackerController = require('./controllers/whaleTrackerController');

router.get('/whale/whales', whaleTrackerController.getWhales);
router.post('/whale/whales', whaleTrackerController.addWhale);
router.delete('/whale/whales/:address', whaleTrackerController.removeWhale);
router.get('/whale/whales/:address', whaleTrackerController.getWhale);
router.get('/whale/transactions', whaleTrackerController.getTransactions);
router.post('/whale/alerts', whaleTrackerController.createAlert);
router.get('/whale/alerts', whaleTrackerController.getUserAlerts);
router.delete('/whale/alerts/:id', whaleTrackerController.deleteAlert);
router.post('/whale/simulate', whaleTrackerController.simulateTransaction);

// ========== 系统状态 ==========
router.get('/system/status', (req, res) => {
  const aiService = require('./services/aiService');
  const apiKeys = require('./config/apiKeys');
  const redis = require('./services/redisService');

  res.json({
    success: true,
    data: {
      ai: aiService.getStatus(),
      keys: apiKeys.getStatus(),
      redis: {
        enabled: redis.enabled,
        connected: redis.client?.status === 'ready'
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    }
  });
});

// ========== API 别名路由（兼容前端调用） ==========

// 文档管理别名
router.post('/admin/docs', auth, admin, docsController.createDoc);
router.put('/admin/docs/:slug', auth, admin, docsController.updateDoc);
router.delete('/admin/docs/:slug', auth, admin, docsController.deleteDoc);
router.get('/admin/docs', auth, admin, docsController.getAdminDocs);

// 功能建议别名
router.post('/features', featureController.createRequest);

// 用户资料更新支持 PATCH
router.patch('/auth/profile', auth, authController.updateProfile);

module.exports = router;
