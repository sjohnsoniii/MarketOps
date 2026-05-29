# MarketOps Paper Cycle Status v0.2

Generated: 2026-05-28T19:51:54.784Z
Source runId: paper-20260528-195105653Z
Source cycleId: cycle-20260520-2356
Source file: /home/sjohnsoniii/Projects/MarketOps/Data/paper/cycles/paper-cycle-latest-v0.1.json

## Cycle

- cycleId: cycle-20260520-2356
- status: reset_pending
- startingBalance: 1000
- currentBalance (depletion basis): -17.84
- endingBalance: -17.84
- depletionThreshold: 0
- cycleStartTimestamp: 2026-05-20T23:56:14.139Z
- cycleEndTimestamp: 2026-05-26T14:04:10.263Z
- hoursSurvived: 134.13
- daysSurvived: 5.59
- approvedTrades: 62
- rejectedTrades: 836
- depletionRisk: depleted
- resetTriggerReason: Balance -17.84 is at or below depletion threshold 0.
- nextCycleScheduledStart: 2026-05-27T13:30:00.000Z

## Canonical Account (from paper performance + positions)

- cashBalance: 22.33
- holdingsValue: 985.02
- totalEquity: 1007.35
- unrealizedPnl: 7.36
- realizedPnl: 0
- openPositionsCount: 17
- closedPositionsCount: 0
- totalEquity = cashBalance + holdingsValue: true

## Latest Paper Run Applied

- runId: paper-20260528-195105653Z
- generatedAt: 2026-05-28T19:51:05.653Z
- paperPnl: 0
- riskApproved: 0
- riskBlocked: 150

## Rejection Reasons

- Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled.: 140
- Signal did not qualify as a candidate.: 131
- Missing invalidation.: 2
- Position already open for AMD.: 2
- Position already open for XLV.: 1
- Position already open for XLE.: 1
- Position already open for AAPL.: 1
- Position already open for MSFT.: 1
- Position already open for NVDA.: 1
- Position already open for ORCL.: 1
- Position already open for TXN.: 1
- Position already open for QCOM.: 1
- Position already open for NOW.: 1
- Position already open for ADI.: 1
- Position already open for PANW.: 1
- Position already open for F.: 1
- Position already open for LCID.: 1

## Lessons So Far

- Clean paper start: new cycle at $1,000 with no legacy positions.
- No daily reset while capital stays above the depletion threshold.

## Proposed Improvements

- Track rejected watchlist moves after refresh to learn whether the confidence threshold is too strict or correctly cautious.
- Keep long/up-only and no-leverage gates until a human approves any broader risk model.

## Human Review Needed

- Cycle depleted. Review closeout and approve next-cycle parameter changes before restart.

## Rule Confirmation

This cycle does not reset daily. It remains active while currentBalance is above the depletion threshold. A depleted cycle moves to reset_pending and schedules the next cycle for the next market morning after a closeout report.
