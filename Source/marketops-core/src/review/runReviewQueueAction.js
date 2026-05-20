const path = require("path");
const { paths } = require("../utils/paths");
const {
  loadQueue, saveQueue,
  loadEvents, saveEvents,
  listPending, listByStatus,
  approveProposal, rejectProposal, requestRevision
} = require("./reviewQueue");

function getPaths() {
  const reviewDir = path.join(paths.dataRoot, "review");
  return {
    queuePath: path.join(reviewDir, "review-queue-v0.1.json"),
    eventsPath: path.join(reviewDir, "review-events-v0.1.json")
  };
}

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = { action: "list", proposalId: null, actorId: null, actorName: null, actorRole: "admin", note: "" };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--action" && args[i + 1]) {
      parsed.action = args[++i];
    } else if (args[i] === "--proposalId" && args[i + 1]) {
      parsed.proposalId = args[++i];
    } else if (args[i] === "--actorId" && args[i + 1]) {
      parsed.actorId = args[++i];
    } else if (args[i] === "--actorName" && args[i + 1]) {
      parsed.actorName = args[++i];
    } else if (args[i] === "--actorRole" && args[i + 1]) {
      parsed.actorRole = args[++i];
    } else if (args[i] === "--note" && args[i + 1]) {
      parsed.note = args[++i];
    } else if (args[i] === "--action" || args[i] === "--proposalId" || args[i] === "--actorId" || args[i] === "--actorName" || args[i] === "--actorRole" || args[i] === "--note") {
      i++; // skip value for incomplete flag
    } else if (!parsed.action || parsed.action === "list") {
      // positional: first non-flag arg is the action
      if (!["list", "approve", "reject", "revise"].includes(args[i])) continue;
      parsed.action = args[i];
    }
  }
  return parsed;
}

function runList() {
  const { queuePath } = getPaths();
  const queue = loadQueue(queuePath);

  console.log("\n=== Review Queue: Pending Proposals ===\n");
  const pending = listPending(queue);
  if (pending.length === 0) {
    console.log("No pending proposals.");
  } else {
    for (const p of pending) {
      console.log(`[${p.proposalId}] ${p.title}`);
      console.log(`  Entity: ${p.entityName} (${p.entityType})`);
      console.log(`  Type: ${p.proposalType}`);
      console.log(`  Created: ${p.createdAt}`);
      console.log(`  Risk: ${p.riskLevel}`);
      console.log(`  Summary: ${p.summary.substring(0, 120)}`);
      console.log("");
    }
  }

  console.log("=== All Proposals (by status) ===\n");
  const grouped = listByStatus(queue);
  for (const [status, items] of Object.entries(grouped)) {
    console.log(`[${status}] ${items.length} proposal(s):`);
    for (const p of items) {
      console.log(`  ${p.proposalId}: ${p.title}`);
    }
    console.log("");
  }

  console.log(`Total: ${queue.metadata.totalProposals} proposals`);
}

function doApprove({ proposalId, actorId, actorName, actorRole, note }) {
  const { queuePath, eventsPath } = getPaths();
  const queue = loadQueue(queuePath);
  const events = loadEvents(eventsPath);

  if (!proposalId) {
    console.error("Error: --proposalId is required for approve action");
    process.exit(1);
  }
  const actor = { actorId: actorId || "admin", actorName: actorName || "Admin", actorRole: actorRole || "admin", note };

  const result = approveProposal(queue, events, proposalId, actor);
  if (!result.success) {
    console.error(`Error: ${result.errors.join("; ")}`);
    process.exit(1);
  }

  saveQueue(queue, queuePath);
  saveEvents(events, eventsPath);

  console.log(`Approved: ${proposalId}`);
  console.log(`Status: ${result.proposal.status}`);
  console.log(`Warning: ${result.warnings[0]}`);
  console.log(`Event: ${result.event.eventId}`);
}

function doReject({ proposalId, actorId, actorName, actorRole, note }) {
  const { queuePath, eventsPath } = getPaths();
  const queue = loadQueue(queuePath);
  const events = loadEvents(eventsPath);

  if (!proposalId) {
    console.error("Error: --proposalId is required for reject action");
    process.exit(1);
  }
  const actor = { actorId: actorId || "admin", actorName: actorName || "Admin", actorRole: actorRole || "admin", note };

  const result = rejectProposal(queue, events, proposalId, actor);
  if (!result.success) {
    console.error(`Error: ${result.errors.join("; ")}`);
    process.exit(1);
  }

  saveQueue(queue, queuePath);
  saveEvents(events, eventsPath);

  console.log(`Rejected: ${proposalId}`);
  console.log(`Status: ${result.proposal.status}`);
  console.log(`Event: ${result.event.eventId}`);
  console.log(`Reason: ${note || "No reason provided."}`);
}

function doRevise({ proposalId, actorId, actorName, actorRole, note }) {
  const { queuePath, eventsPath } = getPaths();
  const queue = loadQueue(queuePath);
  const events = loadEvents(eventsPath);

  if (!proposalId) {
    console.error("Error: --proposalId is required for revise action");
    process.exit(1);
  }
  if (!note) {
    console.error("Error: --note with feedback is required for revise action");
    process.exit(1);
  }
  const actor = { actorId: actorId || "admin", actorName: actorName || "Admin", actorRole: actorRole || "admin", note };

  const result = requestRevision(queue, events, proposalId, actor);
  if (!result.success) {
    console.error(`Error: ${result.errors.join("; ")}`);
    process.exit(1);
  }

  saveQueue(queue, queuePath);
  saveEvents(events, eventsPath);

  console.log(`Revision requested: ${proposalId}`);
  console.log(`Status: ${result.proposal.status}`);
  console.log(`Event: ${result.event.eventId}`);
  console.log(`Feedback: ${note}`);
}

function main() {
  const args = parseArgs();

  switch (args.action) {
    case "list":
      runList();
      break;
    case "approve":
      doApprove(args);
      break;
    case "reject":
      doReject(args);
      break;
    case "revise":
      doRevise(args);
      break;
    default:
      console.log(`Unknown action: ${args.action}`);
      console.log("Usage:");
      console.log("  node src/review/runReviewQueueAction.js list");
      console.log("  node src/review/runReviewQueueAction.js approve --proposalId PROP-001 --actorId sam --actorName Sam --note 'Looks good'");
      console.log("  node src/review/runReviewQueueAction.js reject --proposalId PROP-001 --actorId sam --actorName Sam --note 'Need more evidence'");
      console.log("  node src/review/runReviewQueueAction.js revise --proposalId PROP-001 --actorId sam --actorName Sam --note 'Add shadow trade data'");
      process.exit(1);
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`review:action failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  runList, doApprove, doReject, doRevise
};
