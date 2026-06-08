# MarketOps Market Data QA v0.1

Generated: 2026-06-08T18:07:40.794Z

## Verdict

PASS

## Latest Data

- symbols: SPY, QQQ, IWM, DIA, VTI, VOO, VXUS, BND, BNDX, VT, VB, VO, VV, IVV, IJR, IJH, SCHB, SCHX, SCHF, XLF, XLK, XLV, XLE, XLI, XLP, XLY, XLU, XLRE, XLC, SMH, IBB, KRE, KBE, OIH, XHB, XRT, GDX, GDXJ, SLV, GLD, TLT, IEF, SHY, LQD, HYG, EMB, TIP, MBB, EEM, EFA, VEA, VWO, ARKK, ARKW, ARKG, ARKF, SOXX, TAN, ICLN, XBI, LABU, FXI, EWJ, EWZ, INDA, AAPL, MSFT, NVDA, AMZN, META, GOOGL, GOOG, TSLA, AVGO, JPM, V, JNJ, WMT, PG, XOM, UNH, HD, COST, MRK, ABBV, CRM, AMD, NFLX, INTC, BRK.B, LLY, MA, ORCL, ADBE, CSCO, ACN, DIS, PFE, TMO, BAC, KO, PEP, ABT, TXN, QCOM, AMGN, HON, UBER, NKE, BA, MCD, CAT, GE, WFC, RTX, IBM, PLD, AMAT, AMD, MU, NOW, SYK, LRCX, GS, BLK, ADI, AXP, BKNG, GILD, VRTX, REGN, ISRG, PANW, SBUX, MDLZ, SCHW, C, F, GM, PYPL, SNAP, SQ, DASH, RIVN, LCID, PLTR, COIN, HOOD, MSTR, TSM
- freshBarsStatus: FRESH_BARS_AVAILABLE
- marketDataStatus: OPERATIONAL
- bars loaded: 149
- quotes loaded: 149
- latest bar timestamp: 2026-06-08T18:06:00Z

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
- PASS: bars loaded - 149
- PASS: quotes loaded - 149
- PASS: bars are labeled paper-only - bar labels checked
- PASS: paper dashboard includes Alpaca data source - alpaca_iex
- PASS: paper dashboard liveTradingEnabled false - false
- PASS: public dashboard includes data source - alpaca_iex
- PASS: public dashboard paperOnly true - true
- PASS: public dashboard liveTradingEnabled false - false
- PASS: public dashboard refresh timestamp exists - 2026-05-22T16:00:40.268Z
- PASS: no order/execution endpoint code exists
- PASS: outputs contain no credential markers
