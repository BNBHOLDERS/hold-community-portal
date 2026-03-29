/**
 * HOLD 社区门户 - 主入口文件
 * 路由、页面切换、初始化
 */

// ========== 路由配置 ==========
const routes = {
    'home': { render: renderHome },
    'discuss': { render: renderDiscuss },
    'submit': { render: renderSubmit },
    'share': { render: renderShare },
    'trending': { render: renderTrending },
    'monitor': { render: renderMonitor },
    'whale': { render: renderWhale },
    'features': { render: renderFeatures },
    'ai': { render: renderAI },
    'binance': { render: renderBinance },
    'docs': { render: renderDocs }
};

let currentPage = 'home';

/**
 * 页面导航
 */
function navigateTo(page) {
    // 隐藏当前页面
    const currentPageEl = document.querySelector('.page.active');
    if (currentPageEl) {
        currentPageEl.classList.remove('active');
    }

    // 更新导航状态
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        }
    });

    // 显示新页面
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // 渲染页面内容
    if (routes[page]) {
        routes[page].render();
    }

    currentPage = page;

    // 更新 URL hash
    window.location.hash = page;

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 处理浏览器后退
 */
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1) || 'home';
    navigateTo(hash);
});

/**
 * 初始化路由
 */
function initRouter() {
    const hash = window.location.hash.slice(1) || 'home';
    navigateTo(hash);
}

/**
 * 渲染首页
 */
async function renderHome() {
    const container = document.getElementById('homeLatest');
    if (!container) return;

    showLoading(container, '加载最新动态...');

    try {
        // 并行加载各类型内容
        const [discussions, articles, shares] = await Promise.all([
            window.API.Content.getDiscussions('all'),
            window.API.Content.getArticles(),
            window.API.Content.getShares()
        ]);

        const items = [
            ...discussions.data.slice(0, 3).map(item => ({ ...item, type: '讨论', icon: 'fa-comments' })),
            ...articles.data.slice(0, 3).map(item => ({ ...item, type: '投稿', icon: 'fa-file-text' })),
            ...shares.data.slice(0, 3).map(item => ({ ...item, type: '分享', icon: 'fa-share-alt' }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        container.innerHTML = items.map((item, i) => `
            <div class="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 rounded-lg px-3 -mx-3 transition" onclick="navigateTo('${item.type === '讨论' ? 'discuss' : item.type === '投稿' ? 'submit' : 'share'}')">
                <div class="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <i class="fa ${item.icon} text-[#F3BA2F] text-xs"></i>
                </div>
                <span class="tag px-2 py-0.5 rounded-full text-xs">${item.type}</span>
                <span class="flex-1 text-sm truncate">${window.UI.escapeHtml(item.title)}</span>
                <span class="text-xs text-gray-400">${window.AppConfig.timeAgo(item.createdAt)}</span>
            </div>
        `).join('');

    } catch (error) {
        container.innerHTML = '<div class="text-center text-gray-400 py-8 text-sm">加载失败</div>';
    }
}

/**
 * 渲染讨论区
 */
async function renderDiscuss() {
    const container = document.getElementById('discussList');
    if (!container) return;

    showLoading(container);

    try {
        const data = await window.API.Content.getDiscussions('all');
        const list = data.data || [];

        if (list.length === 0) {
            window.UI.showEmpty(container, '暂无讨论，来发起第一条吧！');
            return;
        }

        container.innerHTML = list.map((item, i) => `
            <div class="glass-card rounded-2xl p-5 cursor-pointer card-enter" style="animation-delay: ${i * 0.1}s" onclick="viewDiscussion('${item.id}')">
                <div class="flex items-start gap-4">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        ${(window.UI.escapeHtml(item.author || '匿名'))[0]}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-semibold text-base mb-1">${window.UI.escapeHtml(item.title || '无标题')}</h4>
                        <p class="text-sm text-gray-500 mb-3 line-clamp-2">${window.UI.escapeHtml(item.content || '')}</p>
                        <div class="flex items-center gap-4 text-xs text-gray-400">
                            <span>${window.UI.escapeHtml(item.author || '匿名')}</span>
                            <span>·</span>
                            <span>${window.AppConfig.timeAgo(item.createdAt)}</span>
                            <span>·</span>
                            <span><i class="fa fa-comment-o mr-1"></i>${item.replies?.length || 0} 回复</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        window.UI.showError(container);
    }
}

/**
 * 渲染投稿区
 */
async function renderSubmit() {
    const container = document.getElementById('articleList');
    if (!container) return;

    showLoading(container);

    try {
        const data = await window.API.Content.getArticles();
        const list = data.data || [];

        if (list.length === 0) {
            window.UI.showEmpty(container, '暂无文章，来投稿第一篇吧！');
            return;
        }

        container.innerHTML = list.map((item, i) => `
            <div class="glass-card rounded-2xl p-6 cursor-pointer card-enter" style="animation-delay: ${i * 0.1}s" onclick="viewArticle('${item.id}')">
                <h4 class="font-semibold text-lg mb-2">${window.UI.escapeHtml(item.title || '无标题')}</h4>
                <p class="text-sm text-gray-500 mb-4 line-clamp-2">${window.UI.escapeHtml(item.summary || item.content?.slice(0, 100) || '')}</p>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3 text-xs text-gray-400">
                        <span>${window.UI.escapeHtml(item.author || '匿名作者')}</span>
                        <span>·</span>
                        <span>${window.AppConfig.timeAgo(item.createdAt)}</span>
                    </div>
                    <button class="like-btn flex items-center gap-1 text-gray-400 hover:text-[#F3BA2F] transition text-sm" onclick="event.stopPropagation();likeContent('articles', '${item.id}', this)">
                        <i class="fa fa-heart-o"></i>
                        <span>${item.likes || 0}</span>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        window.UI.showError(container);
    }
}

/**
 * 渲染分享区
 */
async function renderShare() {
    const container = document.getElementById('shareList');
    if (!container) return;

    showLoading(container);

    try {
        const data = await window.Content.getShares();
        const list = data.data || [];

        if (list.length === 0) {
            window.UI.showEmpty(container, '暂无分享，来分享第一个吧！');
            return;
        }

        container.innerHTML = list.map((item, i) => `
            <div class="glass-card rounded-xl p-4 cursor-pointer card-enter" style="animation-delay: ${i * 0.05}s" onclick="window.open('${window.UI.escapeHtml(item.url).replace(/'/g, "\\'")}', '_blank')">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                        ${window.UI.getCategoryIcon(item.category)}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-medium text-sm truncate">${window.UI.escapeHtml(item.title || '无标题')}</h4>
                        <p class="text-xs text-gray-500 truncate">${window.UI.escapeHtml(item.url || '')}</p>
                    </div>
                    <button class="like-btn flex items-center gap-1 text-gray-400 hover:text-[#F3BA2F] transition text-sm" onclick="event.stopPropagation();likeContent('shares', '${item.id}', this)">
                        <i class="fa fa-heart-o"></i>
                        <span>${item.likes || 0}</span>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        window.UI.showError(container);
    }
}

/**
 * 渲染排行榜（占位）
 */
function renderTrending() {
    // 待实现
}

/**
 * 渲染监控（占位）
 */
function renderMonitor() {
    // 待实现
}

/**
 * 渲染巨鲸（占位）
 */
function renderWhale() {
    // 待实现
}

/**
 * 渲染功能建议
 */
async function renderFeatures() {
    const container = document.getElementById('featuresList');
    if (!container) return;

    showLoading(container);

    try {
        const data = await window.API.Feature.getFeatures();
        const list = data.data || [];

        if (list.length === 0) {
            window.UI.showEmpty(container, '暂无建议', 'fa-lightbulb-o');
            return;
        }

        container.innerHTML = list.map((item, i) => `
            <div class="glass-card rounded-xl p-4 flex items-center gap-4 card-enter" style="animation-delay: ${i * 0.05}s">
                <div class="w-10 h-10 flex items-center justify-center text-lg font-bold text-[#F3BA2F]">
                    ${window.AppConfig.formatNumber(item.votes || 0)}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-xs px-2 py-0.5 rounded-full ${window.UI.getTypeColor(item.type)}">${item.typeName || '建议'}</span>
                        <h3 class="font-medium text-sm truncate">${window.UI.escapeHtml(item.title)}</h3>
                    </div>
                    <p class="text-xs text-gray-500 line-clamp-2">${window.UI.escapeHtml(item.description || '')}</p>
                </div>
                <button onclick="voteForFeature('${item.id}', this)" class="px-3 py-1 text-xs rounded-lg bg-gray-100 hover:bg-[#F3BA2F] hover:text-white transition">
                    <i class="fa fa-thumbs-up"></i> 投票
                </button>
            </div>
        `).join('');
    } catch (error) {
        window.UI.showError(container);
    }
}

/**
 * 渲染 AI 工具
 */
function renderAI() {
    // AI 工具页面内容在模态框中处理
}

/**
 * 渲染 Binance Web3
 */
function renderBinance() {
    // Binance 页面内容在模态框中处理
}

/**
 * 渲染文档
 */
async function renderDocs() {
    const container = document.getElementById('docsContent');
    if (!container) return;

    showLoading(container);

    try {
        const data = await window.API.Content.getDocs('all');
        const docs = data.data || [];

        if (docs.length === 0) {
            window.UI.showEmpty(container, '暂无文档', 'fa-book');
            return;
        }

        // 按分类分组
        const grouped = {};
        docs.forEach(doc => {
            const cat = doc.category || 'other';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(doc);
        });

        let html = '';
        for (const [category, items] of Object.entries(grouped)) {
            html += `
                <div class="mb-6">
                    <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <i class="fa fa-folder text-[#F3BA2F]"></i>
                        ${window.UI.getCategoryName(category)}
                    </h3>
                    <div class="space-y-2">
                        ${items.map(doc => `
                            <div class="glass-card rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition" onclick="viewDoc('${doc.id}')">
                                <h4 class="font-medium text-sm">${window.UI.escapeHtml(doc.title)}</h4>
                                <p class="text-xs text-gray-500 mt-1">${window.UI.escapeHtml(doc.summary || '')}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    } catch (error) {
        window.UI.showError(container);
    }
}

/**
 * 点赞内容
 */
async function likeContent(type, id, btn) {
    try {
        const result = await window.API.Content.like(type, id);
        if (result.success) {
            // 更新点赞数
            const countSpan = btn.querySelector('span');
            if (countSpan) {
                const currentCount = parseInt(countSpan.textContent) || 0;
                countSpan.textContent = currentCount + 1;
            }
            // 更新按钮状态
            btn.classList.add('liked');
            btn.querySelector('i').className = 'fa fa-heart';
            window.UI.showToast('点赞成功', 'success');
        }
    } catch (error) {
        window.UI.showToast('点赞失败', 'error');
    }
}

/**
 * 功能建议投票
 */
async function voteForFeature(id, btn) {
    try {
        const result = await window.API.Feature.vote(id);
        if (result.success) {
            // 更新投票数
            const voteCount = btn.querySelector('.font-bold');
            if (voteCount) {
                const current = parseInt(voteCount.textContent) || 0;
                voteCount.textContent = current + 1;
            }
            btn.disabled = true;
            btn.classList.add('bg-[#F3BA2F]', 'text-white');
            window.UI.showToast('投票成功', 'success');
        }
    } catch (error) {
        window.UI.showToast('投票失败', 'error');
    }
}

/**
 * 查看讨论详情
 */
function viewDiscussion(id) {
    // TODO: 实现详情页
    window.UI.showToast('详情页开发中...', 'info');
}

/**
 * 查看文章详情
 */
function viewArticle(id) {
    // TODO: 实现详情页
    window.UI.showToast('详情页开发中...', 'info');
}

/**
 * 查看文档
 */
function viewDoc(id) {
    // TODO: 实现文档详情页
    window.UI.showToast('文档详情开发中...', 'info');
}

/**
 * 切换移动端菜单
 */
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.classList.toggle('open');
    }
}

/**
 * 切换 AI 聊天窗口
 */
function toggleAIChat() {
    const chatWindow = document.getElementById('aiChatWindow');
    const fab = document.getElementById('aiFab');
    if (chatWindow && fab) {
        chatWindow.classList.toggle('open');
        fab.classList.toggle('hidden');
    }
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', async () => {
    // 初始化认证
    await window.Auth.init();

    // 初始化路由
    initRouter();

    console.log('HOLD 社区门户已加载');
});
