/**
 * 管理员中间件
 * 检查用户是否为管理员
 */

const { isAdminEmail, getAdminEmails } = require('../../config/envValidation');

/**
 * 管理员中间件 - 用于保护需要管理员权限的路由
 */
function admin(req, res, next) {
  // 检查是否登录
  if (!req.user) {
    return res.status(401).json({ error: '请先登录' });
  }

  // 检查是否为管理员
  if (!isAdminEmail(req.user.email)) {
    return res.status(403).json({ error: '无权限访问' });
  }

  req.isAdmin = true;
  next();
}

/**
 * 检查用户是否为管理员（用于 API 响应）
 * @param {string} email - 用户邮箱
 * @returns {boolean} 是否为管理员
 */
function checkAdmin(email) {
  return isAdminEmail(email);
}

/**
 * 获取管理员邮箱列表
 * @returns {string[]} 管理员邮箱列表
 */
function getAdminList() {
  return getAdminEmails();
}

module.exports = { admin, checkAdmin, getAdminList };
