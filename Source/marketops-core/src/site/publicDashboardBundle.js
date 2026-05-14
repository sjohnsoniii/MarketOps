const { loadConfig } = require("../config/configLoader");
const { fileExists, loadJson, writeJson } = require("../utils/fileStore");
const { round } = require("../utils/number");
const { paths } = require("../utils/paths");

function sanitizeRunHistorySummary(runHistorySummary) {
  if (!runHistorySummary) return null;
  return {
    generatedAt: runHistorySummary.generatedAt,
    qaStatus: runHistorySummary.qaStatus,
    endingEquity: runHistorySummary.endingEquity,
    paperPnl: runHistorySummary.paperPnl,
    paperReturnPct: runHistorySummary.paperReturnPct
  };
}

function buildQuoteSnapshot(marketData) {
  if (!marketData || !Array.isArray(marketData.quotes)) return [];
  return marketData.quotes.map((quote) => {
    const midpoint = quote.bidPrice && quote.askPrice ? round((quote.bidPrice + quote.askPrice) / 2) : 0;
    return {
      symbol: quote.symbol,
      timestamp: quote.timestamp,
      bidPrice: round(quote.bidPrice || 0),
      askPrice: round(quote.askPrice || 0),
      midpoint,
      dataSource: "alpaca_iex",
      paperOnly: true,
      liveTradingEnabled: false
    };
  });
}

function buildSymbolMovementPreview(marketData) {
  if (!marketData || !Array.isArray(marketData.bars)) return [];
  const bySymbol = marketData.bars.reduce((acc, bar) => {
    acc[bar.symbol] = acc[bar.symbol] || [];
    acc[bar.symbol].push(bar);
    return acc;
  }, {});

  return Object.entries(bySymbol).map(([symbol, bars]) => {
    const sorted = bars.slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const first = sorted[0];
    const latest = sorted[sorted.length - 1];
    const change = latest.close - first.close;
    const changePct = first.close ? (change / first.close) * 100 : 0;
    return {
      symbol,
      firstTimestamp: first.timestamp,
      latestTimestamp: latest.timestamp,
      firstClose: round(first.close),
      latestClose: round(latest.close),
      change: round(change),
      changePct: round(changePct),
      barsReviewed: sorted.length,
      dataSource: "alpaca_iex",
      paperOnly: true,
      liveTradingEnabled: false
    };
  }).sort((a, b) => a.symbol.localeCompare(b.symbol));
}

function buildRollingDashboardHistory(runHistory) {
  const runs = Array.isArray(runHistory.runs) ? runHistory.runs.slice(-20) : [];
  return runs.map((run) => ({
    generatedAt: run.generatedAt,
    endingEquity: round(run.endingEquity || 0),
    paperPnl: round(run.paperPnl || 0),
    paperReturnPct: round(run.paperReturnPct || 0),
    maxDrawdownPct: round(run.maxDrawdownPct || 0),
    signalsReviewed: Number(run.signalsReviewed || 0),
    signalsGenerated: Number(run.signalsGenerated || run.signalsReviewed || 0),
    riskApproved: Number(run.riskApproved || 0),
    riskBlocked: Number(run.riskBlocked || 0),
    fakePaperTrades: Number(run.fakePaperTrades || 0),
    qaStatus: run.qaStatus === "PASS" ? "PASS" : "REVIEW"
  }));
}

function minutesOld(timestamp, now = new Date()) {
  if (!timestamp || Number.isNaN(Date.parse(timestamp))) return null;
  return round((now.getTime() - new Date(timestamp).getTime()) / 60000);
}

function freshnessLabel(ageMinutes, freshLimit, staleLimit) {
  if (ageMinutes == null) return "missing";
  if (ageMinutes <= freshLimit) return "fresh";
  if (ageMinutes <= staleLimit) return "aging";
  return "stale_or_market_closed";
}

function buildBotActivityTimeline(rollingHistory) {
  return rollingHistory.slice(-20).map((run, index, runs) => {
    const previous = index > 0 ? runs[index - 1] : null;
    const gapMinutes = previous && run.generatedAt && previous.generatedAt
      ? round((new Date(run.generatedAt).getTime() - new Date(previous.generatedAt).getTime()) / 60000)
      : null;
    return {
      generatedAt: run.generatedAt,
      endingEquity: run.endingEquity,
      paperPnl: run.paperPnl,
      signalsReviewed: run.signalsReviewed,
      riskApproved: run.riskApproved,
      riskBlocked: run.riskBlocked,
      fakePaperTrades: run.fakePaperTrades,
      qaStatus: run.qaStatus,
      gapMinutes,
      cadenceLabel: gapMinutes == null ? "timeline_start" : gapMinutes <= 45 ? "roughly_30_minute_cadence" : "manual_or_scheduler_gap"
    };
  });
}

function buildStaleWarnings({ generatedAt, latestMarketDataRefreshAt, latestBarTimestamp, rollingHistory }) {
  const warnings = [];
  const now = new Date(generatedAt);
  const marketRefreshAgeMinutes = minutesOld(latestMarketDataRefreshAt, now);
  const latestBarAgeMinutes = minutesOld(latestBarTimestamp, now);
  const latestRun = rollingHistory[rollingHistory.length - 1] || null;
  const latestRunAgeMinutes = latestRun ? minutesOld(latestRun.generatedAt, now) : null;

  if (marketRefreshAgeMinutes == null) {
    warnings.push({ item: "market_data_refresh", status: "missing", detail: "No market-data refresh timestamp is available." });
  } else if (marketRefreshAgeMinutes > 120) {
    warnings.push({ item: "market_data_refresh", status: "aging", detail: `Market data refreshed ${marketRefreshAgeMinutes} minutes before this public bundle.` });
  }
  if (latestBarAgeMinutes != null && latestBarAgeMinutes > 390) {
    warnings.push({ item: "latest_market_bar", status: "market_closed_or_delayed", detail: `Latest market bar is ${latestBarAgeMinutes} minutes old; do not present as live tick data.` });
  }
  if (latestRunAgeMinutes != null && latestRunAgeMinutes > 75) {
    warnings.push({ item: "paper_run", status: "stale", detail: `Latest paper run is ${latestRunAgeMinutes} minutes old.` });
  }

  return warnings.length ? warnings : [{
    item: "dashboard_inputs",
    status: "clear",
    detail: "Latest public-safe bundle, paper run, and market-data refresh are aligned for local preview."
  }];
}

function buildPublicDashboardBundle({ generatedAt = new Date().toISOString(), runHistorySummary = null } = {}) {
  const config = loadConfig();
  const signals = loadJson(paths.signalsJson);
  const riskReview = loadJson(paths.riskJson);
  const paperResults = loadJson(paths.tradesJson);
  const equityCurve = loadJson(paths.equityJson);
  const dashboardBundle = loadJson(paths.dashboardJson);
  const alpacaMarketData = fileExists(paths.alpacaMarketDataLatestJson) ? loadJson(paths.alpacaMarketDataLatestJson) : null;
  const runHistory = fileExists(paths.runHistoryJson) ? loadJson(paths.runHistoryJson) : { runs: [] };
  const dataSource = dashboardBundle.dataSource || signals.dataSource || paperResults.dataSource || "deterministic_sample";
  const latestMarketDataRefreshAt = dashboardBundle.latestMarketDataRefreshAt || signals.latestMarketDataRefreshAt || null;
  const latestBarTimestamp = dashboardBundle.latestBarTimestamp || signals.latestBarTimestamp || null;
  const nextExpectedRefreshAt = new Date(new Date(generatedAt).getTime() + 30 * 60 * 1000).toISOString();

  const pnlPoints = (paperResults.trades || []).map((trade, index) => ({
    label: `Trade ${index + 1}`,
    vehicle: trade.symbol,
    paperPnl: round(trade.realizedPnl || 0),
    returnPct: round(trade.returnPct || 0)
  }));

  let cumulativePnl = 0;
  const cumulativePnlPoints = [{ label: "Start", cumulativePaperPnl: 0 }].concat(
    pnlPoints.map((point, index) => {
      cumulativePnl = round(cumulativePnl + point.paperPnl);
      return { label: `Step ${index + 1}`, cumulativePaperPnl: cumulativePnl };
    })
  );

  const wins = pnlPoints.filter((point) => point.paperPnl > 0).length;
  const losses = pnlPoints.filter((point) => point.paperPnl < 0).length;
  const flat = pnlPoints.filter((point) => point.paperPnl === 0).length;
  const startingBalance = equityCurve.startingBalance || paperResults.startingBalance;
  const targetBalance = equityCurve.targetBalance || config.paperAccount.targetBalance || 13000;
  const endingEquity = equityCurve.endingEquity || paperResults.endingBalance;
  const signalsReviewed = (signals.signals || []).length || (riskReview.decisions || []).length;
  const movementPreview = buildSymbolMovementPreview(alpacaMarketData);
  const quoteSnapshot = buildQuoteSnapshot(alpacaMarketData);
  const rollingHistory = buildRollingDashboardHistory(runHistory);
  const fakePaperTradeCount = paperResults.executedTrades || 0;
  const currentGain = endingEquity - startingBalance;
  const targetGain = targetBalance - startingBalance;
  const targetProgressPct = targetGain ? round((currentGain / targetGain) * 100) : 0;
  const movementBySymbol = movementPreview.reduce((acc, item) => {
    acc[item.symbol] = item;
    return acc;
  }, {});
  const pnlBySymbol = (paperResults.trades || []).reduce((acc, trade) => {
    acc[trade.symbol] = round((acc[trade.symbol] || 0) + Number(trade.realizedPnl || 0));
    return acc;
  }, {});
  const publicSafeVehicleContribution = (signals.signals || []).map((signal) => ({
    vehicle: signal.symbol,
    fakePaperPnl: round(pnlBySymbol[signal.symbol] || 0),
    marketChangePct: round((movementBySymbol[signal.symbol] && movementBySymbol[signal.symbol].changePct) || signal.sampleChangePct || 0),
    dataSource: signal.dataSource || dataSource,
    paperOnly: true
  }));
  const marketRefreshAgeMinutes = minutesOld(latestMarketDataRefreshAt, new Date(generatedAt));
  const latestBarAgeMinutes = minutesOld(latestBarTimestamp, new Date(generatedAt));
  const staleDataWarnings = buildStaleWarnings({ generatedAt, latestMarketDataRefreshAt, latestBarTimestamp, rollingHistory });

  return {
    mode: "paper_simulation",
    paperOnly: true,
    dataSource,
    realMarketDataInputs: dataSource === "alpaca_iex",
    marketDataSourceLabel: dataSource === "alpaca_iex" ? "Alpaca IEX market data" : "deterministic sample data",
    marketDataMode: dataSource === "alpaca_iex" ? "real_market_data_for_paper_simulation" : "deterministic_sample_for_paper_simulation",
    latestMarketDataRefreshAt,
    latestMarketDataRefresh: {
      generatedAt: alpacaMarketData && alpacaMarketData.generatedAt ? alpacaMarketData.generatedAt : latestMarketDataRefreshAt,
      latestBarTimestamp,
      barsLoaded: alpacaMarketData && Array.isArray(alpacaMarketData.bars) ? alpacaMarketData.bars.length : signals.totalMarketBars || 0,
      quotesLoaded: alpacaMarketData && Array.isArray(alpacaMarketData.quotes) ? alpacaMarketData.quotes.length : 0
    },
    latestAlpacaBarTimestamp: latestBarTimestamp,
    barsLoaded: alpacaMarketData && Array.isArray(alpacaMarketData.bars) ? alpacaMarketData.bars.length : signals.totalMarketBars || 0,
    quotesLoaded: alpacaMarketData && Array.isArray(alpacaMarketData.quotes) ? alpacaMarketData.quotes.length : 0,
    latestBarTimestamp,
    liveTradingEnabled: false,
    orderPlacementEnabled: false,
    externalEffects: false,
    publishAllowed: false,
    rawMarketDataPublished: false,
    paperOnlyStatus: "paper_simulation_only",
    sampleData: true,
    fakeMoney: true,
    inDevelopment: true,
    notFinancialAdvice: true,
    notLiveTrading: true,
    notRealPerformance: true,
    notCopyTrading: true,
    generatedAt,
    lastRefreshAt: generatedAt,
    nextExpectedRefreshAt,
    refreshCadenceMinutes: 30,
    latestPublicRefreshAt: generatedAt,
    lastUpdatedLabel: `Public-safe paper lab refresh: ${generatedAt}`,
    startingBalance,
    targetBalance,
    endingEquity,
    paperPnl: round(endingEquity - startingBalance),
    paperReturnPct: round(((endingEquity - startingBalance) / startingBalance) * 100),
    maxDrawdownPct: equityCurve.maxDrawdownPct,
    targetProgressPct,
    remainingToThirtyPctTarget: round(targetBalance - endingEquity),
    vehiclesScanned: signals.totalVehicles || signalsReviewed,
    signalsReviewed,
    riskApproved: riskReview.approvedCount,
    riskBlocked: riskReview.blockedCount,
    riskBlockedCount: riskReview.blockedCount,
    signalsGeneratedCount: signals.candidateCount,
    approvedSignalCount: riskReview.approvedCount,
    fakePaperTrades: fakePaperTradeCount,
    fakePaperTradeCount,
    noTradeReason: fakePaperTradeCount === 0
      ? "Risk Desk did not approve any candidate for fake paper execution in this refresh."
      : null,
    riskDeskSummary: {
      reviewed: signalsReviewed,
      approved: riskReview.approvedCount,
      blocked: riskReview.blockedCount,
      posture: riskReview.blockedCount >= riskReview.approvedCount ? "risk_first_blocking" : "paper_execution_allowed"
    },
    marketActivityHeartbeat: {
      status: dataSource === "alpaca_iex" ? "market_data_received" : "sample_data_loaded",
      generatedAt,
      latestBarTimestamp,
      barsLoaded: alpacaMarketData && Array.isArray(alpacaMarketData.bars) ? alpacaMarketData.bars.length : signals.totalMarketBars || 0,
      quotesLoaded: alpacaMarketData && Array.isArray(alpacaMarketData.quotes) ? alpacaMarketData.quotes.length : 0,
      paperOnly: true,
      liveTradingEnabled: false
    },
    marketDataFreshnessPanel: {
      dataSource,
      feed: alpacaMarketData && alpacaMarketData.feed || "sample",
      generatedAt: latestMarketDataRefreshAt,
      latestBarTimestamp,
      barsLoaded: alpacaMarketData && Array.isArray(alpacaMarketData.bars) ? alpacaMarketData.bars.length : signals.totalMarketBars || 0,
      quotesLoaded: alpacaMarketData && Array.isArray(alpacaMarketData.quotes) ? alpacaMarketData.quotes.length : 0,
      refreshAgeMinutes: marketRefreshAgeMinutes,
      latestBarAgeMinutes,
      refreshFreshnessLabel: freshnessLabel(marketRefreshAgeMinutes, 45, 120),
      latestBarFreshnessLabel: freshnessLabel(latestBarAgeMinutes, 90, 390),
      rawMarketDataPublished: false,
      publicSafeDerivedOnly: true,
      paperOnly: true
    },
    watchlistQuoteSnapshot: quoteSnapshot,
    symbolMovementPreview: movementPreview,
    recentMarketMovementPanel: movementPreview,
    topWatchlistMovers: movementPreview.slice().sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 5),
    rollingMarketMovement: movementPreview.map((item) => ({
      symbol: item.symbol,
      latestClose: item.latestClose,
      changePct: item.changePct
    })),
    rollingSignalCounts: rollingHistory.map((run) => ({
      generatedAt: run.generatedAt,
      signalsReviewed: run.signalsReviewed,
      signalsGenerated: run.signalsGenerated
    })),
    rollingRiskCounts: rollingHistory.map((run) => ({
      generatedAt: run.generatedAt,
      riskApproved: run.riskApproved,
      riskBlocked: run.riskBlocked
    })),
    rollingQuoteSnapshots: quoteSnapshot,
    rollingDashboardHistory: rollingHistory,
    botActivityTimeline: buildBotActivityTimeline(rollingHistory),
    staleDataWarningPanel: staleDataWarnings,
    staleDataWarnings,
    equityPoints: (equityCurve.points || []).map((point, index) => ({
      label: index === 0 ? "Start" : `Step ${index}`,
      equity: point.equity,
      paperPnl: point.pnl,
      drawdownPct: point.drawdownPct
    })),
    pnlPoints,
    cumulativePnlPoints,
    drawdownPoints: (equityCurve.points || []).map((point, index) => ({
      label: index === 0 ? "Start" : `Step ${index}`,
      drawdownPct: point.drawdownPct
    })),
    riskDecisionMix: {
      approved: riskReview.approvedCount,
      blocked: riskReview.blockedCount
    },
    tradeOutcomeMix: { wins, losses, flat },
    publicSafeVehicleContribution,
    vehicleContribution: publicSafeVehicleContribution,
    returnVsDrawdownSnapshot: [{
      label: "Current paper run",
      paperReturnPct: round(((endingEquity - startingBalance) / startingBalance) * 100),
      maxDrawdownPct: equityCurve.maxDrawdownPct
    }].concat(rollingHistory.slice(-10).map((run) => ({
      label: run.generatedAt,
      paperReturnPct: run.paperReturnPct,
      maxDrawdownPct: run.maxDrawdownPct
    }))),
    signalFunnel: [
      { label: "Vehicles scanned", value: signals.totalVehicles || signalsReviewed },
      { label: "Signals reviewed", value: signalsReviewed },
      { label: "Risk approved", value: riskReview.approvedCount },
      { label: "Fake paper trades", value: paperResults.executedTrades }
    ],
    milestoneTargets: [
      { label: "Start", balance: startingBalance },
      { label: "Current", balance: endingEquity },
      { label: "+15%", balance: round(startingBalance * 1.15) },
      { label: "+30%", balance: targetBalance },
      { label: "+40%", balance: round(startingBalance * 1.4) },
      { label: "+50%", balance: round(startingBalance * 1.5) }
    ],
    paperAccountMilestoneStrip: [
      { label: "Start", balance: startingBalance },
      { label: "Current", balance: endingEquity },
      { label: "+15%", balance: round(startingBalance * 1.15) },
      { label: "+30%", balance: targetBalance }
    ],
    runHistorySummary: sanitizeRunHistorySummary(runHistorySummary),
    buildInPublic: {
      paperRunCount: runHistorySummary ? 1 : null,
      simulatedTradeCount: paperResults.executedTrades,
      activeExperiment: "Paper-only dashboard refresh cadence and review-gated public progress updates.",
      currentLabMood: riskReview.blockedCount > riskReview.approvedCount ? "cautious and still learning" : "steady paper-lab iteration",
      latestLesson: "The dashboard is most useful when it shows process quality, not hype.",
      latestDisappointment: riskReview.blockedCount
        ? `${riskReview.blockedCount} sample signal(s) were blocked by Risk Desk; useful, but not glamorous.`
        : "No major paper-lab disappointment recorded in the latest sample run.",
      nextExperiment: "Keep refreshing sanitized paper metrics and compare how signal/risk decisions evolve over time.",
      safetyStatus: "Public bundle is sanitized, paper-only, fake-money, in-development, and not financial advice.",
      whatChangedSinceLastUpdate: [
        "Latest paper equity, P/L, drawdown, signal, risk, and simulated trade counts refreshed from local outputs.",
        "Public-facing labels remain paper simulation / fake money / sample-data preview."
      ]
    },
    publicDisclaimer: "Paper simulation, fake-money, in-development sample-data preview only. Not real performance. Not financial advice. No guarantees. No copy-trading."
  };
}

function writePublicDashboardBundle(filePath = paths.siteDashboardPublicV04Json, options = {}) {
  const bundle = buildPublicDashboardBundle(options);
  writeJson(filePath, bundle);
  return { filePath, bundle };
}

module.exports = { buildPublicDashboardBundle, writePublicDashboardBundle };
