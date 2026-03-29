/**
 * HOLD 社区门户 - 配置文件
 * API 地址、常量、配置项
 */

// ========== API 配置 ==========
const API_BASE = '/api';
const WS_URL = `ws://${window.location.host}`;

// ========== 分类配置 ==========
const CATEGORIES = {
    discussion: [
        { id: 'all', name: '全部', icon: 'fa-list' },
        { id: 'security', name: '安全', icon: 'fa-shield' },
        { id: 'analysis', name: '分析', icon: 'fa-chart-line' },
        { id: 'trading', name: '交易', icon: 'fa-exchange' }
    ],
    article: [
        { id: 'all', name: '全部', icon: 'fa-list' },
        { id: 'tutorial', name: '教程', icon: 'fa-book' },
        { id: 'news', name: '资讯', icon: 'fa-newspaper-o' }
    ],
    share: [
        { id: 'all', name: '全部', icon: 'fa-list' },
        { id: 'tools', name: '工具', icon: 'fa-wrench' },
        { id: 'docs', name: '文档', icon: 'fa-file-text-o' },
        { id: 'airdrop', name: '空投', icon: 'fa-gift' }
    ]
};

// ========== AI 工具配置 ==========
const AI_TOOLS = [
    { id: 'tokenAnalysis', name: '代币分析', icon: 'fa-chart-line', desc: 'AI 驱动的代币分析' },
    { id: 'walletDiagnosis', name: '钱包诊断', icon: 'fa-wallet', desc: '钱包行为分析' },
    { id: 'honeypotCheck', name: 'RUG 检测', icon: 'fa-shield', desc: '蜜罐与骗局识别' },
    { id: 'holderAnalysis', name: '持仓分析', icon: 'fa-users', desc: '持仓分布分析' },
    { id: 'tradingHelper', name: '交易助手', icon: 'fa-line-chart', desc: '买卖时机建议' },
    { id: 'safetyScore', name: '安全评分', icon: 'fa-lock', desc: '合约安全评分' },
    { id: 'beginnerGuide', name: '新手指引', icon: 'fa-graduation-cap', desc: '新手学习路径' },
    { id: 'mindsetGuide', name: '心态修炼', icon: 'fa-heart', desc: '交易心理指导' }
];

// ========== Binance Web3 配置 ==========
const BINANCE_CHAINS = [
    { id: '56', name: 'BSC', icon: 'fa-circle' },
    { id: '8453', name: 'Base', icon: 'fa-circle-o' },
    { id: 'CT_501', name: 'Solana', icon: 'fa-circle' }
];

// ========== 状态映射 ==========
const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-600',
    evaluating: 'bg-blue-100 text-blue-600',
    approved: 'bg-green-100 text-green-600',
    rejected: 'bg-red-100 text-red-600'
};

const STATUS_TEXT = {
    pending: '待评估',
    evaluating: '评估中',
    approved: '已发布',
    rejected: '已拒绝'
};

// ========== 时间格式化 ==========
function timeAgo(date) {
    if (!date) return '';
    const now = new Date();
    const past = new Date(date);
    const diff = now - past;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return past.toLocaleDateString('zh-CN');
}

// ========== 数字格式化 ==========
function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// ========== 导出配置 ==========
window.AppConfig = {
    API_BASE,
    WS_URL,
    CATEGORIES,
    AI_TOOLS,
    BINANCE_CHAINS,
    STATUS_COLORS,
    STATUS_TEXT,
    timeAgo,
    formatNumber
};
