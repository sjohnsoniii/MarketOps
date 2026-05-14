const { loadJson, writeText } = require("../utils/fileStore");
const { round } = require("../utils/number");
const { paths } = require("../utils/paths");

function safeReason(reason) {
  return String(reason || "No reason recorded.").replace(/\d+\.\d+/g, "threshold");
}

function proposedAction(signal) {
  if (signal.status !== "candidate") {
    return `${signal.symbol} was reviewed as a watchlist movement, but it was not proposed as a fake trade.`;
  }
  if (signal.directionBias === "up") {
    return `${signal.symbol} was a possible long-only fake paper candidate.`;
  }
  return `${signal.symbol} moved, but the current phase does not allow downside/short-style fake trades.`;
}

function approvableCondition(signal, decision = {}) {
  const needs = [];
  if (signal.status !== "candidate") needs.push("movement strong enough to become a candidate");
  if (Number(signal.confidence || 0) < 0.55) needs.push("confidence at or above 0.55");
  if (signal.directionBias !== "up") needs.push("an up/long-only direction");
  if (!signal.trigger || signal.trigger === "No actionable move.") needs.push("a clear trigger");
  if (!signal.invalidation || signal.invalidation === "N/A") needs.push("a clear invalidation/stop condition");
  if ((decision.blockReasons || []).some((reason) => /shorting|margin|leverage|options|futures/i.test(reason))) {
    needs.push("no shorting, margin, leverage, options, or futures dependency");
  }
  return needs.length ? `It would need ${needs.join(", ")}.` : "It already meets the current paper-only gate.";
}

function improvementFor(signal, decision = {}) {
  const reasons = (decision.blockReasons || []).join(" ").toLowerCase();
  if (reasons.includes("did not qualify")) return "Improve candidate detection so minor watchlist moves are tracked without pretending they are trade-ready.";
  if (reasons.includes("confidence")) return "Improve confidence scoring and explain what additional evidence would raise confidence.";
  if (reasons.includes("long/up")) return "Keep downside ideas as observation-only until shorting and leverage are explicitly allowed, which they are not now.";
  if (reasons.includes("invalidation")) return "Require every candidate to include a simple invalidation condition before Risk Desk review.";
  return "Keep this signal in the watchlist movement panel and compare it against later outcomes.";
}

function buildRows() {
  const signals = loadJson(paths.signalsJson);
  const risk = loadJson(paths.riskJson);
  const decisionsBySignal = {};
  (risk.decisions || []).forEach((decision) => {
    decisionsBySignal[decision.signalId] = decision;
  });

  return (signals.signals || []).map((signal) => {
    const decision = decisionsBySignal[signal.signalId] || {};
    const blockReasons = decision.blockReasons || [];
    return {
      symbol: signal.symbol,
      status: signal.status,
      proposedAction: proposedAction(signal),
      decision: decision.approved === true ? "approved_for_fake_paper_trade" : "rejected",
      laymanReason: decision.approved === true
        ? "Risk Desk found no blocking issue under current paper-only rules."
        : blockReasons.map(safeReason).join(" "),
      blockReasons: blockReasons.map(safeReason),
      confidence: round(signal.confidence || 0),
      movementPct: round(signal.sampleChangePct || 0),
      directionBias: signal.directionBias,
      wouldHaveMadeItApprovable: approvableCondition(signal, decision),
      botImprovementNext: improvementFor(signal, decision),
      paperOnly: true,
      liveTradingEnabled: false,
      orderPlacementEnabled: false
    };
  });
}

function buildReport(rows) {
  const rejected = rows.filter((row) => row.decision === "rejected");
  const approved = rows.filter((row) => row.decision !== "rejected");
  return `# MarketOps Trade Rejection Explainability v0.1

Generated: ${new Date().toISOString()}

## Summary

- Paper-only review: true
- Live trading enabled: false
- Broker execution enabled: false
- Signals reviewed: ${rows.length}
- Approved for fake paper trade: ${approved.length}
- Rejected or observation-only: ${rejected.length}

## Plain-English Result

Risk Desk rejected every current fake-trade path because the watchlist moves did not clear the current candidate/confidence/long-only gates. This is useful public proof-of-life: the bot is observing real-market-derived movement, explaining why it is staying out, and preserving fake-money discipline.

## Rejection Table

| Symbol | Proposed | Decision | Confidence | Move % | Why rejected | What would make it approvable |
|---|---|---|---:|---:|---|---|
${rows.map((row) => `| ${row.symbol} | ${row.proposedAction} | ${row.decision} | ${row.confidence} | ${row.movementPct} | ${row.laymanReason || "n/a"} | ${row.wouldHaveMadeItApprovable} |`).join("\n")}

## Bot Improvement Notes

${rows.map((row) => `- ${row.symbol}: ${row.botImprovementNext}`).join("\n")}

## Safety Boundary

No live order, broker execution, real-money action, social post, email, SMS, or deploy is performed by this report.`;
}

function runTradeRejectionExplainability() {
  const rows = buildRows();
  writeText(paths.tradeRejectionExplainabilityReport, buildReport(rows));
  console.log("MarketOps trade rejection explainability report written");
  console.log(`report: ${paths.tradeRejectionExplainabilityReport}`);
  console.log(`signals reviewed: ${rows.length}`);
  console.log(`rejected: ${rows.filter((row) => row.decision === "rejected").length}`);
  return { rows, reportPath: paths.tradeRejectionExplainabilityReport };
}

if (require.main === module) {
  try {
    runTradeRejectionExplainability();
  } catch (error) {
    console.error(`risk:explain failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  approvableCondition,
  buildRows,
  runTradeRejectionExplainability
};
