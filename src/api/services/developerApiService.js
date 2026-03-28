/**
 * 开发者 API 服务
 * 提供 RESTful API 供第三方调用
 */

const crypto = require('crypto');

class DeveloperApiService {
    constructor() {
        // API 密钥: { key, userId, rateLimit, requests, createdAt }
        this.apiKeys = new Map();
        // 请求日志
        this.requestLogs = [];
        // 速率限制配置
        this.rateLimits = {
            free: 100,      // 免费用户：100次/小时
            pro: 1000,       // 专业用户：1000次/小时
            enterprise: 10000 // 企业用户：10000次/小时
        };
    }

    /**
     * 生成 API 密钥
     */
    generateApiKey(userId, tier = 'free') {
        const key = `hold_${tier}_${crypto.randomBytes(24).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 32)}`;

        this.apiKeys.set(key, {
            key,
            userId,
            tier,
            rateLimit: this.rateLimits[tier] || this.rateLimits.free,
            requests: 0,
            resetAt: new Date(Date.now() + 3600000).toISOString(),
            createdAt: new Date().toISOString()
        });

        return this.apiKeys.get(key);
    }

    /**
     * 验证 API 密钥
     */
    validateApiKey(key) {
        const keyData = this.apiKeys.get(key);

        if (!keyData) {
            return { valid: false, error: 'Invalid API key' };
        }

        // 检查速率限制重置
        if (new Date() > new Date(keyData.resetAt)) {
            keyData.requests = 0;
            keyData.resetAt = new Date(Date.now() + 3600000).toISOString();
        }

        // 检查是否超限
        if (keyData.requests >= keyData.rateLimit) {
            return { valid: false, error: 'Rate limit exceeded' };
        }

        return { valid: true, tier: keyData.tier, userId: keyData.userId };
    }

    /**
     * 记录 API 请求
     */
    logRequest(key, endpoint, method, statusCode, responseTime) {
        const keyData = this.apiKeys.get(key);
        if (keyData) {
            keyData.requests++;
        }

        this.requestLogs.push({
            key,
            endpoint,
            method,
            statusCode,
            responseTime,
            timestamp: new Date().toISOString()
        });

        // 限制日志大小
        if (this.requestLogs.length > 10000) {
            this.requestLogs.shift();
        }
    }

    /**
     * 获取用户 API 密钥
     */
    getUserApiKeys(userId) {
        return Array.from(this.apiKeys.values())
            .filter(k => k.userId === userId)
            .map(k => ({
                key: k.key.slice(0, 10) + '...', // 隐藏完整密钥
                tier: k.tier,
                rateLimit: k.rateLimit,
                requests: k.requests,
                resetAt: k.resetAt,
                createdAt: k.createdAt
            }));
    }

    /**
     * 删除 API 密钥
     */
    deleteApiKey(key) {
        return this.apiKeys.delete(key);
    }

    /**
     * 获取 API 使用统计
     */
    getUsageStats(userId) {
        const userKeys = Array.from(this.apiKeys.values()).filter(k => k.userId === userId);

        return {
            totalKeys: userKeys.length,
            totalRequests: userKeys.reduce((sum, k) => sum + k.requests, 0),
            rateLimitTotal: userKeys.reduce((sum, k) => sum + k.rateLimit, 0),
            keys: userKeys.map(k => ({
                key: k.key.slice(0, 10) + '...',
                tier: k.tier,
                requests: k.requests,
                rateLimit: k.rateLimit
            }))
        };
    }

    /**
     * 获取系统统计
     */
    getSystemStats() {
        return {
            totalApiKeys: this.apiKeys.size,
            totalRequests: this.requestLogs.length,
            requestsPerHour: this.requestLogs.filter(
                r => new Date(r.timestamp) > new Date(Date.now() - 3600000)
            ).length,
            tierDistribution: {
                free: Array.from(this.apiKeys.values()).filter(k => k.tier === 'free').length,
                pro: Array.from(this.apiKeys.values()).filter(k => k.tier === 'pro').length,
                enterprise: Array.from(this.apiKeys.values()).filter(k => k.tier === 'enterprise').length
            }
        };
    }
}

module.exports = new DeveloperApiService();
