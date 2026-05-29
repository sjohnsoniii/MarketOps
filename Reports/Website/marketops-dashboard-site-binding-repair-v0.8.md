# MarketOps Dashboard Site-Binding Repair v0.8

**Generated:** 2026-05-19T16:10:00Z  
**Status:** COMPLETE  
**Mode:** paper_simulation  
**Scope:** sj3labs public dashboard HTML + site-binding QA

---

## Problem

The public MarketOps dashboard at `~/Projects/sj3labs/marketops/dashboard/index.html` was rendering hardcoded sample data (NVDA/SOL trades, $10k balance, 8 vehicles, 5-vehicle activity) from a `fallbackDashboard` object instead of live data from `dashboard-bundle-public-v0.4.json`. Vercel was deploying but dashboard sections were not updating.

## Root Cause Analysis

Five distinct issues were identified:

| Section | Problem | Root Cause |
|---------|---------|------------|
| Risk & Pipeline (4 metric cards) | Always showed 8/8/2/6 | **Hardcoded HTML** — static `<div>`s never connected to bundle data |
| Recent Paper Trades (table) | Always showed NVDA/SOL trades | **Hardcoded HTML table rows** — static `<tr>`s never updated |
| Vehicle Activity (chart) | Always showed 5 vehicles (SPY/QQQ/BTC/ETH/NVDA) | **Hardcoded JS array** — static sample data never connected to bundle |
| Performance Charts (equity/pnl/drawdown) | Showed old $10k sample data or nothing | **fallbackDashboard** had $10k defaults; bundle has empty `equityPoints`/`pnlPoints`/`drawdownPoints` arrays (no trades yet) |
| Data freshness | Vercel cached old bundle | **No cache-busting** — fetch URLs lacked timestamp params |

## Changes Made

### Part 1: `index.html` (dashboard rendering)

**File:** `~/Projects/sj3labs/marketops/dashboard/index.html`

1. **Risk section** — Replaced hardcoded 8/8/2/6 with dynamic `renderRiskMetrics()` that reads `dashboard.vehiclesScanned`, `dashboard.signalsReviewed`, `dashboard.riskApproved`, `dashboard.riskBlocked` from the live bundle.

2. **Trades section** — Replaced hardcoded NVDA/SOL rows with `<tbody id="trades-tbody">` populated by `renderRecentTrades()`. Shows "No paper trades executed yet" message with `noTradeReason` from bundle when empty.

3. **Vehicle Activity** — Replaced hardcoded 5-vehicle sample array with `renderVehicleActivityFromBundle()` that reads `dashboard.rollingMarketMovement` (32 vehicles with real `changePct`/`direction`), renders a sorted color-coded bar chart showing actual market movement distribution.

4. **Performance Charts** — `renderLine()` and `renderBars()` now check for empty arrays and call `renderNoData()` with appropriate messages. All 6 chart cards show "No trades yet" states with `updateLastRefreshed()` timestamps.

5. **fallbackDashboard** — Updated defaults from $10k sample data to $1k clean-start defaults, 32-vehicle universe, empty trade arrays, and proper fallback structure matching current bundle format.

6. **Cache-busting** — Added `?v=' + Date.now()` to all fetch URLs in `loadDashboardBundle()` and `loadTrialStatus()` (in addition to existing `{ cache: 'no-store' }`).

7. **New rendering functions added:**
   - `renderRiskMetrics()` — reads risk desk summary
   - `renderRecentTrades()` — renders or shows empty state
   - `renderVehicleActivityFromBundle()` — bar chart from real vehicle movement
   - `renderNoData()` — reusable empty state renderer
   - `getVehicleMovementFromBundle()` — extracts vehicle data from rollingMarketMovement
   - `updateLastRefreshed()` — adds timestamps to chart meta

### Part 2: `runSiteBindingQa.js` (new QA script)

**File:** `~/Projects/MarketOps/Source/marketops-core/src/dashboard/runSiteBindingQa.js`

New script that validates the dashboard site-binding pipeline:

- **HTML structure** — verifies script block, fetch URLs, cache-busting, all rendering functions
- **Data file existence** — checks bundle v0.4, v0.3, safe v0.1, trial status in sj3labs/data/marketops/
- **Bundle content** — validates 16 fields including structure, paper-only flag, risk desk, vehicle counts, signal funnel, milestones, chart data sources
- **Trial status** — validates JSON, mode, failure status, equity, fresh bars
- **Path consistency** — verifies HTML relative paths resolve to correct sj3labs data directory

### Part 3: `package.json` (new script entry)

Added script: `"dashboard:site-binding:qa"` → `"node src/dashboard/runSiteBindingQa.js"`

## Files Changed

| File | Change | Type |
|------|--------|------|
| `~/Projects/sj3labs/marketops/dashboard/index.html` | Rewrote rendering JS, removed hardcoded values, added 5 new rendering functions | Production fix |
| `~/Projects/MarketOps/Source/marketops-core/src/dashboard/runSiteBindingQa.js` | New file — 44 checks covering HTML, data files, bundle content, trial status, paths | QA |
| `~/Projects/MarketOps/Source/marketops-core/package.json` | Added `dashboard:site-binding:qa` script entry | Config |

## No Changes Needed

- **Bundle generator** (`publicDashboardBundle.js`) — already generates all required fields: `rollingMarketMovement`, `riskDeskSummary`, `publicSafeVehicleContribution`, `signalFunnel`, `milestoneTargets`, `riskDecisionMix`, `tradeOutcomeMix`, `generatedAt`
- **Scheduler** (`run-marketops-refresh.sh`) — already publishes all files under allowlist `data/marketops/*.json`
- **Sync script** — unchanged

## Validation Results

**`npm run dashboard:site-binding:qa`:** 44/44 PASS

| Check Group | Count | Result |
|-------------|-------|--------|
| HTML structure & content | 15 | 15 PASS |
| Data file existence | 5 | 5 PASS |
| Bundle content validation | 17 | 17 PASS |
| Trial status validation | 6 | 6 PASS |
| Path consistency | 1 | 1 PASS |

## Outstanding Limitations

- **Performance Charts** (equity curve, P/L bars, cumulative P/L, drawdown) will remain empty until the paper engine executes at least one trade. This is correct behavior — the bundle's `equityPoints`, `pnlPoints`, `cumulativePnlPoints`, and `drawdownPoints` are all empty because `fakePaperTradeCount` is 0.
- **Trade Outcome Mix** chart will remain empty until trades exist — correctly shows "No paper trades executed yet."
- **Vehicle Contribution** bar chart currently shows market change % (not paper P/L), since `fakePaperPnl: 0` for all vehicles. This is labeled and expected.
- `dashboard-public-safe-v0.1.json` also lacks equity/pnl/drawdown arrays — same as v0.4 bundle.

## Next Steps

- When the first paper trades execute, the equity chart, P/L bars, cumulative P/L, drawdown chart, and trade outcome mix will automatically render.
- After deploy, verify Vercel picks up the new HTML and cache-busted JSON fetches.
- Consider running `npm run dashboard:site-binding:qa` in the scheduler pipeline after each refresh to catch regressions.

---

*Report auto-generated by v0.8 dashboard site-binding repair. All 44 validation checks pass.*
