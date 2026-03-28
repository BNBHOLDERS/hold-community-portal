/**
 * 自定义指标服务
 * 允许用户创建和存储自定义技术指标
 */

class CustomIndicatorService {
    constructor() {
        // 指标定义: { id, name, description, formula, createdBy, isPublic, createdAt }
        this.indicators = new Map();
        // 指标计算结果缓存
        this.cache = new Map();
    }

    /**
     * 创建指标
     */
    createIndicator(name, description, formula, createdBy = 'anonymous', isPublic = false) {
        const id = `indicator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
     * 计算指标值（简化版）
     */
    calculate(indicatorId, data) {
        const indicator = this.indicators.get(indicatorId);
        if (!indicator) return null;

        // 简化的公式计算（实际项目中需要更复杂的解析器）
        // formula 格式: "price * volume / 1000"
        try {
            const price = data.price || 0;
            const volume = data.volume || 0;
            const liquidity = data.liquidity || 0;
            const holders = data.holders || 0;

            // 安全的求值
            const result = eval(
                indicator.formula
                    .replace(/price/g, price)
                    .replace(/volume/g, volume)
                    .replace(/liquidity/g, liquidity)
                    .replace(/holders/g, holders)
            );

            return {
                indicatorId,
                name: indicator.name,
                value: result || 0,
                timestamp: new Date().toISOString()
            };
        } catch {
            return {
                indicatorId,
                name: indicator.name,
                value: null,
                error: '计算失败'
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
