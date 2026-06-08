# MarketOps Risk Desk Learning QA Report v0.1

Generated: 2026-06-08T18:11:15.701Z

**Result:** FAIL
**Checks Passed:** 819 / 820

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
| summary.approvedCount exists | PASS | 18 |
| summary.rejectedCount exists | PASS | 132 |
| summary.watchedCount exists | PASS | 65 |
| summary.shadowTrackedCount exists | PASS | 132 |
| summary.possibleFalsePositiveCount exists | PASS | 4 |
| summary.possibleFalseNegativeCount exists | PASS | 1 |
| summary.goodApprovalCount exists | PASS | 0 |
| summary.badApprovalCount exists | PASS | 4 |
| summary.goodRejectionCount exists | PASS | 29 |
| summary.badRejectionCount exists | PASS | 1 |
| summary.inconclusiveCount exists | PASS | 181 |
| summary.bestDecision exists | PASS | No clear best decision yet. |
| summary.worstDecision exists | PASS | Rejected SQ: Price moved higher after rejection (bad_rejection_missed_winner). |
| summary.learningNotes exists | PASS | Risk Desk reviewed 215 total items. 0 good approvals, 4 possible false positives, 29 good rejections, 1 possible false negatives, 181 inconclusive. Learning records built from Cruise 1 cycle data. Most outcomes are still early (positions held less than 1 week). |
| summary counts are numbers | PASS | Types ok |
| approvedTrades item SMH.symbol exists | PASS | SMH |
| approvedTrades item SMH.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item SMH.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item SMH.confidence exists | PASS | 0.61 |
| approvedTrades item SMH.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item SMH.signalReason exists | PASS | SMH moved 2.15% across Alpaca IEX market data. |
| approvedTrades item JPM.symbol exists | PASS | JPM |
| approvedTrades item JPM.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item JPM.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item JPM.confidence exists | PASS | 0.16 |
| approvedTrades item JPM.riskReason exists | PASS | Risk Desk approved (approved_learning_probe) for fake paper execution only. Position size multiplier: 0.25. |
| approvedTrades item JPM.signalReason exists | PASS | JPM moved 1.64% — near candidate threshold for learning probe. |
| approvedTrades item AMD.symbol exists | PASS | AMD |
| approvedTrades item AMD.outcomeLabel exists | PASS | bad_approval |
| approvedTrades item AMD.plainEnglishOutcome exists | PASS | Risk Desk approved this trade but it closed at -$0.07 loss (0%). Needs review. |
| approvedTrades item AMD.confidence exists | PASS | 0.6 |
| approvedTrades item AMD.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item AMD.signalReason exists | PASS | AMD moved 2.03% across Alpaca IEX market data. |
| approvedTrades item WFC.symbol exists | PASS | WFC |
| approvedTrades item WFC.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item WFC.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item WFC.confidence exists | PASS | 0.8 |
| approvedTrades item WFC.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item WFC.signalReason exists | PASS | WFC moved 6.08% across Alpaca IEX market data. |
| approvedTrades item IBM.symbol exists | PASS | IBM |
| approvedTrades item IBM.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item IBM.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item IBM.confidence exists | PASS | 0.9 |
| approvedTrades item IBM.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item IBM.signalReason exists | PASS | IBM moved 10.52% across Alpaca IEX market data. |
| approvedTrades item AMAT.symbol exists | PASS | AMAT |
| approvedTrades item AMAT.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item AMAT.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item AMAT.confidence exists | PASS | 0.9 |
| approvedTrades item AMAT.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item AMAT.signalReason exists | PASS | AMAT moved 11.74% across Alpaca IEX market data. |
| approvedTrades item AMD.symbol exists | PASS | AMD |
| approvedTrades item AMD.outcomeLabel exists | PASS | bad_approval |
| approvedTrades item AMD.plainEnglishOutcome exists | PASS | Risk Desk approved this trade but it closed at -$0.07 loss (0%). Needs review. |
| approvedTrades item AMD.confidence exists | PASS | 0.6 |
| approvedTrades item AMD.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item AMD.signalReason exists | PASS | AMD moved 2.03% across Alpaca IEX market data. |
| approvedTrades item MU.symbol exists | PASS | MU |
| approvedTrades item MU.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item MU.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item MU.confidence exists | PASS | 0.9 |
| approvedTrades item MU.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item MU.signalReason exists | PASS | MU moved 18.73% across Alpaca IEX market data. |
| approvedTrades item NOW.symbol exists | PASS | NOW |
| approvedTrades item NOW.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item NOW.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item NOW.confidence exists | PASS | 0.9 |
| approvedTrades item NOW.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item NOW.signalReason exists | PASS | NOW moved 15.18% across Alpaca IEX market data. |
| approvedTrades item LRCX.symbol exists | PASS | LRCX |
| approvedTrades item LRCX.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item LRCX.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item LRCX.confidence exists | PASS | 0.72 |
| approvedTrades item LRCX.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item LRCX.signalReason exists | PASS | LRCX moved 4.43% across Alpaca IEX market data. |
| approvedTrades item GS.symbol exists | PASS | GS |
| approvedTrades item GS.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item GS.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item GS.confidence exists | PASS | 0.7 |
| approvedTrades item GS.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item GS.signalReason exists | PASS | GS moved 3.96% across Alpaca IEX market data. |
| approvedTrades item PANW.symbol exists | PASS | PANW |
| approvedTrades item PANW.outcomeLabel exists | PASS | bad_approval |
| approvedTrades item PANW.plainEnglishOutcome exists | PASS | Risk Desk approved this trade but it closed at -$0.03 loss (0%). Needs review. |
| approvedTrades item PANW.confidence exists | PASS | 0.7 |
| approvedTrades item PANW.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item PANW.signalReason exists | PASS | PANW moved 3.93% across Alpaca IEX market data. |
| approvedTrades item C.symbol exists | PASS | C |
| approvedTrades item C.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item C.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item C.confidence exists | PASS | 0.82 |
| approvedTrades item C.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item C.signalReason exists | PASS | C moved 6.37% across Alpaca IEX market data. |
| approvedTrades item F.symbol exists | PASS | F |
| approvedTrades item F.outcomeLabel exists | PASS | bad_approval |
| approvedTrades item F.plainEnglishOutcome exists | PASS | Risk Desk approved this trade but it closed at -$0.02 loss (0%). Needs review. |
| approvedTrades item F.confidence exists | PASS | 0.19 |
| approvedTrades item F.riskReason exists | PASS | Risk Desk approved (approved_learning_probe) for fake paper execution only. Position size multiplier: 0.25. |
| approvedTrades item F.signalReason exists | PASS | F moved 1.92% — near candidate threshold for learning probe. |
| approvedTrades item GM.symbol exists | PASS | GM |
| approvedTrades item GM.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item GM.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item GM.confidence exists | PASS | 0.77 |
| approvedTrades item GM.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item GM.signalReason exists | PASS | GM moved 5.41% across Alpaca IEX market data. |
| approvedTrades item RIVN.symbol exists | PASS | RIVN |
| approvedTrades item RIVN.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item RIVN.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item RIVN.confidence exists | PASS | 0.9 |
| approvedTrades item RIVN.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item RIVN.signalReason exists | PASS | RIVN moved 20.68% across Alpaca IEX market data. |
| approvedTrades item HOOD.symbol exists | PASS | HOOD |
| approvedTrades item HOOD.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item HOOD.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item HOOD.confidence exists | PASS | 0.9 |
| approvedTrades item HOOD.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item HOOD.signalReason exists | PASS | HOOD moved 13.47% across Alpaca IEX market data. |
| approvedTrades item TSM.symbol exists | PASS | TSM |
| approvedTrades item TSM.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item TSM.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item TSM.confidence exists | PASS | 0.71 |
| approvedTrades item TSM.riskReason exists | PASS | Risk Desk approved (approved_standard) for fake paper execution only. Position size multiplier: 1. |
| approvedTrades item TSM.signalReason exists | PASS | TSM moved 4.23% across Alpaca IEX market data. |
| rejectedTrades item SPY.symbol exists | PASS | SPY |
| rejectedTrades item SPY.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item SPY.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item SPY.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item SPY.confidence exists | PASS | 0.12 |
| rejectedTrades item QQQ.symbol exists | PASS | QQQ |
| rejectedTrades item QQQ.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item QQQ.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item QQQ.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item QQQ.confidence exists | PASS | 0.1 |
| rejectedTrades item IWM.symbol exists | PASS | IWM |
| rejectedTrades item IWM.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item IWM.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item IWM.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item IWM.confidence exists | PASS | 0.12 |
| rejectedTrades item DIA.symbol exists | PASS | DIA |
| rejectedTrades item DIA.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item DIA.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item DIA.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item DIA.confidence exists | PASS | 0.1 |
| rejectedTrades item VTI.symbol exists | PASS | VTI |
| rejectedTrades item VTI.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item VTI.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item VTI.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item VTI.confidence exists | PASS | 0.1 |
| rejectedTrades item VOO.symbol exists | PASS | VOO |
| rejectedTrades item VOO.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item VOO.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item VOO.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item VOO.confidence exists | PASS | 0.11 |
| rejectedTrades item VXUS.symbol exists | PASS | VXUS |
| rejectedTrades item VXUS.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item VXUS.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item VXUS.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item VXUS.confidence exists | PASS | 0.63 |
| rejectedTrades item BND.symbol exists | PASS | BND |
| rejectedTrades item BND.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item BND.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item BND.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item BND.confidence exists | PASS | 0.1 |
| rejectedTrades item BNDX.symbol exists | PASS | BNDX |
| rejectedTrades item BNDX.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item BNDX.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item BNDX.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item BNDX.confidence exists | PASS | 0.1 |
| rejectedTrades item VT.symbol exists | PASS | VT |
| rejectedTrades item VT.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item VT.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item VT.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item VT.confidence exists | PASS | 0.16 |
| rejectedTrades item VB.symbol exists | PASS | VB |
| rejectedTrades item VB.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item VB.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item VB.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item VB.confidence exists | PASS | 0.1 |
| rejectedTrades item VO.symbol exists | PASS | VO |
| rejectedTrades item VO.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item VO.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item VO.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item VO.confidence exists | PASS | 0.1 |
| rejectedTrades item VV.symbol exists | PASS | VV |
| rejectedTrades item VV.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item VV.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item VV.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item VV.confidence exists | PASS | 0.1 |
| rejectedTrades item IVV.symbol exists | PASS | IVV |
| rejectedTrades item IVV.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item IVV.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item IVV.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item IVV.confidence exists | PASS | 0.11 |
| rejectedTrades item IJR.symbol exists | PASS | IJR |
| rejectedTrades item IJR.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item IJR.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item IJR.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item IJR.confidence exists | PASS | 0.1 |
| rejectedTrades item IJH.symbol exists | PASS | IJH |
| rejectedTrades item IJH.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item IJH.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item IJH.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item IJH.confidence exists | PASS | 0.1 |
| rejectedTrades item SCHB.symbol exists | PASS | SCHB |
| rejectedTrades item SCHB.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item SCHB.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item SCHB.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item SCHB.confidence exists | PASS | 0.1 |
| rejectedTrades item SCHX.symbol exists | PASS | SCHX |
| rejectedTrades item SCHX.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item SCHX.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item SCHX.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item SCHX.confidence exists | PASS | 0.1 |
| rejectedTrades item SCHF.symbol exists | PASS | SCHF |
| rejectedTrades item SCHF.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item SCHF.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item SCHF.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item SCHF.confidence exists | PASS | 0.61 |
| rejectedTrades item XLF.symbol exists | PASS | XLF |
| rejectedTrades item XLF.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item XLF.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item XLF.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item XLF.confidence exists | PASS | 0.1 |
| rejectedTrades item XLK.symbol exists | PASS | XLK |
| rejectedTrades item XLK.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item XLK.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item XLK.riskDeskReason exists | PASS | Risk Desk blocked this signal for Phase 1 paper simulation. |
| rejectedTrades item XLK.confidence exists | PASS | 0.14 |
| rejectedTrades item XLV.symbol exists | PASS | XLV |
| rejectedTrades item XLV.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item XLV.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item XLV.riskDeskReason exists | PASS | Position already open for XLV. |
| rejectedTrades item XLV.confidence exists | PASS | 0.6 |
| rejectedTrades item XLE.symbol exists | PASS | XLE |
| rejectedTrades item XLE.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item XLE.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item XLE.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item XLE.confidence exists | PASS | 0.1 |
| rejectedTrades item XLI.symbol exists | PASS | XLI |
| rejectedTrades item XLI.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item XLI.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item XLI.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item XLI.confidence exists | PASS | 0.1 |
| rejectedTrades item XLP.symbol exists | PASS | XLP |
| rejectedTrades item XLP.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item XLP.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item XLP.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item XLP.confidence exists | PASS | 0.19 |
| rejectedTrades item XLY.symbol exists | PASS | XLY |
| rejectedTrades item XLY.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item XLY.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item XLY.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item XLY.confidence exists | PASS | 0.69 |
| rejectedTrades item XLU.symbol exists | PASS | XLU |
| rejectedTrades item XLU.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item XLU.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item XLU.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item XLU.confidence exists | PASS | 0.72 |
| rejectedTrades item XLRE.symbol exists | PASS | XLRE |
| rejectedTrades item XLRE.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item XLRE.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item XLRE.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item XLRE.confidence exists | PASS | 0.15 |
| rejectedTrades item XLC.symbol exists | PASS | XLC |
| rejectedTrades item XLC.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item XLC.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item XLC.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item XLC.confidence exists | PASS | 0.71 |
| rejectedTrades item IBB.symbol exists | PASS | IBB |
| rejectedTrades item IBB.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item IBB.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item IBB.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item IBB.confidence exists | PASS | 0.6 |
| rejectedTrades item KRE.symbol exists | PASS | KRE |
| rejectedTrades item KRE.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item KRE.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item KRE.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item KRE.confidence exists | PASS | 0.1 |
| rejectedTrades item KBE.symbol exists | PASS | KBE |
| rejectedTrades item KBE.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item KBE.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item KBE.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item KBE.confidence exists | PASS | 0.1 |
| rejectedTrades item OIH.symbol exists | PASS | OIH |
| rejectedTrades item OIH.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item OIH.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item OIH.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item OIH.confidence exists | PASS | 0.61 |
| rejectedTrades item XHB.symbol exists | PASS | XHB |
| rejectedTrades item XHB.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item XHB.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item XHB.riskDeskReason exists | PASS | Position already open for XHB. |
| rejectedTrades item XHB.confidence exists | PASS | 0.18 |
| rejectedTrades item XRT.symbol exists | PASS | XRT |
| rejectedTrades item XRT.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item XRT.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item XRT.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item XRT.confidence exists | PASS | 0.1 |
| rejectedTrades item GDX.symbol exists | PASS | GDX |
| rejectedTrades item GDX.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item GDX.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item GDX.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item GDX.confidence exists | PASS | 0.9 |
| rejectedTrades item GDXJ.symbol exists | PASS | GDXJ |
| rejectedTrades item GDXJ.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item GDXJ.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item GDXJ.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item GDXJ.confidence exists | PASS | 0.9 |
| rejectedTrades item SLV.symbol exists | PASS | SLV |
| rejectedTrades item SLV.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item SLV.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item SLV.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item SLV.confidence exists | PASS | 0.9 |
| rejectedTrades item GLD.symbol exists | PASS | GLD |
| rejectedTrades item GLD.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item GLD.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item GLD.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item GLD.confidence exists | PASS | 0.68 |
| rejectedTrades item TLT.symbol exists | PASS | TLT |
| rejectedTrades item TLT.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item TLT.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item TLT.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item TLT.confidence exists | PASS | 0.1 |
| rejectedTrades item IEF.symbol exists | PASS | IEF |
| rejectedTrades item IEF.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item IEF.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item IEF.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item IEF.confidence exists | PASS | 0.1 |
| rejectedTrades item SHY.symbol exists | PASS | SHY |
| rejectedTrades item SHY.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item SHY.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item SHY.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item SHY.confidence exists | PASS | 0.1 |
| rejectedTrades item LQD.symbol exists | PASS | LQD |
| rejectedTrades item LQD.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item LQD.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item LQD.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item LQD.confidence exists | PASS | 0.1 |
| rejectedTrades item HYG.symbol exists | PASS | HYG |
| rejectedTrades item HYG.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item HYG.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item HYG.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item HYG.confidence exists | PASS | 0.1 |
| rejectedTrades item EMB.symbol exists | PASS | EMB |
| rejectedTrades item EMB.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item EMB.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item EMB.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item EMB.confidence exists | PASS | 0.1 |
| rejectedTrades item TIP.symbol exists | PASS | TIP |
| rejectedTrades item TIP.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item TIP.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item TIP.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item TIP.confidence exists | PASS | 0.13 |
| rejectedTrades item MBB.symbol exists | PASS | MBB |
| rejectedTrades item MBB.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item MBB.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item MBB.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item MBB.confidence exists | PASS | 0.1 |
| rejectedTrades item EEM.symbol exists | PASS | EEM |
| rejectedTrades item EEM.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item EEM.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item EEM.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item EEM.confidence exists | PASS | 0.62 |
| rejectedTrades item EFA.symbol exists | PASS | EFA |
| rejectedTrades item EFA.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item EFA.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item EFA.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item EFA.confidence exists | PASS | 0.61 |
| rejectedTrades item VEA.symbol exists | PASS | VEA |
| rejectedTrades item VEA.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item VEA.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item VEA.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item VEA.confidence exists | PASS | 0.62 |
| rejectedTrades item VWO.symbol exists | PASS | VWO |
| rejectedTrades item VWO.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item VWO.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item VWO.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item VWO.confidence exists | PASS | 0.63 |
| rejectedTrades item ARKK.symbol exists | PASS | ARKK |
| rejectedTrades item ARKK.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item ARKK.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item ARKK.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item ARKK.confidence exists | PASS | 0.16 |
| rejectedTrades item ARKW.symbol exists | PASS | ARKW |
| rejectedTrades item ARKW.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item ARKW.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item ARKW.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item ARKW.confidence exists | PASS | 0.67 |
| rejectedTrades item ARKG.symbol exists | PASS | ARKG |
| rejectedTrades item ARKG.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item ARKG.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item ARKG.riskDeskReason exists | PASS | Position already open for ARKG. |
| rejectedTrades item ARKG.confidence exists | PASS | 0.86 |
| rejectedTrades item ARKF.symbol exists | PASS | ARKF |
| rejectedTrades item ARKF.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item ARKF.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item ARKF.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item ARKF.confidence exists | PASS | 0.74 |
| rejectedTrades item SOXX.symbol exists | PASS | SOXX |
| rejectedTrades item SOXX.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item SOXX.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item SOXX.riskDeskReason exists | PASS | Position already open for SOXX. |
| rejectedTrades item SOXX.confidence exists | PASS | 0.71 |
| rejectedTrades item TAN.symbol exists | PASS | TAN |
| rejectedTrades item TAN.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item TAN.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item TAN.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item TAN.confidence exists | PASS | 0.79 |
| rejectedTrades item ICLN.symbol exists | PASS | ICLN |
| rejectedTrades item ICLN.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item ICLN.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item ICLN.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item ICLN.confidence exists | PASS | 0.87 |
| rejectedTrades item XBI.symbol exists | PASS | XBI |
| rejectedTrades item XBI.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item XBI.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item XBI.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item XBI.confidence exists | PASS | 0.68 |
| rejectedTrades item LABU.symbol exists | PASS | LABU |
| rejectedTrades item LABU.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item LABU.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item LABU.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item LABU.confidence exists | PASS | 0.9 |
| rejectedTrades item FXI.symbol exists | PASS | FXI |
| rejectedTrades item FXI.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item FXI.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item FXI.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item FXI.confidence exists | PASS | 0.63 |
| rejectedTrades item EWJ.symbol exists | PASS | EWJ |
| rejectedTrades item EWJ.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item EWJ.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item EWJ.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item EWJ.confidence exists | PASS | 0.11 |
| rejectedTrades item EWZ.symbol exists | PASS | EWZ |
| rejectedTrades item EWZ.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item EWZ.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item EWZ.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item EWZ.confidence exists | PASS | 0.9 |
| rejectedTrades item INDA.symbol exists | PASS | INDA |
| rejectedTrades item INDA.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item INDA.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item INDA.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item INDA.confidence exists | PASS | 0.64 |
| rejectedTrades item AAPL.symbol exists | PASS | AAPL |
| rejectedTrades item AAPL.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item AAPL.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item AAPL.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item AAPL.confidence exists | PASS | 0.15 |
| rejectedTrades item MSFT.symbol exists | PASS | MSFT |
| rejectedTrades item MSFT.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item MSFT.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item MSFT.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item MSFT.confidence exists | PASS | 0.1 |
| rejectedTrades item NVDA.symbol exists | PASS | NVDA |
| rejectedTrades item NVDA.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item NVDA.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item NVDA.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item NVDA.confidence exists | PASS | 0.63 |
| rejectedTrades item AMZN.symbol exists | PASS | AMZN |
| rejectedTrades item AMZN.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item AMZN.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item AMZN.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item AMZN.confidence exists | PASS | 0.9 |
| rejectedTrades item META.symbol exists | PASS | META |
| rejectedTrades item META.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item META.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item META.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item META.confidence exists | PASS | 0.68 |
| rejectedTrades item GOOGL.symbol exists | PASS | GOOGL |
| rejectedTrades item GOOGL.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item GOOGL.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item GOOGL.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item GOOGL.confidence exists | PASS | 0.75 |
| rejectedTrades item GOOG.symbol exists | PASS | GOOG |
| rejectedTrades item GOOG.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item GOOG.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item GOOG.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item GOOG.confidence exists | PASS | 0.74 |
| rejectedTrades item TSLA.symbol exists | PASS | TSLA |
| rejectedTrades item TSLA.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item TSLA.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item TSLA.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item TSLA.confidence exists | PASS | 0.74 |
| rejectedTrades item AVGO.symbol exists | PASS | AVGO |
| rejectedTrades item AVGO.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item AVGO.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item AVGO.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item AVGO.confidence exists | PASS | 0.78 |
| rejectedTrades item V.symbol exists | PASS | V |
| rejectedTrades item V.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item V.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item V.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item V.confidence exists | PASS | 0.18 |
| rejectedTrades item JNJ.symbol exists | PASS | JNJ |
| rejectedTrades item JNJ.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item JNJ.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item JNJ.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item JNJ.confidence exists | PASS | 0.1 |
| rejectedTrades item WMT.symbol exists | PASS | WMT |
| rejectedTrades item WMT.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item WMT.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.07% (-$0.08 per share). Avoided a losing trade. |
| rejectedTrades item WMT.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item WMT.confidence exists | PASS | 0.1 |
| rejectedTrades item PG.symbol exists | PASS | PG |
| rejectedTrades item PG.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item PG.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.09% (-$0.13 per share). Avoided a losing trade. |
| rejectedTrades item PG.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item PG.confidence exists | PASS | 0.1 |
| rejectedTrades item XOM.symbol exists | PASS | XOM |
| rejectedTrades item XOM.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item XOM.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.01% (-$0.02 per share). Avoided a losing trade. |
| rejectedTrades item XOM.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item XOM.confidence exists | PASS | 0.11 |
| rejectedTrades item UNH.symbol exists | PASS | UNH |
| rejectedTrades item UNH.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item UNH.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.03% (-$0.11 per share). Avoided a losing trade. |
| rejectedTrades item UNH.riskDeskReason exists | PASS | Position already open for UNH. |
| rejectedTrades item UNH.confidence exists | PASS | 0.78 |
| rejectedTrades item HD.symbol exists | PASS | HD |
| rejectedTrades item HD.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item HD.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.02% (-$0.06 per share). Avoided a losing trade. |
| rejectedTrades item HD.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item HD.confidence exists | PASS | 0.14 |
| rejectedTrades item COST.symbol exists | PASS | COST |
| rejectedTrades item COST.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item COST.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item COST.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item COST.confidence exists | PASS | 0.75 |
| rejectedTrades item MRK.symbol exists | PASS | MRK |
| rejectedTrades item MRK.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item MRK.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item MRK.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item MRK.confidence exists | PASS | 0.63 |
| rejectedTrades item ABBV.symbol exists | PASS | ABBV |
| rejectedTrades item ABBV.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item ABBV.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item ABBV.riskDeskReason exists | PASS | Position already open for ABBV. |
| rejectedTrades item ABBV.confidence exists | PASS | 0.65 |
| rejectedTrades item CRM.symbol exists | PASS | CRM |
| rejectedTrades item CRM.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item CRM.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item CRM.riskDeskReason exists | PASS | Position already open for CRM. |
| rejectedTrades item CRM.confidence exists | PASS | 0.6 |
| rejectedTrades item NFLX.symbol exists | PASS | NFLX |
| rejectedTrades item NFLX.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item NFLX.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has edged up 0.01% (+$0.01 per share). Movement is minor. |
| rejectedTrades item NFLX.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item NFLX.confidence exists | PASS | 0.83 |
| rejectedTrades item INTC.symbol exists | PASS | INTC |
| rejectedTrades item INTC.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item INTC.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has edged up 0.1% (+$0.11 per share). Movement is minor. |
| rejectedTrades item INTC.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item INTC.confidence exists | PASS | 0.89 |
| rejectedTrades item BRK.B.symbol exists | PASS | BRK.B |
| rejectedTrades item BRK.B.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item BRK.B.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item BRK.B.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item BRK.B.confidence exists | PASS | 0.1 |
| rejectedTrades item LLY.symbol exists | PASS | LLY |
| rejectedTrades item LLY.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item LLY.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.02% (-$0.18 per share). Avoided a losing trade. |
| rejectedTrades item LLY.riskDeskReason exists | PASS | Position already open for LLY. |
| rejectedTrades item LLY.confidence exists | PASS | 0.9 |
| rejectedTrades item MA.symbol exists | PASS | MA |
| rejectedTrades item MA.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item MA.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.01% (-$0.04 per share). Avoided a losing trade. |
| rejectedTrades item MA.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item MA.confidence exists | PASS | 0.19 |
| rejectedTrades item ORCL.symbol exists | PASS | ORCL |
| rejectedTrades item ORCL.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item ORCL.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item ORCL.riskDeskReason exists | PASS | Position already open for ORCL. |
| rejectedTrades item ORCL.confidence exists | PASS | 0.9 |
| rejectedTrades item ADBE.symbol exists | PASS | ADBE |
| rejectedTrades item ADBE.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item ADBE.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.04% (-$0.11 per share). Avoided a losing trade. |
| rejectedTrades item ADBE.riskDeskReason exists | PASS | Position already open for ADBE. |
| rejectedTrades item ADBE.confidence exists | PASS | 0.14 |
| rejectedTrades item CSCO.symbol exists | PASS | CSCO |
| rejectedTrades item CSCO.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item CSCO.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has edged up 0.1% (+$0.13 per share). Movement is minor. |
| rejectedTrades item CSCO.riskDeskReason exists | PASS | Position already open for CSCO. |
| rejectedTrades item CSCO.confidence exists | PASS | 0.71 |
| rejectedTrades item ACN.symbol exists | PASS | ACN |
| rejectedTrades item ACN.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item ACN.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.22% (-$0.38 per share). Avoided a losing trade. |
| rejectedTrades item ACN.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item ACN.confidence exists | PASS | 0.1 |
| rejectedTrades item DIS.symbol exists | PASS | DIS |
| rejectedTrades item DIS.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item DIS.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.02% (-$0.02 per share). Avoided a losing trade. |
| rejectedTrades item DIS.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item DIS.confidence exists | PASS | 0.72 |
| rejectedTrades item PFE.symbol exists | PASS | PFE |
| rejectedTrades item PFE.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item PFE.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has edged up 0.02% (+$0.01 per share). Movement is minor. |
| rejectedTrades item PFE.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item PFE.confidence exists | PASS | 0.1 |
| rejectedTrades item TMO.symbol exists | PASS | TMO |
| rejectedTrades item TMO.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item TMO.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.01% (-$0.06 per share). Avoided a losing trade. |
| rejectedTrades item TMO.riskDeskReason exists | PASS | Position already open for TMO. |
| rejectedTrades item TMO.confidence exists | PASS | 0.82 |
| rejectedTrades item BAC.symbol exists | PASS | BAC |
| rejectedTrades item BAC.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item BAC.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.02% (-$0.01 per share). Avoided a losing trade. |
| rejectedTrades item BAC.riskDeskReason exists | PASS | Position already open for BAC. |
| rejectedTrades item BAC.confidence exists | PASS | 0.65 |
| rejectedTrades item KO.symbol exists | PASS | KO |
| rejectedTrades item KO.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item KO.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.05% (-$0.04 per share). Avoided a losing trade. |
| rejectedTrades item KO.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item KO.confidence exists | PASS | 0.6 |
| rejectedTrades item PEP.symbol exists | PASS | PEP |
| rejectedTrades item PEP.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item PEP.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.04% (-$0.05 per share). Avoided a losing trade. |
| rejectedTrades item PEP.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item PEP.confidence exists | PASS | 0.8 |
| rejectedTrades item ABT.symbol exists | PASS | ABT |
| rejectedTrades item ABT.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item ABT.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.05% (-$0.05 per share). Avoided a losing trade. |
| rejectedTrades item ABT.riskDeskReason exists | PASS | Position already open for ABT. |
| rejectedTrades item ABT.confidence exists | PASS | 0.76 |
| rejectedTrades item TXN.symbol exists | PASS | TXN |
| rejectedTrades item TXN.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item TXN.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item TXN.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item TXN.confidence exists | PASS | 0.88 |
| rejectedTrades item QCOM.symbol exists | PASS | QCOM |
| rejectedTrades item QCOM.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item QCOM.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item QCOM.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item QCOM.confidence exists | PASS | 0.9 |
| rejectedTrades item AMGN.symbol exists | PASS | AMGN |
| rejectedTrades item AMGN.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item AMGN.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item AMGN.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled.; Position already open for AMGN. |
| rejectedTrades item AMGN.confidence exists | PASS | 0.1 |
| rejectedTrades item HON.symbol exists | PASS | HON |
| rejectedTrades item HON.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item HON.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item HON.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item HON.confidence exists | PASS | 0.9 |
| rejectedTrades item UBER.symbol exists | PASS | UBER |
| rejectedTrades item UBER.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item UBER.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has edged up 0.09% (+$0.06 per share). Movement is minor. |
| rejectedTrades item UBER.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item UBER.confidence exists | PASS | 0.17 |
| rejectedTrades item NKE.symbol exists | PASS | NKE |
| rejectedTrades item NKE.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item NKE.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.05% (-$0.02 per share). Avoided a losing trade. |
| rejectedTrades item NKE.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item NKE.confidence exists | PASS | 0.67 |
| rejectedTrades item BA.symbol exists | PASS | BA |
| rejectedTrades item BA.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item BA.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item BA.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item BA.confidence exists | PASS | 0.62 |
| rejectedTrades item MCD.symbol exists | PASS | MCD |
| rejectedTrades item MCD.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item MCD.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.02% (-$0.06 per share). Avoided a losing trade. |
| rejectedTrades item MCD.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item MCD.confidence exists | PASS | 0.13 |
| rejectedTrades item CAT.symbol exists | PASS | CAT |
| rejectedTrades item CAT.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item CAT.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item CAT.riskDeskReason exists | PASS | Position already open for CAT. |
| rejectedTrades item CAT.confidence exists | PASS | 0.66 |
| rejectedTrades item GE.symbol exists | PASS | GE |
| rejectedTrades item GE.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item GE.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has edged up 0.02% (+$0.06 per share). Movement is minor. |
| rejectedTrades item GE.riskDeskReason exists | PASS | Position already open for GE. |
| rejectedTrades item GE.confidence exists | PASS | 0.74 |
| rejectedTrades item RTX.symbol exists | PASS | RTX |
| rejectedTrades item RTX.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item RTX.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.01% (-$0.01 per share). Avoided a losing trade. |
| rejectedTrades item RTX.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled.; Position already open for RTX. |
| rejectedTrades item RTX.confidence exists | PASS | 0.1 |
| rejectedTrades item PLD.symbol exists | PASS | PLD |
| rejectedTrades item PLD.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item PLD.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item PLD.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item PLD.confidence exists | PASS | 0.66 |
| rejectedTrades item SYK.symbol exists | PASS | SYK |
| rejectedTrades item SYK.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item SYK.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item SYK.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item SYK.confidence exists | PASS | 0.68 |
| rejectedTrades item BLK.symbol exists | PASS | BLK |
| rejectedTrades item BLK.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item BLK.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item BLK.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item BLK.confidence exists | PASS | 0.9 |
| rejectedTrades item ADI.symbol exists | PASS | ADI |
| rejectedTrades item ADI.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item ADI.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.01% (-$0.05 per share). Avoided a losing trade. |
| rejectedTrades item ADI.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item ADI.confidence exists | PASS | 0.1 |
| rejectedTrades item AXP.symbol exists | PASS | AXP |
| rejectedTrades item AXP.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item AXP.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item AXP.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item AXP.confidence exists | PASS | 0.1 |
| rejectedTrades item BKNG.symbol exists | PASS | BKNG |
| rejectedTrades item BKNG.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item BKNG.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.04% (-$0.07 per share). Avoided a losing trade. |
| rejectedTrades item BKNG.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled.; Position already open for BKNG. |
| rejectedTrades item BKNG.confidence exists | PASS | 0.1 |
| rejectedTrades item GILD.symbol exists | PASS | GILD |
| rejectedTrades item GILD.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item GILD.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.06% (-$0.08 per share). Avoided a losing trade. |
| rejectedTrades item GILD.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item GILD.confidence exists | PASS | 0.8 |
| rejectedTrades item VRTX.symbol exists | PASS | VRTX |
| rejectedTrades item VRTX.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item VRTX.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item VRTX.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled.; Position already open for VRTX. |
| rejectedTrades item VRTX.confidence exists | PASS | 0.1 |
| rejectedTrades item REGN.symbol exists | PASS | REGN |
| rejectedTrades item REGN.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item REGN.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has edged up 0.02% (+$0.13 per share). Movement is minor. |
| rejectedTrades item REGN.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item REGN.confidence exists | PASS | 0.77 |
| rejectedTrades item ISRG.symbol exists | PASS | ISRG |
| rejectedTrades item ISRG.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item ISRG.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.04% (-$0.18 per share). Avoided a losing trade. |
| rejectedTrades item ISRG.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item ISRG.confidence exists | PASS | 0.71 |
| rejectedTrades item SBUX.symbol exists | PASS | SBUX |
| rejectedTrades item SBUX.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item SBUX.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.03% (-$0.03 per share). Avoided a losing trade. |
| rejectedTrades item SBUX.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item SBUX.confidence exists | PASS | 0.88 |
| rejectedTrades item MDLZ.symbol exists | PASS | MDLZ |
| rejectedTrades item MDLZ.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item MDLZ.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.11% (-$0.07 per share). Avoided a losing trade. |
| rejectedTrades item MDLZ.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item MDLZ.confidence exists | PASS | 0.1 |
| rejectedTrades item SCHW.symbol exists | PASS | SCHW |
| rejectedTrades item SCHW.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item SCHW.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item SCHW.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item SCHW.confidence exists | PASS | 0.13 |
| rejectedTrades item PYPL.symbol exists | PASS | PYPL |
| rejectedTrades item PYPL.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item PYPL.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.16% (-$0.06 per share). Avoided a losing trade. |
| rejectedTrades item PYPL.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item PYPL.confidence exists | PASS | 0.86 |
| rejectedTrades item SNAP.symbol exists | PASS | SNAP |
| rejectedTrades item SNAP.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item SNAP.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item SNAP.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item SNAP.confidence exists | PASS | 0.61 |
| rejectedTrades item SQ.symbol exists | PASS | SQ |
| rejectedTrades item SQ.outcomeLabel exists | PASS | bad_rejection_missed_winner |
| rejectedTrades item SQ.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since risen Infinity% (+$86.95 per share). Possible missed winner. |
| rejectedTrades item SQ.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled.; Missing invalidation. |
| rejectedTrades item SQ.confidence exists | PASS | 0 |
| rejectedTrades item DASH.symbol exists | PASS | DASH |
| rejectedTrades item DASH.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item DASH.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price is essentially unchanged since rejection. |
| rejectedTrades item DASH.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item DASH.confidence exists | PASS | 0.73 |
| rejectedTrades item LCID.symbol exists | PASS | LCID |
| rejectedTrades item LCID.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item LCID.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.19% (-$0.01 per share). Avoided a losing trade. |
| rejectedTrades item LCID.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item LCID.confidence exists | PASS | 0.9 |
| rejectedTrades item PLTR.symbol exists | PASS | PLTR |
| rejectedTrades item PLTR.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item PLTR.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.1% (-$0.13 per share). Avoided a losing trade. |
| rejectedTrades item PLTR.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item PLTR.confidence exists | PASS | 0.1 |
| rejectedTrades item COIN.symbol exists | PASS | COIN |
| rejectedTrades item COIN.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item COIN.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.32% (-$0.52 per share). Avoided a losing trade. |
| rejectedTrades item COIN.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item COIN.confidence exists | PASS | 0.9 |
| rejectedTrades item MSTR.symbol exists | PASS | MSTR |
| rejectedTrades item MSTR.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item MSTR.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.13% (-$0.16 per share). Avoided a losing trade. |
| rejectedTrades item MSTR.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item MSTR.confidence exists | PASS | 0.9 |
| recommendation rec-risk-001 autoApply is false | PASS | false |
| recommendation rec-risk-001 has title | PASS | Review approval criteria for underperforming positions |
| recommendation rec-risk-002 autoApply is false | PASS | false |
| recommendation rec-risk-002 has title | PASS | Review rejection criteria that may have missed winners |
| recommendation rec-risk-003 autoApply is false | PASS | false |
| recommendation rec-risk-003 has title | PASS | Continue shadow tracking for comprehensive learning |
| proposal prop-risk-001 autoApply is false | PASS | false |
| proposal prop-risk-001 has status | PASS | pending_future_review_queue |
| proposal prop-risk-002 autoApply is false | PASS | false |
| proposal prop-risk-002 has status | PASS | pending_future_review_queue |
| cycleId exists | PASS | cycle-20260530-1322 |
| cycleStartedAt exists | PASS | 2026-05-30T13:22:04.937Z |
| generatedAt exists | PASS | 2026-06-08T18:11:15.206Z |
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
| Fresh build has no NaN/Infinity | FAIL | freshData.rejectedTrades[126].shadowPnlPct is NaN or Infinity; freshData.shadowTrades[126].shadowPnlPct is NaN or Infinity |

## Failed Checks
- **Fresh build has no NaN/Infinity**: freshData.rejectedTrades[126].shadowPnlPct is NaN or Infinity; freshData.shadowTrades[126].shadowPnlPct is NaN or Infinity
