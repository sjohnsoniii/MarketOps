# MarketOps Paper Balance Reconciliation v0.6

**Date:** 2026-05-18
**Author:** automated reconciliation agent
**Status:** COMPLETE

## Problem Statement

The active paper training scenario showed inconsistent balances across different reporting surfaces:

| Source | Balance Reported |
|--------|----------------|
| `npm run training:prep-market-open` | $1,000.00 |
| `npm run cycle:status` | $1,000.00 |
| `npm run dashboard:refresh` (paper section) | $4,218.75 |
| `npm run dashboard:refresh` (cycle section) | $1,000.00 |
| Public trial status (sj3labs) | $4,192.26 |
| Paper performance (active account state) | $4,218.75 cash / $4,192.26 equity |

## Root Cause

The divergence was caused by **two independent balance tracks** that had diverged:

### Track 1: Paper Performance ($4,218.75 / $4,192.26)
- Source: `Data/paper/performance/paper-performance-v0.1.json`
- Initialized with `startingCash: 10000` (from config `paperAccount.startingBalance`)
- Three legacy paper positions (AAPL, MSFT, NVDA) consumed $5,781.25 in cash
- Remaining cash: $4,218.75, unrealized P&L: -$26.49, total equity: $4,192.26
- This track was the source of truth for `paperTradeExecutor.js`, `equityCurve`, `runHistory`, `dashboardAggregator.currentPaperPerformance`, and `generatePublicTrialStatus`

### Track 2: Cycle Balance ($1,000.00)
- Source: `Data/paper/cycles/paper-cycle-state-v0.1.json`
- Initialized from config `paperAccount.paperStartingBalance: 1000`
- Used by `paperCycle.js`, `dashboardAggregator.paperCycleStatus`, and `prepMarketOpen.js`
- Did not update from paper-performance because all applied runs had `paperPnl: 0`

## Files Modified

### Data/paper/performance/paper-performance-v0.1.json
- Reset to: startingCash=1000, cashBalance=1000, totalEquity=1000
- Cleared: unrealizedPnl, maxDrawdown, peakEquity, dailyDrawdown

### Data/paper/positions/paper-positions-v0.1.json
- Moved 3 open positions (AAPL, MSFT, NVDA) to closedPositions
- All marked with `legacyTest: true` and descriptive `legacyNote`

### Data/paper/trades/paper-trades-v0.1.json
- Reset all balance fields to 1000 (startingCash, cashBalance, totalEquity, startingBalance, endingBalance)
- Cleared openPositionCount, unrealizedPnl, skippedReasons
- Updated notes to document reconciliation

### Data/paper/equity/equity-curve-v0.1.json
- Reset startingBalance to 1000, endingEquity to 1000
- Updated targetBalance to 1300 (30% growth target on $1000)

### Data/paper/history/latest-run-summary.json
- Created reconciliation run entry with startingBalance=1000, endingEquity=1000
- Added `reconciliationV06: true` flag

### Data/paper/history/run-history.json
- Added `reconciliationV06` metadata section documenting the reset
- Appended reconciliation run entry with $1000 starting balance
- Previous 482 runs marked as legacy via the metadata

### Data/dashboard/dashboard-public-safe-v0.1.json
- Updated currentPaperPerformance: startingEquity=1000, endingEquity=1000
- Updated targetProgress: startingBalance=1000, currentBalance=1000, targetBalance=1300
- Updated all botActivityTimeline, paperPnlSeries, rollingEquity endingEquity to 1000
- Updated timestamps

### Data/dashboard/dashboard-refresh-latest-v0.1.json
- Updated paper.endingEquity to 1000
- Updated paper.latestRunId and timestamps

### Data/public/marketops-public-trial-status-v0.1.json
- Reset paperBalance to 1000, paperEquity to 1000
- Cleared unrealizedPnl and openPositionsCount

### ../sj3labs/data/marketops/marketops-public-trial-status-v0.1.json
- Mirror update of public trial status to $1000 baseline

### Unchanged Files (already consistent)
- Data/paper/cycles/paper-cycle-state-v0.1.json (already $1000)
- Data/paper/cycles/paper-cycle-latest-v0.1.json (already $1000)
- Source/marketops-core/config/marketops.phase1.config.json (no code changes)

## Backup

Pre-reconciliation state archived to:
`Backups/paper-state-before-reconciliation-v0.6-20260518-225359/`

## What This Means

- The active paper training account now consistently reports **$1,000.00** across:
  - training:prep-market-open
  - cycle:status
  - dashboard:refresh
  - dashboard:refresh:qa
  - public trial status (sj3labs)
  - paper performance state
- All 3 legacy positions from the $10k seed account are closed and marked `legacyTest: true`
- The run history preserves all 482 previous runs as legacy/test data
- No code was modified — only data JSON files under the existing allowlist
- No live trading, broker execution, or real-money behavior exists

## Next Market Open Behavior

When the next paper simulation runs:
1. `paperTradeExecutor.js` will read `paper-performance.json` and use **$1,000** cash balance
2. Positions will be opened from the $1,000 baseline
3. The cycle will receive new run(s) and update `currentBalance` accordingly
4. Dashboard refresh will regenerate equity curves and charts from the $1,000 starting point
5. Public trial status will reflect the new $1,000-based account state
