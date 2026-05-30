# MarketOps Public-Safe Dashboard Infrastructure v0.1

Generated at: 2026-05-29T19:51:08.943Z

## Scope

This dashboard bundle is local and preview-safe. It contains paper simulation metrics, derived Alpaca IEX market-data movement where available, synthetic regime summaries, and review-gated operations stats. It does not include broker integrations, local paths, raw internal IDs, social posting, payments, secrets, or private execution details.

## Safety Labels

- Mode: paper_simulation
- Paper only: true
- Sample data: true
- Real market data inputs: true
- Data source: alpaca_iex
- Market data mode: real_market_data_for_paper_simulation
- Not financial advice: true
- Not live market data publishing: true
- External effects: false
- Publish allowed: false

## Paper Performance Cards

- Starting paper equity: 1003.42
- Ending paper equity: 172.44
- Paper P/L: -830.98
- Paper return: -82.81%
- Max drawdown: -82.81%
- Risk-adjusted score: 42.4

## Signal Funnel

- Vehicles scanned: 150
- Signals reviewed: 150
- Candidates: 85
- Risk approved: 82
- Risk blocked: 68
- Fake paper trades: 10

## Risk Events

- Approval rate: 54.67%
- Blocked rate: 45.33%
- Risk posture: Risk Desk approvals are higher than blocks.

## Regime Summary

- Regimes compared: 6
- Strongest paper regime: melt_up
- Weakest paper regime: panic_drawdown
- Worst synthetic drawdown regime: panic_drawdown
- Inactive regimes: trend_down, choppy_sideways, panic_drawdown, low_volatility_drift

## Content + Agent Review Stats

- Content generated: 10
- Queue items: 33
- Compliance status: passed
- Publish allowed: false
- Agent reviews generated: 12
- Improvement proposals: 18
- Human review load: low
- Auto-apply allowed: false

## Chart-Ready Sections

- Equity curve points: 10
- Paper P&L timeline points: 30
- Rolling equity points: 30
- Drawdown visual sections: current run and rolling runs
- Vehicle activity rows: 150
- Signal/risk count rows: 30
- Cumulative paper P&L points: 11
- Target progress milestones: 4
- Signal funnel steps: 5
- Trade outcome bars: 3
- Risk decision bars: 4
- Vehicle contribution rows: 149
- Return vs drawdown rows: 11
- Paper account milestone strip points: 4
- Market data freshness rows: 1
- Recent market movement rows: 1
- Bot activity timeline rows: 20
- Stale data warning rows: 2
- Regime score bars: 6
- Synthetic benchmark comparison rows: 6

## Market Data Freshness

- Source/feed: alpaca_iex / iex
- Market refresh timestamp: 2026-05-29T19:50:25.340Z
- Latest bar timestamp: 2026-05-29T13:47:00Z
- Bars loaded: 20
- Quotes loaded: 149
- Refresh freshness: fresh
- Latest bar freshness: aging
- Raw market data published: false

## Stale/Fallback Notes

- analytics_summary: stale_context_only - Analytics summary 2026-05-08T03:46:14.425Z is older than latest paper run 2026-05-29T02:06:44.310Z. Dashboard headline cards use current paper outputs instead.
- paper_run: stale - Latest paper run is 1064.41 minutes old.

## Notes

- This is dashboard infrastructure, not a public performance claim.
- All IDs and local paths are intentionally excluded.
- Public pages should keep the paper-only, fake-money, public-safe derived-data, and not-financial-advice labels visible.
