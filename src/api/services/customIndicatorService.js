/**
 * 自定义指标服务
 * 允许用户创建和存储自定义技术指标
 */

/**
 * 安全的数学表达式解析器
 * 防止代码注入攻击
 */
class SafeExpressionParser {
    // 允许的运算符和符号
    static ALLOWED_CHARS = /^[0-9+\-*/().\s]+$/;

    // 最大表达式长度（防止复杂攻击）
    static MAX_EXPRESSION_LENGTH = 100;

    // 最大嵌套深度
    static MAX_NESTING_DEPTH = 5;

    /**
     * 安全计算数学表达式
     * 仅允许: 数字, 四则运算符, 括号, 空格
     */
    static evaluate(expression, variables = {}) {
        // 1. 验证表达式长度
        if (expression.length > this.MAX_EXPRESSION_LENGTH) {
            throw new Error('表达式过长');
        }

        // 2. 白名单验证：只允许数字、运算符、括号、空格和小数点
        if (!this.ALLOWED_CHARS.test(expression)) {
            throw new Error('非法表达式：包含不允许的字符');
        }

        // 3. 验证括号匹配
        const openParens = (expression.match(/\(/g) || []).length;
        const closeParens = (expression.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
            throw new Error('括号不匹配');
        }

        // 4. 验证嵌套深度
        let depth = 0;
        let maxDepth = 0;
        for (const char of expression) {
            if (char === '(') {
                depth++;
                if (depth > maxDepth) maxDepth = depth;
            } else if (char === ')') {
                depth--;
            }
        }
        if (maxDepth > this.MAX_NESTING_DEPTH) {
            throw new Error('表达式嵌套过深');
        }

        // 5. 验证和替换变量
        let evalExpression = expression;
        for (const [key, value] of Object.entries(variables)) {
            // 验证变量名
            if (!/^[a-z][a-z0-9]*$/i.test(key)) {
                throw new Error(`非法变量名: ${key}`);
            }

            // 验证变量值是数字
            const numValue = parseFloat(value);
            if (isNaN(numValue) || !isFinite(numValue)) {
                throw new Error(`变量 ${key} 的值必须为数字`);
            }

            // 替换变量
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            evalExpression = evalExpression.replace(regex, numValue.toString());
        }

        // 6. 再次验证替换后的表达式
        if (!this.ALLOWED_CHARS.test(evalExpression)) {
            throw new Error('非法表达式：变量值包含非法字符');
        }

        // 7. 防止空表达式
        if (!evalExpression.trim()) {
            throw new Error('表达式不能为空');
        }

        // 8. 安全计算
        try {
            // 使用 Function 构造器（比 eval 稍安全，配合上面的验证）
            // 使用 'use strict' 模式
            const result = new Function('"use strict"; return (' + evalExpression + ')')();

            // 9. 验证结果
            if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
                throw new Error('表达式计算结果无效');
            }

            return result;
        } catch (error) {
            throw new Error('表达式计算失败: ' + error.message);
        }
    }
}

class CustomIndicatorService {
    constructor() {
        // 指标定义: { id, name, description, formula, createdBy, isPublic, createdAt }
        this.indicators = new Map();
        // 指标计算结果缓存
        this.cache = new Map();
        // 允许的变量名白名单
        this.allowedVariables = ['price', 'volume', 'liquidity', 'holders', 'marketcap'];
    }

    /**
     * 验证公式安全性
     */
    validateFormula(formula) {
        if (!formula || typeof formula !== 'string') {
            return { valid: false, error: '公式不能为空' };
        }

        // 检查是否只包含允许的变量和运算符
        const tokens = formula.split(/([+\-*/().\s])/).filter(t => t.trim());
        for (const token of tokens) {
            const trimmed = token.trim();
            if (trimmed && !/^[0-9.]+$/.test(trimmed)) {
                // 不是数字，检查是否是允许的变量
                if (!this.allowedVariables.includes(trimmed) &&
                    !['+', '-', '*', '/', '(', ')', '**'].includes(trimmed)) {
                    return { valid: false, error: `非法变量或运算符: ${trimmed}` };
                }
            }
        }

        return { valid: true };
    }

    /**
     * 创建指标
     */
    createIndicator(name, description, formula, createdBy = 'anonymous', isPublic = false) {
        // 验证公式
        const validation = this.validateFormula(formula);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        const id = `indicator_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

        const indicator = {
            id,
            name,
            description,
            formula, // 简化的公式表达式
            createdBy,
            isPublic,
            createdAt: new Date().toISOString(),
            usageCount: 0
        };

        this.indicators.set(id, indicator);
        return indicator;
    }

    /**
     * 获取所有指标
     */
    getAllIndicators(includePrivate = false) {
        const all = Array.from(this.indicators.values());
        if (includePrivate) return all;
        return all.filter(i => i.isPublic);
    }

    /**
     * 获取用户指标
     */
    getUserIndicators(userId) {
        return Array.from(this.indicators.values()).filter(i => i.createdBy === userId);
    }

    /**
     * 获取指标详情
     */
    getIndicator(id) {
        return this.indicators.get(id);
    }

    /**
     * 删除指标
     */
    deleteIndicator(id) {
        return this.indicators.delete(id);
    }

    /**
     * 计算指标值（安全版）
     */
    calculate(indicatorId, data) {
        const indicator = this.indicators.get(indicatorId);
        if (!indicator) return null;

        try {
            // 准备变量
            const variables = {
                price: parseFloat(data.price) || 0,
                volume: parseFloat(data.volume) || 0,
                liquidity: parseFloat(data.liquidity) || 0,
                holders: parseFloat(data.holders) || 0,
                marketcap: parseFloat(data.marketcap) || 0
            };

            // 使用安全的表达式解析器
            const result = SafeExpressionParser.evaluate(indicator.formula, variables);

            // 验证结果是有限数字
            if (!isFinite(result) || isNaN(result)) {
                throw new Error('计算结果无效');
            }

            // 更新使用计数
            indicator.usageCount++;

            return {
                indicatorId,
                name: indicator.name,
                value: result,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                indicatorId,
                name: indicator.name,
                value: null,
                error: error.message || '计算失败'
            };
        }
    }

    /**
     * 获取预定义指标模板
     */
    getTemplates() {
        return [
            {
                id: 'tpl_1',
                name: '流动性加权价格',
                description: '价格 × 流动性 / 1000000',
                formula: 'price * liquidity / 1000000'
            },
            {
                id: 'tpl_2',
                name: '持币集中度',
                description: '10000 / 持币人数',
                formula: '10000 / holders'
            },
            {
                id: 'tpl_3',
                name: '交易活跃度',
                description: '交易量 × 100 / 流动性',
                formula: 'volume * 100 / liquidity'
            },
            {
                id: 'tpl_4',
                name: '安全得分',
                description: '持币人数 × 10 / 100',
                formula: 'holders * 10 / 100'
            }
        ];
    }

    /**
     * 获取统计
     */
    getStats() {
        return {
            totalIndicators: this.indicators.size,
            publicIndicators: Array.from(this.indicators.values()).filter(i => i.isPublic).length
        };
    }
}

module.exports = new CustomIndicatorService();
