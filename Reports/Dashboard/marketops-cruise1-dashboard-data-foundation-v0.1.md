# MarketOps Cruise 1 — Dashboard Data Foundation

Generated: 2026-05-20T01:33:54.956Z

## Overview

Cruise 1 establishes the structured dashboard data foundation for MarketOps,
providing three core data objects for the public dashboard:

1. **equityCurve** — Total Account Value equity curve with 14-day window
2. **currentCycleActivity** — Current cycle buys, sells, and open holdings
3. **cycleDecisionBoard** — Bought / Watched / Rejected decision board

All data is paper-simulation only. No real trading, no broker execution.

---

## Files Changed

### Files Changed Specifically by Cruise 1 (new source files)

| File | Status | Description |
|---|---|---|
| `src/dashboard/dashboardDataBuilder.js` | **NEW** | Core dashboard data builder module (equityCurve, currentCycleActivity, cycleDecisionBoard) |
| `src/dashboard/runDashboardDataBuild.js` | **NEW** | Runner script for dashboard data build |
| `src/dashboard/runDashboardDataQa.js` | **NEW** | QA module with 520 checks for dashboard data |

### Pre-existing Dirty Files Before Cruise 1 (modified prior)

These files were already modified before Cruise 1 started and are NOT part of this cruise:

| File | Pre-existing Change |
|---|---|
| `package.json` | Already had pre-existing additions: `public:update-manifest`, `training:clean-start`, `training:backfill-prior-day`, `dashboard:site-binding:qa`, `dashboard:prod-update:qa` |
| `src/dashboard/refreshHealthTracker.js` | Pre-existing modification |
| `src/marketdata/alpacaMarketDataAdapter.js` | Pre-existing modification |
| `src/marketdata/runMarketDataQa.js` | Pre-existing modification |
| `src/qa/runFullSimulationQa.js` | Pre-existing modification |
| `src/training/prepMarketOpen.js` | Pre-existing modification |

### Cruise 1 Changes to Pre-existing Files

| File | Change |
|---|---|
| `package.json` | Added `dashboard:data:build` and `dashboard:data:qa` scripts (superimposed on pre-existing changes) |

### Generated Output Paths

| File | Description |
|---|---|
| `Data/dashboard/dashboard-data-bundle-v0.1.json` | Latest dashboard data bundle (always current) |
| `Data/dashboard/dashboard-data-bundle-YYYYMMDD-HHMMSS.json` | Timestamped snapshot of dashboard data bundle |
| `Data/dashboard/latest-dashboard-data-summary.json` | Summary metadata for quick reference |
| `Reports/Dashboard/marketops-dashboard-data-report-v0.1.md` | Human-readable report of generated data |
| `Reports/Dashboard/marketops-dashboard-data-qa-v0.1.md` | QA report (520 checks) |

---

## Sample Data Summary

### Equity Curve

- **label**: "Total Account Value"
- **definition**: "Cash balance plus market value of open positions"
- **paperStartingBalance**: 1000
- **windowDays**: 14
- **cycleId**: cycle-20260514-0220
- **total points**: 129 (spanning 2026-05-14 to 2026-05-20)
- **cashBalance**: 237.31
- **holdingsValue**: 759.13
- **totalAccountValue**: 996.44
- **openPositionCount**: 5
- **validation**: totalAccountValue = cashBalance + holdingsValue ✓

### Current Cycle Activity

- **cycleId**: cycle-20260514-0220
- **startedAt**: 2026-05-14T02:20:20.137Z
- **startingPaperBalance**: 1000
- **currentCashBalance**: 237.31
- **currentHoldingsValue**: 759.13
- **currentTotalAccountValue**: 996.44
- **buys**: 5 (XLE, MSFT, NVDA, META, GOOGL)
- **sells**: 0 (no closed trades in current cycle)
- **openHoldings**: 5 (sellDate: null for all)

### Cycle Decision Board

- **totalDecisions**: 32 signals reviewed
- **bought**: 3 (XLE, MSFT, NVDA — approved and open positions)
- **watched**: 21 (signals below threshold or not acted upon)
- **rejected**: 8 (candidates blocked by Risk Desk — e.g., IWM, AMZN, TSLA, PG, HD, AMD, AVGO, INTC)

---

## Detailed QA Responses

### Is 14-day history fully available?

**No.** The current cycle started 2026-05-14, which is ~6 days ago. The equity curve uses the full cycle window (14 days from today back to ~2026-05-06). However, run history only exists from 2026-05-07 onward for the pre-cycle period. The 14-day window is used as configured but the actual available run data covers ~13 days of actual runs plus the cycle start point.

### Was backfill used?

**No explicit backfill was needed.** Run history has 211 entries from 2026-05-07 to 2026-05-20 covering the relevant window. All points are from actual run history or current state. Points are labeled with source and isBackfilled field (all false). If the 14-day window had extended beyond available data, backfill would have been used and marked.

### How is holdings value calculated?

Holdings value is computed as the sum of `currentValue` from all open positions in `Data/paper/positions/paper-positions-v0.1.json`:

```
holdingsValue = sum(pos.currentValue for pos in positions.openPositions)
```

For the current state: XLE ($252.93) + MSFT ($184.86) + NVDA ($140.02) + META ($104.00) + GOOGL ($77.32) = **$759.13**

### How are purchaseDate and sellDate handled?

- **purchaseDate**: Taken from the position's `entryTime` field (or `openedAt` as fallback). For open holdings, this is the original purchase date.
- **sellDate**: Open holdings have `sellDate: null`. Closed/sold positions (from trades array) have `sellDate` from `exitTime` or `generatedAt`.
- Buys records include `purchaseDate` when known.

### What happens when there are no open positions?

When there are no open positions:
- `holdingsValue` = 0
- `totalAccountValue` = `cashBalance`
- `openHoldings` array is empty
- `currentCycleActivity.canRenderEmpty` = true (safely renderable)
- The equity curve last point note reads "Current: cash only, no open positions"

---

## Source/Config Files That Should Be Committed Later

| File | Reason |
|---|---|
| `Source/marketops-core/src/dashboard/dashboardDataBuilder.js` | Core Cruise 1 deliverable — new dashboard data builder |
| `Source/marketops-core/src/dashboard/runDashboardDataBuild.js` | Runner script |
| `Source/marketops-core/src/dashboard/runDashboardDataQa.js` | QA module |
| `Source/marketops-core/package.json` | Contains new npm scripts (changes superimposed on pre-existing changes) |

The following pre-existing dirty source files were NOT changed by Cruise 1 but were already modified:
- `Source/marketops-core/src/dashboard/refreshHealthTracker.js`
- `Source/marketops-core/src/marketdata/alpacaMarketDataAdapter.js`
- `Source/marketops-core/src/marketdata/runMarketDataQa.js`
- `Source/marketops-core/src/qa/runFullSimulationQa.js`
- `Source/marketops-core/src/training/prepMarketOpen.js`

## Generated Files That Should Probably NOT Be Committed

| File | Reason |
|---|---|
| `Data/dashboard/dashboard-data-bundle-*.json` | Timestamped snapshots — regenerated on each build |
| `Data/dashboard/dashboard-data-bundle-v0.1.json` | Generated output — could be committed as reference or gitignored |
| `Data/dashboard/latest-dashboard-data-summary.json` | Generated summary — regenerated each build |
| `Reports/Dashboard/marketops-dashboard-data-report-v0.1.md` | Generated report — regenerated each build |
| `Reports/Dashboard/marketops-dashboard-data-qa-v0.1.md` | Generated QA report — regenerated each build |

## Files That Should Remain Local or Ignored

| File | Reason |
|---|---|
| `opencode.json` | Local IDE/agent configuration |
| `Data/public/` | Public sync outputs, not source |
| `Reports/ManualCheckpoints/` | Pre-cruise git checkpoints, not source |
| `Data/market-data/backfill-market-data-v0.1.json` | Large generated market data file (718K+ lines) |
| `Data/market-data/rolling/rolling-market-history-v0.1.json` | Very large generated rolling history file (999K+ lines) |
| `Data/dashboard/dashboard-public-safe-*.json` | Many timestamped dashboard snapshots |

---

## npm Scripts Available

| Script | Command | Status |
|---|---|---|
| `dashboard:data:build` | `node src/dashboard/runDashboardDataBuild.js` | **NEW** — Builds dashboard data bundle |
| `dashboard:data:qa` | `node src/dashboard/runDashboardDataQa.js` | **NEW** — 520 QA checks on data |
| `dashboard:refresh` | Pre-existing | PASS |
| `dashboard:preview` | Pre-existing | PASS |
| `dashboard:build` | Pre-existing | PASS |
| `dashboard:qa` | Pre-existing | PASS (154 checks) |
| `dashboard:refresh:qa` | Pre-existing | PASS (110 checks) |
| `dashboard:public-refresh:qa` | Pre-existing | PASS (24 checks) |
| `cycle:qa` | Pre-existing | PASS (15 checks) |
| `qa:full` | Pre-existing | PASS (71 checks) |

## QA Commands and Results

All QA commands ran successfully:

```
npm run dashboard:data:qa     → PASS (520 checks)
npm run dashboard:qa          → PASS (154 checks)
npm run dashboard:refresh:qa  → PASS (110 checks)
npm run dashboard:public-refresh:qa → PASS (24 checks)
npm run cycle:qa              → PASS (15 checks)
npm run qa:full               → PASS (71 checks)
npm run dashboard:data:build  → PASS
npm run dashboard:preview     → PASS
npm run dashboard:refresh     → PASS
```

Key QA validations for Cruise 1:
- totalAccountValue = cashBalance + holdingsValue for ALL 129 equity curve points ✓
- No NaN values ✓
- No Infinity values ✓
- All required fields present ✓
- Paper simulation labels preserved ✓
- Open holdings have sellDate: null ✓
- Closed/sold positions have sellDate ✓
- CurrentCycleActivity can render empty safely ✓
- Decision board has bought/watched/rejected arrays ✓
- plainEnglishReason fields exist ✓
- No missing required fields ✓

---

## Next Recommended Cruise

### Cruise 2: Dashboard Data Binding & Preview

Recommended scope:
- Bind the `dashboard-data-bundle-v0.1.json` data to a public-facing HTML/CSS dashboard page
- Create a dashboard preview page showing equity curve chart, cycle activity table, and decision board
- Build a simple data-bound UI using the three data objects
- Add refresh/reload capability from the existing dashboard refresh pipeline
- Maintain all paper simulation labels and disclaimers in the UI
- Do not push to production; local preview only
