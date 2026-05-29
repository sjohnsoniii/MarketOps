# Cruise 3: Risk Desk Learning Records

**Date:** 2026-05-19  
**Status:** Built (observation-only, no rules changed)  

---

## Summary

Built Risk Desk learning records that track approved trades, rejected trades (with shadow estimates), and watched signals so the Risk Desk can learn from paper-trading outcomes instead of only blocking trades.

**No active risk rules were changed.**  
**No recommendations were auto-applied.**  
**No live trading, broker execution, or public publishing.**

---

## New Source Files

| File | Purpose |
|------|---------|
| `src/risk/riskDeskLearningBuilder.js` | Core builder: loads data sources, builds approvedTrades, rejectedTrades, watchedSignals, shadowTrades, summary, recommendations, proposals |
| `src/risk/runRiskDeskLearning.js` | Runner: calls builder, writes JSON + markdown report |
| `src/risk/runRiskDeskLearningQa.js` | QA: 222 structural and safety checks |

## New npm Scripts

| Script | Command |
|--------|---------|
| `risk:learning` | `node src/risk/runRiskDeskLearning.js` |
| `risk:learning:qa` | `node src/risk/runRiskDeskLearningQa.js` |

---

## Output Paths

| Artifact | Path |
|----------|------|
| JSON Learning Records | `Data/paper/risk/risk-desk-learning-v0.1.json` |
| Markdown Report | `Reports/Risk/marketops-risk-desk-learning-v0.1.md` |
| QA Report | `Reports/Risk/marketops-risk-desk-learning-qa-v0.1.md` |

---

## Approved Trade Learning Summary

| Symbol | Outcome | P&L % | Notes |
|--------|---------|------:|-------|
| XLE | good_approval | +1.17% | Position up, performing well |
| MSFT | too_early | -1.41% | Slightly down, may recover |
| NVDA | too_early | -0.44% | Slightly down, may recover |
| XLV | inconclusive | N/A | Approved, not yet executed |
| AAPL | inconclusive | N/A | Approved, not yet executed |
| JNJ | inconclusive | N/A | Approved, not yet executed |
| WMT | inconclusive | N/A | Approved, not yet executed |
| XOM | inconclusive | N/A | Approved, not yet executed |
| COST | inconclusive | N/A | Approved, not yet executed |
| MRK | inconclusive | N/A | Approved, not yet executed |
| ABBV | inconclusive | N/A | Approved, not yet executed |
| NFLX | inconclusive | N/A | Approved, not yet executed |

**7 of 12** approved trades not yet executed — only 5 positions exist in the paper portfolio.

---

## Rejected/Shadow Trade Learning Summary

| Outcome | Count | Examples |
|---------|:-----:|----------|
| good_rejection (avoided loss) | 4 | IWM, XLK, V, INTC |
| bad_rejection_missed_winner | 4 | META, GOOGL, AMD, TSLA |
| inconclusive | 12 | SPY, QQQ, DIA, VTI, etc. |

**Top missed winners:** META (+5.4% shadow), TSLA (+3.41% shadow), GOOGL, AMD. All blocked for confidence below 0.55.

**Top avoided losses:** IWM (-0.39%), XLK (-0.6%), V (-0.16%), INTC (-0.26%).

---

## Possible False Positives

**Count:** 0

All 5 executed positions are either green or only slightly down (<1.5%). No bad approvals detected yet.

---

## Possible False Negatives

**Count:** 4

| Symbol | Shadow P&L | Block Reason |
|--------|:----------:|--------------|
| META | +5.4% | confidence 0.15, direction_bias_not_up |
| TSLA | +3.41% | confidence 0.35, direction_bias_not_up |
| GOOGL | +2.25% | confidence 0.35, direction_bias_not_up |
| AMD | +2.11% | confidence 0.55, direction_bias_not_up |

These signals were blocked primarily for low confidence and non-up direction bias. The AMD rejection at 0.55 confidence is notable — it was at the threshold but still blocked.

---

## Generated Recommendations

| ID | Title | Auto-Apply | Requires Review |
|----|-------|:----------:|:---------------:|
| rec-risk-001 | Review approval criteria for underperforming positions | false | true |
| rec-risk-002 | Review rejection criteria that may have missed winners | false | true |
| rec-risk-003 | Continue shadow tracking for comprehensive learning | false | false |

## Generated Proposals

| ID | Type | Status |
|----|------|--------|
| prop-risk-001 | observation_only | pending_future_review_queue |
| prop-risk-002 | threshold_adjustment | pending_future_review_queue |

**No rules were auto-applied. All require admin review.**

---

## QA Commands and Results

| Command | Checks | Result |
|---------|--------|--------|
| `npm run risk:learning` | — | PASS (generated) |
| `npm run risk:learning:qa` | 222/222 | PASS |
| `npm run dashboard:data:qa` | 522/522 | PASS |
| `npm run dashboard:qa` | 154/154 | PASS |
| `npm run cycle:qa` | 15/15 | PASS |
| `npm run qa:full` | 71/71 | PASS |

---

## Pre-existing Dirty Files Not Touched

All ~54 pre-existing dirty data/report files from previous runs remain untouched. Only the following new generated files were created:

**New generated files (local/report-only, should not be committed to MarketOps Core):**
- `Data/paper/risk/risk-desk-learning-v0.1.json`
- `Reports/Risk/marketops-risk-desk-learning-v0.1.md`
- `Reports/Risk/marketops-risk-desk-learning-qa-v0.1.md`

**Source/config files that should be committed later:**
- `src/risk/riskDeskLearningBuilder.js`
- `src/risk/runRiskDeskLearning.js`
- `src/risk/runRiskDeskLearningQa.js`
- `package.json` (npm scripts added)

---

## Next Recommended Cruise (Cruise 4)

1. **Threshold calibration:** After 2-3 more cycles of learning data, analyze confidence thresholds and shadow outcomes to propose specific adjustments.
2. **Shadow price history:** Add historical price fetching so shadow trades can compute more accurate P&L (currently uses single snapshot).
3. **Automated learning refresh:** Add `risk:learning` to the scheduled refresh pipeline so learning records update each cycle.
4. **Admin review console:** Once enough data accumulates, build the private admin console for human review of Risk Desk decisions.
