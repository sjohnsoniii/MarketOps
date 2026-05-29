# MarketOps Alpaca Market Data Adapter v0.1

Generated: 2026-05-29T01:44:17.318Z

## Status

- dataSource: alpaca_iex
- paperOnly: true
- liveTradingEnabled: false
- orderPlacementEnabled: false
- feed: iex
- symbols requested: SPY, QQQ, IWM, DIA, VTI, VOO, VXUS, BND, BNDX, VT, VB, VO, VV, IVV, IJR, IJH, SCHB, SCHX, SCHF, XLF, XLK, XLV, XLE, XLI, XLP, XLY, XLU, XLRE, XLC, SMH, IBB, KRE, KBE, OIH, XHB, XRT, GDX, GDXJ, SLV, GLD, TLT, IEF, SHY, LQD, HYG, EMB, TIP, MBB, EEM, EFA, VEA, VWO, ARKK, ARKW, ARKG, ARKF, SOXX, TAN, ICLN, XBI, LABU, FXI, EWJ, EWZ, INDA, AAPL, MSFT, NVDA, AMZN, META, GOOGL, GOOG, TSLA, AVGO, JPM, V, JNJ, WMT, PG, XOM, UNH, HD, COST, MRK, ABBV, CRM, AMD, NFLX, INTC, BRK.B, LLY, MA, ORCL, ADBE, CSCO, ACN, DIS, PFE, TMO, BAC, KO, PEP, ABT, TXN, QCOM, AMGN, HON, UBER, NKE, BA, MCD, CAT, GE, WFC, RTX, IBM, PLD, AMAT, AMD, MU, NOW, SYK, LRCX, GS, BLK, ADI, AXP, BKNG, GILD, VRTX, REGN, ISRG, PANW, SBUX, MDLZ, SCHW, C, F, GM, PYPL, SNAP, SQ, DASH, RIVN, LCID, PLTR, COIN, HOOD, MSTR, TSM
- freshBarsStatus: LIMITED_FRESH_BARS
- marketDataStatus: DEGRADED_OFF_HOURS
- bars loaded: 20 (expected: 300)
- quotes loaded: 149

## Unsupported Assets

- None

## Safety Boundary

This adapter reads market data only. It does not submit orders, connect execution, enable live trading, send alerts, publish content, or expose credentials. Paper trades remain local simulated records with paperOnly true.
