function buildDashboardBundle({ config, vehicles, marketBars, marketDataInfo = {}, scan, riskReview, paperResults, equityCurve, performanceSummary, generatedAt }) {
  const learningMode = config.learningMode && config.learningMode.enabled
    ? {
        enabled: true,
        profile: config.learningMode.profile,
        paperOnly: config.learningMode.paperOnly,
        label: "Aggressive Paper Learning Mode",
        description: "This mode intentionally allows more small paper trades so the system can learn from both wins and failures. No live trading is enabled.",
        thresholds: config.learningMode.riskThresholds,
        sizing: config.learningMode.sizing
      }
    : null;

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
      equityPoints: equityCurve.points.length,
      approvedStandard: (riskReview.decisions || []).filter((d) => d.approvalBand === "approved_standard").length,
      approvedLearningProbe: (riskReview.decisions || []).filter((d) => d.approvalBand === "approved_learning_probe").length,
      watched: (riskReview.decisions || []).filter((d) => d.approvalBand === "watched").length,
      rejected: (riskReview.decisions || []).filter((d) => d.approvalBand === "rejected").length,
      learningProbesExecuted: (paperResults.trades || []).filter((t) => t.isLearningProbe === true).length
    },
    vehicleUniverse: {
      targetCount: 150,
      actualCount: vehicles.length,
      source: marketDataInfo.dataSource || "deterministic_sample",
      fallbackUsed: vehicles.length < 150,
      generatedAt
    },
    riskPipeline: {
      vehiclesScanned: vehicles.length,
      signalsReviewed: (scan.signals || []).length,
      approvedStandard: (riskReview.decisions || []).filter((d) => d.approvalBand === "approved_standard").length,
      approvedLearningProbe: (riskReview.decisions || []).filter((d) => d.approvalBand === "approved_learning_probe").length,
      watched: (riskReview.decisions || []).filter((d) => d.approvalBand === "watched").length,
      rejected: (riskReview.decisions || []).filter((d) => d.approvalBand === "rejected").length,
      tradesAttempted: paperResults.executedTrades,
      tradesExecuted: paperResults.executedTrades,
      openPositions: (paperResults.openPositions || []).length,
      closedPositionsToday: (paperResults.trades || []).filter((t) => t.status === "closed").length,
      learningProbesExecutedToday: (paperResults.trades || []).filter((t) => t.isLearningProbe === true).length
    },
    openPositionsDetailed: buildOpenPositionsDetailed(riskReview, paperResults, scan),
    recentlyClosedPositions: buildRecentlyClosed(riskReview, paperResults, scan),
    aggressiveLearningMode: !!(learningMode && learningMode.enabled),
    learningModeEnabled: !!(learningMode && learningMode.enabled),
    learningMode,
    latestSignals: scan.signals,
    riskDecisions: riskReview.decisions,
    trades: paperResults.trades,
    equityCurve: equityCurve.points,
    performanceSummary,
    safetyBanner: "MarketOps Phase 1 is paper_simulation only. Market data may refresh from an approved data-only adapter, but trades remain fake paper records with no broker execution, real money, SMS, or subscriber alerts."
  };
}

function buildOpenPositionsDetailed(riskReview, paperResults, scan) {
  const decisionsBySymbol = {};
  (riskReview.decisions || []).forEach((d) => { decisionsBySymbol[d.symbol] = d; });
  const signalsBySymbol = {};
  (scan.signals || []).forEach((s) => { signalsBySymbol[s.symbol] = s; });

  const openPos = Array.isArray(paperResults.openPositions) ? paperResults.openPositions : [];
  return openPos.map((pos) => {
    const symbol = pos.symbol;
    const decision = decisionsBySymbol[symbol] || {};
    const signal = signalsBySymbol[symbol] || {};
    const entryPrice = Number(pos.entryPrice || 0);
    const quantity = Number(pos.quantity || 0);
    const currentPrice = Number(pos.latestPrice || pos.currentPrice || entryPrice);
    const positionValue = Number(pos.positionValue || (entryPrice * quantity));
    const currentValue = Number(pos.currentValue || (currentPrice * quantity));
    const unrealizedPnl = Number(pos.unrealizedPnl || (currentValue - positionValue));
    const unrealizedPnlPct = positionValue > 0 ? (unrealizedPnl / positionValue) * 100 : 0;

    return {
      ticker: symbol,
      name: signal.name || null,
      status: "open",
      boughtAt: pos.entryTime || pos.openedAt || null,
      quantity,
      entryPrice: Math.round(entryPrice * 100) / 100,
      currentPrice: Math.round(currentPrice * 100) / 100,
      positionValue: Math.round(positionValue * 100) / 100,
      unrealizedPnl: Math.round(unrealizedPnl * 100) / 100,
      unrealizedPnlPct: Math.round(unrealizedPnlPct * 100) / 100,
      riskBand: decision.approvalBand || "unknown",
      signalConfidence: signal.confidence || decision.confidence || null,
      signalReason: signal.trigger || null,
      riskDecisionReason: decision.notes || null,
      tradeType: pos.approvalBand || decision.approvalBand || "standard",
      isLearningProbe: pos.isLearningProbe === true || decision.approvalBand === "approved_learning_probe"
    };
  });
}

function buildRecentlyClosed(riskReview, paperResults, scan) {
  const decisionsBySymbol = {};
  (riskReview.decisions || []).forEach((d) => { decisionsBySymbol[d.symbol] = d; });
  const signalsBySymbol = {};
  (scan.signals || []).forEach((s) => { signalsBySymbol[s.symbol] = s; });

  const closed = (paperResults.trades || []).filter((t) => t.status === "closed" || t.exitPrice);
  return closed.slice(-20).map((trade) => {
    const symbol = trade.symbol;
    const decision = decisionsBySymbol[symbol] || {};
    const signal = signalsBySymbol[symbol] || {};
    const entryPrice = Number(trade.entryPrice || 0);
    const exitPrice = Number(trade.exitPrice || 0);
    const realizedPnl = Number(trade.realizedPnl || 0);
    const realizedPnlPct = entryPrice > 0 ? ((exitPrice - entryPrice) / entryPrice) * 100 : 0;
    const boughtAt = trade.entryTime || null;
    const soldAt = trade.exitTime || trade.generatedAt || null;
    let holdDurationDays = null;
    if (boughtAt && soldAt) {
      holdDurationDays = Math.round((new Date(soldAt) - new Date(boughtAt)) / 86400000 * 10) / 10;
    }
    return {
      ticker: symbol,
      name: signal.name || null,
      boughtAt,
      soldAt,
      entryPrice: Math.round(entryPrice * 100) / 100,
      exitPrice: Math.round(exitPrice * 100) / 100,
      realizedPnl: Math.round(realizedPnl * 100) / 100,
      realizedPnlPct: Math.round(realizedPnlPct * 100) / 100,
      exitReason: trade.exitReason || "Position closed",
      riskBand: decision.approvalBand || trade.approvalBand || "unknown",
      isLearningProbe: trade.isLearningProbe === true || decision.approvalBand === "approved_learning_probe",
      holdDurationDays
    };
  });
}

module.exports = { buildDashboardBundle };