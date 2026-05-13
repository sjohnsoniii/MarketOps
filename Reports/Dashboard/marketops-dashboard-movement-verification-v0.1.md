# MarketOps Dashboard Movement Verification v0.1

Generated: 2026-05-08T21:47:28.9525114-04:00

## Verdict

PASS

## Checks
- PASS: generatedAt changed - 2026-05-09T01:47:07.461Z -> 2026-05-09T01:47:25.602Z
- PASS: lastRefreshAt changed - 2026-05-09T01:47:07.461Z -> 2026-05-09T01:47:25.602Z
- PASS: movement fields present - movers=5, symbols=5
- PASS: zero-trade dashboard still explains movement - fakePaperTradeCount=0, noTradeReason=Risk Desk did not approve any candidate for fake paper execution in this refresh.
- PASS: paper-only flags safe - paperOnly=True, liveTradingEnabled=False

## Confirmation

This script runs local paper refreshes only. It does not commit, push, deploy, post, email, send SMS, place orders, or enable live trading.
