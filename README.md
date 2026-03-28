# HOLD Community Portal

> BSC Community Knowledge Learning Platform

## Project Overview

HOLD Community Portal is a knowledge learning platform for BSC Holders, using AI and on-chain data analysis to help community members:
- Learn token analysis
- Identify risks
- Master on-chain tools
- Improve knowledge level

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML + Tailwind CSS |
| Backend | Node.js + Express |
| AI | Claude AI |
| Data Sources | **Binance Web3 API** + GMGN API + Etherscan API + Alchemy API |

## Framework Architecture

```
hold-community-portal/
├── src/
│   ├── server.js              # Express entry point
│   ├── public/
│   │   ├── index.html         # Frontend SPA
│   │   └── favicon.png        # Site icon
│   └── api/
│       ├── routes.js          # API routes
│       ├── controllers/       # Controllers
│       │   ├── aiController.js          # AI endpoints
│       │   ├── contentController.js     # Content management
│       │   ├── docsController.js        # Documentation
│       │   ├── binanceWeb3Controller.js # Binance Web3 Skills
│       │   ├── tokenController.js       # Token data
│       │   └── walletController.js      # Wallet data
│       └── services/          # Services
│           ├── aiService.js            # Claude AI
│           ├── binanceWeb3Service.js   # Binance Web3 API
│           ├── gmgnService.js          # GMGN API
│           ├── etherscanService.js     # Etherscan API
│           └── alchemyService.js       # Alchemy API
├── .env.example
├── package.json
└── README.md
```

## Features

### 🎨 Frontend
- **Binance Yellow Theme** - Official #F3BA2F color scheme
- **Glass Morphism Design** - Modern frosted glass UI components
- **Page Transitions** - Smooth animations and loading states
- **Responsive Layout** - Mobile-friendly navigation

### 🤖 AI Tools (8)
- **代币分析** - AI-powered token analysis
- **钱包诊断** - Wallet behavior analysis
- **RUG 检测** - Honeypot and scam detection
- **持仓分析** - Holder distribution analysis
- **交易助手** - Buy/sell timing advice
- **安全评分** - Contract safety scoring
- **新手指引** - Beginner learning paths
- **心态修炼** - Trading psychology guidance

### ⚡ Binance Web3 Skills (Official Integration)
- **代币搜索** - Search tokens across BSC, Base, Solana
- **安全审计** - Professional security audit
- **钱包查询** - Query any wallet holdings
- **聪明钱信号** - Smart money tracking
- **市场排行** - Market rankings by volume/market cap
- **代币详情** - Complete token information

### 📚 Content
- **讨论区** - Community discussions with replies
- **投稿区** - Article submission and reading
- **分享区** - Resource sharing (tools, docs, airdrops, data)
- **知识库** - Structured documentation

## Roadmap

### Phase 1: Foundation ✅ (Completed)
- [x] Project initialization
- [x] Basic architecture setup
- [x] Binance yellow theme UI with glass morphism
- [x] AI chat assistant with floating ball
- [x] 8 AI tools with modal interactions
- [x] Discussion & Article detail pages with reply
- [x] Share area with categories
- [x] Knowledge base documentation
- [x] History API routing with browser back support
- [x] **Binance Web3 Skills integration** (Official API)
- [x] **API 密钥轮换机制** - 支持多密钥负载均衡
- [x] **Redis 缓存层** - 降低 API 成本
- [x] **实时价格跑马灯** - WebSocket 轮询

### Phase 2: Enhanced Data 🚧 (In Progress)
- [x] Real-time price updates via WebSocket
- [x] Price alert notifications (API + Email service)
- [ ] 用户注册/登录系统
- [ ] 身份标识系统（徽章、等级）
- [ ] 积分奖励机制
- [ ] 知识库后台管理

### Phase 3: Community Features (Planned)
- [ ] Enhanced chart visualization
- [ ] More chain support (Arbitrum, Polygon, Sui, etc.)
- [ ] Portfolio tracking feature
- [ ] Content voting and curation
- [ ] Achievement badges
- [ ] Leaderboard

### Phase 4: Advanced Analytics (Planned)
- [ ] On-chain activity monitoring
- [ ] Whale tracking alerts
- [ ] Social sentiment analysis
- [ ] Custom trading indicators
- [ ] API access for developers

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev

# Build for production
npm run build
```

## License

MIT
