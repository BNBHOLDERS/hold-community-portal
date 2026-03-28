/**
 * API 密钥管理器
 * 支持多密钥轮换，实现负载均衡和容错
 */

class APIKeyManager {
    constructor() {
        // Anthropic Claude API 密钥池
        this.anthropicKeys = [];
        this.anthropicIndex = 0;

        // GMGN API 密钥池
        this.gmgnKeys = [];
        this.gmgnIndex = 0;

        this.initKeys();
    }

    /**
     * 初始化 API 密钥
     */
    initKeys() {
        // 加载 Anthropic 密钥（支持多个）
        for (let i = 1; i <= 10; i++) {
            const key = process.env[`ANTHROPIC_API_KEY_${i}`];
            if (key && key !== `your_anthropic_api_key_${i}`) {
                this.anthropicKeys.push(key);
            }
        }
        // 兼容单个密钥配置
        const singleKey = process.env.ANTHROPIC_API_KEY;
        if (singleKey && singleKey !== 'your_anthropic_api_key_here' && !this.anthropicKeys.includes(singleKey)) {
            this.anthropicKeys.push(singleKey);
        }

        // 加载 GMGN 密钥（支持多个）
        for (let i = 1; i <= 5; i++) {
            const key = process.env[`GMGN_API_KEY_${i}`];
            if (key && key !== `your_gmgn_api_key_${i}`) {
                this.gmgnKeys.push(key);
            }
        }
        const singleGmgnKey = process.env.GMGN_API_KEY;
        if (singleGmgnKey && singleGmgnKey !== 'your_gmgn_api_key_here' && !this.gmgnKeys.includes(singleGmgnKey)) {
            this.gmgnKeys.push(singleGmgnKey);
        }
    }

    /**
     * 获取下一个 Anthropic API 密钥（轮换）
     */
    getNextAnthropicKey() {
        if (this.anthropicKeys.length === 0) {
            return null;
        }
        const key = this.anthropicKeys[this.anthropicIndex];
        this.anthropicIndex = (this.anthropicIndex + 1) % this.anthropicKeys.length;
        return key;
    }

    /**
     * 获取随机 Anthropic API 密钥
     */
    getRandomAnthropicKey() {
        if (this.anthropicKeys.length === 0) {
            return null;
        }
        return this.anthropicKeys[Math.floor(Math.random() * this.anthropicKeys.length)];
    }

    /**
     * 获取下一个 GMGN API 密钥
     */
    getNextGmgnKey() {
        if (this.gmgnKeys.length === 0) {
            return null;
        }
        const key = this.gmgnKeys[this.gmgnIndex];
        this.gmgnIndex = (this.gmgnIndex + 1) % this.gmgnKeys.length;
        return key;
    }

    /**
     * 检查是否有可用的 API 密钥
     */
    hasAnthropicKey() {
        return this.anthropicKeys.length > 0;
    }

    hasGmgnKey() {
        return this.gmgnKeys.length > 0;
    }

    /**
     * 获取密钥池状态
     */
    getStatus() {
        return {
            anthropic: {
                total: this.anthropicKeys.length,
                currentIndex: this.anthropicIndex
            },
            gmgn: {
                total: this.gmgnKeys.length,
                currentIndex: this.gmgnIndex
            }
        };
    }
}

module.exports = new APIKeyManager();
