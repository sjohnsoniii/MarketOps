# MarketOps Dashboard Refresh Latest v0.1

Generated: 2026-05-28T19:51:55.089Z

## Status

FAIL

Error: npm run marketdata:refresh failed: Alpaca data request failed with HTTP 429.

## Failure Details

- failureReason: npm run marketdata:refresh failed: Alpaca data request failed with HTTP 429.
- lastKnownGoodPreserved: true
- lastKnownGoodGeneratedAt: 2026-05-28T19:51:54.806Z
- Dashboard and public bundles were NOT overwritten. Last-known-good data is preserved.

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
- generatedAt: 2026-05-28T19:50:25.338Z
- latestBarTimestamp: 2026-05-28T19:48:00Z
- barsLoaded: 2945
- quotesLoaded: 149
- refreshAgeMinutes: 1.5
- latestBarAgeMinutes: 3.92
- paperOnly: true
- liveTradingEnabled: false

## Paper Account

- latestRunId: paper-20260528-195105653Z
- latestRunGeneratedAt: 2026-05-28T19:51:05.653Z
- endingEquity: 11.78
- paperPnl: 0
- paperReturnPct: 0
- maxDrawdownPct: null
- fakePaperTrades: 0
- qaStatus: PASS

## Balance-Based Paper Cycle

- cycleId: cycle-20260520-2356
- status: reset_pending
- startingBalance: 1000
- currentBalance: -17.84
- daysSurvived: 5.59
- approvedTrades: 62
- rejectedTrades: 836
- depletionRisk: depleted
- nextCycleScheduledStart: 2026-05-27T13:30:00.000Z

## Charts Updated

- Paper equity curve: missing_or_empty, points=0, source=paper_outputs
- Paper P&L: updated, points=30, source=paper_run_history
- Drawdown: missing_or_empty, points=0, source=paper_outputs
- Watchlist movement summary: updated, points=148, source=alpaca_iex_derived_summary
- Up/down/flat vehicle counts: updated, points=3, source=alpaca_iex_derived_summary
- Top movement buckets: updated, points=5, source=alpaca_iex_derived_summary
- Signal candidates generated: updated, points=3, source=paper_signal_outputs
- Signal confidence distribution: updated, points=4, source=paper_signal_outputs
- Risk rejection counts by reason: updated, points=32, source=risk_outputs
- Almost-approved candidates: updated, points=8, source=risk_outputs
- Vehicle activity: updated, points=150, source=paper_signals_plus_market_movement
- Signal/risk counts: updated, points=30, source=paper_run_history
- Cumulative paper P&L: updated, points=1, source=paper_trade_outputs
- Progress toward +30% target: updated, points=4, source=paper_account_targets
- Trade outcome mix: updated, points=3, source=paper_trade_outputs
- Risk decision mix: updated, points=1, source=risk_outputs
- Vehicle contribution: updated, points=149, source=paper_outputs_plus_market_movement
- Return vs drawdown snapshot: updated, points=11, source=paper_run_history
- Paper account milestone strip: updated, points=4, source=paper_account_targets
- Signal funnel: updated, points=5, source=paper_signal_outputs
- Market data freshness panel: updated, points=1, source=alpaca_iex_metadata
- Recent market movement panel: updated, points=148, source=alpaca_iex_derived_bars
- Bot activity / latest run timeline: updated, points=20, source=paper_run_history
- Stale-data warning panel: updated, points=1, source=freshness_labels
- Market regime summary: updated, points=1, source=watchlist_and_regime_context
- Regime score bars: updated, points=6, source=synthetic_backtest_context, fallback/sample-labeled
- Synthetic benchmark comparison: updated, points=6, source=synthetic_backtest_context, fallback/sample-labeled

## Stale Or Fallback

- Paper equity curve: missing_or_empty
- Drawdown: missing_or_empty
- Regime score bars: fallback/sample context
- Synthetic benchmark comparison: fallback/sample context

## Commands Run

- FAIL: npm run marketdata:refresh - Alpaca data request failed with HTTP 429.

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
