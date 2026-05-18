# MarketOps Confidence Calibration v0.1

Generated: 2026-05-18T02:25:34.220Z
Confidence threshold: 0.55
Direction gate: up (>= 0.25%)

## Summary

- Symbols calibrated: 5
- Approvable: 0
- Close to candidate: 0
- Confidence readiness: review_needed

## Per Symbol

| Symbol | Bars | Freshness | Confidence | Direction | Trend | Momentum | Vol Penalty | Close To Candidate | Approvable | Would Need |
|--------|------|-----------|------------|-----------|-------|----------|-------------|--------------------|------------|------------|
| AAPL | 2028 | stale | 0 | none | 0 | 0 | 0 | false | false | fresh data |
| MSFT | 1977 | stale | 0 | none | 0 | 0 | 0 | false | false | fresh data |
| NVDA | 2050 | stale | 0 | none | 0 | 0 | 0 | false | false | fresh data |
| QQQ | 2054 | stale | 0 | none | 0 | 0 | 0 | false | false | fresh data |
| SPY | 2029 | stale | 0 | none | 0 | 0 | 0 | false | false | fresh data |

## Notes

- Calibrated confidence is computed from rolling-history bars (trend, momentum, volatility).
- Bar count < 10 or stale data yields calibrated confidence 0.
- Volatility penalty reduces calibrated confidence for high-variance symbols.
- "Approvable" (calibrated) and risk-desk "approved" (signal scanner) are independent axes.
- Signal scanner confidence may exceed 0.55 even when calibrated confidence is 0 (different data sources, different formulas).
- Does not lower thresholds. Only reports current state.
