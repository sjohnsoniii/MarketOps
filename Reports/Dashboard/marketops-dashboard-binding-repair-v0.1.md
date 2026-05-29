# MarketOps Dashboard Binding Repair v0.1

Generated: 2026-05-26T00:00:00.000Z

## Objective

Wire all five dashboard UI sections (Total Account Value, Current Cycle Activity, Cycle Decision Board, Paper Profit/Loss, Progress Toward Core Paper Target) to the canonical public-safe source file `dashboard-bundle-public-v0.5.json`.

## Changes

### publicDashboardBundle.js (Source)
- Added `paperProfitLoss` section with realizedPnl, unrealizedPnl, totalPnl, totalPnlPct, winningTrades, losingTrades, openPositionPnl
- Added `corePaperTarget` section with startingBalance, currentTotalAccountValue, targetValue, progressPct, remainingToTarget, depletionThreshold, distanceFromDepletion, targetStatus
- Enhanced `accountSummary` with startingBalance, realizedPnl, unrealizedPnl, totalPnl, totalPnlPct
- Enhanced `openPositionsDetailed` with entryRiskBand, currentRiskBand, riskBandSource, riskBandStale
- Added `enrichCycleActivity()` and `enrichDecisionBoard()` helper functions
- Added capacityBlocked and hardSafetyFailures to riskPipeline
- Fixed bug: `generatedAt` was referenced but not defined in `mergeSiteDashboardSections` (line 1066), changed to `bundle.generatedAt`

### index.html (UI)
- Added `renderPaperProfitLoss()` rendering function with empty-state fallback
- Added `renderCorePaperTarget()` rendering function with empty-state fallback
- Wired both into `renderAllSections()` call sequence
- Added capacity_blocked summary card and items table to decision board
- Split riskBand table column into entryRiskBand + currentRiskBand + stale indicator

### runSiteBindingQa.js
- Added checks for renderPaperProfitLoss, renderCorePaperTarget, paper-pnl section, core-target section, capacity_blocked, entryRiskBand, currentRiskBand, riskBandStale
- Added bundle content validation for paperProfitLoss, corePaperTarget, accountSummary fields, entryRiskBand, currentRiskBand, capacity_blocked

### runDashboardRefreshQa.js
- Added checks for paperProfitLoss, corePaperTarget, capacity_blocked, entryRiskBand in public bundle

## QA Results

| Script | Status | Checks |
|---|---|---|
| dashboard:data:qa | PASS | 1007 passed, 0 failed |
| dashboard:site-binding:qa | PASS | 62 passed, 0 failed |
| dashboard:refresh:qa | PASS | 118 passed, 0 failed |
| dashboard:public-refresh:qa | PASS | 24 passed, 0 failed |

## Public Bundle Verification

Bundle: `/home/sjohnsoniii/Projects/sj3labs/data/marketops/dashboard-bundle-public-v0.5.json`

- paperProfitLoss.realizedPnl: 0
- paperProfitLoss.unrealizedPnl: 6.17
- corePaperTarget.startingBalance: 1000
- corePaperTarget.targetValue: 13000
- accountSummary.realizedPnl: 0
- accountSummary.unrealizedPnl: 6.17
- openPositionsDetailed: 14 positions with entryRiskBand and currentRiskBand
- cycleDecisionBoard.capacity_blocked: present with 0 items
- All 62 site-binding checks pass

## Known Issues

- dashboard:refresh runs as CONTROLLED_DEGRADED when market data is unavailable (off-hours). Public bundles are still writable via `paper:refresh-site` directly.
- latest-dashboard-summary.json at Data/dashboard/ is an orphan; the UI never fetches it.
