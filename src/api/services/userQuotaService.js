/**
 * 用户配额服务
 * 管理注册用户的API调用配额
 */

const dataPersistence = require('./dataPersistenceService');

// 配额配置（每日）
const QUOTA_CONFIG = {
    // 免费用户配额
    free: {
        ai_chat: 50,           // AI对话次数
        ai_analyze: 20,        // 代币分析次数
        binance: 100,          // Binance API调用
    },
    // 认证用户配额
    authenticated: {
        ai_chat: 100,          // AI对话次数
        ai_analyze: 50,        // 代币分析次数
        binance: 200,          // Binance API调用
    },
    // 管理员配额
    admin: {
        ai_chat: 1000,
        ai_analyze: 500,
        binance: 1000
    }
};

class UserQuotaService {
    constructor() {
        this.userQuota = new Map(); // 内存缓存 { userId: { daily: { ai_chat: 0, ... }, used: {...} } }
        this.anonymousQuota = new Map(); // 匿名用户配额 { key: { count } }
        this.pendingWrites = false; // 待写入标志
        // 配额预留锁（防止并发扣除问题）
        this.reservations = new Map(); // { requestId: { userId, apiType, timestamp } }
        this.loadFromFile();
        this.startCleanupTimer();
    }

    /**
     * 从文件加载配额数据
     */
    async loadFromFile() {
        try {
            const data = await dataPersistence.loadUserQuota();
            if (data) {
                for (const [userId, quota] of Object.entries(data)) {
                    this.userQuota.set(userId, quota);
                }
            }
        } catch (error) {
            console.error('加载用户配额失败:', error.message);
        }
    }

    /**
     * 保存配额到文件
     */
    async saveToFile() {
        try {
            const data = Object.fromEntries(this.userQuota);
            await dataPersistence.saveUserQuota(data);
            this.pendingWrites = false;
        } catch (error) {
            console.error('保存用户配额失败:', error.message);
        }
    }

    /**
     * 启动清理定时器
     */
    startCleanupTimer() {
        // 每小时清理一次过期数据
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpiredAnonymousQuota();
        }, 60 * 60 * 1000);

        // 每30秒批量保存待写入数据
        this.saveInterval = setInterval(() => {
            if (this.pendingWrites) {
                this.saveToFile();
            }
        }, 30000);
    }

    /**
     * 清理过期的匿名配额记录
     */
    cleanupExpiredAnonymousQuota() {
        if (!this.anonymousQuota) return;

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const cleaned = 0;

        for (const [key] of this.anonymousQuota.entries()) {
            const datePart = key.split(':').pop();
            // 只保留今天和昨天的数据
            if (datePart !== yesterday && datePart !== today) {
                this.anonymousQuota.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`[配额] 清理了 ${cleaned} 条过期匿名配额记录`);
        }
    }

    /**
     * 关闭服务时的清理
     */
    shutdown() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
        }
        return this.saveToFile();
    }

    /**
     * 检查用户是否有配额
     * @param {string} userId - 用户ID（匿名用户为null）
     * @param {string} apiType - API类型
     * @param {string} ipAddress - IP地址（用于匿名用户区分）
     */
    async checkQuota(userId, apiType, ipAddress = 'unknown') {
        await this.resetIfNewDay(userId);

        const userQuota = this.userQuota.get(userId);
        if (!userQuota) {
            // 未注册用户使用免费配额（基于IP区分）
            return this.checkAnonymousQuota(apiType, ipAddress);
        }

        const daily = userQuota.daily;
        const tier = this.getUserTier(userQuota);
        const limit = QUOTA_CONFIG[tier]?.[apiType] || QUOTA_CONFIG.free[apiType];

        if (!daily) {
            daily = this.initDailyQuota();
            userQuota.daily = daily;
        }

        return daily[apiType] < limit;
    }

    /**
     * 原子化消耗配额（检查并扣除，防止竞态条件）
     * @param {string} userId - 用户ID（匿名用户为null）
     * @param {string} apiType - API类型
     * @param {string} ipAddress - IP地址（用于匿名用户区分）
     * @param {string} reservationId - 预留ID（可选）
     * @returns {boolean} 是否成功消耗配额
     */
    async consumeQuota(userId, apiType, ipAddress = 'unknown', reservationId = null) {
        await this.resetIfNewDay(userId);

        // 注册用户
        if (userId) {
            let userQuota = this.userQuota.get(userId);
            if (!userQuota) {
                userQuota = { tier: 'authenticated', daily: this.initDailyQuota(), total: {} };
                this.userQuota.set(userId, userQuota);
            }

            if (!userQuota.daily) {
                userQuota.daily = this.initDailyQuota();
            }

            const tier = this.getUserTier(userQuota);
            const limit = QUOTA_CONFIG[tier]?.[apiType] || QUOTA_CONFIG.free[apiType];
            const current = userQuota.daily[apiType] || 0;

            // 原子检查并增加
            if (current < limit) {
                userQuota.daily[apiType] = current + 1;
                userQuota.total[apiType] = (userQuota.total[apiType] || 0) + 1;

                // 标记需要保存
                this.pendingWrites = true;

                // 首次使用立即保存
                if (current === 0) {
                    await this.saveToFile();
                }

                return true;
            }
            return false;
        }

        // 匿名用户 - 原子操作
        const key = `anonymous:${ipAddress}:${apiType}`;
        const today = new Date().toISOString().split('T')[0];
        const fullKey = `${key}:${today}`;

        if (!this.anonymousQuota) {
            this.anonymousQuota = new Map();
        }

        let record = this.anonymousQuota.get(fullKey);
        if (!record) {
            record = { count: 0 };
            this.anonymousQuota.set(fullKey, record);
        }

        const limit = QUOTA_CONFIG.free[apiType] || 10;
        const current = record.count || 0;

        if (current < limit) {
            record.count = current + 1;
            return true;
        }
        return false;
    }

    /**
     * 检查匿名用户配额（基于IP地址区分）
     * @param {string} apiType - API类型
     * @param {string} ipAddress - IP地址
     */
    checkAnonymousQuota(apiType, ipAddress = 'unknown') {
        const key = `anonymous:${ipAddress}:${apiType}`;
        const today = new Date().toISOString().split('T')[0];

        if (!this.anonymousQuota) {
            this.anonymousQuota = new Map();
        }

        let record = this.anonymousQuota.get(`${key}:${today}`);
        if (!record) {
            record = { count: 0 };
            this.anonymousQuota.set(`${key}:${today}`, record);
        }

        const limit = QUOTA_CONFIG.free[apiType] || 10;
        return record.count < limit;
    }

    /**
     * 记录API调用
     * @param {string} userId - 用���ID（匿名用户为null）
     * @param {string} apiType - API类型
     * @param {string} ipAddress - IP地址（用于匿名用户）
     */
    async recordUsage(userId, apiType, ipAddress = 'unknown') {
        await this.resetIfNewDay(userId);

        if (userId) {
            let userQuota = this.userQuota.get(userId);
            if (!userQuota) {
                userQuota = { tier: 'authenticated', daily: {}, total: {} };
                this.userQuota.set(userId, userQuota);
            }
            if (!userQuota.daily) {
                userQuota.daily = this.initDailyQuota();
            }
            userQuota.daily[apiType] = (userQuota.daily[apiType] || 0) + 1;
            userQuota.total[apiType] = (userQuota.total[apiType] || 0) + 1;

            // 标记需要保存，但不立即写入（由定时器批量处理）
            this.pendingWrites = true;

            // 重要操作（如首次使用）立即保存
            if (userQuota.daily[apiType] === 1) {
                await this.saveToFile();
            }
        } else {
            // 匿名用户 - 使用IP区分
            const key = `anonymous:${ipAddress}:${apiType}`;
            const today = new Date().toISOString().split('T')[0];
            const fullKey = `${key}:${today}`;

            if (!this.anonymousQuota) {
                this.anonymousQuota = new Map();
            }

            let record = this.anonymousQuota.get(fullKey);
            if (!record) {
                record = { count: 0 };
                this.anonymousQuota.set(fullKey, record);
            }
            record.count++;
        }
    }

    /**
     * 获取用户配额信息
     * @param {string} userId - 用户ID（匿名用户为null）
     * @param {string} ipAddress - IP地址（用于匿名用户统计）
     */
    async getUserQuota(userId, ipAddress = 'unknown') {
        await this.resetIfNewDay(userId);

        // 匿名用户
        if (!userId) {
            const today = new Date().toISOString().split('T')[0];
            const daily = { ai_chat: 0, ai_analyze: 0, binance: 0 };

            // 从匿名配额中获取今日使用量
            if (this.anonymousQuota) {
                for (const [key, record] of this.anonymousQuota.entries()) {
                    if (key.includes(`:${ipAddress}:`) && key.endsWith(`:${today}`)) {
                        const apiType = key.split(':')[2];
                        if (apiType && daily.hasOwnProperty(apiType)) {
                            daily[apiType] = record.count || 0;
                        }
                    }
                }
            }

            return {
                tier: 'anonymous',
                daily,
                limits: QUOTA_CONFIG.free
            };
        }

        // 注册用户
        const userQuota = this.userQuota.get(userId);
        if (!userQuota) {
            return { tier: 'anonymous', limits: QUOTA_CONFIG.free };
        }

        const tier = this.getUserTier(userQuota);
        const daily = userQuota.daily || this.initDailyQuota();
        const limits = QUOTA_CONFIG[tier] || QUOTA_CONFIG.free;

        return {
            tier,
            daily: {
                ai_chat: daily.ai_chat || 0,
                ai_analyze: daily.ai_analyze || 0,
                binance: daily.binance || 0,
                limits
            },
            total: userQuota.total || {}
        };
    }

    /**
     * 获取用户等级
     */
    getUserTier(userQuota) {
        if (userQuota.isAdmin) return 'admin';
        if (userQuota.tier) return userQuota.tier;
        return 'authenticated';
    }

    /**
     * 初始化每日配额
     */
    initDailyQuota() {
        return {
            ai_chat: 0,
            ai_analyze: 0,
            binance: 0,
            date: new Date().toISOString().split('T')[0]
        };
    }

    /**
     * 检查是否需要重置（新的一天）
     */
    async resetIfNewDay(userId) {
        const userQuota = this.userQuota.get(userId);
        if (userQuota && userQuota.daily) {
            const today = new Date().toISOString().split('T')[0];
            if (userQuota.daily.date !== today) {
                userQuota.daily = this.initDailyQuota();
                await this.saveToFile();
            }
        }
    }

    /**
     * 初始化新用户配额（注册时调用，无需��限检查）
     * @param {string} userId - 新用户ID
     * @param {string} email - 用户邮箱（用于判断是否为管理员）
     */
    async initializeUserQuota(userId, email) {
        const { isAdminEmail } = require('../../config/envValidation');
        const isAdmin = isAdminEmail(email);

        let userQuota = this.userQuota.get(userId);
        if (!userQuota) {
            userQuota = {
                tier: isAdmin ? 'admin' : 'authenticated',
                daily: this.initDailyQuota(),
                total: {},
                isAdmin
            };
            this.userQuota.set(userId, userQuota);
        }

        await this.saveToFile();
    }

    /**
     * 设置用户等级（仅管理员可调用）
     * @param {string} requesterId - 请求者的用户ID
     * @param {string} targetUserId - 目标用户ID
     * @param {string} tier - 新等级
     */
    async setUserTier(requesterId, targetUserId, tier) {
        // 验证请求者权限
        const requester = this.userQuota.get(requesterId);
        if (!requester || this.getUserTier(requester) !== 'admin') {
            throw new Error('无权限修改用户等级');
        }

        let userQuota = this.userQuota.get(targetUserId);
        if (!userQuota) {
            userQuota = { tier: 'authenticated', daily: {}, total: {} };
            this.userQuota.set(targetUserId, userQuota);
        }
        userQuota.tier = tier;
        await this.saveToFile();
    }

    /**
     * 设置管理员标记（仅管理员可调用）
     * @param {string} requesterId - 请求者的用户ID
     * @param {string} targetUserId - 目标用户ID
     * @param {boolean} isAdmin - 是否为管理员
     */
    async setAdmin(requesterId, targetUserId, isAdmin = true) {
        // 验证请求者权限
        const requester = this.userQuota.get(requesterId);
        if (!requester || this.getUserTier(requester) !== 'admin') {
            throw new Error('无权限设置管理员');
        }

        let userQuota = this.userQuota.get(targetUserId);
        if (!userQuota) {
            userQuota = { tier: 'authenticated', daily: {}, total: {} };
            this.userQuota.set(targetUserId, userQuota);
        }
        userQuota.isAdmin = isAdmin;
        if (isAdmin) {
            userQuota.tier = 'admin';
        } else if (userQuota.tier === 'admin' && !isAdmin) {
            userQuota.tier = 'authenticated';
        }
        await this.saveToFile();
    }

    /**
     * 获取全局统计
     */
    getGlobalStats() {
        const today = new Date().toISOString().split('T')[0];
        const stats = {
            date: today,
            anonymous: {},
            registered: {}
        };

        // 统计匿名用户使用
        for (const [key, record] of this.anonymousQuota.entries()) {
            if (key.endsWith(`:${today}`)) {
                const apiType = key.split(':')[1];
                stats.anonymous[apiType] = record.count;
            }
        }

        // 统计注册用户使用
        for (const [userId, userQuota] of this.userQuota.entries()) {
            if (userQuota.daily && userQuota.daily.date === today) {
                stats.registered[userId] = userQuota.daily;
            }
        }

        return stats;
    }
}

// 导出单例
const userQuotaService = new UserQuotaService();

module.exports = userQuotaService;
