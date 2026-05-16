# MarketOps Public-Safe Dashboard Infrastructure v0.1

Generated at: 2026-05-15T15:56:30.445Z

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

- Starting paper equity: 10000
- Ending paper equity: 10000
- Paper P/L: 0
- Paper return: 0%
- Max drawdown: 0%
- Risk-adjusted score: 42.4

## Signal Funnel

- Vehicles scanned: 8
- Signals reviewed: 8
- Candidates: 0
- Risk approved: 0
- Risk blocked: 8
- Fake paper trades: 0

## Risk Events

- Approval rate: 0%
- Blocked rate: 100%
- Risk posture: Risk Desk is blocking more than it approves.

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

- Equity curve points: 1
- Paper P&L timeline points: 30
- Rolling equity points: 30
- Drawdown visual sections: current run and rolling runs
- Vehicle activity rows: 8
- Signal/risk count rows: 30
- Cumulative paper P&L points: 1
- Target progress milestones: 4
- Signal funnel steps: 5
- Trade outcome bars: 3
- Risk decision bars: 1
- Vehicle contribution rows: 8
- Return vs drawdown rows: 11
- Paper account milestone strip points: 4
- Market data freshness rows: 1
- Recent market movement rows: 5
- Bot activity timeline rows: 20
- Stale data warning rows: 1
- Regime score bars: 6
- Synthetic benchmark comparison rows: 6

## Market Data Freshness

- Source/feed: alpaca_iex / iex
- Market refresh timestamp: 2026-05-15T15:56:30.365Z
- Latest bar timestamp: 2026-05-15T13:48:00Z
- Bars loaded: 100
- Quotes loaded: 5
- Refresh freshness: fresh
- Latest bar freshness: aging
- Raw market data published: false

## Stale/Fallback Notes

- analytics_summary: stale_context_only - Analytics summary 2026-05-08T03:46:14.425Z is older than latest paper run 2026-05-15T15:56:30.434Z. Dashboard headline cards use current paper outputs instead.

## Notes

- This is dashboard infrastructure, not a public performance claim.
- All IDs and local paths are intentionally excluded.
- Public pages should keep the paper-only, fake-money, public-safe derived-data, and not-financial-advice labels visible.
