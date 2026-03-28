/**
 * 文档服务
 * 文件存储 + 内存缓存
 */

const fs = require('fs');
const path = require('path');

// 文档存储目录
const DOCS_DIR = path.join(__dirname, '../../docs');

// 确保目录存在
if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
}

// 内存缓存
const docsCache = new Map();

// 文档分类
const Categories = {
  QUICKSTART: 'quickstart',   // 快速开始
  SECURITY: 'security',       // 安全基础
  ANALYSIS: 'analysis',       // 代币分析
  TOOLS: 'tools',             // 链上工具
  TRADING: 'trading',         // 交易技巧
  RISK: 'risk',               // 风险管理
  MINDSET: 'mindset',         // 心态修炼
  ADVANCED: 'advanced'        // 高级教程
};

class DocsService {
  /**
   * 获取所有文档
   */
  getAll(publishedOnly = true) {
    const docs = [];

    try {
      const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.md'));

      for (const file of files) {
        const slug = file.replace('.md', '');
        const doc = this.getBySlug(slug);

        if (doc && (!publishedOnly || doc.published !== false)) {
          docs.push(doc);
        }
      }

      // 按 order 排序
      docs.sort((a, b) => (a.order || 999) - (b.order || 999));

      return docs;
    } catch (error) {
      console.error('Read docs error:', error.message);
      return [];
    }
  }

  /**
   * 根据 slug 获取文档
   */
  getBySlug(slug) {
    // 先检查缓存
    if (docsCache.has(slug)) {
      return docsCache.get(slug);
    }

    const filePath = path.join(DOCS_DIR, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const doc = this.parseDoc(slug, content);

      // 缓存
      docsCache.set(slug, doc);

      return doc;
    } catch (error) {
      console.error(`Read doc ${slug} error:`, error.message);
      return null;
    }
  }

  /**
   * 解析文档内容
   */
  parseDoc(slug, content) {
    const lines = content.split('\n');
    const frontmatter = {};
    let bodyStart = 0;

    // 解析 Frontmatter (YAML 风格: --- key: value ---)
    if (lines[0] === '---') {
      let i = 1;
      while (i < lines.length && lines[i] !== '---') {
        const line = lines[i];
        const colon = line.indexOf(':');
        if (colon > 0) {
          const key = line.slice(0, colon).trim();
          let value = line.slice(colon + 1).trim();
          if (value === 'true') value = true;
          if (value === 'false') value = false;
          if (!isNaN(value)) value = Number(value);
          frontmatter[key] = value;
        }
        i++;
      }
      bodyStart = i + 1;
    }

    return {
      slug,
      title: frontmatter.title || slug,
      category: frontmatter.category || 'other',
      content: lines.slice(bodyStart).join('\n').trim(),
      description: frontmatter.description || '',
      published: frontmatter.published !== false,
      order: frontmatter.order || 999,
      createdAt: frontmatter.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * 创建文档
   */
  create(docData) {
    const { slug, title, content, category, description, order } = docData;

    if (!slug || !title || !content) {
      throw new Error('slug、title、content 不能为空');
    }

    const filePath = path.join(DOCS_DIR, `${slug}.md`);

    if (fs.existsSync(filePath)) {
      throw new Error('文档已存在');
    }

    // 构建 Frontmatter + 内容
    const frontmatter = [
      '---',
      `title: ${title}`,
      `category: ${category || 'other'}`,
      `description: ${description || ''}`,
      `order: ${order || 999}`,
      `published: true`,
      `createdAt: ${new Date().toISOString()}`,
      '---',
      '',
      content
    ].join('\n');

    fs.writeFileSync(filePath, frontmatter, 'utf-8');

    // 清除缓存
    docsCache.delete(slug);

    return this.getBySlug(slug);
  }

  /**
   * 更新文档
   */
  update(slug, updates) {
    const doc = this.getBySlug(slug);

    if (!doc) {
      throw new Error('文档不存在');
    }

    const { title, content, category, description, published, order } = updates;

    // 更新字段
    if (title !== undefined) doc.title = title;
    if (content !== undefined) doc.content = content;
    if (category !== undefined) doc.category = category;
    if (description !== undefined) doc.description = description;
    if (published !== undefined) doc.published = published;
    if (order !== undefined) doc.order = order;
    doc.updatedAt = new Date().toISOString();

    // 构建文件内容
    const frontmatter = [
      '---',
      `title: ${doc.title}`,
      `category: ${doc.category}`,
      `description: ${doc.description}`,
      `order: ${doc.order}`,
      `published: ${doc.published}`,
      `createdAt: ${doc.createdAt}`,
      '---',
      '',
      doc.content
    ].join('\n');

    const filePath = path.join(DOCS_DIR, `${slug}.md`);
    fs.writeFileSync(filePath, frontmatter, 'utf-8');

    // 清除缓存
    docsCache.delete(slug);

    return this.getBySlug(slug);
  }

  /**
   * 删除文档
   */
  delete(slug) {
    const filePath = path.join(DOCS_DIR, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      throw new Error('文档不存在');
    }

    fs.unlinkSync(filePath);
    docsCache.delete(slug);

    return true;
  }

  /**
   * 搜索文档
   */
  search(query) {
    const docs = this.getAll(false); // 包括草稿
    const q = query.toLowerCase();

    return docs.filter(doc =>
      doc.title.toLowerCase().includes(q) ||
      doc.content.toLowerCase().includes(q) ||
      doc.description.toLowerCase().includes(q)
    );
  }

  /**
   * 初始化默认文档（首次运行时）
   */
  initDefaultDocs() {
    const defaultDocs = [
      {
        slug: 'quickstart',
        title: '快速开始',
        category: 'quickstart',
        description: '新手入门指南',
        order: 1,
        content: '# 快速开始\n\n欢迎来到 HOLD 社区，这里是你学习链上分析的起点。\n\n## 第一步：学会看数据\n\n不要相信任何人，只相信链上数据。\n\n## 第二步：识别风险\n\n学会识别蜜罐、假币、收割套路。'
      },
      {
        slug: 'security',
        title: '安全基础',
        category: 'security',
        description: '蜜罐识别与风险防范',
        order: 2,
        content: '# 安全基础\n\n## 蜜罐识别\n\n蜜罐是一种可以买入但不能卖出的代币。\n\n识别方法：\n1. 检查合约是否经过审计\n2. 查看流动性是否锁定\n3. 测试小额买入卖出'
      },
      {
        slug: 'analysis',
        title: '代币分析',
        category: 'analysis',
        description: '如何分析代币价值',
        order: 3,
        content: '# 代币分析\n\n## 基础指标\n\n- **流动性**：池子中的资金量\n- **持币人数**：持有该代币的地址数\n- **交易量**：24小时交易金额'
      },
      {
        slug: 'tools',
        title: '链上工具',
        category: 'tools',
        description: '必备工具介绍',
        order: 4,
        content: '# 链上工具\n\n## 必备工具\n\n1. **BscScan** - BSC 链浏览器\n2. **GMGN** - 代币分析平台\n3. **DEX Screener** - 跨链分析'
      },
      {
        slug: 'trading',
        title: '交易技巧',
        category: 'trading',
        description: '买入卖出策略',
        order: 5,
        content: '# 交易技巧\n\n## 买入时机\n\n- 不要追高\n- 看清流动性再入场\n- 小额测试\n\n## 卖出策略\n\n- 设置止盈点\n- 不要贪婪\n- 分批卖出'
      },
      {
        slug: 'risk',
        title: '风险管理',
        category: 'risk',
        description: '资金管理策略',
        order: 6,
        content: '# 风险管理\n\n## 资金管理\n\n- 只用闲钱投资\n- 单个项目不超过总资金的 10%\n- 设置止损线'
      },
      {
        slug: 'mindset',
        title: '心态修炼',
        category: 'mindset',
        description: '交易心理调整',
        order: 7,
        content: '# 心态修炼\n\n## 亏损后的调整\n\n1. 接受现实\n2. 总结教训\n3. 不要试图立即回本\n4. 休息一段时间'
      }
    ];

    // 检查是否已有文档
    const existingFiles = fs.existsSync(DOCS_DIR) ? fs.readdirSync(DOCS_DIR) : [];

    if (existingFiles.length === 0) {
      // 创建默认文档
      for (const doc of defaultDocs) {
        this.create(doc);
      }
      console.log(`✓ 初始化 ${defaultDocs.length} 篇默认文档`);
    }
  }

  /**
   * 清除缓存
   */
  clearCache() {
    docsCache.clear();
  }
}

module.exports = new DocsService();
