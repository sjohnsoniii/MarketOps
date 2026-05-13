const fs = require("fs");
const path = require("path");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const templatePath = path.join(projectRoot, "Config", "social-account-readiness.template.json");
const localPath = path.join(projectRoot, "Config", "social-account-readiness.local.json");
const reportPath = path.join(projectRoot, "Reports", "Social", "marketops-social-account-readiness-v0.1.md");
const setupDocPath = path.join(projectRoot, "Docs", "Social", "MarketOps-Social-Posting-Setup-v0.1.md");
const checklistDocPath = path.join(projectRoot, "Docs", "Social", "MarketOps-Draft-Publishing-Checklist-v0.1.md");
const activePlatforms = ["instagram", "x", "tiktok", "youtube"];
const deferredPlatforms = ["linkedin", "facebook"];
const allowedPostingModes = ["manual_only", "draft_export_only", "api_ready_later", "api_connected_later"];

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function classifyPlatform(platform) {
  if (deferredPlatforms.includes(platform.platform)) return "DEFERRED";
  const missing = Array.isArray(platform.missingItems) ? platform.missingItems.filter((item) => item && item !== "deferred") : [];
  const hasHandle = Boolean(platform.handle && platform.handle.trim());
  const hasPasswordRef = Boolean(platform.passwordManagerEntryName && platform.passwordManagerEntryName.trim());
  const hasPostingMode = allowedPostingModes.includes(platform.postingMode);
  if (!hasPostingMode) return "BLOCKED";
  if (platform.manualPostingReady === true && hasHandle && hasPasswordRef && platform.twoFactorEnabled === true) return "READY_FOR_DRAFTS";
  return missing.length || !hasHandle || !hasPasswordRef || platform.twoFactorEnabled !== true ? "NEEDS_ACCOUNT_DETAIL_REVIEW" : "READY_FOR_DRAFTS";
}

function loadReadinessConfig() {
  const template = readJson(templatePath, null);
  if (!template) throw new Error(`Missing template: ${templatePath}`);
  const local = readJson(localPath, null);
  const source = local || template;
  return { source, loadedLocal: Boolean(local) };
}

function buildReadinessSummary() {
  const { source, loadedLocal } = loadReadinessConfig();
  const platforms = Array.isArray(source.platforms) ? source.platforms : [];
  const platformSummaries = platforms.map((platform) => ({
    platform: platform.platform,
    statusIntent: platform.statusIntent,
    readinessStatus: classifyPlatform(platform),
    postingMode: platform.postingMode,
    apiPostingPossible: platform.apiPostingPossible,
    apiReadinessStatus: platform.apiReadinessStatus,
    manualPostingReady: platform.manualPostingReady === true,
    missingItems: Array.isArray(platform.missingItems) ? platform.missingItems : [],
    riskWarnings: Array.isArray(platform.riskWarnings) ? platform.riskWarnings : []
  }));

  return {
    generatedAt: new Date().toISOString(),
    templatePath,
    localConfigPresent: loadedLocal,
    containsCredentials: false,
    autoPostingEnabled: false,
    apiPostingEnabled: false,
    activePlatforms,
    deferredPlatforms,
    platformSummaries
  };
}

function writeReadinessReport(summary) {
  ensureDir(path.dirname(reportPath));
  const active = summary.platformSummaries.filter((item) => activePlatforms.includes(item.platform));
  const deferred = summary.platformSummaries.filter((item) => deferredPlatforms.includes(item.platform));
  const activeRows = active.map((item) => `| ${item.platform} | ${item.readinessStatus} | ${item.postingMode} | ${item.manualPostingReady} | ${item.missingItems.join(", ") || "none"} |`).join("\n");
  const deferredRows = deferred.map((item) => `| ${item.platform} | ${item.readinessStatus} | ${item.postingMode} | ${item.missingItems.join(", ") || "deferred"} |`).join("\n");

  const report = `# MarketOps Social Account Readiness v0.1

Generated at: ${summary.generatedAt}

## Scope

This is a local-only readiness check for MarketOps social publishing preparation. No credentials, secrets, tokens, API keys, or platform sessions are stored here. No social auto-posting is enabled.

## Active Platforms

| Platform | Readiness | Posting Mode | Manual Posting Ready | Missing Items |
|---|---|---:|---:|---|
${activeRows}

## Deferred Platforms

| Platform | Readiness | Posting Mode | Missing Items |
|---|---|---|---|
${deferredRows}

## Manual Posting Requirements

- Confirm platform handle/channel.
- Store account credentials only in a password manager or private local secret store.
- Confirm recovery options and two-factor status.
- Review every draft for paper-simulation transparency and not-financial-advice language.
- Export drafts manually; do not auto-post.

## Future API Posting Requirements

- YouTube: Google/YouTube Data API with OAuth review later.
- TikTok: developer app and scopes later.
- Instagram: Meta/Instagram professional account permissions later.
- X: developer app/API access later.

## Credential Reminder

Do not paste passwords, tokens, recovery codes, API keys, OAuth refresh tokens, or private account details into chat, reports, templates, or committed files.

## Recommended Next Steps

1. Fill in non-secret account references in a local ignored file if desired.
2. Confirm manual posting workflow for IG, X, TikTok, and YouTube Shorts.
3. Keep LinkedIn and Facebook deferred.
4. Use the draft publishing checklist before posting anything manually.
`;
  fs.writeFileSync(reportPath, report, "utf8");
}

function runSocialReadinessCheck() {
  const summary = buildReadinessSummary();
  writeReadinessReport(summary);
  console.log("MarketOps social readiness check complete");
  console.log(`active platforms: ${summary.activePlatforms.join(", ")}`);
  console.log(`deferred platforms: ${summary.deferredPlatforms.join(", ")}`);
  summary.platformSummaries.forEach((item) => console.log(`${item.platform}: ${item.readinessStatus}`));
  console.log(`report: ${reportPath}`);
  return summary;
}

if (require.main === module) {
  try {
    runSocialReadinessCheck();
  } catch (error) {
    console.error(`social:check failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { runSocialReadinessCheck, buildReadinessSummary, templatePath, localPath, reportPath, setupDocPath, checklistDocPath, activePlatforms, deferredPlatforms };
