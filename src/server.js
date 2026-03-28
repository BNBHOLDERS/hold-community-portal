/**
 * HOLD 社区门户
 * 主服务器入口
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./api/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('src/public'));

// API 路由
app.use('/api', apiRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 HOLD 社区门户启动成功`);
  console.log(`📍 http://localhost:${PORT}`);
});

module.exports = app;
