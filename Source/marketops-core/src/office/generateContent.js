const { paths } = require("../utils/paths");
const {
  ensureOfficeContentDirs,
  writeMarkdown,
  writeJson,
  formatMoney,
  formatPct,
  loadOfficeInputs,
  buildStats,
  publicDisclaimer,
  safeContentItem
} = require("./officeContentUtils");
const { writeVideoGenerationPackages } = require("./videoGenerationSpecialist");

function weeklyReport(stats) {
  return `# Weekly MarketOps Field Report Draft v0.1

Status: draft review required  
Publish allowed: false  
Mode: ${stats.mode}  
Safety label: paper simulation, fake money, sample-data preview

${publicDisclaimer()}

## Plain-English Summary

MarketOps completed another local paper-simulation loop. The system scanned ${stats.vehiclesScanned} sample vehicles, reviewed ${stats.signalsReviewed} sample signals, approved ${stats.riskApproved} for fake paper execution, and blocked ${stats.riskBlocked} at the Risk Desk.

This is not a claim about real performance. It is a controlled sample-data rehearsal for the operating process: scan, risk review, fake execution, dashboard refresh, report drafting, and human review.

## Performance Snapshot

- Starting paper balance: ${formatMoney(stats.startingBalance)}
- Ending paper equity: ${formatMoney(stats.endingEquity)}
- Paper P/L: ${formatMoney(stats.paperPnl)}
- Paper return: ${formatPct(stats.paperReturnPct)}
- Max paper drawdown: ${formatPct(stats.maxDrawdownPct)}
- Fake paper trades: ${stats.fakePaperTrades}

## Risk Desk Summary

The Risk Desk approved ${stats.riskApproved} sample events and blocked ${stats.riskBlocked}. That block rate is useful in a paper lab because it keeps the demo focused on process quality instead of pretending every signal deserves action.

## Fake Paper Trades Summary

The latest sample loop closed ${stats.fakePaperTrades} fake-money paper events. The notable sample movement came from ${stats.notableVehicle}, with a paper P/L contribution of ${formatMoney(stats.notablePaperPnl)}.

## What Worked

- The paper loop produced deterministic outputs.
- The dashboard bundle refreshed with public-safe fields.
- The Risk Desk continued to veto most sample events.
- Draft content now routes into a local review queue before any public use.

## What Failed

- The sample loop finished with negative paper P/L.
- The current dataset is tiny, so it is useful for workflow testing, not performance claims.
- The content still needs human review before anything leaves the lab.

## What Changed

MarketOps now has the start of an operating office around the paper engine: content drafts, social drafts, video scripts, avatar scripts, queue records, and safety scans.

## Next Focus

Next pass should improve the sample dataset, expand the report templates, and keep the compliance gate strict enough that draft content stays draft-only until reviewed.

## Disclaimer

${publicDisclaimer()} MarketOps does not trade for users, manage portfolios, or connect to subscriber brokerage accounts.`;
}

function monthlyReport(stats) {
  return `# Monthly MarketOps Lab Report Draft v0.1

Status: draft review required  
Publish allowed: false  
Mode: ${stats.mode}  
Safety label: paper simulation, fake money, sample-data preview

${publicDisclaimer()}

## Monthly-Style Recap

This draft uses the current available paper-simulation sample data as a monthly-style review. It is not a full calendar-month performance record. The point is to test the format MarketOps will use when the paper lab has more history.

## Dashboard Recap

- Vehicles scanned: ${stats.vehiclesScanned}
- Signals reviewed: ${stats.signalsReviewed}
- Risk approved: ${stats.riskApproved}
- Risk blocked: ${stats.riskBlocked}
- Fake paper trades: ${stats.fakePaperTrades}
- Ending paper equity: ${formatMoney(stats.endingEquity)}
- Paper P/L: ${formatMoney(stats.paperPnl)}
- Paper return: ${formatPct(stats.paperReturnPct)}
- Max paper drawdown: ${formatPct(stats.maxDrawdownPct)}

## Risk Controls

The Risk Desk is designed to be a veto layer. In this sample run, it blocked more events than it approved, which is the right instinct for a paper-first research lab. A signal is not treated as useful just because it exists.

## Process Discussion

MarketOps is testing the operating workflow at a high level: scan sample vehicles, review signal quality, apply risk controls, run fake-money execution, update public-safe dashboard data, and generate review-only content. The exact internal mechanics stay out of public drafts.

## Lessons Learned

- Small sample sets are good for repeatable QA, not big claims.
- Paper losses are useful because they expose process gaps without risking real money.
- Reports need to explain context, not just numbers.
- Every external-facing draft needs a safety pass before publication.

## Next Planned Improvements

- Add more sample history for better chart and report testing.
- Keep public dashboard fields sanitized.
- Improve case-study templates without exposing internal mechanics.
- Keep future Signal Desk language educational and review-gated.

## Disclaimer

${publicDisclaimer()} This draft is for review only and is not a recommendation.`;
}

function caseStudy(stats) {
  const direction = stats.notablePaperPnl >= 0 ? "positive" : "negative";
  return `# Trade/Event Case Study Draft v0.1

Status: draft review required  
Publish allowed: false  
Safety label: fake-money paper simulation, sample-data preview

${publicDisclaimer()}

## Event Selected

This case study looks at a notable sample paper event tied to ${stats.notableVehicle}. The event is selected from public-safe dashboard data only, without raw internal IDs, exact sizing, or private execution details.

## Context

MarketOps reviewed a small basket of sample vehicles. The Risk Desk approved a limited number of events for fake paper execution and blocked the rest. This event became notable because it produced a ${direction} paper P/L contribution of ${formatMoney(stats.notablePaperPnl)} inside the sample loop.

## Signal And Risk Decision

At a public-safe level, the event passed the paper lab's current risk review and moved into fake-money execution. The important point is not the exact rule. The important point is that MarketOps records whether the process was selective, reviewable, and honest about the result.

## Simulated Result

The sample event contributed ${formatMoney(stats.notablePaperPnl)} to paper P/L. The full paper loop ended at ${formatMoney(stats.endingEquity)}, with total paper P/L of ${formatMoney(stats.paperPnl)}.

## Lesson

A paper lab is allowed to be uncomfortable. The purpose is to find weak spots, blocked ideas, and process gaps before anything is considered for a future, reviewed launch path.

## Next Watch Item

Watch whether the Risk Desk continues to block low-quality sample events and whether future sample history gives enough context to separate noise from repeatable process behavior.

## Disclaimer

${publicDisclaimer()} This is not a trading instruction or a performance claim.`;
}

function socialItems(stats) {
  return [
    safeContentItem({
      id: "x-marketops-paper-loop-001",
      platform: "x",
      postText: `MarketOps ran another paper simulation loop: ${stats.vehiclesScanned} sample vehicles scanned, ${stats.signalsReviewed} signals reviewed, ${stats.riskApproved} approved, ${stats.riskBlocked} blocked. Fake/sample money only while the lab prepares for a possible future launch. Not financial advice.`,
      sourceReport: "weekly-marketops-field-report-v0.1.md",
      contentType: "short_post",
      riskLevel: "low"
    }),
    safeContentItem({
      id: "x-marketops-risk-desk-002",
      platform: "x",
      postText: `The MarketOps Risk Desk blocked ${stats.riskBlocked} sample events and approved ${stats.riskApproved}. That is the point of paper simulation: test the process before anything public-facing gets serious. Fake money, sample-data preview, not financial advice.`,
      sourceReport: "monthly-marketops-lab-report-v0.1.md",
      contentType: "short_post",
      riskLevel: "low"
    }),
    safeContentItem({
      id: "instagram-marketops-dashboard-001",
      platform: "instagram",
      postText: `MarketOps update: the paper lab now turns sample-data runs into dashboard stats, field reports, and review-only content drafts. Current numbers are paper simulation with fake/sample money while the project prepares for a possible future launch. Not real performance. Not financial advice.`,
      sourceReport: "weekly-marketops-field-report-v0.1.md",
      contentType: "caption",
      riskLevel: "low"
    }),
    safeContentItem({
      id: "instagram-marketops-lessons-002",
      platform: "instagram",
      postText: `A paper loss is still useful data. MarketOps uses sample-data preview runs to test scanning, risk review, fake execution, and reporting before any future public launch path. Educational lab notes only. Not financial advice.`,
      sourceReport: "trade-case-study-v0.1.md",
      contentType: "caption",
      riskLevel: "low"
    }),
    safeContentItem({
      id: "facebook-marketops-field-report-001",
      platform: "facebook",
      postText: `MarketOps is now producing local field report drafts from paper-simulation runs. The latest sample-data preview scanned ${stats.vehiclesScanned} vehicles, reviewed ${stats.signalsReviewed} signals, and kept every output review-gated. Fake/sample money only while preparing for a possible future launch. Not financial advice.`,
      sourceReport: "weekly-marketops-field-report-v0.1.md",
      contentType: "social_post",
      riskLevel: "low"
    }),
    safeContentItem({
      id: "facebook-marketops-risk-controls-002",
      platform: "facebook",
      postText: `The most important MarketOps feature right now may be the boring one: the Risk Desk. It blocks weak sample events before they become fake paper trades. This is paper simulation, sample-data preview, and preparation for a possible future launch. Not financial advice.`,
      sourceReport: "monthly-marketops-lab-report-v0.1.md",
      contentType: "social_post",
      riskLevel: "low"
    }),
    safeContentItem({
      id: "linkedin-marketops-office-001",
      platform: "linkedin",
      postText: `MarketOps is evolving from a simple paper runner into a local operating office: paper simulation, dashboard refresh, run history, report drafts, social drafts, video scripts, and compliance checks. Everything remains fake/sample money and review-gated while preparing for a possible future launch. Not financial advice.`,
      sourceReport: "monthly-marketops-lab-report-v0.1.md",
      contentType: "professional_update",
      riskLevel: "low"
    }),
    safeContentItem({
      id: "linkedin-marketops-transparency-002",
      platform: "linkedin",
      postText: `The MarketOps public story is intentionally conservative: paper simulation first, sample-data preview, transparent reporting, and safety checks before anything external. The current dashboard is not real performance and not financial advice. It is a research workflow being built in public.`,
      sourceReport: "weekly-marketops-field-report-v0.1.md",
      contentType: "professional_update",
      riskLevel: "low"
    })
  ];
}

function socialMarkdown(items) {
  const sections = items.map((item) => `## ${item.platform.toUpperCase()} - ${item.id}

Status: ${item.status}  
Publish allowed: ${item.publishAllowed}  
Risk level: ${item.riskLevel}

${item.postText}

Disclaimer: ${item.disclaimerShort}`).join("\n\n");
  return `# MarketOps Social Media Content Pack v0.1

All items are draft review required. Publish allowed is false for every item.

${sections}`;
}

function videoPack(stats) {
  return `# Faceless Video Script Pack v0.1

All scripts are draft review required. Publish allowed: false.

## 1. First Paper Simulation Loop

Hook: MarketOps is not trading real money. It is rehearsing the operating system first.

Scene beats:
- Show a dark dashboard opening on paper simulation mode.
- Cut to stats: ${stats.vehiclesScanned} vehicles scanned, ${stats.signalsReviewed} signals reviewed.
- Show Risk Desk counts: ${stats.riskApproved} approved, ${stats.riskBlocked} blocked.
- End on review queue and compliance gate.

Chart/visual suggestions:
- Paper equity curve
- Signal funnel
- Draft queue cards

On-screen captions:
- Paper simulation only
- Fake/sample money
- Not real performance
- Human review required

CTA: Follow the MarketOps lab as the sample-data system gets stricter.

Disclaimer line: Paper simulation and sample-data preview only. Not financial advice.

## 2. Why Risk Desk Blocks Matter

Hook: The best signal in a paper lab might be the one the system refuses to use.

Scene beats:
- Show blocked sample events outnumbering approved events.
- Explain that paper testing should catch weak ideas early.
- Show a clean block/approve summary.
- Close with the idea that selectivity matters before launch discussions.

Chart/visual suggestions:
- Risk decision mix
- Signal funnel
- Dashboard warning badge

On-screen captions:
- Risk Desk = veto layer
- More blocks can mean better discipline
- Fake money first

CTA: Watch the lab reports for what gets blocked, not just what gets approved.

Disclaimer line: Educational paper simulation only. Not financial advice.

## 3. What Fake-Money Testing Teaches

Hook: Fake money is where bad assumptions should go to get exposed.

Scene beats:
- Show the paper P/L snapshot: ${formatMoney(stats.paperPnl)}.
- Explain that a negative paper result is useful because it costs nothing real.
- Show report drafts and compliance scan.
- End with preparation for a possible future launch after more proof and review.

Chart/visual suggestions:
- Paper P/L chart
- Drawdown chart
- Content queue status cards

On-screen captions:
- Sample data only
- Paper losses teach process gaps
- Review before publishing

CTA: Follow the build if you like transparent market research systems.

Disclaimer line: Not real performance. Not financial advice.`;
}

function avatarPack(stats) {
  return `# Avatar Presenter Script Pack v0.1

All scripts are draft review required. Publish allowed: false.

## 1. MarketOps Overview Presenter Script

Production notes: Corporate studio setting, dashboard background, polished officewear, professional presenter framing.

Script: Welcome to MarketOps, a paper-simulation research lab for AI-assisted market research. The current system runs fake-money sample-data loops, refreshes a public-safe dashboard, and writes draft reports for human review. Nothing here is real performance, and nothing here is financial advice. The goal is simple: build the operating discipline before any possible future launch.

## 2. Risk Desk Presenter Script

Production notes: Dashboard close-up, Risk Desk summary card, calm presenter tone.

Script: In MarketOps, the Risk Desk is the veto layer. In the latest sample loop, ${stats.riskApproved} events were approved and ${stats.riskBlocked} were blocked. That is not a problem. It is the process doing its job. Paper simulation lets the lab test caution, transparency, and repeatability before anything becomes public-facing.

## 3. Content Office Presenter Script

Production notes: Review queue background, report cards, compliance status panel.

Script: The Autonomous Office turns the latest paper run into draft reports, social posts, short video scripts, avatar presenter scripts, and a local review queue. Every item starts as draft review required, with publishing disabled. MarketOps is preparing for a possible future launch, but the current system remains fake-money, sample-data, and review-gated.

Disclaimer for all presenter scripts: Paper simulation and sample-data preview only. Not real performance. Not financial advice.`;
}

function writePlatformCopies(items) {
  const byPlatform = items.reduce((acc, item) => {
    acc[item.platform] = acc[item.platform] || [];
    acc[item.platform].push(item);
    return acc;
  }, {});

  const platformRoots = {
    x: paths.contentSocialXRoot,
    instagram: paths.contentSocialInstagramRoot,
    facebook: paths.contentSocialFacebookRoot,
    linkedin: paths.contentSocialLinkedinRoot
  };

  Object.entries(byPlatform).forEach(([platform, platformItems]) => {
    const root = platformRoots[platform];
    if (!root) return;
    writeJson(`${root}/${platform}-posts-v0.1.json`, platformItems);
  });
}

function generateOfficeContent() {
  ensureOfficeContentDirs();
  const inputs = loadOfficeInputs();
  const stats = buildStats(inputs);
  const items = socialItems(stats);

  writeMarkdown(paths.weeklyMarketOpsFieldReport, weeklyReport(stats));
  writeMarkdown(paths.monthlyMarketOpsLabReport, monthlyReport(stats));
  writeMarkdown(paths.tradeCaseStudyReport, caseStudy(stats));
  writeJson(paths.socialPackJson, {
    generatedAt: stats.generatedAt,
    mode: stats.mode,
    paperOnly: true,
    sampleData: true,
    publishAllowed: false,
    status: "draft_review_required",
    items
  });
  writeMarkdown(paths.socialPackMarkdown, socialMarkdown(items));
  writePlatformCopies(items);
  writeMarkdown(paths.facelessVideoPack, videoPack(stats));
  writeMarkdown(paths.avatarPresenterPack, avatarPack(stats));
  const videoSpecialist = writeVideoGenerationPackages(stats);

  const summary = {
    generatedAt: stats.generatedAt,
    mode: stats.mode,
    paperOnly: true,
    sampleData: true,
    contentGenerated: 10,
    videoPackagesGenerated: videoSpecialist.packages.length,
    publishAllowed: false,
    files: [
      paths.weeklyMarketOpsFieldReport,
      paths.monthlyMarketOpsLabReport,
      paths.tradeCaseStudyReport,
      paths.socialPackJson,
      paths.socialPackMarkdown,
      paths.facelessVideoPack,
      paths.avatarPresenterPack,
      paths.videoPackagesJson,
      paths.videoPackagesMarkdown,
      paths.videoSpecialistReport
    ]
  };

  console.log("MarketOps office content drafts generated");
  console.log(`mode: ${summary.mode}`);
  console.log(`content files: ${summary.contentGenerated}`);
  console.log(`social items: ${items.length}`);
  console.log(`video packages: ${summary.videoPackagesGenerated}`);
  console.log(`publish allowed: ${summary.publishAllowed}`);

  return summary;
}

if (require.main === module) {
  try {
    generateOfficeContent();
  } catch (error) {
    console.error(`office:content failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { generateOfficeContent };
