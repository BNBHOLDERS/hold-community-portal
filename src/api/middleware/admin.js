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
  // 生产环境必须设置 ADMIN_EMAILS 环境变量
  const adminEmailsEnv = process.env.ADMIN_EMAILS;
  if (!adminEmailsEnv) {
    console.error('⚠️  警告: ADMIN_EMAILS 未设置，无法进行管理员验证');
    return res.status(500).json({ error: '服务器配置错误' });
  }

  const adminEmails = adminEmailsEnv.split(',').map(e => e.trim().toLowerCase());

  if (!adminEmails.includes(req.user.email.toLowerCase())) {
    return res.status(403).json({ error: '无权限访问' });
  }

  req.isAdmin = true;
  next();
}

module.exports = { admin };
