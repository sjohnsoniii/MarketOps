const path = require("path");
const { fileExists, loadJson, writeJson, writeText } = require("../utils/fileStore");
const { paths } = require("../utils/paths");
const { round } = require("../utils/number");

function buildLearningProbeRecords() {
  const riskReview = fileExists(paths.riskJson) ? loadJson(paths.riskJson) : { decisions: [] };
  const trades = fileExists(paths.tradesJson) ? loadJson(paths.tradesJson) : { trades: [] };
  const positions = fileExists(paths.paperPositionsJson) ? loadJson(paths.paperPositionsJson) : { openPositions: [] };
  const signals = fileExists(paths.signalsJson) ? loadJson(paths.signalsJson) : { signals: [] };

  const signalsBySymbol = {};
  (signals.signals || []).forEach((s) => { signalsBySymbol[s.symbol] = s; });

  const probeDecisions = (riskReview.decisions || []).filter(
    (d) => d.approvalBand === "approved_learning_probe"
  );

  const probeTrades = (trades.trades || []).filter((t) => t.isLearningProbe === true);

  const probePositions = (positions.openPositions || []).filter((pos) => {
    const decision = (riskReview.decisions || []).find(
      (d) => d.symbol === pos.symbol && d.approvalBand === "approved_learning_probe"
    );
    return !!decision;
  });

  const records = [];

  (riskReview.decisions || []).forEach((decision) => {
    if (decision.approvalBand !== "approved_learning_probe") return;

    const signal = signalsBySymbol[decision.symbol] || {};
    const trade = probeTrades.find((t) => t.symbol === decision.symbol);
    const position = probePositions.find((p) => p.symbol === decision.symbol);

    const entryPrice = trade ? trade.entryPrice : (position ? position.entryPrice : null);
    const currentPrice = position ? (position.currentPrice || position.latestPrice || null) : null;
    const quantity = trade ? trade.quantity : (position ? position.quantity : null);
    const positionValue = trade ? trade.positionValue : (position ? position.positionValue : null);

    let outcomeStatus = "pending";
    let realizedResult = null;

    if (trade && trade.status === "closed") {
      const rp = Number(trade.realizedPnl || 0);
      realizedResult = rp;
      if (rp > 0) outcomeStatus = "win";
      else if (rp < 0) outcomeStatus = "loss";
      else outcomeStatus = "inconclusive";
    }

    records.push({
      ticker: decision.symbol,
      hypothesis: `Learning probe: testing ${decision.symbol} at confidence ${(decision.confidence || 0).toFixed(2)}`,
      entryReason: decision.entryPlan ? decision.entryPlan.entryReason : (signal.trigger || "No specific trigger"),
      riskConcerns: `Confidence ${(decision.confidence || 0).toFixed(2)} below standard threshold. Probe sized at ${decision.positionSizeMultiplier || 0.25}x.`,
      entryTimestamp: (trade && trade.entryTime) || (position && position.entryTime) || null,
      outcomeStatus,
      realizedPnl: realizedResult !== null ? round(realizedResult) : null,
      unrealizedPnl: position ? round(position.unrealizedPnl || 0) : null,
      lesson: outcomeStatus === "pending"
        ? "Learning probe - awaiting outcome"
        : outcomeStatus === "win"
          ? "Learning probe succeeded despite low confidence - worth re-evaluating threshold"
          : outcomeStatus === "loss"
            ? "Learning probe loss - validate confidence threshold correctness"
            : "Learning probe inconclusive - gather more data",
      confidence: decision.confidence || null,
      entryPrice,
      currentPrice,
      quantity,
      positionValue: positionValue !== null ? round(positionValue) : null,
      isOpen: outcomeStatus === "pending"
    });
  });

  return {
    generatedAt: new Date().toISOString(),
    mode: "paper_simulation",
    paperOnly: true,
    learningMode: true,
    totalProbeDecisions: probeDecisions.length,
    totalProbeTrades: probeTrades.length,
    totalProbePositions: probePositions.length,
    records
  };
}

function runLearningProbeRecords() {
  const records = buildLearningProbeRecords();

  const recordsPath = path.join(paths.dataRoot, "paper", "risk", "learning-probe-records-v0.1.json");
  writeJson(recordsPath, records);

  const reportDir = path.join(paths.projectRoot, "Reports", "Learning");
  const reportPath = path.join(reportDir, "marketops-learning-probe-records-v0.1.md");
  const { ensureDir } = require("../utils/fileStore");
  ensureDir(reportDir);

  const openCount = records.records.filter((r) => r.isOpen).length;
  const closedCount = records.records.filter((r) => !r.isOpen).length;
  const wins = records.records.filter((r) => r.outcomeStatus === "win").length;
  const losses = records.records.filter((r) => r.outcomeStatus === "loss").length;

  const report = `# MarketOps Learning Probe Records v0.1

Generated: ${records.generatedAt}

## Summary

- Total probe decisions: ${records.totalProbeDecisions}
- Total probe trades: ${records.totalProbeTrades}
- Open probe positions: ${openCount}
- Closed probe positions: ${closedCount}
- Probe wins: ${wins}
- Probe losses: ${losses}
- Mode: ${records.mode}
- Paper only: ${records.paperOnly}
- Learning mode: ${records.learningMode}

## Probe Records

${records.records.length === 0 ? "No learning probe records found." : ""}
${records.records.map((r, i) => `### ${i + 1}. ${r.ticker}

- Hypothesis: ${r.hypothesis}
- Entry reason: ${r.entryReason}
- Risk concerns: ${r.riskConcerns}
- Entry timestamp: ${r.entryTimestamp || "N/A"}
- Outcome: ${r.outcomeStatus}
- Realized P/L: ${r.realizedPnl !== null ? "$" + r.realizedPnl.toFixed(2) : "N/A"}
- Unrealized P/L: ${r.unrealizedPnl !== null ? "$" + r.unrealizedPnl.toFixed(2) : "N/A"}
- Lesson: ${r.lesson}
- Confidence: ${r.confidence !== null ? r.confidence.toFixed(2) : "N/A"}
- Entry price: ${r.entryPrice !== null ? "$" + r.entryPrice.toFixed(2) : "N/A"}
- Quantity: ${r.quantity !== null ? r.quantity.toFixed(4) : "N/A"}
- Position value: ${r.positionValue !== null ? "$" + r.positionValue.toFixed(2) : "N/A"}
- Open: ${r.isOpen}

---`).join("\n")}

## Notes

- Learning probes are paper-only trades executed at reduced size (${records.totalProbeDecisions > 0 ? "~25%" : "N/A"} of standard position).
- Probes allow the system to learn from low-confidence signals without significant paper drawdown risk.
- Outcomes are labeled as win/loss/inconclusive for continuous learning.
`;
  writeText(reportPath, report);

  console.log(`Learning probe records written to ${recordsPath}`);
  console.log(`Learning probe report written to ${reportPath}`);
  console.log(`Records: ${records.records.length} total, ${openCount} open, ${closedCount} closed, ${wins} wins, ${losses} losses`);

  return { records, recordsPath, reportPath };
}

if (require.main === module) {
  runLearningProbeRecords();
}

module.exports = { buildLearningProbeRecords, runLearningProbeRecords };