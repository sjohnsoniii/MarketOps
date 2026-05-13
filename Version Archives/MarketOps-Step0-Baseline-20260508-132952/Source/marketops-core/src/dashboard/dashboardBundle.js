function buildDashboardBundle({ config, vehicles, marketBars, scan, riskReview, paperResults, equityCurve, performanceSummary, generatedAt }) {
  return {
    generatedAt,
    mode: config.mode,
    paperOnly: true,
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
    safetyBanner: "MarketOps Phase 1 is paper_simulation only. No broker, live data, real money, SMS, or subscriber alerts."
  };
}

module.exports = { buildDashboardBundle };
