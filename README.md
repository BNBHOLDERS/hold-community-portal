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

### Phase 1: Foundation (Current)
- [x] Project initialization
- [x] Basic architecture setup
- [ ] GMGN API integration
- [ ] Claude AI integration
- [ ] Basic frontend UI

### Phase 2: Core Features
- [ ] Token analysis module
- [ ] Wallet diagnosis module
- [ ] Security detection
- [ ] Knowledge base system

### Phase 3: Advanced Features
- [ ] Etherscan API integration
- [ ] Alchemy API integration
- [ ] Community discussion
- [ ] User authentication

### Phase 4: Enhancement
- [ ] Real-time data updates
- [ ] Alert system
- [ ] Portfolio tracking
- [ ] Mobile optimization

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
