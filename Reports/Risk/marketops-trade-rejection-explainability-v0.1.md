# MarketOps Trade Rejection Explainability v0.1

Generated: 2026-05-16T02:50:18.299Z

## Summary

- Paper-only review: true
- Live trading enabled: false
- Broker execution enabled: false
- Signals reviewed: 8
- Approved for fake paper trade: 3
- Rejected or observation-only: 5

## Plain-English Result

Risk Desk rejected every current fake-trade path because the watchlist moves did not clear the current candidate/confidence/long-only gates. This is useful public proof-of-life: the bot is observing real-market-derived movement, explaining why it is staying out, and preserving fake-money discipline.

## Rejection Table

| Symbol | Proposed | Decision | Confidence | Move % | Why rejected | What would make it approvable |
|---|---|---|---:|---:|---|---|
| SPY | SPY was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | 0.17 | Signal did not qualify as a candidate. Confidence threshold is below minimum threshold. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| QQQ | QQQ was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | -0.44 | Signal did not qualify as a candidate. Confidence threshold is below minimum threshold. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| AAPL | AAPL was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.62 | 2.37 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| MSFT | MSFT was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.66 | 3.16 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| NVDA | NVDA was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.76 | 5.23 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| BTC | BTC was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0 | 0 | Signal did not qualify as a candidate. Confidence 0 is below minimum threshold. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. Missing invalidation. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, a clear invalidation/stop condition, no shorting, margin, leverage, options, or futures dependency. |
| ETH | ETH was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0 | 0 | Signal did not qualify as a candidate. Confidence 0 is below minimum threshold. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. Missing invalidation. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, a clear invalidation/stop condition, no shorting, margin, leverage, options, or futures dependency. |
| SOL | SOL was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0 | 0 | Signal did not qualify as a candidate. Confidence 0 is below minimum threshold. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. Missing invalidation. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, a clear invalidation/stop condition, no shorting, margin, leverage, options, or futures dependency. |

## Bot Improvement Notes

- SPY: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- QQQ: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- AAPL: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- MSFT: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- NVDA: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- BTC: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- ETH: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- SOL: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.

## Safety Boundary

No live order, broker execution, real-money action, social post, email, SMS, or deploy is performed by this report.
