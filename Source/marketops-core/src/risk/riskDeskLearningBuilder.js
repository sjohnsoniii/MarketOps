const path = require("path");
const { fileExists, loadJson } = require("../utils/fileStore");
const { round } = require("../utils/number");
const { paths } = require("../utils/paths");

function safeLoad(filePath, fallback) {
  try {
    if (fileExists(filePath)) return loadJson(filePath);
  } catch (e) {}
  return fallback;
}

function safeNumber(value, fallback) {
  const n = Number(value);
  return isFinite(n) ? n : (fallback !== undefined ? fallback : 0);
}

function isoNow() {
  return new Date().toISOString();
}

function buildMarketDataMap(marketData) {
  const map = {};
  const latestBySymbol = {};
  for (const bar of (marketData.bars || [])) {
    const sym = bar.symbol;
    if (!latestBySymbol[sym] || bar.timestamp > latestBySymbol[sym].timestamp) {
      latestBySymbol[sym] = bar;
    }
  }
  for (const sym of Object.keys(latestBySymbol)) {
    map[sym] = { latestClose: latestBySymbol[sym].close, timestamp: latestBySymbol[sym].timestamp };
  }
  return map;
}

function buildApprovedTrades({ decisions, positions, signalsMap, marketDataMap }) {
  const approved = (decisions || []).filter(d => d.approved === true);
  if (!approved.length) return [];

  const openPositions = positions.openPositions || [];
  const closedPositions = positions.closedPositions || [];

  return approved.map(decision => {
    const signal = signalsMap[decision.signalId] || {};
    const position = openPositions.find(
      p => p.signalId === decision.signalId || p.riskDecisionId === decision.riskDecisionId
    );
    const closedPosition = closedPositions.find(
      p => p.signalId === decision.signalId || p.riskDecisionId === decision.riskDecisionId
    );

    let outcomeLabel = "inconclusive";
    let plainEnglishOutcome = "Approved but no matching position data yet. Trade may not have been executed.";
    let currentPrice = null;
    let currentValue = null;
    let unrealizedPnl = null;
    let unrealizedPnlPct = null;
    let entryPrice = null;
    let quantity = null;
    let positionSize = null;

    if (closedPosition) {
      entryPrice = safeNumber(closedPosition.entryPrice, null);
      quantity = safeNumber(closedPosition.quantity, null);
      positionSize = safeNumber(closedPosition.positionValue || closedPosition.entryPrice * closedPosition.quantity, null);
      currentPrice = safeNumber(closedPosition.exitPrice || closedPosition.currentPrice, null);
      currentValue = safeNumber(closedPosition.exitValue || closedPosition.currentValue, null);
      const realizedPnl = safeNumber(closedPosition.realizedPnl || closedPosition.pnl, null);
      const realizedPnlPct = safeNumber(closedPosition.realizedPnlPct, null);
      if (realizedPnl !== null && realizedPnl !== 0) {
        if (realizedPnl > 0) {
          outcomeLabel = "good_approval";
          plainEnglishOutcome = `Risk Desk approved this trade. Closed with +$${round(realizedPnl)} gain (${round(realizedPnlPct)}%).`;
        } else {
          outcomeLabel = "bad_approval";
          plainEnglishOutcome = `Risk Desk approved this trade but it closed at -$${round(Math.abs(realizedPnl))} loss (${round(Math.abs(realizedPnlPct))}%). Needs review.`;
        }
      }
      unrealizedPnl = realizedPnl;
      unrealizedPnlPct = realizedPnlPct;
    } else if (position) {
      entryPrice = safeNumber(position.entryPrice, null);
      quantity = safeNumber(position.quantity, null);
      positionSize = safeNumber(position.positionValue, null);
      currentPrice = safeNumber(position.latestPrice || (position.currentValue / position.quantity), null);
      currentValue = safeNumber(position.currentValue, null);
      unrealizedPnl = safeNumber(position.unrealizedPnl, null);
      unrealizedPnlPct = safeNumber(position.unrealizedPnlPct, null);

      if (unrealizedPnlPct !== null && unrealizedPnlPct > 0) {
        outcomeLabel = "good_approval";
        plainEnglishOutcome = `Risk Desk approved this trade. Position is up ${round(unrealizedPnlPct)}% (+$${round(unrealizedPnl)}).`;
      } else if (unrealizedPnlPct !== null && unrealizedPnlPct < 0) {
        if (unrealizedPnlPct < -3) {
          outcomeLabel = "bad_approval";
          plainEnglishOutcome = `Risk Desk approved this trade but it is down ${round(Math.abs(unrealizedPnlPct))}% (-$${round(Math.abs(unrealizedPnl))}). Needs review.`;
        } else {
          outcomeLabel = "too_early";
          plainEnglishOutcome = `Risk Desk approved this trade. Slightly down ${round(Math.abs(unrealizedPnlPct))}% (-$${round(Math.abs(unrealizedPnl))}). May still recover.`;
        }
      } else {
        outcomeLabel = "inconclusive";
        plainEnglishOutcome = "Risk Desk approved this trade. Position is currently flat.";
      }
    }

    return {
      symbol: decision.symbol,
      companyName: signal.companyName || null,
      approvedAt: decision.generatedAt || decision.timestamp || null,
      entryPrice,
      quantity,
      positionSize,
      riskReason: decision.notes || "Approved by Risk Desk.",
      signalReason: signal.trigger || "No trigger recorded.",
      confidence: safeNumber(signal.confidence !== undefined ? signal.confidence : decision.confidence),
      currentPrice,
      currentValue,
      unrealizedPnl,
      unrealizedPnlPct,
      maxFavorableMove: null,
      maxAdverseMove: null,
      outcomeLabel,
      plainEnglishOutcome
    };
  });
}

function buildRejectedTrades({ decisions, signalsMap, marketDataMap }) {
  const rejected = (decisions || []).filter(d => d.approved !== true);
  if (!rejected.length) return [];

  return rejected.map(decision => {
    const signal = signalsMap[decision.signalId] || {};
    const marketInfo = marketDataMap[decision.symbol] || {};
    const latestClose = safeNumber(signal.latestClose, null);
    const currentMarketClose = safeNumber(marketInfo.latestClose, null);

    let shadowPnl = null;
    let shadowPnlPct = null;
    let outcomeLabel = "inconclusive";
    let plainEnglishOutcome = "Rejected by Risk Desk. Not enough data yet to determine outcome.";

    if (latestClose !== null && currentMarketClose !== null) {
      shadowPnlPct = round((currentMarketClose - latestClose) / latestClose * 100);
      shadowPnl = round(currentMarketClose - latestClose);

      if (shadowPnlPct > 0) {
        if (shadowPnlPct > 1) {
          outcomeLabel = "bad_rejection_missed_winner";
          plainEnglishOutcome = `Risk Desk rejected this trade. Price has since risen ${round(shadowPnlPct)}% (+$${round(shadowPnl)} per share). Possible missed winner.`;
        } else {
          outcomeLabel = "inconclusive";
          plainEnglishOutcome = `Risk Desk rejected this trade. Price has edged up ${round(shadowPnlPct)}% (+$${round(shadowPnl)} per share). Movement is minor.`;
        }
      } else if (shadowPnlPct < 0) {
        outcomeLabel = "good_rejection";
        plainEnglishOutcome = `Risk Desk rejected this trade. Price has since declined ${round(Math.abs(shadowPnlPct))}% (-$${round(Math.abs(shadowPnl))} per share). Avoided a losing trade.`;
      } else {
        outcomeLabel = "inconclusive";
        plainEnglishOutcome = "Risk Desk rejected this trade. Price is essentially unchanged since rejection.";
      }
    } else {
      plainEnglishOutcome = "Rejected by Risk Desk. Market data insufficient for shadow price calculation.";
    }

    return {
      symbol: decision.symbol,
      companyName: signal.companyName || null,
      rejectedAt: decision.generatedAt || decision.timestamp || null,
      hypotheticalEntryPrice: latestClose,
      riskDeskReason: (decision.blockReasons || []).join("; ") || decision.notes || "Blocked by Risk Desk rules.",
      signalReason: signal.trigger || "No trigger recorded.",
      confidence: safeNumber(signal.confidence !== undefined ? signal.confidence : decision.confidence),
      shadowCurrentPrice: currentMarketClose,
      shadowPnl,
      shadowPnlPct,
      maxFavorableMove: null,
      maxAdverseMove: null,
      outcomeLabel,
      plainEnglishOutcome
    };
  });
}

function buildWatchedSignals({ decisions, signals, dashboardData }) {
  const watchedItems = [];
  const allDecisionSignalIds = new Set((decisions || []).map(d => d.signalId));
  const approvedSymbols = new Set((decisions || []).filter(d => d.approved).map(d => d.symbol));

  const boardSections = dashboardData && dashboardData.cycleDecisionBoard && dashboardData.cycleDecisionBoard.sections;
  const watchedBoard = boardSections && boardSections.watched;
  const watchedItemsFromBoard = (watchedBoard && watchedBoard.items) || [];

  for (const item of watchedItemsFromBoard) {
    const signal = (signals.signals || []).find(s => s.symbol === item.symbol);
    watchedItems.push({
      symbol: item.symbol,
      companyName: item.companyName || null,
      watchedAt: item.timestamp || null,
      reasonWatched: item.plainEnglishReason || item.technicalReason || "Placed on watchlist for review.",
      signalReason: signal ? (signal.trigger || "No trigger recorded.") : (item.technicalReason || "Observed movement."),
      confidence: safeNumber(item.confidence !== undefined ? item.confidence : (signal ? signal.confidence : null)),
      laterMovement: null,
      outcomeLabel: "inconclusive",
      plainEnglishOutcome: "Watched signal. Outcome not yet determined."
    });
  }

  const signalsWithoutDecisions = (signals.signals || []).filter(
    s => s.status === "candidate" && !allDecisionSignalIds.has(s.signalId) && !approvedSymbols.has(s.symbol)
  );
  for (const signal of signalsWithoutDecisions) {
    if (!watchedItems.some(w => w.symbol === signal.symbol)) {
      watchedItems.push({
        symbol: signal.symbol,
        companyName: signal.companyName || null,
        watchedAt: null,
        reasonWatched: "Signal appeared but did not reach Risk Desk review.",
        signalReason: signal.trigger || "No trigger recorded.",
        confidence: safeNumber(signal.confidence),
        laterMovement: null,
        outcomeLabel: "inconclusive",
        plainEnglishOutcome: "Signal was observed but never formally reviewed by Risk Desk."
      });
    }
  }

  return watchedItems;
}

function buildShadowTrades({ rejected, signalsMap, marketDataMap, decisions }) {
  if (!rejected.length) return [];
  return rejected.map(rejectedTrade => {
    const decision = (decisions || []).find(d => d.signalId === rejectedTrade.symbol || d.symbol === rejectedTrade.symbol) || {};
    const signal = signalsMap[decision.signalId || rejectedTrade.symbol] || {};
    const marketInfo = marketDataMap[rejectedTrade.symbol] || {};

    const hypotheticalEntry = safeNumber(rejectedTrade.hypotheticalEntryPrice || signal.latestClose, null);
    const currentPrice = safeNumber(rejectedTrade.shadowCurrentPrice || marketInfo.latestClose, null);

    let shadowPnlPct = null;
    let plainEnglishOutcome = "Shadow trade not yet computed.";

    if (hypotheticalEntry !== null && currentPrice !== null) {
      shadowPnlPct = round((currentPrice - hypotheticalEntry) / hypotheticalEntry * 100);
      if (shadowPnlPct > 0) {
        plainEnglishOutcome = `Shadow would be up ${round(shadowPnlPct)}%. Rejected by Risk Desk; may have missed a gain.`;
      } else if (shadowPnlPct < 0) {
        plainEnglishOutcome = `Shadow would be down ${round(Math.abs(shadowPnlPct))}%. Rejection avoided a loss.`;
      } else {
        plainEnglishOutcome = "Shadow trade would be flat.";
      }
    } else {
      plainEnglishOutcome = "Insufficient price data to compute shadow performance.";
    }

    return {
      symbol: rejectedTrade.symbol,
      companyName: rejectedTrade.companyName || null,
      originalDecisionId: decision.riskDecisionId || null,
      hypotheticalEntryPrice: hypotheticalEntry,
      estimatedQuantity: null,
      estimatedPositionSize: null,
      currentPrice,
      shadowPnl: rejectedTrade.shadowPnl !== null ? round(rejectedTrade.shadowPnl) : null,
      shadowPnlPct: shadowPnlPct,
      dataQuality: hypotheticalEntry !== null && currentPrice !== null ? "estimated_from_market_data" : "insufficient_data",
      outcomeLabel: rejectedTrade.outcomeLabel || "inconclusive",
      plainEnglishOutcome
    };
  });
}

function computeSummary({ approved, rejected, watched, shadow }) {
  const allOutcomes = [];

  for (const t of approved) {
    allOutcomes.push({ type: "approved", label: t.outcomeLabel, symbol: t.symbol });
  }
  for (const t of rejected) {
    allOutcomes.push({ type: "rejected", label: t.outcomeLabel, symbol: t.symbol });
  }
  for (const t of watched) {
    allOutcomes.push({ type: "watched", label: t.outcomeLabel, symbol: t.symbol });
  }

  const falsePositives = allOutcomes.filter(o => o.label === "bad_approval");
  const falseNegatives = allOutcomes.filter(o => o.label === "bad_rejection_missed_winner");
  const goodApprovals = allOutcomes.filter(o => o.label === "good_approval");
  const badApprovals = allOutcomes.filter(o => o.label === "bad_approval");
  const goodRejections = allOutcomes.filter(o => o.label === "good_rejection" || o.label === "avoided_loser");
  const badRejections = allOutcomes.filter(o => o.label === "bad_rejection_missed_winner");
  const inconclusive = allOutcomes.filter(o => o.label === "inconclusive");

  let bestDecision = "No clear best decision yet.";
  let worstDecision = "No clear worst decision yet.";

  if (goodApprovals.length > 0) {
    const best = goodApprovals[0];
    bestDecision = `Approved ${best.symbol}: Position performing well (good_approval).`;
  }
  if (badApprovals.length > 0) {
    const worst = badApprovals[0];
    worstDecision = `Approved ${worst.symbol}: Position underperforming (bad_approval). Needs review.`;
  }
  if (badRejections.length > 0) {
    const missed = badRejections[0];
    worstDecision = `Rejected ${missed.symbol}: Price moved higher after rejection (bad_rejection_missed_winner).`;
  }

  return {
    approvedCount: approved.length,
    rejectedCount: rejected.length,
    watchedCount: watched.length,
    shadowTrackedCount: shadow.length,
    possibleFalsePositiveCount: falsePositives.length,
    possibleFalseNegativeCount: falseNegatives.length,
    goodApprovalCount: goodApprovals.length,
    badApprovalCount: badApprovals.length,
    goodRejectionCount: goodRejections.length,
    badRejectionCount: badRejections.length,
    inconclusiveCount: inconclusive.length,
    bestDecision,
    worstDecision,
    learningNotes: `Risk Desk reviewed ${allOutcomes.length} total items. ${goodApprovals.length} good approvals, ${badApprovals.length} possible false positives, ${goodRejections.length} good rejections, ${badRejections.length} possible false negatives, ${inconclusive.length} inconclusive. Learning records built from Cruise 1 cycle data. Most outcomes are still early (positions held less than 1 week).`
  };
}

function buildRecommendations({ summary, approved, rejected }) {
  const recommendations = [];

  if (summary.badApprovalCount > 0) {
    recommendations.push({
      recommendationId: "rec-risk-001",
      entity: "Risk Desk",
      title: "Review approval criteria for underperforming positions",
      summary: `${summary.badApprovalCount} approved trade(s) are showing losses. Review whether confidence threshold or entry timing rules need adjustment.`,
      evidence: `${summary.badApprovalCount} position(s) with negative unrealized P&L after Risk Desk approval.`,
      expectedBenefit: "Reduce false positive approvals and improve trade quality.",
      riskLevel: "low",
      recommendedAction: "Review each underperforming position for common patterns (sector, timing, confidence).",
      requiresAdminReview: true,
      autoApply: false
    });
  }

  if (summary.badRejectionCount > 0) {
    recommendations.push({
      recommendationId: "rec-risk-002",
      entity: "Risk Desk",
      title: "Review rejection criteria that may have missed winners",
      summary: `${summary.badRejectionCount} rejected trade(s) have since moved favorably. Review if block rules were appropriate.`,
      evidence: `${summary.badRejectionCount} rejected signal(s) showing positive price movement since rejection.`,
      expectedBenefit: "Reduce false negatives while maintaining safety boundaries.",
      riskLevel: "low",
      recommendedAction: "Examine each rejected signal for common patterns in block reasons.",
      requiresAdminReview: true,
      autoApply: false
    });
  }

  recommendations.push({
    recommendationId: "rec-risk-003",
    entity: "Risk Desk",
    title: "Continue shadow tracking for comprehensive learning",
    summary: `${summary.shadowTrackedCount} shadow trades tracked for rejected signals. Continue monitoring to build historical performance baseline.`,
    evidence: `Shadow tracking enabled for ${summary.shadowTrackedCount} rejected trades. Price data sourced from Alpaca IEX.`,
    expectedBenefit: "Build historical dataset to calibrate risk thresholds over time.",
    riskLevel: "low",
    recommendedAction: "Run risk:learning each cycle to accumulate more shadow data.",
    requiresAdminReview: false,
    autoApply: false
  });

  return recommendations;
}

function buildProposals({ summary, recommendations }) {
  return [
    {
      proposalId: "prop-risk-001",
      entityId: "risk-desk",
      entityName: "Risk Desk",
      entityType: "risk",
      projectId: "marketops",
      proposalType: "observation_only",
      title: "Risk Desk learning record system is operational",
      summary: "Risk Desk learning records are now generated each cycle, tracking approved/rejected/watched outcomes and shadow trade estimates.",
      currentBehavior: "Risk Desk only generates decisions without learning from outcomes.",
      proposedChange: "No change yet. Learning records are observation-only in this cycle.",
      evidence: `${summary.approvedCount} approved, ${summary.rejectedCount} rejected, ${summary.watchedCount} watched, ${summary.shadowTrackedCount} shadow trades tracked.`,
      expectedBenefit: "Data foundation for future risk threshold calibration.",
      riskLevel: "none",
      safetyImpact: "none",
      affectedFilesOrConfig: "src/risk/riskDeskLearningBuilder.js, Data/paper/risk/risk-desk-learning-v0.1.json",
      recommendedAction: "Review learning records after 2-3 more cycles to identify patterns before adjusting rules.",
      status: "pending_future_review_queue",
      createdAt: isoNow(),
      autoApply: false
    },
    {
      proposalId: "prop-risk-002",
      entityId: "risk-desk",
      entityName: "Risk Desk",
      entityType: "risk",
      projectId: "marketops",
      proposalType: "threshold_adjustment",
      title: "Consider lowering confidence threshold for high-quality signals",
      summary: `If shadow tracking shows ${summary.badRejectionCount > 0 ? summary.badRejectionCount : "consistent"} missed winners with confidence near 0.55, consider adjusting the minimum confidence gate.`,
      currentBehavior: "Risk Desk blocks any signal with confidence below 0.55.",
      proposedChange: "Gather more data. No change applied this cycle.",
      evidence: `${summary.shadowTrackedCount} shadow trades being tracked for confidence threshold analysis.`,
      expectedBenefit: "Capture more valid opportunities without increasing risk exposure.",
      riskLevel: "low",
      safetyImpact: "none",
      affectedFilesOrConfig: "src/risk/riskDesk.js (confidence threshold)",
      recommendedAction: "Review after accumulating 50+ shadow trade records.",
      status: "pending_future_review_queue",
      createdAt: isoNow(),
      autoApply: false
    }
  ];
}

function buildRiskDeskLearning() {
  const generatedAt = isoNow();

  const cycle = safeLoad(paths.cycleLatestJson, {});
  const risk = safeLoad(paths.riskJson, { decisions: [] });
  const signals = safeLoad(paths.signalsJson, { signals: [] });
  const positions = safeLoad(paths.paperPositionsJson, { openPositions: [], closedPositions: [] });
  const trades = safeLoad(paths.tradesJson, {});
  const performance = safeLoad(paths.paperPerformanceJson, {});
  const marketData = safeLoad(paths.alpacaMarketDataLatestJson, { bars: [] });
  const dashboardBundle = safeLoad(path.join(paths.dataRoot, "dashboard", "dashboard-data-bundle-v0.1.json"), {});

  const signalsMap = {};
  for (const s of (signals.signals || [])) {
    signalsMap[s.signalId] = s;
  }

  const marketDataMap = buildMarketDataMap(marketData);

  const decisions = risk.decisions || [];

  const approved = buildApprovedTrades({ decisions, positions, signalsMap, marketDataMap });
  const rejected = buildRejectedTrades({ decisions, signalsMap, marketDataMap });
  const watched = buildWatchedSignals({ decisions, signals, dashboardData: dashboardBundle });
  const shadow = buildShadowTrades({ rejected, signalsMap, marketDataMap, decisions });

  const summary = computeSummary({ approved, rejected, watched, shadow });
  const recommendations = buildRecommendations({ summary, approved, rejected });
  const proposals = buildProposals({ summary, recommendations });

  return {
    generatedAt,
    paperSimulation: true,
    cycleId: cycle.cycleId || null,
    cycleStartedAt: cycle.cycleStartTimestamp || null,
    reviewWindow: {
      start: cycle.cycleStartTimestamp || generatedAt,
      end: generatedAt,
      cycleStatus: cycle.status || "unknown",
      cycleHoursElapsed: cycle.hoursSurvived || null
    },
    approvedTrades: approved,
    rejectedTrades: rejected,
    watchedSignals: watched,
    shadowTrades: shadow,
    summary,
    recommendations,
    proposals,
    safetyLabels: {
      paperOnly: true,
      noLiveExecution: true,
      noBrokerConnection: true,
      noAutoApply: true,
      requiresAdminReview: true,
      publishAllowed: false
    }
  };
}

module.exports = {
  buildRiskDeskLearning,
  buildApprovedTrades,
  buildRejectedTrades,
  buildWatchedSignals,
  buildShadowTrades,
  computeSummary,
  buildRecommendations,
  buildProposals
};
