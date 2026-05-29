const { round } = require("../utils/number");
const { loadJson } = require("../utils/fileStore");
const path = require("path");

function loadLearningConfig() {
  try {
    const configPath = path.join(__dirname, "..", "..", "config", "marketops.phase1.config.json");
    const config = loadJson(configPath);
    if (config.learningMode && config.learningMode.enabled) {
      return config.learningMode;
    }
  } catch {}
  return null;
}

const learningConfig = loadLearningConfig();

const THRESHOLD_STANDARD_APPROVAL = learningConfig
  ? learningConfig.riskThresholds.standardApprovalMin
  : 0.63;
const THRESHOLD_LEARNING_PROBE = learningConfig
  ? learningConfig.riskThresholds.learningProbeMin
  : 0.57;
const THRESHOLD_WATCHED = learningConfig
  ? learningConfig.riskThresholds.watchMin
  : 0.50;
const THRESHOLD_REJECT_BELOW = learningConfig
  ? learningConfig.riskThresholds.hardRejectBelow
  : 0.55;
const LEARNING_PROBE_SIZE_PCT = learningConfig
  ? learningConfig.sizing.learningProbePositionSizeMultiplier
  : 0.35;
const MAX_LEARNING_PROBES_PER_DAY = learningConfig
  ? learningConfig.sizing.maxLearningProbesPerDay
  : 10;
const MAX_STANDARD_TRADES_PER_DAY = learningConfig
  ? learningConfig.sizing.maxStandardTradesPerDay
  : 10;
const MAX_TOTAL_TRADES_PER_DAY = learningConfig
  ? learningConfig.sizing.maxTotalTradesPerDay
  : 20;
const LEARNING_MODE_MAX_OPEN_POSITIONS = learningConfig
  ? (learningConfig.maxOpenPositions || 20)
  : null;

const HARD_SAFETY_FAILURES = [
  "missing ticker",
  "missing price",
  "impossible quantity",
  "invalid signal",
  "blocked asset class",
  "duplicate malformed trade",
  "stale unsafe data",
  "live execution attempted",
  "secret exposure risk",
  "bad account state"
];

function checkHardSafetyFailures(signal) {
  const failures = [];
  if (!signal || !signal.symbol) failures.push("missing ticker");
  if (signal.confidence === undefined || signal.confidence === null) failures.push("missing confidence");
  if (signal.assetType && ["CRYPTO", "OPTION", "FUTURE", "FOREX"].includes(signal.assetType.toUpperCase())) {
    failures.push("blocked asset class");
  }
  if (signal.side && !["long", "short"].includes(signal.side)) {
    failures.push("invalid signal");
  }
  if (signal.quantity !== undefined && (signal.quantity <= 0 || !Number.isFinite(signal.quantity))) {
    failures.push("impossible quantity");
  }
  return failures;
}

function validateTradePlan(signal) {
  const missing = [];

  if (!signal.entryPlan) {
    missing.push("entryPlan");
  } else {
    const ep = signal.entryPlan;
    if (!ep.referencePrice) missing.push("entryPlan.referencePrice");
    if (!ep.entryReason) missing.push("entryPlan.entryReason");
    if (!ep.entryTrigger) missing.push("entryPlan.entryTrigger");
    if (!ep.entryValidUntil) missing.push("entryPlan.entryValidUntil");
    if (ep.maxEntrySlippagePct === undefined || ep.maxEntrySlippagePct === null) missing.push("entryPlan.maxEntrySlippagePct");
  }

  if (!signal.exitPlan) {
    missing.push("exitPlan");
  } else {
    const xp = signal.exitPlan;
    if (xp.profitTargetPct === undefined || xp.profitTargetPct === null) missing.push("exitPlan.profitTargetPct");
    if (xp.stopLossPct === undefined || xp.stopLossPct === null) missing.push("exitPlan.stopLossPct");
    if (!xp.maxHoldUntil && !xp.maxHoldDays) missing.push("exitPlan.maxHoldUntil or exitPlan.maxHoldDays");
    if (!xp.invalidationRules) missing.push("exitPlan.invalidationRules");
  }

  if (!signal.riskPlan) {
    missing.push("riskPlan");
  } else {
    const rp = signal.riskPlan;
    if (rp.maxPositionPct === undefined || rp.maxPositionPct === null) missing.push("riskPlan.maxPositionPct");
    if (rp.paperOnly !== true) missing.push("riskPlan.paperOnly");
  }

  return missing;
}

function buildLearningProbeMetadata(decision, signal) {
  const confidence = signal.confidence || 0;
  const isProbe = decision === "approved_learning_probe";
  return {
    isLearningProbe: isProbe,
    hypothesis: isProbe ? `Learning probe: testing ${signal.symbol} at confidence ${confidence.toFixed(2)}` : null,
    entryReason: signal.entryPlan ? signal.entryPlan.entryReason : null,
    riskConcerns: isProbe ? `Confidence ${confidence.toFixed(2)} below standard threshold ${THRESHOLD_STANDARD_APPROVAL}. Learning probe sized at ${LEARNING_PROBE_SIZE_PCT}x.` : null,
    expectedOutcome: isProbe ? "pending" : null,
    lesson: isProbe ? "Learning probe - pending outcome evaluation" : null
  };
}

function reviewSignals({ signals, generatedAt, portfolioState = {} }) {
  const openPositions = portfolioState.openPositions || [];
  const cashBalance = portfolioState.cashBalance || 1000;
  const baseMaxOpenPositions = portfolioState.maxOpenPositions || 10;
  const effectiveMaxOpenPositions = (learningConfig && learningConfig.enabled && LEARNING_MODE_MAX_OPEN_POSITIONS)
    ? Math.max(LEARNING_MODE_MAX_OPEN_POSITIONS, baseMaxOpenPositions)
    : baseMaxOpenPositions;
  const maxOpenPositions = effectiveMaxOpenPositions;
  const maxPositionSizePct = portfolioState.maxPositionSizePct || 0.25;

  let dailyLearningProbeCount = 0;
  let dailyStandardCount = 0;

  const decisions = signals.map((signal) => {
    const blockReasons = [];
    let approvalBand = "rejected";
    let positionSizeMultiplier = 0;

    const safetyFailures = checkHardSafetyFailures(signal);
    if (safetyFailures.length > 0) {
      safetyFailures.forEach((f) => blockReasons.push(`Hard safety failure: ${f}`));
    }

    const acceptedCandidateStatuses = (learningConfig && learningConfig.enabled)
      ? ["candidate", "learning_candidate"]
      : ["candidate"];
    if (!acceptedCandidateStatuses.includes(signal.status)) {
      blockReasons.push("Signal did not qualify as a candidate.");
    }

    if (signal.directionBias !== "up") {
      blockReasons.push("Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled.");
    }

    if (blockReasons.length === 0 && signal.status === "candidate" && signal.directionBias === "up") {
      const missingPlanFields = validateTradePlan(signal);
      if (missingPlanFields.length > 0) {
        blockReasons.push(`incomplete_trade_plan: missing ${missingPlanFields.join(", ")}`);
      }
    }

    if (!signal.trigger || signal.trigger === "No actionable move.") {
      blockReasons.push("Missing actionable trigger.");
    }

    if (!signal.invalidation || signal.invalidation === "N/A") {
      blockReasons.push("Missing invalidation.");
    }

    if (signal.side && signal.side !== "long") {
      blockReasons.push("Phase 1 only allows long positions. Shorting is disabled.");
    }

    const alreadyOpen = openPositions.some((p) => p.symbol === signal.symbol);
    if (alreadyOpen) {
      blockReasons.push(`Position already open for ${signal.symbol}.`);
    }

    if (openPositions.length >= maxOpenPositions) {
      blockReasons.push(`Max open positions (${maxOpenPositions}) reached.`);
    }

    if (blockReasons.length === 0) {
      const rawConfidence = signal.confidence || 0;
      const confidence = (learningConfig && learningConfig.enabled && signal.normalizedConfidence != null)
        ? Math.max(rawConfidence, signal.normalizedConfidence)
        : rawConfidence;

      if (confidence >= THRESHOLD_STANDARD_APPROVAL) {
        approvalBand = "approved_standard";
        positionSizeMultiplier = 1.0;
      } else if (confidence >= THRESHOLD_LEARNING_PROBE) {
        approvalBand = "approved_learning_probe";
        positionSizeMultiplier = LEARNING_PROBE_SIZE_PCT;
      } else if (confidence >= THRESHOLD_WATCHED) {
        approvalBand = "watched";
        positionSizeMultiplier = 0;
      } else {
        blockReasons.push(`Confidence ${rawConfidence} (normalized: ${confidence.toFixed(4)}) is below minimum ${THRESHOLD_REJECT_BELOW} for paper approval.`);
      }
    }

    const vehicleHistory = signal.signalEvidence && signal.signalEvidence.vehicleHistorySummary;
    if (vehicleHistory && vehicleHistory.insufficientData && approvalBand === "approved_standard") {
      if (signal.confidence < THRESHOLD_STANDARD_APPROVAL + 0.05) {
        approvalBand = "approved_learning_probe";
        positionSizeMultiplier = LEARNING_PROBE_SIZE_PCT;
      }
    }

    if (vehicleHistory && vehicleHistory.volatilityEstimate !== null && vehicleHistory.volatilityEstimate > 5) {
      if (approvalBand === "approved_standard") {
        approvalBand = "approved_learning_probe";
        positionSizeMultiplier = LEARNING_PROBE_SIZE_PCT * 0.7;
      } else if (approvalBand === "approved_learning_probe") {
        positionSizeMultiplier = LEARNING_PROBE_SIZE_PCT * 0.5;
      }
    }

    const isCapacityBlocked = learningConfig && learningConfig.enabled
      && blockReasons.length === 1
      && blockReasons[0].startsWith("Max open positions")
      && acceptedCandidateStatuses.includes(signal.status)
      && signal.directionBias === "up"
      && approvalBand === "rejected";
    if (isCapacityBlocked) {
      const capConfidence = (learningConfig && learningConfig.enabled && signal.normalizedConfidence != null)
        ? Math.max(signal.confidence || 0, signal.normalizedConfidence)
        : (signal.confidence || 0);
      if (capConfidence >= THRESHOLD_WATCHED) {
        approvalBand = "watched_capacity_blocked";
        positionSizeMultiplier = 0;
        blockReasons.length = 0;
        blockReasons.push(`Capacity blocked: ${openPositions.length} of ${maxOpenPositions} positions filled. ${signal.symbol} held as watched.`);
      } else {
        blockReasons.push(`Capacity blocked with low confidence (${capConfidence.toFixed(4)}), not retained for watch.`);
      }
    }

    const approved = approvalBand.startsWith("approved") && approvalBand !== "watched_capacity_blocked";

    const normalPositionValue = cashBalance * maxPositionSizePct;
    const intendedPositionValue = approved ? round(normalPositionValue * positionSizeMultiplier) : 0;

    const learningMetadata = buildLearningProbeMetadata(approvalBand, signal);

    const riskBandSource = learningConfig && learningConfig.enabled ? "aggressive_paper_learning" : "phase1_default";
    const entryRiskBand = approved ? approvalBand : null;
    const currentRiskBand = approvalBand;
    const riskBandStale = !approved && signal.status === "candidate" && blockReasons.length > 0
      && !blockReasons.some(r => r.startsWith("Hard safety failure"));

    const decisionRecord = {
      riskDecisionId: `risk-${signal.signalId || signal.symbol}`,
      signalId: signal.signalId || `sample-signal-${signal.symbol}`,
      candidateId: signal.candidateId || null,
      symbol: signal.symbol,
      assetType: signal.assetType,
      directionBias: signal.directionBias,
      side: "long",
      sampleChangePct: signal.sampleChangePct,
      confidence: signal.confidence,
      normalizedConfidence: signal.normalizedConfidence != null ? signal.normalizedConfidence : null,
      learningCandidateScore: signal.learningCandidateScore != null ? signal.learningCandidateScore : null,
      nearCandidate: signal.nearCandidate || false,
      originalRiskLevel: signal.riskLevel,
      entryRiskBand,
      currentRiskBand,
      riskBandSource,
      riskBandStale,
      approved,
      approvalBand,
      positionSizeMultiplier: round(positionSizeMultiplier),
      intendedPositionValue,
      mode: "paper_simulation",
      paperOnly: true,
      finalRiskLevel: approved ? classifyFinalRisk(signal) : "blocked",
      blockReasons,
      entryPlan: approved || approvalBand === "watched_capacity_blocked" ? signal.entryPlan : null,
      exitPlan: approved || approvalBand === "watched_capacity_blocked" ? signal.exitPlan : null,
      riskPlan: approved || approvalBand === "watched_capacity_blocked" ? signal.riskPlan : null,
      notes: approved
        ? `Risk Desk approved (${approvalBand}) for fake paper execution only. Position size multiplier: ${round(positionSizeMultiplier)}.`
        : approvalBand === "watched_capacity_blocked"
          ? `Risk Desk watched (capacity blocked) for ${signal.symbol}. No trade opened.`
          : `Risk Desk blocked this signal for Phase 1 paper simulation.`,
      vehicleHistorySummary: vehicleHistory || null,
      learningMetadata: learningMetadata || null,
      signalReason: signal.trigger || signal.entryPlan ? (signal.entryPlan ? signal.entryPlan.entryReason : null) : null
    };

    if (approvalBand === "approved_learning_probe") dailyLearningProbeCount++;
    if (approvalBand === "approved_standard") dailyStandardCount++;

    return decisionRecord;
  });

  const approvedStandard = decisions.filter((d) => d.approvalBand === "approved_standard").length;
  const approvedProbe = decisions.filter((d) => d.approvalBand === "approved_learning_probe").length;
  const watchedCount = decisions.filter((d) => d.approvalBand === "watched").length;
  const watchedCapacityBlockedCount = decisions.filter((d) => d.approvalBand === "watched_capacity_blocked").length;
  const rejectedCount = decisions.filter((d) => d.approvalBand === "rejected").length;
  const incompletePlanCount = decisions.filter((d) => d.blockReasons.some((r) => r.startsWith("incomplete_trade_plan"))).length;
  const phaseRuleBlockCount = decisions.filter((d) => d.blockReasons.some((r) => r.includes("Phase 1 only allows"))).length;
  const insufficientHistoryCount = decisions.filter((d) => d.vehicleHistorySummary && d.vehicleHistorySummary.insufficientData).length;
  const hardSafetyFailCount = decisions.filter((d) => d.blockReasons.some((r) => r.startsWith("Hard safety failure"))).length;

  const allConfidences = decisions.map((d) => d.confidence).filter((c) => c !== null && c !== undefined);
  const avgConfidence = allConfidences.length > 0 ? round(allConfidences.reduce((s, c) => s + c, 0) / allConfidences.length, 4) : 0;

  const reasonDistribution = {};
  decisions.forEach((d) => {
    if (d.blockReasons.length > 0) {
      d.blockReasons.forEach((r) => {
        const key = String(r).replace(/\d+\.\d+/g, "threshold");
        reasonDistribution[key] = (reasonDistribution[key] || 0) + 1;
      });
    } else {
      const key = `approved:${d.approvalBand}`;
      reasonDistribution[key] = (reasonDistribution[key] || 0) + 1;
    }
  });

  return {
    generatedAt,
    mode: "paper_simulation",
    paperOnly: true,
    aggressiveLearningMode: learningConfig ? learningConfig.enabled : false,
    learningProfile: learningConfig ? learningConfig.profile : null,
    totalSignals: decisions.length,
    approvedCount: decisions.filter((item) => item.approved).length,
    blockedCount: decisions.filter((item) => !item.approved).length,
    approvalBands: {
      approved_standard: approvedStandard,
      approved_learning_probe: approvedProbe,
      watched: watchedCount,
      watched_capacity_blocked: watchedCapacityBlockedCount,
      rejected: rejectedCount
    },
    pipelineCounts: {
      signalsReviewed: decisions.length,
      approvedStandard,
      approvedLearningProbe: approvedProbe,
      watched: watchedCount,
      watchedCapacityBlocked: watchedCapacityBlockedCount,
      rejected: rejectedCount,
      hardSafetyFailures: hardSafetyFailCount,
      dailyLearningProbeCount,
      dailyStandardCount
    },
    thresholds: {
      standardApproval: THRESHOLD_STANDARD_APPROVAL,
      learningProbe: THRESHOLD_LEARNING_PROBE,
      watched: THRESHOLD_WATCHED,
      rejectBelow: THRESHOLD_REJECT_BELOW,
      learningProbeSizePct: LEARNING_PROBE_SIZE_PCT,
      maxLearningProbesPerDay: MAX_LEARNING_PROBES_PER_DAY,
      maxStandardTradesPerDay: MAX_STANDARD_TRADES_PER_DAY,
      maxTotalTradesPerDay: MAX_TOTAL_TRADES_PER_DAY,
      maxOpenPositions,
      source: learningConfig ? "aggressive_paper_learning_config" : "default_hardcoded"
    },
    reporting: {
      incomplete_trade_plan: incompletePlanCount,
      phase_rule_block: phaseRuleBlockCount,
      insufficient_history: insufficientHistoryCount,
      hard_safety_failures: hardSafetyFailCount,
      averageCandidateConfidence: avgConfidence,
      reasonDistribution
    },
    decisions
  };
}

function classifyFinalRisk(signal) {
  if (signal.riskLevel === "high") return "high";
  if (signal.riskLevel === "medium") return "medium";
  return "low";
}

module.exports = {
  reviewSignals,
  THRESHOLD_STANDARD_APPROVAL,
  THRESHOLD_LEARNING_PROBE,
  THRESHOLD_WATCHED,
  THRESHOLD_REJECT_BELOW,
  LEARNING_PROBE_SIZE_PCT
};