# MarketOps Stabilization & Automation Checkpoint v0.1

Generated: 2026-05-20T14:52:01.860Z
Paper Simulation Only: true
No Live Trading: true

## Pipeline Summary

| Metric | Value |
|--------|-------|
| Total Steps | 27 |
| Passed | 24 |
| Failed | 3 |
| Status | ISSUES DETECTED |

## Pipeline Phases

| Step | Status |
|------|--------|
| marketdata:refresh | PASS  |
| marketdata:backfill | PASS  |
| marketdata:rolling | PASS  |
| marketdata:weather | PASS  |
| intraday:simulate | PASS  |
| confidence:calibrate | PASS  |
| risk:explain | PASS  |
| cycle:build | PASS  |
| approvals:generate | PASS  |
| marketdata:qa | PASS  |
| cycle:qa | PASS  |
| dashboard:build | PASS  |
| dashboard:refresh | FAIL - Command failed: npm run dashboard:refresh
[health] Last successful refresh was 1 |
| dashboard:data:build | PASS  |
| dashboard:data:qa | PASS  |
| risk:learning | PASS  |
| risk:learning:qa | PASS  |
| review:import | PASS  |
| review:qa | PASS  |
| dashboard:qa | PASS  |
| dashboard:refresh:qa | FAIL - Command failed: npm run dashboard:refresh:qa |
| dashboard:public-refresh:qa | PASS  |
| public:trial-status | PASS  |
| public:update-manifest | PASS  |
| qa:full | PASS  |
| automation:check | FAIL - Command failed: npm run automation:check |
| scheduler:check | PASS  |

## Profit Objective: Account Growth

| Metric | Value |
|--------|-------|
| Cycle | cycle-20260514-0220 (active) |
| Starting Value | $1000 |
| Current Total Value | $994.89 |
| Cash Balance | $237.31 |
| Holdings Value | $757.58 |
| Total P/L | $-767.81 |
| Return % | -76.78% |
| Max Drawdown % | 76.81% |
| Cash + Holdings = Total | YES |
| Benchmark | Not available. No benchmark index tracked in this cycle. |

## Profit Objective: Trade Profitability

| Metric | Value |
|--------|-------|
| Entries | 5 |
| Exits | 0 |
| Open Positions | 5 |
| Closed Positions | 0 |
| Profitable Open | 2 |
| Losing Open | 3 |
| Open Unrealized P/L | $-5.12 |
| Win Rate | N/A (no closed trades) |
| Avg Realized Gain | N/A (no closed trades) |

## Profit Objective: Exit Logic Visibility

| Check | Status |
|-------|--------|
| Exit logic exists | NO |
| Profit-taking rules exist | NO |
| Stop-loss/risk exit rules exist | NO |
| Stale position detection | NO |
| Holdings persist across cycles | YES |
| purchaseDate preserved | YES |
| sellDate preserved | YES |

## Profit Objective: Learning Quality

| Metric | Value |
|--------|-------|
| Approved Trades Tracked | 10 |
| Rejected Trades Tracked | 22 |
| Watched Signals Tracked | 26 |
| Good Approvals | 2 |
| Bad Approvals | 0 |
| Good Rejections | 15 |
| Bad Rejections | 1 |
| Recommendations Generated | 2 |
| Proposals in Review Queue | 4 |
| Proposals Routed to Queue | 2 |

## Safety Confirmation

- No live trading: true
- No broker execution: true
- No email/SMS/social: true
- No secrets read: true
- No auto-apply: true
- No public data exposure of private paths: verified
- Paper simulation labels preserved: true
