/**
 * 社交情绪分析服务
 * 分析社交媒体和社区讨论的情绪倾向
 */

class SentimentAnalysisService {
    constructor() {
        // 情绪记录: { id, source, content, sentiment, score, keywords, timestamp }
        this.sentiments = [];
        // 关键词情绪映射
        this.keywordSentiment = {
            // 积极词汇
            bullish: ['涨', '牛市', '暴涨', '飞', '冲', '梭哈', '拿住', '长期', '看好', '买入', '多', '强'],
            positive: ['不错', '好', '可以', '支持', '赞', '优秀', '棒', '厉害', '牛', '赚'],
            // 消极词汇
            bearish: ['跌', '熊市', '暴跌', '崩', '割', '套', '跑', '抛', '空', '弱'],
            negative: ['差', '烂', '坑', '骗', '假', '水', '垃圾', '骗局', '臭', '输'],
            // 中性词汇
            neutral: ['观望', '等待', '看', '分析', '研究', '关注', '注意', '评估', '等']
        };
    }

    /**
     * 分析文本情绪
     */
    analyzeSentiment(text) {
        if (!text || typeof text !== 'string') {
            return { sentiment: 'neutral', score: 0, keywords: [] };
        }

        const scores = { bullish: 0, bearish: 0, positive: 0, negative: 0, neutral: 0 };
        const foundKeywords = [];

        // 检查关键词
        for (const [category, keywords] of Object.entries(this.keywordSentiment)) {
            for (const keyword of keywords) {
                if (text.includes(keyword)) {
                    scores[category]++;
                    foundKeywords.push({ keyword, category });
                }
            }
        }

        // 计算总分
        const bullishScore = scores.bullish + scores.positive;
        const bearishScore = scores.bearish + scores.negative;

        let sentiment, score;

        if (bullishScore > bearishScore && bullishScore > 0) {
            sentiment = bullishScore > 2 ? 'strongly_bullish' : 'bullish';
            score = Math.min(100, bullishScore * 20);
        } else if (bearishScore > bullishScore && bearishScore > 0) {
            sentiment = bearishScore > 2 ? 'strongly_bearish' : 'bearish';
            score = -Math.min(100, bearishScore * 20);
        } else {
            sentiment = 'neutral';
            score = 0;
        }

        return {
            sentiment,
            score,
            keywords: foundKeywords
        };
    }

    /**
     * 记录情绪分析
     */
    recordSentiment(source, content, metadata = {}) {
        const analysis = this.analyzeSentiment(content);

        const record = {
            id: `sent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            source, // 'twitter', 'discord', 'telegram', 'community'
            content: content.slice(0, 500), // 限制内容长度
            sentiment: analysis.sentiment,
            score: analysis.score,
            keywords: analysis.keywords.slice(0, 10), // 限制关键词数量
            metadata,
            timestamp: new Date().toISOString()
        };

        this.sentiments.push(record);

        // 限制记录数量
        if (this.sentiments.length > 10000) {
            this.sentiments.shift();
        }

        return record;
    }

    /**
     * 获取情绪统计
     */
    getSentimentStats(source = null, timeRange = 24) {
        let records = this.sentiments;

        // 过滤来源
        if (source) {
            records = records.filter(r => r.source === source);
        }

        // 过滤时间范围（小时）
        const cutoff = new Date(Date.now() - timeRange * 3600000);
        records = records.filter(r => new Date(r.timestamp) > cutoff);

        const stats = {
            total: records.length,
            bullish: 0,
            bearish: 0,
            neutral: 0,
            strongly_bullish: 0,
            strongly_bearish: 0,
            avgScore: 0,
            trend: []
        };

        let totalScore = 0;

        for (const record of records) {
            stats[record.sentiment]++;
            totalScore += record.score;
        }

        if (records.length > 0) {
            stats.avgScore = totalScore / records.length;
        }

        // 计算趋势（按小时分组）
        const hourly = {};
        for (const record of records) {
            const hour = new Date(record.timestamp).getHours();
            if (!hourly[hour]) hourly[hour] = { bullish: 0, bearish: 0 };
            if (record.sentiment.includes('bullish')) hourly[hour].bullish++;
            if (record.sentiment.includes('bearish')) hourly[hour].bearish++;
        }

        stats.trend = Object.entries(hourly)
            .sort((a, b) => a[0] - b[0])
            .map(([hour, data]) => ({ hour: parseInt(hour), ...data }));

        return stats;
    }

    /**
     * 获取热门关键词
     */
    getTopKeywords(limit = 20, timeRange = 24) {
        const cutoff = new Date(Date.now() - timeRange * 3600000);
        const recentRecords = this.sentiments.filter(r => new Date(r.timestamp) > cutoff);

        const keywordCounts = {};

        for (const record of recentRecords) {
            for (const kw of record.keywords) {
                const key = kw.keyword;
                if (!keywordCounts[key]) {
                    keywordCounts[key] = { count: 0, category: kw.category };
                }
                keywordCounts[key].count++;
            }
        }

        return Object.entries(keywordCounts)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, limit)
            .map(([keyword, data]) => ({ keyword, ...data }));
    }

    /**
     * 获取恐惧与贪婪指数
     */
    getFearGreedIndex() {
        const stats = this.getSentimentStats(null, 24);

        if (stats.total === 0) {
            return { index: 50, label: '中性' };
        }

        // 计算指数：0-100
        // 0 = 极度恐惧, 50 = 中性, 100 = 极度贪婪
        const bullishRatio = (stats.bullish + stats.strongly_bullish) / stats.total;
        const bearishRatio = (stats.bearish + stats.strongly_bearish) / stats.total;

        let index = 50;
        if (bullishRatio > bearishRatio) {
            index = 50 + (bullishRatio - bearishRatio) * 50;
        } else {
            index = 50 - (bearishRatio - bullishRatio) * 50;
        }

        let label;
        if (index < 20) label = '极度恐惧';
        else if (index < 40) label = '恐惧';
        else if (index < 60) label = '中性';
        else if (index < 80) label = '贪婪';
        else label = '极度贪婪';

        return {
            index: Math.round(index),
            label,
            bullish: Math.round(bullishRatio * 100),
            bearish: Math.round(bearishRatio * 100)
        };
    }

    /**
     * 获取所有情绪记录
     */
    getAllSentiments(limit = 100) {
        return this.sentiments.slice(-limit).reverse();
    }
}

module.exports = new SentimentAnalysisService();
