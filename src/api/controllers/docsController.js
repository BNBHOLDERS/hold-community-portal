/**
 * 文档控制器 - 中文内容
 * 知识库文档管理
 */

// 文档数据
const docs = {
    quickstart: {
        title: '快速开始',
        content: '# 快速开始\n\n欢迎来到 HOLD 社区，这里是你学习链上分析的起点。\n\n## 第一步：学会看数据\n\n不要相信任何人，只相信链上数据。\n\n## 第二步：识别风险\n\n学会识别蜜罐、假币、收割套路。'
    },
    security: {
        title: '安全基础',
        content: '# 安全基础\n\n## 蜜罐识别\n\n蜜罐是一种可以买入但不能卖出的代币。\n\n识别方法：\n1. 检查合约是否经过审计\n2. 查看流动性是否锁定\n3. 测试小额买入卖出'
    },
    analysis: {
        title: '代币分析',
        content: '# 代币分析\n\n## 基础指标\n\n- **流动性**：池子中的资金量\n- **持币人数**：持有该代币的地址数\n- **交易量**：24小时交易金额'
    },
    tools: {
        title: '链上工具',
        content: '# 链上工具\n\n## 必备工具\n\n1. **BscScan** - BSC 链浏览器\n2. **GMGN** - 代币分析平台\n3. **DEX Screener** - 跨链分析'
    },
    trading: {
        title: '交易技巧',
        content: '# 交易技巧\n\n## 买入时机\n\n- 不要追高\n- 看清流动性再入场\n- 小额测试\n\n## 卖出策略\n\n- 设置止盈点\n- 不要贪婪\n- 分批卖出'
    },
    risk: {
        title: '风险管理',
        content: '# 风险管理\n\n## 资金管理\n\n- 只用闲钱投资\n- 单个项目不超过总资金的 10%\n- 设置止损线'
    },
    mindset: {
        title: '心态修炼',
        content: '# 心态修炼\n\n## 亏损后的调整\n\n1. 接受现实\n2. 总结教训\n3. 不要试图立即回本\n4. 休息一段时间'
    }
};

/**
 * 获取文档列表
 */
async function getDocs(req, res) {
    try {
        const docList = Object.keys(docs).map(key => ({
            slug: key,
            title: docs[key].title
        }));

        res.json({ success: true, data: docList });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * 获取单个文档
 */
async function getDoc(req, res) {
    try {
        const { slug } = req.params;

        if (docs[slug]) {
            res.json({
                success: true,
                data: {
                    slug,
                    title: docs[slug].title,
                    content: docs[slug].content
                }
            });
        } else {
            res.status(404).json({ error: '文档不存在' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * 搜索文档
 */
async function searchDocs(req, res) {
    try {
        const { q } = req.query;

        if (!q) {
            return getDocs(req, res);
        }

        const results = Object.keys(docs)
            .filter(key => {
                const doc = docs[key];
                return doc.title.includes(q) || doc.content.includes(q);
            })
            .map(key => ({
                slug: key,
                title: docs[key].title,
                snippet: docs[key].content.slice(0, 200)
            }));

        res.json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getDocs,
    getDoc,
    searchDocs
};
