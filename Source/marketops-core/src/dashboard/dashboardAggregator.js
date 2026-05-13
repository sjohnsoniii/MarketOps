const fs = require("fs");
const path = require("path");
const { round } = require("../utils/number");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const dataRoot = path.join(projectRoot, "Data");

const inputPaths = {
  analytics: path.join(dataRoot, "analytics", "latest-analytics-summary.json"),
  equity: path.join(dataRoot, "paper", "equity", "equity-curve-v0.1.json"),
  signals: path.join(dataRoot, "paper", "signals", "signal-scan-v0.1.json"),
  risk: path.join(dataRoot, "paper", "risk", "risk-decisions-v0.1.json"),
  trades: path.join(dataRoot, "paper", "trades", "paper-trades-v0.1.json"),
  runHistory: path.join(dataRoot, "paper", "history", "run-history.json"),
  contentSummary: path.join(dataRoot, "content", "queue", "latest-office-run-summary.json"),
  contentQueue: path.join(dataRoot, "content", "queue", "content-queue-v0.1.json"),
  agentSummary: path.join(dataRoot, "agent-reviews", "latest-agent-review-summary.json")
  , marketData: path.join(dataRoot, "market-data", "alpaca", "alpaca-market-data-latest-v0.1.json")
};

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function countBy(items, getter) {
  return items.reduce((acc, item) => {
    const key = getter(item) || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function pct(part, total) {
  return total ? round((part / total) * 100) : 0;
}

function sanitizeRollingHistory(runHistory) {
  const runs = Array.isArray(runHistory.runs) ? runHistory.runs.slice(-30) : [];
  return runs.map((run, index) => ({
    sequence: index + 1,
    generatedAt: run.generatedAt,
    endingEquity: round(run.endingEquity),
    paperPnl: round(run.paperPnl),
    paperReturnPct: round(run.paperReturnPct),
    maxDrawdownPct: round(run.maxDrawdownPct),
    signalsReviewed: Number(run.signalsReviewed || 0),
    riskApproved: Number(run.riskApproved || 0),
    riskBlocked: Number(run.riskBlocked || 0),
    fakePaperTrades: Number(run.fakePaperTrades || 0),
    qaStatus: run.qaStatus === "PASS" ? "PASS" : "REVIEW"
  }));
}

function buildEquitySeries(equityOutput) {
  const points = Array.isArray(equityOutput.points) ? equityOutput.points : [];
  return points.map((point) => ({
    step: point.step,
    label: point.timestamp === "START" ? "START" : `Step ${point.step}`,
    event: point.event,
    symbol: point.symbol,
    equity: round(point.equity),
    paperPnl: round(point.pnl),
    drawdownPct: round(point.drawdownPct),
    targetProgressPct: round(point.targetProgressPct)
  }));
}

function buildDrawdownVisualData(equitySeries, rollingHistory) {
  return {
    currentRun: equitySeries.map((point) => ({
      step: point.step,
      label: point.label,
      drawdownPct: point.drawdownPct
    })),
    rollingRuns: rollingHistory.map((run) => ({
      sequence: run.sequence,
      generatedAt: run.generatedAt,
      maxDrawdownPct: run.maxDrawdownPct
    }))
  };
}

function buildSignalFunnel(signalOutput, riskOutput, tradeOutput) {
  const signals = Array.isArray(signalOutput.signals) ? signalOutput.signals : [];
  const decisions = Array.isArray(riskOutput.decisions) ? riskOutput.decisions : [];
  const trades = Array.isArray(tradeOutput.trades) ? tradeOutput.trades : [];
  const candidates = signals.filter((signal) => signal.status === "candidate").length;
  const approved = decisions.filter((decision) => decision.approved === true).length;
  const blocked = decisions.filter((decision) => decision.approved !== true).length;
  return {
    vehiclesScanned: Number(signalOutput.totalVehicles || 0),
    marketBarsScanned: Number(signalOutput.totalMarketBars || 0),
    signalsReviewed: signals.length,
    candidates,
    riskApproved: approved,
    riskBlocked: blocked,
    fakePaperTrades: trades.length,
    conversionRates: {
      candidateRatePct: pct(candidates, signals.length),
      approvalRatePct: pct(approved, decisions.length),
      fakeTradeRatePct: pct(trades.length, approved)
    },
    chartSteps: [
      { label: "Vehicles", value: Number(signalOutput.totalVehicles || 0) },
      { label: "Signals", value: signals.length },
      { label: "Candidates", value: candidates },
      { label: "Risk approved", value: approved },
      { label: "Fake paper trades", value: trades.length }
    ]
  };
}

function buildRiskEventSummary(riskOutput) {
  const decisions = Array.isArray(riskOutput.decisions) ? riskOutput.decisions : [];
  const approved = decisions.filter((decision) => decision.approved === true);
  const blocked = decisions.filter((decision) => decision.approved !== true);
  const blockReasonCounts = {};
  blocked.forEach((decision) => {
    (decision.blockReasons || []).forEach((reason) => {
      const safeReason = reason.replace(/\d+\.\d+/g, "sample-threshold");
      blockReasonCounts[safeReason] = (blockReasonCounts[safeReason] || 0) + 1;
    });
  });
  return {
    approvedCount: approved.length,
    blockedCount: blocked.length,
    approvalRatePct: pct(approved.length, decisions.length),
    blockedRatePct: pct(blocked.length, decisions.length),
    finalRiskLevelCounts: countBy(decisions, (decision) => decision.finalRiskLevel),
    originalRiskLevelCounts: countBy(decisions, (decision) => decision.originalRiskLevel),
    topBlockReasons: Object.entries(blockReasonCounts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  };
}

function buildTradeOutcomeDistribution(analyticsSummary, tradeOutput) {
  const tradeAnalytics = analyticsSummary.tradeAnalytics || {};
  const trades = Array.isArray(tradeOutput.trades) ? tradeOutput.trades : [];
  return {
    wins: Number(tradeAnalytics.wins || 0),
    losses: Number(tradeAnalytics.losses || 0),
    flats: Number(tradeAnalytics.flats || 0),
    winRatePct: round(tradeAnalytics.winRatePct || 0),
    averageTradePnl: round(tradeAnalytics.averageTradePnl || 0),
    averageTradeReturnPct: round(tradeAnalytics.averageTradeReturnPct || 0),
    longestWinStreak: Number(tradeAnalytics.longestWinStreak || 0),
    longestLossStreak: Number(tradeAnalytics.longestLossStreak || 0),
    outcomeBars: [
      { label: "Wins", value: Number(tradeAnalytics.wins || 0) },
      { label: "Losses", value: Number(tradeAnalytics.losses || 0) },
      { label: "Flat", value: Number(tradeAnalytics.flats || 0) }
    ],
    publicTradeRows: trades.map((trade, index) => ({
      sequence: index + 1,
      vehicle: trade.symbol,
      assetType: trade.assetType,
      outcome: Number(trade.realizedPnl || 0) > 0 ? "win" : Number(trade.realizedPnl || 0) < 0 ? "loss" : "flat",
      paperPnl: round(trade.realizedPnl || 0),
      paperReturnPct: round(trade.returnPct || 0)
    }))
  };
}

function buildRegimeDashboard(analyticsSummary) {
  const regimeAnalytics = analyticsSummary.regimeAnalytics || {};
  const rows = Array.isArray(regimeAnalytics.regimeRows) ? regimeAnalytics.regimeRows : [];
  return {
    regimesCompared: Number(regimeAnalytics.regimesCompared || rows.length),
    strongestPaperRegime: regimeAnalytics.strongestPaperRegime || "none",
    weakestPaperRegime: regimeAnalytics.weakestPaperRegime || "none",
    worstSyntheticDrawdownRegime: regimeAnalytics.worstSyntheticDrawdownRegime || "none",
    activeRegimes: regimeAnalytics.activeRegimes || [],
    inactiveRegimes: regimeAnalytics.inactiveRegimes || [],
    averageRegimeScore: round(regimeAnalytics.averageRegimeScore || 0),
    regimeScoreBars: rows.map((row) => ({
      regime: row.regime,
      score: round(row.regimeScore),
      strategyReturnPct: round(row.strategyReturnPct),
      syntheticPeriodDrawdownPct: round(row.syntheticPeriodDrawdownPct),
      tradeCount: Number(row.tradeCount || 0)
    })),
    syntheticBenchmarkComparison: rows.map((row) => ({
      regime: row.regime,
      strategyReturnPct: round(row.strategyReturnPct),
      benchmarkReturnPct: round(row.benchmarkReturnPct),
      benchmarkComparisonPct: round(row.benchmarkComparisonPct)
    }))
  };
}

function buildContentStats(contentSummary, contentQueue) {
  const items = Array.isArray(contentQueue.items) ? contentQueue.items : Array.isArray(contentQueue) ? contentQueue : [];
  return {
    contentGenerated: Number(contentSummary.contentGenerated || 0),
    queueItems: Number(contentSummary.queueItems || items.length),
    complianceStatus: contentSummary.complianceStatus || "unknown",
    publishAllowed: contentSummary.publishAllowed === true,
    draftReviewRequiredCount: items.filter((item) => item.status === "draft_review_required").length,
    publishBlockedCount: items.filter((item) => item.publishAllowed !== true).length,
    contentTypeCounts: countBy(items, (item) => item.type || item.contentType),
    platformCounts: countBy(items.filter((item) => item.platform), (item) => item.platform)
  };
}

function buildAgentReviewStats(agentSummary) {
  return {
    reviewsGenerated: Number(agentSummary.reviewsGenerated || 0),
    proposalCount: Number(agentSummary.proposalCount || 0),
    reviewCadence: agentSummary.reviewCadence || "biweekly_digest",
    cadence: agentSummary.cadence || "biweekly",
    nextSuggestedReviewWindow: agentSummary.nextSuggestedReviewWindow || "not_set",
    urgentItemsCount: Number(agentSummary.urgentItemsCount || 0),
    routineItemsDeferredCount: Number(agentSummary.routineItemsDeferredCount || 0),
    humanReviewLoad: agentSummary.humanReviewLoad || "low",
    complianceStatus: agentSummary.complianceStatus || "unknown",
    humanReviewRequired: agentSummary.humanReviewRequired === true,
    autoApplyAllowed: agentSummary.autoApplyAllowed === true ? false : false
  };
}

function buildDashboardBundle() {
  const analytics = readJson(inputPaths.analytics, {});
  const equity = readJson(inputPaths.equity, { points: [] });
  const signals = readJson(inputPaths.signals, { signals: [] });
  const risk = readJson(inputPaths.risk, { decisions: [] });
  const trades = readJson(inputPaths.trades, { trades: [] });
  const runHistory = readJson(inputPaths.runHistory, { runs: [] });
  const contentSummary = readJson(inputPaths.contentSummary, {});
  const contentQueue = readJson(inputPaths.contentQueue, {});
  const agentSummary = readJson(inputPaths.agentSummary, {});
  const marketData = readJson(inputPaths.marketData, { bars: [], quotes: [] });

  const rollingHistory = sanitizeRollingHistory(runHistory);
  const equitySeries = buildEquitySeries(equity);

  return {
    generatedAt: new Date().toISOString(),
    dashboardVersion: "marketops-public-safe-dashboard-v0.1",
    mode: "paper_simulation",
    paperOnly: true,
    sampleData: true,
    dataSource: marketData.dataSource || "deterministic_sample",
    marketDataMode: marketData.dataSource === "alpaca_iex" ? "real_market_data_for_paper_simulation" : "deterministic_sample_for_paper_simulation",
    latestMarketDataRefreshAt: marketData.generatedAt || null,
    latestAlpacaBarTimestamp: marketData.latestBarTimestamp || null,
    liveTradingEnabled: false,
    orderPlacementEnabled: false,
    notFinancialAdvice: true,
    notLiveMarketData: true,
    noBrokerConnection: true,
    noSocialAutoPosting: true,
    publicSafe: true,
    dashboardCards: {
      currentPaperPerformance: {
        startingEquity: analytics.equityAnalytics && analytics.equityAnalytics.startingEquity,
        endingEquity: analytics.equityAnalytics && analytics.equityAnalytics.endingEquity,
        paperPnl: analytics.equityAnalytics && analytics.equityAnalytics.totalPnl,
        paperReturnPct: analytics.equityAnalytics && analytics.equityAnalytics.totalReturnPct,
        maxDrawdownPct: analytics.equityAnalytics && analytics.equityAnalytics.maxDrawdownPct,
        riskAdjustedScore: analytics.riskAdjustedScore
      },
      signalFunnel: buildSignalFunnel(signals, risk, trades),
      tradeOutcomeDistribution: buildTradeOutcomeDistribution(analytics, trades),
      riskEventSummary: buildRiskEventSummary(risk),
      regimeSummary: buildRegimeDashboard(analytics),
      contentGenerationStats: buildContentStats(contentSummary, contentQueue),
      agentReviewStats: buildAgentReviewStats(agentSummary)
      , marketDataHeartbeat: {
        dataSource: marketData.dataSource || "deterministic_sample",
        generatedAt: marketData.generatedAt || null,
        latestBarTimestamp: marketData.latestBarTimestamp || null,
        barsLoaded: Array.isArray(marketData.bars) ? marketData.bars.length : 0,
        quotesLoaded: Array.isArray(marketData.quotes) ? marketData.quotes.length : 0,
        paperOnly: true,
        liveTradingEnabled: false
      }
    },
    charts: {
      equityCurve: equitySeries,
      rollingEquity: rollingHistory.map((run) => ({
        sequence: run.sequence,
        generatedAt: run.generatedAt,
        endingEquity: run.endingEquity,
        paperReturnPct: run.paperReturnPct
      })),
      drawdownVisualData: buildDrawdownVisualData(equitySeries, rollingHistory),
      signalFunnel: buildSignalFunnel(signals, risk, trades).chartSteps,
      tradeOutcomeBars: buildTradeOutcomeDistribution(analytics, trades).outcomeBars,
      regimeScoreBars: buildRegimeDashboard(analytics).regimeScoreBars,
      syntheticBenchmarkComparison: buildRegimeDashboard(analytics).syntheticBenchmarkComparison,
      quoteSnapshot: (marketData.quotes || []).map((quote) => ({
        symbol: quote.symbol,
        timestamp: quote.timestamp,
        midpoint: quote.bidPrice && quote.askPrice ? round((quote.bidPrice + quote.askPrice) / 2) : 0
      }))
    },
    rollingAnalytics: {
      runsReviewed: rollingHistory.length,
      latestRun: rollingHistory[rollingHistory.length - 1] || null,
      rollingPaperReturnPctValues: rollingHistory.map((run) => run.paperReturnPct),
      rollingMaxDrawdownPctValues: rollingHistory.map((run) => run.maxDrawdownPct)
    },
    disclaimers: [
      "Paper simulation only.",
      "Sample-data preview only.",
      "Not live market data.",
      "Not financial advice.",
      "Not real trading performance.",
      "No broker, API, payment, or social auto-posting behavior is enabled."
    ]
  };
}

module.exports = { inputPaths, buildDashboardBundle };
