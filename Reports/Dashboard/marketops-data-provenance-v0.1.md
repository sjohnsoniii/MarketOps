# MarketOps Data Provenance Summary v0.1

Generated: 2026-05-14T02:30:00.000Z

## Scope

This report documents the provenance of all data used in the MarketOps dashboard and public bundles. It answers: "Is this number from a real paper simulation run, real market data, sample data, or a placeholder?"

## Legend

- `real_paper_cycle_output` — from the active paper cycle JSON after runs have been applied.
- `real_paper_run_history` — from the latest run summary after a paper:full or dashboard:refresh.
- `real_paper_equity_curve` — from the equity curve JSON generated during paper simulation.
- `real_paper_signal_scans` — from the signal scan JSON generated during paper simulation.
- `real_paper_risk_decisions` — from the risk desk decisions JSON generated during paper simulation.
- `real_paper_trade_records` — from the paper trades JSON if any trades were executed.
- `no_trades_executed` — no paper trades have been executed yet (all blocked).
- `real_alpaca_iex_bars` — market data bars from the Alpaca IEX feed.
- `real_alpaca_iex_quotes` — market data quotes from the Alpaca IEX feed.
- `sample_data` — deterministic sample data used as fallback when real market data is unavailable.
- `unavailable` — input file missing, empty, or not yet generated.
- `real_refresh_health_tracker` — from the dashboard refresh health tracker JSON.
- `real_cycle_status` — from the paper cycle latest JSON.
- `real_dashboard_bundle` — from the previously built dashboard bundle.
- `real_agent_review_outputs` — from the agent review summary JSON.

## Current Provenance (as of this report)

| Section | Provenance | Detail |
|---------|-----------|--------|
| Paper cycle balance | real_paper_cycle_output | Starting 1000, current 1000, 8 runs applied |
| Latest paper run | real_paper_run_history | runId paper-20260515-022259154Z, mode paper_simulation |
| Equity curve | real_paper_equity_curve | 0% return, 0% max drawdown, no trades |
| Market bars | real_alpaca_iex_bars | 104 bars across 5 symbols from 2026-05-14 |
| Market quotes | real_alpaca_iex_quotes | 5 quotes across 5 symbols from 2026-05-14 |
| Signal scans | real_paper_signal_scans | 8 signals reviewed, 0 candidates |
| Risk decisions | real_paper_risk_decisions | 0 approved, 8 blocked |
| Paper trades | no_trades_executed | 0 trades executed |
| Agent reviews | real_agent_review_outputs | 12 desk reviews, 18 proposals |
| Refresh health | real_refresh_health_tracker | Last refresh FAIL, stale warning active |
| Cycle status | real_cycle_status | Cycle cycle-20260514-0220, active, normal |

## What Is Real Paper Simulation Data

The following are real outputs from the paper simulation pipeline (deterministic sample signals applied to real market data):

- Paper cycle balance tracking
- Paper run history (8 runs applied)
- Equity curve (starting balance, ending equity, P&L, drawdown)
- Signal scans (8 symbols, 0 candidates)
- Risk desk decisions (0 approved, 8 blocked)
- Paper trades (none executed yet — all blocked by risk desk)
- Refresh health tracker
- Agent reviews/digest
- Public bundle labels

## What Is Real Market Data

The following comes from the Alpaca IEX feed (real market data, not sample):

- OHLCV bars for SPY, QQQ, AAPL, MSFT, NVDA (May 14, 2026, limited session)
- Quotes for SPY, QQQ, AAPL, MSFT, NVDA (May 14, 2026 end-of-day)
- Crypto symbols (BTC, ETH, SOL) are requested but unsupported by IEX

## What Is Sample/Preview Data

- The 30-day market activity preview (`market-activity-30d-preview-v0.1.json`) is a pre-generated deterministic series, not real historical data.
- If Alpaca market data is unavailable, movement summaries fall back to `sampleChangePct` values from signal records.
- No performance numbers are invented. If a trade has not occurred, P&L is 0 (not faked).

## What Is Unavailable / Empty

- Paper trades: 0 trades executed. No outcome distribution data available beyond empty counts.
- Analytics: Some derived analytics fields (riskAdjustedScore, regimeAnalytics) may be static or placeholder values if the analytics pipeline has not run.

## Key Takeaway

All dashboard numbers are paper simulation only. No real money has been traded. The risk desk has blocked every proposed signal. The market data is real Alpaca IEX data, but the signal/risk/trade layers operate on deterministic sample transforms.
