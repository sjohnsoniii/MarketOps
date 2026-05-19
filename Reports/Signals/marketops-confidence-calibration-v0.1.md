# MarketOps Confidence Calibration v0.1

Generated: 2026-05-19T02:17:00.799Z
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
| AAPL | 2434 | fresh | 0.1757 | flat | -0.0403 | -0.0114 | 0.0284 | false | false | upward trend, confidence >= 0.55, clear invalidation/stop |
| MSFT | 2377 | fresh | 0.1915 | flat | 0.1111 | 0.1384 | 0.0265 | false | false | upward trend, confidence >= 0.55, clear invalidation/stop |
| NVDA | 2446 | fresh | 0.1911 | flat | 0.1554 | 0.0482 | 0.0269 | false | false | upward trend, confidence >= 0.55, clear invalidation/stop |
| QQQ | 2451 | fresh | 0.1864 | flat | -0.0269 | 0.0095 | 0.0168 | false | false | upward trend, confidence >= 0.55, clear invalidation/stop |
| SPY | 2435 | fresh | 0.1923 | flat | 0.0549 | -0.0191 | 0.0132 | false | false | upward trend, confidence >= 0.55, clear invalidation/stop |

## Notes

- Calibrated confidence is computed from rolling-history bars (trend, momentum, volatility).
- Bar count < 10 or stale data yields calibrated confidence 0.
- Volatility penalty reduces calibrated confidence for high-variance symbols.
- "Approvable" (calibrated) and risk-desk "approved" (signal scanner) are independent axes.
- Signal scanner confidence may exceed 0.55 even when calibrated confidence is 0 (different data sources, different formulas).
- Does not lower thresholds. Only reports current state.
