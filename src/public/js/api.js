/**
 * HOLD 社区门户 - API 调用封装
 */

const API_BASE = '/api';

/**
 * API 错误类
 */
class ApiError extends Error {
    constructor(code, message, details = {}) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'ApiError';
    }
}

/**
 * 通用 API 请求
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    // 添加 token
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, config);

        // 检查 HTTP 状态码
        if (!response.ok) {
            if (response.status === 429) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError('RATE_LIMIT', errorData.error || '请求过于频繁，请稍后再试', errorData.quota || {});
            }
            if (response.status === 401) {
                // Token 过期或无效，清除登录状态
                localStorage.removeItem('token');
                if (window.Auth) {
                    window.Auth.currentUser = null;
                    window.Auth.isAuthenticated = false;
                    window.Auth.updateAuthUI();
                }
                throw new ApiError('UNAUTHORIZED', '请先登录');
            }
            if (response.status === 403) {
                throw new ApiError('FORBIDDEN', '无权限访问');
            }
            throw new ApiError('HTTP_ERROR', `请求失败 (${response.status})`);
        }

        const data = await response.json();

        // 业务逻辑错误
        if (data.success === false && data.error) {
            throw new ApiError('BUSINESS_ERROR', data.error, data);
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.error('API Error:', error);
        throw new ApiError('NETWORK_ERROR', '网络错误，请检查连接');
    }
}

/**
 * 认证相关 API
 */
const AuthAPI = {
    // 发送验证码
    sendCode: (email) => apiRequest('/auth/send-code', {
        method: 'POST',
        body: JSON.stringify({ email })
    }),

    // 登录/注册
    verifyAndLogin: (email, code, nickname) => apiRequest('/auth/verify-and-login', {
        method: 'POST',
        body: JSON.stringify({ email, code, nickname })
    }),

    // 获取当前用户
    getMe: () => apiRequest('/auth/me'),

    // 获取用户配额
    getUserQuota: () => apiRequest('/auth/quota'),

    // 登出
    logout: () => apiRequest('/auth/logout', {
        method: 'POST'
    })
};

/**
 * 内容相关 API
 */
const ContentAPI = {
    // 获取讨论列表
    getDiscussions: (category) => apiRequest(`/content/discussions?category=${category}`),

    // 获取文章列表
    getArticles: () => apiRequest('/content/articles'),

    // 获取分享列表
    getShares: () => apiRequest('/content/shares'),

    // 获取知识库
    getDocs: (category) => apiRequest(`/docs?category=${category}`),

    // 点赞
    likeContent: (type, id) => apiRequest(`/content/${type}/${id}/like`, {
        method: 'POST'
    }),

    // 提交讨论
    submitDiscussion: (data) => apiRequest('/content/discussions', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // 提交文章
    submitArticle: (data) => apiRequest('/content/articles', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // 提交分享
    submitShare: (data) => apiRequest('/content/shares', {
        method: 'POST',
        body: JSON.stringify(data)
    })
};

/**
 * AI 相关 API
 */
const AIAPI = {
    // 聊天
    chat: (message, history) => apiRequest('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message, history })
    }),

    // 代币分析 - 使用 GET 请求
    analyzeToken: (address) => apiRequest(`/ai/token-analyze?address=${address}&chain=bsc`),

    // 钱包诊断 - 使用 GET 请求
    diagnoseWallet: (address) => apiRequest(`/ai/wallet-diagnose?address=${address}&chain=bsc`),

    // 通用分析
    analyze: (content, type) => apiRequest('/ai/analyze', {
        method: 'POST',
        body: JSON.stringify({ content, type })
    })
};

/**
 * Binance Web3 API
 */
const BinanceAPI = {
    // 搜索代币
    searchTokens: (keyword, chainId) => apiRequest(`/binance/token/search?keyword=${encodeURIComponent(keyword)}&chainId=${chainId}`),

    // 获取代币元数据
    getTokenMetadata: (chainId, address) => apiRequest(`/binance/token/detail?chainId=${chainId}&address=${address}`),

    // 获取代币动态
    getTokenDynamic: (chainId, address) => apiRequest(`/binance/token/detail?chainId=${chainId}&address=${address}`),

    // 审计代币
    auditToken: (chainId, address) => apiRequest(`/binance/token/audit?chainId=${chainId}&address=${address}`),

    // 获取钱包持仓
    getWalletHoldings: (address, chainId) => apiRequest(`/binance/wallet/tokens?address=${address}&chainId=${chainId}`),

    // 聪明钱信号
    getSmartMoneySignals: (chainId) => apiRequest(`/binance/signals/smart-money?chainId=${chainId}`),

    // 市场排行
    getMarketRank: (chainId) => apiRequest(`/binance/market/rank?chainId=${chainId}`),

    // 技能概览
    getSkillsOverview: () => apiRequest('/binance/skills')
};

/**
 * 功能建议 API
 */
const FeatureAPI = {
    // 获取建议列表
    getFeatures: () => apiRequest('/features/requests'),

    // 投票
    vote: (id) => apiRequest(`/features/requests/${id}/vote`, {
        method: 'POST'
    }),

    // 提交建议
    submitFeature: (data) => apiRequest('/features/requests', {
        method: 'POST',
        body: JSON.stringify(data)
    })
};

/**
 * 监控 API
 */
const MonitorAPI = {
    // 获取监控列表
    getMonitors: () => apiRequest('/monitor/monitors'),

    // 创建监控
    createMonitor: (data) => apiRequest('/monitor/monitors', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // 删除监控
    deleteMonitor: (id) => apiRequest(`/monitor/monitors/${id}`, {
        method: 'DELETE'
    }),

    // 获取监控活动
    getActivities: (id) => apiRequest(`/monitor/monitors/${id}/activities`)
};

/**
 * 巨鲸 API
 */
const WhaleAPI = {
    // 获取巨鲸列表
    getWhales: () => apiRequest('/whale/whales'),

    // 添加巨鲸
    addWhale: (data) => apiRequest('/whale/whales', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // 删除巨鲸
    deleteWhale: (address) => apiRequest(`/whale/whales/${address}`, {
        method: 'DELETE'
    }),

    // 创建提醒
    createAlert: (data) => apiRequest('/whale/alerts', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // 获取用户提醒
    getUserAlerts: () => apiRequest('/whale/alerts'),

    // 删除提醒
    deleteAlert: (id) => apiRequest(`/whale/alerts/${id}`, {
        method: 'DELETE'
    }),

    // 获取巨鲸交易
    getWhaleTransactions: (address, limit = 50) => apiRequest(`/whale/transactions?address=${address}&limit=${limit}`)
};

// 导出所有 API
window.API = {
    Auth: AuthAPI,
    Content: ContentAPI,
    AI: AIAPI,
    Binance: BinanceAPI,
    Feature: FeatureAPI,
    Monitor: MonitorAPI,
    Whale: WhaleAPI
};
