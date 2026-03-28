const express = require('express');
const router = express.Router();

// 代币相关
const tokenController = require('./controllers/tokenController');
router.get('/token/info', tokenController.getTokenInfo);
router.get('/token/security', tokenController.getTokenSecurity);
router.get('/token/holders', tokenController.getTokenHolders);
router.get('/token/traders', tokenController.getTokenTraders);
router.get('/token/analyze', tokenController.analyzeToken);

// 钱包相关
const walletController = require('./controllers/walletController');
router.get('/wallet/holdings', walletController.getWalletHoldings);
router.get('/wallet/activity', walletController.getWalletActivity);
router.get('/wallet/stats', walletController.getWalletStats);
router.get('/wallet/diagnose', walletController.diagnoseWallet);

// 市场相关
const marketController = require('./controllers/marketController');
router.get('/market/trending', marketController.getTrending);
router.get('/market/sentiment', marketController.getSentiment);

// AI 分析
const aiController = require('./controllers/aiController');
router.post('/ai/chat', aiController.chat);
router.post('/ai/analyze', aiController.analyze);

// 知识库
const docsController = require('./controllers/docsController');
router.get('/docs', docsController.getDocs);
router.get('/docs/:category', docsController.getCategory);

module.exports = router;
