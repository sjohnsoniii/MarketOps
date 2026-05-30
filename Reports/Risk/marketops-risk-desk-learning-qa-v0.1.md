# MarketOps Risk Desk Learning QA Report v0.1

Generated: 2026-05-29T19:51:11.016Z

**Result:** PASS
**Checks Passed:** 882 / 882

## Check Details

| Check | Passed | Detail |
|---|---|---|
| Output JSON exists | PASS | /home/sjohnsoniii/Projects/MarketOps/Data/paper/risk/risk-desk-learning-v0.1.json |
| Output report exists | PASS | /home/sjohnsoniii/Projects/MarketOps/Reports/Risk/marketops-risk-desk-learning-v0.1.md |
| Output JSON is valid JSON | PASS | Parsed successfully |
| paperSimulation is true | PASS | true |
| approvedTrades exists and is array | PASS | object |
| rejectedTrades exists and is array | PASS | object |
| watchedSignals exists and is array | PASS | object |
| shadowTrades exists and is array | PASS | object |
| recommendations exists and is array | PASS | object |
| proposals exists and is array | PASS | object |
| summary exists | PASS | object |
| summary.approvedCount exists | PASS | 82 |
| summary.rejectedCount exists | PASS | 68 |
| summary.watchedCount exists | PASS | 111 |
| summary.shadowTrackedCount exists | PASS | 68 |
| summary.possibleFalsePositiveCount exists | PASS | 10 |
| summary.possibleFalseNegativeCount exists | PASS | 0 |
| summary.goodApprovalCount exists | PASS | 1 |
| summary.badApprovalCount exists | PASS | 10 |
| summary.goodRejectionCount exists | PASS | 0 |
| summary.badRejectionCount exists | PASS | 0 |
| summary.inconclusiveCount exists | PASS | 250 |
| summary.bestDecision exists | PASS | Approved AAPL: Position performing well (good_approval). |
| summary.worstDecision exists | PASS | Approved XLV: Position underperforming (bad_approval). Needs review. |
| summary.learningNotes exists | PASS | Risk Desk reviewed 261 total items. 1 good approvals, 10 possible false positives, 0 good rejections, 0 possible false negatives, 250 inconclusive. Learning records built from Cruise 1 cycle data. Most outcomes are still early (positions held less than 1 week). |
| summary counts are numbers | PASS | Types ok |
| approvedTrades item SPY.symbol exists | PASS | SPY |
| approvedTrades item SPY.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item SPY.plainEnglishOutcome exists | PASS | Risk Desk approved this trade. Position is currently flat. |
| approvedTrades item SPY.confidence exists | PASS | 0.6 |
| approvedTrades item SPY.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item SPY.signalReason exists | PASS | SPY moved 2.06% across Alpaca IEX market data. |
| approvedTrades item QQQ.symbol exists | PASS | QQQ |
| approvedTrades item QQQ.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item QQQ.plainEnglishOutcome exists | PASS | Risk Desk approved this trade. Position is currently flat. |
| approvedTrades item QQQ.confidence exists | PASS | 0.68 |
| approvedTrades item QQQ.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item QQQ.signalReason exists | PASS | QQQ moved 3.64% across Alpaca IEX market data. |
| approvedTrades item IWM.symbol exists | PASS | IWM |
| approvedTrades item IWM.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item IWM.plainEnglishOutcome exists | PASS | Risk Desk approved this trade. Position is currently flat. |
| approvedTrades item IWM.confidence exists | PASS | 0.71 |
| approvedTrades item IWM.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item IWM.signalReason exists | PASS | IWM moved 4.11% across Alpaca IEX market data. |
| approvedTrades item DIA.symbol exists | PASS | DIA |
| approvedTrades item DIA.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item DIA.plainEnglishOutcome exists | PASS | Risk Desk approved this trade. Position is currently flat. |
| approvedTrades item DIA.confidence exists | PASS | 0.19 |
| approvedTrades item DIA.riskReason exists | PASS | Risk Desk approved (approved_learning_probe) for fake paper execution only. Position size multiplier: 0.25. |
| approvedTrades item DIA.signalReason exists | PASS | DIA moved 1.9% — near candidate threshold for learning probe. |
| approvedTrades item VTI.symbol exists | PASS | VTI |
| approvedTrades item VTI.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item VTI.plainEnglishOutcome exists | PASS | Risk Desk approved this trade. Position is currently flat. |
| approvedTrades item VTI.confidence exists | PASS | 0.61 |
| approvedTrades item VTI.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item VTI.signalReason exists | PASS | VTI moved 2.11% across Alpaca IEX market data. |
| approvedTrades item VOO.symbol exists | PASS | VOO |
| approvedTrades item VOO.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item VOO.plainEnglishOutcome exists | PASS | Risk Desk approved this trade. Position is currently flat. |
| approvedTrades item VOO.confidence exists | PASS | 0.16 |
| approvedTrades item VOO.riskReason exists | PASS | Risk Desk approved (approved_learning_probe) for fake paper execution only. Position size multiplier: 0.25. |
| approvedTrades item VOO.signalReason exists | PASS | VOO moved 1.59% — near candidate threshold for learning probe. |
| approvedTrades item VXUS.symbol exists | PASS | VXUS |
| approvedTrades item VXUS.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item VXUS.plainEnglishOutcome exists | PASS | Risk Desk approved this trade. Position is currently flat. |
| approvedTrades item VXUS.confidence exists | PASS | 0.16 |
| approvedTrades item VXUS.riskReason exists | PASS | Risk Desk approved (approved_learning_probe) for fake paper execution only. Position size multiplier: 0.25. |
| approvedTrades item VXUS.signalReason exists | PASS | VXUS moved 1.63% — near candidate threshold for learning probe. |
| approvedTrades item VT.symbol exists | PASS | VT |
| approvedTrades item VT.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item VT.plainEnglishOutcome exists | PASS | Risk Desk approved this trade. Position is currently flat. |
| approvedTrades item VT.confidence exists | PASS | 0.17 |
| approvedTrades item VT.riskReason exists | PASS | Risk Desk approved (approved_learning_probe) for fake paper execution only. Position size multiplier: 0.25. |
| approvedTrades item VT.signalReason exists | PASS | VT moved 1.72% — near candidate threshold for learning probe. |
| approvedTrades item VB.symbol exists | PASS | VB |
| approvedTrades item VB.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item VB.plainEnglishOutcome exists | PASS | Risk Desk approved this trade. Position is currently flat. |
| approvedTrades item VB.confidence exists | PASS | 0.63 |
| approvedTrades item VB.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item VB.signalReason exists | PASS | VB moved 2.67% across Alpaca IEX market data. |
| approvedTrades item VO.symbol exists | PASS | VO |
| approvedTrades item VO.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item VO.plainEnglishOutcome exists | PASS | Risk Desk approved this trade. Position is currently flat. |
| approvedTrades item VO.confidence exists | PASS | 0.18 |
| approvedTrades item VO.riskReason exists | PASS | Risk Desk approved (approved_learning_probe) for fake paper execution only. Position size multiplier: 0.25. |
| approvedTrades item VO.signalReason exists | PASS | VO moved 1.83% — near candidate threshold for learning probe. |
| approvedTrades item VV.symbol exists | PASS | VV |
| approvedTrades item VV.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item VV.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item VV.confidence exists | PASS | 0.17 |
| approvedTrades item VV.riskReason exists | PASS | Risk Desk approved (approved_learning_probe) for fake paper execution only. Position size multiplier: 0.25. |
| approvedTrades item VV.signalReason exists | PASS | VV moved 1.69% — near candidate threshold for learning probe. |
| approvedTrades item IVV.symbol exists | PASS | IVV |
| approvedTrades item IVV.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item IVV.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item IVV.confidence exists | PASS | 0.16 |
| approvedTrades item IVV.riskReason exists | PASS | Risk Desk approved (approved_learning_probe) for fake paper execution only. Position size multiplier: 0.25. |
| approvedTrades item IVV.signalReason exists | PASS | IVV moved 1.59% — near candidate threshold for learning probe. |
| approvedTrades item IJR.symbol exists | PASS | IJR |
| approvedTrades item IJR.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item IJR.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item IJR.confidence exists | PASS | 0.63 |
| approvedTrades item IJR.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item IJR.signalReason exists | PASS | IJR moved 2.57% across Alpaca IEX market data. |
| approvedTrades item IJH.symbol exists | PASS | IJH |
| approvedTrades item IJH.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item IJH.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item IJH.confidence exists | PASS | 0.61 |
| approvedTrades item IJH.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item IJH.signalReason exists | PASS | IJH moved 2.22% across Alpaca IEX market data. |
| approvedTrades item SCHB.symbol exists | PASS | SCHB |
| approvedTrades item SCHB.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item SCHB.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item SCHB.confidence exists | PASS | 0.19 |
| approvedTrades item SCHB.riskReason exists | PASS | Risk Desk approved (approved_learning_probe) for fake paper execution only. Position size multiplier: 0.25. |
| approvedTrades item SCHB.signalReason exists | PASS | SCHB moved 1.85% — near candidate threshold for learning probe. |
| approvedTrades item SCHX.symbol exists | PASS | SCHX |
| approvedTrades item SCHX.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item SCHX.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item SCHX.confidence exists | PASS | 0.17 |
| approvedTrades item SCHX.riskReason exists | PASS | Risk Desk approved (approved_learning_probe) for fake paper execution only. Position size multiplier: 0.25. |
| approvedTrades item SCHX.signalReason exists | PASS | SCHX moved 1.71% — near candidate threshold for learning probe. |
| approvedTrades item XLK.symbol exists | PASS | XLK |
| approvedTrades item XLK.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item XLK.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item XLK.confidence exists | PASS | 0.81 |
| approvedTrades item XLK.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item XLK.signalReason exists | PASS | XLK moved 6.18% across Alpaca IEX market data. |
| approvedTrades item XLV.symbol exists | PASS | XLV |
| approvedTrades item XLV.outcomeLabel exists | PASS | bad_approval |
| approvedTrades item XLV.plainEnglishOutcome exists | PASS | Risk Desk approved this trade but it closed at -$0.25 loss (0%). Needs review. |
| approvedTrades item XLV.confidence exists | PASS | 0.64 |
| approvedTrades item XLV.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item XLV.signalReason exists | PASS | XLV moved 2.82% across Alpaca IEX market data. |
| approvedTrades item XLI.symbol exists | PASS | XLI |
| approvedTrades item XLI.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item XLI.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item XLI.confidence exists | PASS | 0.19 |
| approvedTrades item XLI.riskReason exists | PASS | Risk Desk approved (approved_learning_probe) for fake paper execution only. Position size multiplier: 0.25. |
| approvedTrades item XLI.signalReason exists | PASS | XLI moved 1.91% — near candidate threshold for learning probe. |
| approvedTrades item XLY.symbol exists | PASS | XLY |
| approvedTrades item XLY.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item XLY.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item XLY.confidence exists | PASS | 0.64 |
| approvedTrades item XLY.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item XLY.signalReason exists | PASS | XLY moved 2.81% across Alpaca IEX market data. |
| approvedTrades item SMH.symbol exists | PASS | SMH |
| approvedTrades item SMH.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item SMH.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item SMH.confidence exists | PASS | 0.79 |
| approvedTrades item SMH.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item SMH.signalReason exists | PASS | SMH moved 5.83% across Alpaca IEX market data. |
| approvedTrades item IBB.symbol exists | PASS | IBB |
| approvedTrades item IBB.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item IBB.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item IBB.confidence exists | PASS | 0.18 |
| approvedTrades item IBB.riskReason exists | PASS | Risk Desk approved (approved_learning_probe) for fake paper execution only. Position size multiplier: 0.25. |
| approvedTrades item IBB.signalReason exists | PASS | IBB moved 1.79% — near candidate threshold for learning probe. |
| approvedTrades item XHB.symbol exists | PASS | XHB |
| approvedTrades item XHB.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item XHB.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item XHB.confidence exists | PASS | 0.66 |
| approvedTrades item XHB.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item XHB.signalReason exists | PASS | XHB moved 3.22% across Alpaca IEX market data. |
| approvedTrades item XRT.symbol exists | PASS | XRT |
| approvedTrades item XRT.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item XRT.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item XRT.confidence exists | PASS | 0.74 |
| approvedTrades item XRT.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item XRT.signalReason exists | PASS | XRT moved 4.71% across Alpaca IEX market data. |
| approvedTrades item GDXJ.symbol exists | PASS | GDXJ |
| approvedTrades item GDXJ.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item GDXJ.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item GDXJ.confidence exists | PASS | 0.61 |
| approvedTrades item GDXJ.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item GDXJ.signalReason exists | PASS | GDXJ moved 2.11% across Alpaca IEX market data. |
| approvedTrades item TLT.symbol exists | PASS | TLT |
| approvedTrades item TLT.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item TLT.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item TLT.confidence exists | PASS | 0.19 |
| approvedTrades item TLT.riskReason exists | PASS | Risk Desk approved (approved_learning_probe) for fake paper execution only. Position size multiplier: 0.25. |
| approvedTrades item TLT.signalReason exists | PASS | TLT moved 1.87% — near candidate threshold for learning probe. |
| approvedTrades item EEM.symbol exists | PASS | EEM |
| approvedTrades item EEM.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item EEM.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item EEM.confidence exists | PASS | 0.7 |
| approvedTrades item EEM.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item EEM.signalReason exists | PASS | EEM moved 4.01% across Alpaca IEX market data. |
| approvedTrades item VWO.symbol exists | PASS | VWO |
| approvedTrades item VWO.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item VWO.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item VWO.confidence exists | PASS | 0.6 |
| approvedTrades item VWO.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item VWO.signalReason exists | PASS | VWO moved 2.1% across Alpaca IEX market data. |
| approvedTrades item ARKK.symbol exists | PASS | ARKK |
| approvedTrades item ARKK.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item ARKK.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item ARKK.confidence exists | PASS | 0.79 |
| approvedTrades item ARKK.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item ARKK.signalReason exists | PASS | ARKK moved 5.84% across Alpaca IEX market data. |
| approvedTrades item ARKW.symbol exists | PASS | ARKW |
| approvedTrades item ARKW.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item ARKW.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item ARKW.confidence exists | PASS | 0.63 |
| approvedTrades item ARKW.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item ARKW.signalReason exists | PASS | ARKW moved 2.58% across Alpaca IEX market data. |
| approvedTrades item ARKG.symbol exists | PASS | ARKG |
| approvedTrades item ARKG.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item ARKG.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item ARKG.confidence exists | PASS | 0.9 |
| approvedTrades item ARKG.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item ARKG.signalReason exists | PASS | ARKG moved 11.71% across Alpaca IEX market data. |
| approvedTrades item ARKF.symbol exists | PASS | ARKF |
| approvedTrades item ARKF.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item ARKF.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item ARKF.confidence exists | PASS | 0.18 |
| approvedTrades item ARKF.riskReason exists | PASS | Risk Desk approved (approved_learning_probe) for fake paper execution only. Position size multiplier: 0.25. |
| approvedTrades item ARKF.signalReason exists | PASS | ARKF moved 1.79% — near candidate threshold for learning probe. |
| approvedTrades item SOXX.symbol exists | PASS | SOXX |
| approvedTrades item SOXX.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item SOXX.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item SOXX.confidence exists | PASS | 0.9 |
| approvedTrades item SOXX.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item SOXX.signalReason exists | PASS | SOXX moved 8.85% across Alpaca IEX market data. |
| approvedTrades item TAN.symbol exists | PASS | TAN |
| approvedTrades item TAN.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item TAN.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item TAN.confidence exists | PASS | 0.9 |
| approvedTrades item TAN.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item TAN.signalReason exists | PASS | TAN moved 10.88% across Alpaca IEX market data. |
| approvedTrades item ICLN.symbol exists | PASS | ICLN |
| approvedTrades item ICLN.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item ICLN.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item ICLN.confidence exists | PASS | 0.77 |
| approvedTrades item ICLN.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item ICLN.signalReason exists | PASS | ICLN moved 5.43% across Alpaca IEX market data. |
| approvedTrades item XBI.symbol exists | PASS | XBI |
| approvedTrades item XBI.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item XBI.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item XBI.confidence exists | PASS | 0.61 |
| approvedTrades item XBI.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item XBI.signalReason exists | PASS | XBI moved 2.15% across Alpaca IEX market data. |
| approvedTrades item LABU.symbol exists | PASS | LABU |
| approvedTrades item LABU.outcomeLabel exists | PASS | bad_approval |
| approvedTrades item LABU.plainEnglishOutcome exists | PASS | Risk Desk approved this trade but it closed at -$0.01 loss (0%). Needs review. |
| approvedTrades item LABU.confidence exists | PASS | 0.85 |
| approvedTrades item LABU.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item LABU.signalReason exists | PASS | LABU moved 6.94% across Alpaca IEX market data. |
| approvedTrades item EWJ.symbol exists | PASS | EWJ |
| approvedTrades item EWJ.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item EWJ.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item EWJ.confidence exists | PASS | 0.15 |
| approvedTrades item EWJ.riskReason exists | PASS | Risk Desk approved (approved_learning_probe) for fake paper execution only. Position size multiplier: 0.25. |
| approvedTrades item EWJ.signalReason exists | PASS | EWJ moved 1.53% — near candidate threshold for learning probe. |
| approvedTrades item AAPL.symbol exists | PASS | AAPL |
| approvedTrades item AAPL.outcomeLabel exists | PASS | good_approval |
| approvedTrades item AAPL.plainEnglishOutcome exists | PASS | Risk Desk approved this trade. Closed with +$3.23 gain (0%). |
| approvedTrades item AAPL.confidence exists | PASS | 0.8 |
| approvedTrades item AAPL.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item AAPL.signalReason exists | PASS | AAPL moved 6% across Alpaca IEX market data. |
| approvedTrades item MSFT.symbol exists | PASS | MSFT |
| approvedTrades item MSFT.outcomeLabel exists | PASS | bad_approval |
| approvedTrades item MSFT.plainEnglishOutcome exists | PASS | Risk Desk approved this trade but it closed at -$0.13 loss (0%). Needs review. |
| approvedTrades item MSFT.confidence exists | PASS | 0.69 |
| approvedTrades item MSFT.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item MSFT.signalReason exists | PASS | MSFT moved 3.81% across Alpaca IEX market data. |
| approvedTrades item AMZN.symbol exists | PASS | AMZN |
| approvedTrades item AMZN.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item AMZN.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item AMZN.confidence exists | PASS | 0.71 |
| approvedTrades item AMZN.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item AMZN.signalReason exists | PASS | AMZN moved 4.29% across Alpaca IEX market data. |
| approvedTrades item META.symbol exists | PASS | META |
| approvedTrades item META.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item META.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item META.confidence exists | PASS | 0.68 |
| approvedTrades item META.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item META.signalReason exists | PASS | META moved 3.63% across Alpaca IEX market data. |
| approvedTrades item TSLA.symbol exists | PASS | TSLA |
| approvedTrades item TSLA.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item TSLA.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item TSLA.confidence exists | PASS | 0.62 |
| approvedTrades item TSLA.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item TSLA.signalReason exists | PASS | TSLA moved 2.35% across Alpaca IEX market data. |
| approvedTrades item PG.symbol exists | PASS | PG |
| approvedTrades item PG.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item PG.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item PG.confidence exists | PASS | 0.6 |
| approvedTrades item PG.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item PG.signalReason exists | PASS | PG moved 2.06% across Alpaca IEX market data. |
| approvedTrades item HD.symbol exists | PASS | HD |
| approvedTrades item HD.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item HD.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item HD.confidence exists | PASS | 0.82 |
| approvedTrades item HD.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item HD.signalReason exists | PASS | HD moved 6.5% across Alpaca IEX market data. |
| approvedTrades item MRK.symbol exists | PASS | MRK |
| approvedTrades item MRK.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item MRK.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item MRK.confidence exists | PASS | 0.77 |
| approvedTrades item MRK.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item MRK.signalReason exists | PASS | MRK moved 5.41% across Alpaca IEX market data. |
| approvedTrades item ABBV.symbol exists | PASS | ABBV |
| approvedTrades item ABBV.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item ABBV.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item ABBV.confidence exists | PASS | 0.64 |
| approvedTrades item ABBV.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item ABBV.signalReason exists | PASS | ABBV moved 2.79% across Alpaca IEX market data. |
| approvedTrades item CRM.symbol exists | PASS | CRM |
| approvedTrades item CRM.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item CRM.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item CRM.confidence exists | PASS | 0.66 |
| approvedTrades item CRM.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item CRM.signalReason exists | PASS | CRM moved 3.21% across Alpaca IEX market data. |
| approvedTrades item AMD.symbol exists | PASS | AMD |
| approvedTrades item AMD.outcomeLabel exists | PASS | bad_approval |
| approvedTrades item AMD.plainEnglishOutcome exists | PASS | Risk Desk approved this trade but it closed at -$0.07 loss (0%). Needs review. |
| approvedTrades item AMD.confidence exists | PASS | 0.9 |
| approvedTrades item AMD.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item AMD.signalReason exists | PASS | AMD moved 19.69% across Alpaca IEX market data. |
| approvedTrades item INTC.symbol exists | PASS | INTC |
| approvedTrades item INTC.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item INTC.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item INTC.confidence exists | PASS | 0.9 |
| approvedTrades item INTC.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item INTC.signalReason exists | PASS | INTC moved 8.82% across Alpaca IEX market data. |
| approvedTrades item LLY.symbol exists | PASS | LLY |
| approvedTrades item LLY.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item LLY.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item LLY.confidence exists | PASS | 0.89 |
| approvedTrades item LLY.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item LLY.signalReason exists | PASS | LLY moved 7.76% across Alpaca IEX market data. |
| approvedTrades item ORCL.symbol exists | PASS | ORCL |
| approvedTrades item ORCL.outcomeLabel exists | PASS | bad_approval |
| approvedTrades item ORCL.plainEnglishOutcome exists | PASS | Risk Desk approved this trade but it closed at -$0.05 loss (0%). Needs review. |
| approvedTrades item ORCL.confidence exists | PASS | 0.9 |
| approvedTrades item ORCL.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item ORCL.signalReason exists | PASS | ORCL moved 10.44% across Alpaca IEX market data. |
| approvedTrades item TMO.symbol exists | PASS | TMO |
| approvedTrades item TMO.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item TMO.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item TMO.confidence exists | PASS | 0.9 |
| approvedTrades item TMO.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item TMO.signalReason exists | PASS | TMO moved 8.57% across Alpaca IEX market data. |
| approvedTrades item TXN.symbol exists | PASS | TXN |
| approvedTrades item TXN.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item TXN.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item TXN.confidence exists | PASS | 0.81 |
| approvedTrades item TXN.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item TXN.signalReason exists | PASS | TXN moved 6.17% across Alpaca IEX market data. |
| approvedTrades item QCOM.symbol exists | PASS | QCOM |
| approvedTrades item QCOM.outcomeLabel exists | PASS | bad_approval |
| approvedTrades item QCOM.plainEnglishOutcome exists | PASS | Risk Desk approved this trade but it closed at -$0.04 loss (0%). Needs review. |
| approvedTrades item QCOM.confidence exists | PASS | 0.9 |
| approvedTrades item QCOM.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item QCOM.signalReason exists | PASS | QCOM moved 14.31% across Alpaca IEX market data. |
| approvedTrades item HON.symbol exists | PASS | HON |
| approvedTrades item HON.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item HON.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item HON.confidence exists | PASS | 0.7 |
| approvedTrades item HON.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item HON.signalReason exists | PASS | HON moved 4.09% across Alpaca IEX market data. |
| approvedTrades item NKE.symbol exists | PASS | NKE |
| approvedTrades item NKE.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item NKE.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item NKE.confidence exists | PASS | 0.85 |
| approvedTrades item NKE.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item NKE.signalReason exists | PASS | NKE moved 6.97% across Alpaca IEX market data. |
| approvedTrades item BA.symbol exists | PASS | BA |
| approvedTrades item BA.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item BA.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item BA.confidence exists | PASS | 0.7 |
| approvedTrades item BA.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item BA.signalReason exists | PASS | BA moved 4.07% across Alpaca IEX market data. |
| approvedTrades item CAT.symbol exists | PASS | CAT |
| approvedTrades item CAT.outcomeLabel exists | PASS | bad_approval |
| approvedTrades item CAT.plainEnglishOutcome exists | PASS | Risk Desk approved this trade but it closed at -$0.01 loss (0%). Needs review. |
| approvedTrades item CAT.confidence exists | PASS | 0.62 |
| approvedTrades item CAT.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item CAT.signalReason exists | PASS | CAT moved 2.43% across Alpaca IEX market data. |
| approvedTrades item GE.symbol exists | PASS | GE |
| approvedTrades item GE.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item GE.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item GE.confidence exists | PASS | 0.82 |
| approvedTrades item GE.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item GE.signalReason exists | PASS | GE moved 6.46% across Alpaca IEX market data. |
| approvedTrades item IBM.symbol exists | PASS | IBM |
| approvedTrades item IBM.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item IBM.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item IBM.confidence exists | PASS | 0.73 |
| approvedTrades item IBM.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item IBM.signalReason exists | PASS | IBM moved 4.68% across Alpaca IEX market data. |
| approvedTrades item AMAT.symbol exists | PASS | AMAT |
| approvedTrades item AMAT.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item AMAT.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item AMAT.confidence exists | PASS | 0.76 |
| approvedTrades item AMAT.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item AMAT.signalReason exists | PASS | AMAT moved 5.21% across Alpaca IEX market data. |
| approvedTrades item AMD.symbol exists | PASS | AMD |
| approvedTrades item AMD.outcomeLabel exists | PASS | bad_approval |
| approvedTrades item AMD.plainEnglishOutcome exists | PASS | Risk Desk approved this trade but it closed at -$0.07 loss (0%). Needs review. |
| approvedTrades item AMD.confidence exists | PASS | 0.9 |
| approvedTrades item AMD.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item AMD.signalReason exists | PASS | AMD moved 19.69% across Alpaca IEX market data. |
| approvedTrades item MU.symbol exists | PASS | MU |
| approvedTrades item MU.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item MU.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item MU.confidence exists | PASS | 0.9 |
| approvedTrades item MU.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item MU.signalReason exists | PASS | MU moved 22.25% across Alpaca IEX market data. |
| approvedTrades item NOW.symbol exists | PASS | NOW |
| approvedTrades item NOW.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item NOW.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item NOW.confidence exists | PASS | 0.9 |
| approvedTrades item NOW.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item NOW.signalReason exists | PASS | NOW moved 10.29% across Alpaca IEX market data. |
| approvedTrades item LRCX.symbol exists | PASS | LRCX |
| approvedTrades item LRCX.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item LRCX.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item LRCX.confidence exists | PASS | 0.78 |
| approvedTrades item LRCX.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item LRCX.signalReason exists | PASS | LRCX moved 5.65% across Alpaca IEX market data. |
| approvedTrades item GS.symbol exists | PASS | GS |
| approvedTrades item GS.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item GS.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item GS.confidence exists | PASS | 0.6 |
| approvedTrades item GS.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item GS.signalReason exists | PASS | GS moved 2.03% across Alpaca IEX market data. |
| approvedTrades item ADI.symbol exists | PASS | ADI |
| approvedTrades item ADI.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item ADI.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item ADI.confidence exists | PASS | 0.9 |
| approvedTrades item ADI.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item ADI.signalReason exists | PASS | ADI moved 9.05% across Alpaca IEX market data. |
| approvedTrades item AXP.symbol exists | PASS | AXP |
| approvedTrades item AXP.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item AXP.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item AXP.confidence exists | PASS | 0.18 |
| approvedTrades item AXP.riskReason exists | PASS | Risk Desk approved (approved_learning_probe) for fake paper execution only. Position size multiplier: 0.25. |
| approvedTrades item AXP.signalReason exists | PASS | AXP moved 1.84% — near candidate threshold for learning probe. |
| approvedTrades item BKNG.symbol exists | PASS | BKNG |
| approvedTrades item BKNG.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item BKNG.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item BKNG.confidence exists | PASS | 0.82 |
| approvedTrades item BKNG.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item BKNG.signalReason exists | PASS | BKNG moved 6.35% across Alpaca IEX market data. |
| approvedTrades item GILD.symbol exists | PASS | GILD |
| approvedTrades item GILD.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item GILD.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item GILD.confidence exists | PASS | 0.71 |
| approvedTrades item GILD.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item GILD.signalReason exists | PASS | GILD moved 4.11% across Alpaca IEX market data. |
| approvedTrades item VRTX.symbol exists | PASS | VRTX |
| approvedTrades item VRTX.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item VRTX.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item VRTX.confidence exists | PASS | 0.66 |
| approvedTrades item VRTX.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item VRTX.signalReason exists | PASS | VRTX moved 3.22% across Alpaca IEX market data. |
| approvedTrades item PANW.symbol exists | PASS | PANW |
| approvedTrades item PANW.outcomeLabel exists | PASS | bad_approval |
| approvedTrades item PANW.plainEnglishOutcome exists | PASS | Risk Desk approved this trade but it closed at -$0.03 loss (0%). Needs review. |
| approvedTrades item PANW.confidence exists | PASS | 0.61 |
| approvedTrades item PANW.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item PANW.signalReason exists | PASS | PANW moved 2.27% across Alpaca IEX market data. |
| approvedTrades item MDLZ.symbol exists | PASS | MDLZ |
| approvedTrades item MDLZ.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item MDLZ.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item MDLZ.confidence exists | PASS | 0.16 |
| approvedTrades item MDLZ.riskReason exists | PASS | Risk Desk approved (approved_learning_probe) for fake paper execution only. Position size multiplier: 0.25. |
| approvedTrades item MDLZ.signalReason exists | PASS | MDLZ moved 1.62% — near candidate threshold for learning probe. |
| approvedTrades item F.symbol exists | PASS | F |
| approvedTrades item F.outcomeLabel exists | PASS | bad_approval |
| approvedTrades item F.plainEnglishOutcome exists | PASS | Risk Desk approved this trade but it closed at -$0.02 loss (0%). Needs review. |
| approvedTrades item F.confidence exists | PASS | 0.9 |
| approvedTrades item F.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item F.signalReason exists | PASS | F moved 21.77% across Alpaca IEX market data. |
| approvedTrades item GM.symbol exists | PASS | GM |
| approvedTrades item GM.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item GM.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item GM.confidence exists | PASS | 0.9 |
| approvedTrades item GM.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item GM.signalReason exists | PASS | GM moved 9.19% across Alpaca IEX market data. |
| approvedTrades item SNAP.symbol exists | PASS | SNAP |
| approvedTrades item SNAP.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item SNAP.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item SNAP.confidence exists | PASS | 0.68 |
| approvedTrades item SNAP.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item SNAP.signalReason exists | PASS | SNAP moved 3.68% across Alpaca IEX market data. |
| approvedTrades item RIVN.symbol exists | PASS | RIVN |
| approvedTrades item RIVN.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item RIVN.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item RIVN.confidence exists | PASS | 0.86 |
| approvedTrades item RIVN.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item RIVN.signalReason exists | PASS | RIVN moved 7.28% across Alpaca IEX market data. |
| approvedTrades item LCID.symbol exists | PASS | LCID |
| approvedTrades item LCID.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item LCID.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item LCID.confidence exists | PASS | 0.9 |
| approvedTrades item LCID.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item LCID.signalReason exists | PASS | LCID moved 10.63% across Alpaca IEX market data. |
| approvedTrades item PLTR.symbol exists | PASS | PLTR |
| approvedTrades item PLTR.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item PLTR.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item PLTR.confidence exists | PASS | 0.73 |
| approvedTrades item PLTR.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item PLTR.signalReason exists | PASS | PLTR moved 4.55% across Alpaca IEX market data. |
| approvedTrades item HOOD.symbol exists | PASS | HOOD |
| approvedTrades item HOOD.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item HOOD.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item HOOD.confidence exists | PASS | 0.9 |
| approvedTrades item HOOD.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item HOOD.signalReason exists | PASS | HOOD moved 11.5% across Alpaca IEX market data. |
| approvedTrades item TSM.symbol exists | PASS | TSM |
| approvedTrades item TSM.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item TSM.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item TSM.confidence exists | PASS | 0.72 |
| approvedTrades item TSM.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item TSM.signalReason exists | PASS | TSM moved 4.31% across Alpaca IEX market data. |
| rejectedTrades item BND.symbol exists | PASS | BND |
| rejectedTrades item BND.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item BND.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item BND.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item BND.confidence exists | PASS | 0.1 |
| rejectedTrades item BNDX.symbol exists | PASS | BNDX |
| rejectedTrades item BNDX.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item BNDX.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item BNDX.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item BNDX.confidence exists | PASS | 0.1 |
| rejectedTrades item SCHF.symbol exists | PASS | SCHF |
| rejectedTrades item SCHF.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item SCHF.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item SCHF.riskDeskReason exists | PASS | Risk Desk blocked this signal for Phase 1 paper simulation. |
| rejectedTrades item SCHF.confidence exists | PASS | 0.14 |
| rejectedTrades item XLF.symbol exists | PASS | XLF |
| rejectedTrades item XLF.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item XLF.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item XLF.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item XLF.confidence exists | PASS | 0.1 |
| rejectedTrades item XLE.symbol exists | PASS | XLE |
| rejectedTrades item XLE.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item XLE.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item XLE.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item XLE.confidence exists | PASS | 0.64 |
| rejectedTrades item XLP.symbol exists | PASS | XLP |
| rejectedTrades item XLP.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item XLP.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item XLP.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item XLP.confidence exists | PASS | 0.1 |
| rejectedTrades item XLU.symbol exists | PASS | XLU |
| rejectedTrades item XLU.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item XLU.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item XLU.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item XLU.confidence exists | PASS | 0.1 |
| rejectedTrades item XLRE.symbol exists | PASS | XLRE |
| rejectedTrades item XLRE.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item XLRE.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item XLRE.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item XLRE.confidence exists | PASS | 0.1 |
| rejectedTrades item XLC.symbol exists | PASS | XLC |
| rejectedTrades item XLC.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item XLC.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item XLC.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item XLC.confidence exists | PASS | 0.1 |
| rejectedTrades item KRE.symbol exists | PASS | KRE |
| rejectedTrades item KRE.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item KRE.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item KRE.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item KRE.confidence exists | PASS | 0.1 |
| rejectedTrades item KBE.symbol exists | PASS | KBE |
| rejectedTrades item KBE.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item KBE.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item KBE.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item KBE.confidence exists | PASS | 0.1 |
| rejectedTrades item OIH.symbol exists | PASS | OIH |
| rejectedTrades item OIH.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item OIH.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item OIH.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item OIH.confidence exists | PASS | 0.78 |
| rejectedTrades item GDX.symbol exists | PASS | GDX |
| rejectedTrades item GDX.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item GDX.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item GDX.riskDeskReason exists | PASS | Risk Desk blocked this signal for Phase 1 paper simulation. |
| rejectedTrades item GDX.confidence exists | PASS | 0.12 |
| rejectedTrades item SLV.symbol exists | PASS | SLV |
| rejectedTrades item SLV.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item SLV.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item SLV.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item SLV.confidence exists | PASS | 0.16 |
| rejectedTrades item GLD.symbol exists | PASS | GLD |
| rejectedTrades item GLD.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item GLD.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item GLD.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item GLD.confidence exists | PASS | 0.1 |
| rejectedTrades item IEF.symbol exists | PASS | IEF |
| rejectedTrades item IEF.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item IEF.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item IEF.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item IEF.confidence exists | PASS | 0.1 |
| rejectedTrades item SHY.symbol exists | PASS | SHY |
| rejectedTrades item SHY.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item SHY.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item SHY.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item SHY.confidence exists | PASS | 0.1 |
| rejectedTrades item LQD.symbol exists | PASS | LQD |
| rejectedTrades item LQD.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item LQD.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item LQD.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item LQD.confidence exists | PASS | 0.11 |
| rejectedTrades item HYG.symbol exists | PASS | HYG |
| rejectedTrades item HYG.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item HYG.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item HYG.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item HYG.confidence exists | PASS | 0.1 |
| rejectedTrades item EMB.symbol exists | PASS | EMB |
| rejectedTrades item EMB.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item EMB.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item EMB.riskDeskReason exists | PASS | Risk Desk blocked this signal for Phase 1 paper simulation. |
| rejectedTrades item EMB.confidence exists | PASS | 0.14 |
| rejectedTrades item TIP.symbol exists | PASS | TIP |
| rejectedTrades item TIP.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item TIP.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item TIP.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item TIP.confidence exists | PASS | 0.1 |
| rejectedTrades item MBB.symbol exists | PASS | MBB |
| rejectedTrades item MBB.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item MBB.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item MBB.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item MBB.confidence exists | PASS | 0.1 |
| rejectedTrades item EFA.symbol exists | PASS | EFA |
| rejectedTrades item EFA.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item EFA.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item EFA.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item EFA.confidence exists | PASS | 0.1 |
| rejectedTrades item VEA.symbol exists | PASS | VEA |
| rejectedTrades item VEA.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item VEA.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item VEA.riskDeskReason exists | PASS | Risk Desk blocked this signal for Phase 1 paper simulation. |
| rejectedTrades item VEA.confidence exists | PASS | 0.14 |
| rejectedTrades item FXI.symbol exists | PASS | FXI |
| rejectedTrades item FXI.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item FXI.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item FXI.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item FXI.confidence exists | PASS | 0.62 |
| rejectedTrades item EWZ.symbol exists | PASS | EWZ |
| rejectedTrades item EWZ.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item EWZ.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item EWZ.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item EWZ.confidence exists | PASS | 0.62 |
| rejectedTrades item INDA.symbol exists | PASS | INDA |
| rejectedTrades item INDA.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item INDA.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item INDA.riskDeskReason exists | PASS | Risk Desk blocked this signal for Phase 1 paper simulation. |
| rejectedTrades item INDA.confidence exists | PASS | 0.13 |
| rejectedTrades item NVDA.symbol exists | PASS | NVDA |
| rejectedTrades item NVDA.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item NVDA.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item NVDA.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item NVDA.confidence exists | PASS | 0.85 |
| rejectedTrades item GOOGL.symbol exists | PASS | GOOGL |
| rejectedTrades item GOOGL.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item GOOGL.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item GOOGL.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item GOOGL.confidence exists | PASS | 0.1 |
| rejectedTrades item GOOG.symbol exists | PASS | GOOG |
| rejectedTrades item GOOG.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item GOOG.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item GOOG.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item GOOG.confidence exists | PASS | 0.1 |
| rejectedTrades item AVGO.symbol exists | PASS | AVGO |
| rejectedTrades item AVGO.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item AVGO.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item AVGO.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item AVGO.confidence exists | PASS | 0.12 |
| rejectedTrades item JPM.symbol exists | PASS | JPM |
| rejectedTrades item JPM.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item JPM.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item JPM.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item JPM.confidence exists | PASS | 0.11 |
| rejectedTrades item V.symbol exists | PASS | V |
| rejectedTrades item V.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item V.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item V.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item V.confidence exists | PASS | 0.1 |
| rejectedTrades item JNJ.symbol exists | PASS | JNJ |
| rejectedTrades item JNJ.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item JNJ.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item JNJ.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item JNJ.confidence exists | PASS | 0.1 |
| rejectedTrades item WMT.symbol exists | PASS | WMT |
| rejectedTrades item WMT.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item WMT.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item WMT.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item WMT.confidence exists | PASS | 0.9 |
| rejectedTrades item XOM.symbol exists | PASS | XOM |
| rejectedTrades item XOM.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item XOM.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item XOM.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item XOM.confidence exists | PASS | 0.71 |
| rejectedTrades item UNH.symbol exists | PASS | UNH |
| rejectedTrades item UNH.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item UNH.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item UNH.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item UNH.confidence exists | PASS | 0.65 |
| rejectedTrades item COST.symbol exists | PASS | COST |
| rejectedTrades item COST.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item COST.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item COST.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item COST.confidence exists | PASS | 0.73 |
| rejectedTrades item NFLX.symbol exists | PASS | NFLX |
| rejectedTrades item NFLX.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item NFLX.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item NFLX.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item NFLX.confidence exists | PASS | 0.6 |
| rejectedTrades item BRK.B.symbol exists | PASS | BRK.B |
| rejectedTrades item BRK.B.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item BRK.B.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item BRK.B.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item BRK.B.confidence exists | PASS | 0.1 |
| rejectedTrades item MA.symbol exists | PASS | MA |
| rejectedTrades item MA.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item MA.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item MA.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item MA.confidence exists | PASS | 0.1 |
| rejectedTrades item ADBE.symbol exists | PASS | ADBE |
| rejectedTrades item ADBE.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item ADBE.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item ADBE.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item ADBE.confidence exists | PASS | 0.11 |
| rejectedTrades item CSCO.symbol exists | PASS | CSCO |
| rejectedTrades item CSCO.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item CSCO.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item CSCO.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item CSCO.confidence exists | PASS | 0.1 |
| rejectedTrades item ACN.symbol exists | PASS | ACN |
| rejectedTrades item ACN.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item ACN.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item ACN.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item ACN.confidence exists | PASS | 0.1 |
| rejectedTrades item DIS.symbol exists | PASS | DIS |
| rejectedTrades item DIS.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item DIS.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item DIS.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item DIS.confidence exists | PASS | 0.1 |
| rejectedTrades item PFE.symbol exists | PASS | PFE |
| rejectedTrades item PFE.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item PFE.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item PFE.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item PFE.confidence exists | PASS | 0.1 |
| rejectedTrades item BAC.symbol exists | PASS | BAC |
| rejectedTrades item BAC.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item BAC.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item BAC.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item BAC.confidence exists | PASS | 0.1 |
| rejectedTrades item KO.symbol exists | PASS | KO |
| rejectedTrades item KO.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item KO.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item KO.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item KO.confidence exists | PASS | 0.1 |
| rejectedTrades item PEP.symbol exists | PASS | PEP |
| rejectedTrades item PEP.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item PEP.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item PEP.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item PEP.confidence exists | PASS | 0.15 |
| rejectedTrades item ABT.symbol exists | PASS | ABT |
| rejectedTrades item ABT.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item ABT.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item ABT.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item ABT.confidence exists | PASS | 0.16 |
| rejectedTrades item AMGN.symbol exists | PASS | AMGN |
| rejectedTrades item AMGN.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item AMGN.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item AMGN.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item AMGN.confidence exists | PASS | 0.1 |
| rejectedTrades item UBER.symbol exists | PASS | UBER |
| rejectedTrades item UBER.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item UBER.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item UBER.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item UBER.confidence exists | PASS | 0.69 |
| rejectedTrades item MCD.symbol exists | PASS | MCD |
| rejectedTrades item MCD.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item MCD.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item MCD.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item MCD.confidence exists | PASS | 0.61 |
| rejectedTrades item WFC.symbol exists | PASS | WFC |
| rejectedTrades item WFC.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item WFC.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item WFC.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item WFC.confidence exists | PASS | 0.1 |
| rejectedTrades item RTX.symbol exists | PASS | RTX |
| rejectedTrades item RTX.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item RTX.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item RTX.riskDeskReason exists | PASS | Risk Desk blocked this signal for Phase 1 paper simulation. |
| rejectedTrades item RTX.confidence exists | PASS | 0.13 |
| rejectedTrades item PLD.symbol exists | PASS | PLD |
| rejectedTrades item PLD.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item PLD.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item PLD.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item PLD.confidence exists | PASS | 0.1 |
| rejectedTrades item SYK.symbol exists | PASS | SYK |
| rejectedTrades item SYK.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item SYK.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item SYK.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item SYK.confidence exists | PASS | 0.61 |
| rejectedTrades item BLK.symbol exists | PASS | BLK |
| rejectedTrades item BLK.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item BLK.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item BLK.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item BLK.confidence exists | PASS | 0.12 |
| rejectedTrades item REGN.symbol exists | PASS | REGN |
| rejectedTrades item REGN.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item REGN.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item REGN.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item REGN.confidence exists | PASS | 0.67 |
| rejectedTrades item ISRG.symbol exists | PASS | ISRG |
| rejectedTrades item ISRG.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item ISRG.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item ISRG.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item ISRG.confidence exists | PASS | 0.69 |
| rejectedTrades item SBUX.symbol exists | PASS | SBUX |
| rejectedTrades item SBUX.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item SBUX.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item SBUX.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item SBUX.confidence exists | PASS | 0.67 |
| rejectedTrades item SCHW.symbol exists | PASS | SCHW |
| rejectedTrades item SCHW.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item SCHW.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item SCHW.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item SCHW.confidence exists | PASS | 0.77 |
| rejectedTrades item C.symbol exists | PASS | C |
| rejectedTrades item C.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item C.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item C.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item C.confidence exists | PASS | 0.1 |
| rejectedTrades item PYPL.symbol exists | PASS | PYPL |
| rejectedTrades item PYPL.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item PYPL.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item PYPL.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item PYPL.confidence exists | PASS | 0.1 |
| rejectedTrades item SQ.symbol exists | PASS | SQ |
| rejectedTrades item SQ.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item SQ.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item SQ.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled.; Missing invalidation. |
| rejectedTrades item SQ.confidence exists | PASS | 0 |
| rejectedTrades item DASH.symbol exists | PASS | DASH |
| rejectedTrades item DASH.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item DASH.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item DASH.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item DASH.confidence exists | PASS | 0.17 |
| rejectedTrades item COIN.symbol exists | PASS | COIN |
| rejectedTrades item COIN.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item COIN.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item COIN.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item COIN.confidence exists | PASS | 0.8 |
| rejectedTrades item MSTR.symbol exists | PASS | MSTR |
| rejectedTrades item MSTR.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item MSTR.plainEnglishOutcome exists | PASS | Rejected by Risk Desk. Market data insufficient for shadow price calculation. |
| rejectedTrades item MSTR.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item MSTR.confidence exists | PASS | 0.9 |
| recommendation rec-risk-001 autoApply is false | PASS | false |
| recommendation rec-risk-001 has title | PASS | Review approval criteria for underperforming positions |
| recommendation rec-risk-003 autoApply is false | PASS | false |
| recommendation rec-risk-003 has title | PASS | Continue shadow tracking for comprehensive learning |
| proposal prop-risk-001 autoApply is false | PASS | false |
| proposal prop-risk-001 has status | PASS | pending_future_review_queue |
| proposal prop-risk-002 autoApply is false | PASS | false |
| proposal prop-risk-002 has status | PASS | pending_future_review_queue |
| cycleId exists | PASS | cycle-20260520-2356 |
| cycleStartedAt exists | PASS | 2026-05-20T23:56:14.139Z |
| generatedAt exists | PASS | 2026-05-29T19:51:10.603Z |
| No NaN or Infinity values in output | PASS | All values finite |
| Builder runs without error | PASS | buildRiskDeskLearning() executed |
| Fresh build paperSimulation is true | PASS | true |
| Fresh build has approvedTrades array | PASS | object |
| Fresh build has rejectedTrades array | PASS | object |
| Fresh build has watchedSignals array | PASS | object |
| Fresh build has shadowTrades array | PASS | object |
| Fresh build has recommendations array | PASS | object |
| Fresh build has proposals array | PASS | object |
| Fresh build has summary object | PASS | object |
| No recommendation has autoApply true | PASS | false |
| No proposal has autoApply true | PASS | false |
| Fresh build has no NaN/Infinity | PASS | All values finite |
