/**
 * 查询统计服务
 * 记录和统计代币、钱包查询次数
 */

class QueryStatsService {
    constructor() {
        // 存储查询统计: { address: { type, count, lastQueried, symbol } }
        this.stats = new Map();
        this.maxSize = 1000; // 最多保存1000条记录
    }

    /**
     * 记录查询
     */
    record(type, address, metadata = {}) {
        const key = `${type}:${address}`;
        const existing = this.stats.get(key);

        if (existing) {
            existing.count++;
            existing.lastQueried = new Date().toISOString();
            if (metadata.symbol) existing.symbol = metadata.symbol;
        } else {
            // 如果超过最大容量，删除最旧的记录
            if (this.stats.size >= this.maxSize) {
                let oldest = null;
                let oldestTime = Date.now();
                for (const [k, v] of this.stats.entries()) {
                    if (new Date(v.lastQueried).getTime() < oldestTime) {
                        oldest = k;
                        oldestTime = new Date(v.lastQueried).getTime();
                    }
                }
                if (oldest) this.stats.delete(oldest);
            }

            this.stats.set(key, {
                type,
                address,
                symbol: metadata.symbol || null,
                count: 1,
                lastQueried: new Date().toISOString()
            });
        }

        return this.stats.get(key);
    }

    /**
     * 获取热门代币（按查询次数）
     */
    getPopularTokens(limit = 10) {
        const tokens = [];

        for (const [key, data] of this.stats.entries()) {
            if (data.type === 'token') {
                tokens.push(data);
            }
        }

        return tokens
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    /**
     * 获取热门钱包（按查询次数）
     */
    getPopularWallets(limit = 10) {
        const wallets = [];

        for (const [key, data] of this.stats.entries()) {
            if (data.type === 'wallet') {
                wallets.push(data);
            }
        }

        return wallets
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    /**
     * 获取所有热门查询
     */
    getPopular(limit = 20) {
        const all = Array.from(this.stats.values());
        return all
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    /**
     * 获取统计信息
     */
    getStats() {
        return {
            totalQueries: Array.from(this.stats.values()).reduce((sum, item) => sum + item.count, 0),
            uniqueTokens: Array.from(this.stats.values()).filter(i => i.type === 'token').length,
            uniqueWallets: Array.from(this.stats.values()).filter(i => i.type === 'wallet').length
        };
    }
}

module.exports = new QueryStatsService();
