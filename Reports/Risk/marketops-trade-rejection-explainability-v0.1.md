# MarketOps Trade Rejection Explainability v0.1

Generated: 2026-05-29T19:51:08.921Z

## Summary

- Paper-only review: true
- Live trading enabled: false
- Broker execution enabled: false
- Signals reviewed: 150
- Approved for fake paper trade: 82
- Rejected or observation-only: 68

## Plain-English Result

Risk Desk rejected every current fake-trade path because the watchlist moves did not clear the current candidate/confidence/long-only gates. This is useful public proof-of-life: the bot is observing real-market-derived movement, explaining why it is staying out, and preserving fake-money discipline.

## Rejection Table

| Symbol | Proposed | Decision | Confidence | Move % | Why rejected | What would make it approvable |
|---|---|---|---:|---:|---|---|
| SPY | SPY was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.6 | 2.06 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| QQQ | QQQ was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.68 | 3.64 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| IWM | IWM was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.71 | 4.11 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| DIA | DIA was reviewed as a watchlist movement, but it was not proposed as a fake trade. | approved_for_fake_paper_trade | 0.19 | 1.9 | Risk Desk found no blocking issue under current paper-only rules. | It would need movement strong enough to become a candidate, confidence at or above 0.55. |
| VTI | VTI was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.61 | 2.11 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| VOO | VOO was reviewed as a watchlist movement, but it was not proposed as a fake trade. | approved_for_fake_paper_trade | 0.16 | 1.59 | Risk Desk found no blocking issue under current paper-only rules. | It would need movement strong enough to become a candidate, confidence at or above 0.55. |
| VXUS | VXUS was reviewed as a watchlist movement, but it was not proposed as a fake trade. | approved_for_fake_paper_trade | 0.16 | 1.63 | Risk Desk found no blocking issue under current paper-only rules. | It would need movement strong enough to become a candidate, confidence at or above 0.55. |
| BND | BND was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | 0.72 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| BNDX | BNDX was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | 0.62 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| VT | VT was reviewed as a watchlist movement, but it was not proposed as a fake trade. | approved_for_fake_paper_trade | 0.17 | 1.72 | Risk Desk found no blocking issue under current paper-only rules. | It would need movement strong enough to become a candidate, confidence at or above 0.55. |
| VB | VB was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.63 | 2.67 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| VO | VO was reviewed as a watchlist movement, but it was not proposed as a fake trade. | approved_for_fake_paper_trade | 0.18 | 1.83 | Risk Desk found no blocking issue under current paper-only rules. | It would need movement strong enough to become a candidate, confidence at or above 0.55. |
| VV | VV was reviewed as a watchlist movement, but it was not proposed as a fake trade. | approved_for_fake_paper_trade | 0.17 | 1.69 | Risk Desk found no blocking issue under current paper-only rules. | It would need movement strong enough to become a candidate, confidence at or above 0.55. |
| IVV | IVV was reviewed as a watchlist movement, but it was not proposed as a fake trade. | approved_for_fake_paper_trade | 0.16 | 1.59 | Risk Desk found no blocking issue under current paper-only rules. | It would need movement strong enough to become a candidate, confidence at or above 0.55. |
| IJR | IJR was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.63 | 2.57 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| IJH | IJH was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.61 | 2.22 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| SCHB | SCHB was reviewed as a watchlist movement, but it was not proposed as a fake trade. | approved_for_fake_paper_trade | 0.19 | 1.85 | Risk Desk found no blocking issue under current paper-only rules. | It would need movement strong enough to become a candidate, confidence at or above 0.55. |
| SCHX | SCHX was reviewed as a watchlist movement, but it was not proposed as a fake trade. | approved_for_fake_paper_trade | 0.17 | 1.71 | Risk Desk found no blocking issue under current paper-only rules. | It would need movement strong enough to become a candidate, confidence at or above 0.55. |
| SCHF | SCHF was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.14 | 1.39 | n/a | It would need movement strong enough to become a candidate, confidence at or above 0.55. |
| XLF | XLF was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | -0.25 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| XLK | XLK was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.81 | 6.18 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| XLV | XLV was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.64 | 2.82 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| XLE | XLE moved, but the current phase does not allow downside/short-style fake trades. | rejected | 0.64 | -2.9 | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| XLI | XLI was reviewed as a watchlist movement, but it was not proposed as a fake trade. | approved_for_fake_paper_trade | 0.19 | 1.91 | Risk Desk found no blocking issue under current paper-only rules. | It would need movement strong enough to become a candidate, confidence at or above 0.55. |
| XLP | XLP was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | -0.31 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| XLY | XLY was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.64 | 2.81 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| XLU | XLU was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | -0.71 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| XLRE | XLRE was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | -0.15 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| XLC | XLC was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | 0.51 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| SMH | SMH was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.79 | 5.83 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| IBB | IBB was reviewed as a watchlist movement, but it was not proposed as a fake trade. | approved_for_fake_paper_trade | 0.18 | 1.79 | Risk Desk found no blocking issue under current paper-only rules. | It would need movement strong enough to become a candidate, confidence at or above 0.55. |
| KRE | KRE was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | 0.37 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| KBE | KBE was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | 0 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| OIH | OIH moved, but the current phase does not allow downside/short-style fake trades. | rejected | 0.78 | -5.5 | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| XHB | XHB was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.66 | 3.22 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| XRT | XRT was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.74 | 4.71 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| GDX | GDX was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.12 | 1.22 | n/a | It would need movement strong enough to become a candidate, confidence at or above 0.55. |
| GDXJ | GDXJ was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.61 | 2.11 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| SLV | SLV was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.16 | -1.56 | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| GLD | GLD was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | -0.95 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| TLT | TLT was reviewed as a watchlist movement, but it was not proposed as a fake trade. | approved_for_fake_paper_trade | 0.19 | 1.87 | Risk Desk found no blocking issue under current paper-only rules. | It would need movement strong enough to become a candidate, confidence at or above 0.55. |
| IEF | IEF was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | 0.83 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| SHY | SHY was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | 0.14 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| LQD | LQD was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.11 | 1.06 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| HYG | HYG was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | 0.43 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| EMB | EMB was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.14 | 1.35 | n/a | It would need movement strong enough to become a candidate, confidence at or above 0.55. |
| TIP | TIP was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | 0.77 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| MBB | MBB was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | 0.89 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| EEM | EEM was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.7 | 4.01 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| EFA | EFA was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | 0.51 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| VEA | VEA was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.14 | 1.38 | n/a | It would need movement strong enough to become a candidate, confidence at or above 0.55. |
| VWO | VWO was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.6 | 2.1 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| ARKK | ARKK was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.79 | 5.84 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| ARKW | ARKW was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.63 | 2.58 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| ARKG | ARKG was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.9 | 11.71 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| ARKF | ARKF was reviewed as a watchlist movement, but it was not proposed as a fake trade. | approved_for_fake_paper_trade | 0.18 | 1.79 | Risk Desk found no blocking issue under current paper-only rules. | It would need movement strong enough to become a candidate, confidence at or above 0.55. |
| SOXX | SOXX was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.9 | 8.85 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| TAN | TAN was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.9 | 10.88 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| ICLN | ICLN was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.77 | 5.43 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| XBI | XBI was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.61 | 2.15 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| LABU | LABU was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.85 | 6.94 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| FXI | FXI moved, but the current phase does not allow downside/short-style fake trades. | rejected | 0.62 | -2.41 | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| EWJ | EWJ was reviewed as a watchlist movement, but it was not proposed as a fake trade. | approved_for_fake_paper_trade | 0.15 | 1.53 | Risk Desk found no blocking issue under current paper-only rules. | It would need movement strong enough to become a candidate, confidence at or above 0.55. |
| EWZ | EWZ moved, but the current phase does not allow downside/short-style fake trades. | rejected | 0.62 | -2.33 | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| INDA | INDA was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.13 | 1.34 | n/a | It would need movement strong enough to become a candidate, confidence at or above 0.55. |
| AAPL | AAPL was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.8 | 6 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| MSFT | MSFT was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.69 | 3.81 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| NVDA | NVDA moved, but the current phase does not allow downside/short-style fake trades. | rejected | 0.85 | -6.91 | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| AMZN | AMZN was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.71 | 4.29 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| META | META was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.68 | 3.63 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| GOOGL | GOOGL was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | -0.96 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| GOOG | GOOG was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | 0.53 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| TSLA | TSLA was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.62 | 2.35 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| AVGO | AVGO was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.12 | 1.2 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| JPM | JPM was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.11 | -1.05 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| V | V was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | -0.37 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| JNJ | JNJ was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | 0.01 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| WMT | WMT moved, but the current phase does not allow downside/short-style fake trades. | rejected | 0.9 | -10.25 | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| PG | PG was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.6 | 2.06 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| XOM | XOM moved, but the current phase does not allow downside/short-style fake trades. | rejected | 0.71 | -4.2 | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| UNH | UNH moved, but the current phase does not allow downside/short-style fake trades. | rejected | 0.65 | -3.05 | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| HD | HD was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.82 | 6.5 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| COST | COST moved, but the current phase does not allow downside/short-style fake trades. | rejected | 0.73 | -4.5 | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| MRK | MRK was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.77 | 5.41 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| ABBV | ABBV was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.64 | 2.79 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| CRM | CRM was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.66 | 3.21 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| AMD | AMD was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.9 | 19.69 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| NFLX | NFLX moved, but the current phase does not allow downside/short-style fake trades. | rejected | 0.6 | -2.09 | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| INTC | INTC was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.9 | 8.82 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| BRK.B | BRK.B was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | -0.51 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| LLY | LLY was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.89 | 7.76 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| MA | MA was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | -0.99 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| ORCL | ORCL was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.9 | 10.44 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| ADBE | ADBE was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.11 | -1.14 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| CSCO | CSCO was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | 0.14 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| ACN | ACN was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | 0.12 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| DIS | DIS was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | 0.06 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| PFE | PFE was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | 1.04 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| TMO | TMO was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.9 | 8.57 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| BAC | BAC was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | -0.95 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| KO | KO was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | -0.92 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| PEP | PEP was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.15 | -1.53 | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| ABT | ABT was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.16 | -1.63 | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| TXN | TXN was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.81 | 6.17 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| QCOM | QCOM was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.9 | 14.31 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| AMGN | AMGN was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | -0.23 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| HON | HON was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.7 | 4.09 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| UBER | UBER moved, but the current phase does not allow downside/short-style fake trades. | rejected | 0.69 | -3.78 | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| NKE | NKE was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.85 | 6.97 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| BA | BA was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.7 | 4.07 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| MCD | MCD moved, but the current phase does not allow downside/short-style fake trades. | rejected | 0.61 | -2.16 | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| CAT | CAT was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.62 | 2.43 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| GE | GE was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.82 | 6.46 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| WFC | WFC was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | 0.65 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| RTX | RTX was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.13 | 1.28 | n/a | It would need movement strong enough to become a candidate, confidence at or above 0.55. |
| IBM | IBM was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.73 | 4.68 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| PLD | PLD was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | 0.69 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| AMAT | AMAT was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.76 | 5.21 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| AMD | AMD was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.9 | 19.69 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| MU | MU was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.9 | 22.25 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| NOW | NOW was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.9 | 10.29 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| SYK | SYK moved, but the current phase does not allow downside/short-style fake trades. | rejected | 0.61 | -2.1 | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| LRCX | LRCX was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.78 | 5.65 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| GS | GS was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.6 | 2.03 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| BLK | BLK was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.12 | -1.17 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| ADI | ADI was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.9 | 9.05 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| AXP | AXP was reviewed as a watchlist movement, but it was not proposed as a fake trade. | approved_for_fake_paper_trade | 0.18 | 1.84 | Risk Desk found no blocking issue under current paper-only rules. | It would need movement strong enough to become a candidate, confidence at or above 0.55. |
| BKNG | BKNG was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.82 | 6.35 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| GILD | GILD was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.71 | 4.11 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| VRTX | VRTX was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.66 | 3.22 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| REGN | REGN moved, but the current phase does not allow downside/short-style fake trades. | rejected | 0.67 | -3.32 | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| ISRG | ISRG moved, but the current phase does not allow downside/short-style fake trades. | rejected | 0.69 | -3.8 | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| PANW | PANW was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.61 | 2.27 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| SBUX | SBUX moved, but the current phase does not allow downside/short-style fake trades. | rejected | 0.67 | -3.36 | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| MDLZ | MDLZ was reviewed as a watchlist movement, but it was not proposed as a fake trade. | approved_for_fake_paper_trade | 0.16 | 1.62 | Risk Desk found no blocking issue under current paper-only rules. | It would need movement strong enough to become a candidate, confidence at or above 0.55. |
| SCHW | SCHW moved, but the current phase does not allow downside/short-style fake trades. | rejected | 0.77 | -5.44 | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| C | C was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | -0.26 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| F | F was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.9 | 21.77 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| GM | GM was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.9 | 9.19 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| PYPL | PYPL was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.1 | 0.16 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| SNAP | SNAP was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.68 | 3.68 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| SQ | SQ was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0 | 0 | Signal did not qualify as a candidate. Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. Missing invalidation. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, a clear invalidation/stop condition, no shorting, margin, leverage, options, or futures dependency. |
| DASH | DASH was reviewed as a watchlist movement, but it was not proposed as a fake trade. | rejected | 0.17 | -1.75 | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need movement strong enough to become a candidate, confidence at or above 0.55, an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| RIVN | RIVN was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.86 | 7.28 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| LCID | LCID was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.9 | 10.63 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| PLTR | PLTR was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.73 | 4.55 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| COIN | COIN moved, but the current phase does not allow downside/short-style fake trades. | rejected | 0.8 | -6.03 | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| HOOD | HOOD was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.9 | 11.5 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |
| MSTR | MSTR moved, but the current phase does not allow downside/short-style fake trades. | rejected | 0.9 | -8.24 | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. | It would need an up/long-only direction, no shorting, margin, leverage, options, or futures dependency. |
| TSM | TSM was a possible long-only fake paper candidate. | approved_for_fake_paper_trade | 0.72 | 4.31 | Risk Desk found no blocking issue under current paper-only rules. | It already meets the current paper-only gate. |

## Bot Improvement Notes

- SPY: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- QQQ: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- IWM: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- DIA: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- VTI: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- VOO: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- VXUS: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- BND: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- BNDX: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- VT: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- VB: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- VO: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- VV: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- IVV: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- IJR: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- IJH: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- SCHB: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- SCHX: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- SCHF: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- XLF: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- XLK: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- XLV: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- XLE: Keep downside ideas as observation-only until shorting and leverage are explicitly allowed, which they are not now.
- XLI: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- XLP: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- XLY: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- XLU: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- XLRE: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- XLC: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- SMH: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- IBB: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- KRE: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- KBE: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- OIH: Keep downside ideas as observation-only until shorting and leverage are explicitly allowed, which they are not now.
- XHB: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- XRT: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- GDX: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- GDXJ: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- SLV: Keep downside ideas as observation-only until shorting and leverage are explicitly allowed, which they are not now.
- GLD: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- TLT: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- IEF: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- SHY: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- LQD: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- HYG: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- EMB: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- TIP: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- MBB: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- EEM: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- EFA: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- VEA: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- VWO: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- ARKK: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- ARKW: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- ARKG: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- ARKF: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- SOXX: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- TAN: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- ICLN: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- XBI: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- LABU: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- FXI: Keep downside ideas as observation-only until shorting and leverage are explicitly allowed, which they are not now.
- EWJ: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- EWZ: Keep downside ideas as observation-only until shorting and leverage are explicitly allowed, which they are not now.
- INDA: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- AAPL: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- MSFT: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- NVDA: Keep downside ideas as observation-only until shorting and leverage are explicitly allowed, which they are not now.
- AMZN: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- META: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- GOOGL: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- GOOG: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- TSLA: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- AVGO: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- JPM: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- V: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- JNJ: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- WMT: Keep downside ideas as observation-only until shorting and leverage are explicitly allowed, which they are not now.
- PG: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- XOM: Keep downside ideas as observation-only until shorting and leverage are explicitly allowed, which they are not now.
- UNH: Keep downside ideas as observation-only until shorting and leverage are explicitly allowed, which they are not now.
- HD: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- COST: Keep downside ideas as observation-only until shorting and leverage are explicitly allowed, which they are not now.
- MRK: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- ABBV: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- CRM: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- AMD: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- NFLX: Keep downside ideas as observation-only until shorting and leverage are explicitly allowed, which they are not now.
- INTC: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- BRK.B: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- LLY: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- MA: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- ORCL: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- ADBE: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- CSCO: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- ACN: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- DIS: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- PFE: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- TMO: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- BAC: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- KO: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- PEP: Keep downside ideas as observation-only until shorting and leverage are explicitly allowed, which they are not now.
- ABT: Keep downside ideas as observation-only until shorting and leverage are explicitly allowed, which they are not now.
- TXN: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- QCOM: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- AMGN: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- HON: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- UBER: Keep downside ideas as observation-only until shorting and leverage are explicitly allowed, which they are not now.
- NKE: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- BA: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- MCD: Keep downside ideas as observation-only until shorting and leverage are explicitly allowed, which they are not now.
- CAT: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- GE: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- WFC: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- RTX: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- IBM: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- PLD: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- AMAT: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- AMD: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- MU: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- NOW: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- SYK: Keep downside ideas as observation-only until shorting and leverage are explicitly allowed, which they are not now.
- LRCX: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- GS: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- BLK: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- ADI: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- AXP: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- BKNG: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- GILD: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- VRTX: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- REGN: Keep downside ideas as observation-only until shorting and leverage are explicitly allowed, which they are not now.
- ISRG: Keep downside ideas as observation-only until shorting and leverage are explicitly allowed, which they are not now.
- PANW: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- SBUX: Keep downside ideas as observation-only until shorting and leverage are explicitly allowed, which they are not now.
- MDLZ: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- SCHW: Keep downside ideas as observation-only until shorting and leverage are explicitly allowed, which they are not now.
- C: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- F: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- GM: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- PYPL: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- SNAP: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- SQ: Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.
- DASH: Keep downside ideas as observation-only until shorting and leverage are explicitly allowed, which they are not now.
- RIVN: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- LCID: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- PLTR: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- COIN: Keep downside ideas as observation-only until shorting and leverage are explicitly allowed, which they are not now.
- HOOD: Keep this signal in the watchlist movement panel and compare it against later outcomes.
- MSTR: Keep downside ideas as observation-only until shorting and leverage are explicitly allowed, which they are not now.
- TSM: Keep this signal in the watchlist movement panel and compare it against later outcomes.

## Safety Boundary

No live order, broker execution, real-money action, social post, email, SMS, or deploy is performed by this report.
