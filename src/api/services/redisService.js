/**
 * Redis 缓存服务
 * 用于缓存 AI 回复、常见问题、价格数据等
 */

const Redis = require('ioredis');

class RedisService {
    constructor() {
        this.client = null;
        this.enabled = false;
        this.init();
    }

    /**
     * 初始化 Redis 连接
     */
    init() {
        const redisUrl = process.env.REDIS_URL;

        if (!redisUrl || redisUrl === 'redis://localhost:6379') {
            // Redis 未配置，使用内存缓存
            console.log('Redis 未配置，使用内存缓存');
            this.memoryCache = new Map();
            this.enabled = false;
            return;
        }

        try {
            this.client = new Redis(redisUrl, {
                password: process.env.REDIS_PASSWORD || undefined,
                retryDelayOnFailover: 100,
                maxRetriesPerRequest: 3,
                lazyConnect: true
            });

            this.client.on('error', (err) => {
                console.error('Redis 错误:', err.message);
                this.enabled = false;
            });

            this.client.on('connect', () => {
                console.log('Redis 已连接');
                this.enabled = true;
            });

            this.client.connect().catch(() => {
                console.log('Redis 连接失败，使用内存缓存');
            });
        } catch (error) {
            console.log('Redis 初始化失败，使用内存缓存:', error.message);
            this.memoryCache = new Map();
        }
    }

    /**
     * 获取缓存
     */
    async get(key) {
        if (this.enabled && this.client) {
            try {
                const value = await this.client.get(key);
                if (!value) return null;
                try {
                    return JSON.parse(value);
                } catch {
                    // JSON 解析失败，返回原始值
                    return value;
                }
            } catch {
                return this.getMemory(key);
            }
        }
        return this.getMemory(key);
    }

    /**
     * 设置缓存
     */
    async set(key, value, ttl = 3600) {
        const data = JSON.stringify(value);

        if (this.enabled && this.client) {
            try {
                if (ttl) {
                    await this.client.setex(key, ttl, data);
                } else {
                    await this.client.set(key, data);
                }
                return;
            } catch {
                // 降级到内存缓存
            }
        }
        this.setMemory(key, value, ttl);
    }

    /**
     * 删除缓存
     */
    async del(key) {
        if (this.enabled && this.client) {
            try {
                await this.client.del(key);
                return;
            } catch {
                // 继续删除内存缓存
            }
        }
        this.memoryCache?.delete(key);
    }

    /**
     * 清空所有缓存
     */
    async flush() {
        if (this.enabled && this.client) {
            try {
                await this.client.flushdb();
                return;
            } catch {
                // 继续清空内存缓存
            }
        }
        this.memoryCache?.clear();
    }

    /**
     * 内存缓存获取
     */
    getMemory(key) {
        if (!this.memoryCache) return null;
        const item = this.memoryCache.get(key);
        if (!item) return null;
        if (item.expire && Date.now() > item.expire) {
            this.memoryCache.delete(key);
            return null;
        }
        return item.value;
    }

    /**
     * 内存缓存设置
     */
    setMemory(key, value, ttl) {
        if (!this.memoryCache) return;
        const expire = ttl ? Date.now() + (ttl * 1000) : null;
        this.memoryCache.set(key, { value, expire });
    }

    /**
     * 生成缓存键
     */
    static keys = {
        AI_CHAT: (message) => `ai:chat:${Buffer.from(message).toString('base64').slice(0, 50)}`,
        AI_RESPONSE: (sessionId) => `ai:session:${sessionId}`,
        TOKEN_PRICE: (symbol) => `price:${symbol}`,
        TOKEN_INFO: (address, chain) => `token:${chain}:${address}`,
        USER_SESSION: (userId) => `session:${userId}`,
        RATE_LIMIT: (identifier) => `ratelimit:${identifier}`
    };
}

module.exports = new RedisService();
