# MarketOps Data Schema v0.1

Created: 2026-05-07 13:43:45

Status: Draft schema for Phase 1 paper simulation

---

## 1. Vehicle

Fields:

- symbol
- name
- assetType
- exchange
- sector
- universeTags
- liquidityClass
- isActive

---

## 2. MarketBar

Fields:

- timestamp
- symbol
- open
- high
- low
- close
- volume

---

## 3. StrategyDefinition

Fields:

- strategyId
- name
- version
- lane
- riskClass
- enabled
- allowedAssetTypes
- description

Allowed lanes:

- chaos
- candidate
- production

Phase 1 may use chaos and candidate only.

---

## 4. Signal

Fields:

- signalId
- timestamp
- symbol
- assetType
- directionBias
- strategyId
- strategyVersion
- confidence
- trigger
- invalidation
- suggestedStop
- suggestedTarget
- rationale
- lane

Allowed direction bias:

- up
- down
- avoid
- watch

---

## 5. RiskDecision

Fields:

- riskDecisionId
- signalId
- timestamp
- approved
- riskScore
- riskLevel
- blockReason
- notes

Allowed risk levels:

- low
- medium
- high
- blocked

---

## 6. PaperTrade

Fields:

- tradeId
- signalId
- strategyId
- strategyVersion
- symbol
- assetType
- side
- quantity
- entryTime
- entryPrice
- exitTime
- exitPrice
- status
- assumedFees
- assumedSlippage
- realizedPnl
- returnPct
- exitReason
- journalId

Allowed status:

- open
- closed
- blocked
- cancelled

---

## 7. Position

Fields:

- positionId
- tradeId
- symbol
- side
- quantity
- entryPrice
- currentPrice
- unrealizedPnl
- stop
- target
- status

---

## 8. EquitySnapshot

Fields:

- timestamp
- mode
- startingBalance
- currentBalance
- cashBalance
- openPositionsValue
- realizedPnl
- unrealizedPnl
- equity
- maxEquity
- drawdownPct

---

## 9. PerformanceSummary

Fields:

- periodStart
- periodEnd
- mode
- startingBalance
- endingBalance
- totalReturnPct
- realizedPnl
- winRate
- totalTrades
- averageWin
- averageLoss
- maxDrawdownPct
- bestStrategy
- worstStrategy
- notes

---

## 10. JournalEntry

Fields:

- journalId
- tradeId
- signalId
- timestamp
- summary
- setup
- rationale
- riskDecision
- outcome
- whatWorked
- whatFailed
- lesson
- wouldTakeAgain

---

## 11. ChaosLabResult

Fields:

- resultId
- strategyId
- strategyVersion
- testPeriod
- totalTrades
- totalReturnPct
- maxDrawdownPct
- failureLabels
- promotionEligible
- recommendation

Failure labels:

- bad_entry
- late_entry
- bad_exit
- stop_too_tight
- stop_too_loose
- chased_exhausted_move
- ignored_market_regime
- low_liquidity
- spread_too_wide
- volatility_regime_changed
- signal_conflict
- overtrading
- one_lucky_trade
- bull_only
- dies_in_chop