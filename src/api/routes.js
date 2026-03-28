const express = require('express');
const router = express.Router();

// ========== AI 工具 ==========
const aiController = require('./controllers/aiController');
router.post('/ai/chat', aiController.chat);
router.get('/ai/token-analyze', aiController.tokenAnalyze);
router.get('/ai/wallet-diagnose', aiController.walletDiagnose);
router.post('/ai/analyze', aiController.analyze);

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

// 点赞
router.post('/content/:type(articles|shares|discussions)/:id/like', contentController.like);

// ========== 文档 ==========
const docsController = require('./controllers/docsController');
router.get('/docs', docsController.getDocs);
router.get('/docs/:slug', docsController.getDoc);
router.get('/docs/search', docsController.searchDocs);

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

module.exports = router;
