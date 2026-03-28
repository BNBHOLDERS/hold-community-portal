/**
 * 内容控制器 - 带示例数据
 * 讨论区、投稿区、分享区
 */

// 示例数据
const discussions = [
    {
        id: '1',
        title: '如何识别蜜罐代币？',
        content: '最近遇到了好几个蜜罐，分享一下识别方法...',
        category: 'security',
        author: '链上老手',
        createdAt: new Date(Date.now() - 3600000),
        replies: [
            { author: '新手小王', content: '学到了，感谢分享！', time: new Date(Date.now() - 1800000) },
            { author: '币圈老兵', content: '补充一点��还要看流动性池', time: new Date(Date.now() - 900000) }
        ],
        views: 234
    },
    {
        id: '2',
        title: 'BSC 上有哪些好用的分析工具？',
        content: '新人求教，除了 GMGN 还有什么推荐的工具吗？',
        category: 'analysis',
        author: '币圈新人',
        createdAt: new Date(Date.now() - 7200000),
        replies: [
            { author: '数据分析师', content: '推荐 DEX Screener，跨链数据很全', time: new Date(Date.now() - 3600000) }
        ],
        views: 156
    },
    {
        id: '3',
        title: '今天被收割了，心态崩了',
        content: '没忍住追高，结果遇到砸盘...',
        category: 'trading',
        author: '亏损韭菜',
        createdAt: new Date(Date.now() - 14400000),
        replies: [],
        views: 89
    }
];

const articles = [
    {
        id: '1',
        title: '新手必看：如何看懂 BscScan',
        summary: '从零开始教你读懂链上数据，不靠别人，自己做判断。',
        content: 'BscScan 是 BSC 链的浏览器...',
        tags: ['新手', '教程', 'BscScan'],
        author: 'HOLD 社区',
        createdAt: new Date(Date.now() - 86400000),
        views: 1234,
        likes: 89
    },
    {
        id: '2',
        title: '流动性是什么？为什么重要？',
        summary: '深入解析流动性的概念，以及如何判断流动性是否充足。',
        content: '流动性是指池子中的资金量...',
        tags: ['流动性', '基础'],
        author: 'DeFi 讲师',
        createdAt: new Date(Date.now() - 172800000),
        views: 876,
        likes: 56
    },
    {
        id: '3',
        title: '常见收割套路解析',
        summary: '盘点币圈常见的收割方式，帮你避坑。',
        content: '第一种：拉高出货...',
        tags: ['安全', '防骗'],
        author: '安全专家',
        createdAt: new Date(Date.now() - 259200000),
        views: 2341,
        likes: 234
    }
];

const shares = [
    {
        id: '1',
        title: 'GMGN - 代币分析平台',
        url: 'https://gmgn.ai',
        description: '很好用的代币分析工具，可以看到持仓、交易记录',
        category: 'tools',
        author: '工具达人',
        createdAt: new Date(Date.now() - 3600000),
        likes: 45
    },
    {
        id: '2',
        title: 'DEX Screener',
        url: 'https://dexscreener.com',
        description: '跨链代币追踪，支持多条链',
        category: 'tools',
        author: '交易员小张',
        createdAt: new Date(Date.now() - 7200000),
        likes: 32
    },
    {
        id: '3',
        title: 'BscScan 教程',
        url: 'https://bscscan.com',
        description: '官方链浏览器，学会看链上数据',
        category: 'docs',
        author: 'HOLD 社区',
        createdAt: new Date(Date.now() - 86400000),
        likes: 67
    },
    {
        id: '4',
        title: '空投猎人必看',
        url: '#',
        description: '整理的空投项目列表，持续更新',
        category: 'airdrop',
        author: '空投猎人',
        createdAt: new Date(Date.now() - 172800000),
        likes: 123
    }
];

/**
 * 获取讨论列表
 */
async function getDiscussions(req, res) {
    try {
        const { category, limit = 20, offset = 0 } = req.query;

        let filtered = discussions;
        if (category && category !== 'all') {
            filtered = discussions.filter(d => d.category === category);
        }

        const result = filtered
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

        res.json({
            success: true,
            data: result,
            total: filtered.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * 创建讨论
 */
async function createDiscussion(req, res) {
    try {
        const { title, content, category = 'general', author = '匿名用户' } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: '标题和内容不能为空' });
        }

        const discussion = {
            id: Date.now().toString(),
            title,
            content,
            category,
            author,
            createdAt: new Date(),
            replies: [],
            views: 0
        };

        discussions.unshift(discussion);
        res.json({ success: true, data: discussion });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * 获取文章列表
 */
async function getArticles(req, res) {
    try {
        const { limit = 10, offset = 0 } = req.query;

        const result = articles
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

        res.json({
            success: true,
            data: result,
            total: articles.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * 创建文章
 */
async function createArticle(req, res) {
    try {
        const { title, content, summary, tags = [], author = '匿名作者' } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: '标题和内容不能为空' });
        }

        const article = {
            id: Date.now().toString(),
            title,
            content,
            summary: summary || content.slice(0, 200),
            tags,
            author,
            createdAt: new Date(),
            views: 0,
            likes: 0
        };

        articles.unshift(article);
        res.json({ success: true, data: article });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * 获取分享列表
 */
async function getShares(req, res) {
    try {
        const { category, limit = 20, offset = 0 } = req.query;

        let filtered = shares;
        if (category && category !== 'all') {
            filtered = shares.filter(s => s.category === category);
        }

        const result = filtered
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

        res.json({
            success: true,
            data: result,
            total: filtered.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * 创建分享
 */
async function createShare(req, res) {
    try {
        const { title, url, description, category = 'tools', author = '匿名' } = req.body;

        if (!title || !url) {
            return res.status(400).json({ error: '标题和链接不能为空' });
        }

        const share = {
            id: Date.now().toString(),
            title,
            url,
            description,
            category,
            author,
            createdAt: new Date(),
            likes: 0
        };

        shares.unshift(share);
        res.json({ success: true, data: share });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * 获取最新动态（首页）
 */
async function getLatest(req, res) {
    try {
        const latestDiscussions = discussions.slice(0, 3);
        const latestArticles = articles.slice(0, 3);
        const latestShares = shares.slice(0, 3);

        res.json({
            success: true,
            data: {
                discussions: latestDiscussions,
                articles: latestArticles,
                shares: latestShares
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * 点赞
 */
async function like(req, res) {
    try {
        const { type, id } = req.params;

        let item;
        if (type === 'articles') {
            item = articles.find(a => a.id === id);
        } else if (type === 'shares') {
            item = shares.find(s => s.id === id);
        } else if (type === 'discussions') {
            item = discussions.find(d => d.id === id);
        }

        if (item) {
            item.likes = (item.likes || 0) + 1;
            res.json({ success: true, likes: item.likes });
        } else {
            res.status(404).json({ error: '内容不存在' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    // 讨论区
    getDiscussions,
    createDiscussion,
    // 投稿区
    getArticles,
    createArticle,
    // 分享区
    getShares,
    createShare,
    // 通用
    getLatest,
    like
};
