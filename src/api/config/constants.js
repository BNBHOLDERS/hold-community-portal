/**
 * 应用常量定义
 * 统一管理所有魔法数字和配置值
 */

/**
 * 时间常量（毫秒）
 */
const TIME = {
  ONE_SECOND: 1000,
  FIVE_SECONDS: 5 * 1000,
  TEN_SECONDS: 10 * 1000,
  THIRTY_SECONDS: 30 * 1000,
  ONE_MINUTE: 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  TEN_MINUTES: 10 * 60 * 1000,
  THIRTY_MINUTES: 30 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  SIX_HOURS: 6 * 60 * 60 * 1000,
  TWELVE_HOURS: 12 * 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
  ONE_MONTH: 30 * 24 * 60 * 60 * 1000
};

/**
 * AI 配置
 */
const AI = {
  // Claude 模型配置
  MAX_TOKENS: 4096,
  DEFAULT_MODEL: 'claude-sonnet-4-20250514',
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_TOP_P: 0.9,
  DEFAULT_TOP_K: 40,

  // 系统提示词
  SYSTEM_PROMPT: '你是 HOLD 社区的 AI 助手，专门帮助用户学习 BSC 链上知识、代币分析和风险识别。',

  // 缓存配置
  CACHE_ENABLED: true,
  CACHE_TTL: TIME.ONE_HOUR
};

/**
 * 认证配置
 */
const AUTH = {
  // JWT 配置
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: '7d',
  JWT_ALGORITHM: 'HS256',

  // 验证码配置
  CODE_LENGTH: 6,
  CODE_EXPIRES_IN: TIME.FIVE_MINUTES,
  CODE_SEND_INTERVAL: TIME.ONE_MINUTE,
  CODE_MAX_ATTEMPTS: 5,
  CODE_ATTEMPT_WINDOW: TIME.ONE_HOUR
};

/**
 * 分页配置
 */
const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,

  // 不同端点的默认限制
  ENDPOINTS: {
    DISCUSSIONS: 20,
    ARTICLES: 10,
    SHARES: 20,
    TOKEN_HOLDERS: 50,
    WALLET_ACTIVITY: 50,
    TRANSACTIONS: 20
  }
};

/**
 * 速率限制配置
 */
const RATE_LIMIT = {
  // 默认配置
  DEFAULT: {
    windowMs: TIME.ONE_MINUTE,
    maxRequests: 60
  },

  // AI 端点
  AI_CHAT: {
    windowMs: TIME.ONE_MINUTE,
    maxRequests: 10
  },
  AI_ANALYZE: {
    windowMs: TIME.ONE_MINUTE,
    maxRequests: 20
  },

  // 认证端点
  AUTH_SEND_CODE: {
    windowMs: TIME.ONE_HOUR,
    maxRequests: 5
  },
  AUTH_VERIFY: {
    windowMs: TIME.ONE_MINUTE,
    maxRequests: 10
  },

  // 内容端点
  CONTENT: {
    windowMs: TIME.ONE_MINUTE,
    maxRequests: 100
  },

  // Binance Web3 端点
  BINANCE: {
    windowMs: TIME.ONE_MINUTE,
    maxRequests: 30
  }
};

/**
 * 文件大小限制
 */
const FILE_SIZE = {
  MAX_JSON_SIZE: '1mb',
  MAX_UPLOAD_SIZE: '10mb'
};

/**
 * 数据库/存储限制
 */
const STORAGE = {
  // 内存存储最大记录数
  MAX_USERS: 10000,
  MAX_SESSIONS: 5000,
  MAX_VERIFICATION_CODES: 10000,
  MAX_ACTIVITIES: 1000,
  MAX_TRANSACTIONS: 10000,
  MAX_SENTIMENTS: 10000,

  // 数据持久化
  AUTO_SAVE_INTERVAL: TIME.ONE_MINUTE,
  BACKUP_INTERVAL: TIME.ONE_DAY,
  BACKUP_RETENTION_DAYS: 7
};

/**
 * 支持的区块链
 */
const CHAINS = {
  BSC: '56',
  BSC_TESTNET: '97',
  ETHEREUM: '1',
  BASE: '8453',
  SOLANA: 'CT_501',
  POLYGON: '137',
  ARBITRUM: '42161'
};

/**
 * 正则表达式模式
 */
const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ETH_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  SOL_ADDRESS: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  BSC_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  TX_HASH: /^0x[a-fA-F0-9]{64}$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
};

/**
 * HTTP 状态码
 */
const STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

/**
 * 用户等级配置
 */
const USER_LEVELS = {
  LEVEL_1: { level: 1, name: '新手', points: 0, color: '#9CA3AF' },
  LEVEL_2: { level: 2, name: '初级', points: 100, color: '#60A5FA' },
  LEVEL_3: { level: 3, name: '中级', points: 500, color: '#34D399' },
  LEVEL_4: { level: 4, name: '高级', points: 2000, color: '#FBBF24' },
  LEVEL_5: { level: 5, name: '专家', points: 10000, color: '#F87171' }
};

/**
 * 经验值奖励
 */
const XP_REWARDS = {
  DAILY_LOGIN: 5,
  POST_DISCUSSION: 10,
  POST_ARTICLE: 20,
  POST_SHARE: 10,
  RECEIVE_LIKE: 5,
  GIVE_LIKE: 2
};

/**
 * 内容分类
 */
const CONTENT_CATEGORIES = {
  DISCUSSION: ['general', 'security', 'analysis', 'trading'],
  ARTICLE: ['tutorial', 'news', 'analysis', 'guide'],
  SHARE: ['tools', 'docs', 'airdrop', 'other']
};

/**
 * 价格提醒条件
 */
const ALERT_CONDITIONS = {
  ABOVE: 'above',
  BELOW: 'below'
};

/**
 * 社交情绪类型
 */
const SENTIMENT_TYPES = {
  STRONGLY_BULLISH: 'strongly_bullish',
  BULLISH: 'bullish',
  NEUTRAL: 'neutral',
  BEARISH: 'bearish',
  STRONGLY_BEARISH: 'strongly_bearish'
};

/**
 * 环境变量名称
 */
const ENV_KEYS = {
  // 服务器
  PORT: 'PORT',
  NODE_ENV: 'NODE_ENV',

  // 认证
  JWT_SECRET: 'JWT_SECRET',
  ADMIN_EMAILS: 'ADMIN_EMAILS',

  // API 密钥
  ANTHROPIC_API_KEY: 'ANTHROPIC_API_KEY',
  GMGN_API_KEY: 'GMGN_API_KEY',
  ETHERSCAN_API_KEY: 'ETHERSCAN_API_KEY',

  // SMTP
  SMTP_HOST: 'SMTP_HOST',
  SMTP_PORT: 'SMTP_PORT',
  SMTP_USER: 'SMTP_USER',
  SMTP_PASS: 'SMTP_PASS',

  // Redis
  REDIS_URL: 'REDIS_URL',

  // CORS
  CORS_ORIGINS: 'CORS_ORIGINS'
};

/**
 * 获取常量值的辅助函数
 */
function getConstant(path, defaultValue = null) {
  const keys = path.split('.');
  let value = CONSTANTS;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return defaultValue;
    }
  }

  return value;
}

/**
 * 导出所有常量
 */
const CONSTANTS = {
  TIME,
  AI,
  AUTH,
  PAGINATION,
  RATE_LIMIT,
  FILE_SIZE,
  STORAGE,
  CHAINS,
  PATTERNS,
  STATUS,
  USER_LEVELS,
  XP_REWARDS,
  CONTENT_CATEGORIES,
  ALERT_CONDITIONS,
  SENTIMENT_TYPES,
  ENV_KEYS
};

module.exports = {
  ...CONSTANTS,
  getConstant
};
