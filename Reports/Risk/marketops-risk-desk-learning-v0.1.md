# MarketOps Risk Desk Learning Report v0.1

Generated: 2026-06-08T18:11:15.206Z
Paper Simulation: true
Cycle: cycle-20260530-1322
Cycle Started: 2026-05-30T13:22:04.937Z

## Summary

| Metric | Count |
|---|---:|
| Approved Trades | 18 |
| Rejected Trades | 132 |
| Watched Signals | 65 |
| Shadow Trades Tracked | 132 |
| Possible False Positives (bad_approval) | 4 |
| Possible False Negatives (bad_rejection) | 1 |
| Good Approvals | 0 |
| Bad Approvals | 4 |
| Good Rejections | 29 |
| Bad Rejections / Missed Winners | 1 |
| Inconclusive | 181 |

**Best Decision:** No clear best decision yet.
**Worst Decision:** Rejected SQ: Price moved higher after rejection (bad_rejection_missed_winner).

**Learning Notes:** Risk Desk reviewed 215 total items. 0 good approvals, 4 possible false positives, 29 good rejections, 1 possible false negatives, 181 inconclusive. Learning records built from Cruise 1 cycle data. Most outcomes are still early (positions held less than 1 week).

## Approved Trades

| Symbol | Outcome | P&L % | Plain English |
|---|---:|---:|:---|
| SMH | inconclusive | N/A | Approved but no matching position data yet. Trade may not have been executed. |
| JPM | inconclusive | N/A | Approved but no matching position data yet. Trade may not have been executed. |
| AMD | bad_approval | N/A | Risk Desk approved this trade but it closed at -$0.07 loss (0%). Needs review. |
| WFC | inconclusive | N/A | Approved but no matching position data yet. Trade may not have been executed. |
| IBM | inconclusive | N/A | Approved but no matching position data yet. Trade may not have been executed. |
| AMAT | inconclusive | N/A | Approved but no matching position data yet. Trade may not have been executed. |
| AMD | bad_approval | N/A | Risk Desk approved this trade but it closed at -$0.07 loss (0%). Needs review. |
| MU | inconclusive | N/A | Approved but no matching position data yet. Trade may not have been executed. |
| NOW | inconclusive | N/A | Approved but no matching position data yet. Trade may not have been executed. |
| LRCX | inconclusive | N/A | Approved but no matching position data yet. Trade may not have been executed. |
| GS | inconclusive | N/A | Approved but no matching position data yet. Trade may not have been executed. |
| PANW | bad_approval | N/A | Risk Desk approved this trade but it closed at -$0.03 loss (0%). Needs review. |
| C | inconclusive | N/A | Approved but no matching position data yet. Trade may not have been executed. |
| F | bad_approval | N/A | Risk Desk approved this trade but it closed at -$0.02 loss (0%). Needs review. |
| GM | inconclusive | N/A | Approved but no matching position data yet. Trade may not have been executed. |
| RIVN | inconclusive | N/A | Approved but no matching position data yet. Trade may not have been executed. |
| HOOD | inconclusive | N/A | Approved but no matching position data yet. Trade may not have been executed. |
| TSM | inconclusive | N/A | Approved but no matching position data yet. Trade may not have been executed. |

## Rejected Trades (with Shadow Estimates)

| Symbol | Outcome | Shadow P&L % | Block Reason | Plain English |
|---|---:|---:|:---|:---|
| SPY | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| QQQ | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| IWM | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| DIA | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| VTI | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| VOO | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| VXUS | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| BND | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| BNDX | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| VT | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| VB | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| VO | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| VV | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| IVV | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| IJR | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| IJH | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| SCHB | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| SCHX | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| SCHF | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| XLF | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| XLK | inconclusive | 0.00% | Risk Desk blocked this signal for Phase 1 paper simulation. | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| XLV | inconclusive | 0.00% | Position already open for XLV. | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| XLE | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| XLI | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| XLP | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| XLY | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| XLU | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| XLRE | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| XLC | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| IBB | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| KRE | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| KBE | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| OIH | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| XHB | inconclusive | 0.00% | Position already open for XHB. | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| XRT | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| GDX | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| GDXJ | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| SLV | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| GLD | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| TLT | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| IEF | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| SHY | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| LQD | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| HYG | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| EMB | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| TIP | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| MBB | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| EEM | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| EFA | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| VEA | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| VWO | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| ARKK | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| ARKW | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| ARKG | inconclusive | 0.00% | Position already open for ARKG. | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| ARKF | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| SOXX | inconclusive | 0.00% | Position already open for SOXX. | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| TAN | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| ICLN | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| XBI | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| LABU | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| FXI | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| EWJ | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| EWZ | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| INDA | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| AAPL | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| MSFT | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| NVDA | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| AMZN | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| META | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| GOOGL | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| GOOG | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| TSLA | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| AVGO | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| V | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| JNJ | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| WMT | good_rejection | -0.07% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price has since declined 0.07% (-$0.08 per share). Avoided a losing trade. |
| PG | good_rejection | -0.09% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price has since declined 0.09% (-$0.13 per share). Avoided a losing trade. |
| XOM | good_rejection | -0.01% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price has since declined 0.01% (-$0.02 per share). Avoided a losing trade. |
| UNH | good_rejection | -0.03% | Position already open for UNH. | Risk Desk rejected this trade. Price has since declined 0.03% (-$0.11 per share). Avoided a losing trade. |
| HD | good_rejection | -0.02% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price has since declined 0.02% (-$0.06 per share). Avoided a losing trade. |
| COST | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| MRK | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| ABBV | inconclusive | 0.00% | Position already open for ABBV. | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| CRM | inconclusive | 0.00% | Position already open for CRM. | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| NFLX | inconclusive | 0.01% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price has edged up 0.01% (+$0.01 per share). Movement is minor. |
| INTC | inconclusive | 0.10% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price has edged up 0.1% (+$0.11 per share). Movement is minor. |
| BRK.B | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| LLY | good_rejection | -0.02% | Position already open for LLY. | Risk Desk rejected this trade. Price has since declined 0.02% (-$0.18 per share). Avoided a losing trade. |
| MA | good_rejection | -0.01% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price has since declined 0.01% (-$0.04 per share). Avoided a losing trade. |
| ORCL | inconclusive | 0.00% | Position already open for ORCL. | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| ADBE | good_rejection | -0.04% | Position already open for ADBE. | Risk Desk rejected this trade. Price has since declined 0.04% (-$0.11 per share). Avoided a losing trade. |
| CSCO | inconclusive | 0.10% | Position already open for CSCO. | Risk Desk rejected this trade. Price has edged up 0.1% (+$0.13 per share). Movement is minor. |
| ACN | good_rejection | -0.22% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price has since declined 0.22% (-$0.38 per share). Avoided a losing trade. |
| DIS | good_rejection | -0.02% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price has since declined 0.02% (-$0.02 per share). Avoided a losing trade. |
| PFE | inconclusive | 0.02% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price has edged up 0.02% (+$0.01 per share). Movement is minor. |
| TMO | good_rejection | -0.01% | Position already open for TMO. | Risk Desk rejected this trade. Price has since declined 0.01% (-$0.06 per share). Avoided a losing trade. |
| BAC | good_rejection | -0.02% | Position already open for BAC. | Risk Desk rejected this trade. Price has since declined 0.02% (-$0.01 per share). Avoided a losing trade. |
| KO | good_rejection | -0.05% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price has since declined 0.05% (-$0.04 per share). Avoided a losing trade. |
| PEP | good_rejection | -0.04% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price has since declined 0.04% (-$0.05 per share). Avoided a losing trade. |
| ABT | good_rejection | -0.05% | Position already open for ABT. | Risk Desk rejected this trade. Price has since declined 0.05% (-$0.05 per share). Avoided a losing trade. |
| TXN | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| QCOM | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| AMGN | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| HON | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| UBER | inconclusive | 0.09% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price has edged up 0.09% (+$0.06 per share). Movement is minor. |
| NKE | good_rejection | -0.05% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price has since declined 0.05% (-$0.02 per share). Avoided a losing trade. |
| BA | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| MCD | good_rejection | -0.02% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price has since declined 0.02% (-$0.06 per share). Avoided a losing trade. |
| CAT | inconclusive | 0.00% | Position already open for CAT. | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| GE | inconclusive | 0.02% | Position already open for GE. | Risk Desk rejected this trade. Price has edged up 0.02% (+$0.06 per share). Movement is minor. |
| RTX | good_rejection | -0.01% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price has since declined 0.01% (-$0.01 per share). Avoided a losing trade. |
| PLD | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| SYK | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| BLK | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| ADI | good_rejection | -0.01% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price has since declined 0.01% (-$0.05 per share). Avoided a losing trade. |
| AXP | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| BKNG | good_rejection | -0.04% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price has since declined 0.04% (-$0.07 per share). Avoided a losing trade. |
| GILD | good_rejection | -0.06% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price has since declined 0.06% (-$0.08 per share). Avoided a losing trade. |
| VRTX | inconclusive | 0.00% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| REGN | inconclusive | 0.02% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price has edged up 0.02% (+$0.13 per share). Movement is minor. |
| ISRG | good_rejection | -0.04% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price has since declined 0.04% (-$0.18 per share). Avoided a losing trade. |
| SBUX | good_rejection | -0.03% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price has since declined 0.03% (-$0.03 per share). Avoided a losing trade. |
| MDLZ | good_rejection | -0.11% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price has since declined 0.11% (-$0.07 per share). Avoided a losing trade. |
| SCHW | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| PYPL | good_rejection | -0.16% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price has since declined 0.16% (-$0.06 per share). Avoided a losing trade. |
| SNAP | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| SQ | bad_rejection_missed_winner | N/A% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price has since risen Infinity% (+$86.95 per share). Possible missed winner. |
| DASH | inconclusive | 0.00% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| LCID | good_rejection | -0.19% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price has since declined 0.19% (-$0.01 per share). Avoided a losing trade. |
| PLTR | good_rejection | -0.10% | Signal did not qualify as a candidate.; Phase 1 only allows  | Risk Desk rejected this trade. Price has since declined 0.1% (-$0.13 per share). Avoided a losing trade. |
| COIN | good_rejection | -0.32% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price has since declined 0.32% (-$0.52 per share). Avoided a losing trade. |
| MSTR | good_rejection | -0.13% | Phase 1 only allows long/up paper candidates. Downside, shor | Risk Desk rejected this trade. Price has since declined 0.13% (-$0.16 per share). Avoided a losing trade. |

## Watched Signals

| Symbol | Outcome | Reason Watched |
|---|---:|:---|
| SPY | inconclusive | Signal did not meet movement threshold (-1.15%). |
| QQQ | inconclusive | Signal did not meet movement threshold (-0.79%). |
| IWM | inconclusive | Signal did not meet movement threshold (-1.19%). |
| DIA | inconclusive | Signal did not meet movement threshold (0.33%). |
| VTI | inconclusive | Signal did not meet movement threshold (-0.9%). |
| VOO | inconclusive | Signal did not meet movement threshold (-1.14%). |
| BND | inconclusive | Signal did not meet movement threshold (-0.56%). |
| BNDX | inconclusive | Signal did not meet movement threshold (-0.51%). |
| VB | inconclusive | Signal did not meet movement threshold (-0.42%). |
| VO | inconclusive | Signal did not meet movement threshold (0.29%). |
| VV | inconclusive | Signal did not meet movement threshold (-0.91%). |
| IVV | inconclusive | Signal did not meet movement threshold (-1.14%). |
| IJR | inconclusive | Signal did not meet movement threshold (0.32%). |
| IJH | inconclusive | Signal did not meet movement threshold (0.26%). |
| SCHB | inconclusive | Signal did not meet movement threshold (-0.95%). |
| SCHX | inconclusive | Signal did not meet movement threshold (-0.93%). |
| XLF | inconclusive | Signal did not meet movement threshold (0.2%). |
| XLE | inconclusive | Signal did not meet movement threshold (-0.54%). |
| XLI | inconclusive | Signal did not meet movement threshold (0.32%). |
| SMH | inconclusive | Signal met criteria but no paper position was opened. |
| KRE | inconclusive | Signal did not meet movement threshold (0.69%). |
| KBE | inconclusive | Signal did not meet movement threshold (0.79%). |
| XRT | inconclusive | Signal did not meet movement threshold (0.76%). |
| TLT | inconclusive | Signal did not meet movement threshold (-0.35%). |
| IEF | inconclusive | Signal did not meet movement threshold (-0.73%). |
| SHY | inconclusive | Signal did not meet movement threshold (-0.36%). |
| LQD | inconclusive | Signal did not meet movement threshold (-0.73%). |
| HYG | inconclusive | Signal did not meet movement threshold (-0.74%). |
| EMB | inconclusive | Signal did not meet movement threshold (-0.25%). |
| MBB | inconclusive | Signal did not meet movement threshold (-0.62%). |
| EWJ | inconclusive | Signal did not meet movement threshold (-1.11%). |
| MSFT | inconclusive | Signal did not meet movement threshold (-0.77%). |
| JPM | inconclusive | Signal met criteria but no paper position was opened. |
| JNJ | inconclusive | Signal did not meet movement threshold (-0.68%). |
| WMT | inconclusive | Signal did not meet movement threshold (0.01%). |
| PG | inconclusive | Signal did not meet movement threshold (0.66%). |
| XOM | inconclusive | Signal did not meet movement threshold (-1.05%). |
| AMD | inconclusive | Signal met criteria but no paper position was opened. |
| BRK.B | inconclusive | Signal did not meet movement threshold (0.38%). |
| ACN | inconclusive | Signal did not meet movement threshold (-0.11%). |
| PFE | inconclusive | Signal did not meet movement threshold (-0.75%). |
| AMGN | inconclusive | Signal did not meet movement threshold (0.99%). |
| WFC | inconclusive | Signal met criteria but no paper position was opened. |
| RTX | inconclusive | Signal did not meet movement threshold (0.67%). |
| IBM | inconclusive | Signal met criteria but no paper position was opened. |
| AMAT | inconclusive | Signal met criteria but no paper position was opened. |
| AMD | inconclusive | Signal met criteria but no paper position was opened. |
| MU | inconclusive | Signal met criteria but no paper position was opened. |
| NOW | inconclusive | Signal met criteria but no paper position was opened. |
| LRCX | inconclusive | Signal met criteria but no paper position was opened. |
| GS | inconclusive | Signal met criteria but no paper position was opened. |
| ADI | inconclusive | Signal did not meet movement threshold (-0.46%). |
| AXP | inconclusive | Signal did not meet movement threshold (0.32%). |
| BKNG | inconclusive | Signal did not meet movement threshold (0.2%). |
| VRTX | inconclusive | Signal did not meet movement threshold (0.73%). |
| PANW | inconclusive | Signal met criteria but no paper position was opened. |
| MDLZ | inconclusive | Signal did not meet movement threshold (-0.53%). |
| C | inconclusive | Signal met criteria but no paper position was opened. |
| F | inconclusive | Signal met criteria but no paper position was opened. |
| GM | inconclusive | Signal met criteria but no paper position was opened. |
| SQ | inconclusive | Signal did not meet movement threshold (0%). |
| RIVN | inconclusive | Signal met criteria but no paper position was opened. |
| PLTR | inconclusive | Signal did not meet movement threshold (0.61%). |
| HOOD | inconclusive | Signal met criteria but no paper position was opened. |
| TSM | inconclusive | Signal met criteria but no paper position was opened. |

## Recommendations (All require admin review, none auto-applied)

### rec-risk-001: Review approval criteria for underperforming positions
- **Summary:** 4 approved trade(s) are showing losses. Review whether confidence threshold or entry timing rules need adjustment.
- **Risk Level:** low
- **Auto-apply:** false
- **Requires Admin Review:** true

### rec-risk-002: Review rejection criteria that may have missed winners
- **Summary:** 1 rejected trade(s) have since moved favorably. Review if block rules were appropriate.
- **Risk Level:** low
- **Auto-apply:** false
- **Requires Admin Review:** true

### rec-risk-003: Continue shadow tracking for comprehensive learning
- **Summary:** 132 shadow trades tracked for rejected signals. Continue monitoring to build historical performance baseline.
- **Risk Level:** low
- **Auto-apply:** false
- **Requires Admin Review:** false

## Proposals (Pending Future Review Queue)

### prop-risk-001: Risk Desk learning record system is operational
- **Type:** observation_only
- **Summary:** Risk Desk learning records are now generated each cycle, tracking approved/rejected/watched outcomes and shadow trade estimates.
- **Risk Level:** none
- **Safety Impact:** none
- **Status:** pending_future_review_queue
- **Auto-apply:** false

### prop-risk-002: Consider lowering confidence threshold for high-quality signals
- **Type:** threshold_adjustment
- **Summary:** If shadow tracking shows 1 missed winners with confidence near 0.55, consider adjusting the minimum confidence gate.
- **Risk Level:** low
- **Safety Impact:** none
- **Status:** pending_future_review_queue
- **Auto-apply:** false

## Safety Boundaries

- No active risk rules were changed.
- No recommendations were auto-applied.
- No live trading, broker execution, or real-money action.
- No email, SMS, or social posting was triggered.
- No private or admin data was exposed publicly.
- Paper simulation labels remain visible.
