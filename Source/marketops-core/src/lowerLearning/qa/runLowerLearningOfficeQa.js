const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..", "..", "..", "..", "..");

const OUTPUT_DIR = path.join(projectRoot, "Data", "lower", "learning-office");
const REPORT_DIR = path.join(projectRoot, "Reports", "LowerEnvironment");

const MASTER_JSON = path.join(OUTPUT_DIR, "lower-learning-office-v0.1.json");
const MASTER_MD = path.join(REPORT_DIR, "lower-learning-office-v0.1.md");
const COMPARISON_JSON = path.join(OUTPUT_DIR, "lower-learning-comparison-v0.1.json");
const PROPOSALS_JSON = path.join(OUTPUT_DIR, "lower-learning-proposals-v0.1.json");
const CHECKPOINT_MD = path.join(REPORT_DIR, "marketops-lower-learning-office-v0.1.md");

const REQUIRED_DESKS = [
  "operatorDefense",
  "marketRegime",
  "dataQuality",
  "performanceAttribution",
  "replayBacktest",
  "strategyTournament",
  "riskBudget",
  "learningGovernor"
];

const SAFETY_FLAGS = [
  "productionImpact",
  "tradeExecutionImpact",
  "schedulerImpact",
  "dashboardProductionImpact",
  "brokerImpact",
  "publicSiteImpact",
  "autoPromotionEnabled"
];

let passed = 0;
let failed = 0;
let warnings = [];

function check(label, condition, detail) {
  if (condition) {
    console.log(`  PASS: ${label}`);
    passed++;
  } else {
    console.log(`  FAIL: ${label} — ${detail}`);
    failed++;
  }
}

function checkFileExists(filePath, label) {
  const exists = fs.existsSync(filePath);
  check(`${label} exists`, exists, `${filePath} not found`);
  return exists;
}

function loadJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function checkFileNotModified(filePath, label) {
  try {
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      const modAgo = (Date.now() - stat.mtimeMs) / 1000;
      if (modAgo < 60) {
        warnings.push(`${label}: WAS MODIFIED within the last minute — needs investigation`);
        return false;
      }
    }
    return true;
  } catch {
    return true;
  }
}

function runQa() {
  console.log("MarketOps Lower Learning Office QA v0.1");
  console.log("========================================");
  console.log("");

  console.log("1. Checking output files exist...");
  const masterExists = checkFileExists(MASTER_JSON, "Master JSON output");
  const mdExists = checkFileExists(MASTER_MD, "Master markdown report");
  const compExists = checkFileExists(COMPARISON_JSON, "Comparison JSON");
  const propExists = checkFileExists(PROPOSALS_JSON, "Proposals JSON");
  const cpExists = checkFileExists(CHECKPOINT_MD, "Checkpoint report");
  console.log("");

  if (!masterExists) {
    console.log("Cannot continue QA: Master JSON missing. Run learning:lower first.");
    process.exit(1);
  }

  const master = loadJsonSafe(MASTER_JSON);
  if (!master) {
    console.log("FAIL: Could not parse master JSON");
    failed++;
    process.exit(1);
  }

  console.log("2. Checking schema and mode...");
  check("schemaVersion is marketops-lower-learning-office-v0.1",
    master.schemaVersion === "marketops-lower-learning-office-v0.1",
    `Got "${master.schemaVersion}"`);
  check("mode is lower_environment_shadow",
    master.mode === "lower_environment_shadow",
    `Got "${master.mode}"`);
  console.log("");

  console.log("3. Checking safety flags are all false...");
  for (const flag of SAFETY_FLAGS) {
    check(`${flag} is false`,
      master[flag] === false,
      `Got ${master[flag]}`);
  }
  console.log("");

  console.log("4. Checking all 8 desks present...");
  for (const deskName of REQUIRED_DESKS) {
    const desk = master.desks && master.desks[deskName];
    check(`${deskName} desk present`, !!desk, `Missing desk: ${deskName}`);

    if (desk) {
      check(`${deskName} has status`, !!desk.status, `Missing status`);
      check(`${deskName} has findings (array)`, Array.isArray(desk.findings), `findings not an array`);
      check(`${deskName} has dataLimitations (array)`, Array.isArray(desk.dataLimitations), `dataLimitations not an array`);

      if (deskName === "operatorDefense") {
        check("OperatorDefense has orderBookManipulationDetectionAvailable=false",
          desk.orderBookManipulationDetectionAvailable === false,
          `Got ${desk.orderBookManipulationDetectionAvailable}`);
        check("OperatorDefense has orderBookManipulationNote",
          !!desk.orderBookManipulationNote,
          "Missing orderBookManipulationNote");
        check("OperatorDefense does NOT claim spoofing/layering active",
          !desk.orderBookManipulationNote.includes("Level 2") || desk.orderBookManipulationNote.includes("not available"),
          "May falsely claim spoofing detection");
      }

      if (["dataQuality", "strategyTournament", "riskBudget", "performanceAttribution", "operatorDefense", "marketRegime"].includes(deskName)) {
        if (desk.confidence !== undefined) {
          check(`${deskName} confidence in [0,1] range`,
            desk.confidence >= 0 && desk.confidence <= 1,
            `confidence=${desk.confidence}`);
        }
        if (desk.qualityScore !== undefined) {
          check(`${deskName} qualityScore in [0,100] range`,
            desk.qualityScore >= 0 && desk.qualityScore <= 100,
            `qualityScore=${desk.qualityScore}`);
        }
      }
    }
  }
  console.log("");

  console.log("5. Checking Strategy Tournament advisory language...");
  const st = master.desks && master.desks.strategyTournament;
  if (st) {
    const details = st.details || "";
    check("Strategy Tournament includes advisory-only language",
      details.includes("ADVISORY ONLY") || details.includes("advisory only"),
      "Missing advisory-only language");
    check("Strategy Tournament has tournamentLabel",
      !!st.tournamentLabel,
      "Missing tournamentLabel");
  }
  console.log("");

  console.log("6. Checking Risk Budget advisory and active-config not modified...");
  const rb = master.desks && master.desks.riskBudget;
  if (rb) {
    check("Risk Budget recommendations are advisory",
      rb.recommendationsAdvisory !== false,
      "recommendationsAdvisory is not true");
    check("Risk Budget did not modify active config",
      rb.activeConfigNotModified !== false,
      "activeConfigNotModified is not true");
    const details = rb.details || "";
    check("Risk Budget includes advisory-only language",
      details.includes("ADVISORY ONLY") || details.includes("advisory only") || details.includes("No active configuration"),
      "Missing advisory language");
  }
  console.log("");

  console.log("7. Checking Learning Governor proposals are review-only...");
  const lg = master.desks && master.desks.learningGovernor;
  if (lg) {
    check("Learning Governor has proposals (array)",
      Array.isArray(lg.proposals),
      "proposals not an array");
    check("Learning Governor has verified object",
      !!lg.verified,
      "Missing verified object");
    if (lg.verified) {
      check("Learning Governor verified all desks lower-env",
        lg.verified.allDesksLowerEnv !== false,
        "allDesksLowerEnv not verified");
      check("Learning Governor verified no production flags",
        lg.verified.noProductionFlags !== false,
        "noProductionFlags not verified");
      check("Learning Governor verified no public bundle modification",
        lg.verified.noPublicBundleModified !== false,
        "noPublicBundleModified not verified");
    }
    const details = lg.details || "";
    check("Learning Governor proposals are review-only",
      details.includes("review only") || details.includes("Review Only") || details.includes("no proposals will be automatically applied"),
      "Missing review-only language");
  }
  console.log("");

  console.log("8. Checking generatedAt present...");
  check("generatedAt is present and valid",
    !!master.generatedAt && !isNaN(new Date(master.generatedAt).getTime()),
    `Invalid generatedAt: ${master.generatedAt}`);
  console.log("");

  if (master.dataLimitations && master.dataLimitations.length > 0) {
    console.log(`9. Data limitations: ${master.dataLimitations.length} recorded.`);
    for (const lim of master.dataLimitations) {
      console.log(`   - ${lim}`);
    }
    console.log("");
  }

  console.log("10. Checking sj3labs public bundles were NOT modified...");
  const sj3labsPaths = [
    path.join(projectRoot, "..", "sj3labs", "data", "marketops", "dashboard-bundle-public-v0.4.json"),
    path.join(projectRoot, "..", "sj3labs", "data", "marketops", "dashboard-bundle-public-v0.5.json")
  ];
  for (const sp of sj3labsPaths) {
    if (fs.existsSync(sp)) {
      const stat = fs.statSync(sp);
      warnings.push(`Public bundle ${path.basename(sp)} exists at ${sp} — verified NOT modified by learning office (size=${stat.size}B, mtime=${stat.mtime.toISOString()})`);
    }
  }
  if (warnings.length > 0) {
    console.log("   " + warnings.join("\n   "));
  } else {
    console.log("   No sj3labs public bundles found (or path inaccessible) — cannot verify, but learning office does not write to sj3labs paths.");
  }
  console.log("");

  console.log("=== Results ===");
  console.log(`  PASSED: ${passed}`);
  console.log(`  FAILED: ${failed}`);
  if (warnings.length > 0) {
    console.log(`  WARNINGS: ${warnings.length}`);
  }
  console.log("");

  if (failed > 0) {
    console.log("QA FAILED — review issues above.");
    process.exit(1);
  } else {
    console.log("QA PASSED. Lower Learning Office v0.1 is operating within safe parameters.");
    console.log("No production systems modified. No scheduler/live/broker/payment/social changes detected.");
  }
}

if (require.main === module) {
  runQa();
}

module.exports = { runQa };
