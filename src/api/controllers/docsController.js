/**
 * 文档控制器 - 中文内容
 * 知识库文档管理
 */

const docsService = require('../services/docsService');
const { admin } = require('../middleware/admin');

// 初始化默认文档
docsService.initDefaultDocs();

/**
 * 获取文档列表
 */
async function getDocs(req, res) {
    try {
        const docs = docsService.getAll(true);
        const docList = docs.map(doc => ({
            slug: doc.slug,
            title: doc.title,
            category: doc.category,
            description: doc.description,
            order: doc.order
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
        const doc = docsService.getBySlug(slug);

        if (doc) {
            // 检查是否发布
            if (doc.published === false) {
                return res.status(404).json({ error: '文档不存在' });
            }

            res.json({
                success: true,
                data: {
                    slug: doc.slug,
                    title: doc.title,
                    category: doc.category,
                    description: doc.description,
                    content: doc.content
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

        const results = docsService.search(q).map(doc => ({
            slug: doc.slug,
            title: doc.title,
            category: doc.category,
            description: doc.description,
            snippet: doc.content.slice(0, 200) + '...'
        }));

        res.json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * 创建文档（管理员）
 */
async function createDoc(req, res) {
    try {
        const { slug, title, content, category, description, order } = req.body;

        const doc = docsService.create({
            slug,
            title,
            content,
            category,
            description,
            order
        });

        res.json({
            success: true,
            data: doc,
            message: '文档创建成功'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * 更新文档（管理员）
 */
async function updateDoc(req, res) {
    try {
        const { slug } = req.params;
        const updates = req.body;

        const doc = docsService.update(slug, updates);

        res.json({
            success: true,
            data: doc,
            message: '文档更新成功'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * 删除文档（管理员）
 */
async function deleteDoc(req, res) {
    try {
        const { slug } = req.params;

        docsService.delete(slug);

        res.json({
            success: true,
            message: '文档删除成功'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * 获取所有文档（包括草稿，管理员用）
 */
async function getAdminDocs(req, res) {
    try {
        const docs = docsService.getAll(false);

        res.json({
            success: true,
            data: docs
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getDocs,
    getDoc,
    searchDocs,
    createDoc,
    updateDoc,
    deleteDoc,
    getAdminDocs
};
