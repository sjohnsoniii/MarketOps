const path = require("path");

const { loadLowerLearningInputs } = require("./shared/loadLowerLearningInputs");
const {
  buildMasterOutput,
  generateMasterReport,
  generateCheckpointReport,
  generateComparisonReport,
  writeJson,
  writeText
} = require("./shared/writeLowerLearningOutputs");

const { runOperatorDefenseDesk } = require("./desks/operatorDefenseDesk");
const { runMarketRegimeDesk } = require("./desks/marketRegimeDesk");
const { runDataQualityDesk } = require("./desks/dataQualityDesk");
const { runPerformanceAttributionDesk } = require("./desks/performanceAttributionDesk");
const { runReplayBacktestLab } = require("./desks/replayBacktestLab");
const { runStrategyTournamentDesk } = require("./desks/strategyTournamentDesk");
const { runRiskBudgetDesk } = require("./desks/riskBudgetDesk");
const { runLearningGovernor } = require("./desks/learningGovernor");

const projectRoot = path.join(__dirname, "..", "..", "..", "..");

const OUTPUT_DIR = path.join(projectRoot, "Data", "lower", "learning-office");
const REPORT_DIR = path.join(projectRoot, "Reports", "LowerEnvironment");

const MASTER_JSON = path.join(OUTPUT_DIR, "lower-learning-office-v0.1.json");
const MASTER_MD = path.join(REPORT_DIR, "lower-learning-office-v0.1.md");
const COMPARISON_JSON = path.join(OUTPUT_DIR, "lower-learning-comparison-v0.1.json");
const PROPOSALS_JSON = path.join(OUTPUT_DIR, "lower-learning-proposals-v0.1.json");
const CHECKPOINT_MD = path.join(REPORT_DIR, "marketops-lower-learning-office-v0.1.md");

function runLowerLearningOffice() {
  console.log("MarketOps Lower Learning Office v0.1");
  console.log("Mode: lower_environment_shadow");
  console.log("");

  console.log("Loading inputs...");
  const inputs = loadLowerLearningInputs();
  console.log(`  Sources found: ${Object.values(inputs.sources).filter(s => s.found).length}/${Object.keys(inputs.sources).length}`);
  console.log(`  Limitations: ${inputs.limitations.length}`);
  console.log("");

  console.log("Running Operator Defense Desk...");
  const operatorDefense = runOperatorDefenseDesk(inputs);
  console.log(`  Status: ${operatorDefense.status}, Confidence: ${((operatorDefense.confidence || 0) * 100).toFixed(0)}%`);

  console.log("Running Market Regime Desk...");
  const marketRegime = runMarketRegimeDesk(inputs);
  console.log(`  Status: ${marketRegime.status}, Labels: ${marketRegime.labels.join(", ")}`);

  console.log("Running Data Quality Desk...");
  const dataQuality = runDataQualityDesk(inputs);
  console.log(`  Status: ${dataQuality.status}, Quality: ${dataQuality.qualityScore}/100`);

  console.log("Running Performance Attribution Desk...");
  const performanceAttribution = runPerformanceAttributionDesk(inputs);
  console.log(`  Status: ${performanceAttribution.status}, Confidence: ${((performanceAttribution.confidence || 0) * 100).toFixed(0)}%`);

  console.log("Running Replay/Backtest Lab...");
  const replayBacktest = runReplayBacktestLab(inputs);
  console.log(`  Status: ${replayBacktest.status}, Simulations: ${replayBacktest.simulations.length}`);

  console.log("Running Strategy Tournament Desk...");
  const strategyTournament = runStrategyTournamentDesk(inputs);
  console.log(`  Status: ${strategyTournament.status}, Ranking: ${strategyTournament.ranking.length} entries`);

  console.log("Running Risk Budget Desk...");
  const riskBudget = runRiskBudgetDesk(inputs);
  console.log(`  Status: ${riskBudget.status}, Recommendations: ${riskBudget.recommendations.length}`);

  console.log("Running Learning Governor...");
  const deskResults = {
    operatorDefense,
    marketRegime,
    dataQuality,
    performanceAttribution,
    replayBacktest,
    strategyTournament,
    riskBudget
  };
  const learningGovernor = runLearningGovernor(inputs, deskResults);
  console.log(`  Status: ${learningGovernor.status}, Proposals: ${learningGovernor.proposals.length}`);
  console.log("");

  deskResults.learningGovernor = learningGovernor;

  const allLimitations = [...inputs.limitations];
  for (const desk of Object.values(deskResults)) {
    if (desk.dataLimitations && Array.isArray(desk.dataLimitations)) {
      for (const lim of desk.dataLimitations) {
        if (!allLimitations.includes(lim)) allLimitations.push(lim);
      }
    }
  }

  console.log("Building master output...");
  const masterOutput = buildMasterOutput(deskResults, allLimitations);

  masterOutput.behaviorComparison = {
    comparisonType: "lower_environment_only",
    summary: "Lower-environment shadow comparison. No production baseline compared — all desks are advisory-only.",
    details: {}
  };
  for (const [name, desk] of Object.entries(deskResults)) {
    masterOutput.behaviorComparison.details[name] = {
      status: desk.status || "unknown",
      confidence: desk.confidence !== undefined ? desk.confidence : null,
      qualityScore: desk.qualityScore !== undefined ? desk.qualityScore : null,
      findingsCount: (desk.findings || []).length,
      dataLimitationsCount: (desk.dataLimitations || []).length
    };
  }

  masterOutput.promotionProposals = learningGovernor.proposals || [];

  console.log("Writing outputs...");

  const masterReport = generateMasterReport(masterOutput);
  const checkpointReport = generateCheckpointReport(masterOutput);
  const comparisonReport = generateComparisonReport(masterOutput);

  writeJson(MASTER_JSON, masterOutput);
  writeText(MASTER_MD, masterReport);
  writeJson(COMPARISON_JSON, comparisonReport);
  writeJson(PROPOSALS_JSON, { schemaVersion: masterOutput.schemaVersion, generatedAt: masterOutput.generatedAt, proposals: learningGovernor.proposals });
  writeText(CHECKPOINT_MD, checkpointReport);

  console.log("");
  console.log("=== Output Files ===");
  console.log(`  Master JSON:      ${MASTER_JSON}`);
  console.log(`  Master Report:    ${MASTER_MD}`);
  console.log(`  Comparison JSON:  ${COMPARISON_JSON}`);
  console.log(`  Proposals JSON:   ${PROPOSALS_JSON}`);
  console.log(`  Checkpoint MD:    ${CHECKPOINT_MD}`);
  console.log("");
  console.log("Lower Learning Office v0.1 complete.");
  console.log("Mode: lower_environment_shadow. No production systems modified.");
}

if (require.main === module) {
  runLowerLearningOffice();
}

module.exports = { runLowerLearningOffice };
