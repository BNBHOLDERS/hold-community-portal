<div align="center">

<img src="src/public/favicon.png" width="120" alt="HOLD Logo"/>

# HOLD 社区门户

**HOLD Community Portal**

_让一个不懂的人，什么都懂_

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org)
[![Binance Web3](https://img.shields.io/badge/Binance-Web3%20API-F3BA2F)](https://www.binance.com/en/web3)

[🌐 加入社区 | Join Community](https://x.com/i/communities/2037817811884454394)

**BSC 社区知识学习平台 | BSC Community Knowledge Learning Platform**

</div>

---

## 📖 项目简介 | Project Overview

HOLD 社区门户是一个专为 BSC 持有者打造的知识学习平台，利用 AI 和链上数据分析帮助社区成员：

- 🎓 **学习代币分析** - Learn token analysis
- 🛡️ **识别链上风险** - Identify risks
- 🔧 **掌握链上工具** - Master on-chain tools
- 📈 **提升知识水平** - Improve knowledge level

---

## 🛠 技术栈 | Tech Stack

| 层 | Layer | 技术 | Technology |
|:---:|:---:|:---|:---|
| 🎨 **前端** | Frontend | HTML + Tailwind CSS | Glass Morphism UI |
| ⚙️ **后端** | Backend | Node.js + Express | RESTful API |
| 🤖 **AI** | AI | Claude AI | 智能对话与分析 |
| 📊 **数据源** | Data | Binance Web3 + GMGN + Etherscan + Alchemy | 多源数据聚合 |

---

## 📁 项目结构 | Framework Architecture

```
hold-community-portal/
├── src/
│   ├── server.js              # Express 入口
│   ├── public/
│   │   ├── index.html         # 前端 SPA 入口
│   │   ├── favicon.png        # 站点图标
│   │   ├── css/               # 样式模块
│   │   │   └── styles.css     # 主样式文件
│   │   └── js/                # JavaScript 模块
│   │       ├── config.js      # 配置和常量
│   │       ├── utils.js       # 工具函数
│   │       ├── api.js         # API 调用封装
│   │       ├── auth.js        # 认证模块
│   │       ├── components.js  # UI 组件
│   │       ├── pages.js       # 页面渲染逻辑
│   │       ├── binance.js     # Binance Web3 功能
│   │       ├── ai.js          # AI 工具功能
│   │       └── main.js        # 路由和入口
│   └── api/
│       ├── routes.js          # API 路由
│       ├── controllers/       # 控制器
│       │   ├── aiController.js          # AI 端点
│       │   ├── contentController.js     # 内容管理
│       │   ├── docsController.js        # 文档
│       │   ├── binanceWeb3Controller.js # Binance Web3
│       │   ├── tokenController.js       # 代币数据
│       │   ├── walletController.js      # 钱包数据
│       │   └── alertsController.js      # 价格提醒
│       └── services/          # 服务层
│           ├── aiService.js            # Claude AI
│           ├── binanceWeb3Service.js   # Binance Web3 API
│           ├── gmgnService.js          # GMGN API
│           ├── userQuotaService.js     # 用户配额管理
│           ├── questionAnalytics.js    # 问题分析
│           ├── redisService.js         # Redis 缓存
│           ├── dataPersistenceService.js # 数据持久化
│           ├── authService.js          # 用户认证
│           └── emailService.js         # 邮件服务
│       └── middleware/         # 中间件
│           ├── auth.js                 # 认证中间件
│           ├── admin.js                # 管理员权限
│           └── quota.js                # 配额检查
├── .env.example
├── package.json
└── README.md
```

---

## ✨ 功能导航 | Feature Navigation

### 📱 核心页面 | Core Pages
| 页面 | 状态 | 描述 |
|:---|:---:|:---|
| [首页](#home) | ✅ | 社区入口、新手必看、实时动态 |
| [讨论区](#discuss) | ✅ | 社区讨论、发帖互动 |
| [投稿区](#submit) | ✅ | 文章投稿、内容创作 |
| [分享区](#share) | ✅ | 资源分享、分类筛选 |

### 🤖 AI 工具 | AI Tools
| 工具 | 状态 | 描述 |
|:---|:---:|:---|
| AI 智能助手 | ✅ | 悬浮球随时对话 |
| 代币分析 | ✅ | AI 驱动的代币分析 |
| 钱包诊断 | ✅ | 钱包行为分析 |
| RUG 检测 | ✅ | 蜜罐与骗局识别 |
| 持仓分析 | ✅ | 持仓分布分析 |
| 交易助手 | ✅ | 买卖时机建议 |
| 安全评分 | ✅ | 合约安全评分 |
| 新手指引 | ✅ | 新手学习路径 |
| 心态修炼 | ✅ | 交易心理指导 |

### ⚡ Binance Web3 | 官方集成
| 功能 | 状态 | 描述 |
|:---|:---:|:---|
| 代币搜索 | ✅ | BSC/Base/Solana 代币查询 |
| 安全审计 | ✅ | 专业安全审计报告 |
| 钱包查询 | ✅ | 钱包持仓分析 |
| 聪明钱信号 | ✅ | Smart Money 追踪 |
| 代币详情 | ✅ | 完整代币信息 |

### 🛠 工具页面 | Tools
| 页面 | 状态 | 描述 |
|:---|:---:|:---|
| [链上监控](#monitor) | ✅ | 链上活动监控提醒 |
| [功能建议](#features) | ✅ | 提交建议、投票 |
| [知识库](#docs) | ✅ | 7篇完整学习文档 |

### 👤 用户功能 | User Features
| 功能 | 状态 | 描述 |
|:---|:---:|:---|
| 邮箱注册��录 | ✅ | 验证码登录，无密码 |
| 个人中心 | ✅ | 资料管理 |
| 文档管理 | ✅ | 管理员编辑文档 |
| API配额管理 | ✅ | 分级配额，注册用户双倍 |

### 📊 数据功能 | Data Features
| 功能 | 状态 | 描述 |
|:---|:---:|:---|
| 实时价格跑马灯 | ✅ | WebSocket 实时更新 |
| 价格提醒 | ✅ | Email/通知推送 |
| AI 对话统计 | ✅ | 问题分类分析 |
| 配额使用统计 | ✅ | API调用次数追踪 |

### 🚧 开发中 | Under Development
| 功能 | 状态 |
|:---|:---:|
| 热门排行榜 | 🚧 |
| 巨鲸追踪 | 🚧 |

---

## 🎨 设计风格 | Design Style
- **币安黄主题** - Binance Yellow #F3BA2F
- **毛玻璃效果** - Glass Morphism UI
- **流畅动画** - Smooth Page Transitions
- **响应式布局** - Mobile Friendly

---

## 📝 更新日志 | Changelog

### v1.5.0 (2026-03-29) - 配额系统版本
**API配额管理**
- 新增用户配额系统，区分匿名用户和注册用户
- 匿名用户：AI对话50次/天，AI分析20次/天，Binance API 100次/天
- 注册用户：AI对话100次/天，AI分析50次/天，Binance API 200次/天
- 管理员：AI对话1000次/天，AI分析500次/天，Binance API 1000次/天
- 新增 GET /api/auth/quota 接口查询配额使用情况
- 配额每日自动重置，使用情况持久化存储

**代码质量改进**
- 修复 emailService parseInt 类型错误
- 修复 authService 异步加载问题
- 新增配额中间件，统一API调用限制
- 优化匿名用户配额追踪逻辑

### v1.4.0 (2026-03-29) - 用户体验优化版本
**用户体验改进**
- 修复移动端导航栏菜单显示问题（移到nav标签外，确保完整背景）
- 修复认证模态框ID不匹配问题（loginModal → authModal）
- 增强表单验证：邮箱格式、验证码长度、昵称必填检查
- 添加键盘快捷键支持：ESC关闭弹窗，Enter提交表单
- 改进空状态显示：圆形图标背景 + 可选操作按钮
- 移动端菜单添加遮罩层，点击外部自动关闭
- 验证码倒计时显示（60秒重新发送）
- 开发模式验证码界面显示（不再仅console）
- 表单提交后自动清理和聚焦错误字段

**移动端优化**
- 移动菜单纯白色背景，避免半透明冲突
- 添加移动菜单滑入动画效果
- 遮罩层防止背景滚动

### v1.3.0 (2026-03-29) - 前端重构版本
**代码重构**
- 将 index.html 从 4052 行精简到 1165 行
- 提取 CSS 到独立文件 css/styles.css
- 拆分 JavaScript 为 9 个功能模块：
  - config.js: 配置和常量
  - utils.js: 工具函数
  - api.js: API 调用封装
  - auth.js: 认证模块
  - components.js: UI 组件
  - pages.js: 页面渲染逻辑
  - binance.js: Binance Web3 功能
  - ai.js: AI 工具功能
  - main.js: 路由和入口
- 修复 contentController 异步初始化问题
- 修复 dataPersistenceService 默认值问题

**优势**
- 代码可维护性提升
- 支持浏览器缓存
- 便于团队协作

### v1.2.0 (2026-03-28) - 开源版本
**开源准备**
- 添加 MIT 开源许可证
- 编写贡献指南 (CONTRIBUTING.md)
- 更新 .gitignore 排除用户数据

**安全修复**
- 修复前端 6 处 XSS 漏洞（用户内容转义）
- 添加 CSP、X-Frame-Options、X-XSS-Protection 安全头
- 修复 ID 生成安全性（使用 crypto.randomBytes）

**代码质量**
- 修复邮件模板时间描述错误
- 修复模拟数据无效地址
- 使用 constants 替代硬编码值

### v1.1.0 (2026-03-28) - 安全修复版本
**Critical 修复**
- 修复鲸鱼追踪器 39 位地址格式错误
- GMGN API 添加超时和错误处理

**High 修复**
- 修复验证码暴力破解漏洞（错误后立即删除验证码）
- 加强表达式解析器安全验证（长度、嵌套深度、白名单）
- Binance Web3 Service 添加请求超时配置

**Medium 改进**
- 数据持久化服务改为异步操作，添加写入锁和原子写入

---

## 🚀 快速开始 | Quick Start

```bash
# 安装依赖 | Install dependencies
npm install

# 配置环境 | Configure environment
cp .env.example .env
# 编辑 .env 填入你的 API 密钥 | Edit .env with your API keys

# 启动开发服务器 | Start development server
npm run dev

# 生产构建 | Build for production
npm run build
```

访问 http://localhost:3000

---

## 🐳 Docker 部署 | Docker Deployment

### 快速部署

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env，设置必需的配置：
# - JWT_SECRET（必须，至少64字符）
# - ADMIN_EMAILS（必须，管理员邮箱）
# - ANTHROPIC_API_KEY_1（必须，Claude API）
# - GMGN_API_KEY_1（可选，GMGN API）

# 2. 启动服务
docker-compose up -d

# 3. 查看日志
docker-compose logs -f hold-portal
```

### 生产环境建议

```bash
# 设置强随机 JWT 密钥
export JWT_SECRET=$(openssl rand -hex 32)

# 使用外部 Redis（可选）
# 修改 docker-compose.yml 中的 REDIS_URL

# 配置反向代理（Nginx 示例）
# location / {
#     proxy_pass http://localhost:3000;
#     proxy_http_version 1.1;
#     proxy_set_header Upgrade $http_upgrade;
#     proxy_set_header Connection 'upgrade';
#     proxy_set_header Host $host;
#     proxy_cache_bypass $http_upgrade;
# }
```

### 数据备份

```bash
# 数据存储在 ./data 目录
# 定期备份此目录即可

# 或使用容器内备份
docker-compose exec hold-portal sh -c "cd /app/data/backups && .."
```

---

## 📄 许可证 | License

MIT © 2026 HOLD Community

<div align="center">

** Made with ❤️ by BNBHOLDERS **

</div>
