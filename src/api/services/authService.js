/**
 * 用户认证服务
 * 邮箱验证码登录，无密码
 */

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const redis = require('./redisService');
const emailService = require('./emailService');
const dataPersistence = require('./dataPersistenceService');
const { isAdminEmail } = require('../../config/envValidation');

// JWT 密钥 - 由 server.js 启动时验证确保存在
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d'; // Token 有效期
const CODE_EXPIRES_IN = 300; // 验证码有效期 5 分钟

// 内存存储
const users = new Map(); // email -> User
const usersById = new Map(); // id -> User
const verificationCodes = new Map(); // email -> { code, expiresAt, sentAt }
const codeAttempts = new Map(); // email -> { count, resetAt } // 防暴力破解

// 自动保存定时器
let saveTimer = null;
const SAVE_INTERVAL = 60000; // 1分钟

// 加载保存的用户数据
function loadUserData() {
  try {
    const data = dataPersistence.loadUsers();
    if (data.usersByEmail.size > 0) {
      data.usersByEmail.forEach((value, key) => users.set(key, value));
      data.usersById.forEach((value, key) => usersById.set(key, value));
      console.log(`✅ 已加载 ${users.size} 个用户数据`);
    }
  } catch (error) {
    console.error('加载用户数据失败:', error.message);
  }
}

// 启动时加载数据
loadUserData();

// 保存用户数据
function saveUserData() {
  try {
    dataPersistence.saveUsers(users, usersById);
  } catch (error) {
    console.error('保存用户数据失败:', error.message);
  }
}

// 启动自动保存
function startAutoSave() {
  if (saveTimer) return;
  saveTimer = setInterval(saveUserData, SAVE_INTERVAL);
}

// 停止自动保存
function stopAutoSave() {
  if (saveTimer) {
    clearInterval(saveTimer);
    saveTimer = null;
  }
}

// 生成随机验证码
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

class AuthService {
  constructor() {
    // 启动自动保存
    startAutoSave();
  }

  /**
   * 发送验证码
   */
  async sendVerificationCode(email) {
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('邮箱格式不正确');
    }

    // 检查尝试次数（防暴力破解）
    const attempts = codeAttempts.get(email);
    const now = Date.now();
    if (attempts && attempts.resetAt > now) {
      if (attempts.count >= 5) {
        throw new Error('验证码尝试次数过多，请稍后再试');
      }
    } else {
      // 清理过期的记录
      if (attempts && attempts.resetAt <= now) {
        codeAttempts.delete(email);
      }
      // 创建新的尝试记录
      codeAttempts.set(email, { count: 0, resetAt: now + 3600000 }); // 1小时重置
    }

    // 检查频率限制（1分钟内只能发送一次）
    const existing = verificationCodes.get(email);
    if (existing && existing.expiresAt > now && existing.sentAt > now - 60000) {
      throw new Error('验证码发送过于频繁，请稍后再试');
    }

    // 生成验证码
    const code = generateCode();

    // 存储验证码
    verificationCodes.set(email, {
      code,
      sentAt: now,
      expiresAt: now + CODE_EXPIRES_IN * 1000
    });

    // 发送邮件（如果配置了 SMTP）
    try {
      const result = await emailService.sendVerificationCode(email, code);

      // 开发模式：记录到服务器日志，不返回给客户端
      if (result && result.simulated) {
        console.log(`[开发模式] 验证码: ${code}, 邮箱: ${email}`);
        return { success: true, message: '验证码已生成' };
      }

      return { success: true, message: '验证码已发送' };
    } catch (emailError) {
      // 邮件服务未配置时，返回开发模式
      console.log(`[开发模式] 验证码: ${code}, 邮箱: ${email}`);
      return { success: true, message: '验证码已生成' };
    }
  }

  /**
   * 验证验证码
   */
  verifyCode(email, code) {
    const record = verificationCodes.get(email);
    const attempts = codeAttempts.get(email);

    if (!record) {
      // 记录失败尝试
      if (attempts) attempts.count++;
      throw new Error('验证码不存在或已过期');
    }

    if (record.expiresAt < Date.now()) {
      // 验证码过期，删除记录
      verificationCodes.delete(email);
      throw new Error('验证码已过期');
    }

    if (record.code !== code) {
      // 验证码错误，立即删除验证码防止暴力破解
      verificationCodes.delete(email);

      // 记录失败尝试
      if (attempts) {
        attempts.count++;
        // 如果超过尝试次数，删除记录重新计时
        if (attempts.count >= 5) {
          codeAttempts.delete(email);
          throw new Error('验证码错误次数过多，请重新获取');
        }
      }
      throw new Error('验证码错误');
    }

    // 验证成功，删除验证码和尝试记录
    verificationCodes.delete(email);
    codeAttempts.delete(email);
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

    // 立即保存
    saveUserData();

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

    // 保存更新
    saveUserData();

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

    // 保存更新
    saveUserData();

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

  /**
   * 手动保存数据
   */
  saveData() {
    saveUserData();
  }

  /**
   * 关闭服务
   */
  shutdown() {
    stopAutoSave();
    saveUserData();
  }
}

module.exports = new AuthService();
