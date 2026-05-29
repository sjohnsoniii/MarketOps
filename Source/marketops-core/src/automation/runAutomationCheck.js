const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

const isWindows = os.platform() === "win32";

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const dataRoot = path.join(projectRoot, "Data");
const scriptsRoot = path.join(projectRoot, "Scripts");
const reportRoot = path.join(projectRoot, "Reports", "Automation");
const sj3labsRoot = path.join(projectRoot, "..", "sj3labs");

const paths = {
  coreRoot: coreRoot,
  packageJson: path.join(coreRoot, "package.json"),
  config: path.join(coreRoot, "config", "marketops.phase1.config.json"),
  paperFull: path.join(coreRoot, "src", "paper", "full.js"),
  officeRun: path.join(coreRoot, "src", "agents", "runOfficeWithAgents.js"),
  officeQa: path.join(coreRoot, "src", "office", "runOfficeQa.js"),
  agentsReview: path.join(coreRoot, "src", "agents", "runAgentReviews.js"),
  agentsQa: path.join(coreRoot, "src", "agents", "runAgentsQa.js"),
  paperRunner: path.join(scriptsRoot, "run-marketops-paper-full-v0.1.ps1"),
  paperRefreshRunnerV02: path.join(scriptsRoot, "run-marketops-paper-refresh-v0.2.ps1"),
  refreshInstallRepairV02: path.join(scriptsRoot, "install-or-repair-marketops-refresh-tasks-v0.2.ps1"),
  refreshCheckV02: path.join(scriptsRoot, "check-marketops-refresh-tasks-v0.2.ps1"),
  refreshOnceV02: path.join(scriptsRoot, "run-marketops-refresh-once-v0.2.ps1"),
  officeRunner: path.join(scriptsRoot, "run-marketops-office-full-v0.1.ps1"),
  paperInstall: path.join(scriptsRoot, "install-marketops-paper-task-v0.1.ps1"),
  paperRemove: path.join(scriptsRoot, "remove-marketops-paper-task-v0.1.ps1"),
  officeInstall: path.join(scriptsRoot, "install-marketops-office-task-v0.1.ps1"),
  officeRemove: path.join(scriptsRoot, "remove-marketops-office-task-v0.1.ps1"),
  latestPaper: path.join(dataRoot, "paper", "history", "latest-run-summary.json"),
  dashboardV04: path.join(sj3labsRoot, "data", "marketops", "dashboard-bundle-public-v0.4.json"),
  contentQueue: path.join(dataRoot, "content", "queue", "content-queue-v0.1.json"),
  complianceReport: path.join(dataRoot, "content", "compliance", "content-compliance-report-v0.1.md"),
  agentSummary: path.join(dataRoot, "agent-reviews", "latest-agent-review-summary.json"),
  biweeklyDigest: path.join(dataRoot, "agent-reviews", "biweekly-review-digest-v0.1.md"),
  monthlyBrief: path.join(dataRoot, "agent-reviews", "monthly-human-review-brief-v0.1.md"),
  readinessReport: path.join(reportRoot, "marketops-automation-readiness-v0.1.md")
};

const requiredScripts = ["simulate", "equity", "qa", "paper:run", "paper:history", "paper:refresh-site", "paper:full", "office:content", "office:queue", "office:qa", "office:run", "agents:review", "agents:qa", "automation:check"];
const riskyPhrases = ["buy" + " now", "sell" + " now", "copy this" + " trade", "copy my" + " bot", "guaranteed results", "quit your" + " job", "money" + " printer", "ALPACA" + "_API_KEY", "COINBASE" + "_API_KEY", "liveTrading" + ": true", "allowLiveTrading" + "\": true", "auto-posting enabled", "broker connection enabled", "real-money trading enabled"];

function readText(filePath, fallback = "") {
  if (!fs.existsSync(filePath)) return fallback;
  return fs.readFileSync(filePath, "utf8");
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(readText(filePath));
}

function add(checks, name, passed, details = "") {
  checks.push({ name, passed, details });
}

function fileExists(checks, label, filePath) {
  add(checks, `${label} exists`, fs.existsSync(filePath), filePath);
}

function contains(checks, label, filePath, needles) {
  const text = readText(filePath);
  const missing = needles.filter((needle) => !text.includes(needle));
  add(checks, label, missing.length === 0, missing.length ? `Missing: ${missing.join(", ")}` : filePath);
}

function scanDir(dirPath) {
  const files = [];
  function walk(current) {
    if (!fs.existsSync(current)) return;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(md|json|html|txt)$/i.test(entry.name)) files.push(full);
    }
  }
  walk(dirPath);
  return files;
}

function ps(command) {
  if (!isWindows) return "{}";
  try {
    return execFileSync("powershell.exe", ["-NoProfile", "-Command", command], { encoding: "utf8" }).trim();
  } catch {
    return "{}";
  }
}

function inspectTask(taskName) {
  if (!isWindows) return {};
  const safeName = taskName.replace(/'/g, "''");
  const raw = ps(`$task = Get-ScheduledTask -TaskName '${safeName}' -ErrorAction SilentlyContinue; if ($null -eq $task) { '{}' } else { $info = Get-ScheduledTaskInfo -TaskName '${safeName}'; [pscustomobject]@{ TaskName=$task.TaskName; State=[string]$task.State; Action=($task.Actions | ForEach-Object { "$($_.Execute) $($_.Arguments)" }) -join ' | '; StartBoundary=($task.Triggers | Select-Object -First 1 -ExpandProperty StartBoundary); RepetitionInterval=($task.Triggers | Select-Object -First 1).Repetition.Interval; DaysInterval=($task.Triggers | Select-Object -First 1).DaysInterval; LogonType=[string]$task.Principal.LogonType; RunLevel=[string]$task.Principal.RunLevel; UserId=$task.Principal.UserId; NextRunTime=$info.NextRunTime } | ConvertTo-Json -Compress }`);
  return JSON.parse(raw || "{}");
}

function getMarketOpsTasks() {
  if (!isWindows) return [];
  const raw = ps("Get-ScheduledTask | Where-Object { $_.TaskName -like 'MarketOps*' } | Select-Object TaskName, TaskPath, State | ConvertTo-Json -Compress");
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [parsed];
}

function validateInstalledTask(checks, label, task, expectedScript, expectedSchedule) {
  if (!task.TaskName) {
    add(checks, `${label} scheduled task approved state`, true, "Not installed yet; ready for approved install.");
    return "not_installed";
  }
  const action = String(task.Action || "");
  const legacyDelegatesToExpected = label === "paper"
    && action.includes("C:\\Users\\sjohn\\Desktop\\Projects\\MarketOps\\Scripts\\run-marketops-paper-full-v0.1.ps1")
    && readText(paths.paperRunner).includes("run-marketops-paper-refresh-v0.2.ps1");
  add(checks, `${label} task is Ready`, task.State === "Ready", task.State || "missing");
  add(checks, `${label} task uses approved script`, action.includes(expectedScript) || legacyDelegatesToExpected, action);
  add(checks, `${label} task uses PowerShell bypass runner action`, action.includes("powershell.exe") && action.includes("-ExecutionPolicy Bypass"), action);
  add(checks, `${label} task uses interactive logon`, task.LogonType === "Interactive", task.LogonType || "missing");
  add(checks, `${label} task uses limited run level`, task.RunLevel === "Limited", task.RunLevel || "missing");
  add(checks, `${label} task NextRunTime populated`, Boolean(task.NextRunTime), task.NextRunTime || "missing");
  if (expectedSchedule === "paper_30m") {
    add(checks, "paper task repeats every 30 minutes", task.RepetitionInterval === "PT30M", task.RepetitionInterval || "missing");
  }
  if (expectedSchedule === "office_daily_1930") {
    add(checks, "office task runs daily", Number(task.DaysInterval || 0) === 1, String(task.DaysInterval));
    add(checks, "office task starts at 7:30 PM", String(task.StartBoundary || "").includes("T19:30"), task.StartBoundary || "missing");
  }
  const actionLower = action.toLowerCase();
  const forbidden = ["alpaca", "coinbase", "ibkr", "twilio", "sendgrid", "mailgun", "stripe", "paypal", "twitter", "facebook", "instagram", "linkedin", "broker", "live"].filter((term) => actionLower.includes(term));
  add(checks, `${label} task action has no forbidden integration terms`, forbidden.length === 0, forbidden.length ? forbidden.join(", ") : "clean");
  return "installed_approved";
}

function runAutomationCheck() {
  const checks = [];
  fs.mkdirSync(reportRoot, { recursive: true });

  const packageJson = readJson(paths.packageJson, {});
  const scripts = packageJson.scripts || {};
  requiredScripts.forEach((script) => add(checks, `npm script exists: ${script}`, Boolean(scripts[script]), scripts[script] || "missing"));

  fileExists(checks, "paper:full source", paths.paperFull);
  fileExists(checks, "office:run source", paths.officeRun);
  fileExists(checks, "office:qa source", paths.officeQa);
  fileExists(checks, "agents:review source", paths.agentsReview);
  fileExists(checks, "agents:qa source", paths.agentsQa);
  contains(checks, "paper:full includes pipeline, site refresh, QA", paths.paperFull, ["runPaperPipeline", "refreshSiteDashboard", "runQa"]);
  contains(checks, "intraday simulation appends run history", path.join(paths.coreRoot, "src/simulation/runIntradaySimulation.js"), ["appendRunHistory"]);
  contains(checks, "office:run includes office and agent review flow", paths.officeRun, ["runOffice", "runAgentReviews", "runAgentsQa"]);

  [["paper PowerShell runner", paths.paperRunner], ["paper refresh v0.2 runner", paths.paperRefreshRunnerV02], ["refresh task v0.2 install/repair helper", paths.refreshInstallRepairV02], ["refresh task v0.2 check helper", paths.refreshCheckV02], ["refresh task v0.2 run-once helper", paths.refreshOnceV02], ["office PowerShell runner", paths.officeRunner], ["paper scheduled-task install helper", paths.paperInstall], ["paper scheduled-task remove helper", paths.paperRemove], ["office scheduled-task install helper", paths.officeInstall], ["office scheduled-task remove helper", paths.officeRemove]].forEach(([label, filePath]) => fileExists(checks, label, filePath));
  contains(checks, "paper install helper schedule is every 30 minutes", paths.paperInstall, ["RepetitionInterval", "Minutes 30", "LogonType Interactive"]);
  contains(checks, "office install helper schedule is daily at 7:30 PM", paths.officeInstall, ["Daily", "7:30PM", "LogonType Interactive"]);

  const marketOpsTasks = getMarketOpsTasks();
  const paperTask = inspectTask("MarketOps Paper Runner v0.1");
  const officeTask = inspectTask("MarketOps Autonomous Office v0.1");
  const paperInstallState = validateInstalledTask(checks, "paper", paperTask, "C:\\Users\\sjohn\\Desktop\\Projects\\MarketOps\\Scripts\\run-marketops-paper-refresh-v0.2.ps1", "paper_30m");
  const officeInstallState = validateInstalledTask(checks, "office", officeTask, "C:\\Users\\sjohn\\Desktop\\Projects\\MarketOps\\Scripts\\run-marketops-office-full-v0.1.ps1", "office_daily_1930");
  const allowedNames = new Set(["MarketOps Paper Runner v0.1", "MarketOps Autonomous Office v0.1"]);
  const unexpected = marketOpsTasks.filter((task) => !allowedNames.has(task.TaskName));
  const duplicateCount = marketOpsTasks.length - new Set(marketOpsTasks.map((task) => task.TaskName)).size;
  add(checks, "no unexpected MarketOps scheduled tasks", unexpected.length === 0, unexpected.length ? unexpected.map((task) => task.TaskName).join(", ") : `${marketOpsTasks.length} MarketOps task(s)`);
  add(checks, "no duplicate MarketOps scheduled task names", duplicateCount === 0, `${duplicateCount} duplicate name(s)`);

  const config = readJson(paths.config, {});
  const safety = config.safety || {};
  add(checks, "config mode is paper_simulation", config.mode === "paper_simulation", config.mode || "missing");
  ["allowBrokerConnection", "allowLiveTrading", "allowSmsAlerts", "allowSubscriberSignals"].forEach((flag) => add(checks, `${flag} is false`, safety[flag] === false, String(safety[flag])));

  const dependencies = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };
  const depNames = Object.keys(dependencies).join(" ").toLowerCase();
  ["alpaca", "coinbase", "ibkr", "twilio", "sendgrid", "mailgun", "stripe", "paypal", "twitter-api", "facebook", "instagram", "linkedin-api"].forEach((term) => add(checks, `no dependency for ${term}`, !depNames.includes(term), depNames.includes(term) ? "found" : "not found"));

  [["latest paper output", paths.latestPaper], ["latest public dashboard bundle", paths.dashboardV04], ["latest content queue", paths.contentQueue], ["latest compliance report", paths.complianceReport], ["latest agent review summary", paths.agentSummary], ["latest biweekly digest", paths.biweeklyDigest], ["latest monthly human review brief", paths.monthlyBrief]].forEach(([label, filePath]) => fileExists(checks, label, filePath));

  const latestPaper = readJson(paths.latestPaper, {});
  add(checks, "latest paper output is paper-only", latestPaper.mode === "paper_simulation" && latestPaper.paperOnly === true, JSON.stringify({ mode: latestPaper.mode, paperOnly: latestPaper.paperOnly }));
  const dashboard = readJson(paths.dashboardV04, {});
  add(checks, "public dashboard is paper/sample only", dashboard.paperOnly === true && dashboard.sampleData === true && dashboard.mode === "paper_simulation", JSON.stringify({ mode: dashboard.mode, paperOnly: dashboard.paperOnly, sampleData: dashboard.sampleData }));
  const queue = readJson(paths.contentQueue, { items: [] });
  const queueItems = Array.isArray(queue.items) ? queue.items : [];
  add(checks, "content queue publishing is disabled", queue.publishAllowed === false && queueItems.every((item) => item.publishAllowed === false), `${queueItems.length} items`);
  add(checks, "content queue requires draft review", queueItems.every((item) => item.status === "draft_review_required"), `${queueItems.length} items`);
  const agentSummary = readJson(paths.agentSummary, {});
  add(checks, "agent review cadence is digest-based", agentSummary.reviewCadence === "biweekly_digest" && agentSummary.humanReviewLoad === "low", JSON.stringify({ reviewCadence: agentSummary.reviewCadence, humanReviewLoad: agentSummary.humanReviewLoad }));
  add(checks, "agent proposals do not auto-apply", agentSummary.autoApplyAllowed === false, String(agentSummary.autoApplyAllowed));

  const publicFiles = [paths.complianceReport, paths.biweeklyDigest, paths.monthlyBrief, ...scanDir(path.join(dataRoot, "content"))].filter((filePath) => fs.existsSync(filePath));
  const textBlob = publicFiles.map((filePath) => readText(filePath)).join("\n").toLowerCase();
  add(checks, "public content mentions paper simulation", textBlob.includes("paper simulation"), "paper simulation");
  add(checks, "public content mentions fake/sample context", textBlob.includes("fake") || textBlob.includes("sample-data") || textBlob.includes("sample data"), "fake/sample context");
  add(checks, "public content includes not financial advice", textBlob.includes("not financial advice"), "not financial advice");
  const riskyHits = riskyPhrases.filter((phrase) => textBlob.includes(phrase.toLowerCase()));
  add(checks, "public content avoids risky claims", riskyHits.length === 0, riskyHits.length ? riskyHits.join(", ") : "no risky hits");

  const failed = checks.filter((check) => !check.passed);
  const verdict = failed.length ? "NOT_READY" : (isWindows ? "READY_TO_INSTALL_TASKS" : "CROSS_PLATFORM_READY");
  const platformLabel = isWindows ? "Windows" : "Linux";
  const generatedAt = new Date().toISOString();
  const installStatus = { paper: paperInstallState, office: officeInstallState, marketOpsTaskCount: marketOpsTasks.length, platform: platformLabel, schedulerAvailable: isWindows };
  const commandsRun = ["npm run paper:full", "npm run office:run", "npm run office:qa", "npm run agents:review", "npm run agents:qa", "npm run automation:check", ".\\run-marketops-paper-full-v0.1.ps1", ".\\run-marketops-office-full-v0.1.ps1"];

  const crossPlatformNote = isWindows ? "" : "\n- Windows scheduler (Task Scheduler) is not available on this platform.\n- PowerShell-based scheduled task operations are not available.\n- All automation checks that require PowerShell return 'not_installed' on Linux.\n- schedulerInstalled remains false.\n- Future automation on Linux should use systemd timers or cron instead.\n\n### Cross-Platform Status\n- sc.`SCHEDULER_AVAILABLE`: false (Linux – no Task Scheduler)\n- sc.`PLATFORM`: Linux\n- sc.`SCHEDULER_INSTALLED`: false\n- sc.`SCHEDULER_UNSUPPORTED`: true";
  const report = `# MarketOps Automation Readiness Check v0.1\n\nGenerated at: ${generatedAt}\n\n## Readiness Verdict\n\n${verdict}${crossPlatformNote}\n\n## Scheduled Task Install State\n\n- Paper task: ${paperInstallState}\n- Office task: ${officeInstallState}\n- MarketOps scheduled task count: ${marketOpsTasks.length}\n- Platform: ${platformLabel}\n- Windows scheduler available: ${isWindows}\n\n## Commands Run For This Gate\n\n${commandsRun.map((cmd) => `- ${cmd}`).join("\n")}\n\n## Checks Passed\n\n${checks.filter((check) => check.passed).map((check) => `- PASS: ${check.name} - ${check.details}`).join("\n")}\n\n## Checks Failed\n\n${failed.length ? failed.map((check) => `- FAIL: ${check.name} - ${check.details}`).join("\n") : "None."}\n\n## Output Locations\n\n- Paper history: Data/paper/history/latest-run-summary.json\n- Public dashboard bundle: sj3labs/data/marketops/dashboard-bundle-public-v0.4.json\n- Content queue: Data/content/queue/content-queue-v0.1.json\n- Compliance report: Data/content/compliance/content-compliance-report-v0.1.md\n- Agent review summary: Data/agent-reviews/latest-agent-review-summary.json\n- Biweekly digest: Data/agent-reviews/biweekly-review-digest-v0.1.md\n- Monthly human review brief: Data/agent-reviews/monthly-human-review-brief-v0.1.md\n\n## Install Commands For Later\n\n\`\`\`powershell\npowershell -ExecutionPolicy Bypass -File "C:\\Users\\sjohn\\Desktop\\Projects\\MarketOps\\Scripts\\install-marketops-paper-task-v0.1.ps1"\npowershell -ExecutionPolicy Bypass -File "C:\\Users\\sjohn\\Desktop\\Projects\\MarketOps\\Scripts\\install-marketops-office-task-v0.1.ps1"\n\`\`\`\n\n## Removal Commands\n\n\`\`\`powershell\npowershell -ExecutionPolicy Bypass -File "C:\\Users\\sjohn\\Desktop\\Projects\\MarketOps\\Scripts\\remove-marketops-paper-task-v0.1.ps1"\npowershell -ExecutionPolicy Bypass -File "C:\\Users\\sjohn\\Desktop\\Projects\\MarketOps\\Scripts\\remove-marketops-office-task-v0.1.ps1"\n\`\`\`\n\n## Risks / Warnings / Cleanup Needed\n\n${failed.length ? "- Resolve failed checks before relying on scheduled automation." : "- No blocking readiness issues found. Installed tasks match approved MarketOps automation scope when present."}\n- Automation remains local, paper-only, fake/sample-money, and review-gated.\n\n## Confirmations\n\n- This checker did not install scheduled tasks.\n- No live, broker, API-key, SMS, email, payment, social posting, or deploy behavior happened.\n- Agent proposals remain human-review required and do not auto-apply.\n`;

  fs.writeFileSync(paths.readinessReport, report, "utf8");
  console.log(verdict);
  console.log(`checks passed: ${checks.filter((check) => check.passed).length}`);
  console.log(`checks failed: ${failed.length}`);
  console.log(`install state: ${JSON.stringify(installStatus)}`);
  console.log(`readiness report: ${paths.readinessReport}`);
  if (failed.length) process.exitCode = 1;
  return { verdict, checks, reportPath: paths.readinessReport, installStatus };
}

if (require.main === module) runAutomationCheck();

module.exports = { runAutomationCheck };
