# MarketOps Metrics + Performance Analytics v0.1

Generated at: 2026-05-08T03:46:14.425Z

## Safety + Scope

This analytics layer uses local paper/sample data and deterministic synthetic regime outputs only. It is not live market data, not real trading performance, not financial advice, and not a prompt to copy any trade.

## Paper Equity Analytics

- Starting paper equity: 10000
- Ending paper equity: 9934.92
- Paper P/L: -65.08
- Paper return: -0.65%
- Max paper drawdown: -0.65%
- Step volatility: 0.16%
- Sharpe-like placeholder: -2.03
- Risk-adjusted paper score: 42.4

Current sample paper drawdown is small, but the data set is too limited for confidence.

## Paper Trade Analytics

| Sequence | Vehicle | Outcome | Paper P/L | Paper Return |
|---:|---|---|---:|---:|
| 1 | NVDA | loss | -16.54 | -1.55% |
| 2 | SOL | loss | -48.54 | -4.76% |

- Win rate: 0%
- Longest win streak: 0
- Longest loss streak: 2
- Average paper trade P/L: -32.54
- Worst paper trade P/L: -48.54

## Regime Comparison Analytics

| Synthetic Regime | Paper Strategy Return | Synthetic Period Drawdown | Sample Events | Win Rate | Regime Score |
|---|---:|---:|---:|---:|---:|
| trend_up | 3.57% | -0.12% | 4 | 100% | 82.1 |
| trend_down | 0% | -5.62% | 0 | 0% | 46 |
| choppy_sideways | 0% | -0.67% | 0 | 0% | 46 |
| panic_drawdown | 0% | -15.35% | 0 | 0% | 42 |
| low_volatility_drift | 0% | -0.02% | 0 | 0% | 46 |
| melt_up | 14.49% | -0.55% | 5 | 100% | 100 |

- Strongest paper regime: melt_up
- Weakest paper regime: panic_drawdown
- Worst synthetic drawdown regime: panic_drawdown
- Inactive regimes: trend_down, choppy_sideways, panic_drawdown, low_volatility_drift
- Average benchmark comparison placeholder: 1.47%

## Drawdown Observations

- Paper account drawdown is currently -0.65% across 3 equity points.
- The worst synthetic regime drawdown came from panic_drawdown.
- Drawdown metrics are diagnostic only because all inputs are paper/sample or synthetic.

## Overfitting Warnings

- Synthetic regimes are deterministic samples, not evidence of durable edge.
- Strong scores in melt-up or trend-up samples can overstate readiness if choppy and panic regimes stay inactive.
- Any metric improvement must move through paper test, QA, and human review before changing production behavior.
- The current paper trade sample is too small for confidence.
- Benchmark comparisons are placeholders from deterministic synthetic regimes.

## Next Useful Improvements

- Add longer paper histories before trusting streak or volatility metrics.
- Add more synthetic transition regimes, especially noisy reversal periods.
- Compare multiple paper-only strategy harnesses before promoting any experiment.
- Keep all changes review-gated and QA-checked before they affect production behavior.
