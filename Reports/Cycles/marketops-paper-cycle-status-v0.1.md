# MarketOps Paper Cycle Status v0.2

Generated: 2026-06-08T18:11:12.814Z
Source runId: paper-20260608-180740794Z
Source cycleId: cycle-20260530-1322
Source file: /home/sjohnsoniii/Projects/MarketOps/Data/paper/cycles/paper-cycle-latest-v0.1.json

## Cycle

- cycleId: cycle-20260530-1322
- status: active
- startingBalance: 1000
- currentBalance (depletion basis): 986.07
- endingBalance: null
- depletionThreshold: 0
- cycleStartTimestamp: 2026-05-30T13:22:04.937Z
- cycleEndTimestamp: null
- hoursSurvived: 220.76
- daysSurvived: 9.2
- approvedTrades: 1134
- rejectedTrades: 5766
- depletionRisk: normal
- resetTriggerReason: null
- nextCycleScheduledStart: null

## Canonical Account (from paper performance + positions)

- cashBalance: 665.53
- holdingsValue: 320.54
- totalEquity: 986.07
- unrealizedPnl: 0.09
- realizedPnl: -14.6
- openPositionsCount: 20
- closedPositionsCount: 99
- totalEquity = cashBalance + holdingsValue: true

## Latest Paper Run Applied

- runId: paper-20260608-180740794Z
- generatedAt: 2026-06-08T18:07:40.794Z
- paperPnl: 320.54
- riskApproved: 18
- riskBlocked: 132

## Rejection Reasons

- Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled.: 115
- Signal did not qualify as a candidate.: 47
- Position already open for XLV.: 1
- Position already open for XHB.: 1
- Position already open for ARKG.: 1
- Position already open for SOXX.: 1
- Position already open for UNH.: 1
- Position already open for ABBV.: 1
- Position already open for CRM.: 1
- Position already open for LLY.: 1
- Position already open for ORCL.: 1
- Position already open for ADBE.: 1
- Position already open for CSCO.: 1
- Position already open for TMO.: 1
- Position already open for BAC.: 1
- Position already open for ABT.: 1
- Position already open for AMGN.: 1
- Position already open for CAT.: 1
- Position already open for GE.: 1
- Position already open for RTX.: 1
- Position already open for BKNG.: 1
- Position already open for VRTX.: 1
- Missing invalidation.: 1

## Lessons So Far

- Cycle 2 fresh start after depletion reset. Auto-reset enabled — no manual gate for routine depletion.

## Proposed Improvements

- Track rejected watchlist moves after refresh to learn whether the confidence threshold is too strict or correctly cautious.
- Keep long/up-only and no-leverage gates until a human approves any broader risk model.

## Human Review Needed

- Review whether 0-approved-trade cycles should tune signal threshold or remain observation-only.

## Rule Confirmation

This cycle does not reset daily. It remains active while currentBalance is above the depletion threshold. A depleted cycle moves to reset_pending and schedules the next cycle for the next market morning after a closeout report.
