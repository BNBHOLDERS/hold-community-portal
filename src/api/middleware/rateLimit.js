/**
 * 速率限制中间件
 * 防止 API 滥用
 */

const rateLimits = new Map();

// 配置
const DEFAULT_CONFIG = {
    windowMs: 60000,    // 时间窗口：1分钟
    maxRequests: 60     // 最大请求数
};

// 特定路由配置
const ROUTE_CONFIGS = {
    // AI 端点 - 更严格的限制
    '/api/ai/chat': { windowMs: 60000, maxRequests: 10 },
    '/api/ai/analyze': { windowMs: 60000, maxRequests: 20 },

    // 认证端点 - 防暴力破解
    '/api/auth/send-code': { windowMs: 3600000, maxRequests: 5 },
    '/api/auth/verify': { windowMs: 60000, maxRequests: 10 },

    // Binance Web3 - 中等限制
    '/api/binance': { windowMs: 60000, maxRequests: 30 },

    // 公开内容 - 宽松限制
    '/api/content': { windowMs: 60000, maxRequests: 100 },
    '/api/docs': { windowMs: 60000, maxRequests: 100 }
};

/**
 * 清理过期记录
 */
function cleanupExpiredEntries() {
    const now = Date.now();
    for (const [key, data] of rateLimits.entries()) {
        if (data.resetAt < now) {
            rateLimits.delete(key);
        }
    }
}

// 每分钟清理一次
setInterval(cleanupExpiredEntries, 60000);

/**
 * 速率限制中间件工厂
 */
function rateLimit(options = {}) {
    const config = { ...DEFAULT_CONFIG, ...options };

    return function rateLimitMiddleware(req, res, next) {
        // 获取标识符
        const identifier = req.user?.id || req.ip || 'unknown';
        const key = `${identifier}:${req.path}`;

        const now = Date.now();
        let record = rateLimits.get(key);

        // 初始化或重置记录
        if (!record || record.resetAt < now) {
            record = {
                count: 0,
                resetAt: now + config.windowMs
            };
            rateLimits.set(key, record);
        }

        // 检查限制
        if (record.count >= config.maxRequests) {
            const retryAfter = Math.ceil((record.resetAt - now) / 1000);
            res.setHeader('Retry-After', retryAfter);
            res.setHeader('X-RateLimit-Limit', config.maxRequests);
            res.setHeader('X-RateLimit-Remaining', 0);
            res.setHeader('X-RateLimit-Reset', record.resetAt);

            return res.status(429).json({
                error: '请求过于频繁，请稍后再试',
                retryAfter: `${retryAfter}秒`
            });
        }

        // 增加计数
        record.count++;

        // 设置响应头
        res.setHeader('X-RateLimit-Limit', config.maxRequests);
        res.setHeader('X-RateLimit-Remaining', config.maxRequests - record.count);
        res.setHeader('X-RateLimit-Reset', record.resetAt);

        next();
    };
}

/**
 * 根据路由自动选择配置
 */
function smartRateLimit(req, res, next) {
    // 查找匹配的配置
    let config = DEFAULT_CONFIG;

    for (const [route, routeConfig] of Object.entries(ROUTE_CONFIGS)) {
        if (req.path.startsWith(route)) {
            config = routeConfig;
            break;
        }
    }

    // 应用对应的速率限制
    return rateLimit(config)(req, res, next);
}

/**
 * IP 白名单检查
 */
const ipWhitelist = new Set(['::1', '127.0.0.1', 'localhost']);

function isWhitelisted(ip) {
    return ipWhitelist.has(ip);
}

/**
 * 可跳过的速率限制（开发模式）
 */
function conditionalRateLimit(req, res, next) {
    // 开发模式跳过本地请求
    if (process.env.NODE_ENV === 'development' && isWhitelisted(req.ip)) {
        return next();
    }

    return smartRateLimit(req, res, next);
}

/**
 * 获取速率限制统计
 */
function getStats() {
    const stats = {
        totalKeys: rateLimits.size,
        routes: {}
    };

    for (const [key, data] of rateLimits.entries()) {
        const route = key.split(':').pop();
        if (!stats.routes[route]) {
            stats.routes[route] = { count: 0, keys: 0 };
        }
        stats.routes[route].count += data.count;
        stats.routes[route].keys++;
    }

    return stats;
}

/**
 * 重置特定标识符的限制
 */
function resetLimit(identifier) {
    for (const [key] of rateLimits.entries()) {
        if (key.startsWith(identifier)) {
            rateLimits.delete(key);
        }
    }
}

module.exports = {
    rateLimit,
    smartRateLimit,
    conditionalRateLimit,
    getStats,
    resetLimit,
    ROUTE_CONFIGS
};
