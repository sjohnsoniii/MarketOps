# MarketOps Backtesting + Regime Lab v0.1

Generated at: 2026-05-08T03:01:37.909Z

## Synthetic-Data Disclaimer

This is a paper/simulation-only backtesting lab using deterministic synthetic historical-style sample data. It is not live market data, not real historical market data, not real performance, and not financial advice.

## Regimes Tested

- trend_up
- trend_down
- choppy_sideways
- panic_drawdown
- low_volatility_drift
- melt_up

## Strategy Behavior By Regime

| Period | Classified Regime | Strategy Return | Max Drawdown | Sample Events | Win Rate | Regime Score | Readiness Note |
|---|---:|---:|---:|---:|---:|---:|---|
| synthetic-trend-up-v0.1 | trend_up | 3.57% | 0% | 4 | 100% | 82.1 | PASS_FOR_INFRASTRUCTURE_REVIEW_ONLY |
| synthetic-trend-down-v0.1 | trend_down | 0% | 0% | 0 | 0% | 46 | FAIL_FOR_STRATEGY_READINESS |
| synthetic-choppy-sideways-v0.1 | choppy_sideways | 0% | 0% | 0 | 0% | 46 | FAIL_FOR_STRATEGY_READINESS |
| synthetic-panic-drawdown-v0.1 | panic_drawdown | 0% | 0% | 0 | 0% | 42 | FAIL_FOR_STRATEGY_READINESS |
| synthetic-low-volatility-drift-v0.1 | low_volatility_drift | 0% | 0% | 0 | 0% | 46 | FAIL_FOR_STRATEGY_READINESS |
| synthetic-melt-up-v0.1 | melt_up | 14.49% | 0% | 5 | 100% | 100 | PASS_FOR_INFRASTRUCTURE_REVIEW_ONLY |

## Strongest Synthetic Regime

melt_up produced the highest infrastructure score (100). This means the simple paper harness behaved most cleanly in that synthetic condition. It does not mean the strategy is ready for real capital.

## Weakest Synthetic Regime

panic_drawdown produced the weakest score (42). Review the warning list before promoting any experiment.

## Drawdown Notes

- trend_up: strategy max drawdown 0%; synthetic period drawdown -0.12%.
- trend_down: strategy max drawdown 0%; synthetic period drawdown -5.62%.
- choppy_sideways: strategy max drawdown 0%; synthetic period drawdown -0.67%.
- panic_drawdown: strategy max drawdown 0%; synthetic period drawdown -15.35%.
- low_volatility_drift: strategy max drawdown 0%; synthetic period drawdown -0.02%.
- melt_up: strategy max drawdown 0%; synthetic period drawdown -0.55%.

## Overfitting Warnings

- Synthetic sample periods are intentionally small.
- Any improvement from this lab must be treated as a paper-only idea.
- No parameter change should be promoted without QA and human review.
- This report should never be used as a performance claim.

## What This Means

The lab can now run a repeatable sample strategy across multiple synthetic regimes, score behavior, and identify weak conditions. That is infrastructure progress.

## What This Does Not Mean

It does not prove profitability, readiness for live execution, or suitability for anyone to follow. It does not use live market data.

## Next Recommended Improvements

- Add more deterministic sample periods.
- Add rolling regime transitions instead of isolated periods.
- Compare multiple paper-only strategy harnesses.
- Add a QA check that prevents public dashboard claims from referencing backtest scores as performance.
