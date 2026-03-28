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
| Database | PostgreSQL + Redis |
| AI | Claude Opus 4.6 |
| Data Sources | GMGN API + Etherscan API + Alchemy API |

## Framework Architecture

```
hold-community-portal/
├── src/
│   ├── server.js              # Express entry point
│   ├── public/
│   │   └── index.html         # Frontend SPA
│   └── api/
│       ├── routes.js          # API routes
│       ├── controllers/       # Controllers
│       │   ├── tokenController.js
│       │   ├── walletController.js
│       │   ├── marketController.js
│       │   └── docsController.js
│       └── services/          # Services
│           ├── gmgnService.js     # GMGN API
│           ├── aiService.js       # Claude AI
│           ├── etherscanService.js
│           └── alchemyService.js
├── .env.example
├── package.json
└── README.md
```

## Roadmap

### Phase 1: Foundation (Current) ✅
- [x] Project initialization
- [x] Basic architecture setup
- [x] Basic frontend UI - Binance yellow theme, glass morphism design
- [x] AI chat assistant with floating ball
- [x] 8 AI tools (Token Analysis, Wallet Diagnosis, RUG Check, Holder Analysis, Trade Assistant, Safety Score, Newbie Guide, Mindset Training)
- [x] Discussion area with detail pages and reply functionality
- [x] Article submission area with detail pages
- [x] Share area with categories
- [x] Knowledge base documentation
- [x] Page routing with History API support
- [x] GMGN API integration (service ready, needs API key for real data)
- [x] Claude AI integration (service ready, needs API key for real responses)
- [ ] Database integration (PostgreSQL + Redis)
- [ ] User authentication

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
