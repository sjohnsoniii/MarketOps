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
  agentSummary: path.join(dataRoot, "agent-reviews", "latest-agent-review-summary.json"),
  marketData: path.join(dataRoot, "market-data", "alpaca", "alpaca-market-data-latest-v0.1.json"),
  cycle: path.join(dataRoot, "paper", "cycles", "paper-cycle-latest-v0.1.json"),
  refreshHealth: path.join(dataRoot, "dashboard", "dashboard-refresh-health-v0.1.json"),
  config: path.join(coreRoot, "config", "marketops.phase1.config.json")
};

function tryReadFallback(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

const cachedConfig = tryReadFallback(inputPaths.config, {});

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

function groupBarsBySymbol(marketData) {
  return (marketData.bars || []).reduce((acc, bar) => {
    if (!bar.symbol) return acc;
    acc[bar.symbol] = acc[bar.symbol] || [];
    acc[bar.symbol].push(bar);
    return acc;
  }, {});
}

function buildMarketDataFreshnessPanel(marketData, now = new Date()) {
  const refreshAgeMinutes = minutesOld(marketData.generatedAt, now);
  const latestBarAgeMinutes = minutesOld(marketData.latestBarTimestamp, now);
  return {
    dataSource: marketData.dataSource || "deterministic_sample",
    feed: marketData.feed || "sample",
    generatedAt: marketData.generatedAt || null,
    latestBarTimestamp: marketData.latestBarTimestamp || null,
    barsLoaded: Array.isArray(marketData.bars) ? marketData.bars.length : 0,
    quotesLoaded: Array.isArray(marketData.quotes) ? marketData.quotes.length : 0,
    refreshAgeMinutes,
    latestBarAgeMinutes,
    refreshFreshnessLabel: freshnessLabel(refreshAgeMinutes, 45, 120),
    latestBarFreshnessLabel: freshnessLabel(latestBarAgeMinutes, 90, 390),
    rawMarketDataPublished: false,
    publicSafeDerivedOnly: true,
    paperOnly: true,
    liveTradingEnabled: false,
    orderPlacementEnabled: false,
    externalEffects: false,
    publishAllowed: false
  };
}

function buildRecentMarketMovement(marketData) {
  return Object.entries(groupBarsBySymbol(marketData)).map(([symbol, bars]) => {
    const sorted = bars.slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const first = sorted[0];
    const latest = sorted[sorted.length - 1];
    const change = Number(latest.close || 0) - Number(first.close || 0);
    const changePct = first.close ? (change / Number(first.close)) * 100 : 0;
    const direction = directionForChange(changePct);
    return {
      symbol,
      firstTimestamp: first.timestamp,
      latestTimestamp: latest.timestamp,
      changePct: round(changePct),
      direction,
      movementBucket: movementBucket(changePct),
      barsReviewed: sorted.length,
      dataSource: marketData.dataSource || "alpaca_iex",
      paperOnly: true,
      liveTradingEnabled: false,
      rawPricesPublished: false
    };
  }).sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
}

function buildMarketMovementSeries(marketData) {
  return Object.entries(groupBarsBySymbol(marketData)).map(([symbol, bars]) => {
    const sorted = bars.slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const first = sorted[0] || {};
    return {
      symbol,
      dataSource: marketData.dataSource || "alpaca_iex",
      points: sorted.map((bar, index) => ({
        sequence: index + 1,
        timestamp: bar.timestamp,
        changePct: first.close ? round(((Number(bar.close || 0) - Number(first.close)) / Number(first.close)) * 100) : 0,
        rawPricePublished: false
      }))
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

function buildWatchlistMovementSummary(marketMovement, signalOutput) {
  const rows = marketMovement.length ? marketMovement : (signalOutput.signals || []).map((signal) => ({
    symbol: signal.symbol,
    changePct: Number(signal.sampleChangePct || 0),
    direction: directionForChange(Number(signal.sampleChangePct || 0)),
    movementBucket: movementBucket(Number(signal.sampleChangePct || 0)),
    dataSource: signal.dataSource || signalOutput.dataSource || "deterministic_sample",
    paperOnly: true,
    rawPricesPublished: false
  }));
  const strongest = rows.slice().sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))[0] || null;
  return {
    vehiclesReviewed: rows.length,
    dataSource: rows[0] && rows[0].dataSource || signalOutput.dataSource || "deterministic_sample",
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

function buildVehicleDirectionCounts(marketMovement, signalOutput) {
  const rows = marketMovement.length ? marketMovement : (signalOutput.signals || []).map((signal) => ({
    direction: directionForChange(Number(signal.sampleChangePct || 0))
  }));
  const counts = countBy(rows, (item) => item.direction);
  return ["up", "down", "flat"].map((label) => ({ label, value: Number(counts[label] || 0) }));
}

function buildMovementBuckets(marketMovement, signalOutput) {
  const rows = marketMovement.length ? marketMovement : (signalOutput.signals || []).map((signal) => ({
    movementBucket: movementBucket(Number(signal.sampleChangePct || 0))
  }));
  const counts = countBy(rows, (item) => item.movementBucket);
  return ["flat_under_0_25pct", "micro_0_25_to_0_5pct", "small_0_5_to_1pct", "moderate_1_to_2pct", "large_2pct_plus"]
    .map((label) => ({ label, value: Number(counts[label] || 0) }));
}

function buildSignalCandidateSummary(signalOutput) {
  const signals = Array.isArray(signalOutput.signals) ? signalOutput.signals : [];
  const candidates = signals.filter((signal) => signal.status === "candidate");
  return [
    { label: "Candidates generated", value: candidates.length },
    { label: "Ignored signals", value: signals.filter((signal) => signal.status !== "candidate").length },
    { label: "Signals reviewed", value: signals.length }
  ];
}

function buildSignalConfidenceDistribution(signalOutput) {
  const buckets = [
    { label: "0.00-0.25", min: 0, max: 0.25 },
    { label: "0.25-0.55", min: 0.25, max: 0.55 },
    { label: "0.55-0.75", min: 0.55, max: 0.75 },
    { label: "0.75-1.00", min: 0.75, max: 1.01 }
  ];
  const signals = Array.isArray(signalOutput.signals) ? signalOutput.signals : [];
  return buckets.map((bucket) => ({
    label: bucket.label,
    value: signals.filter((signal) => Number(signal.confidence || 0) >= bucket.min && Number(signal.confidence || 0) < bucket.max).length
  }));
}

function safeReason(reason) {
  return String(reason || "Unknown risk block").replace(/\d+\.\d+/g, "threshold");
}

function buildRiskRejectionReasons(riskOutput) {
  const blocked = (riskOutput.decisions || []).filter((decision) => decision.approved !== true);
  const counts = {};
  blocked.forEach((decision) => {
    (decision.blockReasons || ["Unknown risk block"]).forEach((reason) => {
      const key = safeReason(reason);
      counts[key] = (counts[key] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason));
}

function approvalGapCount(signal, decision) {
  let gaps = 0;
  if (signal.status !== "candidate") gaps += 1;
  if (Number(signal.confidence || 0) < 0.55) gaps += 1;
  if (signal.directionBias !== "up") gaps += 1;
  if (!signal.trigger || signal.trigger === "No actionable move.") gaps += 1;
  if (!signal.invalidation || signal.invalidation === "N/A") gaps += 1;
  if (decision && Array.isArray(decision.blockReasons)) gaps = Math.max(gaps, decision.blockReasons.length);
  return gaps;
}

function buildAlmostApprovedCandidates(signalOutput, riskOutput) {
  const decisionsBySignalId = {};
  (riskOutput.decisions || []).forEach((decision) => {
    decisionsBySignalId[decision.signalId] = decision;
  });
  return (signalOutput.signals || [])
    .map((signal) => {
      const decision = decisionsBySignalId[signal.signalId] || {};
      const missingGateCount = approvalGapCount(signal, decision);
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
    })
    .sort((a, b) => a.missingGateCount - b.missingGateCount || b.confidence - a.confidence || Math.abs(b.changePct) - Math.abs(a.changePct))
    .slice(0, 8);
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

function buildMarketRegimeSummary(analyticsSummary, marketMovement) {
  const regime = buildRegimeDashboard(analyticsSummary);
  const directionCounts = countBy(marketMovement, (item) => item.direction);
  const broadDirection = Number(directionCounts.up || 0) > Number(directionCounts.down || 0)
    ? "watchlist_tilt_up"
    : Number(directionCounts.down || 0) > Number(directionCounts.up || 0)
      ? "watchlist_tilt_down"
      : "watchlist_mixed_or_flat";
  return {
    source: regime.regimesCompared ? "synthetic_regime_context_plus_watchlist_movement" : "watchlist_movement_only",
    broadDirection,
    regimesCompared: regime.regimesCompared,
    strongestPaperRegime: regime.strongestPaperRegime,
    weakestPaperRegime: regime.weakestPaperRegime,
    fallbackLabeled: true,
    publicSafe: true
  };
}

function buildCurrentPaperPerformance(equityOutput, tradeOutput, analyticsSummary) {
  const equityAnalytics = analyticsSummary.equityAnalytics || {};
  const startingEquity = Number(equityOutput.startingBalance || tradeOutput.startingBalance || equityAnalytics.startingEquity || 0);
  const endingEquity = Number(equityOutput.endingEquity || tradeOutput.endingBalance || equityAnalytics.endingEquity || startingEquity);
  const paperPnl = Number(equityOutput.totalPnl ?? tradeOutput.totalPnl ?? equityAnalytics.totalPnl ?? (endingEquity - startingEquity));
  const paperReturnPct = Number(equityOutput.totalReturnPct ?? tradeOutput.totalReturnPct ?? equityAnalytics.totalReturnPct ?? (startingEquity ? (paperPnl / startingEquity) * 100 : 0));
  return {
    startingEquity: round(startingEquity),
    endingEquity: round(endingEquity),
    paperPnl: round(paperPnl),
    paperReturnPct: round(paperReturnPct),
    maxDrawdownPct: round(equityOutput.maxDrawdownPct ?? equityAnalytics.maxDrawdownPct ?? 0),
    riskAdjustedScore: round(analyticsSummary.riskAdjustedScore || 0),
    dataSource: "paper_outputs_current"
  };
}

function buildPaperPnlSeries(rollingHistory) {
  return rollingHistory.map((run) => ({
    sequence: run.sequence,
    generatedAt: run.generatedAt,
    paperPnl: run.paperPnl,
    paperReturnPct: run.paperReturnPct,
    endingEquity: run.endingEquity
  }));
}

function buildCumulativePaperPnl(tradeOutput) {
  let cumulativePaperPnl = 0;
  const trades = Array.isArray(tradeOutput.trades) ? tradeOutput.trades : [];
  return [{ label: "Start", cumulativePaperPnl: 0 }].concat(trades.map((trade, index) => {
    cumulativePaperPnl = round(cumulativePaperPnl + Number(trade.realizedPnl || 0));
    return {
      label: `Trade ${index + 1}`,
      symbol: trade.symbol,
      paperPnl: round(trade.realizedPnl || 0),
      cumulativePaperPnl
    };
  }));
}

function buildTargetProgress(equityOutput, tradeOutput) {
  const startingBalance = Number(equityOutput.startingBalance || tradeOutput.startingBalance || 10000);
  const endingEquity = Number(equityOutput.endingEquity || tradeOutput.endingBalance || startingBalance);
  const targetBalance = Number(equityOutput.targetBalance || 13000);
  const targetGain = targetBalance - startingBalance;
  const currentGain = endingEquity - startingBalance;
  return {
    startingBalance: round(startingBalance),
    currentBalance: round(endingEquity),
    targetBalance: round(targetBalance),
    progressTowardTargetPct: targetGain ? round((currentGain / targetGain) * 100) : 0,
    remainingToTarget: round(targetBalance - endingEquity),
    paperOnly: true,
    milestones: [
      { label: "Start", balance: round(startingBalance) },
      { label: "Current", balance: round(endingEquity) },
      { label: "+15%", balance: round(startingBalance * 1.15) },
      { label: "+30%", balance: round(targetBalance) }
    ]
  };
}

function buildVehicleActivity(signalOutput, riskOutput, tradeOutput, marketMovement) {
  const decisionsBySymbol = {};
  (riskOutput.decisions || []).forEach((decision) => {
    decisionsBySymbol[decision.symbol] = decision;
  });
  const tradePnlBySymbol = {};
  (tradeOutput.trades || []).forEach((trade) => {
    tradePnlBySymbol[trade.symbol] = round((tradePnlBySymbol[trade.symbol] || 0) + Number(trade.realizedPnl || 0));
  });
  const movementBySymbol = {};
  marketMovement.forEach((item) => {
    movementBySymbol[item.symbol] = item;
  });
  return (signalOutput.signals || []).map((signal) => {
      const decision = decisionsBySymbol[signal.symbol] || {};
      const movement = movementBySymbol[signal.symbol] || {};
      return {
      symbol: signal.symbol,
      assetType: signal.assetType,
      status: signal.status,
      directionBias: signal.directionBias,
      marketChangePct: round(signal.sampleChangePct ?? movement.changePct ?? 0),
      movementBucket: movement.movementBucket || movementBucket(signal.sampleChangePct || 0),
      riskApproved: decision.approved === true,
      riskLevel: decision.finalRiskLevel || signal.riskLevel,
      fakePaperPnl: round(tradePnlBySymbol[signal.symbol] || 0),
      dataSource: signal.dataSource || movement.dataSource || "deterministic_sample",
      paperOnly: true,
      rawPricesPublished: false
    };
  });
}

function buildSignalRiskCounts(rollingHistory) {
  return rollingHistory.map((run) => ({
    sequence: run.sequence,
    generatedAt: run.generatedAt,
    signalsReviewed: run.signalsReviewed,
    riskApproved: run.riskApproved,
    riskBlocked: run.riskBlocked,
    fakePaperTrades: run.fakePaperTrades
  }));
}

function buildReturnVsDrawdownSnapshot(currentPerformance, rollingHistory) {
  return [{
    label: "Current paper run",
    paperReturnPct: currentPerformance.paperReturnPct,
    maxDrawdownPct: currentPerformance.maxDrawdownPct
  }].concat(rollingHistory.slice(-10).map((run) => ({
    label: run.generatedAt,
    paperReturnPct: run.paperReturnPct,
    maxDrawdownPct: run.maxDrawdownPct
  })));
}

function buildVehicleContribution(signalOutput, tradeOutput, marketMovement) {
  const tradePnlBySymbol = {};
  (tradeOutput.trades || []).forEach((trade) => {
    tradePnlBySymbol[trade.symbol] = round((tradePnlBySymbol[trade.symbol] || 0) + Number(trade.realizedPnl || 0));
  });
  const movementBySymbol = {};
  marketMovement.forEach((item) => {
    movementBySymbol[item.symbol] = item;
  });
  const symbols = [...new Set([].concat((signalOutput.signals || []).map((item) => item.symbol), Object.keys(tradePnlBySymbol), marketMovement.map((item) => item.symbol)))];
  return symbols.sort().map((symbol) => ({
    symbol,
    fakePaperPnl: round(tradePnlBySymbol[symbol] || 0),
    marketChangePct: round((movementBySymbol[symbol] && movementBySymbol[symbol].changePct) || 0),
    dataSource: movementBySymbol[symbol] ? movementBySymbol[symbol].dataSource : (signalOutput.dataSource || "deterministic_sample"),
    paperOnly: true
  }));
}

function buildBotActivityTimeline(rollingHistory) {
  return rollingHistory.slice(-20).map((run, index, runs) => {
    const previous = index > 0 ? runs[index - 1] : null;
    const gapMinutes = previous && run.generatedAt && previous.generatedAt
      ? round((new Date(run.generatedAt).getTime() - new Date(previous.generatedAt).getTime()) / 60000)
      : null;
    return {
      sequence: run.sequence,
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

function buildStaleDataWarningPanel({ analytics, marketData, rollingHistory }, now = new Date()) {
  const warnings = [];
  const latestRun = rollingHistory[rollingHistory.length - 1] || null;
  const analyticsAgeMinutes = minutesOld(analytics.generatedAt, now);
  const marketRefreshAgeMinutes = minutesOld(marketData.generatedAt, now);
  const latestBarAgeMinutes = minutesOld(marketData.latestBarTimestamp, now);
  const latestRunAgeMinutes = latestRun ? minutesOld(latestRun.generatedAt, now) : null;

  if (analytics.generatedAt && latestRun && new Date(analytics.generatedAt) < new Date(latestRun.generatedAt)) {
    warnings.push({
      item: "analytics_summary",
      status: "stale_context_only",
      detail: `Analytics summary ${analytics.generatedAt} is older than latest paper run ${latestRun.generatedAt}. Dashboard headline cards use current paper outputs instead.`
    });
  }
  if (marketRefreshAgeMinutes == null) {
    warnings.push({ item: "market_data_refresh", status: "missing", detail: "No market-data refresh timestamp is available." });
  } else if (marketRefreshAgeMinutes > 120) {
    warnings.push({ item: "market_data_refresh", status: "aging", detail: `Market-data bundle was refreshed ${marketRefreshAgeMinutes} minutes ago.` });
  }
  if (latestBarAgeMinutes != null && latestBarAgeMinutes > 390) {
    warnings.push({ item: "latest_market_bar", status: "market_closed_or_delayed", detail: `Latest bar is ${latestBarAgeMinutes} minutes old. Label as delayed/closed-market data, not live tick data.` });
  }
  if (latestRunAgeMinutes != null && latestRunAgeMinutes > 75) {
    warnings.push({ item: "paper_run", status: "stale", detail: `Latest paper run is ${latestRunAgeMinutes} minutes old.` });
  }

  return {
    status: warnings.length ? "review" : "clear",
    generatedAt: now.toISOString(),
    warnings: warnings.length ? warnings : [{
      item: "dashboard_inputs",
      status: "clear",
      detail: "No stale input condition detected for the latest local refresh."
    }]
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

function buildPaperCycleStatus(cycle) {
  return {
    cycleId: cycle.cycleId || "cycle_not_built",
    status: cycle.status || "missing",
    startingBalance: round(cycle.startingBalance || 1000),
    currentBalance: round(cycle.currentBalance || 1000),
    endingBalance: cycle.endingBalance == null ? null : round(cycle.endingBalance),
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
    activePreset: (cachedConfig.paperAccount && cachedConfig.paperAccount.paperAccountPreset) || "standard"
  };
}

function buildDashboardBundle() {
  const now = new Date();
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
  const cycle = readJson(inputPaths.cycle, {});
  const refreshHealth = readJson(inputPaths.refreshHealth, {});

  const rollingHistory = sanitizeRollingHistory(runHistory);
  const equitySeries = buildEquitySeries(equity);
  const marketFreshness = buildMarketDataFreshnessPanel(marketData, now);
  const marketMovement = buildRecentMarketMovement(marketData);
  const marketMovementSeries = buildMarketMovementSeries(marketData);
  const currentPaperPerformance = buildCurrentPaperPerformance(equity, trades, analytics);
  const targetProgress = buildTargetProgress(equity, trades);
  const vehicleActivity = buildVehicleActivity(signals, risk, trades, marketMovement);
  const signalRiskCounts = buildSignalRiskCounts(rollingHistory);
  const vehicleContribution = buildVehicleContribution(signals, trades, marketMovement);
  const botActivityTimeline = buildBotActivityTimeline(rollingHistory);
  const staleDataWarningPanel = buildStaleDataWarningPanel({ analytics, marketData, rollingHistory }, now);
  const watchlistMovementSummary = buildWatchlistMovementSummary(marketMovement, signals);
  const vehicleDirectionCounts = buildVehicleDirectionCounts(marketMovement, signals);
  const movementBuckets = buildMovementBuckets(marketMovement, signals);
  const signalCandidatesGenerated = buildSignalCandidateSummary(signals);
  const signalConfidenceDistribution = buildSignalConfidenceDistribution(signals);
  const riskRejectionReasons = buildRiskRejectionReasons(risk);
  const almostApprovedCandidates = buildAlmostApprovedCandidates(signals, risk);
  const marketRegimeSummary = buildMarketRegimeSummary(analytics, marketMovement);
  const paperCycleStatus = buildPaperCycleStatus(cycle);

  return {
    generatedAt: now.toISOString(),
    dashboardVersion: "marketops-public-safe-dashboard-v0.1",
    mode: "paper_simulation",
    paperOnly: true,
    sampleData: true,
    realMarketDataInputs: marketData.dataSource === "alpaca_iex",
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
    externalEffects: false,
    publishAllowed: false,
    rawMarketDataPublished: false,
    publicSafe: true,
    dataProvenance: {
      note: "This dashboard combines data from multiple sources with different provenance. Fields below document the source of each major section.",
      paperCycleBalance: cycle.startingBalance ? "real_paper_cycle_output" : "unavailable",
      latestPaperRun: runHistory && Array.isArray(runHistory.runs) && runHistory.runs.length > 0 ? "real_paper_run_history" : "unavailable",
      marketBars: Array.isArray(marketData.bars) && marketData.bars.length > 0
        ? (marketData.dataSource === "alpaca_iex" ? "real_alpaca_iex_bars" : "sample_data")
        : "unavailable",
      marketQuotes: Array.isArray(marketData.quotes) && marketData.quotes.length > 0
        ? (marketData.dataSource === "alpaca_iex" ? "real_alpaca_iex_quotes" : "sample_data")
        : "unavailable",
      equityCurve: Array.isArray(equity.points) && equity.points.length > 0 ? "real_paper_equity_curve" : "unavailable",
      tradeRecords: Array.isArray(trades.trades) && trades.trades.length > 0 ? "real_paper_trade_records" : "no_trades_executed",
      riskDecisions: Array.isArray(risk.decisions) && risk.decisions.length > 0 ? "real_paper_risk_decisions" : "unavailable",
      signalScans: Array.isArray(signals.signals) && signals.signals.length > 0 ? "real_paper_signal_scans" : "unavailable",
      agentReviews: agentSummary && agentSummary.reviewsGenerated > 0 ? "real_agent_review_outputs" : "unavailable",
      refreshHealth: refreshHealth.lastStatus ? "real_refresh_health_tracker" : "unavailable",
      cycleStatus: cycle.status ? "real_cycle_status" : "unavailable",
      disclaimer: "All performance numbers are paper simulation only. No real money, broker execution, or live trading is involved."
    },
    dashboardCards: {
      currentPaperPerformance,
      signalFunnel: buildSignalFunnel(signals, risk, trades),
      tradeOutcomeDistribution: buildTradeOutcomeDistribution(analytics, trades),
      riskEventSummary: buildRiskEventSummary(risk),
      regimeSummary: buildRegimeDashboard(analytics),
      contentGenerationStats: buildContentStats(contentSummary, contentQueue),
      agentReviewStats: buildAgentReviewStats(agentSummary),
      marketDataHeartbeat: {
        dataSource: marketData.dataSource || "deterministic_sample",
        generatedAt: marketData.generatedAt || null,
        latestBarTimestamp: marketData.latestBarTimestamp || null,
        barsLoaded: Array.isArray(marketData.bars) ? marketData.bars.length : 0,
        quotesLoaded: Array.isArray(marketData.quotes) ? marketData.quotes.length : 0,
        paperOnly: true,
        liveTradingEnabled: false
      },
      marketDataFreshnessPanel: marketFreshness,
      watchlistMovementSummary,
      vehicleDirectionCounts,
      movementBuckets,
      signalCandidatesGenerated,
      signalConfidenceDistribution,
      riskRejectionReasons,
      almostApprovedCandidates,
      recentMarketMovementPanel: marketMovement.slice(0, 8),
      botActivityTimeline: botActivityTimeline.slice(-8),
      staleDataWarningPanel,
      marketRegimeSummary,
      paperCycleStatus,
      targetProgress,
      publicSafetyState: {
        paperOnly: true,
        externalEffects: false,
        publishAllowed: false,
        liveTradingEnabled: false,
        orderPlacementEnabled: false,
        rawMarketDataPublished: false
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
      }
    },
    charts: {
      equityCurve: equitySeries,
      paperEquityCurve: equitySeries,
      paperPnlSeries: buildPaperPnlSeries(rollingHistory),
      rollingEquity: rollingHistory.map((run) => ({
        sequence: run.sequence,
        generatedAt: run.generatedAt,
        endingEquity: run.endingEquity,
        paperReturnPct: run.paperReturnPct
      })),
      drawdownVisualData: buildDrawdownVisualData(equitySeries, rollingHistory),
      drawdownSeries: buildDrawdownVisualData(equitySeries, rollingHistory).currentRun,
      vehicleActivity,
      watchlistMovementSummary: watchlistMovementSummary.summaryRows,
      vehicleDirectionCounts,
      movementBuckets,
      signalCandidatesGenerated,
      signalConfidenceDistribution,
      riskRejectionReasons,
      almostApprovedCandidates,
      signalRiskCounts,
      cumulativePaperPnl: buildCumulativePaperPnl(trades),
      targetProgress: targetProgress.milestones,
      signalFunnel: buildSignalFunnel(signals, risk, trades).chartSteps,
      tradeOutcomeBars: buildTradeOutcomeDistribution(analytics, trades).outcomeBars,
      tradeOutcomeMix: buildTradeOutcomeDistribution(analytics, trades).outcomeBars,
      riskDecisionMix: Object.entries(buildRiskEventSummary(risk).finalRiskLevelCounts).map(([label, value]) => ({ label, value })),
      vehicleContribution,
      returnVsDrawdownSnapshot: buildReturnVsDrawdownSnapshot(currentPaperPerformance, rollingHistory),
      paperAccountMilestoneStrip: targetProgress.milestones,
      regimeScoreBars: buildRegimeDashboard(analytics).regimeScoreBars,
      syntheticBenchmarkComparison: buildRegimeDashboard(analytics).syntheticBenchmarkComparison,
      marketDataFreshnessPanel: [marketFreshness],
      recentMarketMovementPanel: marketMovement,
      marketMovementSeries,
      botActivityTimeline,
      staleDataWarningPanel: staleDataWarningPanel.warnings,
      marketRegimeSummary: [marketRegimeSummary],
      paperCycleStatus: [paperCycleStatus],
      dashboardRefreshHealth: [{
        lastStatus: refreshHealth.lastStatus || "UNKNOWN",
        lastAttemptAt: refreshHealth.lastAttemptAt || null,
        lastSuccessfulRefreshAt: refreshHealth.lastSuccessfulRefreshAt || null,
        staleWarning: refreshHealth.staleWarning || null,
        refreshIntervalTargetHours: refreshHealth.refreshIntervalTargetHours || 2,
        schedulerInstalled: refreshHealth.schedulerInstalled === true,
        paperOnly: true
      }],
      quoteSnapshot: (marketData.quotes || []).map((quote) => ({
        symbol: quote.symbol,
        timestamp: quote.timestamp,
        spreadPct: quote.bidPrice && quote.askPrice ? round(((quote.askPrice - quote.bidPrice) / ((quote.askPrice + quote.bidPrice) / 2)) * 100) : 0,
        quoteAvailable: true,
        rawBidAskPublished: false
      }))
    },
    chartDataSources: {
      note: "Each chart key is labeled by its primary data source. real_paper = from paper simulation outputs, real_market = from Alpaca IEX feed, synthetic_analytics = from analytics pipeline, sample_fallback = deterministic sample when real data is unavailable.",
      equityCurve: equitySeries.length > 0 ? "real_paper_equity_curve" : "empty",
      paperEquityCurve: equitySeries.length > 0 ? "real_paper_equity_curve" : "empty",
      paperPnlSeries: rollingHistory.length > 0 ? "real_paper_run_history" : "empty",
      rollingEquity: rollingHistory.length > 0 ? "real_paper_run_history" : "empty",
      drawdownVisualData: equitySeries.length > 0 || rollingHistory.length > 0 ? "real_paper_equity_curve_and_history" : "empty",
      drawdownSeries: equitySeries.length > 0 ? "real_paper_equity_curve" : "empty",
      vehicleActivity: signals.signals.length > 0 ? "real_paper_signal_scans_plus_market_data" : "empty",
      watchlistMovementSummary: marketMovement.length > 0 ? "real_alpaca_iex_market_movement" : (signals.signals.length > 0 ? "sample_fallback_from_signal_sampleChangePct" : "empty"),
      vehicleDirectionCounts: marketMovement.length > 0 ? "real_alpaca_iex_market_movement" : (signals.signals.length > 0 ? "sample_fallback_from_signal_sampleChangePct" : "empty"),
      movementBuckets: marketMovement.length > 0 ? "real_alpaca_iex_market_movement" : (signals.signals.length > 0 ? "sample_fallback_from_signal_sampleChangePct" : "empty"),
      signalCandidatesGenerated: signals.signals.length > 0 ? "real_paper_signal_scans" : "empty",
      signalConfidenceDistribution: signals.signals.length > 0 ? "real_paper_signal_scans" : "empty",
      riskRejectionReasons: risk.decisions.length > 0 ? "real_paper_risk_decisions" : "empty",
      almostApprovedCandidates: signals.signals.length > 0 ? "real_paper_signal_scans_plus_risk_decisions" : "empty",
      signalRiskCounts: rollingHistory.length > 0 ? "real_paper_run_history" : "empty",
      cumulativePaperPnl: trades.trades.length > 0 ? "real_paper_trade_records" : "no_trades_executed",
      targetProgress: equity.startingBalance ? "real_paper_equity_curve_plus_config_target" : "empty",
      signalFunnel: signals.signals.length > 0 ? "real_paper_signal_scans_plus_risk_decisions" : "empty",
      tradeOutcomeBars: trades.trades.length > 0 || analytics.tradeAnalytics ? "real_paper_trade_records_or_analytics" : "no_trades_executed",
      tradeOutcomeMix: trades.trades.length > 0 || analytics.tradeAnalytics ? "real_paper_trade_records_or_analytics" : "no_trades_executed",
      riskDecisionMix: risk.decisions.length > 0 ? "real_paper_risk_decisions" : "empty",
      vehicleContribution: signals.signals.length > 0 || marketMovement.length > 0 ? "real_paper_signals_plus_market_movement" : "empty",
      returnVsDrawdownSnapshot: equitySeries.length > 0 || rollingHistory.length > 0 ? "real_paper_equity_curve_plus_history" : "empty",
      paperAccountMilestoneStrip: equity.startingBalance ? "real_paper_equity_curve_plus_config_target" : "empty",
      regimeScoreBars: analytics.regimeAnalytics && analytics.regimeAnalytics.regimeRows && analytics.regimeAnalytics.regimeRows.length > 0 ? "synthetic_analytics_from_regime_rows" : "sample_fallback_empty_regime_data",
      syntheticBenchmarkComparison: analytics.regimeAnalytics && analytics.regimeAnalytics.regimeRows && analytics.regimeAnalytics.regimeRows.length > 0 ? "synthetic_analytics_from_regime_rows" : "sample_fallback_empty_regime_data",
      marketDataFreshnessPanel: marketData.generatedAt ? "real_market_data_or_sample_freshness" : "empty",
      recentMarketMovementPanel: marketMovement.length > 0 ? "real_alpaca_iex_market_movement" : "empty",
      marketMovementSeries: marketMovementSeries.length > 0 ? "real_alpaca_iex_market_movement" : "empty",
      botActivityTimeline: rollingHistory.length > 0 ? "real_paper_run_history" : "empty",
      staleDataWarningPanel: true,
      marketRegimeSummary: analytics.regimeAnalytics ? "synthetic_analytics_plus_watchlist_movement" : "watchlist_movement_only",
      paperCycleStatus: cycle.status ? "real_paper_cycle_output" : "empty",
      dashboardRefreshHealth: refreshHealth.lastStatus ? "real_refresh_health_tracker" : "empty",
      quoteSnapshot: marketData.quotes && marketData.quotes.length > 0 ? "real_alpaca_iex_quotes" : "empty"
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
