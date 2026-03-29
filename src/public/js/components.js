/**
 * HOLD 社区门户 - UI 组件
 * Toast、Modal、加载状态等
 */

/**
 * Toast 通知
 */
function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // 触发动画
    setTimeout(() => toast.classList.add('show'), 10);

    // 自动消失
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Modal 模态框
 */
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

    // 清理输入
    const inputs = modal?.querySelectorAll('input, textarea');
    inputs?.forEach(input => {
        if (input.type !== 'checkbox' && input.type !== 'radio') {
            input.value = '';
        }
    });
}

/**
 * 关闭所有模态框
 */
function closeAllModals() {
    document.querySelectorAll('[id$="Modal"]').forEach(modal => {
        modal.classList.add('hidden');
    });
    document.body.style.overflow = '';
}

/**
 * 设置按钮加载状态
 */
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

/**
 * 骨架屏加载状态
 */
function showSkeleton(container, count = 3) {
    const skeletonHTML = Array(count).fill(`
        <div class="glass-card rounded-xl p-4">
            <div class="skeleton h-4 w-3/4 mb-3"></div>
            <div class="skeleton h-3 w-1/2"></div>
        </div>
    `).join('');
    container.innerHTML = skeletonHTML;
}

/**
 * 显示加载状态
 */
function showLoading(container, message = '加载中...') {
    container.innerHTML = `
        <div class="text-center py-12">
            <div class="loading-dots mb-2">
                <span>●</span><span>●</span><span>●</span>
            </div>
            <p class="text-sm text-gray-400">${message}</p>
        </div>
    `;
}

/**
 * 显示空状态
 */
function showEmpty(container, message = '暂无数据', icon = 'fa-inbox') {
    container.innerHTML = `
        <div class="text-center text-gray-400 py-12">
            <i class="fa ${icon} text-4xl mb-3 opacity-50"></i>
            <p>${message}</p>
        </div>
    `;
}

/**
 * 显示错误状态
 */
function showError(container, message = '加载失败') {
    container.innerHTML = `
        <div class="text-center text-red-400 py-12">
            <i class="fa fa-exclamation-circle text-4xl mb-3 opacity-50"></i>
            <p>${message}</p>
        </div>
    `;
}

/**
 * HTML 转义（防 XSS）
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 获取分类名称
 */
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

/**
 * 获取分类图标
 */
function getCategoryIcon(category) {
    const icons = {
        'tools': 'fa-wrench',
        'docs': 'fa-file-text-o',
        'airdrop': 'fa-gift',
        'default': 'fa-link'
    };
    return icons[category] || icons['default'];
}

/**
 * 获取类型颜色
 */
function getTypeColor(type) {
    const colors = {
        'article': 'bg-blue-100 text-blue-600',
        'share': 'bg-green-100 text-green-600',
        'discussion': 'bg-orange-100 text-orange-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
}

/**
 * 切换用户菜单
 */
function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

/**
 * 关闭用户菜单（点击外部时）
 */
document.addEventListener('click', (e) => {
    const menu = document.getElementById('userMenu');
    const avatar = document.getElementById('userAvatar');
    if (menu && !menu.classList.contains('hidden') && !avatar?.contains(e.target)) {
        menu.classList.add('hidden');
    }
});

// 导出组件模块
window.UI = {
    showToast,
    openModal,
    closeModal,
    closeAllModals,
    setButtonLoading,
    showSkeleton,
    showLoading,
    showEmpty,
    showError,
    escapeHtml,
    getCategoryName,
    getCategoryIcon,
    getTypeColor,
    toggleUserMenu
};
