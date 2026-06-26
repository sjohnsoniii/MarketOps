# MarketOps — Project Brain
Last Updated: 2026-06-16
Current Version: v0.23

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
- qa:full "performance cash vs run summary match" check fails (pre-existing QA-script bug, not a
  regression) — the check assumes cash == total equity, but open positions make them differ by design
- Account is capital-bound: with $1,000 starting equity + risk-based sizing the book fills (~14–20
  positions) and cash hits $0, so many risk-approved decisions are skipped for insufficient cash. Not
  a bug; expected for the small paper account.

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

## 2026-06-08 — Dashboard stale-refresh fix (branch: fix/stale-refresh, commit ee05607)
Root-cause investigation: dashboard showed 0 open positions and 0 recently-closed even with 8 live positions and 111 closed exits in paper-positions.json.

**Fixed (committed):**
- `execution/paperTradeExecutor.js` — added `openPositions: openPositionsList` to `tradeLedger`. The count field existed; the array did not. `buildOpenPositionsDetailed` reads the array, so it always returned `[]`.
- `dashboard/dashboardAggregator.js` — added `positions` input path pointing to `paper-positions-v0.1.json`; `buildRecentlyClosedPositions` now reads `positionsOutput.closedPositions` (authoritative exit history) instead of `tradeOutput.trades` (same-run-only, always empty between runs).
- `recentlyClosedPositions` resolves correctly on the next dashboard build (verified: 20 entries from live closed list).
- `openPositionsDetailed` shows correctly after the next `paper:run` writes the updated tradeLedger.

**OPEN / unverified:**
- Auto-liquidation reclassified as "not a bug": ORCL entered 2026-06-05T20:39Z, crossed 72h at ~20:39Z on 2026-06-08, expected to fire on the ~17:00 EDT scheduled run. This is a PREDICTION, not verified. Do not mark liquidation resolved until a real scheduled run actually fires a time-stop.

## 2026-06-09 — Re-entry cooldown + paperPnl baseline (branch: fix/stale-refresh)
Investigation revealed a same-run re-open pattern: after `checkAndExecuteExits` closes a time-stopped position at step 1, the signal scanner (step 0, same scan) still has that symbol approved, so the executor opens a fresh position in the same run — not a bug in exit logic, but an unintended churn pattern.

**Fixed (staged for commit):**
- `config/marketops.phase1.config.json` — added `learningMode.reEntryCooldown` block: `cooldownHours: 24`, `entryMovementThresholdPct: 2.0`, conviction override gates (momentum ×2.0, `approved_standard` band, volume ×1.5 over 30-bar average).
- `simulation/runIntradaySimulation.js` — added cooldown timestamp recording in exit block: writes `reEntryCooldowns[symbol] = exitTime` to `paper-positions-v0.1.json` before the atomic write, so the entry gate in the same run sees it.
- `execution/paperTradeExecutor.js` — added `loadCooldownConfig()`, loaded at top of `executeIntradayPaperTrades`. Prunes stale entries (>2× cooldownHours old). Cooldown gate after `alreadyOpen` check: skips entry unless conviction override clears momentum, band, and volume gates. Logs `[COOLDOWN OVERRIDE]` when granted.
- `paper/writeHistory.js` — fixed `startingBalance` to read `performance.startingCash` (epoch capital, $1000 set at clean-start) instead of `performance.cashBalance` (post-exit cash snapshot). `paperPnl` now reflects true change from configured starting capital.

**Verified (node test):**
- AAPL (1h since exit, 1.5% move): blocked — `momentum:false(1.50%>=4.00%)` ✓
- MSFT (no cooldown): opened normally ✓
- TSLA (2h since exit, 10% move, 12k vol vs 4.5k threshold): override granted — `[COOLDOWN OVERRIDE]` logged ✓
- `buildRunSummary`: `startingBalance: 1000`, `paperPnl: -17.77` (correct delta from epoch capital) ✓

**Cooldown state stored in:** `Data/paper/positions/paper-positions-v0.1.json` → `reEntryCooldowns: { SYMBOL: ISO-timestamp }`. Pruned automatically after 48h.

## 2026-06-10 — SQLite migration, Phases 1-3 complete (local-only, NOT committed)
Per `Reports/marketops-sqlite-migration-audit-v0.1.md`. New SQLite store: `Data/marketops.db` (better-sqlite3, WAL mode, `src/db/db.js` `getDb()`). All three phases verified via full scheduled pipeline run (`bash Scripts/scheduler/run-marketops-refresh.sh`) → exit 0, all `[PASS]`, `Status: PUBLISHED_WITH_WARNINGS` (only pre-existing `risk:learning:qa` 811/812 degradation, unrelated).

**ABI/PATH fix (prerequisite, applies to all phases):** `export PATH="$HOME/.nvm/versions/node/v24.15.0/bin:$PATH"` added to all 3 scheduler scripts (`run-marketops-run.sh`, `run-marketops-refresh.sh`, `run-marketops-premarket.sh`) so systemd timers use the Node version better-sqlite3 was built against.

- **Phase 1 — `dashboard_snapshots` table (FULLY MIGRATED).** Replaces growing `dashboard-public-safe-*.json` / `dashboard-data-bundle-*.json` timestamped files. SQLite is now source of truth; only latest `*-v0.1.json` pointer files kept on disk for site sync. 30-day retention auto-prune. Verified: timestamped files stop accumulating, refresh writes to SQLite.

- **Phase 2 — `market_bars` table (FULLY MIGRATED).** Replaces `rolling-market-history-v0.1.json` and `backfill-market-data-v0.1.json` write paths (`src/db/marketBars.js`, upsert). All readers updated: `prepMarketOpen.js` (`countSymbolsWithMarketData` now uses `getDistinctSymbols()`), `confidenceCalibration.js` (uses `getBarsForSymbol`), plus verified-no-change readers (`marketWeatherStation.js`, `backfillPriorDay.js`, `runFullSimulationQa.js` — all use lightweight-JSON-preserved fields only). Lightweight rolling/backfill JSON snapshots kept for downstream compat.
  - **Performance win:** `confidence:calibrate` 150s → 0.4s; `dashboard:refresh` ~160-220s → 8-11s; `intraday:simulate` ~157s → 9-12s. Populated: 235,850 bars / 148 symbols.

- **Phase 3 — runs/positions/trades/risk_decisions tables.**
  - **`runs` table (FULLY MIGRATED, Phase 1/2-style).** Replaces ever-growing `run-history.json` (was 146KB/171+ entries). New `src/db/runs.js`: `insertRun`, `pruneRuns` (30-day retention via `RUN_HISTORY_RETENTION_DAYS`), `getRecentRuns`, `getTotalRunCount`, `clearRuns`. `paper/writeHistory.js` `appendRunHistory()` rewritten to insert+prune+write a lightweight rolling-window `run-history.json` flagged `storage: "sqlite:runs"`. Reader updated: `dashboardDataBuilder.js` `runCount` now reads `runHistory.totalRuns`. `cleanStart.js` rewritten to use `clearRuns()`/`insertRun()`/`getTotalRunCount()` for the clean-start baseline run.
  - **`positions` / `re_entry_cooldowns` / `cycle_state` tables (DUAL-WRITE / additive).** New `src/db/positions.js` `syncPositions()` — full DELETE+INSERT-OR-REPLACE transaction, called alongside every existing `writeJson(paths.paperPositionsJson, ...)` (in `runIntradaySimulation.js`, `paperTradeExecutor.js` x2, `cleanStart.js`). **JSON remains source of truth** for the 8+ existing readers — full reader migration deferred (flagged below).
  - **`trade_ledger` / `trades` tables (DUAL-WRITE / additive).** New `src/db/trades.js` `syncTrades()` — same DELETE+INSERT-OR-REPLACE pattern, called alongside every `writeJson(paths.tradesJson, ...)` (in `runIntradaySimulation.js`, `runSimulation.js`, `cleanStart.js`). JSON remains source of truth.
  - **`risk_decisions` table (DUAL-WRITE / additive).** New `src/db/riskDecisions.js` `syncRiskDecisions()` — same pattern, called alongside every `writeJson(paths.riskJson, ...)` (in `runIntradaySimulation.js`, `runSimulation.js`). JSON remains source of truth. `scan_id` kept as plain INTEGER (no FK — no `signal_scans` table exists).
  - All four sync modules use `INSERT OR REPLACE` (fixed a `UNIQUE constraint failed: risk_decisions.risk_decision_id` error caused by duplicate IDs within a single 150-vehicle scan batch).
  - **Verified post-pipeline-run:** `positions` (closed=115, open=24), `risk_decisions` (149), `trade_ledger`/`trades` (0/0, correct for a 0-trade cycle), `runs` (total=11), `cycle_state` (4 rows: dailyTradeCount, tradeDate, resetAt, resetReason).

**Schema additions:** all in `src/db/db.js` SCHEMA string — `runs`, `positions`, `re_entry_cooldowns`, `cycle_state`, `trade_ledger`, `trades`, `risk_decisions` (plus Phase 1/2's `dashboard_snapshots`, `market_bars`).

**FLAGGED FOLLOW-UP (not done this cruise):** `positions`, `trade_ledger`/`trades`, and `risk_decisions` are dual-write only — SQLite is populated but NOT yet the source of truth. Their JSON files (`paper-positions-v0.1.json`, `paper-trades-v0.1.json`, `risk-decisions-v0.1.json`) are "fully overwritten each cycle" so they're not a disk-growth problem like Phase 1/2/runs were, but each has 8-10+ readers with deeply nested JSON (`entryPlan`/`exitPlan`/`riskPlan`/`learningMetadata`). Migrating those readers was judged too high-risk for one session on a live 30-min pipeline — recommend a dedicated follow-up cruise per table.

No commit made (per standing orders) — all changes local, awaiting Sam's review.

## 2026-06-10 — Public dashboard UX overhaul (committed + pushed live)
Per Sam's approved plan: combined trade table + two-tier dashboard/reports split + trade analytics.

**Shipped to sj3labs (live, Vercel auto-deploys on push):**
- `Source/marketops-core/src/site/publicDashboardBundle.js` — fixed `tradeStats.winRatePct`
  computation from closed positions (was broken/missing). Regenerated
  `dashboard-bundle-public-v0.4.json` / `-v0.5.json` via `npm run paper:refresh-site`.
- `marketops/dashboard/index.html` (sj3labs) — rewritten as the casual-audience main page:
  hero with new plain-English bot status line ("Bot is active · N positions open · last run X
  ago", derived from `dashboardRefreshHealth` + `accountSummary`), 4-metric Account Snapshot
  (Total Account Value, Total Return, Win Rate, Open Positions), equity curve, and a single
  combined trade table (`renderTradeTable()`) merging `openPositionsDetailed` +
  `recentlyClosedPositions` — columns Ticker/Entry/Exit/P&L/Hold Time/Status, sorted by hold
  time **ascending** (youngest entry/shortest-held first across open and closed rows).
  Removed all signal-confidence/risk-desk/cycle-history/deep-dive content (moved to reports).
- `marketops/reports/index.html` (sj3labs) — new live deep-dive page: Signal Pipeline &
  Confidence, Risk Desk Decision Board (incl. capacity-blocked + almost-approved), Drawdown &
  Target Progress, **new Trade Analytics section** (position sizing distribution, win/loss
  P&L distribution, hold-time-vs-P&L scatter, drawdown recovery episodes, signal-to-trade
  conversion funnel), Cycle History, Performance Deep-Dive.
- `marketops/marketops.css` (sj3labs) — bumped `.chart-text` 11px→12px, added `.axis-title`
  (12px bold) class.
- All SVG charts on the reports page now have explicit labeled X/Y axis titles via a new
  `addAxisTitles()` helper (threaded through `renderLine`/`renderBars`/`renderHorizontal`/
  `renderMix` and the bespoke return-drawdown/vehicle-activity charts).

**Verified before push:** local `python3 -m http.server 8123` from sj3labs root — both pages
+ bundle JSON return 200; `node --check` passed on both pages' inline scripts; every
`getElementById` cross-checked against HTML ids; computed values checked against the live
v0.5 bundle (status line, headline metrics, 54-row trade table, histogram/scatter/funnel
inputs all sane).

**Pushed:** sj3labs commit `e22e67e` → origin/main (live site).

**Not yet committed in MarketOps repo:** this same session also leaves
`Source/marketops-core/src/site/publicDashboardBundle.js` (win-rate fix) staged for commit —
see commit immediately following this brain update.

**Note:** sj3labs `index.html` (homepage project-card reorder — MarketOps card moved up,
Business Builder linked externally) was left **uncommitted** — it's Sam's pre-existing
in-progress edit, unrelated to this dashboard work, not touched or included in this push.

## 2026-06-11 — Signal quality hardening cruise (implemented, NOT committed — awaiting review)
Per Sam's approved plan: encode proven entry/exit/sizing rules to give the bots a better
baseline, addressing the data finding that 72h time-stops were averaging +$0.11 P&L while
target/stop exits averaged -$0.36 (stops triggering too early on noise).

**Files changed (uncommitted):**
- `Source/marketops-core/config/marketops.phase1.config.json`
  - `learningMode.exitRules.byInstrumentType`: ETF stopLossPct 2→4, stock stopLossPct 3→6
    (targets unchanged: ETF 3, stock 6).
  - Added `learningMode.exitRules.minHoldHoursBeforeStop: 4` — stop-loss exits cannot fire
    within the first 4 hours of a position's entry (target_hit and time_stop unaffected).
  - Added `learningMode.entryFilters`: `fallingKnifeThresholdPct: 3`, `minVolumeThreshold:
    500`, `lateSessionCutoffEt: "15:30"`, `minRiskRewardRatio: 1.5`.
  - Added `learningMode.sizing.riskPerTradePct: 0.015` (1.5% of equity risked per trade).
- `Source/marketops-core/src/execution/paperTradeExecutor.js`
  - New helpers: `loadEntryFilters()`, `getEtParts(timestamp)` (ET date-key + minutes-of-day
    via `Intl.DateTimeFormat`), `parseEtCutoffMinutes("HH:MM")`, `getDayOpen(bars, timestamp)`
    (first bar's open for the entry bar's ET trading day).
  - `checkAndExecuteExits()`: `stop_loss` branch now requires `holdHours >=
    minHoldHoursBeforeStop` in addition to the return-pct breach.
  - `executeIntradayPaperTrades()`: per-decision loop (after the re-entry cooldown gate, before
    sizing) now applies 4 new entry filters in order — falling-knife (>3% below day's open),
    thin-market (entry-bar volume < 500), late-session cutoff (entry bar >= 15:30 ET), and
    minimum risk/reward (`decision.exitPlan.profitTargetPct / stopLossPct >= 1.5`, using the
    per-signal `exitPlan` from `buildExitPlan()`, NOT the instrument-type stops — this was the
    flagged design decision, resolved per Sam's direction). Each rejection pushes a labeled
    reason to `skippedReasons` and `continue`s, matching the existing cooldown-gate pattern.
  - Position sizing replaced: flat `perTradeAllocationPct * totalEquity` →
    `riskBasedValue = (totalEquity * riskPerTradePct) / (instrumentTypeStopLossPct / 100)`,
    still capped by `maxPositionSizePct * totalEquity` and `cashBalance`, with the existing
    learning-probe `sizeMultiplier` applied on top.

**Verified (no real paper-state files or DB rows touched):**
- `node -c` syntax check passed.
- ET time-of-day helper logic spot-checked (15:29/15:30 ET boundary, midnight rollover).
- `npm run intraday:simulate` ran clean end-to-end (0 candidates this cycle — normal market
  condition, not caused by these changes).
- Standalone harness (mocked `fileStore.writeJson`/`syncPositions` to no-ops, real config)
  exercised `executeIntradayPaperTrades` and `checkAndExecuteExits` against synthetic
  signals/bars:
  - Falling-knife, thin-market, late-cutoff, and low-R:R signals were each correctly rejected
    with the expected `skippedReasons` messages; a signal passing all four executed with
    `positionValue: 2500` = `totalEquity(10000) * maxPositionSizePct(0.25)` — risk-based value
    (3750) was correctly capped by the existing safety guardrail.
  - A position 2h into its hold with a -5% return (breaching the new 4% ETF stop) correctly
    stayed open (`minHoldHoursBeforeStop` not yet met); an otherwise-identical position at 5h
    correctly closed with `exitReason: "stop_loss"`.
- `npm run qa:full`: 71/72 checks pass. The 1 failure ("performance cash vs run summary
  match", perf_cash=569.68 vs summary(endingEquity)=979.49) is a **pre-existing QA-script
  issue, not a regression** — confirmed present in run-history entries from before this
  session (24 open positions worth ~$409.81 mean cash != total equity by design; the QA check
  assumes they're always equal).

**Not done / flagged:** no commit made (per standing orders + Sam's explicit "do not commit"
for this cruise) — stopping point is here, awaiting Sam's review of the diff and the R:R
design choice (per-signal `exitPlan` ratios, not instrument-type stops).

## 2026-06-16 — "Not trading" outage: root cause + 3 fixes (committed, awaiting push)
Symptom: scheduler running on cadence but 0 buys / 0 open positions for days. Every run showed
`riskApproved: 0, riskBlocked: 150`. Initial suspicion (per the hardening cruise) was the new
entry filters — that was a **red herring**. Investigation traced the failure upstream and found
three issues; the outage was caused by #1, and #2/#3 were exposed once trading was restored.

**Root cause (the outage) — market-data wiring broke in the SQLite migration (bcae512):**
- `updateRollingHistory()` was rewritten to store bars in SQLite `market_bars` and return only a
  summary index — it **dropped the flat `history` array** its callers depend on.
- `runIntradaySimulation.js` still did `if (rolling.history) { marketBars = rolling.history }`; with
  `rolling.history` now `undefined`, it fell back to `loadMarketBars()` (one latest bar/symbol).
- Scanner saw `<2 bars` for every symbol → all 150 flagged `no_data` → Risk Desk correctly rejected
  every non-candidate ("Signal did not qualify as a candidate") → 0 approvals → executor's
  `for (const decision of approvedDecisions)` loop never ran, so the entry filters never executed.
- The data itself was intact the whole time (405k+ bars in SQLite); only the retrieval was broken.
- Note: this means CLAUDE.md's "Risk Desk blocking too aggressively" was a misdiagnosis — the Risk
  Desk was doing the right thing with empty signals.

**Fix #1 — `src/marketdata/rollingHistoryStore.js` (commit 99d1921):**
- Reassemble `history` from `getBarsForSymbol()` across `getDistinctSymbols()`, restoring the
  original in-process contract. Persisted JSON stays summary-only (bars live in SQLite); `history`
  is returned to in-process callers only.
- After fix: 91 candidates, 68 risk-approved, 14 trades executed (was 0/0/0).

**Fix #2 — thin-market volume unit, `paperTradeExecutor.js` + config (commit 4ab0da8):**
- `minVolumeThreshold: 500` was compared against a **single 1-minute IEX bar's** volume. IEX carries
  only a few % of consolidated volume, so liquid ETFs/blue chips (DIA, VB, VO, COST, LLY…) read in
  the tens-to-hundreds of shares — 37 of 148 symbols (25%) were wrongly rejected as "thin."
- Switched to **average shares/bar over `volumeLookbackBars` (30) bars**; renamed the config key to
  `minAvgBarVolume` so the unit is explicit; recalibrated threshold 500 → 100 (lowest in universe
  ~123). Verified all previously-rejected liquid ETFs now pass; only degenerate near-zero bars reject.
- (Also confirmed during this cruise that the `minRiskRewardRatio` filter correctly reads the
  per-signal `exitPlan` ratios from `buildExitPlan()`, NOT the instrument-type stops — no change
  needed; the flagged R:R design choice is working as intended.)

**Fix #3 — FK constraint on positions rebuild, `src/db/db.js` (commit 9949435):**
- `trades.position_id` had a bare `REFERENCES positions(position_id)` (implicit ON DELETE NO ACTION).
  `syncPositions()` rebuilds the snapshot each cycle via `DELETE FROM positions`, which
  RESTRICT-failed (`SQLITE_CONSTRAINT_FOREIGNKEY`) once any trade referenced a live position. Latent
  until Fix #1 restored trading: the first run that opened positions made the next cycle crash.
- Changed FK to `ON DELETE SET NULL` (preserves append-only trade rows, nulls the stale link). SQLite
  can't alter an FK in place, so added an **idempotent migration** in `getDb()` that rebuilds the
  trades table and copies rows; no-ops once `on_delete` is `SET NULL`.

**Verified:**
- Pre-migration `DELETE FROM positions` reproduces the crash; post-migration the same delete succeeds
  with the trade preserved (`position_id` NULL); `foreign_key_check`/`integrity_check` clean.
- Two consecutive full `intraday:simulate` cycles run green with no FK error (97 candidates, 53
  approved each; 0 new trades only because the book was already full / cash $0 — capacity-bound).
- Filter-level check: DIA/VB/VO/IJH/IBB/KBE/XHB/XRT/ARKF + blue chips VV/COST/LLY all clear the new
  volume gate.

**Note on `trades` table semantics:** `syncTrades()` fully overwrites `trades`/`trade_ledger` each
cycle (snapshot of the current cycle's executions, per its own comment) — it is NOT cumulative
history. Durable history lives in `Data/paper/history/run-history.json` and the paper-trades archives.

**State:** 3 commits on `main` (99d1921, 4ab0da8, 9949435) + brain doc (097b742) — reviewed and pushed.

## 2026-06-16 — Public dashboard "$2,000" account-value glitch (committed + synced live)
After trading was restored, the public site (sj3labs.com/marketops/dashboard) showed **Total
Account Value $1,984.16** and **Total Return +98.42%** — Sam asked if it was real profit. It was
not: the engine's own books were always correct (peak equity $1,000.74; current ~$982, a ~-1.6%
loss). The glitch was two falsy-zero bugs in the public-bundle builder, NOT an accounting error.

**Root cause — `src/site/publicDashboardBundle.js` (commit 305037f):**
1. **Total Account Value double-counted starting cash.** `buildTotalAccountValueCurve()` used
   `paperResults.cashBalance || ... || originalStartingBalance`. With the book fully deployed, current
   cash is legitimately `0` (falsy), so `||` fell through to the $1,000 starting balance → card showed
   `$1,000 + holdings (~$984)` = `$1,984`. Fixed with `??` so a real `0` is preserved.
2. **Total Return anchored to the wrong baseline.** `startingBalance` came from
   `equityCurve.startingBalance || paperResults.startingBalance`, which carry the per-run starting
   *cash* (also `0` once deployed and the cycle hasn't reset). Combined with bug 1 this produced the
   fake `(1984-1000)/1000 = +98%`; alone it gave a meaningless 0%. Fixed by anchoring return/PnL to
   the ORIGINAL paper baseline (`cycle.startingBalance || config.paperAccount.paperStartingBalance`,
   $1,000).

**Verified end-to-end:** rebuilt bundle reconciles (cash $0 + holdings = total $982.36) and return %
matches manual calc against the $1,000 baseline (-1.76%). Pushed `305037f` to MarketOps `main`,
rebuilt via `paper:refresh-site`, synced via `public:sync` (leak checks passed), pushed sj3labs-site
`main` (c2f158b..40702ea). Confirmed LIVE: `sj3labs.com/.../dashboard-bundle-public-v0.5.json` now
serves `totalAccountValue 982.36`, `totalPnlPct -1.76`. The sync touched only data bundles; the
frontend `index.html` was untouched.

**Reusable lesson:** in this codebase, money fields can legitimately be `0` (cash fully deployed).
Use `??` not `||` for cash/balance fallbacks, and never anchor returns to per-run starting *cash* —
use the original paper baseline (`cycle.startingBalance` / `config.paperAccount.paperStartingBalance`).

## Daily Review Log
- 2026-06-16 daily review: CHANGE RECOMMENDED, win rate 32.7%, cumulative P&L $-13.18 (139 closed)

## 2026-06-25 — Signal rebuild cruise (implemented, NOT committed — awaiting Sam approval)
Replaced the directional signal in `simpleSignalScanner.js`. The old signal (single coarse
full-history trailing return, bet in its direction) was measured ANTI-predictive, not just random.

**Phase 1 backtest** (`Reports/marketops-signal-rebuild-phase1-backtest-v0.1.md`, read-only harness
over `market_bars` 2026-06-11..06-25, 148 symbols, 12,949 forward-outcome samples):
- Old signal session corr −0.078; its go-long cohort won **31.4%** vs 40.5% for ignored names (−9.1
  edge) — the worst cohort in the study. Confirms the prior −0.06 diagnosis.
- The prompt's lead candidates (EMA 8/21 cross, multi-timeframe momentum alignment) tested as
  **noise** (corr +0.03–0.07). The real edges: 1-day trend PERSISTS (ROC-1d corr +0.118) while
  short-term/VWAP extension MEAN-REVERTS (VWAP-distance corr −0.163, strongest single signal).
- Winning combo "buy the dip in an uptrend" (`roc1d>0 AND price<VWAP`): cohort win% 44.6/45.7/36.3
  (1h/4h/session) vs 41.1/34.0/30.7 rest; avg-return edge flips negative→positive. Dip-depth gradient
  is monotonic (31%→46% session win% as price goes from above to >0.5% below VWAP). NOTE: only ~2
  weeks, one down/choppy regime — the `roc1d>0` filter is the falling-knife guard; re-validate as bars
  accumulate.

**Phase 2 (Sam approved Option 2: no roc2h gate, volume > marginal edge):**
- `simpleSignalScanner.js` rewritten to `signalModel: "trend_filtered_mean_reversion_v1"`. Gates:
  1-day ROC > 0 (uptrend) AND price below session VWAP (pullback) AND NOT a falling knife. Long-only.
  Output contract preserved (status candidate/learning_candidate, directionBias "up",
  confidence/normalizedConfidence, trigger, invalidation, entry/exit/risk plans).
- **Falling-knife filter** (`learningMode.entryFilters.fallingKnifeThresholdPct`, default 3%) is now
  loaded and evaluated INSIDE the scanner, before the signal fires — a name down >3% from the day's
  open is rejected even when below VWAP. The executor keeps its own falling-knife filter as the
  downstream safety net (executor untouched).
- **Confidence rebuilt as setup quality**, not a magnitude transform of trailing return:
  `0.10 + 0.80*(0.5*clamp(roc1d/2%) + 0.5*clamp(-vwapDist/0.5%))` → [0.10,0.90]. Stronger 1-day trend
  + deeper dip below VWAP = higher confidence. Maps onto risk-desk bands (standard ≥0.58, probe ≥0.42).
- Scope honored: ONLY the scanner + confidence touched. Nothing else changed.

**Verified:**
- New unit test `src/signals/__tests__/simpleSignalScanner.test.js` (standalone node-assert, TDD —
  watched 3 behavior tests fail RED first): **9/9 pass** (extended-above-VWAP rejected, 1-day
  downtrend rejected, falling-knife rejected, confidence rewards setup quality and is not a trailing-
  return magnitude transform).
- `npm run intraday:simulate`: 150 vehicles → **23 candidates + 11 learning_candidates (34 up), 26
  risk-approved**. Every up-signal satisfies `roc1d>0 AND vwapDist<0` (0 violations). 12 falling-knife
  names rejected (AAPL −5.5%, QCOM −5.9%…); 31 extended-above-VWAP names rejected (old scanner would
  have chased these). Confidence spread real: GDXJ (roc1d 1.96 / dip −0.44) → 0.85; DIA (0.12/−0.52) →
  0.52; weak learning_candidates 0.34–0.48.
- 0 trades executed this run is NOT a signal issue: run timestamp 20:43 ET is after the executor's
  15:30 ET late-session cutoff, so approved decisions are correctly held by the (untouched) executor
  filter. A market-hours run would execute them.
- QA gates: `signal:qa` 107/0, `risk:qa` 1048/0, `qa:full` 72/0 — all PASS, no regression.

**Files (uncommitted):** `src/signals/simpleSignalScanner.js` (rewrite), new
`src/signals/__tests__/simpleSignalScanner.test.js`, new
`Reports/marketops-signal-rebuild-phase1-backtest-v0.1.md`. No commit, no publish (per standing
orders + Sam's "report before committing"). Paper state essentially unchanged (0 trades; 0 open / 280
closed / cash $948.90).
