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
        this.loadFromFile();
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
        } catch (error) {
            console.error('保存用户配额失败:', error.message);
        }
    }

    /**
     * 检查用户是否有配额
     */
    async checkQuota(userId, apiType) {
        await this.resetIfNewDay(userId);

        const userQuota = this.userQuota.get(userId);
        if (!userQuota) {
            // 未注册用户使用免费配额
            return this.checkAnonymousQuota(apiType);
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
     * 检查匿名用户配额（基于全局限制）
     */
    checkAnonymousQuota(apiType) {
        const key = `anonymous:${apiType}`;
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
     */
    async recordUsage(userId, apiType) {
        await this.resetIfNewDay(userId);

        if (userId) {
            let userQuota = this.userQuota.get(userId);
            if (!userQuota) {
                userQuota = { tier: 'free', daily: {}, total: {} };
                this.userQuota.set(userId, userQuota);
            }
            if (!userQuota.daily) {
                userQuota.daily = this.initDailyQuota();
            }
            userQuota.daily[apiType] = (userQuota.daily[apiType] || 0) + 1;
            userQuota.total[apiType] = (userQuota.total[apiType] || 0) + 1;
            await this.saveToFile();
        } else {
            // 匿名用户
            const key = `anonymous:${apiType}`;
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
     */
    async getUserQuota(userId) {
        await this.resetIfNewDay(userId);

        // 匿名用户
        if (!userId) {
            const today = new Date().toISOString().split('T')[0];
            const daily = { ai_chat: 0, ai_analyze: 0, binance: 0 };

            // 从匿名配额中获取今日使用量
            if (this.anonymousQuota) {
                for (const [key, record] of this.anonymousQuota.entries()) {
                    if (key.endsWith(`:${today}`)) {
                        const apiType = key.split(':')[1];
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
     * 设置用户等级
     */
    async setUserTier(userId, tier) {
        let userQuota = this.userQuota.get(userId);
        if (!userQuota) {
            userQuota = { tier: 'free', daily: {}, total: {} };
            this.userQuota.set(userId, userQuota);
        }
        userQuota.tier = tier;
        await this.saveToFile();
    }

    /**
     * 设置管理员标记
     */
    async setAdmin(userId, isAdmin = true) {
        let userQuota = this.userQuota.get(userId);
        if (!userQuota) {
            userQuota = { tier: 'free', daily: {}, total: {} };
            this.userQuota.set(userId, userQuota);
        }
        userQuota.isAdmin = isAdmin;
        if (isAdmin) {
            userQuota.tier = 'admin';
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
