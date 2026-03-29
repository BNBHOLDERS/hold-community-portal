/**
 * HOLD 社区门户 - API 调用封装
 */

const API_BASE = '/api';

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
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
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
    getDocs: (category) => apiRequest(`/content/docs?category=${category}`),

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

    // 代币分析
    analyzeToken: (data) => apiRequest('/ai/analyze-token', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // 钱包诊断
    diagnoseWallet: (data) => apiRequest('/ai/diagnose-wallet', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // RUG 检测
    checkHoneypot: (data) => apiRequest('/ai/check-honeypot', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // 持仓分析
    analyzeHolders: (data) => apiRequest('/ai/analyze-holders', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // 交易建议
    tradingAdvice: (data) => apiRequest('/ai/trading-advice', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // 安全评分
    safetyScore: (data) => apiRequest('/ai/safety-score', {
        method: 'POST',
        body: JSON.stringify(data)
    })
};

/**
 * Binance Web3 API
 */
const BinanceAPI = {
    // 搜索代币
    searchTokens: (keyword, chainId) => apiRequest('/binance/search-tokens', {
        method: 'POST',
        body: JSON.stringify({ keyword, chainId })
    }),

    // 获取代币元数据
    getTokenMetadata: (chainId, address) => apiRequest('/binance/token-metadata', {
        method: 'POST',
        body: JSON.stringify({ chainId, address })
    }),

    // 获取代币动态
    getTokenDynamic: (chainId, address) => apiRequest('/binance/token-dynamic', {
        method: 'POST',
        body: JSON.stringify({ chainId, address })
    }),

    // 审计代币
    auditToken: (chainId, address) => apiRequest('/binance/audit-token', {
        method: 'POST',
        body: JSON.stringify({ chainId, address })
    }),

    // 获取钱包持仓
    getWalletHoldings: (address, chainId) => apiRequest('/binance/wallet-holdings', {
        method: 'POST',
        body: JSON.stringify({ address, chainId })
    }),

    // 聪明钱信号
    getSmartMoneySignals: (chainId) => apiRequest('/binance/smart-money-signals', {
        method: 'POST',
        body: JSON.stringify({ chainId })
    }),

    // 市场排行
    getMarketRank: (chainId) => apiRequest('/binance/market-rank', {
        method: 'POST',
        body: JSON.stringify({ chainId })
    })
};

/**
 * 功能建议 API
 */
const FeatureAPI = {
    // 获取建议列表
    getFeatures: () => apiRequest('/features'),

    // 投票
    vote: (id) => apiRequest(`/features/${id}/vote`, {
        method: 'POST'
    }),

    // 提交建议
    submitFeature: (data) => apiRequest('/features', {
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
    getWhaleTransactions: (address) => apiRequest(`/whale/whales/${address}/transactions`)
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
