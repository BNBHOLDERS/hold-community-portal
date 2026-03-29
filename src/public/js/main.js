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
    'docs': { render: renderDocs },
    'profile': { render: renderProfile },
    'admin-docs': { render: renderAdminDocs }
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

    window.UI?.showLoading(container, '加载最新动态...');

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

    window.UI?.showLoading(container);

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

    window.UI?.showLoading(container);

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
let currentShareCategory = 'all';

async function renderShare() {
    const container = document.getElementById('shareList');
    if (!container) return;

    window.UI?.showLoading(container);

    try {
        const data = await window.API.Content.getShares();
        let list = data.data || [];

        // 根据分类筛选
        if (currentShareCategory && currentShareCategory !== 'all') {
            list = list.filter(item => item.category === currentShareCategory);
        }

        if (list.length === 0) {
            window.UI.showEmpty(container, '该分类暂无分享，来分享第一个吧！');
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
 * 渲染排行榜
 */
let currentTrendingTab = 'content';

function renderTrending() {
    const container = document.getElementById('trendingList');
    if (!container) return;

    container.innerHTML = `
        <div class="text-center py-16">
            <div class="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center text-4xl mx-auto mb-4">🔥</div>
            <h3 class="text-xl font-bold text-gray-700 mb-2">热门排行榜</h3>
            <p class="text-gray-500 mb-6">此功能正在开发中</p>
            <p class="text-sm text-gray-400">后期将根据实时热门数据推送，敬请期待</p>
            <button onclick="navigateTo('features')" class="mt-6 px-6 py-2 rounded-full bg-[#F3BA2F] text-white text-sm hover:bg-[#d9a52d] transition">
                <i class="fa fa-lightbulb-o mr-2"></i>建议添加此功能
            </button>
        </div>
    `;
}

/**
 * 渲染监控
 */
async function renderMonitor() {
    const container = document.getElementById('monitorList');
    if (!container) return;

    window.UI?.showLoading(container);

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.UI?.showEmpty(container, '请先登录', 'fa-lock');
            return;
        }

        const data = await window.API.Monitor.getMonitors();
        const monitors = data.data || [];

        if (monitors.length === 0) {
            window.UI?.showEmpty(container, '暂无监控，点击上方"创建监控"添加', 'fa-eye');
            return;
        }

        container.innerHTML = monitors.map((item, i) => `
            <div class="glass-card rounded-xl p-4 card-enter" style="animation-delay: ${i * 0.05}s">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full ${item.active ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center">
                            <i class="fa ${item.type === 'token' ? 'fa-coins' : 'fa-wallet'} ${item.active ? 'text-green-500' : 'text-gray-400'}"></i>
                        </div>
                        <div>
                            <div class="font-medium text-sm">${window.UI?.escapeHtml(item.target) || '未知'}</div>
                            <div class="text-xs text-gray-500">${item.type === 'token' ? '代币' : '钱包'}</div>
                        </div>
                    </div>
                    <span class="text-xs px-2 py-1 rounded-full ${item.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}">
                        ${item.active ? '活跃' : '暂停'}
                    </span>
                </div>
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <span>创建于 ${window.AppConfig?.timeAgo(item.createdAt) || '刚刚'}</span>
                    <button onclick="deleteMonitor('${item.id}')" class="text-red-400 hover:text-red-500 transition">
                        <i class="fa fa-trash"></i> 删除
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        window.UI?.showEmpty(container, '加载失败，请重试', 'fa-exclamation-circle');
    }
}

/**
 * 删除监控
 */
async function deleteMonitor(id) {
    if (!confirm('确定要删除这个监控吗？')) return;

    try {
        await window.API.Monitor.deleteMonitor(id);
        window.UI?.showToast('删除成功', 'success');
        renderMonitor();
    } catch (error) {
        window.UI?.showToast('删除失败', 'error');
    }
}

/**
 * 渲染巨鲸追踪
 */
async function renderWhale() {
    const container = document.getElementById('whaleList');
    if (!container) return;

    const user = window.Auth?.getCurrentUser();
    if (!user) {
        container.innerHTML = `
            <div class="text-center py-16">
                <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-4xl mx-auto mb-4">🐋</div>
                <h3 class="text-xl font-bold text-gray-700 mb-2">巨鲸追踪</h3>
                <p class="text-gray-500 mb-6">此功能正在开发中</p>
                <p class="text-sm text-gray-400 mb-6">后期将提供实时巨鲸交易监控功能</p>
                <button onclick="window.Auth?.openLoginModal ? window.Auth.openLoginModal() : window.openAuthModal ? window.openAuthModal() : openAuthModal()" class="px-6 py-2 rounded-full bg-[#F3BA2F] text-white text-sm hover:bg-[#d9a52d] transition">
                    <i class="fa fa-sign-in mr-2"></i>先登录
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="text-center py-16">
            <div class="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-4xl mx-auto mb-4">🐋</div>
            <h3 class="text-xl font-bold text-gray-700 mb-2">巨鲸追踪</h3>
            <p class="text-gray-500 mb-6">此功能正在开发中</p>
            <p class="text-sm text-gray-400 mb-6">后期将提供实时巨鲸交易监控功能，敬请期待</p>
            <button onclick="navigateTo('features')" class="px-6 py-2 rounded-full bg-[#F3BA2F] text-white text-sm hover:bg-[#d9a52d] transition">
                <i class="fa fa-lightbulb-o mr-2"></i>建议添加此功能
            </button>
        </div>
    `;
}

/**
 * 删除巨鲸追踪
 */
async function deleteWhale(address) {
    if (!confirm('确定要删除这个追踪吗？')) return;

    try {
        await window.API.Whale.deleteWhale(address);
        window.UI?.showToast('删除成功', 'success');
        renderWhale();
    } catch (error) {
        window.UI?.showToast('删除失败', 'error');
    }
}

/**
 * 渲染功能建议
 */
async function renderFeatures() {
    const container = document.getElementById('featuresList');
    if (!container) return;

    window.UI?.showLoading(container);

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
    // 默认加载快速开始文档
    loadDocContent('quickstart');

    // 为导航链接添加点击事件
    const navLinks = document.querySelectorAll('#docs-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const slug = link.dataset.slug;
            loadDocContent(slug);
        });
    });
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
            // 更新投票数 - 找到按钮前的投票数元素
            const card = btn.closest('.glass-card');
            const voteCount = card?.querySelector('.font-bold.text-[#F3BA2F]');
            if (voteCount) {
                const current = parseInt(voteCount.textContent) || 0;
                voteCount.textContent = window.AppConfig?.formatNumber(current + 1) || (current + 1);
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
async function viewDiscussion(id) {
    navigateTo('discussion');

    const container = document.getElementById('discussion-detail');
    const repliesContainer = document.getElementById('discussion-replies');

    if (!container) return;

    window.UI?.showLoading(container);

    try {
        const data = await window.API.Content.getDiscussions('all');
        const list = data.data || [];
        const item = list.find(d => d.id === id);

        if (!item) {
            container.innerHTML = '<div class="text-center text-gray-400 py-8">讨论不存在</div>';
            return;
        }

        container.innerHTML = `
            <h1 class="text-2xl font-bold mb-4">${window.UI.escapeHtml(item.title || '无标题')}</h1>
            <div class="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <span>${window.UI.escapeHtml(item.author || '匿名')}</span>
                <span>·</span>
                <span>${window.AppConfig?.timeAgo(item.createdAt) || '刚刚'}</span>
                <span>·</span>
                <span><i class="fa fa-comment-o mr-1"></i>${item.replies?.length || 0} 回复</span>
            </div>
            <div class="prose prose-yellow max-w-none text-gray-600 mb-6">
                ${(window.Pages?.formatDocContent || window.UI?.formatDocContent || ((s) => s))(item.content || '')}
            </div>
            <div class="flex items-center gap-4 pt-4 border-t">
                <button class="flex items-center gap-2 text-gray-400 hover:text-[#F3BA2F] transition" onclick="likeContent('discussions', '${item.id}', this)">
                    <i class="fa fa-heart-o"></i>
                    <span>${item.likes || 0}</span>
                </button>
            </div>
        `;

        // 加载回复
        if (repliesContainer && item.replies && item.replies.length > 0) {
            repliesContainer.innerHTML = item.replies.map(reply => `
                <div class="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs flex-shrink-0">
                        ${(reply.author || '匿')[0]}
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="font-medium text-sm">${reply.author || '匿名'}</span>
                            <span class="text-xs text-gray-400">${window.AppConfig?.timeAgo(reply.createdAt)}</span>
                        </div>
                        <p class="text-sm text-gray-600">${reply.content || ''}</p>
                    </div>
                </div>
            `).join('');
        } else if (repliesContainer) {
            repliesContainer.innerHTML = '<div class="text-center text-gray-400 py-4">暂无回复，来发表第一条吧！</div>';
        }
    } catch (error) {
        container.innerHTML = '<div class="text-center text-red-400 py-8">加载失败</div>';
    }
}

/**
 * 查看文章详情
 */
async function viewArticle(id) {
    navigateTo('article');

    const container = document.getElementById('article-detail');

    if (!container) return;

    window.UI?.showLoading(container);

    try {
        const data = await window.API.Content.getArticles();
        const list = data.data || [];
        const item = list.find(a => a.id === id);

        if (!item) {
            container.innerHTML = '<div class="text-center text-gray-400 py-8">文章不存在</div>';
            return;
        }

        container.innerHTML = `
            <h1 class="text-3xl font-bold mb-4">${window.UI.escapeHtml(item.title || '无标题')}</h1>
            <div class="flex items-center gap-4 text-sm text-gray-500 mb-8">
                <span>${window.UI.escapeHtml(item.author || '匿名作者')}</span>
                <span>·</span>
                <span>${window.AppConfig?.timeAgo(item.createdAt) || '刚刚'}</span>
            </div>
            <div class="prose prose-yellow max-w-none text-gray-600 mb-8">
                ${(window.Pages?.formatDocContent || window.UI?.formatDocContent || ((s) => s))(item.content || '')}
            </div>
            <div class="flex items-center gap-4 pt-6 border-t">
                <button class="flex items-center gap-2 text-gray-400 hover:text-[#F3BA2F] transition" onclick="likeContent('articles', '${item.id}', this)">
                    <i class="fa fa-heart-o"></i>
                    <span>${item.likes || 0}</span>
                </button>
            </div>
        `;
    } catch (error) {
        container.innerHTML = '<div class="text-center text-red-400 py-8">加载失败</div>';
    }
}

/**
 * 导航到文档页并加载指定文档
 */
function navigateToDocs(slug) {
    navigateTo('docs');
    // 延迟加载，确保页面已渲染
    setTimeout(() => {
        loadDocContent(slug);
    }, 100);
}

/**
 * 查看文档
 */
function viewDoc(slug) {
    loadDocContent(slug || 'quickstart');
}

/**
 * 加载文档内容
 */
function loadDocContent(slug) {
    const container = document.getElementById('docsContent');
    if (!container) return;

    // 更新导航高亮
    document.querySelectorAll('#docs-nav a').forEach(link => {
        link.classList.remove('bg-yellow-50', 'text-[#F3BA2F]');
        link.classList.add('hover:bg-gray-50', 'text-gray-600');
        if (link.dataset.slug === slug) {
            link.classList.add('bg-yellow-50', 'text-[#F3BA2F]');
            link.classList.remove('hover:bg-gray-50', 'text-gray-600');
        }
    });

    // 静态文档内容
    const docs = {
        quickstart: {
            title: '快速开始',
            icon: '🚀',
            content: `
                <h2 class="text-2xl font-bold mb-4">欢迎来到 HOLD 社区</h2>
                <p class="text-gray-600 mb-6">本指南将帮助你快速掌握链上分析的基础知识，从零开始学习识别风险、分析代币、使用工具。</p>

                <h3 class="text-xl font-bold mt-8 mb-4">第一步：创建钱包</h3>
                <ul class="list-disc list-inside space-y-2 text-gray-600 mb-6">
                    <li>推荐使用 MetaMask、Trust Wallet 或 TokenPocket</li>
                    <li>妥善保管你的助记词，永远不要分享给任何人</li>
                    <li>测试小额转账，确保钱包正常工作</li>
                </ul>

                <h3 class="text-xl font-bold mt-8 mb-4">第二步：学习基��</h3>
                <ul class="list-disc list-inside space-y-2 text-gray-600 mb-6">
                    <li>了解什么是区块链、代币、智能合约</li>
                    <li>学习如何查看交易记录（Etherscan、BscScan）</li>
                    <li>理解流动性、市值、交易量等基本概念</li>
                </ul>

                <h3 class="text-xl font-bold mt-8 mb-4">第三步：使用工具</h3>
                <ul class="list-disc list-inside space-y-2 text-gray-600 mb-6">
                    <li>使用我们的 AI 工具进行代币分析</li>
                    <li>关注巨鲸动向，捕捉市场机会</li>
                    <li>设置价格监控，及时获取通知</li>
                </ul>

                <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-8">
                    <p class="text-sm text-yellow-800">
                        <strong>⚠️ 重要提示：</strong>加密货币投资有风险，请只投入你能承受损失的资金。永远做好自己的研究（DYOR）！
                    </p>
                </div>
            `
        },
        security: {
            title: '安全基础',
            icon: '🛡️',
            content: `
                <h2 class="text-2xl font-bold mb-4">链上安全基础知识</h2>
                <p class="text-gray-600 mb-6">在加密货币世界，安全是最重要的。学会识别常见骗局，保护你的资产。</p>

                <h3 class="text-xl font-bold mt-8 mb-4">常见骗局类型</h3>
                <div class="space-y-4 mb-6">
                    <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <h4 class="font-semibold text-red-700 mb-2">🍯 蜜罐 scam (Honeypot)</h4>
                        <p class="text-sm text-gray-600">合约代码限制卖出，买入后无法卖出。特征：交易量很大但很少有人能卖出。</p>
                    </div>
                    <div class="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                        <h4 class="font-semibold text-orange-700 mb-2">💸 Rug Pull</h4>
                        <p class="text-sm text-gray-600">开发者撤走流动性，代币价格归零。特征：短时间内大量卖出，流动性池突然清空。</p>
                    </div>
                    <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                        <h4 class="font-semibold text-yellow-700 mb-2">🎣 钓鱼网站</h4>
                        <p class="text-sm text-gray-600">假冒官方网站骗取私钥。特征：URL 稍有不同，要求连接钱包。</p>
                    </div>
                </div>

                <h3 class="text-xl font-bold mt-8 mb-4">安全检查清单</h3>
                <ul class="list-disc list-inside space-y-2 text-gray-600 mb-6">
                    <li>✅ 合约是否通过审计？（CertiK、SlowMist 等）</li>
                    <li>✅ 流动性是否已锁定？（锁定时间越长越安全）</li>
                    <li>✅ Top 10 持仓占比是否合理？（超过 50% 要小心）</li>
                    <li>✅ 买卖税是否合理？（超过 15% 要警惕）</li>
                    <li>✅ 项目方是否实名？（社交媒体、网站是否专业）</li>
                    <li>✅ 社区是否活跃？（Telegram、Twitter 粉丝真实度）</li>
                </ul>

                <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-8">
                    <p class="text-sm text-blue-800">
                        <strong>💡 小贴士：</strong>使用我们的 AI 安全评分工具，一键检测代币安全性！
                    </p>
                </div>
            `
        },
        analysis: {
            title: '代币分析',
            icon: '📊',
            content: `
                <h2 class="text-2xl font-bold mb-4">代币分析方法</h2>
                <p class="text-gray-600 mb-6">学会分析代币的基本面和技术面，做出明智的投资决策。</p>

                <h3 class="text-xl font-bold mt-8 mb-4">基本面分析</h3>
                <ul class="list-disc list-inside space-y-2 text-gray-600 mb-6">
                    <li><strong>项目背景：</strong>团队实力、项目愿景、解决什么问题</li>
                    <li><strong>代币经济学：</strong>总供应量、分配方案、解锁时间表</li>
                    <li><strong>合作伙伴：</strong>是否有知名机构支持</li>
                    <li><strong>社区活跃度：</strong>用户参与度、开发者更新频率</li>
                </ul>

                <h3 class="text-xl font-bold mt-8 mb-4">链上数据分析</h3>
                <ul class="list-disc list-inside space-y-2 text-gray-600 mb-6">
                    <li><strong>持仓分布：</strong>查看 Top Holders，避免高度集中的代币</li>
                    <li><strong>交易记录：</strong>查看大额转账，可能有内幕交易</li>
                    <li><strong>新增地址：</strong>新用户增长趋势，反映项目热度</li>
                    <li><strong>流动性变化：</strong>LP 池规模变化，关注资金流向</li>
                </ul>

                <h3 class="text-xl font-bold mt-8 mb-4">技术分析指标</h3>
                <div class="grid md:grid-cols-2 gap-4 mb-6">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-semibold mb-2">价格相关</h4>
                        <ul class="text-sm text-gray-600 space-y-1">
                            <li>• 市值（Market Cap）</li>
                            <li>• 24小时交易量</li>
                            <li>• 价格历史走势</li>
                        </ul>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-semibold mb-2">链上指标</h4>
                        <ul class="text-sm text-gray-600 space-y-1">
                            <li>• 持币地址数</li>
                            <li>• 转账次数</li>
                            <li>• 活跃用户数</li>
                        </ul>
                    </div>
                </div>

                <div class="bg-green-50 border border-green-200 rounded-xl p-4 mt-8">
                    <p class="text-sm text-green-800">
                        <strong>🔧 工具推荐：</strong>使用 Binance Web3 技能获取专业级链上数据！
                    </p>
                </div>
            `
        },
        tools: {
            title: '链上工具',
            icon: '🛠️',
            content: `
                <h2 class="text-2xl font-bold mb-4">常用链上工具介绍</h2>
                <p class="text-gray-600 mb-6">掌握这些工具，让你事半功倍地进行链上分析。</p>

                <h3 class="text-xl font-bold mt-8 mb-4">区块浏览器</h3>
                <div class="space-y-4 mb-6">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h4 class="font-semibold mb-2">🔷 BscScan</h4>
                        <p class="text-sm text-gray-600">BSC 链官方浏览器，查看交易、合约、持仓</p>
                    </div>
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <h4 class="font-semibold mb-2">🔶 Etherscan</h4>
                        <p class="text-sm text-gray-600">以太坊链官方浏览器</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h4 class="font-semibold mb-2">🟢 Solscan</h4>
                        <p class="text-sm text-gray-600">Solana 链浏览器</p>
                    </div>
                </div>

                <h3 class="text-xl font-bold mt-8 mb-4">代币分析工具</h3>
                <ul class="list-disc list-inside space-y-2 text-gray-600 mb-6">
                    <li><strong>Token Sniffer：</strong>检测假币和蜜罐</li>
                    <li><strong>DEX Screener：</strong>查看代币价格走势和交易对</li>
                    <li><strong>DexTools：</strong>实时监控交易活动</li>
                    <li><strong>CoinGecko：</strong>查看市值排名和价格</li>
                </ul>

                <h3 class="text-xl font-bold mt-8 mb-4">安全审计工具</h3>
                <ul class="list-disc list-inside space-y-2 text-gray-600 mb-6">
                    <li><strong>CertiK：</strong>顶级智能合约审计平台</li>
                    <li><strong>SlowMist：</strong>区块链安全公司</li>
                    <li><strong>GoPlus：</strong>代币安全检测 API</li>
                </ul>

                <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-8">
                    <p class="text-sm text-yellow-800">
                        <strong>⚡ 本站集成：</strong>我们已集成多种工具，直接在 AI 工具和 Binance Web3 中使用！
                    </p>
                </div>
            `
        },
        trading: {
            title: '交易技巧',
            icon: '📈',
            content: `
                <h2 class="text-2xl font-bold mb-4">链上交易技巧</h2>
                <p class="text-gray-600 mb-6">掌握正确的交易策略，提高投资成功率。</p>

                <h3 class="text-xl font-bold mt-8 mb-4">买入时机</h3>
                <ul class="list-disc list-inside space-y-2 text-gray-600 mb-6">
                    <li>✅ 等待回调到支撑位再入场</li>
                    <li>✅ 关注成交量放大信号</li>
                    <li>✅ 新项目开盘前 1-2 小时观察</li>
                    <li>✅ 大户开始建仓时跟随</li>
                </ul>

                <h3 class="text-xl font-bold mt-8 mb-4">卖出时机</h3>
                <ul class="list-disc list-inside space-y-2 text-gray-600 mb-6">
                    <li>✅ 达到预期收益目标</li>
                    <li>✅ 技术指标背离信号</li>
                    <li>✅ 成交量异常放大</li>
                    <li>✅ 项目方开始代币解锁</li>
                </ul>

                <h3 class="text-xl font-bold mt-8 mb-4">仓位管理</h3>
                <div class="bg-gray-50 p-4 rounded-lg mb-6">
                    <ul class="text-sm text-gray-600 space-y-2">
                        <li>📊 单笔投资不超过总资金的 10%</li>
                        <li>📊 高风险项目仓位控制在 5% 以内</li>
                        <li>📊 留有现金储备应对机会</li>
                        <li>📊 分批止盈，保留利润</li>
                    </ul>
                </div>

                <div class="bg-red-50 border border-red-200 rounded-xl p-4 mt-8">
                    <p class="text-sm text-red-800">
                        <strong>⚠️ 风险提示：</strong>不要梭哈！不要借钱炒币！设置止损！
                    </p>
                </div>
            `
        },
        risk: {
            title: '风险管理',
            icon: '⚠️',
            content: `
                <h2 class="text-2xl font-bold mb-4">投资风险管理</h2>
                <p class="text-gray-600 mb-6">学会管理风险，是长期盈利的关键。</p>

                <h3 class="text-xl font-bold mt-8 mb-4">风险等级划分</h3>
                <div class="space-y-3 mb-6">
                    <div class="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                        <span class="font-semibold text-green-700">🟢 低风险：</span>
                        <span class="text-sm text-gray-600">主流币（BTC、ETH）、经过审计的老牌项目</span>
                    </div>
                    <div class="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                        <span class="font-semibold text-yellow-700">🟡 中风险：</span>
                        <span class="text-sm text-gray-600">新项目、市值较小的代币</span>
                    </div>
                    <div class="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                        <span class="font-semibold text-red-700">🔴 高风险：</span>
                        <span class="text-sm text-gray-600">刚上线的新币、Meme 币、未审计项目</span>
                    </div>
                </div>

                <h3 class="text-xl font-bold mt-8 mb-4">止损策略</h3>
                <ul class="list-disc list-inside space-y-2 text-gray-600 mb-6">
                    <li>设置硬止损：-15% 自动卖出</li>
                    <li>移动止损：价格上涨后跟随止损</li>
                    <li>时间止损：超过预期时间未涨则离场</li>
                </ul>

                <h3 class="text-xl font-bold mt-8 mb-4">常见错误</h3>
                <ul class="list-disc list-inside space-y-2 text-gray-600 mb-6">
                    <li>❌ 追涨杀跌，情绪化交易</li>
                    <li>❌ 不做研究，盲目跟单</li>
                    <li>❌ 孤注一掷，梭哈All-in</li>
                    <li>❌ 不设止损，死扛亏损</li>
                </ul>

                <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-8">
                    <p class="text-sm text-blue-800">
                        <strong>💡 记住：</strong>保住本金比赚钱更重要！
                    </p>
                </div>
            `
        },
        mindset: {
            title: '心态修炼',
            icon: '🧘',
            content: `
                <h2 class="text-2xl font-bold mb-4">交易心态培养</h2>
                <p class="text-gray-600 mb-6">好的心态是成功投资者的必备素质。</p>

                <h3 class="text-xl font-bold mt-8 mb-4">克服 FOMO</h3>
                <p class="text-gray-600 mb-4">FOMO（Fear Of Missing Out，害怕错过）是投资者的大敌。</p>
                <ul class="list-disc list-inside space-y-2 text-gray-600 mb-6">
                    <li>💭 市场永远有机会，不要害怕错过</li>
                    <li>💭 制定交易计划，严格执行</li>
                    <li>💭 看到别人赚钱时，冷静分析原因</li>
                    <li>💭 不要因为涨了就追，跌了就慌</li>
                </ul>

                <h3 class="text-xl font-bold mt-8 mb-4">应对亏损</h3>
                <p class="text-gray-600 mb-4">亏损是投资的一部分，学会正确面对。</p>
                <ul class="list-disc list-inside space-y-2 text-gray-600 mb-6">
                    <li>💪 接受现实，不要抱有幻想</li>
                    <li>💪 总结教训，改进交易策略</li>
                    <li>💪 暂时休息，调整好心态再回来</li>
                    <li>💪 小仓位测试，重建信心</li>
                </ul>

                <h3 class="text-xl font-bold mt-8 mb-4">长期心态</h3>
                <ul class="list-disc list-inside space-y-2 text-gray-600 mb-6">
                    <li>🎯 把投资当作长期事业，不是一夜暴富</li>
                    <li>🎯 持续学习，提升认知水平</li>
                    <li>🎯 控制贪欲，知足常乐</li>
                    <li>🎯 保持耐心，等待确定性机会</li>
                </ul>

                <div class="bg-purple-50 border border-purple-200 rounded-xl p-4 mt-8">
                    <p class="text-sm text-purple-800">
                        <strong>🌟 终极建议：</strong>投资自己比投资任何币都更有价值！
                    </p>
                </div>
            `
        }
    };

    const doc = docs[slug];
    if (doc) {
        container.innerHTML = `
            <div class="flex items-center gap-3 mb-6">
                <span class="text-4xl">${doc.icon}</span>
                <h1 class="text-3xl font-bold">${doc.title}</h1>
            </div>
            <div class="prose prose-yellow max-w-none text-gray-600">
                ${doc.content}
            </div>
        `;
    }
}

/**
 * 渲染个人资料页
 */
async function renderProfile() {
    const user = window.Auth?.getCurrentUser();
    if (!user) {
        window.UI?.showToast('请先登录', 'warning');
        navigateTo('home');
        return;
    }

    // 更新用户信息显示
    const avatar = document.getElementById('profileAvatar');
    const nickname = document.getElementById('profileNickname');
    const email = document.getElementById('profileEmail');

    if (avatar && user.nickname) {
        avatar.textContent = user.nickname.charAt(0).toUpperCase();
        avatar.className = 'w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white text-2xl font-bold';
    }
    if (nickname) nickname.textContent = user.nickname || '用户';
    if (email) email.textContent = user.email || '';

    // TODO: 加载用户徽章和等级
    // TODO: 加载用户活动记录
}

/**
 * 渲染管理员文档页
 */
async function renderAdminDocs() {
    const user = window.Auth?.getCurrentUser();
    if (!user || !user.isAdmin) {
        window.UI?.showToast('需要管理员权限', 'warning');
        navigateTo('home');
        return;
    }

    const container = document.getElementById('adminDocsList');
    if (!container) return;

    // 使用 pages.js 中的 renderAdminDocs 函数
    if (typeof window.Pages?.renderAdminDocs === 'function') {
        await window.Pages.renderAdminDocs();
    } else {
        window.UI?.showLoading(container);

        try {
            const response = await fetch('/api/admin/docs', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            const docs = data.data || [];

            if (docs.length === 0) {
                container.innerHTML = '<div class="text-center text-gray-400 py-8"><i class="fa fa-file-text text-4xl mb-3"></i><p>暂无文档</p></div>';
                return;
            }

            container.innerHTML = docs.map(doc => `
                <div class="glass-card rounded-xl p-4 flex items-center justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="font-medium">${window.UI?.escapeHtml(doc.title) || '无标题'}</span>
                            <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">${doc.slug || ''}</span>
                        </div>
                        <div class="text-xs text-gray-500">${doc.category || '未分类'} · 排序: ${doc.order || 999}</div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="editDoc('${doc.slug}')" class="p-2 text-gray-400 hover:text-[#F3BA2F] transition">
                            <i class="fa fa-edit"></i>
                        </button>
                        <button onclick="deleteDoc('${doc.slug}')" class="p-2 text-gray-400 hover:text-red-500 transition">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            container.innerHTML = '<div class="text-center text-red-400 py-8"><i class="fa fa-exclamation-circle text-4xl mb-3"></i><p>加载失败</p></div>';
        }
    }
}

/**
 * 切换移动端菜单
 */
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        const isOpen = menu.classList.contains('open');
        if (isOpen) {
            menu.classList.remove('open');
            removeMobileMenuOverlay();
        } else {
            menu.classList.add('open');
            addMobileMenuOverlay();
        }
    }
}

/**
 * 添加移动菜单覆盖层
 */
function addMobileMenuOverlay() {
    // 移除已存在的覆盖层
    removeMobileMenuOverlay();

    const overlay = document.createElement('div');
    overlay.id = 'mobileMenuOverlay';
    overlay.className = 'fixed inset-0 bg-black/50 z-40 md:hidden';
    overlay.onclick = toggleMobileMenu;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
}

/**
 * 移除移动菜单覆盖层
 */
function removeMobileMenuOverlay() {
    const overlay = document.getElementById('mobileMenuOverlay');
    if (overlay) {
        overlay.remove();
    }
    document.body.style.overflow = '';
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

// ========== 导出函数到 window ==========
window.navigateTo = navigateTo;
window.navigateToDocs = navigateToDocs;
window.initRouter = initRouter;
window.toggleMobileMenu = toggleMobileMenu;
window.toggleAIChat = toggleAIChat;
window.viewDiscussion = viewDiscussion;
window.viewArticle = viewArticle;
window.viewDoc = viewDoc;
window.loadDocContent = loadDocContent;
window.likeContent = likeContent;
window.voteForFeature = voteForFeature;
window.deleteMonitor = deleteMonitor;
window.deleteWhale = deleteWhale;
window.switchTrendingTab = window.switchTrendingTab || function(tab) {
    currentTrendingTab = tab;
    document.querySelectorAll('.trending-tab').forEach(t => {
        t.classList.remove('bg-[#F3BA2F]', 'text-white');
        t.classList.add('text-gray-600');
    });
    document.querySelector(`[data-tab="${tab}"]`)?.classList.remove('text-gray-600');
    document.querySelector(`[data-tab="${tab}"]`)?.classList.add('bg-[#F3BA2F]', 'text-white');
    renderTrending();
};
window.filterShares = window.filterShares || function(category) {
    currentShareCategory = category;
    renderShare();
};
window.openModal = window.UI?.openModal || function(id) {
    document.getElementById(id)?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};
window.closeModal = window.UI?.closeModal || function(id) {
    document.getElementById(id)?.classList.add('hidden');
    document.body.style.overflow = '';
};

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', async () => {
    // 初始化认证
    await window.Auth.init();

    // 初始化路由
    initRouter();

    // 键盘事件：ESC 关闭所有弹窗
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('[id$="Modal"]:not(.hidden)');
            openModals.forEach(modal => {
                if (modal.id === 'authModal') window.closeAuthModal?.();
                else if (modal.id === 'postModal') window.UI?.closeModal('postModal');
                else if (modal.id === 'featureModal') window.closeFeatureModal?.();
                else if (modal.id === 'docModal') window.closeDocModal?.();
                else if (modal.id === 'monitorModal') window.closeMonitorModal?.();
                else if (modal.id === 'whaleModal') window.closeWhaleModal?.();
                else window.UI?.closeModal(modal.id);
            });
        }
    });

    // Enter 键提交表单（仅在输入框中）
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.target.tagName === 'INPUT')) {
            const modal = e.target.closest('[id$="Modal"]');
            if (modal) {
                if (modal.id === 'authModal') window.submitAuth?.();
                else if (modal.id === 'featureModal') window.submitFeature?.();
                else if (modal.id === 'docModal') window.submitDoc?.();
                else if (modal.id === 'monitorModal') window.submitMonitor?.();
                else if (modal.id === 'whaleModal') window.submitWhale?.();
            }
        }
    });

    console.log('HOLD 社区门户已加载');
});
