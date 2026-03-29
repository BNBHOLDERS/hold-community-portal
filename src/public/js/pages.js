/**
 * HOLD 社区门户 - 页面渲染与交互
 */

// ========== 全局变量 ==========
let currentPage = 'home';
let currentTag = 'all';
let currentShareCategory = 'all';
let chatHistory = [];
let articlesData = [];

// ========== 页面数据加载 ==========
async function loadContent(type, params = {}) {
    const container = document.getElementById(type + 'Content');
    if (!container) return;

    container.innerHTML = '<div class="text-center py-8"><div class="loading-dots"><span>●</span><span>●</span><span>●</span></div></div>';

    try {
        const response = await fetch(`/api/content/${type}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to load content:', error);
        return null;
    }
}

function loadPageData(page, params = {}) {
    switch(page) {
        case 'home':
            renderHomeLatest();
            break;
        case 'discuss':
            renderDiscussions();
            break;
        case 'submit':
            renderArticles();
            break;
        case 'share':
            renderShares();
            break;
        case 'trending':
            renderTrending();
            break;
        case 'features':
            renderFeatures();
            break;
    }
}

// ========== 首页最新动态 ==========
function renderHomeLatest() {
    const container = document.getElementById('homeLatest');
    if (!container) return;

    // 模拟数据加载
    const items = [
        { type: '讨论', icon: 'fa-comments', title: '如何识别 BSC 链上的假代币？', author: 'CryptoMaster', time: '2小时前' },
        { type: '投稿', icon: 'fa-file-text', title: 'BscScan 使用完全指南', author: '链上分析师', time: '5小时前' },
        { type: '分享', icon: 'fa-share-alt', title: '实用的合约审计工具集合', author: 'SecurityFirst', time: '1天前' }
    ];

    container.innerHTML = items.map(item => `
        <div class="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 rounded-lg px-3 -mx-3 transition">
            <div class="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <i class="fa ${item.icon} text-[#F3BA2F] text-xs"></i>
            </div>
            <span class="tag px-2 py-0.5 rounded-full text-xs">${item.type}</span>
            <span class="flex-1 text-sm truncate">${window.UI.escapeHtml(item.title)}</span>
            <span class="text-xs text-gray-400">${item.time}</span>
        </div>
    `).join('');
}

// ========== 讨论区渲染 ==========
async function renderDiscussions() {
    const container = document.getElementById('discussList');
    if (!container) return;

    container.innerHTML = '<div class="text-center py-8"><div class="loading-dots"><span>●</span><span>●</span><span>●</span></div></div>';

    try {
        const response = await fetch('/api/content/discussions?category=' + currentTag);
        const data = await response.json();
        const discussions = data.data || [];

        if (discussions.length === 0) {
            container.innerHTML = '<div class="text-center text-gray-400 py-12"><i class="fa fa-inbox text-4xl mb-3 opacity-50"></i><p>暂无讨论</p></div>';
            return;
        }

        container.innerHTML = discussions.map((item, i) => `
            <div class="glass-card rounded-2xl p-5 cursor-pointer card-enter" style="animation-delay: ${i * 0.1}s" onclick="viewDiscussion('${item.id}')">
                <div class="flex items-start gap-4">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        ${(window.UI?.escapeHtml(item.author) || '匿')[0]}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-semibold text-base mb-1">${window.UI?.escapeHtml(item.title) || '无标题'}</h4>
                        <p class="text-sm text-gray-500 mb-3 line-clamp-2">${window.UI?.escapeHtml(item.content) || ''}</p>
                        <div class="flex items-center gap-4 text-xs text-gray-400">
                            <span>${window.UI?.escapeHtml(item.author) || '匿名'}</span>
                            <span>·</span>
                            <span>${window.AppConfig?.timeAgo(item.createdAt) || '刚刚'}</span>
                            <span>·</span>
                            <span><i class="fa fa-comment-o mr-1"></i>${item.replies?.length || 0} 回复</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="text-center text-red-400 py-12"><i class="fa fa-exclamation-circle text-4xl mb-3 opacity-50"></i><p>加载失败</p></div>';
    }
}

function viewDiscussion(id) {
    // TODO: 实现详情页
    window.UI?.showToast('详情页开发中...', 'info');
}

// ========== 文章区渲染 ==========
async function renderArticles() {
    const container = document.getElementById('articleList');
    if (!container) return;

    container.innerHTML = '<div class="text-center py-8"><div class="loading-dots"><span>●</span><span>●</span><span>●</span></div></div>';

    try {
        const response = await fetch('/api/content/articles');
        const data = await response.json();
        const articles = data.data || [];

        if (articles.length === 0) {
            container.innerHTML = '<div class="text-center text-gray-400 py-12"><i class="fa fa-inbox text-4xl mb-3 opacity-50"></i><p>暂无文章</p></div>';
            return;
        }

        articlesData = articles;
        container.innerHTML = articles.map((item, i) => `
            <div class="glass-card rounded-2xl p-6 cursor-pointer card-enter" style="animation-delay: ${i * 0.1}s" onclick="viewArticle('${item.id}')">
                <h4 class="font-semibold text-lg mb-2">${window.UI?.escapeHtml(item.title) || '无标题'}</h4>
                <p class="text-sm text-gray-500 mb-4 line-clamp-2">${window.UI?.escapeHtml(item.summary || item.content?.slice(0, 100)) || ''}</p>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3 text-xs text-gray-400">
                        <span>${window.UI?.escapeHtml(item.author) || '匿名作者'}</span>
                        <span>·</span>
                        <span>${window.AppConfig?.timeAgo(item.createdAt) || '刚刚'}</span>
                    </div>
                    <button class="like-btn flex items-center gap-1 text-gray-400 hover:text-[#F3BA2F] transition text-sm" onclick="event.stopPropagation();likeContent('articles', '${item.id}', this)">
                        <i class="fa fa-heart-o"></i>
                        <span>${item.likes || 0}</span>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="text-center text-red-400 py-12"><i class="fa fa-exclamation-circle text-4xl mb-3 opacity-50"></i><p>加载失败</p></div>';
    }
}

function viewArticle(id) {
    const article = articlesData.find(a => a.id === id);
    if (!article) return;

    window.location.hash = 'article-detail';
    // TODO: 显示文章详情
}

async function renderArticleDetail(id) {
    // TODO: 实现文章详情页
}

// ========== 分享区渲染 ==========
async function renderShares() {
    const container = document.getElementById('shareList');
    if (!container) return;

    container.innerHTML = '<div class="text-center py-8"><div class="loading-dots"><span>●</span><span>●</span><span>●</span></div></div>';

    try {
        const response = await fetch('/api/content/shares');
        const data = await response.json();
        const shares = data.data || [];

        if (shares.length === 0) {
            container.innerHTML = '<div class="text-center text-gray-400 py-12"><i class="fa fa-inbox text-4xl mb-3 opacity-50"></i><p>暂无分享</p></div>';
            return;
        }

        container.innerHTML = shares.map((item, i) => `
            <div class="glass-card rounded-xl p-4 cursor-pointer card-enter" style="animation-delay: ${i * 0.05}s" onclick="window.open('${window.UI?.escapeHtml(item.url) || ''}', '_blank')">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                        ${window.UI?.getCategoryIcon(item.category) || '<i class="fa fa-link"></i>'}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-medium text-sm truncate">${window.UI?.escapeHtml(item.title) || '无标题'}</h4>
                        <p class="text-xs text-gray-500 truncate">${window.UI?.escapeHtml(item.url) || ''}</p>
                    </div>
                    <button class="like-btn flex items-center gap-1 text-gray-400 hover:text-[#F3BA2F] transition text-sm" onclick="event.stopPropagation();likeContent('shares', '${item.id}', this)">
                        <i class="fa fa-heart-o"></i>
                        <span>${item.likes || 0}</span>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="text-center text-red-400 py-12"><i class="fa fa-exclamation-circle text-4xl mb-3 opacity-50"></i><p>加载失败</p></div>';
    }
}

// ========== 排行榜渲染 ==========
function switchTrendingTab(tab) {
    document.querySelectorAll('.trending-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    renderTrending();
}

async function renderTrending() {
    const container = document.getElementById('trendingContent');
    if (!container) return;

    const activeTab = document.querySelector('.trending-tab.active')?.dataset.tab || 'hot';
    container.innerHTML = '<div class="text-center py-8"><div class="loading-dots"><span>●</span><span>●</span><span>●</span></div></div>';

    // 模拟数据
    const items = [
        { rank: 1, name: 'BTC', price: '$67,234', change: '+2.34%', volume: '1.2B' },
        { rank: 2, name: 'ETH', price: '$3,456', change: '+1.56%', volume: '890M' },
        { rank: 3, name: 'BNB', price: '$587', change: '-0.45%', volume: '234M' }
    ];

    container.innerHTML = items.map(item => `
        <div class="flex items-center gap-4 p-3 bg-white rounded-xl mb-2">
            <span class="w-8 h-8 flex items-center justify-center rounded-full ${item.rank <= 3 ? 'bg-[#F3BA2F] text-white' : 'bg-gray-100'} font-bold text-sm">${item.rank}</span>
            <div class="flex-1">
                <span class="font-medium">${item.name}</span>
            </div>
            <div class="text-right">
                <div class="font-medium">${item.price}</div>
                <div class="text-xs ${item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}">${item.change}</div>
            </div>
        </div>
    `).join('');
}

// ========== 功能建议渲染 ==========
async function renderFeatures() {
    const container = document.getElementById('featuresList');
    if (!container) return;

    container.innerHTML = '<div class="text-center py-8"><div class="loading-dots"><span>●</span><span>●</span><span>●</span></div></div>';

    try {
        const response = await fetch('/api/features');
        const data = await response.json();
        const features = data.data || [];

        if (features.length === 0) {
            container.innerHTML = '<div class="text-center text-gray-400 py-12"><i class="fa fa-inbox text-4xl mb-3 opacity-50"></i><p>暂无建议</p></div>';
            return;
        }

        container.innerHTML = features.map((item, i) => `
            <div class="glass-card rounded-xl p-4 flex items-center gap-4 card-enter" style="animation-delay: ${i * 0.05}s">
                <div class="w-10 h-10 flex items-center justify-center text-lg font-bold text-[#F3BA2F]">
                    ${window.AppConfig?.formatNumber(item.votes) || item.votes || 0}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-xs px-2 py-0.5 rounded-full ${window.UI?.getTypeColor(item.type) || 'bg-gray-100 text-gray-600'}">${item.typeName || '建议'}</span>
                        <h3 class="font-medium text-sm truncate">${window.UI?.escapeHtml(item.title) || ''}</h3>
                    </div>
                    <p class="text-xs text-gray-500 line-clamp-2">${window.UI?.escapeHtml(item.description) || ''}</p>
                </div>
                <button onclick="voteFeature('${item.id}', this)" class="px-3 py-1 text-xs rounded-lg bg-gray-100 hover:bg-[#F3BA2F] hover:text-white transition">
                    <i class="fa fa-thumbs-up"></i> 投票
                </button>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="text-center text-red-400 py-12"><i class="fa fa-exclamation-circle text-4xl mb-3 opacity-50"></i><p>加载失败</p></div>';
    }
}

function getStatusClass(status) {
    const classes = {
        pending: 'bg-yellow-100 text-yellow-600',
        evaluating: 'bg-blue-100 text-blue-600',
        approved: 'bg-green-100 text-green-600',
        rejected: 'bg-red-100 text-red-600'
    };
    return classes[status] || 'bg-gray-100 text-gray-600';
}

function getStatusText(status) {
    const texts = {
        pending: '待评估',
        evaluating: '评估中',
        approved: '已发布',
        rejected: '已拒绝'
    };
    return texts[status] || status;
}

function getCategoryText(category) {
    const texts = {
        feature: '新功能',
        bugfix: 'Bug修复',
        improvement: '改进建议',
        other: '其他'
    };
    return texts[category] || category;
}

async function voteFeature(id, btn) {
    try {
        const response = await fetch(`/api/features/${id}/vote`, { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            const voteCount = btn.parentElement.querySelector('.font-bold');
            if (voteCount) {
                const current = parseInt(voteCount.textContent) || 0;
                voteCount.textContent = current + 1;
            }
            btn.disabled = true;
            btn.classList.add('bg-[#F3BA2F]', 'text-white');
            window.UI?.showToast('投票成功', 'success');
        }
    } catch (error) {
        window.UI?.showToast('投票失败', 'error');
    }
}

function openFeatureModal() {
    window.UI?.openModal('featureModal');
}

function closeFeatureModal() {
    window.UI?.closeModal('featureModal');
}

// ========== 点赞功能 ==========
async function likeContent(type, id, btn) {
    try {
        const response = await fetch(`/api/content/${type}/${id}/like`, { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            const countSpan = btn.querySelector('span');
            if (countSpan) {
                const currentCount = parseInt(countSpan.textContent) || 0;
                countSpan.textContent = currentCount + 1;
            }
            btn.classList.add('liked');
            btn.querySelector('i').className = 'fa fa-heart';
            window.UI?.showToast('点赞成功', 'success');
        }
    } catch (error) {
        window.UI?.showToast('点赞失败', 'error');
    }
}

// ========== 讨论回复 ==========
async function submitReply() {
    const content = document.getElementById('replyContent')?.value;
    if (!content || !content.trim()) {
        window.UI?.showToast('请输入回复内容', 'warning');
        return;
    }

    // TODO: 提交回复到 API
    window.UI?.showToast('回复成功！');
}

// ========== 工具函数 ==========
function formatDocContent(content) {
    // 简单的 Markdown 格式化
    return content
        .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
        .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
        .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
}

function formatArticleContent(content) {
    return formatDocContent(content);
}

// ========== 用户界面函数 ==========
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.classList.toggle('open');
    }
}

function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

function renderProfile() {
    // TODO: 实现用户资料页
}

function openEditNickname() {
    // TODO: 打开昵称编辑模态框
}

function openAuthModal() {
    window.UI?.openModal('loginModal');
}

function closeAuthModal() {
    window.UI?.closeModal('loginModal');
}

function switchAuthTab(mode) {
    // 切换登录/注册标签
}

async function sendAuthCode() {
    // 发送验证码
}

async function submitAuth() {
    // 提交认证
}

async function logout() {
    // 登出
}

async function updateProfile(updates) {
    // 更新用户资料
}

// ========== 管理员功能 ==========
async function renderAdminDocs() {
    // TODO: 实现管理员文档管理
}

function openDocModal(slug = null) {
    // TODO: 打开文档编辑模态框
}

function closeDocModal() {
    // TODO: 关闭文档编辑模态框
}

function editDoc(slug) {
    // TODO: 编辑文档
}

async function submitDoc() {
    // TODO: 提交文档
}

async function deleteDoc(slug) {
    // TODO: 删除文档
}

// 导出页面模块
window.Pages = {
    loadContent,
    loadPageData,
    renderHomeLatest,
    renderDiscussions,
    renderArticles,
    renderShares,
    renderTrending,
    renderFeatures,
    viewDiscussion,
    viewArticle,
    switchTrendingTab,
    voteFeature,
    openFeatureModal,
    closeFeatureModal,
    likeContent,
    submitReply,
    formatDocContent,
    formatArticleContent,
    toggleMobileMenu,
    toggleUserMenu,
    renderProfile,
    openEditNickname,
    openAuthModal,
    closeAuthModal,
    switchAuthTab,
    sendAuthCode,
    submitAuth,
    logout,
    updateProfile,
    renderAdminDocs,
    openDocModal,
    closeDocModal,
    editDoc,
    submitDoc,
    deleteDoc
};
