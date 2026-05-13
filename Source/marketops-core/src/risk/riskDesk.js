function reviewSignals({ signals, generatedAt }) {
  const decisions = signals.map((signal) => {
    const blockReasons = [];

    if (signal.status !== "candidate") {
      blockReasons.push("Signal did not qualify as a candidate.");
    }

    if (signal.confidence < 0.55) {
      blockReasons.push(`Confidence ${signal.confidence} is below minimum 0.55.`);
    }

    if (signal.directionBias !== "up") {
      blockReasons.push("Phase 1 only allows long/up paper candidates. Downside, shorting, margin, leverage, options, and futures stay disabled.");
    }

    if (!signal.trigger || signal.trigger === "No actionable move.") {
      blockReasons.push("Missing actionable trigger.");
    }

    if (!signal.invalidation || signal.invalidation === "N/A") {
      blockReasons.push("Missing invalidation.");
    }

    const approved = blockReasons.length === 0;

    return {
      riskDecisionId: `risk-${signal.signalId || signal.symbol}`,
      signalId: signal.signalId || `sample-signal-${signal.symbol}`,
      symbol: signal.symbol,
      assetType: signal.assetType,
      directionBias: signal.directionBias,
      sampleChangePct: signal.sampleChangePct,
      confidence: signal.confidence,
      originalRiskLevel: signal.riskLevel,
      approved,
      mode: "paper_simulation",
      paperOnly: true,
      finalRiskLevel: approved ? classifyFinalRisk(signal) : "blocked",
      blockReasons,
      notes: approved
        ? "Risk Desk approved this for fake paper execution only."
        : "Risk Desk blocked this signal for Phase 1 paper simulation."
    };
  });

  return {
    generatedAt,
    mode: "paper_simulation",
    paperOnly: true,
    totalSignals: decisions.length,
    approvedCount: decisions.filter((item) => item.approved).length,
    blockedCount: decisions.filter((item) => !item.approved).length,
    decisions
  };
}

function classifyFinalRisk(signal) {
  if (signal.riskLevel === "high") return "high";
  if (signal.riskLevel === "medium") return "medium";
  return "low";
}

module.exports = { reviewSignals };
