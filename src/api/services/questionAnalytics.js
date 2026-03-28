/**
 * 问题分析服务
 * 记录用户 AI 对话，分类问题类型，统计常见困难
 */

const { v4: uuidv4 } = require('uuid');

// 问题类型定义
const QuestionTypes = {
  NEWBIE: 'newbie',           // 新手基础 - 什么是区块链、如何开始
  SECURITY: 'security',       // 安全相关 - 蜜罐识别、防骗
  TRADING: 'trading',         // 交易技巧 - 买卖时机、止盈止损
  TOKEN: 'token_analysis',    // 代币分析 - 选币、基本面
  WALLET: 'wallet',           // 钱包使用 - 如何创建、转账
  TOOLS: 'tools',             // 工具使用 - BscScan、GMGN
  RUG: 'rug_scam',           // 防骗识别 - 避免被割
  MINDSET: 'mindset',         // 心态调整 - FOMO、亏损后
  OTHER: 'other'              // 其他
};

// 关键词匹配规则（简化版）
const Keywords = {
  [QuestionTypes.NEWBIE]: ['新手', '小白', '零基础', '不懂', '入门', '开始', '什么是', '怎么买', '如何开始'],
  [QuestionTypes.SECURITY]: ['蜜罐', '假币', '安全', '防骗', 'honeypot', '骗局', '风险', '审计'],
  [QuestionTypes.TRADING]: ['买入', '卖出', '止盈', '止损', '仓位', '时机', '交易', '策略'],
  [QuestionTypes.TOKEN]: ['代币', '项目', '基本面', '市值', '持币', 'distribution', 'holder'],
  [QuestionTypes.WALLET]: ['钱包', '创建钱包', '转账', '私钥', '助记词', 'MetaMask', 'Trust Wallet'],
  [QuestionTypes.TOOLS]: ['工具', 'BscScan', 'GMGN', 'DEX Screener', '怎么用', '如何查看'],
  [QuestionTypes.RUG]: ['被割', '收割', 'rug', '跑路', '撤池', '归零'],
  [QuestionTypes.MINDSET]: ['fomo', '追高', '心态', '亏损', '害怕', '焦虑', '后悔']
};

// 内存存储（生产环境应使用数据库）
const questions = [];

class QuestionAnalytics {
  /**
   * 分类用户问题
   */
  classifyQuestion(question) {
    const q = question.toLowerCase();

    // 关键词匹配
    for (const [type, keywords] of Object.entries(Keywords)) {
      for (const keyword of keywords) {
        const lowerKeyword = keyword.toLowerCase();
        if (q.includes(lowerKeyword)) {
          return type;
        }
      }
    }

    return QuestionTypes.OTHER;
  }

  /**
   * 评估问题难度 (1-5)
   */
  assessDifficulty(question, type) {
    // 简单问题
    if (question.length < 20) return 1;
    if (question.includes('是什么') || question.includes('怎么')) return 2;

    // 中等问题
    if (question.length > 50) return 3;

    // 复杂问题
    if (question.includes('为什么') || question.includes('如何分析')) return 4;

    return 3;
  }

  /**
   * 记录问题
   */
  async recordQuestion(question, reply, userId = null) {
    const record = {
      questionId: uuidv4(),
      userId,
      question,
      reply,
      type: this.classifyQuestion(question),
      difficulty: this.assessDifficulty(question),
      timestamp: new Date().toISOString(),
      resolved: !!reply
    };

    questions.push(record);

    // 限制内存存储数量
    if (questions.length > 10000) {
      questions.shift(); // 移除最老的记录
    }

    return record;
  }

  /**
   * 获取统计
   */
  getStats() {
    const typeStats = {};
    const difficultyStats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    for (const q of questions) {
      typeStats[q.type] = (typeStats[q.type] || 0) + 1;
      difficultyStats[q.difficulty] = (difficultyStats[q.difficulty] || 0) + 1;
    }

    return {
      total: questions.length,
      byType: typeStats,
      byDifficulty: difficultyStats
    };
  }

  /**
   * 获取常见问题
   */
  getCommonQuestions(limit = 10) {
    const counts = {};

    for (const q of questions) {
      const key = q.question.toLowerCase().slice(0, 50); // 前50个字符作为key
      counts[key] = (counts[key] || 0) + 1;
    }

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([question, count]) => ({ question, count }));
  }

  /**
   * 获取当前困难点（用户最常遇到的问题类型）
   */
  getCurrentPainPoints() {
    const stats = this.getStats().byType;

    return Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({
        type,
        count,
        typeName: this.getTypeName(type)
      }));
  }

  /**
   * 获取类型名称
   */
  getTypeName(type) {
    const names = {
      'newbie': '新手入门',
      'security': '安全防骗',
      'trading': '交易技巧',
      'token_analysis': '代币分析',
      'wallet': '钱包使用',
      'tools': '工具使用',
      'rug_scam': '防骗识别',
      'mindset': '心态调整',
      'other': '其他问题'
    };
    return names[type] || type;
  }

  /**
   * 清理旧数据
   */
  clearOldRecords(daysToKeep = 30) {
    const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const before = questions.length;
    const filtered = questions.filter(q => new Date(q.timestamp).getTime() > cutoff);

    questions.length = 0;
    questions.push(...filtered);

    return {
      removed: before - questions.length,
      remaining: questions.length
    };
  }
}

module.exports = new QuestionAnalytics();
