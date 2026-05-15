# MarketOps Public Share Packet v0.1

Generated: 2026-05-15T10:22:32.558Z

## 1. Public-Safe Summary

MarketOps is a paper-only simulation engine that scans watchlist vehicles using market data, applies a deterministic signal model, runs each candidate through a Risk Desk gate, and records fake paper trades. No real money, no broker execution, no live trading, no social posting, no email/SMS.

This share packet documents the current state of the paper lab as of the latest local refresh.

## 2. Latest Shareable Numbers

| Metric | Value | Source |
|--------|-------|--------|
| Paper cycle status | active | real paper cycle output |
| Active preset | Standard (1000 paper USD) | config |
| Starting paper balance | 1,000 paper USD | real paper cycle output |
| Current paper balance | 1,000 paper USD | real paper cycle output |
| Paper P&L | 0 paper USD | real paper run history |
| Return | 0% | real paper run history |
| Max drawdown | 0% | real paper run history |
| Days survived | 1 | real paper cycle output |
| Approved trades | 0 | real paper risk decisions |
| Rejected trades | 64 | real paper risk decisions |
| Signals reviewed | 8 | real paper signal scans |
| Risk approved | 0 | real paper risk decisions |
| Risk blocked | 8 | real paper risk decisions |
| Fake paper trades | 0 | no trades executed |
| Market data source | Alpaca IEX | real market data |
| Bars loaded | 104 | real alpaca iex bars |
| Quotes loaded | 5 | real alpaca iex quotes |
| Refresh status | FAIL (last successful 7.9h ago) | real refresh health tracker |
| Scheduler installed | false | by design |
| Active cycle | cycle-20260514-0220 | real cycle status |

## 3. What Graphs Are Real vs Preview/Sample

### Real paper simulation data (from actual simulation runs)

- Paper equity curve — from real paper simulation equity points
- Paper P&L timeline — from real paper run history
- Rolling equity — from real paper run history
- Drawdown — from real paper equity curve
- Signal/risk counts — from real paper signal scans and risk decisions
- Risk rejection reasons — from real paper risk desk decisions
- Signal funnel — from real paper signal/risk pipeline
- Bot activity timeline — from real paper run history
- Paper cycle status — from real paper cycle tracking
- Dashboard refresh health — from real health tracker

### Real market data (from Alpaca IEX feed)

- Market data freshness panel — real timestamps
- Recent market movement — real OHLCV bars for SPY/QQQ/AAPL/MSFT/NVDA
- Market movement series — real bar-by-bar movement
- Quote snapshots — real IEX quotes

### Synthetic analytics

- Regime score bars — from analytics pipeline (regime comparison data)
- Synthetic benchmark comparison — from analytics pipeline

### Preview/sample data

- 30-day market activity preview (`market-activity-30d-preview-v0.1.json`) — deterministic series
- Movement summaries fall back to `sampleChangePct` when real market data unavailable

### Empty/no-trades

- Cumulative paper P&L — no trades executed (all blocked by Risk Desk)
- Trade outcome bars — no trades to classify
- Vehicle P&L contribution — no trades to attribute

## 4. What This Means

The paper lab is operational and running in a deliberately cautious mode:
- The Risk Desk blocks all proposed signals, which means **no fake trades are being placed**
- The cycle is alive at 1,000 paper USD with normal depletion risk after 1 day and 8 runs
- Market data is coming from a real Alpaca IEX feed with 104 bars across 5 symbols
- The refresh pipeline last succeeded ~8 hours ago; a new refresh is due
- The scheduler is intentionally not installed — all refreshes are manual

This is not a performance report. It is a process-quality dashboard showing that the simulation pipeline, data ingest, risk gating, and output generation are running locally. Because no trades have been approved, there is zero P&L movement to report.

## 5. Important Disclaimers

**⚠️ Paper simulation only.**
**⚠️ Fake money. Not real trading.**
**⚠️ Not financial advice.**
**⚠️ No guarantees, no copy-trading.**
**⚠️ In development — sample-data preview for educational and process-improvement purposes only.**
**⚠️ All signals are currently blocked by the Risk Desk in a deliberately cautious Phase 1 configuration.**
**⚠️ Market data is used for paper simulation only; no live trading or order placement occurs.**
**⚠️ No broker, API, payment, social auto-posting, or notification behavior is enabled.**

## 6. Suggested Manual Social/Blog Teaser

*Draft only — review before any use. Do not post automatically.*

> "MarketOps Phase 1 paper lab update: the simulation pipeline is live, ingesting real Alpaca IEX data, scanning 8 vehicles, running every signal through a Risk Desk gate. Current state: 64 signals rejected, 0 fake trades placed, 1,000 paper USD cycle still alive at 24h. The Risk Desk is being deliberately cautious — no trades approved yet. This is paper-only simulation in development, not real trading or financial advice. Just building in public. #MarketOps #PaperTrading #BuildInPublic"

Alternative shorter version for social:

> "Paper-lab update: 8 vehicles scanned, 64 signals rejected by Risk Desk, 0 fake trades. Cycle alive at 1,000 paper USD. All paper, all simulation, all cautious. #MarketOps #PaperTrading"

## Packet Integrity

- No commit, push, deploy, scheduler install, live trading, social posting, email, SMS, payment, or secrets action occurred during packet generation.
- This packet is a static preview document. It is not a public publication.
