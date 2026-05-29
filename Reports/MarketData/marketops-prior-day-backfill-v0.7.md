# MarketOps Prior-Day Backfill v0.7

Generated: 2026-05-19T03:06:11.322Z

## Summary

- Total vehicles in universe: 32
- EQUITY/ETF vehicles: 32
- CRYPTO vehicles (not backfill-capable): 0
- Total bars backfilled: 58397
- Total symbols attempted: 32
- Usable symbols (>= 10 bars): 32
- Failed symbols: 0
- Coverage: 100%
- Data ready for market open: YES

## Backfill Detail

- Data source: alpaca_iex
- Timeframe: 1Min
- Lookback: 7 days
- Rolling history: 60388 bars, 32 symbols
- Weather station: has_data, 1/32 symbols usable

## Usable Symbols

- SPY
- QQQ
- IWM
- DIA
- VTI
- XLF
- XLK
- XLV
- XLE
- AAPL
- MSFT
- NVDA
- AMZN
- META
- GOOGL
- TSLA
- AVGO
- JPM
- V
- JNJ
- WMT
- PG
- XOM
- UNH
- HD
- COST
- MRK
- ABBV
- CRM
- AMD
- NFLX
- INTC

## Failed Symbols

- None

## Errors

- None


## Notes

- Backfill runs against Alpaca IEX feed with 7-day lookback.
- CRYPTO assets are not supported by the backfill endpoint.
- A minimum of 10 bars is required for a symbol to be marked usable.
- Partial coverage is acceptable; simulation will fall back to available data.
