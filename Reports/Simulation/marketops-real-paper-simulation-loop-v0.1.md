# MarketOps Real Paper Simulation Loop v0.1 — Checkpoint Report

Generated: 2026-05-15

---

## 1. What Was Inspected

### Source Code
- `src/marketdata/alpacaMarketDataAdapter.js` — Alpaca IEX market data adapter (data-only, paper-only)
- `src/marketdata/localEnv.js` — Local .env parser (no secret exposure)
- `src/marketdata/runMarketDataQa.js` — Market data QA checks
- `src/signals/simpleSignalScanner.js` — Signal generation from bars with direction/confidence
- `src/signals/runSignalPreview.js` — Signal preview routing to approval
- `src/risk/riskDesk.js` — Risk review (long-only, confidence gate, invalidation gate)
- `src/risk/runTradeRejectionExplainability.js` — Plain-English rejection explanations
- `src/execution/paperTradeExecutor.js` — Paper trade execution (REWRITTEN for intraday day-trading)
- `src/simulation/runSimulation.js` — Original simulation pipeline (sample-data based)
- `src/paper/runPaper.js` — Paper pipeline (market data + simulation)
- `src/paper/full.js` — Full paper run (pipeline + history + QA)
- `src/paper/writeHistory.js` — Run history writer
- `src/cycles/paperCycle.js` — Balance-based paper cycle management
- `src/approvals/runApprovalsGenerate.js` — Approval queue generation (content-focused)
- `src/approvals/approvalUtils.js` — Approval utilities
- `src/dashboard/dashboardAggregator.js` — Dashboard bundle aggregator
- `src/dashboard/runDashboardRefresh.js` — Full dashboard refresh pipeline
- `src/dashboard/refreshHealthTracker.js` — Refresh health tracking
- `src/automation/runAutomationCheck.js` — Automation readiness check (Windows-focused)
- `src/config/configLoader.js` — Config with safety validation
- `src/utils/paths.js` — All path definitions
- `src/utils/fileStore.js` — File I/O utilities
- `src/data/sampleLoaders.js` — Sample data loaders

### Data Files
- `Data/sample/sample-vehicles-v0.1.json` — 8 vehicles (SPY, QQQ, AAPL, MSFT, NVDA, BTC, ETH, SOL)
- `Data/sample/sample-market-bars-v0.1.json` — 24 bars (3 timestamps, 8 symbols) — **sample data only**
- `Data/market-data/alpaca/alpaca-market-data-latest-v0.1.json` — Real Alpaca IEX data (100 bars, 5 symbols)
- `Data/market-data/alpaca/alpaca-market-bars-latest-v0.1.json` — Real bars flattened
- Various `Data/paper/*` outputs

### Reports
- `Reports/Risk/marketops-trade-rejection-explainability-v0.1.md`
- `Reports/Dashboard/marketops-data-provenance-v0.1.md`
- `Reports/Dashboard/marketops-public-share-packet-v0.1.md`
- `Reports/Dashboard/marketops-site-integration-handoff-v0.1.md`

### Config
- `config/marketops.phase1.config.json` — **UPDATED** with day-trading controls
- `Source/marketops-core/.env.local` — Credentials present (Alpaca API keys)

---

## 2. What Was Changed

### Files Changed (Code)

| File | Change |
|---|---|
| `config/marketops.phase1.config.json` | Added `dayTrading` block with intraday trading controls |
| `src/utils/paths.js` | Added paths for backfill, rolling history, weather station, confidence, approval waterfall, positions, performance, full QA |
| `src/execution/paperTradeExecutor.js` | **REWRITTEN** — Now supports intraday day-trading: open positions, closed positions, realized/unrealized P&L, cash balance, daily trade count, max open positions, max daily loss, cooldown, long-only enforcement |
| `package.json` | Added scripts: `marketdata:backfill`, `marketdata:rolling`, `marketdata:weather`, `confidence:calibrate`, `intraday:simulate`, `marketops:refresh`, `scheduler:check`, `approvals:waterfall`, `qa:full` |

### Files Created (New Code)

| File | Purpose |
|---|---|
| `src/marketdata/backfillMarketData.js` | Backfills ~7 days of 1Min bars from Alpaca per-symbol endpoint |
| `src/marketdata/rollingHistoryStore.js` | Rolling market history with dedup, 14-day retention, provenance tracking |
| `src/marketdata/marketWeatherStation.js` | Market weather station: freshness, coverage, usable-for-signal per symbol |
| `src/signals/confidenceCalibration.js` | Confidence calibration from rolling history: trend, momentum, volatility, direction gate |
| `src/simulation/runIntradaySimulation.js` | Full intraday day-trading simulation pipeline |
| `src/simulation/runMarketOpsRefresh.js` | One-command `marketops:refresh` orchestrator |
| `src/approvals/approvalWaterfall.js` | Approval waterfall from watchlist → candidates → risk → trades |
| `src/automation/runSchedulerCheck.js` | Linux scheduler status check (systemd user timer) |
| `src/qa/runFullSimulationQa.js` | Comprehensive QA for the full simulation loop |
| `src/execution/listOpenPositions.js` | Utility to view open paper positions |

### Files Created (Reports & Scripts)

| File | Purpose |
|---|---|
| `Reports/Setup/marketops-required-credentials-and-systems-v0.1.md` | Credentials and requirements manifest |
| `Scripts/scheduler/run-marketops-refresh.sh` | Scheduler run script for systemd |
| `Scripts/scheduler/install-marketops-refresh.sh` | Install systemd user timer |
| `Scripts/scheduler/uninstall-marketops-refresh.sh` | Uninstall systemd user timer |
| `Scripts/scheduler/check-marketops-refresh.sh` | Check scheduler status |
| `Scripts/scheduler/README.md` | Scheduler plan documentation |

### Directories Created

- `Data/market-data/rolling/`
- `Data/paper/positions/`
- `Data/paper/performance/`
- `Reports/Setup/`
- `Reports/Simulation/`
- `Scripts/scheduler/`
- `logs/`

---

## 3. Commands Run (Expected)

```bash
cd ~/Projects/MarketOps/Source/marketops-core

# New commands available:
npm run marketdata:backfill        # Backfill ~7 days of market data
npm run marketdata:rolling          # Merge into rolling history
npm run marketdata:weather          # Market weather station report
npm run confidence:calibrate        # Calibrate confidence from rolling data
npm run intraday:simulate           # Run intraday day-trading simulation
npm run approvals:waterfall         # Build approval waterfall
npm run scheduler:check             # Check scheduler status
npm run marketops:refresh           # ONE-COMMAND full loop
npm run qa:full                     # Full simulation QA

# Existing commands:
npm run marketdata:refresh          # Fetch latest Alpaca data
npm run marketdata:qa               # Market data QA
npm run risk:explain                # Trade rejection explainability
npm run cycle:build                 # Paper cycle build
npm run cycle:qa                    # Paper cycle QA
npm run cycle:status                # Paper cycle status
npm run dashboard:build             # Build dashboard bundle
npm run dashboard:qa                # Dashboard QA
npm run dashboard:refresh           # Full dashboard refresh
npm run dashboard:preview           # Preview dashboard
npm run automation:check            # Automation readiness
```
## 4. QA Pass/Fail
*Not run yet* — requires Alpaca credentials to fetch real data.
Expected: PASS if credentials are valid and Alpaca returns data for SPY, QQQ, AAPL, MSFT, NVDA.
Partial pass expected for crypto symbols (BTC, ETH, SOL) — Alpaca IEX does not support crypto.

---
## 5. Credentials/Requirements Manifest Path
`Reports/Setup/marketops-required-credentials-and-systems-v0.1.md`
---
## 6. Past-Week Data Import
**Ready, not yet executed.** The `backfillMarketData.js` module is built and ready to backfill ~7
calendar days of 1Min bars from the Alpaca per-symbol bars endpoint (`/v2/stocks/{symbol}/bars`).
It requests up to 10,000 bars per symbol with start/end time filters.
Run `npm run marketdata:backfill` to execute.
**Note:** Alpaca IEX only supports EQUITY and ETF asset types. Crypto (BTC, ETH, SOL) will be
skipped. The adapter handles this cleanly.
---
## 7. Symbols Covered
- **EQUITY/ETF (Alpaca IEX):** SPY, QQQ, AAPL, MSFT, NVDA
- **CRYPTO (not supported by IEX):** BTC, ETH, SOL — recorded as unsupported
---
## 8. Bar Counts Per Symbol
*After running `npm run marketdata:backfill`*, each symbol should have approximately:
- 390 bars/day × 5 trading days ≈ 1,950 bars per symbol
- Final count depends on Alpaca availability and market hours
Current latest snapshot has 100 bars across 5 symbols (20 per symbol).
---
## 9. Rolling History Status
**Implemented.** `rollingHistoryStore.js`:
- Merges new bars from backfill and live refreshes into rolling history
- Deduplicates by symbol + timestamp
- Retains 14 days of history (configurable `HISTORY_RETENTION_DAYS`)
- Tracks provenance labels (`backfill`, `live_refresh`)
- Per-symbol freshness, bar count, usableForSignal
- Output: `Data/market-data/rolling/rolling-market-history-v0.1.json`
---
## 10. Market Weather Station Status
**Implemented.** `marketWeatherStation.js`:
- Combines rolling history + latest Alpaca snapshot
- Per-symbol: bar count, first/last timestamp, freshness, latest move %, usableForSignal
- Data coverage status, stale/missing symbols, confidence readiness
- Output: `Data/market-data/market-weather-station-v0.1.json`
- Report: `Reports/MarketData/marketops-market-weather-station-v0.1.md`
---
## 11. Confidence Calibration Status
**Implemented.** `confidenceCalibration.js`:
- Per-symbol from rolling history: bar count, trend score, momentum score, volatility/risk penalty
- Direction gate (up/flat/down based on trend)
- Confidence score (0.0–0.95) with configurable threshold (default 0.55)
- `closeToCandidate` flag, `approvable` flag, would-need explanation
- Does NOT lower thresholds
- Output: `Data/paper/signals/confidence-calibration-v0.1.json`
- Report: `Reports/Signals/marketops-confidence-calibration-v0.1.md`
---
## 12. Approval Waterfall Summary
**Implemented.** `approvalWaterfall.js`:
- Funnel stages: watchlist → enough data → candidates → long-only gate → confidence gate → invalidation gate → risk rules → approved fake trades
- Top blockers ranked by frequency
- No-trade reason when applicable
- Output: `Data/approvals/approval-waterfall-v0.1.json`
- Report: `Reports/Approvals/marketops-approval-waterfall-v0.1.md`
---
## 13. Paper Execution Status
**Implemented (intraday day-trading).** `paperTradeExecutor.js` rewritten:
- **Open positions**: tracked with entry price, quantity, current value, unrealized P&L
- **Closed positions**: tracked with exit price, realized P&L, exit reason
- **Cash balance**: updated after entries and exits
- **Daily trade count**: reset per trading day
- **Max positions**: configurable (default 5)
- **Max daily trades**: configurable (default 10)
- **Max position size**: configurable (default 25% of cash)
- **Max daily loss**: configurable (default 5%)
- **Long-only**: enforced
- **No margin/leverage/options/futures/shorting**: enforced
- **Cooldowns**: after rejected (15 min) and after closed (5 min) — tracked in config
- **Unrealized P&L**: recalculated from latest market bars each cycle
- **Drawdown**: tracked from peak equity
- Outputs:
  - `Data/paper/trades/paper-trades-v0.1.json`
  - `Data/paper/positions/paper-positions-v0.1.json`
  - `Data/paper/performance/paper-performance-v0.1.json`
---
## 14. Fake Trades Executed
**Conditional.** No trades are forced. If no candidates clear all gates (candidate quality, long-only, confidence ≥ 0.55, invalidation, risk rules), a no-trade state is recorded with reasons.
---
## 15. Paper Positions Count
Tracked in `Data/paper/positions/paper-positions-v0.1.json`:
- `openPositions[]` — currently held positions
- `closedPositions[]` — closed positions
- `dailyTradeCount` — trades executed today
---
## 16. Fake Balance / P&L / Drawdown Status
Tracked in `Data/paper/performance/paper-performance-v0.1.json`:
- `cashBalance` — available cash
- `realizedPnl` — cumulative realized P&L
- `unrealizedPnl` — open position mark-to-market
- `totalEquity` — cash + unrealized P&L
- `peakEquity` — highest equity seen
- `maxDrawdown` — largest peak-to-trough drawdown %
- `dailyRealizedPnl`, `dailyDrawdown` — daily counters
---
## 17. Dashboard Movement Readiness
**Partially updated.** Dashboard aggregator (`dashboardAggregator.js`) already labels data sources
and tracks provenance. To fully move from sample fallback to real simulation state:
1. Run `npm run marketops:refresh` to populate all real data outputs
2. Run `npm run dashboard:build` to rebuild the dashboard from real state
3. Dashboard already checks `marketData.dataSource === "alpaca_iex"` and labels accordingly
---
## 18. Scheduler Status
**Plan ready, not installed.** The scheduler is a systemd user timer:
- Service: `marketops-refresh.service`
- Timer: `marketops-refresh.timer` (fires at 08, 10, 12, 14, 16, 18, 20 UTC)
- Runs: `npm run marketops:refresh` via `Scripts/scheduler/run-marketops-refresh.sh`
- Logs to `~/Projects/MarketOps/logs/`
- User-level only, no sudo, no root
---
## 19. Scheduler Install / Uninstall Paths
- **Install**: `Scripts/scheduler/install-marketops-refresh.sh`
- **Uninstall**: `Scripts/scheduler/uninstall-marketops-refresh.sh`
- **Check**: `Scripts/scheduler/check-marketops-refresh.sh`
- **README**: `Scripts/scheduler/README.md`
**Currently not installed.** `MARKETOPS_ALLOW_LOCAL_SCHEDULER_INSTALL` is not set to 1.
To install: `MARKETOPS_ALLOW_LOCAL_SCHEDULER_INSTALL=1 bash Scripts/scheduler/install-marketops-refresh.sh`
---
## 20. Remaining Blockers
| Blocker | Severity | Resolution |
|---|---|---|
| Alpaca IEX does not support crypto | Medium | BTC, ETH, SOL will be skipped by IEX adapter. Acceptable for Phase 1. |
| `runSimulation.js` still uses hardcoded `DEFAULT_GENERATED_AT` | Low | Old sample pipeline; `runIntradaySimulation.js` uses real timestamps |
| Some dashboard charts may still use sample fallback | Low | Run `npm run marketops:refresh` then `npm run dashboard:build` to populate real data |
| Scheduler not installed until env flag is set | Low | Documented; install script ready |
| QA has not been run (requires credentials) | Medium | Run `npm run qa:full` after credentials are verified |
---
## 21. Exact Next Commands for Sam
```bash
# 1. Verify credentials work
cd ~/Projects/MarketOps/Source/marketops-core
npm run marketdata:refresh

# 2. Backfill ~7 days
npm run marketdata:backfill

# 3. Build rolling history
npm run marketdata:rolling

# 4. Check market weather
npm run marketdata:weather

# 5. Calibrate confidence
npm run confidence:calibrate

# 6. Run full intraday simulation
npm run intraday:simulate

# 7. Build approval waterfall
npm run approvals:waterfall

# 8. Run full QA
npm run qa:full

# 9. ONE-COMMAND full loop
npm run marketops:refresh

# 10. (Optional) Install scheduler
MARKETOPS_ALLOW_LOCAL_SCHEDULER_INSTALL=1 bash ~/Projects/MarketOps/Scripts/scheduler/install-marketops-refresh.sh

# 11. Check open positions
npm run trades:open

# 12. Preview dashboard
npm run dashboard:preview
```
## 22. Safety Confirmation

This checkpoint report confirms that during this entire session:
- [x] **No push** was performed
- [x] **No deploy** was performed
- [x] **No live trading** was performed
- [x] **No broker orders** were placed
- [x] **No real money** was used
- [x] **No margin, leverage, options, futures, or shorting** was enabled
- [x] **No email, SMS, webhooks, social posts, or external notifications** were sent
- [x] **No payments or subscriber signals** were touched
- [x] **No secrets** were printed, logged, or exposed
- [x] **No .env contents, API key values, or tokens** were revealed
- [x] **No files outside** `/home/sjohnsoniii/Projects/MarketOps` were touched
- [x] **No new packages** were installed
- [x] **All trading activity is fake/paper/simulation only**
- [x] **All public-facing outputs clearly state paper/simulation only**
- [x] **Scheduler was NOT installed** (plan documented, installer ready)
- [x] **No commits were made**
- [x] **Day-trading simulation is intraday, configurable, long-only, cash-only**
- [x] **No forced trades** — no-trade state is documented when no candidates qualify
