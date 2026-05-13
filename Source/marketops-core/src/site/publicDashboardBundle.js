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

  return {
    mode: "paper_simulation",
    paperOnly: true,
    dataSource,
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
    watchlistQuoteSnapshot: quoteSnapshot,
    symbolMovementPreview: movementPreview,
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
    publicSafeVehicleContribution: pnlPoints.map((point) => ({
      vehicle: point.vehicle,
      paperPnl: point.paperPnl
    })),
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
