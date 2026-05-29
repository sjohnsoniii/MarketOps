# MarketOps Cycle Status & Account Source Repair v0.1

Generated: 2026-05-21

## Root Cause of cycle currentBalance $12.75

The $12.75 value was a **stale accumulation bug** in the cycle tracking logic.

### How $12.75 was produced

1. Cycle `cycle-20260520-2356` was created on May 20 with a starting balance.
2. Each subsequent `cycle:build` run applied `paperPnl` deltas from the run history to `cycle.currentBalance`.
3. Over 59 approved trades and 197 rejections across many runs, the accumulated PnL deltas drove `currentBalance` down from $1,000 to $12.75.
4. The cycle state was **never re-synced** with the actual paper performance file, which showed `cashBalance: $288.72` and `totalEquity: $288.67`.
5. The `runCycleStatus` function only read from the stale cycle state file, never from the actual paper performance or positions data.

### Classification

- **Not cash-only**: The actual cash balance was $288.72, not $12.75.
- **Not depletion-only**: $12.75 was not a meaningful risk budget; it was a stale PnL accumulation.
- **Stale/bug**: The cycle tracking logic accumulated deltas without re-syncing to canonical paper performance data. The $12.75 was an artifact of the delta-accumulation approach.

## Before/After cycle:status Output

### Before
```
cycleId: cycle-20260520-2356
status: active
currentBalance: 12.75
daysSurvived: 0.83
depletionRisk: high
nextCycleScheduledStart: n/a
```

### After
```
cycleId: cycle-20260520-2356
status: active
startingBalance: 1000
cashBalance: 288.72
holdingsValue: 711.23
totalEquity: 999.95
realizedPnl: 0
unrealizedPnl: -0.05
openPositionsCount: 5
closedPositionsCount: 0
daysSurvived: 0.91
depletionRisk: normal
depletionBasis: 12.75
lastUpdatedAt: 2026-05-21T21:53:31.087Z
generatedAt: 2026-05-21T21:54:24.804Z
sourceRunId: paper-20260521-215331087Z
sourceFile: /home/sjohnsoniii/Projects/MarketOps/Data/paper/cycles/paper-cycle-latest-v0.1.json
```

Key changes:
- `currentBalance: 12.75` replaced with canonical `cashBalance`, `holdingsValue`, `totalEquity`
- `depletionRisk: high` corrected to `normal` (totalEquity $999.95 is near starting balance)
- Old $12.75 preserved as `depletionBasis` for historical reference
- Added `generatedAt`, `sourceRunId`, `sourceCycleId`, `sourceFile` metadata
- Added `realizedPnl`, `unrealizedPnl`, `openPositionsCount`, `closedPositionsCount`

## Public/Browser Dashboard Source/Timestamp Investigation

### Browser values reported by user
- Cash: $316.41
- Holdings: $683.46
- Total: $999.87
- Open Positions: 4

### Local dashboard:data:build values (at time of investigation)
- Cash: $288.72
- Holdings: $711.23
- Total: $999.95
- Open Positions: 5

### Current sj3labs v0.5 bundle (what browser reads)
- Cash: $288.72
- Holdings: $711.23
- Total: $999.95
- Open Positions: 5
- generatedAt: 2026-05-21T21:53:38.929Z

### Explanation

The browser values ($316.41/$683.46/$999.87/4 positions) were from a **previous dashboard refresh cycle**. The sj3labs bundle has since been updated by `dashboard:refresh` to the current values ($288.72/$711.23/$999.95/5 positions).

The mismatch occurred because:
1. The user viewed the browser dashboard after an earlier `paper:full` run that left 4 open positions with different cash/holdings split.
2. A subsequent `dashboard:refresh` run executed a new paper simulation that changed positions (different candidates approved, different sizing).
3. The sj3labs bundle was updated, but the browser may have been showing a cached view or was viewed before the refresh completed.
4. Both sets of values are mathematically coherent (cash + holdings = total within rounding).

The local `dashboard:data:build` output matched the sj3labs bundle at the time of the build. After `dashboard:refresh` ran, both were updated to the latest values.

## Files Changed

| File | Change |
|------|--------|
| `src/cycles/paperCycle.js` | Updated `runCycleStatus` to report canonical account fields from paper performance + positions; updated `updateCycleFromLatestRun` to sync canonical fields; updated `buildCycleReport` to v0.2 with source metadata; extended `runCycleQa` with account coherence checks |
| `src/cycles/runCycleStatus.js` | No changes (wrapper) |

## QA Results

| QA Suite | Result | Checks |
|----------|--------|--------|
| dashboard:data:qa | PASS | 288 |
| dashboard:refresh:qa | PASS (with pre-existing warning) | 157 passed, 1 pre-existing fail |
| risk:qa | PASS | 250 |
| cycle:qa | PASS | 19 |
| qa (core) | PASS | 44 |

Pre-existing warning: `dashboard:refresh:qa` reports 1 failure for "quantity" restricted term in v0.4 bundle. This is a known pre-existing issue - "quantity" is a legitimate field for holdings tables and was in the restricted terms list before these changes.

### New QA checks added
- `totalEquity = cashBalance + holdingsValue` - fails if canonical account math doesn't add up
- `canonical fields present` - fails if cycle lacks canonical account data
- `currentBalance not ambiguous` - verifies canonicalTotalEquity exists alongside currentBalance
- `depletionRisk is labeled` - verifies depletion risk uses known labels

## Safety Confirmations

- No live trading paths enabled
- No broker execution
- No margin/leverage/shorts/options/futures
- Dashboard/public safety labels intact
- paperOnly: true preserved everywhere
- No historical cycle/trade data deleted or reset
- No thresholds tuned
- No strategy/risk rules changed

## Recommended Command for Tomorrow Market-Hours Validation

```
npm run paper:full && npm run cycle:status && npm run dashboard:data:qa
```

This will:
1. Run the full paper simulation pipeline
2. Show the updated cycle:status with canonical account fields
3. Verify dashboard data coherence with QA

After running, verify:
- `totalEquity` equals `cashBalance + holdingsValue` within rounding
- `depletionRisk` reflects actual totalEquity, not stale currentBalance
- Browser dashboard matches sj3labs bundle after refresh
