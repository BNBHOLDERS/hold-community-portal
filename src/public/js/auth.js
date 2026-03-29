/**
 * HOLD 社区门户 - 认证模块
 */

let currentUser = null;
let isAuthenticated = false;

/**
 * 初始化认证状态
 */
async function initAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        return false;
    }

    try {
        const data = await window.API.Auth.getMe();
        if (data.success) {
            currentUser = data.data;
            isAuthenticated = true;
            updateAuthUI();
            return true;
        }
    } catch (error) {
        console.error('Auth init failed:', error);
        localStorage.removeItem('token');
    }
    return false;
}

/**
 * 发送验证码
 */
async function sendVerificationCode(email) {
    try {
        const result = await window.API.Auth.sendCode(email);
        if (result.success) {
            window.UI.showToast(result.message || '验证码已发送', 'success');
            // 返回完整结果，包含 devCode
            return result;
        }
        return result;
    } catch (error) {
        window.UI.showToast(error.message || '发送失败', 'error');
        return { success: false };
    }
}

/**
 * 验证并登录
 */
async function verifyAndLogin(email, code, nickname) {
    try {
        const result = await window.API.Auth.verifyAndLogin(email, code, nickname);
        if (result.success) {
            currentUser = result.data.user;
            isAuthenticated = true;
            localStorage.setItem('token', result.data.token);
            updateAuthUI();
            window.UI.closeModal('authModal');
            window.UI.showToast(`欢迎回来，${currentUser.nickname}！`, 'success');
            return true;
        }
        return false;
    } catch (error) {
        window.UI.showToast(error.message || '登录失败', 'error');
        return false;
    }
}

/**
 * 登出
 */
async function logout() {
    try {
        await window.API.Auth.logout();
    } catch (error) {
        console.error('Logout error:', error);
    }

    currentUser = null;
    isAuthenticated = false;
    localStorage.removeItem('token');
    updateAuthUI();
    window.UI.showToast('已登出', 'success');
    navigateTo('home');
}

/**
 * 获取用户配额信息
 */
async function getUserQuota() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const response = await fetch('/api/auth/quota', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error('获取配额失败:', error);
        return null;
    }
}

/**
 * 更新认证相关 UI
 */
async function updateAuthUI() {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userPoints = document.getElementById('userPoints');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminDocsLink = document.getElementById('adminDocsLink');

    if (isAuthenticated && currentUser) {
        // 已登录
        if (userAvatar) {
            userAvatar.src = currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.nickname)}&background=F3BA2F&color=fff`;
            userAvatar.classList.remove('hidden');
        }
        if (userName) {
            userName.textContent = currentUser.nickname;
        }
        if (loginBtn) {
            loginBtn.classList.add('hidden');
        }
        if (logoutBtn) {
            logoutBtn.classList.remove('hidden');
        }
        // 管理员功能
        if (adminDocsLink && currentUser.isAdmin) {
            adminDocsLink.classList.remove('hidden');
        }

        // 显示配额信息
        if (userPoints) {
            const quota = await getUserQuota();
            if (quota) {
                const remaining = quota.remaining?.ai_chat || 0;
                const limit = quota.limits?.ai_chat || 50;
                userPoints.textContent = `AI: ${remaining}/${limit}`;
                userPoints.title = `今日已使用 ${limit - remaining}/${limit} 次 AI 聊天`;
            } else {
                userPoints.textContent = 'AI: --/--';
            }
        }
    } else {
        // 未登录
        if (userAvatar) {
            userAvatar.classList.add('hidden');
        }
        if (loginBtn) {
            loginBtn.classList.remove('hidden');
        }
        if (logoutBtn) {
            logoutBtn.classList.add('hidden');
        }
        if (adminDocsLink) {
            adminDocsLink.classList.add('hidden');
        }
        if (userPoints) {
            // 未登录用户也显示配额
            const quota = await getUserQuota();
            if (quota) {
                const remaining = quota.remaining?.ai_chat || 0;
                const limit = quota.limits?.ai_chat || 5;
                userPoints.textContent = `AI: ${remaining}/${limit}`;
                userPoints.title = '登录后可获得更多配额';
            }
        }
    }
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
 * 打开登录模态框
 */
function openLoginModal() {
    if (isAuthenticated) {
        toggleUserMenu();
    } else {
        window.UI.openModal('authModal');
    }
}

// 导出认证模块
window.Auth = {
    init: initAuth,
    sendCode: sendVerificationCode,
    verifyAndLogin,
    logout,
    getCurrentUser: () => currentUser,
    isAuthenticated: () => isAuthenticated,
    openLoginModal,
    openAuthModal: openLoginModal
};

// 导出函数到 window（供 HTML 调用）
window.logout = logout;
window.toggleUserMenu = toggleUserMenu;
window.openLoginModal = openLoginModal;
