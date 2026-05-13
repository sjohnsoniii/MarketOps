# MarketOps Full QA v0.1

Generated: 2026-05-09T01:58:10.137Z

## Verdict

PASS

## Commands

- PASS: npm run admin:qa (exit 0)
- PASS: npm run marketdata:qa (exit 0)
- PASS: npm run dashboard:qa (exit 0)
- PASS: npm run office:qa (exit 0)
- PASS: npm run agents:qa (exit 0)
- PASS: npm run automation:check (exit 0)

## Safety Checks

- PASS: public bundle paperOnly true - true
- PASS: public bundle liveTradingEnabled false - false
- PASS: public bundle publishAllowed not true - undefined
- PASS: public bundle dataSource alpaca_iex - alpaca_iex
- PASS: movement field present: lastRefreshAt - lastRefreshAt
- PASS: movement field present: nextExpectedRefreshAt - nextExpectedRefreshAt
- PASS: movement field present: refreshCadenceMinutes - refreshCadenceMinutes
- PASS: movement field present: watchlistQuoteSnapshot - watchlistQuoteSnapshot
- PASS: movement field present: symbolMovementPreview - symbolMovementPreview
- PASS: movement field present: topWatchlistMovers - topWatchlistMovers
- PASS: movement field present: marketActivityHeartbeat - marketActivityHeartbeat
- PASS: movement field present: riskDeskSummary - riskDeskSummary
- PASS: movement field present: noTradeReason - noTradeReason
- PASS: public bundle has no secret markers

## Confirmations

- Full QA does not commit, push, deploy, post, email, send SMS, place orders, or connect broker execution.
- Paper-only and review-gated checks are enforced through the component QA commands plus public bundle safety checks.
