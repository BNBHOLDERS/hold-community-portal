/**
 * 配额检查中间件
 * 区分注册用户和匿名用户的 API 调用配额
 */

const userQuotaService = require('../services/userQuotaService');

/**
 * 创建配额检查中间件
 * @param {string} apiType - API类型 (ai_chat, ai_analyze, binance)
 * @param {boolean} requireAuth - 是否必须登录 (默认 false，允许匿名访问)
 */
function checkQuota(apiType, requireAuth = false) {
    return async (req, res, next) => {
        try {
            // 获取用户ID（从 optionalAuth 中间件设置）
            const userId = req.user?.id;

            // 如果要求必须登录但用户未登录
            if (requireAuth && !userId) {
                return res.status(401).json({
                    error: '请先登录',
                    message: '此功能需要注册后使用'
                });
            }

            // 检查配额
            const hasQuota = await userQuotaService.checkQuota(userId, apiType);

            if (!hasQuota) {
                // 获取当前配额信息用于返回
                const quotaInfo = await userQuotaService.getUserQuota(userId);
                const limit = quotaInfo.limits?.[apiType] || 0;

                return res.status(429).json({
                    error: 'API调用配额已用完',
                    message: '注册用户可获得更多配额',
                    quota: {
                        tier: quotaInfo.tier,
                        limit,
                        used: quotaInfo.daily?.[apiType] || 0,
                        resetAt: new Date().setHours(24, 0, 0, 0)  // 今日结束
                    }
                });
            }

            // 将配额信息附加到请求，供控制器使用
            req.quota = {
                apiType,
                userId,
                tier: userId ? (await userQuotaService.getUserQuota(userId)).tier : 'anonymous'
            };

            // 在继续之前设置响应监听器（必须在 next() 之前）
            res.on('finish', async () => {
                console.log(`[配额] res.statusCode=${res.statusCode}, userId=${userId || 'anonymous'}, apiType=${apiType}`);
                if (res.statusCode < 400) {
                    try {
                        await userQuotaService.recordUsage(userId, apiType);
                        console.log(`[配额] 已记录使用: userId=${userId || 'anonymous'}, apiType=${apiType}`);
                    } catch (err) {
                        console.error('记录配额使用失败:', err.message);
                    }
                }
            });

            next();
        } catch (error) {
            console.error('配额检查错误:', error.message);
            // 出错时放行，避免影响正常使用
            next();
        }
    };
}

/**
 * AI 聊天配额检查
 */
function checkAiChatQuota() {
    return checkQuota('ai_chat', false);
}

/**
 * AI 分析配额检查
 */
function checkAiAnalyzeQuota() {
    return checkQuota('ai_analyze', false);
}

/**
 * Binance API 配额检查
 */
function checkBinanceQuota() {
    return checkQuota('binance', false);
}

/**
 * GMGN API 配额检查（使用 binance 配额）
 */
function checkGmgnQuota() {
    return checkQuota('binance', false);
}

module.exports = {
    checkQuota,
    checkAiChatQuota,
    checkAiAnalyzeQuota,
    checkBinanceQuota,
    checkGmgnQuota
};
