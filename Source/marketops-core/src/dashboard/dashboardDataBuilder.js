const path = require("path");
const { fileExists, loadJson } = require("../utils/fileStore");
const { round } = require("../utils/number");
const { paths } = require("../utils/paths");
const { loadConfig } = require("../config/configLoader");

function safeLoad(filePath, fallback) {
  try {
    if (!fileExists(filePath)) return fallback;
    return loadJson(filePath);
  } catch {
    return fallback;
  }
}

function safeNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function isoNow() {
  return new Date().toISOString();
}

function computeHoldingsValue(positions) {
  if (!positions || !Array.isArray(positions.openPositions)) return 0;
  return round(positions.openPositions.reduce((sum, p) => sum + safeNumber(p.currentValue, 0), 0));
}

function buildEquityCurve({ cycle, positions, performance, runHistory, trades, generatedAt }) {
  const originalStartingBalance = safeNumber(cycle.startingBalance, 1000);
  const windowDays = 14;
  const fourteenDaysAgo = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
  const cycleStart = cycle.cycleStartTimestamp ? new Date(cycle.cycleStartTimestamp) : null;
  const windowStart = cycleStart && cycleStart > fourteenDaysAgo ? cycleStart : fourteenDaysAgo;

  const cashBalance = safeNumber(performance.cashBalance, safeNumber(trades.cashBalance, originalStartingBalance));
  const holdingsValue = computeHoldingsValue(positions);
  const totalAccountValue = round(cashBalance + holdingsValue);

  const points = [];

  points.push({
    timestamp: windowStart.toISOString(),
    cashBalance: originalStartingBalance,
    holdingsValue: 0,
    totalAccountValue: originalStartingBalance,
    source: "cycle_start",
    isBackfilled: false,
    note: "Cycle start with $1,000 paper balance"
  });

  const runs = Array.isArray(runHistory.runs) ? runHistory.runs : [];
  const recentRuns = runs.filter((r) => {
    const t = new Date(r.generatedAt);
    return t >= windowStart && t <= new Date();
  });

  recentRuns.forEach((r) => {
    const cash = safeNumber(r.endingEquity, safeNumber(r.cashBalance, 0));
    if (cash > originalStartingBalance * 2.5) return;
    points.push({
      timestamp: r.generatedAt,
      cashBalance: round(cash),
      holdingsValue: 0,
      totalAccountValue: round(cash),
      source: "run_history",
      isBackfilled: false,
      note: "Cash balance from paper run history"
    });
  });

  points.push({
    timestamp: generatedAt,
    cashBalance: round(cashBalance),
    holdingsValue: round(holdingsValue),
    totalAccountValue: round(totalAccountValue),
    source: "paper_simulation_current",
    isBackfilled: false,
    note: holdingsValue > 0
      ? `Current: cash ${cashBalance} + holdings ${holdingsValue} = ${totalAccountValue}`
      : "Current: cash only, no open positions"
  });

  const seen = new Set();
  const deduped = points.filter((p) => {
    const key = p.timestamp;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  deduped.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  deduped.forEach((p, i) => {
    if (i > 0) {
      const prev = deduped[i - 1];
      const expected = prev.totalAccountValue + (p.totalAccountValue - prev.totalAccountValue);
      if (p.totalAccountValue !== expected) {
        p.note = (p.note || "") + " (accumulated step not strictly additive)";
      }
    }
  });

  const validation = deduped.every((p) => {
    const sum = round(p.cashBalance + p.holdingsValue);
    return sum === round(p.totalAccountValue);
  });

  return {
    label: "Total Account Value",
    definition: "Cash balance plus market value of open positions",
    paperStartingBalance: originalStartingBalance,
    windowDays,
    cycleId: cycle.cycleId || "cycle_not_built",
    windowStart: windowStart.toISOString(),
    windowEnd: generatedAt,
    points: deduped,
    cashBalance: round(cashBalance),
    holdingsValue: round(holdingsValue),
    totalAccountValue: round(totalAccountValue),
    openPositionCount: positions && Array.isArray(positions.openPositions) ? positions.openPositions.length : 0,
    validation: {
      totalAccountValueEqualsCashPlusHoldings: validation,
      allPointsValid: deduped.every((p) =>
        Number.isFinite(p.cashBalance) &&
        Number.isFinite(p.holdingsValue) &&
        Number.isFinite(p.totalAccountValue)
      ),
      noNaN: deduped.every((p) =>
        !Number.isNaN(p.cashBalance) &&
        !Number.isNaN(p.holdingsValue) &&
        !Number.isNaN(p.totalAccountValue)
      ),
      noInfinity: deduped.every((p) =>
        Number.isFinite(p.cashBalance) &&
        Number.isFinite(p.holdingsValue) &&
        Number.isFinite(p.totalAccountValue)
      )
    }
  };
}

function buildCurrentCycleActivity({ cycle, positions, performance, trades, signals, risk, generatedAt }) {
  const startingPaperBalance = safeNumber(cycle.startingBalance, 1000);
  const currentCashBalance = safeNumber(performance.cashBalance, safeNumber(trades.cashBalance, startingPaperBalance));
  const holdingsValue = computeHoldingsValue(positions);
  const currentTotalAccountValue = round(currentCashBalance + holdingsValue);

  const riskDecisionsBySymbol = {};
  (risk.decisions || []).forEach((d) => {
    riskDecisionsBySymbol[d.symbol] = d;
  });

  const signalBySymbol = {};
  (signals.signals || []).forEach((s) => {
    signalBySymbol[s.symbol] = s;
  });

  const buys = [];
  const sells = [];
  const openHoldings = [];

  const openPositions = Array.isArray(positions.openPositions) ? positions.openPositions : [];
  const closedPositions = Array.isArray(positions.closedPositions) ? positions.closedPositions : [];

  openPositions.forEach((pos) => {
    const signal = signalBySymbol[pos.symbol] || {};
    const decision = riskDecisionsBySymbol[pos.symbol] || {};
    const currentPrice = safeNumber(pos.latestPrice, safeNumber(pos.currentPrice, 0));
    const avgPrice = safeNumber(pos.entryPrice, 0);
    const qty = safeNumber(pos.quantity, 0);
    const amountSpent = safeNumber(pos.positionValue, round(avgPrice * qty));
    const currentValue = safeNumber(pos.currentValue, round(currentPrice * qty));
    const unrealizedPnl = safeNumber(pos.unrealizedPnl, round(currentValue - amountSpent));
    const unrealizedPnlPct = amountSpent ? round((unrealizedPnl / amountSpent) * 100) : 0;

    const positionStoredBand = pos.entryRiskBand || pos.approvalBand || null;
    const decisionCurrentBand = decision.approvalBand || null;
    const entryRiskBand = positionStoredBand || decisionCurrentBand || null;
    const currentRiskBand = decisionCurrentBand || positionStoredBand || null;
    const riskBandSource = pos.riskBandSource || decision.riskBandSource || null;
    const riskBandStale = (positionStoredBand && decisionCurrentBand && positionStoredBand !== decisionCurrentBand) || false;

    openHoldings.push({
      symbol: pos.symbol,
      companyName: null,
      purchaseDate: pos.entryTime || pos.openedAt || null,
      sellDate: null,
      quantity: qty,
      averageBuyPrice: avgPrice,
      currentPrice,
      currentValue,
      unrealizedPnl,
      unrealizedPnlPct,
      daysHeld: pos.entryTime ? round((Date.now() - new Date(pos.entryTime).getTime()) / 86400000, 1) : 0,
      entryRiskBand,
      currentRiskBand,
      riskBandSource,
      riskBandStale
    });

    buys.push({
      symbol: pos.symbol,
      companyName: null,
      purchaseDate: pos.entryTime || pos.openedAt || null,
      quantity: qty,
      averageBuyPrice: avgPrice,
      amountSpent,
      currentPrice,
      currentValue,
      unrealizedPnl,
      unrealizedPnlPct,
      signalReason: signal.trigger || "No specific trigger recorded",
      plainEnglishReason: decision.approved
        ? `Risk Desk approved ${pos.symbol} for paper execution.`
        : `${pos.symbol} was opened during paper simulation.`,
      riskDeskVerdict: decision.approved === true ? "approved" : "not_rated"
    });
  });

  const tradeList = Array.isArray(trades.trades) ? trades.trades : [];
  tradeList.forEach((trade) => {
    const decision = riskDecisionsBySymbol[trade.symbol] || {};
    const signal = signalBySymbol[trade.symbol] || {};
    sells.push({
      symbol: trade.symbol,
      companyName: null,
      purchaseDate: trade.entryTime || trade.openedAt || trade.purchaseDate || null,
      sellDate: trade.exitTime || trade.generatedAt || generatedAt,
      quantity: safeNumber(trade.quantity, 0),
      averageBuyPrice: safeNumber(trade.entryPrice, 0),
      averageSellPrice: safeNumber(trade.exitPrice || trade.averageSellPrice, 0),
      proceeds: safeNumber(trade.proceeds || trade.grossProceeds, 0),
      realizedPnl: safeNumber(trade.realizedPnl, 0),
      realizedPnlPct: safeNumber(trade.returnPct || trade.realizedPnlPct, 0),
      exitReason: decision.blockReasons && decision.blockReasons.length
        ? decision.blockReasons.join("; ")
        : (trade.exitReason || "Trade closed during paper simulation"),
      plainEnglishExitReason: trade.exitReason || "Position closed during normal paper cycle."
    });
  });

  const learningModeEnabled = risk.aggressiveLearningMode || false;
  const learningProfile = risk.learningProfile || null;

  return {
    cycleId: cycle.cycleId || "cycle_not_built",
    cycleStartedAt: cycle.cycleStartTimestamp || null,
    startingPaperBalance,
    currentCashBalance: round(currentCashBalance),
    currentHoldingsValue: round(holdingsValue),
    currentTotalAccountValue,
    openPositionCount: openPositions.length,
    maxOpenPositions: risk.thresholds ? risk.thresholds.maxOpenPositions : risk.maxOpenPositions,
    learningModeEnabled,
    learningProfile,
    buys,
    sells,
    openHoldings,
    paperOnly: true,
    liveTradingEnabled: false,
    externalEffects: false,
    publishAllowed: false,
    canRenderEmpty: buys.length === 0 && sells.length === 0 && openHoldings.length === 0
  };
}

function buildCycleDecisionBoard({ signals, risk, positions, cycle, generatedAt }) {
  const riskDecisionsBySymbol = {};
  (risk.decisions || []).forEach((d) => {
    riskDecisionsBySymbol[d.symbol] = d;
  });

  const openSymbols = new Set(
    (positions.openPositions || []).map((p) => p.symbol)
  );

  const bought = [];
  const watched = [];
  const capacityBlocked = [];
  const rejected = [];

  (signals.signals || []).forEach((signal) => {
    const decision = riskDecisionsBySymbol[signal.symbol] || {};
    const isApproved = decision.approved === true;
    const isCapacityBlocked = decision.approvalBand === "watched_capacity_blocked";
    const isOpen = openSymbols.has(signal.symbol);
    const isCandidate = signal.status === "candidate" || signal.status === "learning_candidate";

    const item = {
      symbol: signal.symbol,
      companyName: null,
      decision: isApproved ? "approved" : (isCapacityBlocked ? "capacity_blocked" : "blocked"),
      timestamp: decision.generatedAt || signal.generatedAt || generatedAt,
      technicalReason: signal.trigger || "No trigger recorded",
      plainEnglishReason: "",
      riskDeskReason: null,
      confidence: safeNumber(signal.confidence, 0),
      normalizedConfidence: signal.normalizedConfidence != null ? safeNumber(signal.normalizedConfidence, 0) : null,
      learningCandidateScore: signal.learningCandidateScore != null ? safeNumber(signal.learningCandidateScore, 0) : null,
      nearCandidate: signal.nearCandidate || false,
      entryRiskBand: decision.entryRiskBand || null,
      currentRiskBand: decision.currentRiskBand || null,
      riskBandSource: decision.riskBandSource || null,
      riskBandStale: decision.riskBandStale || false,
      approvalBand: decision.approvalBand || null
    };

    if (isApproved && isOpen) {
      item.decision = "bought";
      item.plainEnglishReason = `Risk Desk approved and paper execution opened ${signal.symbol}.`;
      item.riskDeskReason = null;
      bought.push(item);
    } else if (isApproved && !isOpen) {
      item.decision = "watched";
      item.plainEnglishReason = `Signal met criteria but no paper position was opened.`;
      item.riskDeskReason = null;
      watched.push(item);
    } else if (isCapacityBlocked) {
      item.decision = "capacity_blocked";
      item.plainEnglishReason = decision.blockReasons && decision.blockReasons.length
        ? decision.blockReasons.join("; ")
        : `Capacity reached — ${signal.symbol} held for watch.`;
      item.riskDeskReason = (decision.blockReasons || []).join("; ");
      capacityBlocked.push(item);
    } else if (isCandidate && !isApproved) {
      item.decision = "rejected";
      item.plainEnglishReason = decision.blockReasons && decision.blockReasons.length
        ? decision.blockReasons.join("; ")
        : "Risk Desk blocked this candidate.";
      item.riskDeskReason = (decision.blockReasons || []).join("; ");
      rejected.push(item);
    } else {
      item.decision = "ignored";
      item.plainEnglishReason = signal.status === "ignore" || signal.status === "no_data"
        ? `Signal did not meet movement threshold (${signal.sampleChangePct}%).`
        : "Signal reviewed but not acted upon.";
      item.riskDeskReason = null;
      watched.push(item);
    }
  });

  return {
    sections: {
      bought: {
        label: "Bought",
        description: "Signals approved by Risk Desk that resulted in open paper positions",
        count: bought.length,
        items: bought
      },
      watched: {
        label: "Watched",
        description: "Signals reviewed but not acted upon (below threshold, no position opened)",
        count: watched.length,
        items: watched
      },
      capacity_blocked: {
        label: "Capacity Blocked",
        description: "Usable candidates blocked only by position capacity limits (aggressive learning mode)",
        count: capacityBlocked.length,
        items: capacityBlocked
      },
      rejected: {
        label: "Rejected",
        description: "Candidates blocked by Risk Desk",
        count: rejected.length,
        items: rejected
      }
    },
    totalDecisions: (signals.signals || []).length,
    paperOnly: true
  };
}

function buildDashboardData() {
  const generatedAt = isoNow();
  const config = loadConfig();

  const cycle = safeLoad(paths.cycleLatestJson, {});
  const positions = safeLoad(paths.paperPositionsJson, { openPositions: [], closedPositions: [] });
  const performance = safeLoad(paths.paperPerformanceJson, {});
  const trades = safeLoad(paths.tradesJson, {});
  const signals = safeLoad(paths.signalsJson, { signals: [] });
  const risk = safeLoad(paths.riskJson, { decisions: [] });
  const runHistory = safeLoad(paths.runHistoryJson, { runs: [] });

  const equityCurve = buildEquityCurve({ cycle, positions, performance, runHistory, trades, generatedAt });
  const currentCycleActivity = buildCurrentCycleActivity({ cycle, positions, performance, trades, signals, risk, generatedAt });
  const cycleDecisionBoard = buildCycleDecisionBoard({ signals, risk, positions, cycle, generatedAt });

  const marketDataSource = signals.dataSource || "deterministic_sample";
  const marketDataGeneratedAt = signals.latestMarketDataRefreshAt || null;
  const latestBarTimestamp = signals.latestBarTimestamp || null;

  const dataFreshness = {
    generatedAt,
    marketDataRefreshAt: marketDataGeneratedAt,
    latestBarTimestamp,
    marketDataSource,
    cycleBuildAt: cycle.lastRunAppliedAt || null,
    cycleStatus: cycle.status || "missing",
    runCount: Array.isArray(runHistory.runs) ? runHistory.runs.length : 0,
    openPositionCount: (positions.openPositions || []).length,
    dataSource: marketDataSource
  };

  return {
    equityCurve,
    currentCycleActivity,
    cycleDecisionBoard,
    paperSimulation: true,
    generatedAt,
    dataFreshness,
    disclaimers: [
      "Paper simulation only. All values are fake paper money.",
      "Not financial advice. No real trading or investment decisions.",
      "No broker connection, live trading, or real-money execution.",
      "Market data from Alpaca IEX used for paper simulation context.",
      "Past paper performance does not guarantee future results."
    ]
  };
}

module.exports = { buildDashboardData, buildEquityCurve, buildCurrentCycleActivity, buildCycleDecisionBoard };
