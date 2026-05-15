const path = require("path");
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
    const spreadPct = quote.bidPrice && quote.askPrice ? ((quote.askPrice - quote.bidPrice) / midpoint) * 100 : 0;
    return {
      symbol: quote.symbol,
      timestamp: quote.timestamp,
      spreadPct: round(spreadPct || 0),
      quoteAvailable: true,
      dataSource: "alpaca_iex",
      paperOnly: true,
      liveTradingEnabled: false,
      rawBidAskPublished: false
    };
  });
}

function directionForChange(changePct) {
  if (changePct >= 0.25) return "up";
  if (changePct <= -0.25) return "down";
  return "flat";
}

function movementBucket(changePct) {
  const abs = Math.abs(Number(changePct || 0));
  if (abs >= 2) return "large_2pct_plus";
  if (abs >= 1) return "moderate_1_to_2pct";
  if (abs >= 0.5) return "small_0_5_to_1pct";
  if (abs >= 0.25) return "micro_0_25_to_0_5pct";
  return "flat_under_0_25pct";
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
    const direction = directionForChange(changePct);
    return {
      symbol,
      firstTimestamp: first.timestamp,
      latestTimestamp: latest.timestamp,
      changePct: round(changePct),
      direction,
      movementBucket: movementBucket(changePct),
      barsReviewed: sorted.length,
      dataSource: "alpaca_iex",
      paperOnly: true,
      liveTradingEnabled: false,
      rawPricesPublished: false
    };
  }).sort((a, b) => a.symbol.localeCompare(b.symbol));
}

function countBy(items, getter) {
  return items.reduce((acc, item) => {
    const key = getter(item) || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function buildWatchlistMovementSummary(movementPreview, signals) {
  const rows = movementPreview.length ? movementPreview : (signals.signals || []).map((signal) => ({
    symbol: signal.symbol,
    changePct: round(signal.sampleChangePct || 0),
    direction: directionForChange(Number(signal.sampleChangePct || 0)),
    movementBucket: movementBucket(Number(signal.sampleChangePct || 0)),
    dataSource: signal.dataSource || signals.dataSource || "deterministic_sample",
    paperOnly: true,
    rawPricesPublished: false
  }));
  const strongest = rows.slice().sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))[0] || null;
  return {
    vehiclesReviewed: rows.length,
    strongestMover: strongest ? {
      symbol: strongest.symbol,
      changePct: strongest.changePct,
      direction: strongest.direction,
      movementBucket: strongest.movementBucket
    } : null,
    summaryRows: rows.map((row) => ({
      symbol: row.symbol,
      changePct: row.changePct,
      direction: row.direction,
      movementBucket: row.movementBucket,
      dataSource: row.dataSource,
      paperOnly: true,
      rawPricesPublished: false
    }))
  };
}

function buildVehicleDirectionCounts(movementPreview, signals) {
  const rows = movementPreview.length ? movementPreview : (signals.signals || []).map((signal) => ({
    direction: directionForChange(Number(signal.sampleChangePct || 0))
  }));
  const counts = countBy(rows, (item) => item.direction);
  return ["up", "down", "flat"].map((label) => ({ label, value: Number(counts[label] || 0) }));
}

function buildMovementBuckets(movementPreview, signals) {
  const rows = movementPreview.length ? movementPreview : (signals.signals || []).map((signal) => ({
    movementBucket: movementBucket(Number(signal.sampleChangePct || 0))
  }));
  const counts = countBy(rows, (item) => item.movementBucket);
  return ["flat_under_0_25pct", "micro_0_25_to_0_5pct", "small_0_5_to_1pct", "moderate_1_to_2pct", "large_2pct_plus"]
    .map((label) => ({ label, value: Number(counts[label] || 0) }));
}

function buildSignalCandidateSummary(signals) {
  const rows = Array.isArray(signals.signals) ? signals.signals : [];
  const candidates = rows.filter((signal) => signal.status === "candidate");
  return [
    { label: "Candidates generated", value: candidates.length },
    { label: "Ignored signals", value: rows.filter((signal) => signal.status !== "candidate").length },
    { label: "Signals reviewed", value: rows.length }
  ];
}

function buildSignalConfidenceDistribution(signals) {
  const rows = Array.isArray(signals.signals) ? signals.signals : [];
  const buckets = [
    { label: "0.00-0.25", min: 0, max: 0.25 },
    { label: "0.25-0.55", min: 0.25, max: 0.55 },
    { label: "0.55-0.75", min: 0.55, max: 0.75 },
    { label: "0.75-1.00", min: 0.75, max: 1.01 }
  ];
  return buckets.map((bucket) => ({
    label: bucket.label,
    value: rows.filter((signal) => Number(signal.confidence || 0) >= bucket.min && Number(signal.confidence || 0) < bucket.max).length
  }));
}

function safeReason(reason) {
  return String(reason || "Unknown risk block").replace(/\d+\.\d+/g, "threshold");
}

function buildRiskRejectionReasons(riskReview) {
  const counts = {};
  (riskReview.decisions || []).filter((decision) => decision.approved !== true).forEach((decision) => {
    (decision.blockReasons || ["Unknown risk block"]).forEach((reason) => {
      const key = safeReason(reason);
      counts[key] = (counts[key] || 0) + 1;
    });
  });
  return Object.entries(counts).map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason));
}

function approvalConditionFor(signal, decision = {}) {
  const needs = [];
  if (signal.status !== "candidate") needs.push("a movement signal that qualifies as a candidate");
  if (Number(signal.confidence || 0) < 0.55) needs.push("confidence at or above 0.55");
  if (signal.directionBias !== "up") needs.push("an up/long-only direction bias");
  if (!signal.trigger || signal.trigger === "No actionable move.") needs.push("a concrete trigger");
  if (!signal.invalidation || signal.invalidation === "N/A") needs.push("a defined invalidation level");
  if ((decision.blockReasons || []).some((reason) => /shorting|margin|leverage|options|futures/i.test(reason))) {
    needs.push("no downside/short/margin/leverage/options/futures requirement");
  }
  return needs.length ? `Needs ${needs.join(", ")}.` : "Already satisfies current paper-only gate.";
}

function buildAlmostApprovedCandidates(signals, riskReview) {
  const decisionsBySignalId = {};
  (riskReview.decisions || []).forEach((decision) => {
    decisionsBySignalId[decision.signalId] = decision;
  });
  return (signals.signals || []).map((signal) => {
    const decision = decisionsBySignalId[signal.signalId] || {};
    const missingGateCount = Math.max((decision.blockReasons || []).length, [
      signal.status !== "candidate",
      Number(signal.confidence || 0) < 0.55,
      signal.directionBias !== "up",
      !signal.trigger || signal.trigger === "No actionable move.",
      !signal.invalidation || signal.invalidation === "N/A"
    ].filter(Boolean).length);
    return {
      symbol: signal.symbol,
      status: decision.approved === true ? "approved" : missingGateCount <= 1 ? "almost_approved" : "closest_rejected",
      confidence: round(signal.confidence || 0),
      changePct: round(signal.sampleChangePct || 0),
      directionBias: signal.directionBias,
      missingGateCount,
      primaryBlockReason: safeReason((decision.blockReasons || [])[0] || "No block reason recorded."),
      wouldNeed: approvalConditionFor(signal, decision)
    };
  }).sort((a, b) => a.missingGateCount - b.missingGateCount || b.confidence - a.confidence || Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 8);
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
  const cycle = fileExists(paths.cycleLatestJson) ? loadJson(paths.cycleLatestJson) : {};
  const refreshHealthPath = path.join(paths.dataRoot, "dashboard", "dashboard-refresh-health-v0.1.json");
  const refreshHealth = fileExists(refreshHealthPath) ? loadJson(refreshHealthPath) : {};
  const dataSource = dashboardBundle.dataSource || signals.dataSource || paperResults.dataSource || "deterministic_sample";
  const latestMarketDataRefreshAt = dashboardBundle.latestMarketDataRefreshAt || signals.latestMarketDataRefreshAt || null;
  const latestBarTimestamp = dashboardBundle.latestBarTimestamp || signals.latestBarTimestamp || null;
  const nextExpectedRefreshAt = new Date(new Date(generatedAt).getTime() + 120 * 60 * 1000).toISOString();

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
  const watchlistMovementSummary = buildWatchlistMovementSummary(movementPreview, signals);
  const vehicleDirectionCounts = buildVehicleDirectionCounts(movementPreview, signals);
  const movementBuckets = buildMovementBuckets(movementPreview, signals);
  const signalCandidatesGenerated = buildSignalCandidateSummary(signals);
  const signalConfidenceDistribution = buildSignalConfidenceDistribution(signals);
  const riskRejectionReasons = buildRiskRejectionReasons(riskReview);
  const almostApprovedCandidates = buildAlmostApprovedCandidates(signals, riskReview);
  const directionCountMap = vehicleDirectionCounts.reduce((acc, item) => {
    acc[item.label] = item.value;
    return acc;
  }, {});
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
    refreshCadenceMinutes: 120,
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
    paperCycleStatus: {
      cycleId: cycle.cycleId || "cycle_not_built",
      status: cycle.status || "missing",
      startingBalance: cycle.startingBalance || config.paperAccount && config.paperAccount.paperStartingBalance || 1000,
      currentBalance: cycle.currentBalance || config.paperAccount && config.paperAccount.paperStartingBalance || 1000,
      cycleStartTimestamp: cycle.cycleStartTimestamp || null,
      cycleEndTimestamp: cycle.cycleEndTimestamp || null,
      hoursSurvived: round(cycle.hoursSurvived || 0),
      daysSurvived: round(cycle.daysSurvived || 0),
      approvedTrades: Number(cycle.approvedTrades || 0),
      rejectedTrades: Number(cycle.rejectedTrades || 0),
      depletionRisk: cycle.depletionRisk || "unknown",
      resetTriggerReason: cycle.resetTriggerReason || null,
      nextCycleScheduledStart: cycle.nextCycleScheduledStart || null,
      doesNotResetDaily: true,
      paperOnly: true,
      externalEffects: false,
      publishAllowed: false
    },
    dashboardRefreshHealth: {
      lastStatus: refreshHealth.lastStatus || "UNKNOWN",
      lastAttemptAt: refreshHealth.lastAttemptAt || null,
      lastSuccessfulRefreshAt: refreshHealth.lastSuccessfulRefreshAt || null,
      lastFailureAt: refreshHealth.lastFailureAt || null,
      consecutiveFailures: typeof refreshHealth.consecutiveFailures === "number" ? refreshHealth.consecutiveFailures : 0,
      staleWarning: refreshHealth.staleWarning || null,
      refreshIntervalTargetHours: refreshHealth.refreshIntervalTargetHours || 2,
      schedulerInstalled: refreshHealth.schedulerInstalled === true,
      paperOnly: true,
      mode: "paper_simulation"
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
    watchlistMovementSummary,
    vehicleDirectionCounts,
    upDownFlatVehicleCounts: vehicleDirectionCounts,
    movementBuckets,
    topMovementBuckets: movementBuckets,
    signalCandidatesGenerated,
    signalConfidenceDistribution,
    riskRejectionReasons,
    riskRejectionCountsByReason: riskRejectionReasons,
    almostApprovedCandidates,
    marketRegimeSummary: {
      source: "watchlist_movement_summary",
      broadDirection: Number(directionCountMap.up || 0) > Number(directionCountMap.down || 0)
        ? "watchlist_tilt_up"
        : Number(directionCountMap.down || 0) > Number(directionCountMap.up || 0)
          ? "watchlist_tilt_down"
          : "watchlist_mixed_or_flat",
      fallbackLabeled: false,
      publicSafe: true
    },
    symbolMovementPreview: movementPreview,
    recentMarketMovementPanel: movementPreview,
    topWatchlistMovers: movementPreview.slice().sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 5),
    rollingMarketMovement: movementPreview.map((item) => ({
      symbol: item.symbol,
      changePct: item.changePct,
      direction: item.direction,
      movementBucket: item.movementBucket,
      rawPricesPublished: false
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
