# MarketOps Trade Rejection Explainability v0.1

Generated: 2026-05-14T02:36:53.339Z

## Summary

- Paper-only review: true
- Live trading enabled: false
- Broker execution enabled: false
- Signals reviewed: 8
- Approved for fake paper trade: 0
- Rejected or observation-only: 8

## Plain-English Result

Risk Desk rejected every current fake-trade path because the watchlist moves did not clear the current candidate/confidence/long-only gates. This is useful public proof-of-life: the bot is observing real-market-derived movement, explaining why it is staying out, and preserving fake-money discipline.

## Rejection Table

| Symbol | Proposed | Decision | Confidence | Move % | Why rejected | What would make it approvable |
|---|---|---|---:|---:|---|---|
| SPY | SPY was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | -0.14 | Signal did not qualify as a candidate. Confidence threshold is below minimum threshold. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| QQQ | QQQ was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | -0.55 | Signal did not qualify as a candidate. Confidence threshold is below minimum threshold. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| AAPL | AAPL was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | -0.03 | Signal did not qualify as a candidate. Confidence threshold is below minimum threshold. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| MSFT | MSFT was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | -0.97 | Signal did not qualify as a candidate. Confidence threshold is below minimum threshold. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| NVDA | NVDA was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | -0.27 | Signal did not qualify as a candidate. Confidence threshold is below minimum threshold. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| BTC | BTC was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0 | 0 | Signal did not qualify as a candidate. Confidence 0 is below minimum threshold. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. Missing invalidation. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, a clear invalidation/stop condition, no shorting, margin, leverage, options, or futures dependency. |
| ETH | ETH was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0 | 0 | Signal did not qualify as a candidate. Confidence 0 is below minimum threshold. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. Missing invalidation. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, a clear invalidation/stop condition, no shorting, margin, leverage, options, or futures dependency. |
| SOL | SOL was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0 | 0 | Signal did not qualify as a candidate. Confidence 0 is below minimum threshold. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. Missing invalidation. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, a clear invalidation/stop condition, no shorting, margin, leverage, options, or futures dependency. |

## Bot Improvement Notes

- SPY: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- QQQ: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- AAPL: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- MSFT: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- NVDA: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- BTC: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- ETH: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- SOL: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.

## Safety Boundary

No live order, broker execution, real-money action, social post, email, SMS, or deploy is performed by this report.
