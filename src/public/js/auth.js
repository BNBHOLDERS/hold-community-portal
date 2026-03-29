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
            showToast(result.message || '验证码已发送', 'success');
            // 开发模式：如果有 devCode，显示给用户
            if (result.devCode) {
                console.log('[开发模式] 验证码:', result.devCode);
            }
            return true;
        }
        return false;
    } catch (error) {
        showToast(error.message || '发送失败', 'error');
        return false;
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
            closeModal('loginModal');
            showToast(`欢迎回来，${currentUser.nickname}！`, 'success');
            return true;
        }
        return false;
    } catch (error) {
        showToast(error.message || '登录失败', 'error');
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
    showToast('已登出', 'success');
    navigateTo('home');
}

/**
 * 更新认证相关 UI
 */
function updateAuthUI() {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
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
        openModal('loginModal');
    }
}

// 导出认证模块
window.Auth = {
    init: initAuth,
    sendCode: sendVerificationCode,
    verifyAndLogin,
    logout,
    getCurrentUser: () => currentUser,
    isAuthenticated: () => isAuthenticated
};
