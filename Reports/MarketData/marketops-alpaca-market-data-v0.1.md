# MarketOps Market Data QA v0.1

Generated: 2026-05-19T02:16:58.589Z

## Verdict

PASS

## Latest Data

- symbols: SPY, QQQ, AAPL, MSFT, NVDA
- freshBarsStatus: FRESH_BARS_AVAILABLE
- marketDataStatus: OPERATIONAL
- bars loaded: 100
- quotes loaded: 5
- latest bar timestamp: 2026-05-18T13:44:00Z

## Safety Boundary

MarketOps uses Alpaca as a market-data-only adapter. Paper trades remain simulated locally. No order submission, account funding, broker execution, social posting, email sending, SMS sending, or public deployment is enabled by this layer.

## Checks

- PASS: script exists: marketdata:refresh - node src/marketdata/alpacaMarketDataAdapter.js
- PASS: script exists: marketdata:qa - node src/marketdata/runMarketDataQa.js
- PASS: config mode is paper_simulation - paper_simulation
- PASS: broker connection disabled - false
- PASS: live trading disabled - false
- PASS: required file exists: Source/marketops-core/src/marketdata/alpacaMarketDataAdapter.js - /home/sjohnsoniii/Projects/MarketOps/Source/marketops-core/src/marketdata/alpacaMarketDataAdapter.js
- PASS: required file exists: Source/marketops-core/src/marketdata/localEnv.js - /home/sjohnsoniii/Projects/MarketOps/Source/marketops-core/src/marketdata/localEnv.js
- PASS: required file exists: Data/market-data/alpaca/alpaca-market-data-latest-v0.1.json - /home/sjohnsoniii/Projects/MarketOps/Data/market-data/alpaca/alpaca-market-data-latest-v0.1.json
- PASS: required file exists: Data/market-data/alpaca/alpaca-market-bars-latest-v0.1.json - /home/sjohnsoniii/Projects/MarketOps/Data/market-data/alpaca/alpaca-market-bars-latest-v0.1.json
- PASS: required file exists: Reports/MarketData/marketops-alpaca-market-data-v0.1.md - /home/sjohnsoniii/Projects/MarketOps/Reports/MarketData/marketops-alpaca-market-data-v0.1.md
- PASS: market data bundle valid JSON - /home/sjohnsoniii/Projects/MarketOps/Data/market-data/alpaca/alpaca-market-data-latest-v0.1.json
- PASS: dataSource is alpaca_iex - alpaca_iex
- PASS: paperOnly true - true
- PASS: liveTradingEnabled false - false
- PASS: orderPlacementEnabled false - false
- PASS: freshBarsStatus field present - FRESH_BARS_AVAILABLE
- PASS: marketDataStatus field present - OPERATIONAL
- PASS: bars loaded - 100
- PASS: quotes loaded - 5
- PASS: bars are labeled paper-only - bar labels checked
- PASS: paper dashboard includes Alpaca data source - alpaca_iex
- PASS: paper dashboard liveTradingEnabled false - false
- PASS: public dashboard includes data source - alpaca_iex
- PASS: public dashboard paperOnly true - true
- PASS: public dashboard liveTradingEnabled false - false
- PASS: public dashboard refresh timestamp exists - 2026-05-16T02:37:29.702Z
- PASS: no order/execution endpoint code exists
- PASS: outputs contain no credential markers
