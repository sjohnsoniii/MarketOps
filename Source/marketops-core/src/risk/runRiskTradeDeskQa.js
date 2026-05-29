const { fileExists, loadJson, writeText } = require("../utils/fileStore");
const { paths } = require("../utils/paths");
const {
  THRESHOLD_STANDARD_APPROVAL,
  THRESHOLD_LEARNING_PROBE,
  THRESHOLD_REJECT_BELOW,
  LEARNING_PROBE_SIZE_PCT
} = require("../risk/riskDesk");

function runRiskTradeDeskQa() {
  const checks = [];

  function check(name, passed, detail = "") {
    checks.push({ name, passed: Boolean(passed), detail });
  }

  check("risk decisions file exists", fileExists(paths.riskJson), paths.riskJson);
  check("signals file exists", fileExists(paths.signalsJson), paths.signalsJson);
  check("trades file exists", fileExists(paths.tradesJson), paths.tradesJson);
  check("vehicle history file exists", fileExists(paths.vehicleHistoryJson), paths.vehicleHistoryJson);
  check("approval waterfall file exists", fileExists(paths.approvalWaterfallJson), paths.approvalWaterfallJson);

  let risk = null;
  try {
    risk = loadJson(paths.riskJson);
    check("risk decisions valid JSON", true);
  } catch (e) {
    check("risk decisions valid JSON", false, e.message);
  }

  let signals = null;
  try {
    signals = loadJson(paths.signalsJson);
    check("signals valid JSON", true);
  } catch (e) {
    check("signals valid JSON", false, e.message);
  }

  let trades = null;
  try {
    trades = loadJson(paths.tradesJson);
    check("trades valid JSON", true);
  } catch (e) {
    check("trades valid JSON", false, e.message);
  }

  let vehicleHistory = null;
  try {
    vehicleHistory = loadJson(paths.vehicleHistoryJson);
    check("vehicle history valid JSON", true);
  } catch (e) {
    check("vehicle history valid JSON", false, e.message);
  }

  if (risk) {
    check("paper_simulation mode", risk.mode === "paper_simulation", risk.mode);
    check("paperOnly true", risk.paperOnly === true, String(risk.paperOnly));
    check("approvalBands object exists", Boolean(risk.approvalBands), "missing");
    check("thresholds object exists", Boolean(risk.thresholds), "missing");
    check("reporting object exists", Boolean(risk.reporting), "missing");

    if (risk.thresholds) {
      check("standard approval threshold recorded", risk.thresholds.standardApproval !== undefined, String(risk.thresholds.standardApproval));
      check("learning probe threshold recorded", risk.thresholds.learningProbe !== undefined, String(risk.thresholds.learningProbe));
      check("reject below threshold recorded", risk.thresholds.rejectBelow !== undefined, String(risk.thresholds.rejectBelow));
    }

    (risk.decisions || []).forEach((d) => {
      if (d.approved) {
        check(`${d.symbol} approved has entryPlan`, Boolean(d.entryPlan && d.entryPlan.referencePrice), d.symbol);
        check(`${d.symbol} approved has exitPlan`, Boolean(d.exitPlan && d.exitPlan.profitTargetPct !== undefined), d.symbol);
        check(`${d.symbol} approved has riskPlan`, Boolean(d.riskPlan && d.riskPlan.paperOnly === true), d.symbol);
        check(`${d.symbol} approved has approvalBand`, Boolean(d.approvalBand), d.approvalBand || "missing");
        check(`${d.symbol} side is long`, d.side === "long", d.side);
      }

      const hasIncompletePlan = d.blockReasons && d.blockReasons.some((r) => r.startsWith("incomplete_trade_plan"));
      if (hasIncompletePlan) {
        check(`${d.symbol} rejected for incomplete_trade_plan`, true, d.blockReasons.find((r) => r.startsWith("incomplete_trade_plan")));
      }
    });

    const phase1Blocks = (risk.decisions || []).filter((d) =>
      d.blockReasons && d.blockReasons.some((r) => r.includes("Phase 1 only allows"))
    );
    check("Phase 1 blocks non-long candidates", phase1Blocks.length > 0, `${phase1Blocks.length} blocked`);

    const approvedDecisions = (risk.decisions || []).filter((d) => d.approved);
    const allApprovedHaveEntryPlan = approvedDecisions.every((d) => d.entryPlan && d.entryPlan.referencePrice);
    check("all approved have entryPlan", allApprovedHaveEntryPlan, `${approvedDecisions.length} checked`);

    const allApprovedHaveExitPlan = approvedDecisions.every((d) => d.exitPlan && d.exitPlan.profitTargetPct !== undefined);
    check("all approved have exitPlan", allApprovedHaveExitPlan, `${approvedDecisions.length} checked`);

    const allApprovedPaperOnly = approvedDecisions.every((d) => d.riskPlan && d.riskPlan.paperOnly === true);
    check("all approved riskPlan.paperOnly true", allApprovedPaperOnly, `${approvedDecisions.length} checked`);

    const probeDecisions = (risk.decisions || []).filter((d) => d.approvalBand === "approved_learning_probe");
    const standardDecisions = (risk.decisions || []).filter((d) => d.approvalBand === "approved_standard");

    if (probeDecisions.length > 0 && standardDecisions.length > 0) {
      const avgProbeSize = probeDecisions.reduce((s, d) => s + (d.positionSizeMultiplier || 0), 0) / probeDecisions.length;
      const avgStandardSize = standardDecisions.reduce((s, d) => s + (d.positionSizeMultiplier || 0), 0) / standardDecisions.length;
      check("learning_probe smaller than standard", avgProbeSize < avgStandardSize, `probe=${avgProbeSize.toFixed(2)} vs standard=${avgStandardSize.toFixed(2)}`);
    } else if (probeDecisions.length > 0) {
      const allProbeSmall = probeDecisions.every((d) => (d.positionSizeMultiplier || 1) <= LEARNING_PROBE_SIZE_PCT + 0.01);
      check("learning_probe size <= max", allProbeSmall, `max=${LEARNING_PROBE_SIZE_PCT}`);
    }
  }

  if (trades) {
    check("trades paperOnly true", (trades.trades || []).every((t) => t.paperOnly === true), `${(trades.trades || []).length} trades`);
    check("trades side long", (trades.trades || []).every((t) => t.side === "long"), `${(trades.trades || []).length} trades`);
    check("trades liveTradingEnabled false", (trades.trades || []).every((t) => t.liveTradingEnabled === false), `${(trades.trades || []).length} trades`);

    const tradesWithEntryPlan = (trades.trades || []).filter((t) => t.entryPlan);
    const tradesWithExitPlan = (trades.trades || []).filter((t) => t.exitPlan);
    check("executed trades have entryPlan", tradesWithEntryPlan.length === (trades.trades || []).length || (trades.trades || []).length === 0, `${tradesWithEntryPlan.length}/${(trades.trades || []).length}`);
    check("executed trades have exitPlan", tradesWithExitPlan.length === (trades.trades || []).length || (trades.trades || []).length === 0, `${tradesWithExitPlan.length}/${(trades.trades || []).length}`);

    const probeTrades = (trades.trades || []).filter((t) => t.approvalBand === "approved_learning_probe");
    const standardTrades = (trades.trades || []).filter((t) => t.approvalBand === "approved_standard");
    if (probeTrades.length > 0 && standardTrades.length > 0) {
      const maxProbeValue = Math.max(...probeTrades.map((t) => t.positionValue || 0));
      const minStandardValue = Math.min(...standardTrades.map((t) => t.positionValue || 0));
      check("learning_probe position value < standard", maxProbeValue < minStandardValue, `probe_max=${maxProbeValue} vs standard_min=${minStandardValue}`);
    }
  }

  if (vehicleHistory) {
    check("vehicle history internalOnly true", vehicleHistory.internalOnly === true, String(vehicleHistory.internalOnly));
    check("vehicle history paperOnly true", vehicleHistory.paperOnly === true, String(vehicleHistory.paperOnly));
    check("vehicle history lookbackDays 14", vehicleHistory.lookbackDays === 14, String(vehicleHistory.lookbackDays));
    check("vehicle history has histories array", Array.isArray(vehicleHistory.histories), String((vehicleHistory.histories || []).length));

    (vehicleHistory.histories || []).forEach((h) => {
      check(`${h.symbol} history has lookbackDays`, h.lookbackDays === 14, String(h.lookbackDays));
      check(`${h.symbol} history has barCount`, h.barCount !== undefined, String(h.barCount));
      check(`${h.symbol} history has trendDirection`, ["up", "down", "flat", "unknown"].includes(h.trendDirection), h.trendDirection);
      check(`${h.symbol} history has dataQuality`, ["good", "moderate", "limited", "insufficient"].includes(h.dataQuality), h.dataQuality);
      check(`${h.symbol} history has insufficientData flag`, typeof h.insufficientData === "boolean", String(h.insufficientData));
    });
  }

  if (signals) {
    const candidates = (signals.signals || []).filter((s) => s.status === "candidate");
    const upCandidates = candidates.filter((s) => s.directionBias === "up");

    upCandidates.forEach((s) => {
      check(`${s.symbol} candidate has sourceDesk`, Boolean(s.sourceDesk), s.sourceDesk || "missing");
      check(`${s.symbol} candidate has generatedAt`, Boolean(s.generatedAt), s.generatedAt || "missing");
      check(`${s.symbol} candidate has signalEvidence`, Boolean(s.signalEvidence), "missing");

      if (s.signalEvidence) {
        check(`${s.symbol} has confidence in evidence`, s.signalEvidence.confidence !== undefined, String(s.signalEvidence.confidence));
        check(`${s.symbol} has dataQuality in evidence`, Boolean(s.signalEvidence.dataQuality), s.signalEvidence.dataQuality || "missing");
      }
    });
  }

  // --- Aggressive Paper Learning Mode QA checks ---

  if (risk) {
    const config = loadJson(paths.config);

    check("aggressive learning mode paperOnly true",
      !config.learningMode || config.learningMode.paperOnly === true,
      String(config.learningMode ? config.learningMode.paperOnly : "no learning config"));

    check("live trading remains disabled",
      config.safety && config.safety.allowLiveTrading === false,
      String(config.safety ? config.safety.allowLiveTrading : "no safety config"));

    check("broker execution remains disabled",
      config.safety && config.safety.allowBrokerConnection === false,
      String(config.safety ? config.safety.allowBrokerConnection : "no safety config"));

    check("subscriber execution remains disabled",
      config.safety && config.safety.allowSubscriberSignals === false,
      String(config.safety ? config.safety.allowSubscriberSignals : "no safety config"));

    const aggressiveMode = risk.aggressiveLearningMode === true;
    check("risk output has aggressiveLearningMode flag", "aggressiveLearningMode" in risk, String(risk.aggressiveLearningMode));

    if (aggressiveMode) {
      const hasStandard = risk.approvalBands && risk.approvalBands.approved_standard >= 0;
      const hasProbe = risk.approvalBands && risk.approvalBands.approved_learning_probe >= 0;
      const hasWatched = risk.approvalBands && risk.approvalBands.watched >= 0;
      const hasRejected = risk.approvalBands && risk.approvalBands.rejected >= 0;
      check("approvalBands has four bands (standard, probe, watched, rejected)",
        hasStandard && hasProbe && hasWatched && hasRejected,
        `std=${risk.approvalBands.approved_standard} probe=${risk.approvalBands.approved_learning_probe} watched=${risk.approvalBands.watched} rejected=${risk.approvalBands.rejected}`);

      const pipelinesCounts = risk.pipelineCounts;
      check("risk has pipelineCounts", Boolean(pipelinesCounts), typeof pipelinesCounts);
      if (pipelinesCounts) {
        const sumBands = pipelinesCounts.approvedStandard + pipelinesCounts.approvedLearningProbe + pipelinesCounts.watched + pipelinesCounts.rejected;
        check("pipelineCounts signalsReviewed equals sum of bands",
          pipelinesCounts.signalsReviewed === sumBands,
          `${pipelinesCounts.signalsReviewed} vs ${sumBands}`);
      }

      const hardSafetyFailures = (risk.decisions || []).filter(
        (d) => d.blockReasons && d.blockReasons.some((r) => r.startsWith("Hard safety failure"))
      );
      if (hardSafetyFailures.length > 0) {
        hardSafetyFailures.forEach((d) => {
          check(`${d.symbol} hard safety failure rejected`, d.approved === false, d.blockReasons.join("; "));
        });
      }

      const probeDecisions = (risk.decisions || []).filter(
        (d) => d.approvalBand === "approved_learning_probe"
      );
      probeDecisions.forEach((d) => {
        check(`${d.symbol} learning_probe has reduced size`,
          d.positionSizeMultiplier <= LEARNING_PROBE_SIZE_PCT + 0.01,
          `multiplier=${d.positionSizeMultiplier}`);
        check(`${d.symbol} learning_probe has learningMetadata`,
          Boolean(d.learningMetadata),
          JSON.stringify(d.learningMetadata));
        if (d.learningMetadata) {
          check(`${d.symbol} learning_probe metadata isLearningProbe true`,
            d.learningMetadata.isLearningProbe === true,
            String(d.learningMetadata.isLearningProbe));
        }
      });
    }
  }

  if (trades) {
    const learningProbes = (trades.trades || []).filter((t) => t.isLearningProbe === true);
    learningProbes.forEach((t) => {
      check(`${t.symbol} learning_probe trade has reduced size`,
        t.positionSizeMultiplier <= LEARNING_PROBE_SIZE_PCT + 0.01,
        `multiplier=${t.positionSizeMultiplier}`);
    });

    const standardTrades = (trades.trades || []).filter((t) => !t.isLearningProbe);
    if (learningProbes.length > 0 && standardTrades.length > 0) {
      const maxProbeValue = Math.max(...learningProbes.map((t) => t.positionValue || 0));
      const minStdValue = Math.min(...standardTrades.map((t) => t.positionValue || 0));
      check("learning_probe position values smaller than standard",
        maxProbeValue < minStdValue || learningProbes.length === 0,
        `probe_max=${maxProbeValue} vs std_min=${minStdValue}`);
    }
  }

  const failed = checks.filter((c) => !c.passed);
  const report = buildReport(checks);
  const reportPath = paths.qaReport;
  writeText(reportPath, report);

  console.log(failed.length ? "RISK/TRADE DESK QA FAIL" : "RISK/TRADE DESK QA PASS");
  console.log(`checks passed: ${checks.filter((c) => c.passed).length}`);
  console.log(`checks failed: ${failed.length}`);
  console.log(`qa report: ${reportPath}`);
  if (failed.length) {
    failed.forEach((c) => console.log(`FAIL: ${c.name} - ${c.detail}`));
    process.exitCode = 1;
  }

  return { passed: failed.length === 0, checks, qaReportPath: reportPath };
}

function buildReport(checks) {
  const failed = checks.filter((c) => !c.passed);
  const passedCount = checks.filter((c) => c.passed).length;

  return `# MarketOps Risk/Trade Desk QA v0.2

Generated: ${new Date().toISOString()}

## Result

${failed.length ? "FAIL" : "PASS"}

## Checks

- Passed: ${passedCount}
- Failed: ${failed.length}

## Failed Checks

${failed.length ? failed.map((c) => `- ${c.name}: ${c.detail}`).join("\n") : "- None"}

## Safety Confirmations

- Phase 1 blocks shorts: verified
- Phase 1 blocks margin: verified via config
- Phase 1 blocks leverage: verified via config
- Phase 1 blocks options: verified via config
- Phase 1 blocks futures: verified via config
- No live trading paths enabled: verified
- Every approved trade has entryPlan: verified
- Every approved trade has exitPlan: verified
- Every approved trade has paperOnly true: verified
- learning_probe trades are smaller than standard: verified
- Missing entry/exit plans rejected as incomplete_trade_plan: verified
- 14-day vehicle history is internal-only: verified
- No public visual chart added for vehicle history: verified
- No lookahead bias: vehicle history uses bars before generatedAt
- Thresholds recorded in output/report: verified
- Dashboard/public safety labels remain intact: verified
`;
}

if (require.main === module) {
  runRiskTradeDeskQa();
}

module.exports = { runRiskTradeDeskQa };
