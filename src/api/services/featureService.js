/**
 * 功能建议投票服务
 * 社区成员可以提交功能建议，投票决定开发优先级
 */

const { v4: uuidv4 } = require('uuid');

// ��态定义
const Status = {
  PENDING: 'pending',       // 待评估
  ACCEPTED: 'accepted',     // 已接受
  DEVELOPING: 'developing', // 开发中
  RELEASED: 'released',     // 已发布
  REJECTED: 'rejected'      // 已拒绝
};

// 分类定义
const Category = {
  AI_TOOLS: 'ai_tools',         // AI工具
  DATA_FEATURES: 'data',        // 数据功能
  COMMUNITY: 'community',       // 社区功能
  UI_UX: 'ui_ux',              // 界面体验
  INTEGRATION: 'integration',   // 第三方集成
  OTHER: 'other'                // 其他
};

// 内存存储（生产环境应使用数据库）
const requests = [];
const votedIPs = new Map(); // requestId -> Set of IPs

// 预置建议数据
const seedData = [
  {
    id: uuidv4(),
    title: '添加 K线图表功能',
    description: '希望能在代币详情页添加K线图表，显示价格走势、成交量等信息，方便技术分析。',
    category: Category.DATA_FEATURES,
    votes: 42,
    status: Status.DEVELOPING,
    author: '社区成员',
    comments: [
      { content: '非常需要这个功能！', author: '匿名', createdAt: new Date(Date.now() - 86400000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: uuidv4(),
    title: '钱包地址标签功能',
    description: '希望能够给钱包地址添加标签，比如"做市商"、"巨鲸"、"项目方"等，方便识别。',
    category: Category.DATA_FEATURES,
    votes: 28,
    status: Status.ACCEPTED,
    author: '老韭菜',
    comments: [],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    title: '支持更多公链',
    description: '除了 BSC，希望能支持 Ethereum、Polygon、Arbitrum、Sui 等更多公链的数据查询。',
    category: Category.INTEGRATION,
    votes: 35,
    status: Status.PENDING,
    author: '多链玩家',
    comments: [
      { content: 'Polygon 很多项目都很有潜力', author: '匿名', createdAt: new Date().toISOString() }
    ],
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    title: '暗黑模式',
    description: '夜间使用时亮色太刺眼，希望增加暗黑模式切换。',
    category: Category.UI_UX,
    votes: 15,
    status: Status.PENDING,
    author: '夜猫子',
    comments: [],
    createdAt: new Date(Date.now() - 21600000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    title: 'AI 分析支持更多语言',
    description: '目前 AI 主要支持中文和英文，希望支持更多语言如日语、韩语等。',
    category: Category.AI_TOOLS,
    votes: 8,
    status: Status.PENDING,
    author: '国际化用户',
    comments: [],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    title: '移动端 APP',
    description: '希望有原生移动端 APP，使用更方便。',
    category: Category.UI_UX,
    votes: 56,
    status: Status.PENDING,
    author: '手机党',
    comments: [
      { content: 'PWA 也行', author: '匿名', createdAt: new Date().toISOString() },
      { content: '同意，移动端体验很重要', author: '匿名', createdAt: new Date().toISOString() }
    ],
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 初始化数据
requests.push(...seedData);
seedData.forEach(r => {
  votedIPs.set(r.id, new Set());
});

class FeatureService {
  /**
   * 获取所有建议
   */
  getAll(filters = {}) {
    let result = [...requests];

    // 状态筛选
    if (filters.status && filters.status !== 'all') {
      result = result.filter(r => r.status === filters.status);
    }

    // 分类筛选
    if (filters.category && filters.category !== 'all') {
      result = result.filter(r => r.category === filters.category);
    }

    // 排序
    const sortBy = filters.sort || 'hot'; // hot | new | votes
    if (sortBy === 'hot') {
      // 热门：投票数优先，时间次之
      result.sort((a, b) => b.votes - a.votes || new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'new') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'votes') {
      result.sort((a, b) => b.votes - a.votes);
    }

    return result;
  }

  /**
   * 根据 ID 获取建议
   */
  getById(id) {
    return requests.find(r => r.id === id);
  }

  /**
   * 创建新建议
   */
  create(data) {
    const request = {
      id: uuidv4(),
      title: data.title,
      description: data.description,
      category: data.category || Category.OTHER,
      votes: 0,
      status: Status.PENDING,
      author: data.author || '匿名',
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    requests.unshift(request);
    votedIPs.set(request.id, new Set());

    return request;
  }

  /**
   * 投票
   */
  vote(id, ipAddress) {
    const request = this.getById(id);
    if (!request) {
      throw new Error('建议不存在');
    }

    // 获取该建议的已投票IP集合
    const ips = votedIPs.get(id) || new Set();

    // 检查是否已投票
    if (ips.has(ipAddress)) {
      return { success: false, message: '已经投过票了', votes: request.votes };
    }

    // 记录投票
    ips.add(ipAddress);
    votedIPs.set(id, ips);

    // 增加投票数
    request.votes++;
    request.updatedAt = new Date().toISOString();

    return { success: true, votes: request.votes };
  }

  /**
   * 更新状态（管理员功能）
   */
  updateStatus(id, status, extra = {}) {
    const request = this.getById(id);
    if (!request) {
      throw new Error('建议不存在');
    }

    request.status = status;
    request.updatedAt = new Date().toISOString();

    if (status === Status.RELEASED) {
      request.releasedAt = new Date().toISOString();
    }
    if (extra.version) {
      request.version = extra.version;
    }

    return request;
  }

  /**
   * 添加评论
   */
  addComment(id, comment) {
    const request = this.getById(id);
    if (!request) {
      throw new Error('建议不存在');
    }

    const newComment = {
      content: comment.content,
      author: comment.author || '匿名',
      createdAt: new Date().toISOString()
    };

    request.comments.push(newComment);
    request.updatedAt = new Date().toISOString();

    return newComment;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const total = requests.length;
    const totalVotes = requests.reduce((sum, r) => sum + r.votes, 0);
    const byStatus = {};
    const byCategory = {};

    for (const r of requests) {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
      byCategory[r.category] = (byCategory[r.category] || 0) + 1;
    }

    return {
      total,
      totalVotes,
      byStatus,
      byCategory,
      topRequests: requests
        .sort((a, b) => b.votes - a.votes)
        .slice(0, 5)
        .map(r => ({ id: r.id, title: r.title, votes: r.votes }))
    };
  }

  /**
   * 获取状态名称
   */
  getStatusName(status) {
    const names = {
      'pending': '待评估',
      'accepted': '已接受',
      'developing': '开发中',
      'released': '已发布',
      'rejected': '已拒绝'
    };
    return names[status] || status;
  }

  /**
   * 获取分类名称
   */
  getCategoryName(category) {
    const names = {
      'ai_tools': 'AI工具',
      'data': '数据功能',
      'community': '社区功能',
      'ui_ux': '界面体验',
      'integration': '第三方集成',
      'other': '其他'
    };
    return names[category] || category;
  }
}

module.exports = new FeatureService();
