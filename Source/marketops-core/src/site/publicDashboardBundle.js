const path = require("path");
const { loadConfig } = require("../config/configLoader");
const { fileExists, loadJson, writeJson } = require("../utils/fileStore");
const { round } = require("../utils/number");
const { paths } = require("../utils/paths");

function computeHoldingsValue(positions) {
  if (!positions || !Array.isArray(positions.openPositions)) return 0;
  return round(positions.openPositions.reduce((sum, p) => sum + Number(p.currentValue || 0), 0));
}

function buildTotalAccountValueCurve({ paperResults, positions, cycle, runHistory, generatedAt, startingBalanceOverride }) {
  const originalStartingBalance = startingBalanceOverride || 1000;
  const cashBalance = Number(paperResults.cashBalance || paperResults.endingBalance || originalStartingBalance);
  const holdingsValue = computeHoldingsValue(positions);
  const totalAccountValue = round(cashBalance + holdingsValue);

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const cycleStartTimestamp = cycle.cycleStartTimestamp || null;
  const windowStart = cycleStartTimestamp && new Date(cycleStartTimestamp) > fourteenDaysAgo ? new Date(cycleStartTimestamp) : fourteenDaysAgo;

  const points = [];

  points.push({
    timestamp: windowStart.toISOString(),
    cycleId: cycle.cycleId || "cycle_not_built",
    cashBalance: originalStartingBalance,
    holdingsValue: 0,
    totalAccountValue: originalStartingBalance,
    label: "Start ($1,000 paper balance)",
    source: "cycle_start"
  });

  const runs = Array.isArray(runHistory.runs) ? runHistory.runs : [];
  const recentRuns = runs.filter(r => {
    const t = new Date(r.generatedAt);
    return t >= windowStart && t < new Date();
  });

  recentRuns.forEach(r => {
    const cash = Number(r.endingEquity || 0);
    if (cash > originalStartingBalance * 2.5) return;
    points.push({
      timestamp: r.generatedAt,
      cycleId: cycle.cycleId || "cycle_not_built",
      cashBalance: round(cash),
      holdingsValue: 0,
      totalAccountValue: round(cash),
      label: "Cash balance checkpoint",
      source: "run_history_cash_only"
    });
  });

  points.push({
    timestamp: generatedAt,
    cycleId: cycle.cycleId || "cycle_not_built",
    cashBalance: round(cashBalance),
    holdingsValue: round(holdingsValue),
    totalAccountValue,
    label: holdingsValue > 0 ? "Current (cash + holdings)" : "Current (cash only, no positions)",
    source: "paper_simulation"
  });

  const seen = new Set();
  const deduped = points.filter(p => {
    const key = p.timestamp;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  deduped.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return {
    label: "Total Account Value (Cash + Holdings)",
    definition: "Current cash balance plus market value of all open positions",
    paperStartingBalance: originalStartingBalance,
    paperCurrentCashBalance: round(cashBalance),
    holdingsValue: round(holdingsValue),
    totalAccountValue,
    openPositionCount: positions && Array.isArray(positions.openPositions) ? positions.openPositions.length : 0,
    windowDays: 14,
    windowStart: windowStart.toISOString(),
    windowEnd: generatedAt,
    points: deduped
  };
}

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
  const paperPositions = fileExists(paths.paperPositionsJson) ? loadJson(paths.paperPositionsJson) : { openPositions: [] };
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

  const originalPaperStartingBalance = cycle.startingBalance || config.paperAccount && config.paperAccount.paperStartingBalance || 1000;
  const totalAccountValueCurve = buildTotalAccountValueCurve({
    paperResults,
    positions: paperPositions,
    cycle,
    runHistory,
    generatedAt,
    startingBalanceOverride: originalPaperStartingBalance
  });

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
    dataProvenance: {
      note: "This public bundle combines data from multiple sources. Fields below document the provenance of each section.",
      latestPaperRun: runHistorySummary ? "real_paper_run_history" : "unavailable",
      marketBars: alpacaMarketData && Array.isArray(alpacaMarketData.bars) && alpacaMarketData.bars.length > 0
        ? (alpacaMarketData.dataSource === "alpaca_iex" ? "real_alpaca_iex_bars" : "sample_data")
        : "unavailable",
      marketQuotes: alpacaMarketData && Array.isArray(alpacaMarketData.quotes) && alpacaMarketData.quotes.length > 0
        ? (alpacaMarketData.dataSource === "alpaca_iex" ? "real_alpaca_iex_quotes" : "sample_data")
        : "unavailable",
      equityCurvePoints: equityCurve && Array.isArray(equityCurve.points) && equityCurve.points.length > 0 ? "real_paper_equity_points" : "unavailable",
      paperTrades: paperResults && Array.isArray(paperResults.trades) && paperResults.trades.length > 0 ? "real_paper_trade_records" : "no_trades_executed",
      riskDecisions: riskReview && Array.isArray(riskReview.decisions) && riskReview.decisions.length > 0 ? "real_paper_risk_decisions" : "unavailable",
      signalScans: signals && Array.isArray(signals.signals) && signals.signals.length > 0 ? "real_paper_signal_scans" : "unavailable",
      paperCycle: cycle && cycle.status ? "real_cycle_status" : "unavailable",
      refreshHealth: refreshHealth.lastStatus ? "real_refresh_health_tracker" : "unavailable",
      dashboardBundle: dashboardBundle && dashboardBundle.generatedAt ? "real_dashboard_bundle" : "unavailable",
      disclaimer: "All numbers are paper simulation only. No real money, broker execution, or live trading is involved.",
      chartDataSources: {
        note: "Each top-level data field is labeled by its primary source. real_paper = from paper simulation, real_market = from Alpaca IEX, sample = deterministic fallback.",
        equityPoints: equityCurve && Array.isArray(equityCurve.points) && equityCurve.points.length > 0 ? "real_paper_equity_points" : "empty",
        pnlPoints: paperResults && Array.isArray(paperResults.trades) && paperResults.trades.length > 0 ? "real_paper_trade_records" : "no_trades",
        cumulativePnlPoints: paperResults && Array.isArray(paperResults.trades) && paperResults.trades.length > 0 ? "real_paper_trade_records" : "no_trades",
        drawdownPoints: equityCurve && Array.isArray(equityCurve.points) && equityCurve.points.length > 0 ? "real_paper_equity_points" : "empty",
        watchlistMovementSummary: movementPreview.length > 0 ? "real_alpaca_iex_market_movement" : (signals && signals.signals && signals.signals.length > 0 ? "sample_fallback_signal_data" : "empty"),
        vehicleDirectionCounts: movementPreview.length > 0 ? "real_alpaca_iex_market_movement" : (signals && signals.signals && signals.signals.length > 0 ? "sample_fallback_signal_data" : "empty"),
        movementBuckets: movementPreview.length > 0 ? "real_alpaca_iex_market_movement" : (signals && signals.signals && signals.signals.length > 0 ? "sample_fallback_signal_data" : "empty"),
        botActivityTimeline: rollingHistory.length > 0 ? "real_paper_run_history" : "empty",
        rollingDashboardHistory: rollingHistory.length > 0 ? "real_paper_run_history" : "empty",
        staleDataWarningPanel: true,
        paperCycleStatus: cycle && cycle.status ? "real_cycle_output" : "empty",
        riskDecisionMix: riskReview && (riskReview.approvedCount > 0 || riskReview.blockedCount > 0) ? "real_risk_decisions" : "empty",
        tradeOutcomeMix: wins > 0 || losses > 0 ? "real_trade_outcomes" : "no_trades"
      }
    },
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
      publishAllowed: false,
      activePreset: (config.paperAccount && config.paperAccount.paperAccountPreset) || "standard"
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
    totalAccountValueCurve,
    paperProfitLoss: {
      realizedPnl: round(paperResults.realizedPnl || 0),
      unrealizedPnl: round(paperResults.totalUnrealizedPnl || (paperPositions.openPositions || []).reduce((s, p) => s + Number(p.unrealizedPnl || 0), 0)),
      totalPnl: round((paperResults.realizedPnl || 0) + (paperResults.totalUnrealizedPnl || (paperPositions.openPositions || []).reduce((s, p) => s + Number(p.unrealizedPnl || 0), 0))),
      totalPnlPct: startingBalance ? round((((endingEquity - startingBalance) / startingBalance) * 100)) : 0,
      winningTrades: wins,
      losingTrades: losses,
      openPositionPnl: round((paperPositions.openPositions || []).reduce((s, p) => s + Number(p.unrealizedPnl || 0), 0))
    },
    corePaperTarget: {
      startingBalance,
      currentTotalAccountValue: round(totalAccountValueCurve.totalAccountValue),
      targetValue: targetBalance,
      progressPct: targetProgressPct,
      remainingToTarget: round(Math.max(0, targetBalance - totalAccountValueCurve.totalAccountValue)),
      depletionThreshold: round(startingBalance * 0.5),
      distanceFromDepletion: round(totalAccountValueCurve.totalAccountValue - (startingBalance * 0.5)),
      targetStatus: totalAccountValueCurve.totalAccountValue >= targetBalance
        ? 'target_reached'
        : totalAccountValueCurve.totalAccountValue <= (startingBalance * 0.5)
          ? 'depletion_risk'
          : 'in_progress'
    },
    accountSummary: {
      cashBalance: round(totalAccountValueCurve.paperCurrentCashBalance),
      holdingsValue: round(totalAccountValueCurve.holdingsValue),
      totalAccountValue: round(totalAccountValueCurve.totalAccountValue),
      openPositionCount: totalAccountValueCurve.openPositionCount,
      paperStartingBalance: originalPaperStartingBalance,
      startingBalance,
      realizedPnl: round(paperResults.realizedPnl || 0),
      unrealizedPnl: round(paperResults.totalUnrealizedPnl || (paperPositions.openPositions || []).reduce((s, p) => s + Number(p.unrealizedPnl || 0), 0)),
      totalPnl: round((paperResults.realizedPnl || 0) + (paperResults.totalUnrealizedPnl || (paperPositions.openPositions || []).reduce((s, p) => s + Number(p.unrealizedPnl || 0), 0))),
      totalPnlPct: startingBalance ? round((((endingEquity - startingBalance) / startingBalance) * 100)) : 0,
      paperOnly: true
    },
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
      { label: "Approved standard", value: (riskReview.decisions || []).filter((d) => d.approvalBand === "approved_standard").length },
      { label: "Approved learning probes", value: (riskReview.decisions || []).filter((d) => d.approvalBand === "approved_learning_probe").length },
      { label: "Watched", value: (riskReview.decisions || []).filter((d) => d.approvalBand === "watched").length },
      { label: "Rejected", value: (riskReview.decisions || []).filter((d) => d.approvalBand === "rejected").length },
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
    publicDisclaimer: "Paper simulation, fake-money, in-development sample-data preview only. Not real performance. Not financial advice. No guarantees. No copy-trading.",
    riskPipeline: {
      vehiclesScanned: signals.totalVehicles || signalsReviewed,
      signalsReviewed,
      approvedStandard: (riskReview.decisions || []).filter((d) => d.approvalBand === "approved_standard").length,
      approvedLearningProbe: (riskReview.decisions || []).filter((d) => d.approvalBand === "approved_learning_probe").length,
      watched: (riskReview.decisions || []).filter((d) => d.approvalBand === "watched").length,
      rejected: (riskReview.decisions || []).filter((d) => d.approvalBand === "rejected").length,
      tradesAttempted: fakePaperTradeCount,
      tradesExecuted: fakePaperTradeCount,
      openPositions: totalAccountValueCurve.openPositionCount,
      closedPositionsToday: (paperResults.trades || []).filter((t) => t.status === "closed").length,
      learningProbesExecutedToday: (paperResults.trades || []).filter((t) => t.isLearningProbe === true).length
    },
    openPositionsDetailed: openPositionsFromSignals(signals, riskReview, paperResults, paperPositions),
    recentlyClosedPositions: recentlyClosedFromSignals(signals, riskReview, paperResults),
    vehicleUniverse: {
      targetCount: 150,
      actualCount: signals.totalVehicles || signalsReviewed,
      source: dataSource,
      fallbackUsed: (signals.totalVehicles || signalsReviewed) < 150,
      generatedAt
    },
    learningModeEnabled: !!(config.learningMode && config.learningMode.enabled),
    aggressiveLearningMode: !!(config.learningMode && config.learningMode.enabled),
    learningMode: config.learningMode && config.learningMode.enabled ? {
      enabled: true,
      profile: config.learningMode.profile,
      paperOnly: config.learningMode.paperOnly,
      label: "Aggressive Paper Learning Mode",
      description: "This mode intentionally allows more small paper trades so the system can learn from both wins and failures. No live trading is enabled.",
      thresholds: config.learningMode.riskThresholds,
      sizing: config.learningMode.sizing
    } : null
  };
}

function openPositionsFromSignals(signals, riskReview, paperResults, paperPositions) {
  const decisionsBySymbol = {};
  (riskReview.decisions || []).forEach((d) => { decisionsBySymbol[d.symbol] = d; });
  const signalsBySymbol = {};
  (signals.signals || []).forEach((s) => { signalsBySymbol[s.symbol] = s; });

  const openPos = Array.isArray(paperPositions.openPositions) ? paperPositions.openPositions : [];
  if (openPos.length === 0) return [];

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

    const positionBand = pos.entryRiskBand || pos.approvalBand || null;
    const decisionBand = decision.approvalBand || null;

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
      entryRiskBand: positionBand || decisionBand || null,
      currentRiskBand: decisionBand || positionBand || null,
      riskBandSource: pos.riskBandSource || decision.riskBandSource || null,
      riskBandStale: (positionBand && decisionBand && positionBand !== decisionBand) || false,
      signalConfidence: signal.confidence || decision.confidence || null,
      signalReason: signal.trigger || null,
      riskDecisionReason: decision.notes || null,
      tradeType: pos.approvalBand || decision.approvalBand || "standard",
      isLearningProbe: pos.isLearningProbe === true || decision.approvalBand === "approved_learning_probe"
    };
  });
}

function recentlyClosedFromSignals(signals, riskReview, paperResults) {
  const decisionsBySymbol = {};
  (riskReview.decisions || []).forEach((d) => { decisionsBySymbol[d.symbol] = d; });
  const signalsBySymbol = {};
  (signals.signals || []).forEach((s) => { signalsBySymbol[s.symbol] = s; });

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

function scrubEquityCurvePoints(points, startingBalance) {
  const cap = Number(startingBalance || 1000) * 2.5;
  return (Array.isArray(points) ? points : []).filter((point) => {
    const total = Number(point.totalAccountValue);
    return Number.isFinite(total) && total >= 0 && total <= cap;
  });
}

function loadSiteDashboardCruise1() {
  const cruise1Path = path.join(paths.dataRoot, "dashboard", "dashboard-data-bundle-v0.1.json");
  if (!fileExists(cruise1Path)) return null;
  try {
    return loadJson(cruise1Path);
  } catch {
    return null;
  }
}

function buildChartPointsFromAccountCurve(curve, startingBalance) {
  const points = scrubEquityCurvePoints(curve.points, startingBalance);
  let peak = startingBalance;
  return points.map((point, index) => {
    const equity = round(point.totalAccountValue);
    if (equity > peak) peak = equity;
    const drawdownPct = peak > 0 ? round(((peak - equity) / peak) * 100) : 0;
    return {
      label: index === 0 ? "Start" : (point.label || `Step ${index}`),
      equity,
      paperPnl: round(equity - startingBalance),
      drawdownPct,
      timestamp: point.timestamp
    };
  });
}

function enrichCycleActivity(activity, bundle, generatedAt) {
  if (!activity) {
    return {
      cycleId: bundle.paperCycleStatus?.cycleId || 'cycle_not_built',
      cycleStatus: bundle.paperCycleStatus?.status || 'missing',
      cycleStartedAt: bundle.paperCycleStatus?.cycleStartTimestamp || null,
      lastRefreshAt: generatedAt,
      vehiclesScanned: bundle.vehiclesScanned || 0,
      signalsReviewed: bundle.signalsReviewed || 0,
      tradesAttempted: bundle.fakePaperTradeCount || 0,
      tradesExecuted: bundle.fakePaperTradeCount || 0,
      openPositions: bundle.totalAccountValueCurve?.openPositionCount || 0,
      closedPositionsToday: bundle.riskPipeline?.closedPositionsToday || 0,
      learningProbesExecutedToday: bundle.riskPipeline?.learningProbesExecutedToday || 0
    };
  }
  return {
    ...activity,
    cycleStatus: bundle.paperCycleStatus?.status || activity.cycleStatus || 'missing',
    lastRefreshAt: generatedAt,
    vehiclesScanned: bundle.vehiclesScanned || activity.vehiclesScanned || 0,
    signalsReviewed: bundle.signalsReviewed || activity.signalsReviewed || 0,
    tradesAttempted: bundle.fakePaperTradeCount || activity.tradesAttempted || 0,
    tradesExecuted: bundle.fakePaperTradeCount || activity.tradesExecuted || 0,
    openPositions: bundle.totalAccountValueCurve?.openPositionCount || activity.openPositionCount || 0,
    closedPositionsToday: bundle.riskPipeline?.closedPositionsToday || activity.closedPositionsToday || 0,
    learningProbesExecutedToday: bundle.riskPipeline?.learningProbesExecutedToday || activity.learningProbesExecutedToday || 0
  };
}

function enrichDecisionBoard(board, bundle) {
  if (!board) {
    return {
      approvedStandard: 0, approvedLearningProbe: 0, watched: 0,
      rejected: 0, capacityBlocked: 0, hardRejected: 0,
      riskNotes: 'No risk decisions recorded yet.'
    };
  }
  const riskPipeline = bundle.riskPipeline || {};
  return {
    ...board,
    approvedStandard: riskPipeline.approvedStandard || board.approvedStandard || 0,
    approvedLearningProbe: riskPipeline.approvedLearningProbe || board.approvedLearningProbe || 0,
    watched: riskPipeline.watched || board.watched || 0,
    rejected: riskPipeline.rejected || board.rejected || 0,
    capacityBlocked: riskPipeline.capacityBlocked || board.capacityBlocked || 0,
    hardRejected: riskPipeline.hardSafetyFailures || board.hardRejected || 0,
    riskNotes: riskPipeline.rejected > 0
      ? `${riskPipeline.rejected} signal(s) blocked by Risk Desk. ${riskPipeline.approvedLearningProbe > 0 ? riskPipeline.approvedLearningProbe + ' learning probe(s) approved.' : ''}`
      : 'No recent risk decisions recorded.'
  };
}

function mergeSiteDashboardSections(bundle, cruise1) {
  const paperStart = Number(
    bundle.accountSummary?.paperStartingBalance
    || cruise1?.equityCurve?.paperStartingBalance
    || bundle.paperCycleStatus?.startingBalance
    || 1000
  );
  const curve = bundle.totalAccountValueCurve || {};
  const scrubbedPoints = scrubEquityCurvePoints(curve.points, paperStart);
  const totalAccountValue = round(curve.totalAccountValue || paperStart);
  const cashBalance = round(curve.paperCurrentCashBalance || bundle.accountSummary?.cashBalance || 0);
  const holdingsValue = round(curve.holdingsValue || bundle.accountSummary?.holdingsValue || 0);
  const chartPoints = buildChartPointsFromAccountCurve({ ...curve, points: scrubbedPoints }, paperStart);

  const merged = {
    ...bundle,
    schemaVersion: "marketops-dashboard-bundle-public-v0.5",
    paperSimulation: true,
    startingBalance: paperStart,
    endingEquity: totalAccountValue,
    paperPnl: round(totalAccountValue - paperStart),
    paperReturnPct: paperStart ? round(((totalAccountValue - paperStart) / paperStart) * 100) : 0,
    targetProgressPct: bundle.targetBalance
      ? round(((totalAccountValue - paperStart) / (bundle.targetBalance - paperStart)) * 100)
      : 0,
    totalAccountValueCurve: {
      ...curve,
      paperStartingBalance: paperStart,
      points: scrubbedPoints,
      totalAccountValue,
      paperCurrentCashBalance: cashBalance,
      holdingsValue
    },
    equityCurve: {
      label: curve.label || "Total Account Value (Cash + Holdings)",
      definition: curve.definition || "Current cash balance plus market value of all open positions",
      paperStartingBalance: paperStart,
      windowDays: curve.windowDays || 14,
      cycleId: curve.cycleId || bundle.paperCycleStatus?.cycleId || "cycle_not_built",
      cashBalance,
      holdingsValue,
      totalAccountValue,
      openPositionCount: curve.openPositionCount || bundle.accountSummary?.openPositionCount || 0,
      points: scrubbedPoints
    },
    paperProfitLoss: bundle.paperProfitLoss || {
      realizedPnl: 0, unrealizedPnl: 0, totalPnl: round(totalAccountValue - paperStart),
      totalPnlPct: paperStart ? round(((totalAccountValue - paperStart) / paperStart) * 100) : 0,
      winningTrades: 0, losingTrades: 0, openPositionPnl: holdingsValue
    },
    corePaperTarget: bundle.corePaperTarget || {
      startingBalance: paperStart,
      currentTotalAccountValue: totalAccountValue,
      targetValue: bundle.targetBalance || 13000,
      progressPct: bundle.targetProgressPct || 0,
      remainingToTarget: round(Math.max(0, (bundle.targetBalance || 13000) - totalAccountValue)),
      depletionThreshold: round(paperStart * 0.5),
      distanceFromDepletion: round(totalAccountValue - (paperStart * 0.5)),
      targetStatus: totalAccountValue >= (bundle.targetBalance || 13000) ? 'target_reached' : totalAccountValue <= (paperStart * 0.5) ? 'depletion_risk' : 'in_progress'
    },
    accountSummary: {
      cashBalance,
      holdingsValue,
      totalAccountValue,
      openPositionCount: curve.openPositionCount || bundle.accountSummary?.openPositionCount || 0,
      paperStartingBalance: paperStart,
      startingBalance: paperStart,
      realizedPnl: bundle.accountSummary?.realizedPnl || 0,
      unrealizedPnl: bundle.accountSummary?.unrealizedPnl || holdingsValue,
      totalPnl: round(totalAccountValue - paperStart),
      totalPnlPct: paperStart ? round(((totalAccountValue - paperStart) / paperStart) * 100) : 0,
      paperOnly: true
    },
    equityPoints: chartPoints,
    cumulativePnlPoints: chartPoints.length >= 2
      ? chartPoints.map((point) => ({
        label: point.label,
        cumulativePaperPnl: point.paperPnl
      }))
      : [
        { label: "Start", cumulativePaperPnl: 0 },
        { label: "Current", cumulativePaperPnl: round(totalAccountValue - paperStart) }
      ],
    drawdownPoints: chartPoints.map((point) => ({
      label: point.label,
      drawdownPct: point.drawdownPct
    })),
    currentCycleActivity: enrichCycleActivity(cruise1?.currentCycleActivity || bundle.currentCycleActivity, bundle, bundle.generatedAt),
    cycleDecisionBoard: enrichDecisionBoard(cruise1?.cycleDecisionBoard || bundle.cycleDecisionBoard, bundle),
    siteDisclaimers: cruise1?.disclaimers || bundle.siteDisclaimers || [],
    riskPipeline: bundle.riskPipeline ? {
      ...bundle.riskPipeline,
      capacityBlocked: bundle.riskPipeline.capacityBlocked || bundle.riskPipeline.watchedCapacityBlocked || 0,
      hardSafetyFailures: bundle.riskPipeline.hardSafetyFailures || 0
    } : null,
    openPositionsDetailed: bundle.openPositionsDetailed || [],
    recentlyClosedPositions: bundle.recentlyClosedPositions || [],
    vehicleUniverse: bundle.vehicleUniverse || null,
    learningModeEnabled: bundle.learningModeEnabled || false,
    aggressiveLearningMode: bundle.aggressiveLearningMode || false,
    learningMode: bundle.learningMode || null
  };

  if (merged.currentCycleActivity) {
    merged.currentCycleActivity.currentTotalAccountValue = totalAccountValue;
    merged.currentCycleActivity.currentCashBalance = cashBalance;
    merged.currentCycleActivity.currentHoldingsValue = holdingsValue;
  }

  return merged;
}

function writePublicDashboardBundle(filePath = paths.siteDashboardPublicV05Json, options = {}) {
  const bundle = mergeSiteDashboardSections(buildPublicDashboardBundle(options), loadSiteDashboardCruise1());
  writeJson(filePath, bundle);
  return { filePath, bundle };
}

function writePublicDashboardBundles(options = {}) {
  const bundle = mergeSiteDashboardSections(buildPublicDashboardBundle(options), loadSiteDashboardCruise1());
  const outputs = [
    paths.siteDashboardPublicV05Json,
    paths.siteDashboardPublicV04Json
  ];
  outputs.forEach((filePath) => writeJson(filePath, bundle));
  return { filePath: paths.siteDashboardPublicV05Json, bundle, outputs };
}

module.exports = {
  buildPublicDashboardBundle,
  mergeSiteDashboardSections,
  writePublicDashboardBundle,
  writePublicDashboardBundles,
  scrubEquityCurvePoints
};
