/**
 * 环境变量验证模块
 * 在服务器启动时验证必需的环境变量
 */

/**
 * 必需的环境变量
 */
const REQUIRED_ENV_VARS = [
  'JWT_SECRET',
  'ADMIN_EMAILS'
];

/**
 * 可选但推荐的环境变量
 */
const RECOMMENDED_ENV_VARS = [
  'ANTHROPIC_API_KEY_1',
  'CORS_ORIGINS',
  'SMTP_HOST'
];

/**
 * 验证环境变量
 * @throws {Error} 当必需���环境变量缺失时抛出错误
 */
function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('\n❌ ========== 启动失败 ==========');
    console.error('❌ 缺少必需的环境变量:');
    missing.forEach(key => {
      console.error(`   - ${key}`);
    });
    console.error('\n💡 解决方法:');
    console.error('   1. 复制 .env.example 为 .env');
    console.error('   2. 在 .env 文件中配置这些变量');
    console.error('   3. 重新启动服务器\n');

    const error = new Error(`缺少必需的环境变量: ${missing.join(', ')}`);
    error.code = 'MISSING_ENV_VARS';
    throw error;
  }

  // 验证 JWT_SECRET 强度
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret.length < 32) {
    console.warn('\n⚠️  警告: JWT_SECRET 长度少于 32 字符，建议使用更长的随机字符串');
  }

  // 验证 ADMIN_EMAILS 格式
  const adminEmails = process.env.ADMIN_EMAILS;
  const emails = adminEmails.split(',').map(e => e.trim());
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidEmails = emails.filter(e => !emailRegex.test(e));

  if (invalidEmails.length > 0) {
    console.warn(`\n⚠️  警告: ADMIN_EMAILS 包含无效邮箱: ${invalidEmails.join(', ')}`);
  }

  // 检查推荐但未设置的环境变量
  const missingRecommended = RECOMMENDED_ENV_VARS.filter(key => !process.env[key]);
  if (missingRecommended.length > 0) {
    console.warn('\n⚠️  以下推荐的环境变量未设置:');
    missingRecommended.forEach(key => {
      console.warn(`   - ${key}`);
    });
    console.warn('');
  }

  // 验证 CORS_ORIGINS 格式（如果设置）
  if (process.env.CORS_ORIGINS) {
    const origins = process.env.CORS_ORIGINS.split(',').map(o => o.trim());
    const invalidOrigins = origins.filter(o => {
      try {
        new URL(o);
        return false;
      } catch {
        return true;
      }
    });

    if (invalidOrigins.length > 0) {
      console.warn(`\n⚠️  警告: CORS_ORIGINS 包含无效URL: ${invalidOrigins.join(', ')}`);
    }
  }

  console.log('✅ 环境变量验证通过');
  return {
    required: REQUIRED_ENV_VARS,
    missing: [],
    adminEmails: emails,
    corsOrigins: process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) || null
  };
}

/**
 * 获取管理员邮箱列表
 */
function getAdminEmails() {
  if (!process.env.ADMIN_EMAILS) {
    throw new Error('ADMIN_EMAILS 环境变量未设置');
  }
  return process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase());
}

/**
 * 检查邮箱是否为管理员
 */
function isAdminEmail(email) {
  try {
    const adminEmails = getAdminEmails();
    return adminEmails.includes(email.toLowerCase());
  } catch {
    return false;
  }
}

module.exports = {
  validateEnv,
  getAdminEmails,
  isAdminEmail,
  REQUIRED_ENV_VARS,
  RECOMMENDED_ENV_VARS
};
