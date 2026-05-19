# MarketOps Full Simulation QA v0.1

Generated: 2026-05-19T01:43:08.409Z

## Verdict

PASS

## Summary

- Checks passed: 71
- Checks failed: 0
- Total checks: 71

## Checks

- PASS: npm script: marketdata:refresh - node src/marketdata/alpacaMarketDataAdapter.js
- PASS: npm script: marketdata:backfill - node src/marketdata/backfillMarketData.js
- PASS: npm script: marketdata:rolling - node src/marketdata/rollingHistoryStore.js
- PASS: npm script: marketdata:weather - node src/marketdata/marketWeatherStation.js
- PASS: npm script: intraday:simulate - node src/simulation/runIntradaySimulation.js
- PASS: npm script: confidence:calibrate - node src/signals/confidenceCalibration.js
- PASS: npm script: risk:explain - node src/risk/runTradeRejectionExplainability.js
- PASS: npm script: approvals:waterfall - node src/approvals/approvalWaterfall.js
- PASS: npm script: cycle:build - node src/cycles/runCycleBuild.js
- PASS: npm script: cycle:qa - node src/cycles/runCycleQa.js
- PASS: npm script: dashboard:build - node src/dashboard/runDashboardBuild.js
- PASS: npm script: dashboard:refresh - node src/dashboard/runDashboardRefresh.js
- PASS: npm script: dashboard:qa - node src/dashboard/runDashboardQa.js
- PASS: npm script: marketops:refresh - node src/simulation/runMarketOpsRefresh.js
- PASS: npm script: scheduler:check - node src/automation/runSchedulerCheck.js
- PASS: npm script: qa:full - node src/qa/runFullSimulationQa.js
- PASS: config exists - /home/sjohnsoniii/Projects/MarketOps/Source/marketops-core/config/marketops.phase1.config.json
- PASS: config mode paper_simulation - paper_simulation
- PASS: safety broker disabled - false
- PASS: safety live trading disabled - false
- PASS: day-trading config enabled - true
- PASS: long-only true - true
- PASS: margin disabled - false
- PASS: leverage disabled - false
- PASS: shorting disabled - false
- PASS: cash account only - true
- PASS: file: alpaca market data latest - Data/market-data/alpaca/alpaca-market-data-latest-v0.1.json
- PASS: file: alpaca market bars latest - Data/market-data/alpaca/alpaca-market-bars-latest-v0.1.json
- PASS: file: alpaca market data report - Reports/MarketData/marketops-alpaca-market-data-v0.1.md
- PASS: file: signals JSON - Data/paper/signals/signal-scan-v0.1.json
- PASS: file: risk JSON - Data/paper/risk/risk-decisions-v0.1.json
- PASS: file: trades JSON - Data/paper/trades/paper-trades-v0.1.json
- PASS: file: rolling history JSON - Data/market-data/rolling/rolling-market-history-v0.1.json
- PASS: file: weather station JSON - Data/market-data/market-weather-station-v0.1.json
- PASS: file: confidence JSON - Data/paper/signals/confidence-calibration-v0.1.json
- PASS: file: paper positions JSON - Data/paper/positions/paper-positions-v0.1.json
- PASS: file: paper performance JSON - Data/paper/performance/paper-performance-v0.1.json
- PASS: file: dashboard JSON - Data/paper/dashboard/dashboard-bundle-v0.1.json
- PASS: file: credentials manifest - Reports/Setup/marketops-required-credentials-and-systems-v0.1.md
- PASS: file: scheduler run script - Scripts/scheduler/run-marketops-refresh.sh
- PASS: file: scheduler install script - Scripts/scheduler/install-marketops-refresh.sh
- PASS: file: scheduler uninstall script - Scripts/scheduler/uninstall-marketops-refresh.sh
- PASS: file: scheduler check script - Scripts/scheduler/check-marketops-refresh.sh
- PASS: file: scheduler README - Scripts/scheduler/README.md
- PASS: alpaca data source is iex - alpaca_iex
- PASS: alpaca paperOnly true - true
- PASS: alpaca liveTradingEnabled false - false
- PASS: alpaca has freshBarsStatus field - FRESH_BARS_AVAILABLE
- PASS: alpaca has marketDataStatus field - OPERATIONAL
- PASS: backfill has bars - 10152 bars
- PASS: rolling history has bars - 12143 bars
- PASS: rolling history has symbols - AAPL, MSFT, NVDA, QQQ, SPY
- PASS: weather station has coverage - has_data
- PASS: confidence calibration exists - symbols: 5, status: calibrated
- PASS: trades object exists - paper_simulation
- PASS: trades are paper-only - true
- PASS: positions file exists - present
- PASS: open positions tracked - count: 3
- PASS: performance file exists - present
- PASS: performance has equity - $4192.26
- PASS: latest run summary has startingBalance - $4218.75
- PASS: latest run summary has endingEquity - $4218.75
- PASS: latest run summary has paperPnl - $0
- PASS: latest run no live trade flags - clean
- PASS: performance cash vs run summary match - perf_cash=4218.75 summary=4218.75 diff=0
- PASS: trade count matches ledger count - trades=0 ledger=0
- PASS: backward-compat fields present - fields: startingBalance=true endingBalance=true totalPnl=true
- PASS: startingBalance equals cashBalance for no-trade runs - both=4218.75
- PASS: cash balance matches paper performance - trades=4218.75 perf=4218.75
- PASS: open position count consistent - positions=3 trades=3
- PASS: outputs contain no secret markers - clean

## Failed Checks

- None

## Safety

- Paper-only simulation: verified
- No broker connection: verified
- No live trading: verified
- No order placement: verified
- No social auto-posting: verified
- No credentials in outputs: verified
- Day-trading long-only gates: verified
- Reversible scheduler plan: verified
