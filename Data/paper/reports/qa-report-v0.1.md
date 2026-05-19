# MarketOps QA Report v0.1

Mode: paper_simulation

Generated: 2026-05-19T02:17:00.824Z
Result: QA PASS

| Check | Status | Detail |
|---|---|---|
| package script: simulate | PASS | node src/index.js |
| package script: equity | PASS | node src/performance/equityCurve.js |
| package script: qa | PASS | node src/qa/runQa.js |
| package script: paper:run | PASS | node src/paper/runPaper.js |
| package script: paper:history | PASS | node src/paper/writeHistory.js |
| package script: paper:refresh-site | PASS | node src/site/refreshSiteDashboard.js |
| package script: paper:full | PASS | node src/paper/full.js |
| config mode is paper_simulation | PASS | mode=paper_simulation |
| unsafe flag false: allowBrokerConnection | PASS | allowBrokerConnection=false |
| unsafe flag false: allowLiveTrading | PASS | allowLiveTrading=false |
| unsafe flag false: allowSmsAlerts | PASS | allowSmsAlerts=false |
| unsafe flag false: allowSubscriberSignals | PASS | allowSubscriberSignals=false |
| simulation outputs already present (from pipeline) | PASS | pipeline pre-generated outputs, QA skipped re-run |
| output exists: Data/paper/signals/signal-scan-v0.1.json | PASS | /home/sjohnsoniii/Projects/MarketOps/Data/paper/signals/signal-scan-v0.1.json |
| output exists: Data/paper/risk/risk-decisions-v0.1.json | PASS | /home/sjohnsoniii/Projects/MarketOps/Data/paper/risk/risk-decisions-v0.1.json |
| output exists: Data/paper/trades/paper-trades-v0.1.json | PASS | /home/sjohnsoniii/Projects/MarketOps/Data/paper/trades/paper-trades-v0.1.json |
| output exists: Data/paper/equity/equity-curve-v0.1.json | PASS | /home/sjohnsoniii/Projects/MarketOps/Data/paper/equity/equity-curve-v0.1.json |
| output exists: Data/paper/dashboard/dashboard-bundle-v0.1.json | PASS | /home/sjohnsoniii/Projects/MarketOps/Data/paper/dashboard/dashboard-bundle-v0.1.json |
| output exists: Data/paper/reports/signal-scan-v0.1.md | PASS | /home/sjohnsoniii/Projects/MarketOps/Data/paper/reports/signal-scan-v0.1.md |
| output exists: Data/paper/reports/risk-desk-v0.1.md | PASS | /home/sjohnsoniii/Projects/MarketOps/Data/paper/reports/risk-desk-v0.1.md |
| output exists: Data/paper/reports/paper-trades-v0.1.md | PASS | /home/sjohnsoniii/Projects/MarketOps/Data/paper/reports/paper-trades-v0.1.md |
| output exists: Data/paper/reports/equity-curve-v0.1.md | PASS | /home/sjohnsoniii/Projects/MarketOps/Data/paper/reports/equity-curve-v0.1.md |
| output exists: Data/paper/reports/performance-summary-v0.1.md | PASS | /home/sjohnsoniii/Projects/MarketOps/Data/paper/reports/performance-summary-v0.1.md |
| output exists: Data/paper/reports/staff-writer-brief-v0.1.md | PASS | /home/sjohnsoniii/Projects/MarketOps/Data/paper/reports/staff-writer-brief-v0.1.md |
| paper trades are paper-only | PASS | 0 trades checked |
| trades timestamp is not stale sample default | PASS | generatedAt=2026-05-19T02:16:58.589Z |
| max drawdown is finite | PASS | maxDrawdown=58.42 |
| open position count present | PASS | count=3 |
| cash balance present | PASS | cash=4218.75 |
| total equity present | PASS | equity=4192.26 |
| open position count matches trades | PASS | trades_with_open_status=0 positions=3 |
| no sample-only language in real-data simulation | PASS | sampleDataOnly=undefined |
| automation output exists: Data/paper/history/run-history.json | PASS | /home/sjohnsoniii/Projects/MarketOps/Data/paper/history/run-history.json |
| automation output exists: Data/paper/history/latest-run-summary.json | PASS | /home/sjohnsoniii/Projects/MarketOps/Data/paper/history/latest-run-summary.json |
| automation output exists: ../sj3labs/data/marketops/dashboard-bundle-public-v0.4.json | PASS | /home/sjohnsoniii/Projects/sj3labs/data/marketops/dashboard-bundle-public-v0.4.json |
| v0.4 dashboard paperOnly true | PASS | paperOnly=true |
| v0.4 dashboard sampleData true | PASS | sampleData=true |
| v0.4 dashboard raw IDs absent | PASS | no raw IDs found |
| latest history summary public-safe fields | PASS | required fields present |
| latest history mode is paper_simulation | PASS | mode=paper_simulation |
| latest history paperOnly true | PASS | paperOnly=true |
| unsafe live integration terms absent | PASS | no obvious unsafe terms found |
| public output unsafe terms absent | PASS | public files are clean |

## Safety Notes

- Paper simulation only.
- Sample data only.
- No broker connection.
- Not live trading.
- No real-money trading.
- No SMS or subscriber alerts.
- No margin, leverage, options, futures, shorting, or exchange execution.
