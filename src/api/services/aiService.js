/**
 * Claude AI 服务
 * 用于数据分析和知识问答
 * 支持多密钥轮换和 Redis 缓存
 */

const Anthropic = require('@anthropic-ai/sdk');
const apiKeys = require('../config/apiKeys');
const redis = require('./redisService');
const { AI: AI_CONFIG } = require('../config/constants');

class AIService {
  constructor() {
    this.clients = new Map(); // 密钥对应的客户端实例
  }

  /**
   * 获取或创建 Anthropic 客户端
   */
  getClient(apiKey) {
    if (!this.clients.has(apiKey)) {
      this.clients.set(apiKey, new Anthropic({ apiKey }));
    }
    return this.clients.get(apiKey);
  }

  /**
   * 聊天对话（支持历史记录、缓存）
   */
  async chat(message, history = []) {
    // 检查缓存
    const cacheKey = redis.keys ? redis.keys.AI_CHAT(message) : `ai:chat:${Buffer.from(message).toString('base64').slice(0, 50)}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('AI Chat 缓存命中');
      return cached;
    }

    // 获取 API 密钥
    const apiKey = apiKeys.getNextAnthropicKey();
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    try {
      const client = this.getClient(apiKey);

      // 构建消息列表
      const messages = [
        ...history.map(h => ({
          role: h.role === 'assistant' ? 'assistant' : 'user',
          content: h.content
        })),
        { role: 'user', content: message }
      ];

      const response = await client.messages.create({
        model: AI_CONFIG.DEFAULT_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: AI_CONFIG.MAX_TOKENS || 1024,
        messages,
        system: this.getSystemPrompt()
      });

      const reply = response.content[0].text;

      // 缓存结果（1小时）
      await redis.set(cacheKey, reply, 3600);

      return reply;
    } catch (error) {
      console.error('AI Chat Error:', error.message);
      throw error;
    }
  }

  /**
   * 分析代币
   */
  async analyzeToken(tokenData) {
    const apiKey = apiKeys.getRandomAnthropicKey();
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const prompt = this.buildTokenAnalysisPrompt(tokenData);

    const response = await this.getClient(apiKey).messages.create({
      model: AI_CONFIG.DEFAULT_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: AI_CONFIG.MAX_TOKENS || 2048,
      messages: [{ role: 'user', content: prompt }],
      system: '你是 HOLD 社区的 AI 助手，擅长分析代币和识别风险。'
    });

    return response.content[0].text;
  }

  /**
   * 诊断钱包
   */
  async diagnoseWallet(walletData) {
    const apiKey = apiKeys.getRandomAnthropicKey();
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const prompt = this.buildWalletDiagnosisPrompt(walletData);

    const response = await this.getClient(apiKey).messages.create({
      model: AI_CONFIG.DEFAULT_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: AI_CONFIG.MAX_TOKENS || 2048,
      messages: [{ role: 'user', content: prompt }],
      system: '你是 HOLD 社区的 AI 助手，擅长分析钱包交易行为。'
    });

    return response.content[0].text;
  }

  /**
   * 通用分析
   */
  async analyze(content, type = 'general') {
    const apiKey = apiKeys.getRandomAnthropicKey();
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const systemPrompt = type === 'security' ? '你是安全专家，擅长识别代币风险。' : this.getSystemPrompt();

    const response = await this.getClient(apiKey).messages.create({
      model: AI_CONFIG.DEFAULT_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: AI_CONFIG.MAX_TOKENS || 1024,
      messages: [{ role: 'user', content }],
      system: systemPrompt
    });

    return response.content[0].text;
  }

  /**
   * 系统提示词
   */
  getSystemPrompt() {
    return `你是 HOLD 社区的 AI 助手，帮助社区成员学习加密货币知识。

你的特点：
- 专业：基于数据说话，不瞎猜
- 客观：分析优缺点，不吹不黑
- 实用：给出可操作的建议
- 简洁：直击重点，不绕圈子

你的知识：
- BSC 链生态
- GMGN API 数据分析
- 代币安全检测
- 交易行为分析
- 风险识别

回答风格：
- 简洁明了
- 用数据和事实说话
- 给出具体建议
- 保持中立客观`;
  }

  /**
   * 构建代币分析提示词
   */
  buildTokenAnalysisPrompt(data) {
    return `请分析以下代币数据，给出专业评估：

【代币信息】
名称: ${data.symbol} - ${data.name}
价格: $${data.price}
流动性: $${data.liquidity}
持有人: ${data.holderCount}

【安全信息】
蜜罐: ${data.isHoneypot ? '是' : '否'}
买税: ${data.buyTax}%
卖税: ${data.sellTax}%

【持仓信息】
前10持有率: ${data.top10HolderRate}%
项目方持币: ${data.creatorHoldRate}%

请从以下角度分析：
1. 安全性评估
2. 流动性状况
3. 持仓分布
4. 风险提示
5. 操作建议`;
  }

  /**
   * 构建钱包诊断提示词
   */
  buildWalletDiagnosisPrompt(data) {
    return `请分析以下钱包的交易行为：

【基本信息】
地址: ${data.address}
持仓数量: ${data.holdingCount}
总价值: $${data.totalValue}

【交易统计】
交易次数: ${data.transactionCount}
胜率: ${data.winRate}%
总盈亏: $${data.totalPnL}

请从以下角度分析：
1. 交易风格
2. 主要问题
3. 改进建议
4. 修炼等级`;
  }

  /**
   * 获取服务状态
   */
  getStatus() {
    return {
      hasKey: apiKeys.hasAnthropicKey(),
      keyPool: apiKeys.getStatus().anthropic,
      cacheEnabled: redis.enabled
    };
  }
}

module.exports = new AIService();
