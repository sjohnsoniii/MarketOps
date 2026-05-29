# MarketOps — Project Brain
Last Updated: 2026-05-28
Current Version: v0.17

## What This Is
MarketOps is a local AI-powered paper trading office. It runs autonomous paper trading cycles, generates public-safe dashboard bundles, manages agent desk reviews, and preps content for future social/video publishing. No real money. No live keys. No automated posting.

## Current State
- Core engine: Source/marketops-core/ — active, v0.17
- Paper trading: operational, running cycles
- Dashboard: generating bundles, public-safe export in place
- Agent review layer: active (14+ reviews logged)
- Backtesting: v0.1 in place
- Social prep: readiness check done, not publishing
- Supercruise system: active with approval workflow

## Active Issues
- Public site (marketops.sj3labs.com or equivalent) appears dead — pipeline now fixed, needs Sam to run `npm run public:sync` to push and verify Vercel trigger
- Risk Desk over-blocking in paper/learning mode
- Exit management incomplete — no target sell, stop-loss, or time-stop logic on buys
- marketops:public-status command does not exist yet

## Fixed Issues (2026-05-28)
- Alpaca 429 rate limit: FIXED — bulk bars request replaces per-symbol Promise.all in alpacaMarketDataAdapter.js
- Stack overflow in marketdata:rolling: FIXED — Array.concat replaces spread/push in rollingHistoryStore.js
- automation:check path error: FIXED — coreRoot added to local paths object in runAutomationCheck.js
- Public sync dry-run only: FIXED — Scripts/run-marketops-public-sync-v0.1.sh wrapper created, npm run public:sync ready

## Architecture Summary
- Entry: Source/marketops-core/src/index.js
- Paper engine: src/paper/
- Risk: src/risk/
- Signals: src/signals/ + src/signalDesk/
- Execution: src/execution/
- Dashboard: src/dashboard/ → Data/dashboard/ → Data/public/
- Public sync: Scripts/public-sync/ → sj3labs
- Office/agents: src/office/ + src/agents/
- Admin console: src/admin-console/ — port 4317, `npm run admin:live` (only active admin system)
- src/ contains 127 .js files
- Removed (orphaned): src/admin/ (port none), src/admin-server/ (port 3131), src/admin-checkpoint/ (port 4321)

## Key Documents
- Supercruise/00_SUPERCRUISE_MASTER_DOSSIER.md
- Docs/Section 0/MarketOps-Section-0-Charter-v0.2.md
- Docs/Architecture/MarketOps-Technical-Architecture-v0.1.md

## Cruise History
- v0.1–v0.17 documented in CHANGELOG.md
- Last backup: clean-start-v0.7-2026-05-20

## Cleanup History
- 2026-05-28: Removed admin/, admin-server/, admin-checkpoint/ (12 files, orphaned). Removed stray paths.js.broken-backup. Removed 10 dead npm scripts. src/ reduced from 139 to 127 .js files.

## What Sam Does Not Want Repeated
- Do not explain the project structure from scratch each session — read this file
- Do not commit, deploy, or publish without checkpoint
- Do not touch Secrets/
- Do not mark anything as working without verifying the full pipeline
