const { fileExists, loadJson, writeJson, writeText } = require("../utils/fileStore");
const { round } = require("../utils/number");
const { paths } = require("../utils/paths");

const WATERFALL_STEPS = [
  "watchlist_movements_reviewed",
  "enough_data",
  "trade_candidates_generated",
  "passed_long_up_direction_gate",
  "passed_confidence_threshold",
  "had_invalidation_stop",
  "passed_risk_rules",
  "approved_fake_paper_trades"
];

function buildApprovalWaterfall() {
  const signals = fileExists(paths.signalsJson) ? loadJson(paths.signalsJson) : { signals: [] };
  const risk = fileExists(paths.riskJson) ? loadJson(paths.riskJson) : { decisions: [] };
  const trades = fileExists(paths.tradesJson) ? loadJson(paths.tradesJson) : { trades: [] };
  const confidence = fileExists(paths.confidenceJson) ? loadJson(paths.confidenceJson) : { symbols: [] };

  const totalSignals = (signals.signals || []).length;
  const candidates = (signals.signals || []).filter((s) => s.status === "candidate");
  const upDirection = candidates.filter((s) => s.directionBias === "up");
  const confThreshold = 0.55;
  const aboveThreshold = upDirection.filter((s) => (s.confidence || 0) >= confThreshold);
  const hasInvalidation = aboveThreshold.filter((s) => s.invalidation && s.invalidation !== "N/A");

  const riskDecisions = risk.decisions || [];
  const approved = riskDecisions.filter((d) => d.approved === true);
  const fakeTrades = (trades.trades || []).length;

  const enoughDataCount = (confidence.symbols || []).filter((s) => s.enoughData !== false).length;

  const waterfallLevels = {
    watchlist_movements_reviewed: totalSignals,
    enough_data: enoughDataCount || totalSignals,
    trade_candidates_generated: candidates.length,
    passed_long_up_direction_gate: upDirection.length,
    passed_confidence_threshold: aboveThreshold.length,
    had_invalidation_stop: hasInvalidation.length,
    passed_risk_rules: approved.length,
    approved_fake_paper_trades: fakeTrades
  };

  const rejectionReasons = {};
  (risk.decisions || []).filter((d) => !d.approved).forEach((d) => {
    (d.blockReasons || ["Unknown"]).forEach((reason) => {
      const key = String(reason || "Unknown").replace(/\d+\.\d+/g, "threshold");
      rejectionReasons[key] = (rejectionReasons[key] || 0) + 1;
    });
  });

  const topBlockers = Object.entries(rejectionReasons)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);

  const result = {
    schemaVersion: "0.1",
    generatedAt: new Date().toISOString(),
    mode: "paper_simulation",
    paperOnly: true,
    liveTradingEnabled: false,
    totalSignals,
    waterfallLevels,
    waterfallSteps: WATERFALL_STEPS.map((step) => ({
      step,
      count: waterfallLevels[step] || 0,
      label: step.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    })),
    approvedCount: approved.length,
    rejectedCount: riskDecisions.length - approved.length,
    fakeTradeCount: fakeTrades,
    topBlockers,
    noTradeReason: fakeTrades === 0 ? "No candidates passed all approval gates" : null,
    confidenceThreshold: confThreshold,
    riskGates: [
      { gate: "long/up-only", passed: upDirection.length, failed: candidates.length - upDirection.length },
      { gate: "confidence >= 0.55", passed: aboveThreshold.length, failed: upDirection.length - aboveThreshold.length },
      { gate: "invalidation/stop defined", passed: hasInvalidation.length, failed: aboveThreshold.length - hasInvalidation.length },
      { gate: "risk rules", approved: approved.length, rejected: riskDecisions.length - approved.length }
    ]
  };

  writeJson(paths.approvalWaterfallJson, result);

  const rowLine = WATERFALL_STEPS.map((step) => {
    const count = waterfallLevels[step] || 0;
    const name = step.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return `| ${name} | ${count} |`;
  }).join("\n");

  const blockerLines = topBlockers.length > 0
    ? topBlockers.map((b) => `| ${b.reason} | ${b.count} |`).join("\n")
    : "| None | 0 |";

  const reportText = [
    "# MarketOps Approval Waterfall v0.1",
    "",
    `Generated: ${result.generatedAt}`,
    "",
    "## Summary",
    "",
    `- Signals reviewed: ${totalSignals}`,
    `- Candidates: ${candidates.length}`,
    `- Approved by risk: ${approved.length}`,
    `- Fake trades: ${fakeTrades}`,
    `- No-trade reason: ${result.noTradeReason || "n/a"}`,
    "",
    "## Waterfall",
    "",
    "| Step | Count |",
    "|------|------:|",
    rowLine,
    "",
    "## Risk Gates",
    "",
    "| Gate | Passed | Failed |",
    "|------|-------:|------:|",
    ...result.riskGates.map((g) => `| ${g.gate} | ${g.passed || g.approved || 0} | ${g.failed || g.rejected || 0} |`),
    "",
    "## Top Blockers",
    "",
    "| Reason | Count |",
    "|--------|------:|",
    blockerLines,
    "",
    "## Notes",
    "",
    "- Approval waterfall shows the funnel from watchlist review to executed fake paper trades.",
    "- Each step is a gate: items must pass through all previous gates to proceed.",
    "- No trades were approved automatically. Thresholds were not lowered.",
    "- All activity is paper simulation only. No real money, broker, or live trading.",
    ""
  ];

  writeText(paths.approvalWaterfallReport, reportText.join("\n"));

  return result;
}

function runCli() {
  try {
    const result = buildApprovalWaterfall();
    console.log("MarketOps approval waterfall built.");
    console.log(`Signals reviewed: ${result.totalSignals}`);
    console.log(`Candidates: ${result.waterfallLevels.trade_candidates_generated}`);
    console.log(`Approved: ${result.approvedCount}`);
    console.log(`Fake trades: ${result.fakeTradeCount}`);
    console.log(`Top blocker: ${result.topBlockers.length > 0 ? result.topBlockers[0].reason : "none"}`);
    console.log(`Waterfall JSON: ${paths.approvalWaterfallJson}`);
    console.log(`Waterfall report: ${paths.approvalWaterfallReport}`);
    return result;
  } catch (error) {
    console.error("MarketOps approval waterfall failed.");
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  runCli();
}

module.exports = { buildApprovalWaterfall };
