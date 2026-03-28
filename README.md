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
│   │   ├── index.html         # 前端 SPA
│   │   └── favicon.png        # 站点图标
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
│           ├── questionAnalytics.js    # 问题分析
│           ├── redisService.js         # Redis 缓存
│           └── emailService.js         # 邮件服务
├── .env.example
├── package.json
└── README.md
```

---

## ✨ 功能特性 | Features

### 🎨 前端设计 | Frontend Design
- **币安黄主题** - Binance Yellow #F3BA2F
- **毛玻璃效果** - Glass Morphism UI
- **流畅动画** - Smooth Page Transitions
- **响应式布局** - Mobile Friendly

### 🤖 AI 工具 (8项) | AI Tools
| 工具 | Tool | 描述 |
|:---|:---|:---|
| 代币分析 | Token Analysis | AI 驱动的代币分析 |
| 钱包诊断 | Wallet Diagnosis | 钱包行为分析 |
| RUG 检测 | Honeypot Detection | 蜜罐与骗局识别 |
| 持仓分析 | Holder Analysis | 持仓分布分析 |
| 交易助手 | Trading Assistant | 买卖时机建议 |
| 安全评分 | Safety Score | 合约安全评分 |
| 新手指引 | Beginner Guide | 新手学习路径 |
| 心态修炼 | Mindset Guide | 交易心理指导 |

### ⚡ Binance Web3 Skills | 官方集成
- 🔍 **代币搜索** - Search tokens (BSC/Base/Solana)
- 🔒 **安全审计** - Professional security audit
- 💼 **钱包查询** - Query wallet holdings
- 📈 **聪明钱信号** - Smart money tracking
- 🏆 **市场排行** - Market rankings
- 📊 **代币详情** - Complete token info

### 📚 内容板块 | Content Sections
- 💬 **讨论区** - Community discussions
- 📝 **投稿区** - Article submission
- 🔗 **分享区** - Resource sharing
- 📖 **知识库** - Structured docs

### 📢 实时功能 | Real-time Features
- 💰 **价格跑马灯** - WebSocket 实时更新
- 🔔 **价格提醒** - Email/通知推送
- 📊 **问题统计** - AI 对话分析

---

## 🗺️ 路线图 | Roadmap

### Phase 1: 基础架构 ✅ (已完成)
- [x] 项目初始化
- [x] 币安黄主题 UI + 毛玻璃效果
- [x] AI 悬浮球助手
- [x] 8 个 AI 工具模态框
- [x] 讨论区 & 投稿区详情页
- [x] 分享区分类展示
- [x] 知识库文档
- [x] 浏览器历史路由支持
- [x] **Binance Web3 Skills 集成**
- [x] **API 密钥轮换机制**
- [x] **Redis 缓存层**
- [x] **实时价格跑马灯**
- [x] **AI 问题分类统计**

### Phase 2: 数据增强 🚧 (进行中)
- [x] WebSocket 实时价格
- [x] 价格提醒服务 (API + Email)
- [ ] 用户注册/登录系统
- [ ] 身份标识（徽章、等级）
- [ ] 积分奖励机制
- [ ] 知识库后台管理

### Phase 3: 社区功能 (计划中)
- [ ] 高级图表可视化
- [ ] 多链支持 (Arbitrum/Polygon/Sui)
- [ ] 投资组合跟踪
- [ ] 内容投票与策展
- [ ] 成就徽章系统
- [ ] 排行榜

### Phase 4: 高级分析 (计划中)
- [ ] 链上活动监控
- [ ] 巨鲸追踪提醒
- [ ] 社交情绪分析
- [ ] 自定义交易指标
- [ ] 开发者 API

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

## 📄 许可证 | License

MIT © 2024 HOLD Community

<div align="center">

** Made with ❤️ by BNBHOLDERS **

</div>
