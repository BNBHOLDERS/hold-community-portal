/**
 * HOLD 社区门户 - 工具函数
 */

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

// ========== HTML 转义 ==========
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== 分类名称 ==========
function getCategoryName(category) {
    const names = {
        // 讨论分类
        'security': '安全',
        'analysis': '分析',
        'trading': '交易',
        // 文章分类
        'tutorial': '教程',
        'news': '资讯',
        // 分享分类
        'tools': '工具',
        'docs': '文档',
        'airdrop': '空投'
    };
    return names[category] || '全部';
}

// ========== 分类图标 ==========
function getCategoryIcon(category) {
    const icons = {
        'tools': '<i class="fa fa-wrench"></i>',
        'docs': '<i class="fa fa-file-text-o"></i>',
        'airdrop': '<i class="fa fa-gift"></i>',
        'default': '<i class="fa fa-link"></i>'
    };
    return icons[category] || icons['default'];
}

// ========== 类型颜色 ==========
function getTypeColor(type) {
    const colors = {
        'article': 'bg-blue-100 text-blue-600',
        'share': 'bg-green-100 text-green-600',
        'discussion': 'bg-orange-100 text-orange-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
}

// ========== Toast 通知 ==========
function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========== Modal 模态框 ==========
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    const inputs = modal?.querySelectorAll('input, textarea');
    inputs?.forEach(input => {
        if (input.type !== 'checkbox' && input.type !== 'radio') {
            input.value = '';
        }
    });
}

function closeAllModals() {
    document.querySelectorAll('[id$="Modal"]').forEach(modal => {
        modal.classList.add('hidden');
    });
    document.body.style.overflow = '';
}

// ========== 按钮加载状态 ==========
function setButtonLoading(btn, loading, originalText = '') {
    if (loading) {
        btn.dataset.originalText = btn.innerText;
        btn.classList.add('btn-loading');
        btn.disabled = true;
    } else {
        btn.classList.remove('btn-loading');
        btn.disabled = false;
        btn.innerText = btn.dataset.originalText || originalText;
    }
}

// ========== 加载状态 ==========
function showLoading(container, message = '加载中...') {
    if (!container) return;
    container.innerHTML = `
        <div class="text-center py-12">
            <div class="loading-dots mb-2">
                <span>●</span><span>●</span><span>●</span>
            </div>
            <p class="text-sm text-gray-400">${message}</p>
        </div>
    `;
}

function showSkeleton(container, count = 3) {
    if (!container) return;
    const skeletonHTML = Array(count).fill(`
        <div class="glass-card rounded-xl p-4">
            <div class="skeleton h-4 w-3/4 mb-3"></div>
            <div class="skeleton h-3 w-1/2"></div>
        </div>
    `).join('');
    container.innerHTML = skeletonHTML;
}

function showEmpty(container, message = '暂无数据', icon = 'fa-inbox') {
    if (!container) return;
    container.innerHTML = `
        <div class="text-center text-gray-400 py-12">
            <i class="fa ${icon} text-4xl mb-3 opacity-50"></i>
            <p>${message}</p>
        </div>
    `;
}

function showError(container, message = '加载失败') {
    if (!container) return;
    container.innerHTML = `
        <div class="text-center text-red-400 py-12">
            <i class="fa fa-exclamation-circle text-4xl mb-3 opacity-50"></i>
            <p>${message}</p>
        </div>
    `;
}

// ========== 价格滚动条 ==========
const tickerSymbols = [
    { symbol: 'BTC', pair: 'BTCUSDT' },
    { symbol: 'ETH', pair: 'ETHUSDT' },
    { symbol: 'BNB', pair: 'BNBUSDT' },
    { symbol: 'SOL', pair: 'SOLUSDT' },
    { symbol: 'DOGE', pair: 'DOGEUSDT' }
];

let priceData = {};
let pricePollingInterval = null;

function initPriceTicker() {
    updatePrices();
    startPollingPrices();
}

async function updatePrices() {
    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=[' +
            tickerSymbols.map(s => `"${s.pair.toUpperCase()}"`).join(',') + ']');
        const data = await response.json();
        data.forEach(ticker => {
            const symbol = ticker.symbol.replace('USDT', '');
            priceData[symbol] = {
                price: parseFloat(ticker.lastPrice).toFixed(2),
                change: parseFloat(ticker.priceChangePercent).toFixed(2)
            };
        });
        updateTickerDisplay();
    } catch {
        // 使用模拟数据
        const mockPrices = { 'BTC': 67234, 'ETH': 3456, 'BNB': 587, 'SOL': 142, 'DOGE': 0.12 };
        Object.keys(mockPrices).forEach(symbol => {
            priceData[symbol] = {
                price: mockPrices[symbol],
                change: (Math.random() * 6 - 3).toFixed(2)
            };
        });
        updateTickerDisplay();
    }
}

function startPollingPrices() {
    if (pricePollingInterval) clearInterval(pricePollingInterval);
    pricePollingInterval = setInterval(updatePrices, 5000);
}

function updateTickerDisplay() {
    const container = document.getElementById('tickerContent');
    if (!container) return;

    let html = '';
    [1, 2].forEach(() => {
        tickerSymbols.forEach(item => {
            const data = priceData[item.symbol];
            if (data) {
                const changeClass = parseFloat(data.change) >= 0 ? 'price-up' : 'price-down';
                const changeIcon = parseFloat(data.change) >= 0 ? '▲' : '▼';
                html += `
                    <div class="price-item">
                        <span class="font-medium">${item.symbol}</span>
                        <span>$${data.price}</span>
                        <span class="${changeClass}">${changeIcon} ${Math.abs(data.change)}%</span>
                    </div>
                `;
            }
        });
    });

    container.innerHTML = html;
    container.classList.add('animate-ticker');
}

// ========== 导出工具模块 ==========
window.Utils = {
    timeAgo,
    formatNumber,
    escapeHtml,
    getCategoryName,
    getCategoryIcon,
    getTypeColor,
    showToast,
    openModal,
    closeModal,
    closeAllModals,
    setButtonLoading,
    showLoading,
    showSkeleton,
    showEmpty,
    showError,
    initPriceTicker,
    updatePrices,
    startPollingPrices,
    updateTickerDisplay
};

// 同时兼容旧的 window.UI 和 window.AppConfig
window.UI = window.UI || {};
window.UI.showToast = showToast;
window.UI.openModal = openModal;
window.UI.closeModal = closeModal;
window.UI.closeAllModals = closeAllModals;
window.UI.setButtonLoading = setButtonLoading;
window.UI.showLoading = showLoading;
window.UI.showSkeleton = showSkeleton;
window.UI.showEmpty = showEmpty;
window.UI.showError = showError;
window.UI.escapeHtml = escapeHtml;
window.UI.getCategoryName = getCategoryName;
window.UI.getCategoryIcon = getCategoryIcon;
window.UI.getTypeColor = getTypeColor;
window.UI.toggleUserMenu = window.UI.toggleUserMenu || function() {
    const menu = document.getElementById('userMenu');
    if (menu) menu.classList.toggle('hidden');
};

window.AppConfig = window.AppConfig || {};
window.AppConfig.timeAgo = timeAgo;
window.AppConfig.formatNumber = formatNumber;
