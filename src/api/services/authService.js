/**
 * 用户认证服务
 * 邮箱验证码登录，无密码
 */

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const redis = require('./redisService');
const emailService = require('./emailService');

// JWT 密钥（生产环境应使用环境变量）
const JWT_SECRET = process.env.JWT_SECRET || 'hold-community-secret-key-2026';
const JWT_EXPIRES_IN = '7d'; // Token 有效期
const CODE_EXPIRES_IN = 300; // 验证码有效期 5 分钟

// 内存存储（开发环境）
const users = new Map(); // email -> User
const usersById = new Map(); // id -> User
const verificationCodes = new Map(); // email -> { code, expiresAt }

// 生成随机验证码
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

class AuthService {
  /**
   * 发送验证码
   */
  async sendVerificationCode(email) {
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('邮箱格式不正确');
    }

    // 检查频率限制（1分钟内只能发送一次）
    const existing = verificationCodes.get(email);
    if (existing && existing.expiresAt > Date.now() && existing.sentAt > Date.now() - 60000) {
      throw new Error('验证码发送过于频繁，请稍后再试');
    }

    // 生成验证码
    const code = generateCode();

    // 存储验证码
    verificationCodes.set(email, {
      code,
      sentAt: Date.now(),
      expiresAt: Date.now() + CODE_EXPIRES_IN * 1000
    });

    // 发送邮件（如果配置了 SMTP）
    try {
      const result = await emailService.sendVerificationCode(email, code);

      // 检查是否是模拟模式
      if (result && result.simulated) {
        console.log(`[开发模式] 验证码: ${code}, 邮箱: ${email}`);
        return { success: true, message: '验证码已生成（开发模式）', devMode: true, code };
      }

      return { success: true, message: '验证码已发送', devMode: false };
    } catch (emailError) {
      // 邮件服务未配置时，返回开发模式
      console.log(`[开发模式] 验证码: ${code}, 邮箱: ${email}`);
      return { success: true, message: '验证码已生成（开发模式）', devMode: true, code };
    }
  }

  /**
   * 验证验证码
   */
  verifyCode(email, code) {
    const record = verificationCodes.get(email);

    if (!record) {
      throw new Error('验证码不存在或已过期');
    }

    if (record.expiresAt < Date.now()) {
      verificationCodes.delete(email);
      throw new Error('验证码已过期');
    }

    if (record.code !== code) {
      throw new Error('验证码错误');
    }

    // 验证成功，删除验证码
    verificationCodes.delete(email);
    return true;
  }

  /**
   * 注册新用户
   */
  async register(email, nickname) {
    // 检查邮箱是否已注册
    if (users.has(email)) {
      throw new Error('该邮箱已注册');
    }

    // 创建用户
    const user = {
      id: uuidv4(),
      email,
      nickname: nickname || email.split('@')[0],
      avatar: null,
      level: 1,
      badges: [],
      points: 0,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    users.set(email, user);
    usersById.set(user.id, user);

    // 生成 Token
    const token = this.generateToken(user.id);

    // 存储会话
    await this.storeSession(user.id, token);

    return { user, token };
  }

  /**
   * 登录
   */
  async login(email) {
    const user = users.get(email);

    if (!user) {
      throw new Error('用户不存在');
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date().toISOString();

    // 生成 Token
    const token = this.generateToken(user.id);

    // 存储会话
    await this.storeSession(user.id, token);

    return { user, token };
  }

  /**
   * 生成 JWT Token
   */
  generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * 验证 JWT Token
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded.userId;
    } catch (error) {
      throw new Error('Token 无效或已过期');
    }
  }

  /**
   * 存储会话到 Redis
   */
  async storeSession(userId, token) {
    const sessionKey = `session:${userId}`;
    const sessionData = {
      userId,
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    try {
      await redis.set(sessionKey, sessionData, 7 * 24 * 60 * 60); // 7天
    } catch {
      // Redis 未配置时，忽略
    }
  }

  /**
   * 获取用户信息
   */
  getUserById(userId) {
    return usersById.get(userId);
  }

  /**
   * 获取用户信息（通过邮箱）
   */
  getUserByEmail(email) {
    return users.get(email);
  }

  /**
   * 更新用户资料
   */
  updateProfile(userId, updates) {
    const user = usersById.get(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    if (updates.nickname) user.nickname = updates.nickname;
    if (updates.avatar) user.avatar = updates.avatar;

    return user;
  }

  /**
   * 登出
   */
  async logout(userId) {
    const sessionKey = `session:${userId}`;
    try {
      await redis.del(sessionKey);
    } catch {
      // Redis 未配置时，忽略
    }
  }

  /**
   * 获取用户统计
   */
  getStats() {
    return {
      totalUsers: users.size,
      levels: Array.from(users.values()).reduce((acc, u) => {
        acc[u.level] = (acc[u.level] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

module.exports = new AuthService();
