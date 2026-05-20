const { fileExists, loadJson, writeJson, writeText } = require("../utils/fileStore");

const VALID_STATUSES = [
  "pending_review",
  "approved_by_admin",
  "rejected_by_admin",
  "needs_revision",
  "revised",
  "applied_to_sandbox",
  "qa_passed",
  "promoted",
  "archived"
];

const VALID_ACTIONS = ["approve", "reject", "try_again"];

const REQUIRED_PROPOSAL_FIELDS = [
  "proposalId",
  "entityId",
  "entityName",
  "entityType",
  "projectId",
  "proposalType",
  "title",
  "summary",
  "currentBehavior",
  "proposedChange",
  "evidence",
  "expectedBenefit",
  "riskLevel",
  "safetyImpact",
  "affectedFilesOrConfig",
  "recommendedAction",
  "status",
  "createdAt",
  "updatedAt",
  "autoApply"
];

function isoNow() {
  return new Date().toISOString();
}

function uid() {
  return "evt-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

function createEmptyQueue() {
  return {
    schema: "review-queue-v0.1",
    generatedAt: isoNow(),
    proposals: [],
    metadata: {
      totalProposals: 0,
      byStatus: {},
      byEntityType: {}
    }
  };
}

function createEmptyEvents() {
  return {
    schema: "review-events-v0.1",
    generatedAt: isoNow(),
    events: []
  };
}

function validateProposal(proposal) {
  const errors = [];
  if (!proposal || typeof proposal !== "object") {
    return ["proposal must be an object"];
  }
  for (const field of REQUIRED_PROPOSAL_FIELDS) {
    if (proposal[field] === undefined || proposal[field] === null) {
      errors.push(`missing required field: ${field}`);
    }
  }
  if (proposal.proposalId && typeof proposal.proposalId !== "string") {
    errors.push("proposalId must be a string");
  }
  if (proposal.status && !VALID_STATUSES.includes(proposal.status)) {
    errors.push(`invalid status: ${proposal.status}. Valid: ${VALID_STATUSES.join(", ")}`);
  }
  if (proposal.autoApply !== false) {
    errors.push("autoApply must be false");
  }
  if (proposal.reviewHistory && !Array.isArray(proposal.reviewHistory)) {
    errors.push("reviewHistory must be an array");
  }
  return errors;
}

function generateDefaultProposalId() {
  return "PROP-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function createProposal(fields) {
  const now = isoNow();
  const proposal = {
    proposalId: fields.proposalId || generateDefaultProposalId(),
    entityId: fields.entityId || "",
    entityName: fields.entityName || "",
    entityType: fields.entityType || "",
    projectId: fields.projectId || "marketops",
    proposalType: fields.proposalType || "observation_only",
    title: fields.title || "Untitled proposal",
    summary: fields.summary || "",
    currentBehavior: fields.currentBehavior || "",
    proposedChange: fields.proposedChange || "",
    evidence: fields.evidence || "",
    expectedBenefit: fields.expectedBenefit || "",
    riskLevel: fields.riskLevel || "none",
    safetyImpact: fields.safetyImpact || "none",
    affectedFilesOrConfig: fields.affectedFilesOrConfig || "",
    recommendedAction: fields.recommendedAction || "",
    status: fields.status || "pending_review",
    createdAt: fields.createdAt || now,
    updatedAt: now,
    reviewedBy: fields.reviewedBy || null,
    reviewHistory: fields.reviewHistory || [],
    sourceReportPath: fields.sourceReportPath || null,
    sourceDataPath: fields.sourceDataPath || null,
    autoApply: false
  };
  return proposal;
}

function addProposal(queue, proposal) {
  const errors = validateProposal(proposal);
  if (errors.length > 0) {
    return { success: false, errors };
  }
  const existing = queue.proposals.find(p => p.proposalId === proposal.proposalId);
  if (existing) {
    return { success: false, errors: [`Duplicate proposalId: ${proposal.proposalId}`] };
  }
  queue.proposals.push(proposal);
  updateMetadata(queue);
  return { success: true, proposal };
}

function getProposal(queue, proposalId) {
  return queue.proposals.find(p => p.proposalId === proposalId) || null;
}

function createReviewEvent({ proposalId, action, actorId, actorName, actorRole, note, previousStatus, newStatus }) {
  return {
    eventId: uid(),
    proposalId,
    action,
    actorId: actorId || "unknown",
    actorName: actorName || "Unknown",
    actorRole: actorRole || "reviewer",
    note: note || "",
    createdAt: isoNow(),
    previousStatus,
    newStatus
  };
}

function recordEvent(events, event) {
  events.events.push(event);
  return event;
}

function approveProposal(queue, events, proposalId, actor) {
  const proposal = getProposal(queue, proposalId);
  if (!proposal) {
    return { success: false, errors: [`Proposal not found: ${proposalId}`] };
  }
  const previousStatus = proposal.status;
  const newStatus = "approved_by_admin";
  proposal.status = newStatus;
  proposal.updatedAt = isoNow();
  proposal.reviewedBy = { actorId: actor.actorId, actorName: actor.actorName, actorRole: actor.actorRole || "admin", approvedAt: isoNow() };

  const event = createReviewEvent({
    proposalId,
    action: "approve",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole || "admin",
    note: actor.note || "",
    previousStatus,
    newStatus
  });
  recordEvent(events, event);
  updateMetadata(queue);

  return { success: true, proposal, event, warnings: ["Proposal approved but no changes were auto-applied."] };
}

function rejectProposal(queue, events, proposalId, actor) {
  const proposal = getProposal(queue, proposalId);
  if (!proposal) {
    return { success: false, errors: [`Proposal not found: ${proposalId}`] };
  }
  const previousStatus = proposal.status;
  const newStatus = "rejected_by_admin";
  proposal.status = newStatus;
  proposal.updatedAt = isoNow();
  proposal.reviewedBy = { actorId: actor.actorId, actorName: actor.actorName, actorRole: actor.actorRole || "admin", rejectedAt: isoNow(), reason: actor.note || "" };

  const event = createReviewEvent({
    proposalId,
    action: "reject",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole || "admin",
    note: actor.note || "",
    previousStatus,
    newStatus
  });
  recordEvent(events, event);
  updateMetadata(queue);

  return { success: true, proposal, event };
}

function requestRevision(queue, events, proposalId, actor) {
  const proposal = getProposal(queue, proposalId);
  if (!proposal) {
    return { success: false, errors: [`Proposal not found: ${proposalId}`] };
  }
  const previousStatus = proposal.status;
  const newStatus = "needs_revision";
  proposal.status = newStatus;
  proposal.updatedAt = isoNow();
  proposal.reviewedBy = { actorId: actor.actorId, actorName: actor.actorName, actorRole: actor.actorRole || "admin", requestedRevisionAt: isoNow(), feedback: actor.note || "" };

  const event = createReviewEvent({
    proposalId,
    action: "try_again",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole || "admin",
    note: actor.note || "",
    previousStatus,
    newStatus
  });
  recordEvent(events, event);
  updateMetadata(queue);

  return { success: true, proposal, event };
}

function listPending(queue) {
  return queue.proposals.filter(p => p.status === "pending_review");
}

function listByStatus(queue) {
  const grouped = {};
  for (const status of VALID_STATUSES) {
    const items = queue.proposals.filter(p => p.status === status);
    if (items.length > 0) {
      grouped[status] = items;
    }
  }
  return grouped;
}

function importProposals(queue, events, proposals, sourcePaths) {
  const results = { imported: 0, skipped: 0, errors: [] };
  for (const src of proposals) {
    const exists = queue.proposals.find(p => p.proposalId === src.proposalId);
    if (exists) {
      results.skipped++;
      continue;
    }
    const mapped = createProposal({
      proposalId: src.proposalId,
      entityId: src.entityId,
      entityName: src.entityName,
      entityType: src.entityType,
      projectId: src.projectId || "marketops",
      proposalType: src.proposalType || "observation_only",
      title: src.title,
      summary: src.summary,
      currentBehavior: src.currentBehavior || src.currentBehavior,
      proposedChange: src.proposedChange || src.proposedChange,
      evidence: src.evidence,
      expectedBenefit: src.expectedBenefit,
      riskLevel: src.riskLevel || "none",
      safetyImpact: src.safetyImpact || "none",
      affectedFilesOrConfig: src.affectedFilesOrConfig || "",
      recommendedAction: src.recommendedAction || "",
      status: "pending_review",
      createdAt: src.createdAt || isoNow(),
      updatedAt: isoNow(),
      reviewedBy: null,
      reviewHistory: [],
      sourceReportPath: sourcePaths ? sourcePaths.reportPath : null,
      sourceDataPath: sourcePaths ? sourcePaths.dataPath : null,
      autoApply: false
    });
    const result = addProposal(queue, mapped);
    if (result.success) {
      const event = createReviewEvent({
        proposalId: mapped.proposalId,
        action: "imported",
        actorId: "system",
        actorName: "System Import",
        actorRole: "system",
        note: "Imported from Risk Desk learning records",
        previousStatus: null,
        newStatus: "pending_review"
      });
      recordEvent(events, event);
      results.imported++;
    } else {
      results.errors.push({ proposalId: src.proposalId, errors: result.errors });
    }
  }
  updateMetadata(queue);
  return results;
}

function updateMetadata(queue) {
  const byStatus = {};
  const byEntityType = {};
  for (const p of queue.proposals) {
    byStatus[p.status] = (byStatus[p.status] || 0) + 1;
    const et = p.entityType || "unknown";
    byEntityType[et] = (byEntityType[et] || 0) + 1;
  }
  queue.metadata = {
    totalProposals: queue.proposals.length,
    byStatus,
    byEntityType,
    updatedAt: isoNow()
  };
}

function saveQueue(queue, filePath) {
  writeJson(filePath, queue);
}

function loadQueue(filePath) {
  if (fileExists(filePath)) {
    return loadJson(filePath);
  }
  return createEmptyQueue();
}

function saveEvents(events, filePath) {
  writeJson(filePath, events);
}

function loadEvents(filePath) {
  if (fileExists(filePath)) {
    return loadJson(filePath);
  }
  return createEmptyEvents();
}

module.exports = {
  VALID_STATUSES,
  VALID_ACTIONS,
  REQUIRED_PROPOSAL_FIELDS,
  createEmptyQueue,
  createEmptyEvents,
  validateProposal,
  createProposal,
  addProposal,
  getProposal,
  approveProposal,
  rejectProposal,
  requestRevision,
  listPending,
  listByStatus,
  importProposals,
  saveQueue,
  loadQueue,
  saveEvents,
  loadEvents,
  createReviewEvent,
  recordEvent
};
