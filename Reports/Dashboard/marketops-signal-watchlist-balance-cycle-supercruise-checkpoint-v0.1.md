# MarketOps Signal Watchlist Balance Cycle Supercruise Checkpoint v0.1

Generated: 2026-05-14T02:20:20Z (2026-05-13 22:20 America/New_York)

## Result

PASS. MarketOps now has a local master dashboard refresh path that produces public-safe movement even when Risk Desk approves 0 fake trades. The refresh uses Alpaca IEX market-data inputs where available, paper-only outputs, risk rejection explainability, and a balance-based $1,000 paper cycle.

No push, deploy, scheduler install, live trading, broker execution, social posting, email/SMS, payments, or secret exposure was performed.

## Baseline

- Repo detected: yes.
- Starting git status: clean before this checkpoint work.
- Current worktree now contains the expected local source, generated data, QA, and report changes from this checkpoint.
- Public-safe local handoff file refreshed under `~/Projects/sj3labs/data/marketops/dashboard-bundle-public-v0.4.json`.
- No deploy or push was run.

## Run History Evidence

- `Data/paper/history/run-history.json` now contains 84 paper runs.
- Runs since 2026-05-08: 65.
- Latest run: `paper-20260514-022020137Z`, generated at 2026-05-14T02:20:20.137Z.
- Continuous operation is not proven. Current run history has gaps over 75 minutes, including a large gap from 2026-05-09T03:00:02.801Z to 2026-05-13T19:40:21.818Z.
- `Data/logs` still shows 2026-05-10 paper refresh/full log files at roughly 30-minute cadence and office logs around 10:00 and 19:59 local time.
- Interpretation: the 2026-05-10 logs are evidence of a scheduled-style or copied refresh run, but the current run-history file does not show uninterrupted daily continuity through 2026-05-13.

## What Changed

- Added `risk:explain` to generate layman trade rejection explainability.
- Added `cycle:build`, `cycle:qa`, and `cycle:status`.
- Added balance-based cycle state under `Data/paper/cycles`.
- Added dashboard movement sections for watchlist movement, up/down/flat counts, movement buckets, signal confidence, rejection reasons, almost-approved candidates, market regime, and cycle status.
- Updated the public-safe dashboard bundle to avoid raw bid/ask/close field publishing.
- Updated the local preview HTML so Sam can see movement, rejection reasons, and cycle status.
- Updated `dashboard:refresh` so it runs market data, paper full, risk explainability, cycle build/QA, dashboard build, public-safe bundle refresh, and QA in order.

## Dashboard Movement With 0 Approved Trades

Latest refresh:

- refresh status: PASS
- market data source/feed: alpaca_iex / iex
- market data refresh: 2026-05-14T02:20:20.080Z
- latest bar timestamp: 2026-05-13T13:45:00Z
- bars loaded: 100
- quotes loaded: 5
- paper run: 0 fake paper trades
- risk approved: 0
- risk blocked: 8

Movement still appears through:

- watchlist movement summary: 5 rows
- up/down/flat vehicle counts: up 0, down 3, flat 2
- movement buckets: 5 rows
- signal candidates generated: 3 rows
- signal confidence distribution: 4 rows
- risk rejection reasons: 5 rows
- almost-approved candidates: 8 rows
- bot activity timeline: 20 rows
- stale warning panel: 2 rows
- paper cycle status: 1 active cycle

## Trade Rejection Explainability

Report created:

- `Reports/Risk/marketops-trade-rejection-explainability-v0.1.md`

Latest result:

- signals reviewed: 8
- approved for fake paper trade: 0
- rejected or observation-only: 8

The report explains:

- what each reviewed symbol represented
- whether it was approved or rejected
- the plain-English rejection reason
- what would make it approvable
- what the bots should improve next

Dominant rejection themes:

- signal did not qualify as a candidate
- confidence below threshold
- long/up-only gate blocked downside or short-style paths
- missing invalidation on crypto rows

## Balance-Based $1,000 Paper Cycle

Cycle outputs created:

- `Data/paper/cycles/paper-cycle-state-v0.1.json`
- `Data/paper/cycles/paper-cycle-latest-v0.1.json`
- `Reports/Cycles/marketops-paper-cycle-status-v0.1.md`
- `Reports/Cycles/marketops-paper-cycle-qa-v0.1.md`

Current cycle:

- cycleId: cycle-20260514-0220
- status: active
- startingBalance: 1000
- currentBalance: 1000
- depletionThreshold: 0
- cycleStartTimestamp: 2026-05-14T02:20:20.137Z
- hoursSurvived: 0
- daysSurvived: 0
- approvedTrades: 0
- rejectedTrades: 8
- depletionRisk: normal

Cycle rules:

- The cycle is not daily/calendar-based.
- The cycle does not reset daily.
- It continues while current balance is above the depletion threshold.
- If balance is at or below threshold, the cycle becomes `reset_pending`.
- A depleted cycle writes closeout data and schedules the next cycle for the next market morning.
- Lessons and strategy-performance history carry forward.
- Core code and risk gates do not self-modify.

## Agent Improvement Loop

Report created:

- `Reports/Optimization/marketops-agent-improvement-loop-v0.1.md`

Agents may propose improvements based on observed cycle performance, rejection reasons, missed moves, drawdown behavior, failed refreshes, and depletion events. Improvements are recommendations or versioned proposals only. They must include expected benefit, risk, and test path. They do not auto-apply code changes or weaken risk gates.

## 2-Hour Refresh Plan

Report created:

- `Reports/Automation/marketops-dashboard-refresh-schedule-plan-v0.1.md`

Decision:

- Target cadence: every 2 hours during market hours.
- Later 15-minute cadence: deferred until refreshes, failure detection, dashboard updates, and public publishing controls are stable.
- Recommended future scheduler: systemd user timer, with cron as fallback.
- Scheduler installed now: false.

Exact future command:

```bash
cd ~/Projects/MarketOps/Source/marketops-core
npm run dashboard:refresh
```

## Public sj3labs Handoff

Report created:

- `Reports/Dashboard/marketops-public-data-handoff-plan-v0.1.md`

Allowed current public-safe file:

- `~/Projects/sj3labs/data/marketops/dashboard-bundle-public-v0.4.json`

Current public bundle:

- dataSource: alpaca_iex
- refreshCadenceMinutes: 120
- barsLoaded: 100
- quotesLoaded: 5
- rawMarketDataPublished: false
- paperOnly: true
- externalEffects: false
- publishAllowed: false

Never allowed in public output:

- `.env` files
- secrets
- API keys
- tokens
- raw broker/account identifiers
- raw broker/API payload dumps
- raw restricted real-time quote/bar payloads
- private logs
- local admin state

## Commands Added Or Changed

- `npm run risk:explain`
- `npm run cycle:build`
- `npm run cycle:qa`
- `npm run cycle:status`
- `npm run dashboard:refresh`
- `npm run dashboard:refresh:qa`
- `npm run dashboard:preview`

## QA Results

- `npm run dashboard:refresh`: PASS
- `npm run dashboard:refresh:qa`: PASS, 69 passed, 0 failed
- `npm run qa`: PASS, 37 passed, 0 failed
- `npm run marketdata:qa`: PASS, 26 passed, 0 failed
- `npm run dashboard:qa`: PASS, 154 passed, 0 failed
- `npm run dashboard:public-refresh:qa`: PASS, 18 passed, 0 failed
- `npm run cycle:qa`: PASS, 15 passed, 0 failed
- `npm run office:qa`: PASS, 47 passed, 0 failed
- `npm run agents:qa`: PASS, 62 passed, 0 failed
- `npm run admin:qa`: PASS, 71 passed, 0 failed
- `npm run approvals:qa`: PASS, 1540 passed, 0 failed

QA verifies paper-only flags, `externalEffects: false`, `publishAllowed: false`, no live trading, no broker execution, no social posting, no email/SMS, dashboard arrays non-empty, rejection explanations exist, cycle files are valid, cycle does not reset daily, depleted-cycle behavior is modeled as reset_pending, and scheduling is planned but not installed.

## Files Added Or Modified

Source:

- `Source/marketops-core/package.json`
- `Source/marketops-core/src/utils/paths.js`
- `Source/marketops-core/src/risk/runTradeRejectionExplainability.js`
- `Source/marketops-core/src/cycles/paperCycle.js`
- `Source/marketops-core/src/cycles/runCycleBuild.js`
- `Source/marketops-core/src/cycles/runCycleQa.js`
- `Source/marketops-core/src/cycles/runCycleStatus.js`
- `Source/marketops-core/src/dashboard/dashboardAggregator.js`
- `Source/marketops-core/src/dashboard/runDashboardPreview.js`
- `Source/marketops-core/src/dashboard/runDashboardQa.js`
- `Source/marketops-core/src/dashboard/runDashboardRefresh.js`
- `Source/marketops-core/src/dashboard/runDashboardRefreshQa.js`
- `Source/marketops-core/src/dashboard/runPublicDashboardRefreshQa.js`
- `Source/marketops-core/src/site/publicDashboardBundle.js`

Generated local outputs:

- `Data/paper/cycles/**`
- `Data/dashboard/dashboard-public-safe-v0.1.json`
- `Data/dashboard/dashboard-refresh-latest-v0.1.json`
- `Data/dashboard/latest-dashboard-summary.json`
- `Admin/dashboard-preview/marketops-dashboard-preview-v0.1.html`
- `Reports/Risk/marketops-trade-rejection-explainability-v0.1.md`
- `Reports/Cycles/marketops-paper-cycle-status-v0.1.md`
- `Reports/Cycles/marketops-paper-cycle-qa-v0.1.md`
- `Reports/Optimization/marketops-agent-improvement-loop-v0.1.md`
- `Reports/Automation/marketops-dashboard-refresh-schedule-plan-v0.1.md`
- `Reports/Dashboard/marketops-public-data-handoff-plan-v0.1.md`
- `Reports/Dashboard/marketops-signal-watchlist-balance-cycle-supercruise-checkpoint-v0.1.md`

Public-safe related-site output:

- `~/Projects/sj3labs/data/marketops/dashboard-bundle-public-v0.4.json`

## Remaining Blocks

- Public deploy requires explicit approval.
- Push requires explicit approval.
- Scheduler installation requires explicit approval.
- 15-minute cadence is deferred until the 2-hour cadence proves stable.
- Live trading and broker execution remain disabled and not approved.
- The latest market bar is after-hours/aging relative to the refresh time, so the dashboard must keep stale/market-closed warnings visible.

## Commands Sam Should Run Next

Refresh everything locally:

```bash
cd ~/Projects/MarketOps/Source/marketops-core
npm run dashboard:refresh
```

Verify the refresh:

```bash
npm run dashboard:refresh:qa
```

Preview the dashboard locally:

```bash
npm run dashboard:preview
xdg-open ~/Projects/MarketOps/Admin/dashboard-preview/marketops-dashboard-preview-v0.1.html
```

Check the active cycle:

```bash
npm run cycle:status
```

## Safety Confirmation

- no push
- no deploy
- no schedule installed
- no live trading
- no broker execution
- no real-money execution
- no social posting
- no email/SMS
- no payments
- no secret exposure
- no raw restricted market-data publishing
