# MarketOps Approval Waterfall v0.2

Generated: 2026-05-21T17:43:39.289Z

## Summary

- Signals reviewed: 32
- Candidates: 15
- Approved standard: 9
- Approved learning_probe: 3
- Watched: 0
- Rejected: 20
- Fake trades: 3
- No-trade reason: n/a

## Thresholds

- Standard approval: >= 0.63
- Learning probe: >= 0.57
- Watched: >= 0.5
- Reject below: 0.55
- Learning probe size: 35% of normal

## Waterfall

| Step | Count |
|------|------:|
| Watchlist Movements Reviewed | 32 |
| Enough Data | 32 |
| Trade Candidates Generated | 15 |
| Passed Long Up Direction Gate | 12 |
| Passed Confidence Threshold | 9 |
| Had Invalidation Stop | 9 |
| Passed Risk Rules | 12 |
| Approved Standard | 9 |
| Approved Learning Probe | 3 |
| Approved Fake Paper Trades | 3 |

## Risk Gates

| Gate | Passed | Failed |
|------|-------:|------:|
| long/up-only | 12 | 3 |
| confidence >= 0.63 | 9 | 3 |
| invalidation/stop defined | 9 | 0 |
| risk rules - standard | 9 | 23 |
| risk rules - learning_probe | 3 | 29 |

## Top Blockers

| Reason | Count |
|--------|------:|
| Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | 20 |
| Signal did not qualify as a candidate. | 17 |

## Reporting

- Incomplete trade plans: 0
- Phase 1 rule blocks: 20
- Insufficient history: 0
- Average candidate confidence: 0.3787

## Notes

- Approval waterfall shows the funnel from watchlist review to executed fake paper trades.
- Each step is a gate: items must pass through all previous gates to proceed.
- Learning probe approvals use reduced position size (35% of normal).
- All activity is paper simulation only. No real money, broker, or live trading.
