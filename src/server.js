/**
 * HOLD 社区门户
 * 主服务器入口
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const compression = require('compression');
const apiRoutes = require('./api/routes');
const { conditionalRateLimit } = require('./api/middleware/rateLimit');
const { validateEnv, getAdminEmails } = require('./config/envValidation');

// ========== 启动时验证环境变量 ==========
try {
  const envConfig = validateEnv();
  console.log(`✅ 已配置 ${envConfig.adminEmails.length} 个管理员账户`);
  if (envConfig.corsOrigins) {
    console.log(`✅ 已配置 ${envConfig.corsOrigins.length} 个 CORS 白名单域名`);
  }
} catch (error) {
  if (error.code === 'MISSING_ENV_VARS') {
    console.error('❌ 环境变量验证失败，服务器中��启动');
    process.exit(1);
  }
  console.error('❌ 环境变量验证出错:', error.message);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// ========== CORS 配置 ==========
// 获取允许的来源
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'];

app.use(cors({
  origin: function(origin, callback) {
    // 允许无 origin 的请求（服务器端、移动应用、Postman 等）
    if (!origin) return callback(null, true);

    // 检查来源是否在白名单中
    if (corsOrigins.indexOf(origin) !== -1 || corsOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS 拦截: ${origin}`);
      callback(new Error('CORS: 来源不被允许'));
    }
  },
  credentials: true,  // 允许携带 Cookie
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ========== 其他中间件 ==========
// 响应压缩（大于 1KB 才压缩，避免小数据增加开销）
app.use(compression({ threshold: 1024 }));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// 信任代理（用于正确获取 IP）
app.set('trust proxy', 1);

// API 速率限制
app.use('/api', conditionalRateLimit);

// ========== 路由 ==========
// 根路径返回前端页面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API 路由
app.use('/api', apiRoutes);

// 健康检查（增强版）
app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  };
  res.json(health);
});

// ========== 错误处理 ==========
// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('错误:', err);

  // CORS 错误
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ error: '来源不被允许' });
  }

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

// ========== 启动服务器 ==========
app.listen(PORT, () => {
  console.log('\n🚀 ========== HOLD 社区门户启动成功 ==========');
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`👤 管理员: ${getAdminEmails().join(', ')}`);
  console.log('=============================================\n');
});

module.exports = app;
