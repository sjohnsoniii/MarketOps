# MarketOps Alpaca Paper Market Data Adapter v0.1

## Purpose

This adapter lets MarketOps use Alpaca IEX market data as an input to local paper simulation.

## Safety Boundary

- Market data only.
- Paper simulation only.
- No order placement.
- No broker execution.
- No account funding.
- No live trading.
- No SMS, email, social posting, or subscriber execution.
- Credentials stay in local ignored `.env.local` files.

## Local Commands

```powershell
cd C:\Users\sjohn\Desktop\Projects\MarketOps\Source\marketops-core
npm run marketdata:refresh
npm run paper:full
npm run marketdata:qa
```

## Outputs

- `Data\market-data\alpaca\alpaca-market-data-latest-v0.1.json`
- `Data\market-data\alpaca\alpaca-market-bars-latest-v0.1.json`
- `Reports\MarketData\marketops-alpaca-market-data-v0.1.md`

## Labels

Every adapter output must keep:

- `dataSource: alpaca_iex`
- `paperOnly: true`
- `liveTradingEnabled: false`
- `orderPlacementEnabled: false`

## Dashboard Use

The paper simulation loader prefers the latest sanitized Alpaca market-data cache when present. Public dashboard bundles can show the data source and latest refresh timestamp, but paper performance remains fake-money simulation and not financial advice.
