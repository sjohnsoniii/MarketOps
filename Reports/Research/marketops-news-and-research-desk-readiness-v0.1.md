# MarketOps News & Research Desk Readiness Report v0.1

**Date:** 2026-05-19  
**Status:** Research only. No implementation. No API keys added.

---

## Current State

| Question | Answer |
|----------|--------|
| Does a News Desk currently exist? | **No.** There is no News Desk module, director, or integration in the codebase. |
| Does a Market Research Desk currently exist? | **No.** There is no Market Research Desk. Some research-like data exists in `market-weather-station` and `signal-scan` but no formal research desk. |
| What is the closest existing function? | The **Signal Desk** (`src/signalDesk/`) and **Market Data** adapters (`src/marketdata/`) provide price/movement signals. The **Risk Desk** (`src/risk/`) makes trading decisions from those signals. No entity interprets news, earnings, or macro catalysts. |

---

## Where It Should Fit

```
Market Data (Alpaca IEX)  →  News Desk (future)  →  Signal Desk  →  Risk Desk  →  Paper Trader
        ↑                           ↑                      ↑
  price bars only         cited news, earnings,      movement + news
                          macro, analyst actions      context combined
```

The News/Research Desk should sit **between Market Data and Signal Desk** — it ingests news/events and produces structured research notes that the Signal Desk can incorporate into its confidence/movement analysis.

**Never** bypass Signal Desk → Risk Desk. News should never auto-trade.

---

## Inputs It Would Need

| Input | Source | Required? |
|-------|--------|-----------|
| Earnings calendar | External API (e.g., Financial Modeling Prep, Polygon.io) | Yes |
| Macro economic calendar | External API or RSS | Yes |
| Major news headlines | RSS feeds (Reuters, Bloomberg, CNBC) | Yes |
| Analyst rating changes | External API | Nice to have |
| SEC filings (8-K, 10-Q) | EDGAR RSS or API | Nice to have |
| Social sentiment | External API | Avoid (noise-heavy) |
| Current positions/signals | Internal (`Data/paper/`) | Yes |
| Approved vehicle list | Internal (`Config/` or `Data/`) | Yes |

---

## Recommended Sources/APIs (future)

| Source | Type | Cost | Notes |
|--------|------|------|-------|
| Financial Modeling Prep | REST API | Free tier available | Earnings, calendar, SEC filings |
| Polygon.io | REST API | Free tier available | News, earnings, splits |
| Yahoo Finance RSS | RSS | Free | Headlines only, no structured data |
| EDGAR RSS | RSS | Free | SEC filing notifications |
| Benzinga | RSS/API | Free tier | Financial news headlines |

**Do not add API keys in this cycle.** This report is readiness only.

---

## Safety & Citation Requirements

| Rule | Description |
|------|-------------|
| Source citation | Every fact must cite source (RSS feed name, API provider, timestamp). |
| Freshness labeling | News must be labeled with publish timestamp and retrieval timestamp. |
| No auto-trade from news | News feeds signal context only. News alone must never trigger a trade. |
| Stale news detection | News older than 24 hours should be flagged as stale. |
| Conflicting news handling | If multiple sources conflict, flag as contested and do not use for signal adjustment. |
| Review queue routing | Major logic changes (e.g., "ignore earnings week" rule) must go through the review queue. |

---

## How It Should Influence Signals

1. **Event-based confidence adjustment:** If a symbol has an earnings report in <7 days and the machine cannot read the report, reduce confidence. If the report is favorable, allow normal confidence but flag for human review.
2. **Catalyst labeling:** Attach catalyst tags to symbols (e.g., "earnings_next_week", "analyst_upgrade", "sector_headwind") so the Signal Desk has context.
3. **No hard overrides:** News findings should be additive to signal analysis, not override it. The Risk Desk still makes the final decision.
4. **Routed proposals:** If the News Desk identifies a pattern where news should change risk thresholds, it should submit a proposal to the review queue.

---

## What Not to Do Yet

- Do not add API keys for news/news-data providers.
- Do not build a scraping pipeline.
- Do not create an `src/news-desk/` directory that sits idle.
- Do not auto-trade from headlines.
- Do not hardcode RSS feed URLs that may go stale.
- Do not integrate social media sentiment (Twitter/X, Reddit) — too noisy.
- Do not attempt to read/parse unstructured SEC filings (needs NLP).

---

## Route to Review Queue

When the News/Research Desk is built, it should:
- Generate **research improvement proposals** and route them to `Data/review/` via the `review:import` pipeline
- Generate **signal context attachments** stored in a new `Data/research/` directory
- Flag **conflicting/gap analysis** for human review

---

## Recommendation

**Do not build the News/Research Desk yet.** Priorities before News Desk:

1. **Exit logic** — The system currently has no exit/profit-taking/stop-loss rules. Entries exist but exits are manual/hold-forever. Adding basic exits is higher priority than adding news.
2. **Benchmark tracking** — Track an index (SPY) alongside the paper account to benchmark performance.
3. **Proposal-to-action workflow** — Complete the admin review UI (Cruise 5+), then allow approved proposals to be applied to sandbox.
4. **Then:** Build a lightweight News Desk that reads a single RSS feed (e.g., Yahoo Finance RSS for held symbols), labels catalysts, and attaches context to signals.
