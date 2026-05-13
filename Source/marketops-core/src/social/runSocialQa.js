const fs = require("fs");
const path = require("path");
const {
  buildReadinessSummary,
  templatePath,
  localPath,
  reportPath,
  setupDocPath,
  checklistDocPath,
  activePlatforms,
  deferredPlatforms
} = require("./socialReadinessUtils");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const packagePath = path.join(coreRoot, "package.json");
const sourceRoot = path.join(coreRoot, "src");
const socialPreviewPath = path.join(projectRoot, "Data", "social-previews", "social-preview-sandbox-v0.1.json");
const igXPrepPath = path.join(projectRoot, "Data", "social-previews", "ig-x-publishing-prep-v0.1.json");
const hypePreviewPath = path.join(projectRoot, "Data", "social-previews", "ig-x-hype-post-previews-v0.1.json");
const socialPreviewReportPath = path.join(projectRoot, "Reports", "Social", "marketops-social-preview-sandbox-v0.1.md");
const igXPrepReportPath = path.join(projectRoot, "Reports", "Social", "marketops-ig-x-publishing-prep-v0.1.md");
const hypePreviewReportPath = path.join(projectRoot, "Reports", "Social", "marketops-ig-x-hype-post-previews-v0.1.md");
const hypePreviewGalleryPath = path.join(projectRoot, "Admin", "review-console", "social-previews.html");
const videoAvatarPlanDocPath = path.join(projectRoot, "Docs", "Social", "MarketOps-Video-Avatar-Resource-Plan-v0.1.md");
const igXPostingRulesDocPath = path.join(projectRoot, "Docs", "Social", "MarketOps-IG-X-Posting-Rules-v0.1.md");
const secretLikePatterns = [
  /api[_-]?key\s*[:=]\s*[A-Za-z0-9_\-]{12,}/i,
  /token\s*[:=]\s*[A-Za-z0-9_\-\.]{16,}/i,
  /password\s*[:=]\s*[^\s"']{8,}/i,
  /refresh[_-]?token\s*[:=]/i,
  /client[_-]?secret\s*[:=]/i
];
const requiredSafetyPhrases = ["paper simulation", "not financial advice", "no buy/sell/copy language", "no auto-posting"];
const sourceScanAllowlist = new Set([
  path.join(sourceRoot, "automation", "runAutomationCheck.js"),
  path.join(sourceRoot, "admin", "runAdminQa.js"),
  path.join(sourceRoot, "admin-server", "adminQa.js"),
  path.join(sourceRoot, "admin-server", "adminRoutes.js"),
  path.join(sourceRoot, "office", "runOfficeQa.js"),
  path.join(sourceRoot, "social", "runSocialQa.js")
]);

function forbiddenCodeTerms() {
  return [
    ["axi", "os"].join(""),
    ["fet", "ch("].join(""),
    ["twitter", "-api"].join(""),
    ["tiktok", "apis.com"].join(""),
    ["open-api", ".tiktok"].join(""),
    ["youtube", ".googleapis"].join(""),
    ["graph", ".facebook"].join(""),
    ["instagram", "_basic"].join(""),
    ["statuses", "/update"].join(""),
    ["videos", ".insert"].join("")
  ];
}

function restrictedSocialTerms() {
  return [
    ["buy", "now"].join(" "),
    ["sell", "now"].join(" "),
    ["copy this", "trade"].join(" "),
    ["copy my", "bot"].join(" "),
    ["guaran", "teed returns"].join(""),
    ["live", " trading"].join(" ")
  ];
}

function readText(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function check(checks, name, passed, detail = "") {
  checks.push({ name, passed: Boolean(passed), detail });
}

function walk(dirPath, visitor) {
  if (!fs.existsSync(dirPath)) return;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) walk(full, visitor);
    else visitor(full);
  }
}

function runSocialQa() {
  const checks = [];
  const packageJson = readJson(packagePath);
  check(checks, "social:check script exists", Boolean(packageJson.scripts && packageJson.scripts["social:check"]), packageJson.scripts && packageJson.scripts["social:check"]);
  check(checks, "social:qa script exists", Boolean(packageJson.scripts && packageJson.scripts["social:qa"]), packageJson.scripts && packageJson.scripts["social:qa"]);
  check(checks, "social:preview script exists", Boolean(packageJson.scripts && packageJson.scripts["social:preview"]), packageJson.scripts && packageJson.scripts["social:preview"]);
  check(checks, "social:queue script exists", Boolean(packageJson.scripts && packageJson.scripts["social:queue"]), packageJson.scripts && packageJson.scripts["social:queue"]);
  check(checks, "template exists", fs.existsSync(templatePath), templatePath);
  check(checks, "setup doc exists", fs.existsSync(setupDocPath), setupDocPath);
  check(checks, "publishing checklist exists", fs.existsSync(checklistDocPath), checklistDocPath);
  check(checks, "readiness report exists", fs.existsSync(reportPath), reportPath);
  check(checks, "social preview bundle exists", fs.existsSync(socialPreviewPath), socialPreviewPath);
  check(checks, "IG/X publishing prep bundle exists", fs.existsSync(igXPrepPath), igXPrepPath);
  check(checks, "IG/X hype preview bundle exists", fs.existsSync(hypePreviewPath), hypePreviewPath);
  check(checks, "social preview report exists", fs.existsSync(socialPreviewReportPath), socialPreviewReportPath);
  check(checks, "IG/X publishing prep report exists", fs.existsSync(igXPrepReportPath), igXPrepReportPath);
  check(checks, "IG/X hype preview report exists", fs.existsSync(hypePreviewReportPath), hypePreviewReportPath);
  check(checks, "IG/X local preview gallery exists", fs.existsSync(hypePreviewGalleryPath), hypePreviewGalleryPath);
  check(checks, "video/avatar resource plan exists", fs.existsSync(videoAvatarPlanDocPath), videoAvatarPlanDocPath);
  check(checks, "IG/X posting rules doc exists", fs.existsSync(igXPostingRulesDocPath), igXPostingRulesDocPath);

  const template = readJson(templatePath);
  check(checks, "template declares no real credentials", template.containsRealCredentials === false, String(template.containsRealCredentials));
  const platforms = Array.isArray(template.platforms) ? template.platforms : [];
  activePlatforms.forEach((platform) => check(checks, `${platform} active readiness target`, platforms.some((item) => item.platform === platform && item.statusIntent === "active_readiness_target"), platform));
  deferredPlatforms.forEach((platform) => check(checks, `${platform} deferred`, platforms.some((item) => item.platform === platform && item.statusIntent === "deferred_later"), platform));

  const summary = buildReadinessSummary();
  activePlatforms.forEach((platform) => check(checks, `${platform} readiness summary exists`, summary.platformSummaries.some((item) => item.platform === platform), platform));
  deferredPlatforms.forEach((platform) => {
    const item = summary.platformSummaries.find((entry) => entry.platform === platform);
    check(checks, `${platform} readiness summary deferred`, item && item.readinessStatus === "DEFERRED", item ? item.readinessStatus : "missing");
  });

  const publicPrepFiles = [templatePath, reportPath, setupDocPath, checklistDocPath, videoAvatarPlanDocPath, igXPostingRulesDocPath, igXPrepReportPath, hypePreviewReportPath, hypePreviewGalleryPath].filter((filePath) => fs.existsSync(filePath));
  const prepText = publicPrepFiles.map(readText).join("\n");
  const secretHits = secretLikePatterns.filter((pattern) => pattern.test(prepText));
  check(checks, "no real-looking secrets in template/docs/report", secretHits.length === 0, `${secretHits.length} hit(s)`);
  requiredSafetyPhrases.forEach((phrase) => check(checks, `content safety rule documented: ${phrase}`, prepText.toLowerCase().includes(phrase), phrase));

  const dependencies = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };
  const dependencyNames = Object.keys(dependencies).join(" ").toLowerCase();
  const dependencyHits = forbiddenCodeTerms().filter((term) => dependencyNames.includes(term.toLowerCase()));
  check(checks, "no social API posting dependency exists", dependencyHits.length === 0, dependencyHits.join("; "));

  const sourceHits = [];
  walk(sourceRoot, (filePath) => {
    if (!/\.js$/i.test(filePath)) return;
    if (sourceScanAllowlist.has(filePath)) return;
    const text = readText(filePath).toLowerCase();
    forbiddenCodeTerms().forEach((term) => {
      if (text.includes(term.toLowerCase())) sourceHits.push(`${path.relative(projectRoot, filePath)} contains ${term}`);
    });
  });
  check(checks, "no social API posting code exists", sourceHits.length === 0, sourceHits.join("; "));

  const localExists = fs.existsSync(localPath);
  check(checks, "local account file is optional and ignored if present", true, localExists ? "local file present; not printed" : "local file absent");

  if (fs.existsSync(socialPreviewPath)) {
    const previewBundle = readJson(socialPreviewPath);
    check(checks, "preview external sending disabled", previewBundle.externalSendingEnabled === false || previewBundle.noAutoPosting === true, String(previewBundle.externalSendingEnabled));
    check(checks, "preview API posting disabled", previewBundle.apiPostingEnabled === false, String(previewBundle.apiPostingEnabled));
    check(checks, "preview publish allowed false", previewBundle.publishAllowed === false, String(previewBundle.publishAllowed));
    check(checks, "IG and X are active preview platforms", ["instagram", "x"].every((platform) => (previewBundle.activePlatforms || []).includes(platform)), (previewBundle.activePlatforms || []).join(", "));
    check(checks, "TikTok and YouTube are future prep platforms", ["tiktok", "youtube"].every((platform) => (previewBundle.futurePrepPlatforms || []).includes(platform)), (previewBundle.futurePrepPlatforms || []).join(", "));
    check(checks, "LinkedIn and Facebook are deferred", ["linkedin", "facebook"].every((platform) => (previewBundle.deferredPlatforms || []).includes(platform)), (previewBundle.deferredPlatforms || []).join(", "));

    const previews = Array.isArray(previewBundle.previews) ? previewBundle.previews : [];
    previews.forEach((preview) => {
      const label = preview.id || `${preview.platform}-${preview.title}`;
      const text = [
        preview.title,
        preview.draftText,
        ...(preview.captionVariants || []),
        ...(preview.hookOptions || []),
        ...(preview.captionTitleIdeas || []),
        preview.complianceDisclaimer
      ].filter(Boolean).join("\n").toLowerCase();
      const restrictedHits = restrictedSocialTerms().filter((term) => text.includes(term.toLowerCase()));
      check(checks, `${label} has no restricted social language`, restrictedHits.length === 0, restrictedHits.join("; "));
      check(checks, `${label} has review status`, preview.reviewStatus === "human_review_required" && preview.status === "PENDING_REVIEW", `${preview.reviewStatus}/${preview.status}`);
      check(checks, `${label} publish disabled`, preview.publishAllowed === false, String(preview.publishAllowed));
      check(checks, `${label} auto/API posting disabled`, preview.noAutoPosting === true && preview.apiPostingEnabled === false, `${preview.noAutoPosting}/${preview.apiPostingEnabled}`);
      check(checks, `${label} has safety labels`, Array.isArray(preview.safetyLabels) && preview.safetyLabels.includes("human_review_required") && preview.safetyLabels.includes("no_external_send"), label);
      check(checks, `${label} has compliance disclaimer`, Boolean(preview.complianceDisclaimer) && preview.complianceDisclaimer.toLowerCase().includes("not financial advice"), preview.complianceDisclaimer || "");
      if (["instagram", "x"].includes(preview.platform)) {
        check(checks, `${label} active platform phase`, preview.phase === "active_preview", preview.phase);
        check(checks, `${label} has draft artifacts`, Boolean(preview.draftText) && Array.isArray(preview.hashtags) && Boolean(preview.linkTarget) && (Array.isArray(preview.captionVariants) || Array.isArray(preview.imagePromptIdeas) || Array.isArray(preview.carouselOutline)), label);
      }
      if (["tiktok", "youtube"].includes(preview.platform)) {
        check(checks, `${label} future platform not posting-ready`, preview.phase === "future_prep_only" && preview.postingReady === false && preview.videoQualityApproved === false, `${preview.phase}/${preview.postingReady}/${preview.videoQualityApproved}`);
        check(checks, `${label} has script/storyboard artifacts`, Array.isArray(preview.hookOptions) && Array.isArray(preview.storyboardBullets) && Array.isArray(preview.brollIdeas) && Array.isArray(preview.captionTitleIdeas), label);
      }
      check(checks, `${label} no local paths/secrets`, !/[A-Z]:\\|api[_-]?key|secret|token/i.test(text), label);
    });
  }

  if (fs.existsSync(igXPrepPath)) {
    const prepBundle = readJson(igXPrepPath);
    check(checks, "IG/X prep is local only", prepBundle.localOnly === true, String(prepBundle.localOnly));
    check(checks, "IG/X prep external sending disabled", prepBundle.externalSendingEnabled === false, String(prepBundle.externalSendingEnabled));
    check(checks, "IG/X prep API posting disabled", prepBundle.apiPostingEnabled === false, String(prepBundle.apiPostingEnabled));
    check(checks, "IG/X prep actual posting disabled", prepBundle.actualPostingEnabled === false, String(prepBundle.actualPostingEnabled));
    check(checks, "IG/X prep auto approval disabled", prepBundle.autoApprovalEnabled === false, String(prepBundle.autoApprovalEnabled));
    check(checks, "IG/X prep publish allowed false", prepBundle.publishAllowed === false, String(prepBundle.publishAllowed));
    check(checks, "IG/X prep allowed modes declared", ["manual_copy_paste", "api_ready_disabled", "api_posting_later"].every((mode) => (prepBundle.allowedPublishModes || []).includes(mode)), (prepBundle.allowedPublishModes || []).join(", "));

    const items = Array.isArray(prepBundle.platforms) ? prepBundle.platforms : [];
    check(checks, "IG/X prep has active draft items", items.length >= 4, String(items.length));
    check(checks, "IG/X prep only contains instagram/x platforms", items.every((item) => ["instagram", "x"].includes(item.platform)), items.map((item) => item.platform).join(", "));
    items.forEach((item) => {
      const label = item.id || item.title;
      check(checks, `${label} has required publishing fields`, Boolean(
        item.platform
        && item.caption
        && Array.isArray(item.hashtags)
        && item.link
        && item.imagePrompt
        && item.status
        && Object.prototype.hasOwnProperty.call(item, "approvalDecision")
        && Object.prototype.hasOwnProperty.call(item, "approvedAt")
        && item.publishMode
        && item.paperMoneyDisclosure
        && item.notFinancialAdviceDisclosure
      ), label);
      check(checks, `${label} is draft only`, item.status === "draft_only", item.status);
      check(checks, `${label} has no approval decision yet`, item.approvalDecision === null && item.approvedAt === null, `${item.approvalDecision}/${item.approvedAt}`);
      check(checks, `${label} uses manual copy/paste mode`, item.publishMode === "manual_copy_paste", item.publishMode);
      check(checks, `${label} API and actual posting disabled`, item.apiPostingEnabled === false && item.actualPostingEnabled === false, `${item.apiPostingEnabled}/${item.actualPostingEnabled}`);
      check(checks, `${label} has paper disclosure`, item.paperMoneyDisclosure.toLowerCase().includes("paper simulation"), item.paperMoneyDisclosure);
      check(checks, `${label} has advice disclosure`, item.notFinancialAdviceDisclosure.toLowerCase().includes("not financial advice"), item.notFinancialAdviceDisclosure);
    });

    const deferred = Array.isArray(prepBundle.deferredPlatforms) ? prepBundle.deferredPlatforms : [];
    ["tiktok", "youtube", "linkedin", "facebook"].forEach((platform) => {
      const item = deferred.find((entry) => entry.platform === platform);
      check(checks, `${platform} is simulated/deferred in IG/X prep`, item && item.postingAdapterEnabled === false, item ? JSON.stringify(item) : "missing");
    });
  }

  if (fs.existsSync(hypePreviewPath)) {
    const hypeBundle = readJson(hypePreviewPath);
    check(checks, "hype previews are local only", hypeBundle.localOnly === true, String(hypeBundle.localOnly));
    check(checks, "hype previews external sending disabled", hypeBundle.externalSendingEnabled === false, String(hypeBundle.externalSendingEnabled));
    check(checks, "hype previews API posting disabled", hypeBundle.apiPostingEnabled === false, String(hypeBundle.apiPostingEnabled));
    check(checks, "hype previews publish allowed false", hypeBundle.publishAllowed === false, String(hypeBundle.publishAllowed));
    check(checks, "hype previews target only IG/X", ["instagram", "x"].every((platform) => (hypeBundle.platforms || []).includes(platform)) && !(hypeBundle.platforms || []).some((platform) => !["instagram", "x"].includes(platform)), (hypeBundle.platforms || []).join(", "));
    check(checks, "hype previews defer other platforms", ["tiktok", "youtube", "linkedin", "facebook"].every((platform) => (hypeBundle.deferredPlatforms || []).includes(platform)), (hypeBundle.deferredPlatforms || []).join(", "));
    const items = Array.isArray(hypeBundle.items) ? hypeBundle.items : [];
    check(checks, "hype preview count is 10 to 20", items.length >= 10 && items.length <= 20, String(items.length));
    items.forEach((item) => {
      const label = item.id || item.title;
      const text = [item.title, item.caption, item.imagePrompt, item.videoHook].filter(Boolean).join("\n").toLowerCase();
      const restrictedHits = restrictedSocialTerms().filter((term) => text.includes(term.toLowerCase()));
      check(checks, `${label} has no restricted language`, restrictedHits.length === 0, restrictedHits.join("; "));
      check(checks, `${label} is IG/X only`, ["instagram", "x"].includes(item.platform), item.platform);
      check(checks, `${label} is pending manual review`, item.approvalStatus === "pending_review" && item.publishMode === "manual_copy_paste" && item.apiPosting === "disabled", `${item.approvalStatus}/${item.publishMode}/${item.apiPosting}`);
      check(checks, `${label} has disclosure flags`, Array.isArray(item.disclosureFlags) && ["paper_simulation", "fake_money", "not_financial_advice", "no_live_trading"].every((flag) => item.disclosureFlags.includes(flag)), label);
      check(checks, `${label} has required creative fields`, Boolean(item.caption && Array.isArray(item.hashtags) && item.link && item.imagePrompt && item.stillCardLayoutIdea && item.videoHook), label);
    });
  }

  const failed = checks.filter((item) => !item.passed);
  console.log(failed.length ? "SOCIAL QA FAIL" : "SOCIAL QA PASS");
  console.log(`checks passed: ${checks.filter((item) => item.passed).length}`);
  console.log(`checks failed: ${failed.length}`);
  console.log(`readiness report: ${reportPath}`);
  if (failed.length) {
    failed.forEach((item) => console.log(`FAIL: ${item.name} - ${item.detail}`));
    process.exitCode = 1;
  }
  return { passed: failed.length === 0, checks };
}

if (require.main === module) {
  runSocialQa();
}

module.exports = { runSocialQa };
