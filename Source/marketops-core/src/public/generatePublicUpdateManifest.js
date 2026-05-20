const path = require("path");
const { execSync } = require("child_process");
const { paths } = require("../utils/paths");

const MANIFEST_VERSION = "marketops-public-update-manifest-v0.1";
const outputPath = path.join(paths.dataRoot, "public", `${MANIFEST_VERSION}.json`);
const sj3labsOutputPath = path.join(paths.sj3labsMarketOpsDataRoot, `${MANIFEST_VERSION}.json`);

function tryExec(cmd, fallback) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: "pipe" }).trim();
  } catch {
    return fallback;
  }
}

function loadOptional(filePath) {
  try {
    return JSON.parse(require("fs").readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function md5(str) {
  const crypto = require("crypto");
  return crypto.createHash("md5").update(str).digest("hex");
}

function generateManifest(publishStatus, overrides) {
  const generatedAt = new Date().toISOString();

  const refreshLatest = loadOptional(path.join(paths.dataRoot, "dashboard", "dashboard-refresh-latest-v0.1.json"));
  const cycleState = loadOptional(paths.cycleStateJson);
  const sampleVehicles = loadOptional(paths.sampleVehicles);
  const bundle = loadOptional(paths.siteDashboardPublicV04Json);
  const trialStatus = loadOptional(path.join(paths.sj3labsMarketOpsDataRoot, "marketops-public-trial-status-v0.1.json"));

  const refreshStatus = refreshLatest?.status || "UNKNOWN";
  const paperCycle = (cycleState?.currentCycle) || cycleState || refreshLatest?.paperCycleStatus || {};

  const universe = Array.isArray(sampleVehicles) ? sampleVehicles : (Array.isArray(sampleVehicles?.vehicles) ? sampleVehicles.vehicles : []);
  const vehiclesLoaded = Array.isArray(bundle?.watchlistQuoteSnapshot) ? bundle.watchlistQuoteSnapshot.length : 0;

  const sourceCommitBefore = tryExec("git rev-parse HEAD", "unknown");
  const sourceBranch = tryExec("git rev-parse --abbrev-ref HEAD", "unknown");
  const sj3labsCommitBefore = tryExec("git -C " + paths.sj3labsRoot + " rev-parse HEAD", "unknown");

  const runId = refreshLatest?.generatedAt || generatedAt;

  const bundleHash = bundle ? md5(JSON.stringify(bundle)) : null;
  const trialHash = trialStatus ? md5(JSON.stringify(trialStatus)) : null;

  const manifest = {
    schemaVersion: MANIFEST_VERSION,
    generatedAt,
    localRunId: runId,
    refreshStatus,
    paperCycleId: paperCycle.cycleId || "unknown",
    paperBalance: paperCycle.startingBalance ?? cycleState?.cycleStartingBalance ?? null,
    paperEquity: paperCycle.currentBalance ?? null,
    universeProfile: {
      totalVehicles: universe.length,
      types: countByType(universe),
      targetSize: universe.length,
      vehiclesLoaded
    },
    universeTargetSize: universe.length,
    vehiclesLoaded,
    dataBundleFile: "dashboard-bundle-public-v0.4.json",
    dashboardBundleGeneratedAt: bundle?.generatedAt || null,
    dashboardBundleHash: bundleHash,
    publicTrialStatusFile: "marketops-public-trial-status-v0.1.json",
    publicTrialStatusGeneratedAt: trialStatus?.generatedAt || null,
    publicTrialStatusHash: trialHash,
    manifestFile: `${MANIFEST_VERSION}.json`,
    sourceCommitBeforePublish: sourceCommitBefore,
    sourceCommitAfterPublish: null,
    sourceBranch,
    sj3labsCommitBeforePublish: sj3labsCommitBefore,
    sj3labsCommitAfterPublish: null,
    publishStatus: publishStatus || "skipped_no_changes",
    expectedVercelTrigger: publishStatus === "published",
    note: "Paper simulation only. Public update manifest for MarketOps paper trial."
  };

  const sj3labsOutputDir = path.dirname(sj3labsOutputPath);
  try {
    require("fs").mkdirSync(path.dirname(outputPath), { recursive: true });
    require("fs").mkdirSync(sj3labsOutputDir, { recursive: true });
  } catch {}
  require("../utils/fileStore").writeJson(outputPath, manifest);
  require("../utils/fileStore").writeJson(sj3labsOutputPath, manifest);

  console.log("Public update manifest generated: " + outputPath);
  console.log("Public update manifest copied to sj3labs: " + sj3labsOutputPath);
  console.log("publishStatus: " + manifest.publishStatus);
  console.log("expectedVercelTrigger: " + manifest.expectedVercelTrigger);
  console.log("sourceCommit: " + sourceCommitBefore);
  console.log("sj3labsCommit: " + sj3labsCommitBefore);
  console.log("universeTargetSize: " + universe.length + ", vehiclesLoaded: " + vehiclesLoaded);

  return manifest;
}

function countByType(vehicles) {
  const types = {};
  for (const v of vehicles) {
    const t = v.assetType || v.type || "unknown";
    types[t] = (types[t] || 0) + 1;
  }
  return types;
}

function runCli() {
  const args = process.argv.slice(2);
  const publishStatus = args[0] || "skipped_no_changes";
  try {
    generateManifest(publishStatus);
  } catch (error) {
    console.error("Failed to generate public update manifest: " + (error.message || error));
    process.exitCode = 1;
  }
}

if (require.main === module) {
  runCli();
}

module.exports = { generateManifest };
