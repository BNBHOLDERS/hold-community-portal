/**
 * 认证控制器
 * 处理用户注册、登录、验证码等
 */

const authService = require('../services/authService');

/**
 * 发送验证码
 */
async function sendCode(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: '邮箱不能为空' });
    }

    const result = await authService.sendVerificationCode(email);

    res.json({
      success: true,
      message: result.message,
      // 开发模式返回验证码，生���环境不返回
      devCode: result.devMode ? result.code : undefined
    });
  } catch (error) {
    console.error('Send Code Error:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/**
 * 注册
 */
async function register(req, res) {
  try {
    const { email, code, nickname } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: '邮箱和验证��不能为空' });
    }

    // 验证验证码
    authService.verifyCode(email, code);

    // 注册
    const { user, token } = await authService.register(email, nickname);

    res.json({
      success: true,
      data: { user, token },
      message: '注册成功'
    });
  } catch (error) {
    console.error('Register Error:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/**
 * 登录
 */
async function login(req, res) {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: '邮箱和验证码不能为空' });
    }

    // 验证验证码
    authService.verifyCode(email, code);

    // 登录
    const { user, token } = await authService.login(email);

    res.json({
      success: true,
      data: { user, token },
      message: '登录成功'
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/**
 * 登出
 */
async function logout(req, res) {
  try {
    // 从中间件获取用户ID
    const userId = req.userId;

    if (userId) {
      await authService.logout(userId);
    }

    res.json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    console.error('Logout Error:', error.message);
    res.status(500).json({ error: '登出失败' });
  }
}

/**
 * 获取当前用户信息
 */
async function getMe(req, res) {
  try {
    // 从中间件获取用户ID
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: '未登录' });
    }

    const user = authService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get Me Error:', error.message);
    res.status(500).json({ error: '获取用户信息失败' });
  }
}

/**
 * 更新个人资料
 */
async function updateProfile(req, res) {
  try {
    const userId = req.userId;
    const { nickname, avatar } = req.body;

    if (!userId) {
      return res.status(401).json({ error: '未登录' });
    }

    const user = authService.updateProfile(userId, { nickname, avatar });

    res.json({
      success: true,
      data: user,
      message: '更新成功'
    });
  } catch (error) {
    console.error('Update Profile Error:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/**
 * 获取用户统计（管理员）
 */
async function getStats(req, res) {
  try {
    const stats = authService.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get Stats Error:', error.message);
    res.status(500).json({ error: '获取统计失败' });
  }
}

module.exports = {
  sendCode,
  register,
  login,
  logout,
  getMe,
  updateProfile,
  getStats
};
