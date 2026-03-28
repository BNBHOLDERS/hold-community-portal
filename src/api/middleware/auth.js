/**
 * 认证中间件
 * 验证 JWT Token，注入用户信息到请求
 */

const authService = require('../services/authService');

/**
 * 认证中间件
 * 验证请求头中的 Authorization Token
 */
function auth(req, res, next) {
  try {
    // 从请求头获取 Token
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: '未提供认证信息' });
    }

    // Bearer Token 格式
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: '认证格式错误' });
    }

    const token = parts[1];

    // 验证 Token
    const userId = authService.verifyToken(token);

    // 检查用户是否存在
    const user = authService.getUserById(userId);
    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }

    // 注入用户信息到请求
    req.userId = userId;
    req.user = user;

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    res.status(401).json({ error: error.message || '认证失败' });
  }
}

/**
 * 可选认证中间件
 * 如果有 Token 则验证，没有则跳过
 */
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next();
    }

    const token = parts[1];
    const userId = authService.verifyToken(token);
    const user = authService.getUserById(userId);

    if (user) {
      req.userId = userId;
      req.user = user;
    }

    next();
  } catch (error) {
    // 可选认证失败时继续
    next();
  }
}

module.exports = { auth, optionalAuth };
