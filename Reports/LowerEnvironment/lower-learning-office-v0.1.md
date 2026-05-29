# MarketOps Lower Learning Office v0.1

**Mode:** lower_environment_shadow
**Generated:** 2026-05-26T11:39:11.574Z
**Schema:** marketops-lower-learning-office-v0.1

## Safety Flags

| Flag | Value |
|------|-------|
| productionImpact | false |
| tradeExecutionImpact | false |
| schedulerImpact | false |
| dashboardProductionImpact | false |
| brokerImpact | false |
| publicSiteImpact | false |
| autoPromotionEnabled | false |

## Desk Reports

### operatorDefense

- **Status:** operational
- **Confidence:** 0.6
- **Findings:** 8 item(s)
  - Weather station reports 32/32 symbols stale (100.0%)
  - HIGH STALE RATIO: Over 50% of tracked symbols are stale — late-entry / stale-data risk elevated
  - Signal scan: 150 total signals, 150 low-confidence (<0.4), 150 blocked, 150 no-data
  - HIGH NO-DATA RATIO: Over 50% of signals have no data — pump/chase detection unreliable
  - Open positions: 14 (14 long) — symbols: XLV, XLE, AAPL, MSFT, NVDA, AMD, ORCL, QCOM, PANW, F, TXN, NOW, ADI, LCID
  - Risk decisions: 150 total, 0 approved, 150 rejected
  - Rolling history: 99920 bars across 32 symbols
  - Operator defense confidence: 60% (based on 5 checks, 2 risk flags)
- **Summary:** 2 operator risk flag(s) detected. Review findings for details.

## Operator Defense Desk v0.1 — Lower Environment

### Spoofing / Layering Detection

- Detection available: false
- Note: Level 2/order-book data not available; spoofing/layering detection not active in v0.1.

### Weather Station Analysis

- Symbols tracked: 32
- Stale symbols: 32
- Stale ratio: 100.0%

### Signal Analysis

- Total signals: 150
- Low-confidence signals: 150
- Blocked signals: 150
- No-data signals: 150

### Open Positions

- Total open positions: 14
- Long positions: 14
- Symbols: XLV, XLE, AAPL, MSFT, NVDA, AMD, ORCL, QCOM, PANW, F, TXN, NOW, ADI, LCID

### Risk Decision Analysis

- Total decisions: 150
- Approved: 0
- Rejected: 150

### Rolling History Analysis

- Total bars: 99920
- Unique symbols: 32
- Large moves (>5%): 0 (0.0%)

### Risk Flags Summary

- Total checks performed: 5
- Risk flags raised: 2
- Overall confidence: 60%

### Data Availability

- Fields available: weatherStation, signalScan, paperPositions, riskDecisions, rollingHistory
- Data limitations: 0

---
*Operator Defense Desk is a lower-environment/shadow-mode component. No production systems were modified.*

### marketRegime

- **Status:** operational
- **Confidence:** 0.9
- **Findings:** 3 item(s)
  - Low average signal confidence suggests weak market conviction
  - Regime labels: chop, high_volatility, low_volume, risk_off
  - Confidence: 90% (based on 4/4 data sources)
- **Summary:** Market regime classified as cautious/bearish. Confidence limited by available data.

## Market Regime Desk v0.1 — Lower Environment

### Regime Labels

- **chop**
- **high_volatility**
- **low_volume**
- **risk_off**

### Label Reasoning

- Close prices relatively flat (trend -0.31% — below 2% threshold)
- Average intra-bar volatility 47.02% (>3% threshold)
- Recent volumes low (avg 668 units)
- High stale data ratio (100%) suggests risk-off conditions

### Signal Context

- Total signals: 150
- High-confidence signals (>0.5): 0

- Average signal confidence: 0.000
### Risk Decision Context

- Total decisions: 150
- Approved: 0
- Approval rate: 0.0%

### Summary

- Regime labels: chop, high_volatility, low_volume, risk_off
- Confidence: 90%
- Data sources available: 4/4
- Data limitations: 0

---
*Market Regime Desk is a lower-environment/shadow-mode component. No production systems were modified.*

### dataQuality

- **Status:** operational
- **Quality Score:** 80
- **Findings:** 1 item(s)
  - Dashboard refresh health: FAIL (10 consecutive failures, reason: npm run marketdata:refresh failed: Alpaca data request failed with HTTP 429.)
- **Summary:** Data quality is acceptable. Some issues found but within tolerance.

## Data Quality Desk v0.1 — Lower Environment

### Dashboard Bundle Quality

- Equity curve points: 23
- Invalid timestamps: None
- Negative balances: None
- Duplicate timestamps: None

### Dashboard Health Quality

- Status: FAIL
- Consecutive failures: 10
- Last successful: 2026-05-21T14:01:39.855Z
- Stale warning: Last successful refresh was 116.2 hours ago (target: 2 hours)

### Rolling History Quality

- Total bars: 99920
- Unique symbols: 32
- Null closes: 0
- Zero volumes: 0
- Extreme jumps (>50%): 0

### Signal Scan Quality

- Total signals: 150
- Missing required fields: 0

### Performance Data Quality

- Cash balance: 52.92
- Total equity: 52.92
- Max drawdown: 94.71

### Quality Summary

- Checks performed: 5
- Checks passed: 8
- Issues flagged: 1
- Quality score: 80/100

Data quality is acceptable. Some issues found but within tolerance.

---
*Data Quality Desk is a lower-environment/shadow-mode component. It does not block production systems.*

### performanceAttribution

- **Status:** operational
- **Confidence:** 0.7999999999999999
- **Findings:** 4 item(s)
  - Daily trade count > 0 but realized P&L is $0 — possible attribution gap
  - High max drawdown (94.71%) — significant risk event in window
  - Position concentration: top symbols — XLV(1), XLE(1), AAPL(1), MSFT(1), NVDA(1)
  - No executed trades recorded — cannot perform trade outcome attribution.
- **Data Limitations:**
  - Sector mapping data not available; sector-level attribution skipped.
- **Summary:** Performance attribution completed across 4 dimension(s). Account equity: $52.92.

## Performance Attribution Desk v0.1 — Lower Environment

### Performance Overview

- Starting cash: $1000
- Cash balance: $52.92
- Realized P&L: $0
- Unrealized P&L: $0
- Total equity: $52.92
- Max drawdown: 94.71%
- Daily trade count: 8

### Position-Level Attribution

- Open positions: 14

| Symbol | Side | Entry Price | Quantity | Unrealized P&L | Unrealized % | Band |
|--------|------|-------------|----------|----------------|--------------|------|
| XLV | long | $147.88 | 1.69056 | $0.00 | 0.00% | approved_standard |
| XLE | long | $59.13 | 1.109937 | $0.00 | 0.00% | approved_learning_probe |
| AAPL | long | $304.67 | 0.561571 | $0.00 | 0.00% | approved_standard |
| MSFT | long | $419.2 | 0.306111 | $0.00 | 0.00% | approved_standard |
| NVDA | long | $220.9 | 0.435672 | $0.00 | 0.00% | approved_standard |
| AMD | long | $470.93 | 0.153271 | $0.00 | 0.00% | approved_standard |
| ORCL | long | $196.55 | 0.275426 | $-0.01 | -0.01% | approved_standard |
| QCOM | long | $226.28 | 0.179429 | $0.00 | 0.00% | approved_standard |
| PANW | long | $256.17 | 0.11887 | $0.00 | 0.00% | approved_standard |
| F | long | $14.18 | 1.611161 | $0.01 | 0.03% | approved_standard |
| TXN | long | $309.9 | 0.013817 | $0.00 | 0.04% | approved_learning_probe |
| NOW | long | $103.94 | 0.038621 | $0.00 | 0.11% | approved_learning_probe |
| ADI | long | $397.02 | 0.009479 | $0.00 | 0.09% | approved_learning_probe |
| LCID | long | $5.94 | 0.593966 | $0.00 | -0.05% | approved_learning_probe |


### Equity Curve Attribution

- Equity points: 0

### Sector Attribution (Experimental)

- Symbols held: XLV, XLE, AAPL, MSFT, NVDA, AMD, ORCL, QCOM, PANW, F, TXN, NOW, ADI, LCID
- Note: Sector mapping not available in v0.1. Symbols listed for manual sector lookup.

### Trade Outcome Attribution

- Executed trades: 0
- Ledger entries: 0
- Trade records: 0

### Risk Desk Learning Attribution

- Approved learning trades: 2
- Outcome distribution: {"inconclusive":2}

### Summary

- Confidence: 80%
- Attribution dimensions available: 4
- Data limitations: 1

Performance attribution completed across 4 dimension(s). Account equity: $52.92.

---
*Performance Attribution Desk is a lower-environment/shadow-mode component. No production systems were modified.*

### replayBacktest

- **Status:** operational
- **Confidence:** 0.2
- **Findings:** 2 item(s)
  - Limited replay to first 5 symbols (32 total available) for v0.1 scope.
  - Replayed 20 strategy-symbol combinations.
- **Summary:** Replay/Backtest Lab completed 20 simulation(s) across 4 strategies and limited symbols. Results are advisory only and not predictive proof.

## Replay / Backtest Lab v0.1 — Lower Environment

### Data Summary

- Total bars: 99920
- Unique symbols: 32
- Date range: 2026-05-11T12:05:00Z to 2026-05-22T15:59:00Z
- Initial cash per strategy: $1000

### Strategy Simulations

**Note:** Simulations are simplified and deterministic. Results are for observation only, not predictive proof.

#### Symbol: AAPL (3798 bars)

| Strategy | Trades | Return % | Max DD % | Win Rate | Sharpe |
|----------|--------|----------|----------|----------|--------|
| trend_following | 0 | 0% | 0% | 0 | 0 |
| mean_reversion | 0 | 0% | 0% | 0 | 0 |
| breakout_confirmation | 0 | 0% | 0% | 0 | 0 |
| pullback_entry | 0 | 0% | 0% | 0 | 0 |

#### Symbol: ABBV (2334 bars)

| Strategy | Trades | Return % | Max DD % | Win Rate | Sharpe |
|----------|--------|----------|----------|----------|--------|
| trend_following | 0 | 0% | 0% | 0 | 0 |
| mean_reversion | 0 | 0% | 0% | 0 | 0 |
| breakout_confirmation | 0 | 0% | 0% | 0 | 0 |
| pullback_entry | 0 | 0% | 0% | 0 | 0 |

#### Symbol: AMD (3159 bars)

| Strategy | Trades | Return % | Max DD % | Win Rate | Sharpe |
|----------|--------|----------|----------|----------|--------|
| trend_following | 4 | -2.87% | 6.74% | 0.5 | 0 |
| mean_reversion | 3 | 5.74% | 10.21% | 0.667 | 0 |
| breakout_confirmation | 1 | 9.72% | 3.75% | 1 | 0 |
| pullback_entry | 1 | 8.55% | 10.21% | 1 | 0 |

#### Symbol: AMZN (3280 bars)

| Strategy | Trades | Return % | Max DD % | Win Rate | Sharpe |
|----------|--------|----------|----------|----------|--------|
| trend_following | 0 | 0% | 0% | 0 | 0 |
| mean_reversion | 0 | 0% | 0% | 0 | 0 |
| breakout_confirmation | 0 | 0% | 0% | 0 | 0 |
| pullback_entry | 0 | 0% | 0% | 0 | 0 |

#### Symbol: AVGO (3297 bars)

| Strategy | Trades | Return % | Max DD % | Win Rate | Sharpe |
|----------|--------|----------|----------|----------|--------|
| trend_following | 1 | 0.02% | 1.82% | 1 | 0 |
| mean_reversion | 1 | -3.32% | 5.94% | 0 | 0 |
| breakout_confirmation | 1 | -1.31% | 1.82% | 0 | 0 |
| pullback_entry | 1 | -3.32% | 5.94% | 0 | 0 |

### Paper Trade Replay (Experimental)

- Executed trades (historical): 0
- Ledger entries: 0
- Note: Paper trade replay requires sequential historical state. v0.1 replays OHLCV bars only.

### Assumptions

- Sliding window of 20 bars used for strategy signal generation (approximate).
- Execution at close prices of each bar (no slippage model).
- Full position entry/exit (no fractional sizing beyond what price allows).
- No transaction costs modeled.
- No liquidity constraints modeled.
- Results are deterministic from the same input data.
- This is NOT predictive proof — it is a simplified replay for observation only.

### Limitations

- Only first 5 symbols simulated; remaining symbols available for expanded runs.
- Simplified strategy logic — not representative of MarketOps production signal/risk pipeline.
- No transaction costs, slippage, or liquidity modeling.

### Summary

- Simulations run: 20
- Simulations with trades: 8
- Confidence: 20%
- Sample size: 99920 bars
- Date range: 2026-05-11T12:05:00Z to 2026-05-22T15:59:00Z

Replay/Backtest Lab completed 20 simulation(s) across 4 strategies and limited symbols. Results are advisory only and not predictive proof.

---
*Replay/Backtest Lab is a lower-environment/shadow-mode component. No production systems were modified.*

### strategyTournament

- **Status:** operational
- **Confidence:** 0.7
- **Findings:** 3 item(s)
  - Top-ranked strategy: breakout_confirmation (avg return 1.68%)
  - Total strategy-symbol combinations scored: 35
  - Defensive/cash-preservation strategy ranked #5 — negative return
- **Summary:** Strategy tournament completed. Top-ranked: breakout_confirmation. All results are advisory only — no winner will be auto-promoted.

## Strategy Tournament Desk v0.1 — Lower Environment

**Labels:** ADVISORY ONLY — No winner will be auto-promoted.

### Tournament Data

- Total bars: 99920
- Symbols available: 32
- Strategy families: 7
- Initial capital per strategy: $1,000

#### AAPL — Tournament Results

| Strategy | Return % | Trades | Win Rate | Max DD % |
|----------|----------|--------|----------|----------|
| baseline_current_behavior | 0% | 0 | 0 | 0% |
| trend_following | 0% | 0 | 0 | 0% |
| mean_reversion | 0% | 0 | 0 | 0% |
| breakout_confirmation | 0% | 0 | 0 | 0% |
| pullback_entry | 0% | 0 | 0 | 0% |
| operator_defense_filtered | 0% | 0 | 0 | 0% |
| defensive_cash_preservation | 0% | 0 | 0 | 0% |

#### ABBV — Tournament Results

| Strategy | Return % | Trades | Win Rate | Max DD % |
|----------|----------|--------|----------|----------|
| baseline_current_behavior | 0% | 0 | 0 | 0% |
| trend_following | 0% | 0 | 0 | 0% |
| mean_reversion | 0% | 0 | 0 | 0% |
| breakout_confirmation | 0% | 0 | 0 | 0% |
| pullback_entry | 0% | 0 | 0 | 0% |
| operator_defense_filtered | 0% | 0 | 0 | 0% |
| defensive_cash_preservation | 0% | 0 | 0 | 0% |

#### AMD — Tournament Results

| Strategy | Return % | Trades | Win Rate | Max DD % |
|----------|----------|--------|----------|----------|
| baseline_current_behavior | 0% | 0 | 0 | 0% |
| trend_following | -2.87% | 4 | 0.5 | 6.87% |
| mean_reversion | 5.74% | 3 | 0.667 | 10.21% |
| breakout_confirmation | 9.72% | 1 | 1 | 3.75% |
| pullback_entry | 8.55% | 1 | 1 | 10.21% |
| operator_defense_filtered | 2.71% | 1 | 1 | 14.2% |
| defensive_cash_preservation | 0% | 0 | 0 | 0% |

#### AMZN — Tournament Results

| Strategy | Return % | Trades | Win Rate | Max DD % |
|----------|----------|--------|----------|----------|
| baseline_current_behavior | 0% | 0 | 0 | 0% |
| trend_following | 0% | 0 | 0 | 0% |
| mean_reversion | 0% | 0 | 0 | 0% |
| breakout_confirmation | 0% | 0 | 0 | 0% |
| pullback_entry | 0% | 0 | 0 | 0% |
| operator_defense_filtered | 0% | 0 | 0 | 0% |
| defensive_cash_preservation | 0% | 0 | 0 | 0% |

#### AVGO — Tournament Results

| Strategy | Return % | Trades | Win Rate | Max DD % |
|----------|----------|--------|----------|----------|
| baseline_current_behavior | 0% | 0 | 0 | 0% |
| trend_following | 0.02% | 1 | 1 | 1.82% |
| mean_reversion | -3.32% | 1 | 0 | 5.94% |
| breakout_confirmation | -1.31% | 1 | 0 | 1.82% |
| pullback_entry | -3.32% | 1 | 0 | 5.94% |
| operator_defense_filtered | -3.3% | 1 | 0 | 8.17% |
| defensive_cash_preservation | 0% | 0 | 0 | 0% |

### Overall Ranking (Advisory)

| Rank | Strategy | Avg Return % | Total Trades |
|------|----------|-------------|--------------|
| 1 | breakout_confirmation | 1.68% | 2 |
| 2 | pullback_entry | 1.05% | 2 |
| 3 | mean_reversion | 0.48% | 4 |
| 4 | baseline_current_behavior | 0% | 0 |
| 5 | defensive_cash_preservation | 0% | 0 |
| 6 | operator_defense_filtered | -0.12% | 2 |
| 7 | trend_following | -0.57% | 5 |

*Ranking is advisory only. No strategy will be auto-promoted.*

### Context from Existing Pipeline

- Signal scan: 150 signals available for reference.
- Risk decisions: 150 decisions available for reference.
- Note: Tournament uses simplified OHLCV-only strategies, not the full MarketOps signal/risk pipeline.

### Limitations

- Tournament limited to first 5 symbols for v0.1 scope.
- Simplified OHLCV-only strategies — not representative of full MarketOps pipeline.
- No transaction costs, slippage, or liquidity modeled.
- Ranking is statistical only and may not persist across different market conditions.

### Summary

- Families evaluated: 7
- Ranking produced: yes
- Confidence: 70%
- Auto-promotion: DISABLED

Strategy tournament completed. Top-ranked: breakout_confirmation. All results are advisory only — no winner will be auto-promoted.

---
*Strategy Tournament Desk is a lower-environment/shadow-mode component. No production systems were modified.*

### riskBudget

- **Status:** operational
- **Confidence:** 0.8
- **Findings:** 6 item(s)
  - Performance: max drawdown 94.71%, equity $52.92, cash $52.92
  - Open positions: 14
  - Weather station: 100% stale symbols — elevated risk warning
  - Low average signal confidence (0.00) suggests elevated uncertainty
  - Risk budget recommendations produced: 5
  - Active config NOT modified — verified.
- **Summary:** HIGH DRAWDOWN (94.71%) — Advisory recommends significantly reduced exposure limits. Defensive posture advised.

## Risk Budget Desk v0.1 — Lower Environment

**ADVISORY ONLY** — No active configuration is modified.

### Risk Budget Recommendations (Advisory Only)

| Parameter | Recommended | Reasoning |
|-----------|-------------|-----------|
| Max open positions | 2 | Drawdown 94.71% suggests reduced position limits |
| Max daily trades | 5 | Reduced to limit further drawdown |
| Max daily loss | 1.6% | Tighter loss limit given existing drawdown |
| Max position size | 8% | Reduced position sizing recommended |
| New entries | Exercise caution | 14 existing positions |
| Risk mode | DEFENSIVE | Elevated operator defense warnings |
| Position sizing | Reduce by 25-50% | Elevated volatility / low confidence |

*All recommendations are advisory only. No active configuration has been modified.*

### Summary

- Recommendations: 5
- Drawdown: 94.71%
- Open positions: 14
- Operator warning level: elevated
- Volatility assessment: elevated
- Confidence: 80%
- Active config modified: false (verified)

HIGH DRAWDOWN (94.71%) — Advisory recommends significantly reduced exposure limits. Defensive posture advised.

---
*Risk Budget Desk is a lower-environment/shadow-mode component. No active configuration was modified.*

### learningGovernor

- **Status:** operational
- **Confidence:** 1
- **Findings:** 10 item(s)
  - Guardrail check: All desks lower-environment/shadow — PASS
  - Guardrail check: No production impact flags — PASS
  - Guardrail check: No public dashboard bundles modified by learning office — PASS
  - Guardrail check: No scheduler/live/broker changes — PASS
  - Guardrail check: No payment/SMS/email/social changes — PASS
  - Guardrail check: Proposals are review-only (not auto-applied) — PASS
  - Public bundle dashboard-bundle-public-v0.4.json exists and was NOT modified.
  - Public bundle dashboard-bundle-public-v0.5.json exists and was NOT modified.
  - No scheduler/systemd files created or modified — PASS.
  - Broker/live config flags all disabled — verified.
- **Summary:** All guardrails verified. Learning office is lower-environment only, no production impact detected.

## Learning Governor / Promotion Gatekeeper v0.1

### Guardrail Verification Summary

| Guardrail | Status |
|-----------|--------|
| All desks lower-environment/shadow | PASS |
| No production impact flags | PASS |
| No public dashboard bundles modified by learning office | PASS |
| No scheduler/live/broker changes | PASS |
| No payment/SMS/email/social changes | PASS |
| Proposals are review-only (not auto-applied) | PASS |

### Public Dashboard Bundle Check

- dashboard-bundle-public-v0.4.json: EXISTS (363870 bytes, last modified 2026-05-26T10:15:57.367Z) — NOT modified by learning office
- dashboard-bundle-public-v0.5.json: EXISTS (363870 bytes, last modified 2026-05-26T10:15:57.365Z) — NOT modified by learning office

### Scheduler / Systemd Check

- No scheduler/systemd timer files found — verified no changes.

### Live / Broker / Alpaca Check

- No broker/live trading flags enabled — PASS.

### Payment / SMS / Email / Social Check

- Email prep module exists (src/emailprep/) — verified not enabled by learning office
- Social module exists (src/social/) — verified not enabled by learning office
- Payment/SMS automation: Not available in codebase — verified.
- Social posting automation: Not enabled by learning office — verified.

### Desk Review

- **operatorDefense**: shadow-mode verified | status=operational | findings=8 | dataLimitations=none
- **marketRegime**: shadow-mode verified | status=operational | findings=3 | dataLimitations=none
- **dataQuality**: shadow-mode verified | status=operational | findings=1 | dataLimitations=none
- **performanceAttribution**: shadow-mode verified | status=operational | findings=4 | dataLimitations=yes
- **replayBacktest**: shadow-mode verified | status=operational | findings=2 | dataLimitations=none
- **strategyTournament**: shadow-mode verified | status=operational | findings=3 | dataLimitations=none
- **riskBudget**: shadow-mode verified | status=operational | findings=6 | dataLimitations=none

### Promotion Proposals (Review Only)

- v0.1 Learning Office — Initial observation period. Recommend continued observation before any promotion.
- Operator Defense Desk: Consider adding order-book data source for v0.2 to enable spoofing/layering detection.
- Market Regime Desk: Consider adding VIX or broad market index data for improved regime classification.
- Data Quality Desk: Issues found should be reviewed before relying on affected data for decisions.
- Performance Attribution: Consider adding sector mapping and entry/exit reason tracking for v0.2.
- Replay Lab: Expand to full symbol set and add transaction cost model for v0.2.
- Strategy Tournament: Results are statistical only. Do not auto-promote any strategy based on v0.1 data alone.
- Risk Budget: Drawdown is significant. Consider reviewing risk parameters before next cycle.
- No proposals will be automatically applied. All require human review.

### Governor Verdict

**ALL GUARDRAILS PASSED.** Lower learning office v0.1 is operating within safe parameters.

---
*Learning Governor is a lower-environment/shadow-mode component. No proposals were auto-applied.*

## Behavior Comparison

Lower-environment shadow comparison. No production baseline compared — all desks are advisory-only.

## Promotion Proposals

- v0.1 Learning Office — Initial observation period. Recommend continued observation before any promotion.
- Operator Defense Desk: Consider adding order-book data source for v0.2 to enable spoofing/layering detection.
- Market Regime Desk: Consider adding VIX or broad market index data for improved regime classification.
- Data Quality Desk: Issues found should be reviewed before relying on affected data for decisions.
- Performance Attribution: Consider adding sector mapping and entry/exit reason tracking for v0.2.
- Replay Lab: Expand to full symbol set and add transaction cost model for v0.2.
- Strategy Tournament: Results are statistical only. Do not auto-promote any strategy based on v0.1 data alone.
- Risk Budget: Drawdown is significant. Consider reviewing risk parameters before next cycle.
- No proposals will be automatically applied. All require human review.

## Data Limitations

- config not found at /home/sjohnsoniii/Projects/MarketOps/Source/marketops-core/src/config/marketops.phase1.config.json
- Sector mapping data not available; sector-level attribution skipped.

---
*This report is a lower-environment/shadow-mode output. Do not use for production decisions.*
