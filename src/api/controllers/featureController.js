/**
 * 功能建议控制器
 * 处理功能建议的 HTTP 请求
 */

const featureService = require('../services/featureService');

/**
 * 获取建议列表
 */
async function getRequests(req, res) {
  try {
    const { status, category, sort = 'hot' } = req.query;

    const list = featureService.getAll({ status, category, sort });

    res.json({
      success: true,
      data: list,
      total: list.length
    });
  } catch (error) {
    console.error('Get Requests Error:', error.message);
    res.status(500).json({ error: '获取列表失败' });
  }
}

/**
 * 获取单个建议详情
 */
async function getRequest(req, res) {
  try {
    const { id } = req.params;

    const request = featureService.getById(id);
    if (!request) {
      return res.status(404).json({ error: '建议不存在' });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Get Request Error:', error.message);
    res.status(500).json({ error: '获取详情失败' });
  }
}

/**
 * 创建新建议
 */
async function createRequest(req, res) {
  try {
    const { title, description, category, author } = req.body;

    // 参数验证
    if (!title || !title.trim()) {
      return res.status(400).json({ error: '标题不能为空' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: '描述不能为空' });
    }

    const request = featureService.create({
      title: title.trim(),
      description: description.trim(),
      category,
      author: author || '匿名'
    });

    res.json({
      success: true,
      data: request,
      message: '建议发布成功'
    });
  } catch (error) {
    console.error('Create Request Error:', error.message);
    res.status(500).json({ error: '发布失败' });
  }
}

/**
 * 投票
 */
async function voteRequest(req, res) {
  try {
    const { id } = req.params;

    // 获取客户端 IP
    const ipAddress = req.ip ||
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.connection.remoteAddress ||
      '127.0.0.1';

    const result = featureService.vote(id, ipAddress);

    if (result.success) {
      res.json({
        success: true,
        votes: result.votes,
        message: '投票成功'
      });
    } else {
      res.json({
        success: false,
        votes: result.votes,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Vote Error:', error.message);
    res.status(500).json({ error: '投票失败' });
  }
}

/**
 * 更新状态（管理员功能）
 */
async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, version } = req.body;

    if (!status) {
      return res.status(400).json({ error: '状态不能为空' });
    }

    const request = featureService.updateStatus(id, status, { version });

    res.json({
      success: true,
      data: request,
      message: '状态更新成功'
    });
  } catch (error) {
    console.error('Update Status Error:', error.message);
    res.status(500).json({ error: '更新失败' });
  }
}

/**
 * 添加评论
 */
async function addComment(req, res) {
  try {
    const { id } = req.params;
    const { content, author } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: '评论内容不能为空' });
    }

    const comment = featureService.addComment(id, {
      content: content.trim(),
      author: author || '匿名'
    });

    res.json({
      success: true,
      data: comment,
      message: '评论成功'
    });
  } catch (error) {
    console.error('Add Comment Error:', error.message);
    res.status(500).json({ error: '评论失败' });
  }
}

/**
 * 获取统计信息
 */
async function getStats(req, res) {
  try {
    const stats = featureService.getStats();

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
  getRequests,
  getRequest,
  createRequest,
  voteRequest,
  updateStatus,
  addComment,
  getStats
};
