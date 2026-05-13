# MarketOps Backtesting + Regime Lab v0.1

MarketOps Backtesting + Regime Lab v0.1 is a local-only, paper/simulation-only subsystem. It uses deterministic synthetic historical-style sample periods to test strategy behavior across market regimes.

It does not use live market data, broker connections, API keys, or real-money execution.

## Commands

Run from `Source\marketops-core`:

```powershell
npm run backtest:run
npm run backtest:qa
```

## Outputs

- `Data\backtests\latest-backtest-summary.json`
- `Data\backtests\backtest-run-YYYYMMDD-HHMMSS.json`
- `Reports\Backtesting\marketops-backtesting-regime-lab-v0.1.md`

## Regimes

- trend_up
- trend_down
- choppy_sideways
- panic_drawdown
- low_volatility_drift
- melt_up

## Guardrails

Backtest outputs are synthetic sample previews only. They are not real performance, not live market data, and not financial advice. Any improvement idea still requires paper testing, QA, and human review before a code change.
