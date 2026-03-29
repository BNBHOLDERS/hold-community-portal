/**
 * HOLD 社区门户 - 页面辅助工具
 * 包含格式化工具、模态框管理等辅助功能
 */

// ========== 全局变量 ==========
let articlesData = [];

// ========== 内容格式化工具 ==========
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

// ========== 状态映射工具 ==========
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

// ========== 模态框管理 ==========
function openFeatureModal() {
    window.UI?.openModal('featureModal');
}

function closeFeatureModal() {
    window.UI?.closeModal('featureModal');
}

// ========== 认证相关 ==========
function openAuthModal() {
    window.UI?.openModal('authModal');
}

function closeAuthModal() {
    window.UI?.closeModal('authModal');
    // 重置表单
    document.getElementById('authEmail').value = '';
    document.getElementById('authCode').value = '';
    document.getElementById('authNickname').value = '';
    // 隐藏开发模式验证码提示
    const devCodeHint = document.getElementById('devCodeHint');
    if (devCodeHint) {
        devCodeHint.classList.add('hidden');
    }
    // 重置发送验证码按钮
    const sendCodeBtn = document.getElementById('sendCodeBtn');
    if (sendCodeBtn) {
        sendCodeBtn.disabled = false;
        sendCodeBtn.textContent = '发送验证码';
    }
    // 重置到登录选项卡
    switchAuthTab('login');
}

function switchAuthTab(mode) {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const authTitle = document.getElementById('authTitle');
    const nicknameField = document.getElementById('registerNicknameField');
    const submitBtn = document.getElementById('authSubmitBtn');

    if (mode === 'register') {
        loginTab?.classList.remove('bg-[#F3BA2F]', 'text-white');
        loginTab?.classList.add('bg-gray-100', 'text-gray-600');
        registerTab?.classList.remove('bg-gray-100', 'text-gray-600');
        registerTab?.classList.add('bg-[#F3BA2F]', 'text-white');
        nicknameField?.classList.remove('hidden');
        if (submitBtn) submitBtn.textContent = '注册';
    } else {
        registerTab?.classList.remove('bg-[#F3BA2F]', 'text-white');
        registerTab?.classList.add('bg-gray-100', 'text-gray-600');
        loginTab?.classList.remove('bg-gray-100', 'text-gray-600');
        loginTab?.classList.add('bg-[#F3BA2F]', 'text-white');
        nicknameField?.classList.add('hidden');
        if (submitBtn) submitBtn.textContent = '登录';
    }
}

async function sendAuthCode() {
    const email = document.getElementById('authEmail')?.value?.trim();
    if (!email) {
        window.UI?.showToast('请输入邮箱地址', 'warning');
        document.getElementById('authEmail')?.focus();
        return;
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        window.UI?.showToast('请输入���效的邮箱地址', 'warning');
        document.getElementById('authEmail')?.focus();
        return;
    }

    const btn = document.getElementById('sendCodeBtn');
    if (btn) {
        btn.disabled = true;
        const originalText = btn.textContent;
        btn.textContent = '发送中...';

        try {
            const result = await window.Auth.sendCode(email);
            // 开启倒计时
            let countdown = 60;
            const timer = setInterval(() => {
                btn.textContent = `${countdown}s 后重新发送`;
                countdown--;
                if (countdown < 0) {
                    clearInterval(timer);
                    btn.disabled = false;
                    btn.textContent = originalText;
                }
            }, 1000);

            // 开发模式：显示验证码
            if (result && result.devCode) {
                const devCodeHint = document.getElementById('devCodeHint');
                const devCodeDisplay = document.getElementById('devCodeDisplay');
                if (devCodeHint && devCodeDisplay) {
                    devCodeDisplay.textContent = result.devCode;
                    devCodeHint.classList.remove('hidden');
                }
            }
        } catch (error) {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }
}

async function submitAuth() {
    const email = document.getElementById('authEmail')?.value?.trim();
    const code = document.getElementById('authCode')?.value?.trim();
    const nickname = document.getElementById('authNickname')?.value?.trim();

    if (!email || !code) {
        window.UI?.showToast('请填写邮箱和验证码', 'warning');
        if (!email) document.getElementById('authEmail')?.focus();
        else if (!code) document.getElementById('authCode')?.focus();
        return;
    }

    // 验证码长度检查
    if (code.length !== 6) {
        window.UI?.showToast('验证码应为 6 位数字', 'warning');
        document.getElementById('authCode')?.focus();
        return;
    }

    // 注册模式需要昵称
    const isRegister = document.getElementById('registerTab')?.classList.contains('bg-[#F3BA2F]');
    if (isRegister && !nickname) {
        window.UI?.showToast('请输入昵称', 'warning');
        document.getElementById('authNickname')?.focus();
        return;
    }

    const btn = document.getElementById('authSubmitBtn');
    if (btn) {
        btn.disabled = true;
        const originalText = btn.textContent;
        btn.textContent = '提交中...';

        try {
            const success = await window.Auth.verifyAndLogin(email, code, nickname);
            if (success) {
                // 成功后清理
                closeAuthModal();
            }
        } finally {
            btn.disabled = false;
            btn.textContent = isRegister ? '注册' : '登录';
        }
    }
}

// ========== 管理员文档管理 ==========
async function openDocModal(slug = null) {
    const modal = document.getElementById('docModal');
    if (!modal) return;

    // 重置表单
    const docSlugInput = document.getElementById('docSlugInput');

    document.getElementById('docTitle').value = '';
    if (docSlugInput) docSlugInput.value = '';
    document.getElementById('docCategory').value = 'quickstart';
    document.getElementById('docOrder').value = '999';
    document.getElementById('docDescription').value = '';
    document.getElementById('docContent').value = '';

    if (slug) {
        // 编辑模式 - 从 API 加载文档数据
        document.getElementById('docModalTitle').textContent = '编辑文档';

        try {
            const response = await fetch(`/api/docs/admin/list`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            const docs = data.data || [];
            const doc = docs.find(d => d.slug === slug);

            if (doc) {
                document.getElementById('docTitle').value = doc.title || '';
                if (docSlugInput) docSlugInput.value = doc.slug || '';
                document.getElementById('docCategory').value = doc.category || 'quickstart';
                document.getElementById('docOrder').value = doc.order || '999';
                document.getElementById('docDescription').value = doc.description || '';
                document.getElementById('docContent').value = doc.content || '';

                // 添加隐藏的slug标识
                if (!document.getElementById('docSlug')) {
                    const hiddenInput = document.createElement('input');
                    hiddenInput.type = 'hidden';
                    hiddenInput.id = 'docSlug';
                    hiddenInput.value = slug;
                    document.getElementById('docModal').appendChild(hiddenInput);
                } else {
                    document.getElementById('docSlug').value = slug;
                }
            }
        } catch (error) {
            window.UI?.showToast('加载文档失败', 'error');
        }
    } else {
        document.getElementById('docModalTitle').textContent = '创建文档';
    }

    window.UI?.openModal ? window.UI.openModal('docModal') : openModal('docModal');
}

function closeDocModal() {
    window.UI?.closeModal('docModal');
}

function editDoc(slug) {
    openDocModal(slug);
}

async function submitDoc() {
    const title = document.getElementById('docTitle')?.value?.trim();
    const slugInput = document.getElementById('docSlugInput');
    const slug = document.getElementById('docSlug')?.value || slugInput?.value?.trim();
    const category = document.getElementById('docCategory')?.value;
    const order = document.getElementById('docOrder')?.value;
    const description = document.getElementById('docDescription')?.value?.trim();
    const content = document.getElementById('docContent')?.value?.trim();
    const existingSlug = document.getElementById('docSlug')?.value;

    if (!title || !slug) {
        window.UI?.showToast('请填写标题和标识', 'warning');
        return;
    }

    const btn = document.getElementById('docSubmitBtn');
    if (btn) {
        btn.disabled = true;
        btn.textContent = '提交中...';

        try {
            // 判断是编辑还是新建
            const isEdit = !!existingSlug;
            const url = isEdit ? `/api/docs/admin/${existingSlug}` : '/api/docs/admin';
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ title, slug, category, order, description, content })
            });
            const data = await response.json();

            if (data.success) {
                window.UI?.showToast(isEdit ? '更新成功' : '创建成功', 'success');
                closeDocModal();
                // 重新加载文档列表
                if (typeof window.Pages?.renderAdminDocs === 'function') {
                    await window.Pages.renderAdminDocs();
                }
            } else {
                window.UI?.showToast(data.message || '操作失败', 'error');
            }
        } catch (error) {
            window.UI?.showToast('操作失败', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = '发布';
        }
    }
}

async function deleteDoc(slug) {
    if (!confirm('确定要删除这篇文档吗？')) return;

    try {
        const response = await fetch(`/api/docs/admin/${slug}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();

        if (data.success) {
            window.UI?.showToast('删除成功', 'success');
            // 重新加载文档列表
            if (typeof window.Pages?.renderAdminDocs === 'function') {
                window.Pages.renderAdminDocs();
            }
        }
    } catch (error) {
        window.UI?.showToast('删除失败', 'error');
    }
}

// ========== 监控相关模态框 ==========
function openMonitorModal() {
    window.UI?.openModal('monitorModal');
}

function closeMonitorModal() {
    window.UI?.closeModal('monitorModal');
}

async function submitMonitor() {
    const type = document.getElementById('monitorType')?.value;
    const target = document.getElementById('monitorTarget')?.value?.trim();

    if (!target) {
        window.UI?.showToast('请输入监控目标', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/monitor/monitors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ type, target })
        });
        const data = await response.json();

        if (data.success) {
            window.UI?.showToast('创建成功', 'success');
            closeMonitorModal();
        }
    } catch (error) {
        window.UI?.showToast('��建失败', 'error');
    }
}

// ========== 巨鲸相关模态框 ==========
function openWhaleModal() {
    window.UI?.openModal('whaleModal');
}

function closeWhaleModal() {
    window.UI?.closeModal('whaleModal');
}

async function submitWhale() {
    const address = document.getElementById('whaleAddress')?.value?.trim();
    const label = document.getElementById('whaleLabel')?.value?.trim();
    const balance = document.getElementById('whaleBalance')?.value;

    if (!address) {
        window.UI?.showToast('请输入地址', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/whale/whales', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ address, label, balance })
        });
        const data = await response.json();

        if (data.success) {
            window.UI?.showToast('添加成功', 'success');
            closeWhaleModal();
        }
    } catch (error) {
        window.UI?.showToast('添加失败', 'error');
    }
}

// ========== 发帖模态框 ==========
let currentPostType = 'discuss'; // 存储当前帖子类型

function openPostModal(type) {
    const modal = document.getElementById('postModal');
    const title = document.getElementById('modalTitle');
    const urlField = document.getElementById('shareUrlField');

    if (!modal || !title) return;

    // 保存当前帖子类型
    currentPostType = type || 'discuss';

    const titles = {
        discuss: '发帖',
        article: '写文章',
        share: '分享资源'
    };

    title.textContent = titles[currentPostType] || '发布';

    // 分享类型显示 URL 输入框
    if (currentPostType === 'share' && urlField) {
        urlField.classList.remove('hidden');
    } else if (urlField) {
        urlField.classList.add('hidden');
    }

    window.UI?.openModal('postModal');
}

async function submitPost(btn) {
    const title = document.getElementById('postTitle')?.value?.trim();
    const content = document.getElementById('postContent')?.value?.trim();
    const url = document.getElementById('postUrl')?.value?.trim();

    if (!title || !content) {
        window.UI?.showToast('请填写标题和内容', 'warning');
        return;
    }

    // 分享类型需要链接
    if (currentPostType === 'share' && !url) {
        window.UI?.showToast('请填写链接地址', 'warning');
        return;
    }

    // 禁用按钮
    const originalText = btn.textContent;
    btn.textContent = '发布中...';
    btn.disabled = true;

    try {
        // 根据类型调用不同的API
        const apiPaths = {
            discuss: '/api/content/discussions',
            article: '/api/content/articles',
            share: '/api/content/shares'
        };

        const response = await fetch(apiPaths[currentPostType], {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ title, content, url, category: currentPostType })
        });
        const data = await response.json();

        if (data.success) {
            window.UI?.showToast('发布成功', 'success');
            window.UI?.closeModal('postModal');
            // 刷新当前页面
            const pageRenderers = {
                discuss: () => renderDiscuss(),
                article: () => renderSubmit(),
                share: () => renderShare()
            };
            if (pageRenderers[currentPostType]) {
                pageRenderers[currentPostType]();
            }
        } else {
            window.UI?.showToast(data.message || '发布失败', 'error');
        }
    } catch (error) {
        window.UI?.showToast('发布失败', 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// ========== 功能建议提交 ==========
async function submitFeature() {
    const title = document.getElementById('featureTitle')?.value?.trim();
    const description = document.getElementById('featureDescription')?.value?.trim();
    const category = document.getElementById('featureCategory')?.value;

    if (!title || !description) {
        window.UI?.showToast('请填写标题和描述', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/features/requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ title, description, category })
        });
        const data = await response.json();

        if (data.success) {
            window.UI?.showToast('提交成功', 'success');
            closeFeatureModal();
        }
    } catch (error) {
        window.UI?.showToast('提交失败', 'error');
    }
}

// ========== 讨论回复 ==========
async function submitReply() {
    const content = document.getElementById('replyContent')?.value?.trim();
    if (!content) {
        window.UI?.showToast('请输入回复内容', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/content/replies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ content })
        });
        const data = await response.json();

        if (data.success) {
            window.UI?.showToast('回复成功', 'success');
            document.getElementById('replyContent').value = '';
            // 重新加载回复列表
        }
    } catch (error) {
        window.UI?.showToast('回复失败', 'error');
    }
}

// ========== 管理员文档渲染 ==========
async function renderAdminDocs() {
    const container = document.getElementById('adminDocsList');
    if (!container) return;

    window.UI?.showLoading(container);

    try {
        const response = await fetch('/api/docs/admin/list', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        const docs = data.data || [];

        if (docs.length === 0) {
            window.UI?.showEmpty(container, '暂无文档', 'fa-file-text');
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
        window.UI?.showError(container);
    }
}

// ========== 用户资料管理 ==========
function openEditNickname() {
    const user = window.Auth?.getCurrentUser();
    const currentNickname = user?.nickname || '';
    const nickname = prompt('请输入新昵称：', currentNickname);
    if (nickname && nickname.trim() && nickname !== currentNickname) {
        updateProfile({ nickname: nickname.trim() });
    }
}

async function updateProfile(updates) {
    try {
        const response = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(updates)
        });
        const data = await response.json();

        if (data.success) {
            window.UI?.showToast('更新成功', 'success');
            // 重新加载用户信息
            await window.Auth.init();
        } else {
            window.UI?.showToast(data.message || '更新失败', 'error');
        }
    } catch (error) {
        window.UI?.showToast('更新失败', 'error');
    }
}

function renderProfile() {
    // 用户资料页由路由系统处理
    // 这里只提供辅助功能
}

// ========== 导出辅助模块 ==========
window.Pages = {
    // 格式化工具
    formatDocContent,
    formatArticleContent,

    // 状态映射
    getStatusClass,
    getStatusText,
    getCategoryText,

    // 模态框管理
    openFeatureModal,
    closeFeatureModal,
    openDocModal,
    closeDocModal,
    editDoc,
    submitDoc,
    deleteDoc,

    // 认证相关
    openAuthModal,
    closeAuthModal,
    switchAuthTab,
    sendAuthCode,
    submitAuth,

    // 功能建议
    submitFeature,

    // 发帖
    openPostModal,
    submitPost,

    // 回复
    submitReply,

    // 监控
    openMonitorModal,
    closeMonitorModal,
    submitMonitor,

    // 巨鲸
    openWhaleModal,
    closeWhaleModal,
    submitWhale,

    // 管理员
    renderAdminDocs,

    // 用户资料
    openEditNickname,
    updateProfile,
    renderProfile
};

// 导出函数到 window（供 HTML 调用）
window.openFeatureModal = openFeatureModal;
window.closeFeatureModal = closeFeatureModal;
window.openDocModal = openDocModal;
window.closeDocModal = closeDocModal;
window.editDoc = editDoc;
window.submitDoc = submitDoc;
window.deleteDoc = deleteDoc;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.sendAuthCode = sendAuthCode;
window.submitAuth = submitAuth;
window.submitFeature = submitFeature;
window.openPostModal = openPostModal;
window.submitPost = submitPost;
window.submitReply = submitReply;
window.openMonitorModal = openMonitorModal;
window.closeMonitorModal = closeMonitorModal;
window.submitMonitor = submitMonitor;
window.openWhaleModal = openWhaleModal;
window.closeWhaleModal = closeWhaleModal;
window.submitWhale = submitWhale;
window.renderAdminDocs = renderAdminDocs;
window.openEditNickname = openEditNickname;
window.updateProfile = updateProfile;
window.renderProfile = renderProfile;
