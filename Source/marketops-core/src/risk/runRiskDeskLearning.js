const path = require("path");
const { writeJson, writeText, ensureDir } = require("../utils/fileStore");
const { buildRiskDeskLearning } = require("./riskDeskLearningBuilder");
const { paths } = require("../utils/paths");

function buildReport(data) {
  const s = data.summary;
  const lines = [];

  function addRow(label, value) {
    lines.push(`| ${label} | ${value} |`);
  }

  lines.push("# MarketOps Risk Desk Learning Report v0.1");
  lines.push("");
  lines.push(`Generated: ${data.generatedAt}`);
  lines.push(`Paper Simulation: ${data.paperSimulation}`);
  lines.push(`Cycle: ${data.cycleId || "N/A"}`);
  lines.push(`Cycle Started: ${data.cycleStartedAt || "N/A"}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push("| Metric | Count |");
  lines.push("|---|---:|");
  addRow("Approved Trades", s.approvedCount);
  addRow("Rejected Trades", s.rejectedCount);
  addRow("Watched Signals", s.watchedCount);
  addRow("Shadow Trades Tracked", s.shadowTrackedCount);
  addRow("Possible False Positives (bad_approval)", s.possibleFalsePositiveCount);
  addRow("Possible False Negatives (bad_rejection)", s.possibleFalseNegativeCount);
  addRow("Good Approvals", s.goodApprovalCount);
  addRow("Bad Approvals", s.badApprovalCount);
  addRow("Good Rejections", s.goodRejectionCount);
  addRow("Bad Rejections / Missed Winners", s.badRejectionCount);
  addRow("Inconclusive", s.inconclusiveCount);
  lines.push("");
  lines.push(`**Best Decision:** ${s.bestDecision}`);
  lines.push(`**Worst Decision:** ${s.worstDecision}`);
  lines.push("");
  lines.push(`**Learning Notes:** ${s.learningNotes}`);
  lines.push("");

  if (data.approvedTrades.length > 0) {
    lines.push("## Approved Trades");
    lines.push("");
    lines.push("| Symbol | Outcome | P&L % | Plain English |");
    lines.push("|---|---:|---:|:---|");
    for (const t of data.approvedTrades) {
      lines.push(`| ${t.symbol} | ${t.outcomeLabel} | ${t.unrealizedPnlPct !== null ? round(t.unrealizedPnlPct) + '%' : 'N/A'} | ${t.plainEnglishOutcome} |`);
    }
    lines.push("");
  }

  if (data.rejectedTrades.length > 0) {
    lines.push("## Rejected Trades (with Shadow Estimates)");
    lines.push("");
    lines.push("| Symbol | Outcome | Shadow P&L % | Block Reason | Plain English |");
    lines.push("|---|---:|---:|:---|:---|");
    for (const t of data.rejectedTrades) {
      const blockReasons = t.riskDeskReason.substring(0, 60);
      lines.push(`| ${t.symbol} | ${t.outcomeLabel} | ${t.shadowPnlPct !== null ? round(t.shadowPnlPct) + '%' : 'N/A'} | ${blockReasons} | ${t.plainEnglishOutcome} |`);
    }
    lines.push("");
  }

  if (data.watchedSignals.length > 0) {
    lines.push("## Watched Signals");
    lines.push("");
    lines.push("| Symbol | Outcome | Reason Watched |");
    lines.push("|---|---:|:---|");
    for (const w of data.watchedSignals) {
      lines.push(`| ${w.symbol} | ${w.outcomeLabel} | ${(w.reasonWatched || "").substring(0, 60)} |`);
    }
    lines.push("");
  }

  if (data.recommendations.length > 0) {
    lines.push("## Recommendations (All require admin review, none auto-applied)");
    lines.push("");
    for (const r of data.recommendations) {
      lines.push(`### ${r.recommendationId}: ${r.title}`);
      lines.push(`- **Summary:** ${r.summary}`);
      lines.push(`- **Risk Level:** ${r.riskLevel}`);
      lines.push(`- **Auto-apply:** ${r.autoApply}`);
      lines.push(`- **Requires Admin Review:** ${r.requiresAdminReview}`);
      lines.push("");
    }
  }

  if (data.proposals.length > 0) {
    lines.push("## Proposals (Pending Future Review Queue)");
    lines.push("");
    for (const p of data.proposals) {
      lines.push(`### ${p.proposalId}: ${p.title}`);
      lines.push(`- **Type:** ${p.proposalType}`);
      lines.push(`- **Summary:** ${p.summary}`);
      lines.push(`- **Risk Level:** ${p.riskLevel}`);
      lines.push(`- **Safety Impact:** ${p.safetyImpact}`);
      lines.push(`- **Status:** ${p.status}`);
      lines.push(`- **Auto-apply:** ${p.autoApply}`);
      lines.push("");
    }
  }

  lines.push("## Safety Boundaries");
  lines.push("");
  lines.push("- No active risk rules were changed.");
  lines.push("- No recommendations were auto-applied.");
  lines.push("- No live trading, broker execution, or real-money action.");
  lines.push("- No email, SMS, or social posting was triggered.");
  lines.push("- No private or admin data was exposed publicly.");
  lines.push("- Paper simulation labels remain visible.");
  lines.push("");

  return lines.join("\n");
}

function round(value, places = 2) {
  if (value === null || value === undefined) return "N/A";
  const n = Number(value);
  if (!isFinite(n)) return "N/A";
  return n.toFixed(places);
}

function riskDeskLearningRun() {
  const data = buildRiskDeskLearning();

  const paperRoot = path.join(paths.dataRoot, "paper");
  const outputDir = path.join(paperRoot, "risk");
  const reportDir = path.join(paths.projectRoot, "Reports", "Risk");

  ensureDir(outputDir);
  ensureDir(reportDir);

  const jsonPath = path.join(outputDir, "risk-desk-learning-v0.1.json");
  const reportPath = path.join(reportDir, "marketops-risk-desk-learning-v0.1.md");

  writeJson(jsonPath, data);
  writeText(reportPath, buildReport(data));

  console.log("MarketOps Risk Desk Learning Records generated");
  console.log(`json: ${jsonPath}`);
  console.log(`report: ${reportPath}`);
  console.log(`approved: ${data.summary.approvedCount}`);
  console.log(`rejected: ${data.summary.rejectedCount}`);
  console.log(`watched: ${data.summary.watchedCount}`);
  console.log(`shadow: ${data.summary.shadowTrackedCount}`);

  return { data, jsonPath, reportPath };
}

if (require.main === module) {
  try {
    riskDeskLearningRun();
  } catch (error) {
    console.error(`risk:learning failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { riskDeskLearningRun };
