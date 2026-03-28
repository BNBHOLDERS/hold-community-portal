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

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('错误:', err);

  // JWT 错误
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Token 无效或已过期' });
  }

  // 验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  // 默认错误响应
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? '服务器错误'
    : err.message;

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: '请求的资源不存在' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 HOLD 社区门户启动成功`);
  console.log(`📍 http://localhost:${PORT}`);
});

module.exports = app;
