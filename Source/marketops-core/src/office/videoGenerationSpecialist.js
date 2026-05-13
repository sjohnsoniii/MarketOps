const { paths } = require("../utils/paths");
const {
  writeJson,
  writeMarkdown,
  formatMoney,
  formatPct,
  publicDisclaimer
} = require("./officeContentUtils");

const platformProfiles = [
  {
    platformTarget: "IG Reels",
    tone: "punchy, polished, visual-first",
    durationHint: "fast carousel-like beats with clean dashboard shots"
  },
  {
    platformTarget: "TikTok",
    tone: "raw build-in-public lab energy",
    durationHint: "quick cuts, candid process framing, visible paper-only labels"
  },
  {
    platformTarget: "YouTube Shorts",
    tone: "clear educational framing",
    durationHint: "explain the lesson, show the chart, repeat the paper-simulation boundary"
  },
  {
    platformTarget: "X Video",
    tone: "compressed, technical, dashboard-focused",
    durationHint: "tight dashboard walkthrough for builders and market-research followers"
  }
];

function safetyLabels() {
  return [
    "paper_simulation",
    "fake_money",
    "sample_data_preview",
    "in_development",
    "not_financial_advice",
    "human_review_required",
    "no_external_send",
    "no_upload",
    "draft_only"
  ];
}

function basePackage({ id, sourceArtifact, title, angle, hook, stats, profile }) {
  const disclaimer = "Paper-trading simulation and fake/sample money only. In development. Not financial advice. No live execution.";
  return {
    id,
    title: `${title} - ${profile.platformTarget}`,
    platformTarget: profile.platformTarget,
    platformTone: profile.tone,
    hook,
    script15Second: `${hook} MarketOps is a paper-trading simulation lab. Latest sample run: ${stats.signalsReviewed} signals reviewed, ${stats.riskApproved} approved, ${stats.riskBlocked} blocked. Fake money only. Not financial advice.`,
    script30Second: `${hook} This MarketOps package turns a paper run into a reviewable story: sample vehicles scanned, Risk Desk decisions recorded, fake paper activity summarized, and every output held for human review. The useful part is the operating discipline, not any real-money claim. ${disclaimer}`,
    script60Second: `${hook} MarketOps is being built as a local-first paper-trading operations lab. The latest sample-data loop shows ${stats.vehiclesScanned} vehicles scanned, ${stats.signalsReviewed} signals reviewed, ${stats.riskApproved} approved by Risk Desk, ${stats.riskBlocked} blocked, and ${stats.fakePaperTrades} fake paper events. The paper P/L was ${formatMoney(stats.paperPnl)}, with a paper return of ${formatPct(stats.paperReturnPct)} and max paper drawdown of ${formatPct(stats.maxDrawdownPct)}. This is not real performance. The point is to show the workflow: scan, review, fake execution, reporting, compliance, and human approval before anything public-facing. ${disclaimer}`,
    caption: `${angle} MarketOps is a paper-trading simulation and build-in-public lab. Fake/sample money only. Not financial advice.`,
    onScreenTextBeats: [
      "MarketOps paper lab",
      "Fake/sample money only",
      `${stats.signalsReviewed} signals reviewed`,
      `${stats.riskApproved} approved / ${stats.riskBlocked} blocked`,
      "Human review required",
      "Not financial advice"
    ],
    shotList: [
      "Open on MarketOps dashboard with paper_simulation label visible",
      "Cut to signal/risk count card",
      "Show paper equity or drawdown chart as sample-data preview",
      "Show approval queue card with draft_review_required",
      "End on clear paper-money disclosure"
    ],
    bRollIdeas: [
      "Dark dashboard screen capture",
      "Paper equity chart closeup",
      "Risk Desk approved/blocked count card",
      "Admin approval queue card stack",
      "Report draft title card"
    ],
    avatarPresenterPrompt: `Professional MarketOps presenter in a dark tech-lab dashboard setting. Business-safe tone. Explain ${angle.toLowerCase()} using paper-simulation language. No hype claims. No trade instructions.`,
    thumbnailConcept: `${profile.platformTarget} thumbnail: ${title}, paper simulation badge, ember dashboard accent, no brokerage logos.`,
    complianceNotes: [
      "Must retain paper-trading simulation disclosure.",
      "Must not imply real-money results.",
      "Must not provide financial advice.",
      "Must not invite viewers to mirror trades.",
      "Must not suggest subscriber execution or live alerts.",
      "No upload or posting is enabled."
    ],
    paperTradingDisclaimer: disclaimer,
    sourceArtifactReferences: [sourceArtifact],
    status: "draft_review_required",
    publishAllowed: false,
    uploadAllowed: false,
    externalApiAllowed: false,
    safetyLabels: safetyLabels()
  };
}

function buildVideoPackages(stats) {
  const sourceArtifacts = [
    {
      key: "field-report",
      sourceArtifact: "Data/content/blogs/weekly-marketops-field-report-v0.1.md",
      title: "Paper Lab Field Report",
      angle: "A transparent update from the fake-money MarketOps lab",
      hook: "The paper lab has a fresh field report."
    },
    {
      key: "risk-desk",
      sourceArtifact: "Data/content/reports/trade-case-study-v0.1.md",
      title: "Risk Desk Block Lesson",
      angle: "Why blocked sample events are useful in a cautious paper lab",
      hook: "A blocked sample idea can be the most useful result."
    },
    {
      key: "dashboard-update",
      sourceArtifact: "sj3labs/data/marketops/dashboard-bundle-public-v0.4.json",
      title: "Dashboard Progress Update",
      angle: "How the public-safe dashboard shows paper progress without real-money claims",
      hook: "The dashboard is a transparency surface, not a victory lap."
    },
    {
      key: "agent-review",
      sourceArtifact: "Data/agent-reviews/biweekly-review-digest-v0.1.md",
      title: "Agent Review Digest",
      angle: "What the MarketOps desks are learning from self-review",
      hook: "The agents can critique the lab, but they cannot change it without review."
    }
  ];

  const packages = [];
  sourceArtifacts.forEach((artifact) => {
    platformProfiles.forEach((profile) => {
      packages.push(basePackage({
        id: `video-package-${artifact.key}-${profile.platformTarget.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-v0-1`,
        sourceArtifact: artifact.sourceArtifact,
        title: artifact.title,
        angle: artifact.angle,
        hook: artifact.hook,
        stats,
        profile
      }));
    });
  });
  return packages;
}

function packageMarkdown(item) {
  return `## ${item.title}

- id: ${item.id}
- platformTarget: ${item.platformTarget}
- status: ${item.status}
- publishAllowed: ${item.publishAllowed}
- uploadAllowed: ${item.uploadAllowed}
- externalApiAllowed: ${item.externalApiAllowed}

### Hook

${item.hook}

### 15-Second Script

${item.script15Second}

### 30-Second Script

${item.script30Second}

### 60-Second Script

${item.script60Second}

### Caption

${item.caption}

### On-Screen Text Beats

${item.onScreenTextBeats.map((beat) => `- ${beat}`).join("\n")}

### Shot List

${item.shotList.map((shot) => `- ${shot}`).join("\n")}

### B-Roll Ideas

${item.bRollIdeas.map((idea) => `- ${idea}`).join("\n")}

### Avatar Presenter Prompt

${item.avatarPresenterPrompt}

### Thumbnail Concept

${item.thumbnailConcept}

### Compliance Notes

${item.complianceNotes.map((note) => `- ${note}`).join("\n")}

### Paper-Trading Disclaimer

${item.paperTradingDisclaimer}

### Source Artifact References

${item.sourceArtifactReferences.map((ref) => `- ${ref}`).join("\n")}`;
}

function writeVideoGenerationPackages(stats) {
  const generatedAt = stats.generatedAt;
  const packages = buildVideoPackages(stats);
  const bundle = {
    schemaVersion: "0.1",
    generatedAt,
    mode: "paper_simulation",
    paperOnly: true,
    sampleData: true,
    deskName: "Video Generation Specialist / Shortform Producer",
    status: "draft_review_required",
    publishAllowed: false,
    uploadAllowed: false,
    externalApiAllowed: false,
    packageCount: packages.length,
    platformTargets: platformProfiles.map((profile) => profile.platformTarget),
    packages
  };

  const markdown = `# Video Generation Specialist Packages v0.1

Generated: ${generatedAt}

Desk: Video Generation Specialist / Shortform Producer  
Mode: paper_simulation  
Status: draft_review_required  
Publish allowed: false  
Upload allowed: false  
External API allowed: false

${publicDisclaimer()}

## Desk Purpose

Turn MarketOps paper-trading outputs, dashboard updates, field reports, lab reports, case studies, agent reviews, and social packs into structured short-form production packets for future IG Reels, TikTok, YouTube Shorts, and X video review.

This desk does not create final media files, upload, post, call external APIs, use credentials, or publish.

${packages.map(packageMarkdown).join("\n\n")}`;

  const report = `# Video Generation Specialist Report v0.1

Generated: ${generatedAt}

## Summary

- Packages generated: ${packages.length}
- Platform targets: ${platformProfiles.map((profile) => profile.platformTarget).join(", ")}
- Status: draft_review_required
- Publish allowed: false
- Upload allowed: false
- External API allowed: false

## Safety

- Paper-trading simulation only.
- Fake/sample money only.
- In development.
- Not financial advice.
- No live execution.
- No external posting.
- Human review required.

## Next Review Step

Review packages in the admin console or approval queue, select promising concepts, and manually route any accepted package into future media production.`;

  writeJson(paths.videoPackagesJson, bundle);
  writeMarkdown(paths.videoPackagesMarkdown, markdown);
  writeMarkdown(paths.videoSpecialistReport, report);
  return { bundle, packages };
}

module.exports = { writeVideoGenerationPackages, buildVideoPackages };
