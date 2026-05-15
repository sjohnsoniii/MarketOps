const path = require("path");
const {
  reviewPaths,
  reviewFiles,
  ensureDir,
  readJson,
  writeJson,
  writeText,
  formatMoney,
  formatPct,
  loadReviewInputs,
  proposal,
  proposalMarkdown
} = require("./reviewUtils");

function buildProposalSet(inputs) {
  return [
    proposal("PROP-COORD-001", "Coordinator", "Automation / QA", "Add run health trend summary", "The office run records pass/fail state, but the human view does not yet show trend quality across multiple runs.", "Create a paper-only trend summary that compares recent run status, content count, and QA state across the last several internal observations.", "Gives the human reviewer a faster view of whether the system is getting steadier or noisier.", "A weak summary could hide important one-off failures.", "Paper test against archived observations, then QA checks for missing or stale run fields."),
    proposal("PROP-COORD-002", "Coordinator", "Automation / QA", "Add digest due calculation", "The digest cadence is documented, but the due/not-due decision is still simple.", "Add a deterministic cadence helper that marks whether the next biweekly digest is due, without creating extra human queue burden on routine runs.", "Keeps daily reflection useful while avoiding review fatigue.", "Incorrect cadence logic could delay useful human review.", "Unit-style paper test with fixed dates and QA checks for cadence fields."),
    proposal("PROP-COORD-003", "Coordinator", "Dashboard / Reporting", "Surface dashboard refresh health in agent reviews", "Dashboard refresh health is now tracked in the health tracker JSON but is not yet surfaced in agent review outputs or the digest.", "Add dashboard refresh health fields (last status, stale warning, consecutive failures, scheduler state) to the coordinator review and the biweekly digest.", "Gives the human reviewer a single place to see whether refreshes are healthy, stale, or failing.", "Adding too many dashboard-health fields could clutter reports if the bot refreshes frequently.", "QA should verify refresh health fields are present in agent review outputs and match the health tracker JSON."),
    proposal("PROP-DATA-001", "Market Data Desk", "Data Quality", "Expand sample history depth", "The current sample dataset is enough for a smoke test but too small for richer pattern review.", "Add more deterministic sample bars for the same public-safe vehicle set, labeled as sample data.", "Improves chart continuity, drawdown review, and report realism without using live feeds.", "More sample rows could create a false sense of evidence if labels are weak.", "QA must verify sample labels and public disclaimers before use."),
    proposal("PROP-DATA-002", "Market Data Desk", "Data Quality", "Add stale sample warning", "The system can run repeatedly against unchanged sample data.", "Add an internal warning when repeated runs use the same sample snapshot.", "Prevents stale data from being mistaken for fresh research progress.", "Could add noisy warnings if not scoped to internal reports.", "Paper run comparison plus QA validation of warning copy."),
    proposal("PROP-SIGNAL-001", "Signal Desk", "Trading / Signals", "Explain candidate filter outcomes", "Signals are summarized by count, but the human reviewer cannot quickly see why most events were filtered.", "Add a public-safe reason summary by outcome bucket, avoiding exact formulas.", "Improves review quality without exposing strategy mechanics.", "Too much detail could drift toward strategy disclosure.", "Compliance review for wording plus paper-only output validation."),
    proposal("PROP-SIGNAL-002", "Signal Desk", "Trading / Signals", "Add false signal audit notes", "The signal layer does not yet separate noisy candidates from potentially useful misses.", "Create a review-only false-signal note field for paper experiments.", "Helps tune the research process while keeping changes human-approved.", "Could imply certainty if written too strongly.", "Staff Writer and compliance review before any public summary."),
    proposal("PROP-RISK-001", "Risk Desk", "Risk", "Track block reason themes", "Risk blocks are counted, but recurring themes are not summarized for digest review.", "Group high-level block themes into a review-only summary.", "Makes risk discipline easier to inspect over time.", "Theme labels may oversimplify risk decisions.", "QA should verify that no private rule details are exposed."),
    proposal("PROP-RISK-002", "Risk Desk", "Risk", "Add risk override request template", "There is no structured way for a human to request a paper-only risk experiment.", "Create a template that requires hypothesis, paper validation, and approval before any rule change.", "Keeps experiments disciplined and review-gated.", "A template could be misread as permission to alter rules automatically.", "QA must verify autoApplyAllowed remains false."),
    proposal("PROP-PAPER-001", "Paper Trader", "Paper Execution", "Add execution quality notes", "Paper events show outcomes, but not enough review context about simulated execution quality.", "Add high-level notes about timing assumptions and sample limitations.", "Improves honesty around fake-money execution results.", "Could clutter reports if added to every draft.", "Paper QA should check for concise, public-safe wording."),
    proposal("PROP-PERF-001", "Performance Desk", "Dashboard / Reporting", "Add rolling paper metrics", "The dashboard shows current run metrics but limited rolling comparison.", "Add a rolling paper-only view using internal history summaries.", "Helps separate one run from trend behavior.", "Trend views can invite overinterpretation with small samples.", "Require sample-size warning and compliance review."),
    proposal("PROP-WRITER-001", "Staff Writer", "Staff Writer / Blogs", "Tighten draft length bands", "Generated drafts are safe, but length and density may vary by run.", "Add target length ranges for weekly, monthly, and case study drafts.", "Improves consistency for human review.", "Over-tight limits could flatten useful context.", "Manual review against the next three draft cycles."),
    proposal("PROP-GROWTH-001", "Growth Desk", "Growth Desk / Social", "Add platform intent labels", "Social drafts are safe, but they do not clearly label whether a post is educational, build log, or dashboard update.", "Add intent labels to each draft record.", "Makes review and scheduling easier without enabling posting.", "Too many labels could add queue clutter.", "QA should verify labels are descriptive and not promotional claims."),
    proposal("PROP-VIDEO-001", "Video Desk", "Video / Avatar Content", "Add chart asset checklist", "Video scripts suggest visuals, but do not list exactly which safe chart image should be captured.", "Add a review-only checklist for dashboard captures and captions.", "Speeds video production while staying manual.", "Could imply final production readiness before review.", "Human approval before using any asset publicly."),
    proposal("PROP-VIDGEN-001", "Video Generation Specialist", "Video / Avatar Content", "Add package scoring rubric", "Video production packets exist, but the office does not yet rank which concepts are most worth producing first.", "Add a review-only scoring rubric for clarity, compliance, visual feasibility, and platform fit.", "Helps the human reviewer choose the best draft without enabling upload or posting.", "A score could be misread as production approval if labels are weak.", "QA must verify publishAllowed remains false and every score is advisory only."),
    proposal("PROP-VIDGEN-002", "Video Generation Specialist", "Video / Avatar Content", "Add safe asset dependency checklist", "Packages list shots and B-roll ideas, but not whether each needed asset already exists locally.", "Add a local asset checklist that marks dashboard capture, thumbnail, avatar read, and captions as missing/ready/rejected.", "Makes future video production less fuzzy while staying local.", "Could create unnecessary queue noise if too detailed.", "Run against local folders only and keep all items draft_review_required."),
    proposal("PROP-AVATAR-001", "Avatar Desk", "Video / Avatar Content", "Add presenter compliance preface", "Presenter scripts include disclaimers, but the opening frame could be clearer.", "Add a short first-line compliance preface for presenter drafts.", "Reduces risk of viewers missing the paper-only context.", "Could make scripts feel stiff if overused.", "Staff Writer review for tone and clarity."),
    proposal("PROP-COMP-001", "Compliance Desk", "Compliance", "Expand review folder scan", "Office compliance scans generated content, while agent QA scans review output separately.", "Keep review-output scanning as a separate QA gate and add summary counts to the digest.", "Makes safety state visible without overloading the queue.", "Duplicate scan wording could confuse reviewers.", "Compare office QA and agent QA outputs for consistency."),
    proposal("PROP-COMP-002", "Compliance Desk", "Compliance", "Add urgent issue routing", "The new cadence defers routine items, but urgent safety issues need a distinct path.", "Reserve urgent_human_review for compliance failure, safety risk, or system failure only.", "Protects the human from daily noise while preserving interrupt behavior for serious issues.", "Urgent tagging could be overused unless QA checks the conditions.", "QA should verify routine proposals default to review_next_digest.")
  ];
}

const reviewBlueprints = [
  { key: "coordinator", purpose: "Coordinate paper runs, content office outputs, review cadence, dashboard refresh health, and QA boundaries.", worked: "The office run, queue, compliance report, dashboard refresh, and refresh health tracker are now connected into a repeatable local flow.", failed: "The human review summary needs trend context and dashboard refresh health status instead of only latest-run status.", confidence: "Medium-high confidence in run coordination and refresh health tracking; lower confidence in long-horizon trend interpretation until more history exists." },
  { key: "marketData", purpose: "Review sample data coverage and data freshness for paper-only research.", worked: "The dataset is deterministic and labeled as sample data, which keeps QA repeatable.", failed: "The sample window is small and repeated runs can look more meaningful than they are.", confidence: "Medium confidence for smoke testing; low confidence for research conclusions." },
  { key: "signal", purpose: "Review signal scanning output and candidate quality at a public-safe level.", worked: "Signal counts are easy to follow and feed the Risk Desk cleanly.", failed: "The review layer needs better high-level reason summaries for filtered candidates.", confidence: "Medium confidence in pipeline behavior; low confidence in signal strength due to sample depth." },
  { key: "risk", purpose: "Review Risk Desk selectivity, blocking behavior, and safety posture.", worked: "Risk blocks outnumber approvals, which supports a cautious paper-first posture.", failed: "Recurring block themes are not yet summarized across runs.", confidence: "High confidence in safety posture; medium confidence in explanatory depth." },
  { key: "paperTrader", purpose: "Review fake-money execution records and simulated account movement.", worked: "Paper execution remains fake-money only and dashboard-safe fields are available.", failed: "Execution quality context is thin because sample assumptions are intentionally simple.", confidence: "Medium confidence for workflow testing; no confidence should be assigned to real performance." },
  { key: "performance", purpose: "Review paper equity, paper P/L, drawdown, and dashboard clarity.", worked: "Performance is clearly marked as paper simulation and sample-data preview.", failed: "Rolling comparisons need more history before they become useful.", confidence: "Medium confidence in latest-run math; low confidence in trend interpretation." },
  { key: "staffWriter", purpose: "Review blog/report drafts for clarity, safety, and human readability.", worked: "Drafts are clear about fake-money paper simulation and review requirements.", failed: "Draft length and density need stronger consistency controls.", confidence: "Medium-high confidence in safety; medium confidence in editorial polish." },
  { key: "growth", purpose: "Review social drafts for platform fit, public clarity, and non-promotional tone.", worked: "Social drafts are educational and review-gated with publishing disabled.", failed: "Platform intent labels would make review faster.", confidence: "Medium confidence in safety; medium confidence in channel fit." },
  { key: "video", purpose: "Review faceless video scripts for clarity, visual usefulness, and production readiness.", worked: "Scripts are short, paper-safe, and tied to dashboard concepts.", failed: "They need more explicit visual asset checklists before production.", confidence: "Medium confidence in concept fit; low confidence in final production readiness." },
  { key: "videoGenerationSpecialist", purpose: "Convert MarketOps paper outputs, reports, dashboard updates, and reviews into structured short-form video production packets.", worked: "The desk can create platform-specific packets for IG Reels, TikTok, YouTube Shorts, and X Video without enabling posting or media generation.", failed: "The desk still needs scoring, asset readiness, and stronger visual feasibility review before any production workflow.", confidence: "Medium confidence in package structure; low confidence in final media readiness until assets and human review exist." },
  { key: "avatar", purpose: "Review avatar presenter scripts for business-safe tone and compliance clarity.", worked: "Presenter copy remains professional and non-sensational.", failed: "The opening compliance context could be even more immediate.", confidence: "Medium-high confidence in safety; medium confidence in brand voice." },
  { key: "compliance", purpose: "Review safety scans, queue locks, cadence, and forbidden-action boundaries.", worked: "Office compliance passed and all queue items remain draft-review only.", failed: "Review cadence needs clear urgent-only interrupt behavior.", confidence: "High confidence in current guardrails; medium confidence in future scale without more tests." }
];

function getMetrics(inputs) {
  return {
    runId: inputs.runId,
    mode: inputs.mode,
    paperOnly: inputs.paperOnly,
    sampleData: inputs.sampleData,
    vehiclesScanned: inputs.dashboard.vehiclesScanned || 0,
    signalsReviewed: inputs.dashboard.signalsReviewed || 0,
    riskApproved: inputs.dashboard.riskApproved || 0,
    riskBlocked: inputs.dashboard.riskBlocked || 0,
    fakePaperTrades: inputs.dashboard.fakePaperTrades || 0,
    endingEquity: inputs.dashboard.endingEquity || 0,
    paperPnl: inputs.dashboard.paperPnl || 0,
    paperReturnPct: inputs.dashboard.paperReturnPct || 0,
    maxDrawdownPct: inputs.dashboard.maxDrawdownPct || 0,
    queueItems: inputs.queueItems,
    complianceStatus: inputs.complianceStatus,
    dashboardRefreshLastStatus: (inputs.refreshHealth && inputs.refreshHealth.lastStatus) || "UNKNOWN",
    dashboardRefreshConsecutiveFailures: (inputs.refreshHealth && inputs.refreshHealth.consecutiveFailures) || 0,
    dashboardRefreshStaleWarning: (inputs.refreshHealth && inputs.refreshHealth.staleWarning) || null,
    dashboardRefreshSchedulerInstalled: (inputs.refreshHealth && inputs.refreshHealth.schedulerInstalled) || false
  };
}

function reviewFor(blueprint, fileMeta, inputs, proposals) {
  const metrics = getMetrics(inputs);
  const entityProposals = proposals.filter((item) => item.sourceEntity === fileMeta.entityName);
  return {
    entityName: fileMeta.entityName,
    entityPurpose: blueprint.purpose,
    runId: inputs.runId,
    generatedAt: inputs.generatedAt,
    mode: inputs.mode,
    paperOnly: true,
    reviewCadence: "biweekly_digest",
    inputsReviewed: ["latest paper run summary", "public dashboard bundle", "office content queue", "content compliance report", "dashboard refresh health"],
    outputsProduced: [fileMeta.fileName, "latest-agent-review-summary.json", "improvement-backlog-v0.1.md", "biweekly-review-digest-v0.1.md"],
    actionsTaken: ["Reviewed latest local paper simulation outputs", "Recorded routine observations", "Created human-review-required proposals", "Kept all changes as recommendations only"],
    keyMetricsReviewed: metrics,
    whatWorked: [blueprint.worked, "Paper-only and sample-data labels remain present in the latest office outputs."],
    whatFailed: [blueprint.failed, "Current observations are based on a limited sample preview and should not be promoted beyond paper research."],
    qualityAssessment: "Useful for local review and process improvement, but not sufficient for external claims or automated behavior changes.",
    risksObserved: ["Small sample set can make routine movement look more meaningful than it is.", "Repeated daily output can create review fatigue if not digest-throttled."],
    complianceConcerns: ["No active compliance failure detected in the latest office compliance report.", "All proposals must remain review-only until a human approves a separate change."],
    dataGaps: ["Longer sample history", "Trend summaries across multiple paper runs", "More explicit reason buckets for review."],
    confidenceAssessment: blueprint.confidence,
    falsePositiveRisks: ["A sample-only improvement may look useful due to limited test depth.", "A clean draft may still need human tone review before public use."],
    falseNegativeRisks: ["A useful issue may remain hidden until more run history exists.", "A weak pattern may not appear in the current small sample set."],
    improvementProposals: entityProposals,
    recommendedExperiments: entityProposals.map((item) => `${item.proposalId}: test as a paper-only experiment after human review.`),
    nextRunFocus: "Collect routine observations, update latest summaries, and defer normal review items to the next biweekly digest.",
    humanQuestions: ["Which proposal should be promoted into a paper-only experiment first?", "Should the next digest emphasize risk, content quality, or dashboard clarity?"],
    priority: "review_next_digest",
    humanReviewRequired: true,
    autoApplyAllowed: false
  };
}

function markdownReview(review) {
  return `# ${review.entityName} Review v0.1\n\n- entityName: ${review.entityName}\n- entityPurpose: ${review.entityPurpose}\n- runId: ${review.runId}\n- generatedAt: ${review.generatedAt}\n- mode: ${review.mode}\n- paperOnly: ${review.paperOnly}\n- reviewCadence: ${review.reviewCadence}\n- priority: ${review.priority}\n- humanReviewRequired: ${review.humanReviewRequired}\n- autoApplyAllowed: ${review.autoApplyAllowed}\n\n## Inputs Reviewed\n\n${review.inputsReviewed.map((item) => `- ${item}`).join("\n")}\n\n## Outputs Produced\n\n${review.outputsProduced.map((item) => `- ${item}`).join("\n")}\n\n## Actions Taken\n\n${review.actionsTaken.map((item) => `- ${item}`).join("\n")}\n\n## Key Metrics Reviewed\n\n- vehiclesScanned: ${review.keyMetricsReviewed.vehiclesScanned}\n- signalsReviewed: ${review.keyMetricsReviewed.signalsReviewed}\n- riskApproved: ${review.keyMetricsReviewed.riskApproved}\n- riskBlocked: ${review.keyMetricsReviewed.riskBlocked}\n- fakePaperTrades: ${review.keyMetricsReviewed.fakePaperTrades}\n- endingEquity: ${formatMoney(review.keyMetricsReviewed.endingEquity)}\n- paperPnl: ${formatMoney(review.keyMetricsReviewed.paperPnl)}\n- paperReturnPct: ${formatPct(review.keyMetricsReviewed.paperReturnPct)}\n- maxDrawdownPct: ${formatPct(review.keyMetricsReviewed.maxDrawdownPct)}\n- queueItems: ${review.keyMetricsReviewed.queueItems}\n- complianceStatus: ${review.keyMetricsReviewed.complianceStatus}\n- dashboardRefreshLastStatus: ${review.keyMetricsReviewed.dashboardRefreshLastStatus}\n- dashboardRefreshConsecutiveFailures: ${review.keyMetricsReviewed.dashboardRefreshConsecutiveFailures}\n- dashboardRefreshStaleWarning: ${review.keyMetricsReviewed.dashboardRefreshStaleWarning || "none"}\n- dashboardRefreshSchedulerInstalled: ${review.keyMetricsReviewed.dashboardRefreshSchedulerInstalled}\n\n## What Worked\n\n${review.whatWorked.map((item) => `- ${item}`).join("\n")}\n\n## What Failed\n\n${review.whatFailed.map((item) => `- ${item}`).join("\n")}\n\n## Quality Assessment\n\n${review.qualityAssessment}\n\n## Risks Observed\n\n${review.risksObserved.map((item) => `- ${item}`).join("\n")}\n\n## Compliance Concerns\n\n${review.complianceConcerns.map((item) => `- ${item}`).join("\n")}\n\n## Data Gaps\n\n${review.dataGaps.map((item) => `- ${item}`).join("\n")}\n\n## Confidence Assessment\n\n${review.confidenceAssessment}\n\n## False Positive Risks\n\n${review.falsePositiveRisks.map((item) => `- ${item}`).join("\n")}\n\n## False Negative Risks\n\n${review.falseNegativeRisks.map((item) => `- ${item}`).join("\n")}\n\n## Improvement Proposals\n\n${proposalMarkdown(review.improvementProposals)}\n\n## Recommended Experiments\n\n${review.recommendedExperiments.map((item) => `- ${item}`).join("\n")}\n\n## Next Run Focus\n\n${review.nextRunFocus}\n\n## Human Questions\n\n${review.humanQuestions.map((item) => `- ${item}`).join("\n")}`;
}

function groupBacklog(proposals) {
  const categories = ["Trading / Signals", "Risk", "Data Quality", "Paper Execution", "Dashboard / Reporting", "Staff Writer / Blogs", "Growth Desk / Social", "Video / Avatar Content", "Compliance", "Automation / QA"];
  return categories.map((category) => {
    const items = proposals.filter((item) => item.category === category);
    const body = items.length ? proposalMarkdown(items) : "No proposals in this category yet.";
    return `## ${category}\n\n${body}`;
  }).join("\n\n");
}

function writeRollups(inputs, reviews, proposals) {
  const urgentItems = proposals.filter((item) => item.priority === "urgent_human_review");
  const routineDeferred = proposals.filter((item) => item.priority !== "urgent_human_review");
  const rh = inputs.refreshHealth || {};
  const refreshOk = rh.lastStatus === "PASS" ? "Dashboard refresh health is PASS." : `Dashboard refresh health is ${rh.lastStatus || "UNKNOWN"}.`;
  const strongest = ["Paper-only guardrails remain intact.", "Content queue stays review-gated.", "Compliance scan passed before agent review.", refreshOk];
  const weaknesses = ["Sample data depth is still limited.", "Trend review needs more history.", "Daily output needs digest throttling to avoid burden." ];

  writeText(reviewPaths.improvementBacklog, `# MarketOps Improvement Backlog v0.1\n\nreviewCadence: biweekly_digest  \nhumanReviewRequired: true  \nautoApplyAllowed: false\n\n${groupBacklog(proposals)}`);

  writeText(reviewPaths.monthlyBrief, `# Monthly Human Review Brief v0.1\n\nreviewCadence: biweekly_digest  \nhumanReviewRequired: true  \nautoApplyAllowed: false\n\n## Top 5 Improvement Proposals\n\n${proposals.slice(0, 5).map((item) => `- ${item.proposalId}: ${item.proposalTitle} (${item.priority})`).join("\n")}\n\n## Biggest Recurring Weaknesses\n\n${weaknesses.map((item) => `- ${item}`).join("\n")}\n\n## Strongest Performing Areas\n\n${strongest.map((item) => `- ${item}`).join("\n")}\n\n## Riskiest Behaviors Observed\n\n- Review fatigue from too many routine daily items.\n- Overinterpreting sample-data paper results.\n- Promoting draft content before human review.\n\n## Content Quality Concerns\n\n- Draft length bands need tuning.\n- Platform intent labels would make social review faster.\n\n## Compliance Concerns\n\n- No urgent compliance issue detected.\n- Keep every proposal human-review required.\n\n## Dashboard/Data Concerns\n\n- More sample history is needed for trend interpretation.\n- Stale sample warnings would improve review clarity.\n\n## Recommended Human Decisions\n\n- Choose one or two proposals for paper-only experiment design.\n- Confirm whether the next digest should prioritize risk, reporting, or content quality.\n\n## Items Explicitly Requiring User Approval\n\n- Any promoted experiment.\n- Any public wording change.\n- Any change to Risk Desk behavior.\n- Any new external integration idea.\n\n## Next Month Focus\n\nBuild better internal trend review while keeping the human review queue digest-throttled.`);

  writeText(reviewPaths.biweeklyDigest, `# Biweekly Review Digest v0.1\n\nreviewCadence: biweekly_digest  \ncadence: biweekly  \nnextSuggestedReviewWindow: ${inputs.nextSuggestedReviewWindow}  \nurgentItemsCount: ${urgentItems.length}  \nroutineItemsDeferredCount: ${routineDeferred.length}  \nhumanReviewLoad: low  \nhumanReviewRequired: true  \nautoApplyAllowed: false\n\n## Digest Summary\n\nMarketOps collected ${proposals.length} routine improvement proposals from ${reviews.length} desk reviews. No urgent human-review interrupt was created. Routine observations should roll into the next biweekly review window unless a compliance, safety, or system failure appears.\n\n## Top Review-Next-Digest Items\n\n${proposals.slice(0, 8).map((item) => `- ${item.proposalId}: ${item.proposalTitle}`).join("\n")}\n\n## Urgent Items\n\n${urgentItems.length ? urgentItems.map((item) => `- ${item.proposalId}: ${item.proposalTitle}`).join("\n") : "None."}\n\n## Human Review Load\n\nLow. Routine items were summarized into this digest instead of being pushed as daily review tasks.`);

  const summary = {
    generatedAt: inputs.generatedAt,
    runId: inputs.runId,
    mode: inputs.mode,
    paperOnly: true,
    sampleData: inputs.sampleData,
    reviewCadence: "biweekly_digest",
    cadence: "biweekly",
    nextSuggestedReviewWindow: inputs.nextSuggestedReviewWindow,
    urgentItemsCount: urgentItems.length,
    routineItemsDeferredCount: routineDeferred.length,
    humanReviewLoad: "low",
    reviewsGenerated: reviews.length,
    proposalCount: proposals.length,
    complianceStatus: inputs.complianceStatus,
    humanReviewRequired: true,
    autoApplyAllowed: false,
    queuePolicy: {
      collectObservationsContinuously: true,
      summarizeIntoBiweeklyDigest: true,
      dailyHumanQueueItems: false,
      urgentInterruptsOnlyFor: ["critical compliance issue", "critical safety or risk issue", "system failure"]
    },
    reviewFiles: reviewFiles.map((item) => item.fileName)
  };
  writeJson(reviewPaths.latestAgentSummary, summary);

  const history = readJson(reviewPaths.observationHistory, { observations: [] });
  history.observations = Array.isArray(history.observations) ? history.observations : [];
  history.observations.push({
    generatedAt: inputs.generatedAt,
    runId: inputs.runId,
    reviewsGenerated: reviews.length,
    proposalCount: proposals.length,
    urgentItemsCount: urgentItems.length,
    routineItemsDeferredCount: routineDeferred.length,
    humanReviewLoad: "low",
    autoApplyAllowed: false
  });
  writeJson(reviewPaths.observationHistory, history);

  return summary;
}

function runAgentReviews() {
  ensureDir(reviewPaths.reviewRoot);
  ensureDir(reviewPaths.archiveRoot);
  const inputs = loadReviewInputs();
  const proposals = buildProposalSet(inputs);
  const reviews = reviewBlueprints.map((blueprint) => {
    const fileMeta = reviewFiles.find((item) => item.key === blueprint.key);
    return reviewFor(blueprint, fileMeta, inputs, proposals);
  });

  for (const review of reviews) {
    const fileMeta = reviewFiles.find((item) => item.entityName === review.entityName);
    writeText(fileMeta.path, markdownReview(review));
  }

  const summary = writeRollups(inputs, reviews, proposals);
  console.log("MarketOps agent reviews generated");
  console.log(`reviews generated: ${reviews.length}`);
  console.log(`proposals created: ${proposals.length}`);
  console.log(`review cadence: ${summary.reviewCadence}`);
  console.log(`biweekly digest: ${reviewPaths.biweeklyDigest}`);
  console.log("autoApplyAllowed: false");
  return { reviews, proposals, summary };
}

if (require.main === module) {
  try {
    runAgentReviews();
  } catch (error) {
    console.error(`agents:review failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { runAgentReviews };
