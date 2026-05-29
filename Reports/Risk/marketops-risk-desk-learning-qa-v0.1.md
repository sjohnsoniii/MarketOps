# MarketOps Risk Desk Learning QA Report v0.1

Generated: 2026-05-21T14:01:41.708Z

**Result:** PASS
**Checks Passed:** 220 / 220

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
| summary.approvedCount exists | PASS | 10 |
| summary.rejectedCount exists | PASS | 22 |
| summary.watchedCount exists | PASS | 24 |
| summary.shadowTrackedCount exists | PASS | 22 |
| summary.possibleFalsePositiveCount exists | PASS | 0 |
| summary.possibleFalseNegativeCount exists | PASS | 1 |
| summary.goodApprovalCount exists | PASS | 1 |
| summary.badApprovalCount exists | PASS | 0 |
| summary.goodRejectionCount exists | PASS | 16 |
| summary.badRejectionCount exists | PASS | 1 |
| summary.inconclusiveCount exists | PASS | 37 |
| summary.bestDecision exists | PASS | Approved XLE: Position performing well (good_approval). |
| summary.worstDecision exists | PASS | Rejected AMD: Price moved higher after rejection (bad_rejection_missed_winner). |
| summary.learningNotes exists | PASS | Risk Desk reviewed 56 total items. 1 good approvals, 0 possible false positives, 16 good rejections, 1 possible false negatives, 37 inconclusive. Learning records built from Cruise 1 cycle data. Most outcomes are still early (positions held less than 1 week). |
| summary counts are numbers | PASS | Types ok |
| approvedTrades item XLV.symbol exists | PASS | XLV |
| approvedTrades item XLV.outcomeLabel exists | PASS | too_early |
| approvedTrades item XLV.plainEnglishOutcome exists | PASS | Risk Desk approved this trade. Slightly down 0.08% (-$0.2). May still recover. |
| approvedTrades item XLV.confidence exists | PASS | 0.61 |
| approvedTrades item XLV.riskReason exists | PASS | Risk Desk approved this for fake paper execution only. |
| approvedTrades item XLV.signalReason exists | PASS | XLV moved 2.23% across Alpaca IEX market data. |
| approvedTrades item XLE.symbol exists | PASS | XLE |
| approvedTrades item XLE.outcomeLabel exists | PASS | good_approval |
| approvedTrades item XLE.plainEnglishOutcome exists | PASS | Risk Desk approved this trade. Position is up 0.03% (+$0.06). |
| approvedTrades item XLE.confidence exists | PASS | 0.68 |
| approvedTrades item XLE.riskReason exists | PASS | Risk Desk approved this for fake paper execution only. |
| approvedTrades item XLE.signalReason exists | PASS | XLE moved 3.65% across Alpaca IEX market data. |
| approvedTrades item AAPL.symbol exists | PASS | AAPL |
| approvedTrades item AAPL.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item AAPL.plainEnglishOutcome exists | PASS | Risk Desk approved this trade. Position is currently flat. |
| approvedTrades item AAPL.confidence exists | PASS | 0.67 |
| approvedTrades item AAPL.riskReason exists | PASS | Risk Desk approved this for fake paper execution only. |
| approvedTrades item AAPL.signalReason exists | PASS | AAPL moved 3.31% across Alpaca IEX market data. |
| approvedTrades item MSFT.symbol exists | PASS | MSFT |
| approvedTrades item MSFT.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item MSFT.plainEnglishOutcome exists | PASS | Risk Desk approved this trade. Position is currently flat. |
| approvedTrades item MSFT.confidence exists | PASS | 0.63 |
| approvedTrades item MSFT.riskReason exists | PASS | Risk Desk approved this for fake paper execution only. |
| approvedTrades item MSFT.signalReason exists | PASS | MSFT moved 2.6% across Alpaca IEX market data. |
| approvedTrades item NVDA.symbol exists | PASS | NVDA |
| approvedTrades item NVDA.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item NVDA.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item NVDA.confidence exists | PASS | 0.72 |
| approvedTrades item NVDA.riskReason exists | PASS | Risk Desk approved this for fake paper execution only. |
| approvedTrades item NVDA.signalReason exists | PASS | NVDA moved 4.37% across Alpaca IEX market data. |
| approvedTrades item JNJ.symbol exists | PASS | JNJ |
| approvedTrades item JNJ.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item JNJ.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item JNJ.confidence exists | PASS | 0.66 |
| approvedTrades item JNJ.riskReason exists | PASS | Risk Desk approved this for fake paper execution only. |
| approvedTrades item JNJ.signalReason exists | PASS | JNJ moved 3.18% across Alpaca IEX market data. |
| approvedTrades item XOM.symbol exists | PASS | XOM |
| approvedTrades item XOM.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item XOM.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item XOM.confidence exists | PASS | 0.68 |
| approvedTrades item XOM.riskReason exists | PASS | Risk Desk approved this for fake paper execution only. |
| approvedTrades item XOM.signalReason exists | PASS | XOM moved 3.7% across Alpaca IEX market data. |
| approvedTrades item COST.symbol exists | PASS | COST |
| approvedTrades item COST.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item COST.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item COST.confidence exists | PASS | 0.68 |
| approvedTrades item COST.riskReason exists | PASS | Risk Desk approved this for fake paper execution only. |
| approvedTrades item COST.signalReason exists | PASS | COST moved 3.52% across Alpaca IEX market data. |
| approvedTrades item ABBV.symbol exists | PASS | ABBV |
| approvedTrades item ABBV.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item ABBV.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item ABBV.confidence exists | PASS | 0.69 |
| approvedTrades item ABBV.riskReason exists | PASS | Risk Desk approved this for fake paper execution only. |
| approvedTrades item ABBV.signalReason exists | PASS | ABBV moved 3.78% across Alpaca IEX market data. |
| approvedTrades item NFLX.symbol exists | PASS | NFLX |
| approvedTrades item NFLX.outcomeLabel exists | PASS | inconclusive |
| approvedTrades item NFLX.plainEnglishOutcome exists | PASS | Approved but no matching position data yet. Trade may not have been executed. |
| approvedTrades item NFLX.confidence exists | PASS | 0.61 |
| approvedTrades item NFLX.riskReason exists | PASS | Risk Desk approved this for fake paper execution only. |
| approvedTrades item NFLX.signalReason exists | PASS | NFLX moved 2.17% across Alpaca IEX market data. |
| rejectedTrades item SPY.symbol exists | PASS | SPY |
| rejectedTrades item SPY.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item SPY.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.29% (-$2.16 per share). Avoided a losing trade. |
| rejectedTrades item SPY.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Confidence 0.1 is below minimum 0.55.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item SPY.confidence exists | PASS | 0.1 |
| rejectedTrades item QQQ.symbol exists | PASS | QQQ |
| rejectedTrades item QQQ.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item QQQ.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.31% (-$2.23 per share). Avoided a losing trade. |
| rejectedTrades item QQQ.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Confidence 0.1 is below minimum 0.55.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item QQQ.confidence exists | PASS | 0.1 |
| rejectedTrades item IWM.symbol exists | PASS | IWM |
| rejectedTrades item IWM.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item IWM.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.71% (-$2 per share). Avoided a losing trade. |
| rejectedTrades item IWM.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Confidence 0.12 is below minimum 0.55.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item IWM.confidence exists | PASS | 0.12 |
| rejectedTrades item DIA.symbol exists | PASS | DIA |
| rejectedTrades item DIA.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item DIA.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.34% (-$1.68 per share). Avoided a losing trade. |
| rejectedTrades item DIA.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Confidence 0.1 is below minimum 0.55.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item DIA.confidence exists | PASS | 0.1 |
| rejectedTrades item VTI.symbol exists | PASS | VTI |
| rejectedTrades item VTI.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item VTI.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.07% (-$0.26 per share). Avoided a losing trade. |
| rejectedTrades item VTI.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Confidence 0.1 is below minimum 0.55.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item VTI.confidence exists | PASS | 0.1 |
| rejectedTrades item XLF.symbol exists | PASS | XLF |
| rejectedTrades item XLF.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item XLF.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.35% (-$0.18 per share). Avoided a losing trade. |
| rejectedTrades item XLF.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Confidence 0.1 is below minimum 0.55.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item XLF.confidence exists | PASS | 0.1 |
| rejectedTrades item XLK.symbol exists | PASS | XLK |
| rejectedTrades item XLK.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item XLK.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.49% (-$0.87 per share). Avoided a losing trade. |
| rejectedTrades item XLK.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Confidence 0.14 is below minimum 0.55.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item XLK.confidence exists | PASS | 0.14 |
| rejectedTrades item AMZN.symbol exists | PASS | AMZN |
| rejectedTrades item AMZN.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item AMZN.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.52% (-$1.37 per share). Avoided a losing trade. |
| rejectedTrades item AMZN.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Confidence 0.13 is below minimum 0.55.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item AMZN.confidence exists | PASS | 0.13 |
| rejectedTrades item META.symbol exists | PASS | META |
| rejectedTrades item META.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item META.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has edged up 0.62% (+$3.68 per share). Movement is minor. |
| rejectedTrades item META.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Confidence 0.1 is below minimum 0.55.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item META.confidence exists | PASS | 0.1 |
| rejectedTrades item GOOGL.symbol exists | PASS | GOOGL |
| rejectedTrades item GOOGL.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item GOOGL.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has edged up 0.1% (+$0.4 per share). Movement is minor. |
| rejectedTrades item GOOGL.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Confidence 0.1 is below minimum 0.55.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item GOOGL.confidence exists | PASS | 0.1 |
| rejectedTrades item TSLA.symbol exists | PASS | TSLA |
| rejectedTrades item TSLA.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item TSLA.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has edged up 0.82% (+$3.43 per share). Movement is minor. |
| rejectedTrades item TSLA.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item TSLA.confidence exists | PASS | 0.73 |
| rejectedTrades item AVGO.symbol exists | PASS | AVGO |
| rejectedTrades item AVGO.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item AVGO.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.65% (-$2.72 per share). Avoided a losing trade. |
| rejectedTrades item AVGO.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Confidence 0.1 is below minimum 0.55.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item AVGO.confidence exists | PASS | 0.1 |
| rejectedTrades item JPM.symbol exists | PASS | JPM |
| rejectedTrades item JPM.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item JPM.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.35% (-$1.06 per share). Avoided a losing trade. |
| rejectedTrades item JPM.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Confidence 0.1 is below minimum 0.55.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item JPM.confidence exists | PASS | 0.1 |
| rejectedTrades item V.symbol exists | PASS | V |
| rejectedTrades item V.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item V.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.32% (-$1.07 per share). Avoided a losing trade. |
| rejectedTrades item V.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Confidence 0.13 is below minimum 0.55.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item V.confidence exists | PASS | 0.13 |
| rejectedTrades item WMT.symbol exists | PASS | WMT |
| rejectedTrades item WMT.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item WMT.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has edged up 0.84% (+$1.01 per share). Movement is minor. |
| rejectedTrades item WMT.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item WMT.confidence exists | PASS | 0.79 |
| rejectedTrades item PG.symbol exists | PASS | PG |
| rejectedTrades item PG.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item PG.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.05% (-$0.07 per share). Avoided a losing trade. |
| rejectedTrades item PG.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item PG.confidence exists | PASS | 0.61 |
| rejectedTrades item UNH.symbol exists | PASS | UNH |
| rejectedTrades item UNH.outcomeLabel exists | PASS | inconclusive |
| rejectedTrades item UNH.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has edged up 0.25% (+$0.94 per share). Movement is minor. |
| rejectedTrades item UNH.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Confidence 0.1 is below minimum 0.55.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item UNH.confidence exists | PASS | 0.1 |
| rejectedTrades item HD.symbol exists | PASS | HD |
| rejectedTrades item HD.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item HD.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.3% (-$0.92 per share). Avoided a losing trade. |
| rejectedTrades item HD.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Confidence 0.15 is below minimum 0.55.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item HD.confidence exists | PASS | 0.15 |
| rejectedTrades item MRK.symbol exists | PASS | MRK |
| rejectedTrades item MRK.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item MRK.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.6% (-$0.69 per share). Avoided a losing trade. |
| rejectedTrades item MRK.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Confidence 0.2 is below minimum 0.55.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item MRK.confidence exists | PASS | 0.2 |
| rejectedTrades item CRM.symbol exists | PASS | CRM |
| rejectedTrades item CRM.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item CRM.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 0.09% (-$0.15 per share). Avoided a losing trade. |
| rejectedTrades item CRM.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Confidence 0.18 is below minimum 0.55.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item CRM.confidence exists | PASS | 0.18 |
| rejectedTrades item AMD.symbol exists | PASS | AMD |
| rejectedTrades item AMD.outcomeLabel exists | PASS | bad_rejection_missed_winner |
| rejectedTrades item AMD.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since risen 1.31% (+$5.8 per share). Possible missed winner. |
| rejectedTrades item AMD.riskDeskReason exists | PASS | Signal did not qualify as a candidate.; Confidence 0.11 is below minimum 0.55.; Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item AMD.confidence exists | PASS | 0.11 |
| rejectedTrades item INTC.symbol exists | PASS | INTC |
| rejectedTrades item INTC.outcomeLabel exists | PASS | good_rejection |
| rejectedTrades item INTC.plainEnglishOutcome exists | PASS | Risk Desk rejected this trade. Price has since declined 2.26% (-$2.64 per share). Avoided a losing trade. |
| rejectedTrades item INTC.riskDeskReason exists | PASS | Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled. |
| rejectedTrades item INTC.confidence exists | PASS | 0.74 |
| recommendation rec-risk-002 autoApply is false | PASS | false |
| recommendation rec-risk-002 has title | PASS | Review rejection criteria that may have missed winners |
| recommendation rec-risk-003 autoApply is false | PASS | false |
| recommendation rec-risk-003 has title | PASS | Continue shadow tracking for comprehensive learning |
| proposal prop-risk-001 autoApply is false | PASS | false |
| proposal prop-risk-001 has status | PASS | pending_future_review_queue |
| proposal prop-risk-002 autoApply is false | PASS | false |
| proposal prop-risk-002 has status | PASS | pending_future_review_queue |
| cycleId exists | PASS | cycle-20260520-2356 |
| cycleStartedAt exists | PASS | 2026-05-20T23:56:14.139Z |
| generatedAt exists | PASS | 2026-05-21T14:01:41.308Z |
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
