# MarketOps Alpaca Market Data Adapter v0.1

Generated: 2026-05-15T12:21:36.796Z

## Status

- dataSource: alpaca_iex
- paperOnly: true
- liveTradingEnabled: false
- orderPlacementEnabled: false
- feed: iex
- symbols requested: SPY, QQQ, AAPL, MSFT, NVDA
- bars loaded: 14
- quotes loaded: 5

## Unsupported Assets

- BTC: not requested from Alpaca IEX in v0.1
- ETH: not requested from Alpaca IEX in v0.1
- SOL: not requested from Alpaca IEX in v0.1

## Safety Boundary

This adapter reads market data only. It does not submit orders, connect execution, enable live trading, send alerts, publish content, or expose credentials. Paper trades remain local simulated records with paperOnly true.
