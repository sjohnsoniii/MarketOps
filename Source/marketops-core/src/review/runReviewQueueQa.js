const path = require("path");
const { fileExists, loadJson, writeText } = require("../utils/fileStore");
const { paths } = require("../utils/paths");
const {
  createEmptyQueue, createEmptyEvents,
  validateProposal, createProposal, addProposal,
  approveProposal, rejectProposal, requestRevision,
  listPending, listByStatus, importProposals,
  loadQueue, saveQueue, loadEvents, saveEvents
} = require("./reviewQueue");

function scanForNaN(obj, prefix) {
  const issues = [];
  if (obj === null || obj === undefined) return issues;
  if (typeof obj === "number") {
    if (!isFinite(obj)) issues.push(`${prefix} is NaN or Infinity`);
    return issues;
  }
  if (typeof obj === "object") {
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => issues.push(...scanForNaN(item, `${prefix}[${i}]`)));
    } else {
      for (const key of Object.keys(obj)) {
        issues.push(...scanForNaN(obj[key], `${prefix}.${key}`));
      }
    }
  }
  return issues;
}

function runReviewQueueQa() {
  const checks = [];
  function check(name, passed, detail) {
    checks.push({ name, passed: Boolean(passed), detail: String(detail) });
  }

  const reviewDir = path.join(paths.dataRoot, "review");
  const queuePath = path.join(reviewDir, "review-queue-v0.1.json");
  const eventsPath = path.join(reviewDir, "review-events-v0.1.json");

  // === File existence ===
  check("Queue JSON exists", fileExists(queuePath), queuePath);
  check("Events JSON exists", fileExists(eventsPath), eventsPath);

  let queue = null;
  let events = null;
  try {
    queue = loadJson(queuePath);
    check("Queue JSON is valid", true, "Parsed successfully");
  } catch (e) {
    check("Queue JSON is valid", false, e.message);
  }
  try {
    events = loadJson(eventsPath);
    check("Events JSON is valid", true, "Parsed successfully");
  } catch (e) {
    check("Events JSON is valid", false, e.message);
  }

  if (queue) {
    check("Queue has schema field", queue.schema === "review-queue-v0.1", String(queue.schema));
    check("Queue has proposals array", Array.isArray(queue.proposals), typeof queue.proposals);
    check("Queue has metadata object", typeof queue.metadata === "object" && queue.metadata !== null, typeof queue.metadata);
    check("Queue metadata has totalProposals", typeof queue.metadata.totalProposals === "number", String(queue.metadata.totalProposals));

    // Validate each proposal
    for (const prop of queue.proposals) {
      const errors = validateProposal(prop);
      check(`Proposal ${prop.proposalId} is valid`, errors.length === 0, errors.length > 0 ? errors.join("; ") : "Valid");
      check(`Proposal ${prop.proposalId} autoApply is false`, prop.autoApply === false, String(prop.autoApply));
      if (prop.reviewHistory) {
        check(`Proposal ${prop.proposalId} reviewHistory is array`, Array.isArray(prop.reviewHistory), typeof prop.reviewHistory);
      }
    }

    const pendingCount = listPending(queue).length;
    check(`Pending proposals list works`, typeof pendingCount === "number", `Found ${pendingCount} pending`);

    const grouped = listByStatus(queue);
    check("listByStatus returns object", typeof grouped === "object", typeof grouped);
    const totalFromGroup = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);
    check("listByStatus count matches total", totalFromGroup === queue.metadata.totalProposals, `${totalFromGroup} === ${queue.metadata.totalProposals}`);

    // Check no public paths
    const sj3labsStr = JSON.stringify(queue);
    check("Queue does not reference sj3labs paths", !sj3labsStr.includes("sj3labs"), "No sj3labs references in queue");

    // Check for NaN/Infinity
    const nanIssues = scanForNaN(queue, "queue");
    check("No NaN/Infinity in queue", nanIssues.length === 0, nanIssues.length > 0 ? nanIssues.join("; ") : "All finite");

    // Check no secrets
    const secretsStr = JSON.stringify(queue);
    const hasApiKey = /sk-[A-Za-z0-9]{20,}/.test(secretsStr);
    const hasSecretKey = /secret(?:_key|Key)?['":]\s*['"][A-Za-z0-9]{16,}/.test(secretsStr);
    const hasPassword = /password['":]\s*['"][^'"]{4,}/.test(secretsStr);
    check("No secrets in queue", !hasApiKey && !hasSecretKey && !hasPassword, `API key: ${hasApiKey}, Secret key: ${hasSecretKey}, Password: ${hasPassword}`);
  }

  if (events) {
    check("Events has schema field", events.schema === "review-events-v0.1", String(events.schema));
    check("Events has events array", Array.isArray(events.events), typeof events.events);

    // Validate each event
    for (const evt of events.events) {
      check(`Event ${evt.eventId} has eventId`, !!evt.eventId, evt.eventId);
      check(`Event ${evt.eventId} has action`, !!evt.action, evt.action);
      check(`Event ${evt.eventId} has actorId`, !!evt.actorId, evt.actorId);
      check(`Event ${evt.eventId} has createdAt`, !!evt.createdAt, evt.createdAt);
      check(`Event ${evt.eventId} has previousStatus`, evt.previousStatus !== undefined, String(evt.previousStatus));
      check(`Event ${evt.eventId} has newStatus`, evt.newStatus !== undefined, String(evt.newStatus));
    }

    const nanEvt = scanForNaN(events, "events");
    check("No NaN/Infinity in events", nanEvt.length === 0, nanEvt.length > 0 ? nanEvt.join("; ") : "All finite");
  }

  // === Functional tests ===
  try {
    // Test empty queue
    const emptyQueue = createEmptyQueue();
    const emptyEvents = createEmptyEvents();
    check("Empty queue has 0 proposals", emptyQueue.proposals.length === 0, "Empty");
    check("Empty queue schema correct", emptyQueue.schema === "review-queue-v0.1", emptyQueue.schema);
    check("Empty events has 0 events", emptyEvents.events.length === 0, "Empty");
    check("listPending on empty queue returns []", listPending(emptyQueue).length === 0, "Empty");

    // Test add proposal
    const testProp = createProposal({
      proposalId: "TEST-PROP-001",
      entityId: "test-entity",
      entityName: "Test Entity",
      entityType: "test",
      title: "Test proposal",
      summary: "Testing proposal system",
      currentBehavior: "No behavior",
      proposedChange: "Test change",
      evidence: "Test evidence",
      expectedBenefit: "Test benefit",
      affectedFilesOrConfig: "test.js",
      recommendedAction: "Test action"
    });
    const addResult = addProposal(emptyQueue, testProp);
    check("Add valid proposal succeeds", addResult.success, addResult.errors ? addResult.errors.join(", ") : "OK");
    check("Proposal was added to queue", emptyQueue.proposals.length === 1, "1 proposal");
    check("Proposal ID matches", emptyQueue.proposals[0].proposalId === "TEST-PROP-001", "TEST-PROP-001");

    // Test duplicate detection
    const dupResult = addProposal(emptyQueue, testProp);
    check("Duplicate proposal is rejected", !dupResult.success, dupResult.errors ? dupResult.errors.join(", ") : "OK");

    // Test invalid proposal
    const invalidResult = addProposal(emptyQueue, { proposalId: null });
    check("Invalid proposal is rejected", !invalidResult.success, "Invalid");

    // Test approve
    const appResult = approveProposal(emptyQueue, emptyEvents, "TEST-PROP-001", { actorId: "sam", actorName: "Sam", actorRole: "admin" });
    check("Approve succeeds", appResult.success, appResult.errors ? appResult.errors.join(", ") : "OK");
    check("Approve changes status", appResult.proposal.status === "approved_by_admin", appResult.proposal.status);
    check("Approve creates event", emptyEvents.events.length >= 1, `${emptyEvents.events.length} events`);
    check("Approve does not auto-apply changes", appResult.warnings.length > 0, appResult.warnings[0]);

    // Test reject on different proposal
    const testProp2 = createProposal({
      proposalId: "TEST-PROP-002",
      entityId: "test-entity",
      entityName: "Test Entity 2",
      entityType: "test",
      title: "Test proposal 2",
      summary: "Testing rejection",
      currentBehavior: "No behavior",
      proposedChange: "Test change",
      evidence: "Test evidence",
      expectedBenefit: "Test benefit",
      affectedFilesOrConfig: "test2.js",
      recommendedAction: "Test action"
    });
    addProposal(emptyQueue, testProp2);

    const rejResult = rejectProposal(emptyQueue, emptyEvents, "TEST-PROP-002", { actorId: "sam", actorName: "Sam", actorRole: "admin", note: "Not enough evidence" });
    check("Reject succeeds", rejResult.success, rejResult.errors ? rejResult.errors.join(", ") : "OK");
    check("Reject changes status", rejResult.proposal.status === "rejected_by_admin", rejResult.proposal.status);
    check("Reject stores reason", rejResult.proposal.reviewedBy.reason === "Not enough evidence", rejResult.proposal.reviewedBy.reason);

    // Test try again / revision
    const testProp3 = createProposal({
      proposalId: "TEST-PROP-003",
      entityId: "test-entity",
      entityName: "Test Entity 3",
      entityType: "test",
      title: "Test proposal 3",
      summary: "Testing revision request",
      currentBehavior: "No behavior",
      proposedChange: "Test change",
      evidence: "Test evidence",
      expectedBenefit: "Test benefit",
      affectedFilesOrConfig: "test3.js",
      recommendedAction: "Test action"
    });
    addProposal(emptyQueue, testProp3);

    const revResult = requestRevision(emptyQueue, emptyEvents, "TEST-PROP-003", { actorId: "sam", actorName: "Sam", actorRole: "admin", note: "Need more data" });
    check("Request revision succeeds", revResult.success, revResult.errors ? revResult.errors.join(", ") : "OK");
    check("Revision changes status to needs_revision", revResult.proposal.status === "needs_revision", revResult.proposal.status);
    check("Revision stores feedback", revResult.proposal.reviewedBy.feedback === "Need more data", revResult.proposal.reviewedBy.feedback);

    // Test import
    const importQueue = createEmptyQueue();
    const importEvents = createEmptyEvents();
    const importResult = importProposals(importQueue, importEvents, [
      { proposalId: "IMP-001", entityId: "risk-desk", entityName: "Risk Desk", entityType: "risk", projectId: "marketops", title: "Imported prop 1", summary: "Test", currentBehavior: "A", proposedChange: "B", evidence: "C", expectedBenefit: "D", riskLevel: "low", safetyImpact: "none", affectedFilesOrConfig: "file.js", recommendedAction: "Review" },
      { proposalId: "IMP-002", entityId: "risk-desk", entityName: "Risk Desk", entityType: "risk", projectId: "marketops", title: "Imported prop 2", summary: "Test", currentBehavior: "A", proposedChange: "B", evidence: "C", expectedBenefit: "D", riskLevel: "low", safetyImpact: "none", affectedFilesOrConfig: "file.js", recommendedAction: "Review" }
    ], { reportPath: "/tmp/report.md", dataPath: "/tmp/data.json" });
    check("Import succeeds", importResult.imported === 2, `Imported ${importResult.imported}`);
    check("Imported proposals are pending_review", importQueue.proposals.every(p => p.status === "pending_review"), "All pending_review");
    check("Import records events", importEvents.events.length === 2, `${importEvents.events.length} events`);
    check("Imported proposals have source paths", importQueue.proposals.every(p => p.sourceReportPath && p.sourceDataPath), "Has source paths");
    check("Imported proposals autoApply false", importQueue.proposals.every(p => p.autoApply === false), "autoApply false");

    // Test duplicate import
    const dupImport = importProposals(importQueue, importEvents, [
      { proposalId: "IMP-001", entityId: "risk-desk", entityName: "Risk Desk", entityType: "risk", projectId: "marketops", title: "Duplicate", summary: "Test", currentBehavior: "A", proposedChange: "B", evidence: "C", expectedBenefit: "D", riskLevel: "low", safetyImpact: "none", affectedFilesOrConfig: "file.js", recommendedAction: "Review" }
    ], {});
    check("Duplicate import skipped", dupImport.skipped === 1 && dupImport.imported === 0, `Skipped ${dupImport.skipped}`);

  } catch (e) {
    check("Functional tests run without exception", false, e.message);
  }

  const failed = checks.filter(c => !c.passed);
  const passed = failed.length === 0;

  const reportLines = [];
  reportLines.push("# MarketOps Review Queue QA Report v0.1");
  reportLines.push("");
  reportLines.push(`Generated: ${new Date().toISOString()}`);
  reportLines.push("");
  reportLines.push(`**Result:** ${passed ? "PASS" : "FAIL"}`);
  reportLines.push(`**Checks Passed:** ${checks.length - failed.length} / ${checks.length}`);
  reportLines.push("");
  reportLines.push("## Check Details");
  reportLines.push("");
  reportLines.push("| Check | Passed | Detail |");
  reportLines.push("|---|---|---|");
  for (const c of checks) {
    reportLines.push(`| ${c.name.replace(/\|/g, "\\|")} | ${c.passed ? "PASS" : "FAIL"} | ${String(c.detail).replace(/\|/g, "\\|")} |`);
  }
  if (failed.length > 0) {
    reportLines.push("");
    reportLines.push("## Failed Checks");
    for (const f of failed) {
      reportLines.push(`- **${f.name}**: ${f.detail}`);
    }
  }
  reportLines.push("");

  const reviewReportDir = path.join(paths.projectRoot, "Reports", "Review");
  const qaReportPath = path.join(reviewReportDir, "marketops-review-queue-qa-v0.1.md");
  writeText(qaReportPath, reportLines.join("\n"));

  console.log(passed ? "REVIEW QUEUE QA PASS" : "REVIEW QUEUE QA FAIL");
  console.log(`checks passed: ${checks.length - failed.length}`);
  console.log(`checks failed: ${failed.length}`);
  if (!passed) process.exitCode = 1;

  return { passed, checks };
}

if (require.main === module) {
  runReviewQueueQa();
}

module.exports = { runReviewQueueQa };
