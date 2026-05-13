function buildDashboardBundle({ config, vehicles, marketBars, marketDataInfo = {}, scan, riskReview, paperResults, equityCurve, performanceSummary, generatedAt }) {
  return {
    generatedAt,
    mode: config.mode,
    paperOnly: true,
    dataSource: marketDataInfo.dataSource || "deterministic_sample",
    marketDataSourceLabel: marketDataInfo.dataSource === "alpaca_iex" ? "Alpaca IEX market data" : "deterministic sample data",
    latestMarketDataRefreshAt: marketDataInfo.latestMarketDataRefreshAt || null,
    latestBarTimestamp: marketDataInfo.latestBarTimestamp || null,
    liveTradingEnabled: false,
    orderPlacementEnabled: false,
    unsafeFeatures: {
      brokerConnection: config.safety.allowBrokerConnection,
      liveTrading: config.safety.allowLiveTrading,
      smsAlerts: config.safety.allowSmsAlerts,
      subscriberSignals: config.safety.allowSubscriberSignals
    },
    account: {
      startingBalance: paperResults.startingBalance,
      endingBalance: paperResults.endingBalance,
      paperPnl: paperResults.totalPnl,
      currency: config.paperAccount.currency || "USD"
    },
    counts: {
      vehiclesLoaded: vehicles.length,
      marketBarsLoaded: marketBars.length,
      signalsGenerated: scan.candidateCount,
      riskApproved: riskReview.approvedCount,
      riskBlocked: riskReview.blockedCount,
      fakePaperTrades: paperResults.executedTrades,
      equityPoints: equityCurve.points.length
    },
    latestSignals: scan.signals,
    riskDecisions: riskReview.decisions,
    trades: paperResults.trades,
    equityCurve: equityCurve.points,
    performanceSummary,
    safetyBanner: "MarketOps Phase 1 is paper_simulation only. Market data may refresh from an approved data-only adapter, but trades remain fake paper records with no broker execution, real money, SMS, or subscriber alerts."
  };
}

module.exports = { buildDashboardBundle };
