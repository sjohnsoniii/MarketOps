# MarketOps Dashboard Refresh Latest v0.1

Generated: 2026-05-15T15:56:30.456Z

## Status

PASS

## Safety

- mode: paper_simulation
- paperOnly: true
- publicSafe: true
- externalEffects: false
- publishAllowed: false
- liveTradingEnabled: false
- orderPlacementEnabled: false
- brokerExecutionEnabled: false
- socialPostingEnabled: false
- emailSmsSendingEnabled: false
- rawMarketDataPublished: false

## Market Data

- source/feed: alpaca_iex / iex
- generatedAt: 2026-05-15T15:56:30.365Z
- latestBarTimestamp: 2026-05-15T13:48:00Z
- barsLoaded: 100
- quotesLoaded: 5
- refreshAgeMinutes: 0
- latestBarAgeMinutes: 128.51
- paperOnly: true
- liveTradingEnabled: false

## Paper Account

- latestRunId: paper-20260515-155630434Z
- latestRunGeneratedAt: 2026-05-15T15:56:30.434Z
- endingEquity: 10000
- paperPnl: 0
- paperReturnPct: 0
- maxDrawdownPct: 0
- fakePaperTrades: 0
- qaStatus: PASS

## Balance-Based Paper Cycle

- cycleId: cycle-20260514-0220
- status: active
- startingBalance: 1000
- currentBalance: 1000
- daysSurvived: 1.57
- approvedTrades: 0
- rejectedTrades: 80
- depletionRisk: normal
- nextCycleScheduledStart: null

## Charts Updated

- Paper equity curve: updated, points=1, source=paper_outputs
- Paper P&L: updated, points=30, source=paper_run_history
- Drawdown: updated, points=1, source=paper_outputs
- Watchlist movement summary: updated, points=5, source=alpaca_iex_derived_summary
- Up/down/flat vehicle counts: updated, points=3, source=alpaca_iex_derived_summary
- Top movement buckets: updated, points=5, source=alpaca_iex_derived_summary
- Signal candidates generated: updated, points=3, source=paper_signal_outputs
- Signal confidence distribution: updated, points=4, source=paper_signal_outputs
- Risk rejection counts by reason: updated, points=5, source=risk_outputs
- Almost-approved candidates: updated, points=8, source=risk_outputs
- Vehicle activity: updated, points=8, source=paper_signals_plus_market_movement
- Signal/risk counts: updated, points=30, source=paper_run_history
- Cumulative paper P&L: updated, points=1, source=paper_trade_outputs
- Progress toward +30% target: updated, points=4, source=paper_account_targets
- Trade outcome mix: updated, points=3, source=paper_trade_outputs
- Risk decision mix: updated, points=1, source=risk_outputs
- Vehicle contribution: updated, points=8, source=paper_outputs_plus_market_movement
- Return vs drawdown snapshot: updated, points=11, source=paper_run_history
- Paper account milestone strip: updated, points=4, source=paper_account_targets
- Signal funnel: updated, points=5, source=paper_signal_outputs
- Market data freshness panel: updated, points=1, source=alpaca_iex_metadata
- Recent market movement panel: updated, points=5, source=alpaca_iex_derived_bars
- Bot activity / latest run timeline: updated, points=20, source=paper_run_history
- Stale-data warning panel: updated, points=1, source=freshness_labels
- Market regime summary: updated, points=1, source=watchlist_and_regime_context
- Regime score bars: updated, points=6, source=synthetic_backtest_context, fallback/sample-labeled
- Synthetic benchmark comparison: updated, points=6, source=synthetic_backtest_context, fallback/sample-labeled

## Stale Or Fallback

- Regime score bars: fallback/sample context
- Synthetic benchmark comparison: fallback/sample context

## Commands Run

- PASS: npm run marketdata:refresh - complete
- PASS: npm run marketdata:qa - complete
- PASS: npm run paper:full - complete
- PASS: npm run risk:explain - complete
- PASS: npm run cycle:build - complete
- PASS: npm run cycle:qa - complete
- PASS: npm run dashboard:build - complete
- PASS: npm run paper:refresh-site - complete
- PASS: npm run dashboard:qa - complete
- PASS: npm run dashboard:public-refresh:qa - complete

## Local Preview

Run:

```bash
cd ~/Projects/MarketOps/Source/marketops-core
npm run dashboard:preview
```

Then open:

```bash
xdg-open ~/Projects/MarketOps/Admin/dashboard-preview/marketops-dashboard-preview-v0.1.html
```
