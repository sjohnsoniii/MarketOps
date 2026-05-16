# MarketOps Paper Cycle Status v0.1

Generated: 2026-05-15T15:56:30.444Z

## Cycle

- cycleId: cycle-20260514-0220
- status: active
- startingBalance: 1000
- currentBalance: 1000
- endingBalance: null
- depletionThreshold: 0
- cycleStartTimestamp: 2026-05-14T02:20:20.137Z
- cycleEndTimestamp: null
- hoursSurvived: 37.6
- daysSurvived: 1.57
- approvedTrades: 0
- rejectedTrades: 80
- depletionRisk: normal
- resetTriggerReason: null
- nextCycleScheduledStart: null

## Latest Paper Run Applied

- runId: paper-20260515-155630434Z
- generatedAt: 2026-05-15T15:56:30.434Z
- paperPnl: 0
- riskApproved: 0
- riskBlocked: 8

## Rejection Reasons

- Signal did not qualify as a candidate.: 8
- Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled.: 8
- Confidence threshold is below minimum threshold.: 5
- Confidence 0 is below minimum threshold.: 3
- Missing invalidation.: 3

## Lessons So Far

- A cycle should continue while capital remains above the depletion threshold.
- No daily reset is allowed for a surviving cycle.

## Proposed Improvements

- Track rejected watchlist moves after refresh to learn whether the confidence threshold is too strict or correctly cautious.
- Keep long/up-only and no-leverage gates until a human approves any broader risk model.

## Human Review Needed

- Review whether 0-approved-trade cycles should tune signal threshold or remain observation-only.

## Rule Confirmation

This cycle does not reset daily. It remains active while currentBalance is above the depletion threshold. A depleted cycle moves to reset_pending and schedules the next cycle for the next market morning after a closeout report.
