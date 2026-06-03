# MarketOps — Project Brain
Last Updated: 2026-05-29
Current Version: v0.19

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
- dashboard-public-safe-v0.1.json schema mismatch — stale, written by different pipeline than paper:refresh-site (low priority)
- Cycle reset_pending status in cycle file — will clear on next successful run with new depletion logic

## Autonomous Operation Status
- Scheduler: ACTIVE — systemd timers installed, market hours M-F 9:25 AM - 4:30 PM ET
- Exit logic: ACTIVE — target +8%, stop-loss -4%, 72hr time-stop
- Public sync: ACTIVE — auto-push to sj3labs on every run
- Cycle reset: ACTIVE — auto-resets at depletion threshold $10, preserves learning records
- Learning records: ACTIVE — written on every position close

## Fixed Issues (2026-05-28 / 2026-05-29)
- Alpaca 429 rate limit: FIXED — bulk bars request replaces per-symbol Promise.all in alpacaMarketDataAdapter.js
- Stack overflow in marketdata:rolling: FIXED — Array.concat replaces spread/push in rollingHistoryStore.js
- automation:check path error: FIXED — coreRoot added to local paths object in runAutomationCheck.js
- Public sync dry-run only: FIXED — Scripts/run-marketops-public-sync-v0.1.sh wrapper created, npm run public:sync ready
- Exit logic: ADDED — checkAndExecuteExits() in paperTradeExecutor.js, wired into runIntradaySimulation.js
- Cycle depletion reset: ADDED — resetCycleIfDepleted() auto-resets to $1,000 at equity < $10
- Public site: LIVE — pipeline active, Vercel triggered on push

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

## Last Completed Checkpoint
**v0.19.1 — Equity Bug Fix + GitHub** — Fixed critical equity reporting bug in paperTradeExecutor.js (totalEquity was cash-only, now cash + holdings). Fixed equityBuilder.js endingEquity. Cycle reset from reset_pending to active. Equity confirmed ,003.56 with 18 open positions. Connected local repo to github.com/sjohnsoniii/MarketOps and pushed full history. Public dashboard synced to sj3labs site via public sync script. Large market data files added to gitignore. Checkpoint: Reports/marketops-equity-fix-v0.19-checkpoint.md

## 2026-06-02 — Pipeline reliability repair (publish was stale since 5/21–5/29)
Full audit + fix in `MARKETOPS_AUDIT.md`. The public dashboard was stale for TWO root causes:
1. **Fresh-bars gate stuck** — `alpacaMarketDataAdapter.js` fetched oldest session bars and
   gated on an unreachable count → every refresh `CONTROLLED_DEGRADED` since 5/21. Fixed:
   `/v2/stocks/bars/latest` + recency-based gate.
2. **Chart bundle never regenerated** — the site renders `dashboard-bundle-public-v0.5.json`,
   written only by `paper:refresh-site`, which was in NO systemd unit → charts frozen at 5/29.
   Fixed: added `paper:refresh-site` (Step 1b2) to `run-marketops-refresh.sh` before the sync.

Also fixed: `currentBalance` runaway accumulator → pinned to `canonicalTotalEquity`; non-atomic
`writeJson` → tmp+rename; transient `socket hang up` failing whole run → retry-with-backoff in
the Alpaca fetch; manifest publishing one run late → Step 5b pushes it in-run.

**Verified:** manual AND unattended timer-triggered runs exit 0 and push fresh data to
`sj3labs` origin/main (Vercel auto-deploys). v0.5 bundle `generatedAt` advances every run.

**Resolved later same day (Sam-directed):** `quantity`/`positionValue` whitelisted (scoped, not
stripped) in `runDashboardQa.js` — only those two terms, only on the public paper bundle.
`dashboard:qa` now PASS (188/0); during market hours the refresh reaches PASS, which makes
`refreshHealthTracker` advance `lastSuccessfulRefreshAt` + clear the stale banner (verified).
Next market-hours timer run (Wed 10:00 ET) produces the live PASS.

**Still open (need Sam, NOT changed):**
- Latent git push race between `run` + `refresh` timers (sync has no pull/rebase).
- Risk Desk blocks 100% of paper signals (0 trades, empty charts). `keep-awake.service` failed.

Edits backed up `.bak.20260602b`. No MarketOps-repo commit made (per checkpoint rule).

## 2026-06-03 — Trade-enablement cruise (Phases 1→3, local-only, NOT committed)
Preceded by read-only `TRADER-LOGIC-REVIEW.md` (the trading-logic map) and `TRADE-ENABLEMENT-PLAN.md`
(approved Step-0 plan). No sj3labs push; publish env vars stayed unset; no MarketOps-repo commit.
All edited files backed up `.bak.20260603`.

- **Phase 1 — jam cleared.** The Risk Desk's "100% blocked" was **capacity saturation, not confidence**:
  the book was 20/20 full of stale `sample-signal-*` seed positions (entered 6/1, never aged to the 72h
  time-stop). Cleared to a clean $1,000 baseline (Option B), archiving the 20 seeds into `closedPositions`
  (preserved 38→58). Learning records / cycle history / audit logs untouched. Result: 0→approved jumped
  **0 → 67**; real candidates now trade. (Note: every signal carries a `sample-signal-` id from
  `simpleSignalScanner.js`, so that prefix is NOT a seed marker — identified seeds by explicit positionId +
  pre-6/2 entryTime.)
- **Phase 2 — sizing + cap.** `learningMode.maxOpenPositions 20→40`; added named
  `sizing.perTradeAllocationPct 0.02`. Sizing rewritten in `paperTradeExecutor.js` to a flat % of a stable
  **total-equity snapshot** (was 25% of *remaining* cash → front-loaded). Also fixed a **cap double-count
  bug** (`tradesExecuted + openPositionsList.length` halved the cap). Book now fills to 40 with uniform
  sizing ($20 standard / $5 probe). Daily trade caps (10 std / 10 probe / 20 total) throttle fill *rate* —
  left unchanged (flagged for Sam).
- **Phase 3 — instrument-aware exits + MFE.**
  - Exit-pricing defect fixed (`paperTradeExecutor.js`): stop/target now evaluate on REAL prices; no
    entry-price fallback. No-fresh-bar is explicit — skip stop/target, only the 72h time-stop acts, valued at
    last mark and flagged (`pricedThisRun`/`exitPriceStale`); never a faked 0% flat.
  - Instrument classification from the DEFINITE source: vehicle universe `assetType` (ETF=65 / EQUITY=85),
    carried onto positions. ETF→+3/-2, EQUITY(stock)→+6/-3 (named config `exitRules.byInstrumentType`).
    Unknown → ETF-tight default + `instrumentTypeAssumed` flag (never stock).
  - MFE: running bar-HIGH water-mark persisted per position; recorded at close (`mfeReturnPct`,
    `mfeBeyondExitPct`). New `src/execution/excursionReport.js` → `Reports/Paper/marketops-excursion-mfe-v0.1.md`
    + `Data/paper/excursion/mfe-v0.1.json`. **REPORT-ONLY — never mutates a threshold.**
  - Proof: `Scripts/verify/replay-exit-proof.js` — 16/16 asserts (TP/stop on real prices, correct pair per
    type, no-fresh-bar→time-stop flagged, unknown→ETF, MFE bar-high). Live pipeline runs clean, integrity
    gate PASS, book at 40 (ETF 30 / EQUITY 10).
- **State left:** populated 40-position paper book at ~$1,000 equity from the verification runs. Sam may
  reset to a clean baseline before the first scheduled run if a from-zero book is preferred.
- **Files (all `.bak.20260603`):** `config/marketops.phase1.config.json`,
  `src/execution/paperTradeExecutor.js`, `Data/paper/positions/...`, `Data/paper/performance/...`.
  New: `src/execution/excursionReport.js`, `Scripts/verify/replay-exit-proof.js`,
  `Data/paper/excursion/mfe-v0.1.json`, `Reports/Paper/marketops-excursion-mfe-v0.1.md`.
  Awaiting Sam's review before any commit.
