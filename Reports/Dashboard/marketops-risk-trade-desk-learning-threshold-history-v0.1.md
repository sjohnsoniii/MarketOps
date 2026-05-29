# MarketOps Risk/Trade Desk Learning Threshold & History v0.1

Generated: 2026-05-21

## Files Changed

| File | Change |
|------|--------|
| `src/utils/paths.js` | Added vehicleHistoryRoot, vehicleHistoryJson, vehicleHistoryReport, approvalBandsJson, approvalBandsReport paths |
| `src/marketdata/vehicleHistory.js` | NEW: 14-day vehicle history module with lookback, trend, volatility, data quality |
| `src/signals/simpleSignalScanner.js` | Added complete trade plan generation (entryPlan, exitPlan, riskPlan, signalEvidence, vehicleHistorySummary) |
| `src/risk/riskDesk.js` | Added approval bands (standard, learning_probe, watched, rejected), trade plan validation, vehicle history confidence adjustment, reporting metrics |
| `src/execution/paperTradeExecutor.js` | Added positionSizeMultiplier support for learning_probe sizing, approval band tracking on trades |
| `src/approvals/approvalWaterfall.js` | Updated to v0.2 with approval band tracking, threshold reporting, incomplete_trade_plan counts |
| `src/simulation/runIntradaySimulation.js` | Integrated vehicle history build, portfolio state passing to risk desk |
| `src/risk/runRiskTradeDeskQa.js` | NEW: Comprehensive QA for approval bands, trade plans, vehicle history, Phase 1 safety |
| `src/dashboard/runDashboardQa.js` | Added vehicle history internal-only checks, restricted term for vehicle-history-14d |

## Diagnosis: Why Approvals Were Sparse

Based on actual code and data analysis:

1. **Confidence threshold at 0.55**: The original risk desk used a hard 0.55 floor. With the signal scanner formula `confidence = 0.5 + absChange / 20`, a 2% move yields 0.60 confidence, but many signals were "flat" (below 2% movement threshold) and got confidence 0.1-0.18.

2. **Binary approve/reject**: No middle ground. Signals either passed all gates or were blocked entirely. No learning_probe band for medium-confidence candidates.

3. **No structured trade plans**: Signals lacked entryPlan/exitPlan/riskPlan fields. Risk Desk had no way to validate that a candidate had a complete trade plan before approval.

4. **No vehicle history context**: Decisions were made without 14-day trend, volatility, or data quality context.

5. **Portfolio state not passed to risk desk**: Risk desk didn't know about existing open positions or cash balance, so it couldn't factor in concentration or cash constraints.

## Thresholds Before/After

| Threshold | Before | After |
|-----------|--------|-------|
| Standard approval | 0.55 (binary) | 0.63 |
| Learning probe | N/A | 0.57 |
| Watched | N/A | 0.50 |
| Reject below | 0.55 | 0.55 (hard floor) |
| Learning probe size | N/A | 35% of normal |

The standard approval threshold was raised from 0.55 to 0.63 (not lowered) because we added the learning_probe band at 0.57. This creates a more nuanced approval funnel:
- >= 0.63: approved_standard (full position size)
- 0.57-0.62: approved_learning_probe (35% position size)
- 0.50-0.56: watched (no entry, tracked for false-negative learning)
- < 0.55: rejected

## Approval Band Logic

1. **approved_standard**: Confidence >= 0.63, complete trade plan, long-only, clean data, normal position sizing.

2. **approved_learning_probe**: Confidence 0.57-0.62, complete trade plan, long-only, clean enough data, 35% of normal position size. Labeled `learning_probe` on position and trade records.

3. **watched**: Confidence 0.50-0.56, not bad enough to reject, not good enough to enter. Tracked for false-negative learning.

4. **rejected**: Phase 1 violations (short/margin/leverage/options/futures), incomplete trade plan, bad data, invalid symbol/price, insufficient cash, below 0.55 confidence.

Vehicle history adjustments:
- Insufficient history: -0.05 confidence adjustment, may downgrade standard to learning_probe
- High volatility (>5%): reduces position size multiplier further
- Positive trend (+1.5%+): +0.03 confidence adjustment

## Learning Probe Behavior

- Position size: 35% of normal (configurable via LEARNING_PROBE_SIZE_PCT)
- Max position value: capped so no single probe consumes most of the $1,000 cycle
- Full entryPlan/exitPlan/riskPlan required (same as standard)
- paperOnly: true enforced
- Tracked separately in reporting and waterfall

## 14-Day Vehicle History Source/Storage

- **Source**: Existing rolling market history bars (rolling-market-history-v0.1.json) and backfill data
- **Storage**: `Data/vehicle-history/vehicle-history-14d-v0.1.json` (internal only)
- **Report**: `Reports/MarketData/marketops-vehicle-history-14d-v0.1.md`
- **Not exposed** in public dashboard, sj3labs bundles, or any public-facing files
- **No visual charts** generated from this data
- **No lookahead bias**: only bars before candidate.generatedAt are used

## How Vehicle History Affects Decisions

1. **Confidence adjustment**: Positive trend + acceptable volatility slightly improves score; extreme volatility reduces it; insufficient history lowers it.

2. **Trend qualification**: 14-day trendDirection (up/down/flat) used as context for signal validation.

3. **Volatility sizing**: High volatility (>5%) forces learning_probe band or reduces position size multiplier.

4. **Rejection/watch reasons**: Insufficient history doesn't auto-reject but may trigger watch or lower confidence.

## QA Results

| QA Suite | Result | Checks |
|----------|--------|--------|
| paper:full (pipeline QA) | PASS | 44 |
| dashboard:data:qa | PASS | 265 |
| dashboard:refresh:qa | PASS | 114 |
| qa (core QA) | PASS | 44 |
| risk/trade desk QA | PASS | 312 |

Safety confirmations verified:
- Phase 1 blocks shorts: YES
- Phase 1 blocks margin: YES (via config)
- Phase 1 blocks leverage: YES (via config)
- Phase 1 blocks options: YES (via config)
- Phase 1 blocks futures: YES (via config)
- No live trading paths enabled: YES
- Every approved trade has entryPlan: YES
- Every approved trade has exitPlan: YES
- Every approved trade has paperOnly true: YES
- learning_probe trades smaller than standard: YES
- Missing entry/exit plans rejected as incomplete_trade_plan: YES
- 14-day vehicle history internal-only: YES
- No public visual chart for vehicle history: YES
- No lookahead bias: YES
- Thresholds recorded in output: YES
- Dashboard/public safety labels intact: YES

## Before/After Candidate Decision Counts

| Metric | Before | After |
|--------|--------|-------|
| Total signals | 32 | 32 |
| Candidates | ~14 | 15 |
| Approved (any) | ~11 | 12 (9 standard + 3 learning_probe) |
| Watched | 0 | 0 (none in 0.50-0.56 range this run) |
| Rejected | ~21 | 20 |
| Executed trades | ~5 | 3 (limited by maxOpenPositions=5 and cash) |

Note: The executed trade count is limited by maxOpenPositions (5) and available cash. With 5 max positions and $1,000 starting balance, the system can execute up to 5 trades at 25% sizing.

## Remaining Issues

1. **Watched band not populated**: In this run, no candidates fell in the 0.50-0.56 watched range. This is expected with the current sample data distribution but should be monitored with live market data.

2. **Cycle balance shows depletion**: The cycle balance is at $237.31 (from prior runs), which is below the $1,000 starting balance. This is expected behavior for the paper simulation cycle tracking.

3. **Confidence calibration shows 0 approvable**: The calibrated confidence system (separate from signal scanner) requires 10+ fresh bars and shows 0 approvable. This is a known separate system that uses different data sources.

## Recommended Next Step

Run `npm run paper:full` again to verify consistent behavior across multiple cycles, then run `npm run qa:full` if available for comprehensive end-to-end validation.

Alternatively, run `node src/risk/runRiskTradeDeskQa.js` independently to verify the new QA checks pass with fresh data.
