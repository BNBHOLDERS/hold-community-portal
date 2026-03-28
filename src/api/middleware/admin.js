/**
 * 管理员中间件
 * 检查用户是否为管理员
 */

function admin(req, res, next) {
  // 检查是否登录
  if (!req.user) {
    return res.status(401).json({ error: '请先登录' });
  }

  // 检查是否为管理员
  // 简单实现：邮箱白名单（生产环境应使用数据库）
  const adminEmails = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim())
    : ['admin@hold.local', 'bnbholders@hold.community']; // 默认管理员

  if (!adminEmails.includes(req.user.email)) {
    return res.status(403).json({ error: '无权限访问' });
  }

  req.isAdmin = true;
  next();
}

module.exports = { admin };
