const fs = require("fs");
const path = require("path");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const outputRoot = path.join(projectRoot, "Data", "social-previews");
const reportPath = path.join(projectRoot, "Reports", "Social", "marketops-social-preview-sandbox-v0.1.md");
const previewPath = path.join(outputRoot, "social-preview-sandbox-v0.1.json");
const igXPrepPath = path.join(outputRoot, "ig-x-publishing-prep-v0.1.json");
const igXPrepReportPath = path.join(projectRoot, "Reports", "Social", "marketops-ig-x-publishing-prep-v0.1.md");
const hypePreviewPath = path.join(outputRoot, "ig-x-hype-post-previews-v0.1.json");
const hypePreviewReportPath = path.join(projectRoot, "Reports", "Social", "marketops-ig-x-hype-post-previews-v0.1.md");
const hypePreviewGalleryPath = path.join(projectRoot, "Admin", "review-console", "social-previews.html");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function writeText(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, value.trim() + "\n", "utf8");
}

function baseItem(generatedAt) {
  return {
    generatedAt,
    mode: "paper_simulation",
    sampleData: true,
    fakeMoney: true,
    notFinancialAdvice: true,
    noGuarantee: true,
    notLiveMarketData: true,
    noLiveTrading: true,
    noAutoPosting: true,
    apiPostingEnabled: false,
    postingReady: false,
    publishAllowed: false,
    reviewStatus: "human_review_required",
    status: "PENDING_REVIEW",
    complianceDisclaimer: "Paper simulation and fake/sample money only. Not financial advice. No guarantee. No live execution.",
    safetyLabels: [
      "paper_simulation",
      "fake_money",
      "not_financial_advice",
      "sandbox_only",
      "human_review_required",
      "no_external_send",
      "no_live_execution",
      "draft_only",
      "not_public_yet"
    ]
  };
}

function socialApprovalFields(item, publishMode = "manual_copy_paste") {
  return {
    caption: item.draftText,
    link: item.linkTarget,
    imagePrompt: (item.imagePromptIdeas && item.imagePromptIdeas[0]) || "",
    manualPostStatus: "draft_only",
    approvalDecision: null,
    approvedAt: null,
    publishMode,
    paperMoneyDisclosure: "Paper simulation and fake/sample money only.",
    notFinancialAdviceDisclosure: "Not financial advice.",
    approvedForManualPostAllowed: item.platform === "x" || item.platform === "instagram",
    apiPostingEnabled: false,
    actualPostingEnabled: false
  };
}

function buildPreviews() {
  const generatedAt = new Date().toISOString();
  const base = baseItem(generatedAt);
  const active = [
    {
      ...base,
      id: "social-preview-x-paper-sim-001",
      platform: "x",
      contentType: "short_post",
      phase: "active_preview",
      title: "Paper simulation milestone",
      draftText: "MarketOps update: the lab now has paper simulation, analytics, dashboard bundles, Signal Desk previews, and a local approval queue. Fake-money/sample-data only. Not financial advice.",
      captionVariants: [
        "MarketOps is still fake-money only, but the local lab now has a full review loop: paper simulation, analytics, dashboard bundles, Signal Desk previews, and approval queues.",
        "The useful part is not the fake P/L. It is the system around it: paper simulation, QA, review gates, and public-safe reporting."
      ],
      imagePromptIdeas: [
        "Dark premium dashboard workstation showing paper simulation metrics, approval queue cards, and an orange-accent MarketOps header. No real brokerage branding.",
        "Abstract graphite control-room scene with paper-only dashboard panels and review-gated workflow cards."
      ],
      carouselOutline: [
        "Slide 1: MarketOps paper lab milestone",
        "Slide 2: Fake-money simulation only",
        "Slide 3: Risk Desk and QA before claims",
        "Slide 4: Human approval queue before anything public"
      ],
      hashtags: ["#MarketOps", "#PaperTrading", "#BuildInPublic"],
      linkTarget: "https://sj3labs.com/marketops",
      approvalQuestion: "Approve this X draft for later manual posting?"
    },
    {
      ...base,
      id: "social-preview-x-risk-first-002",
      platform: "x",
      contentType: "short_post",
      phase: "active_preview",
      title: "Risk-first research",
      draftText: "The Risk Desk blocking a weak sample event is not failure. It is the point. MarketOps is testing process quality with fake money before anything external gets serious. Not financial advice.",
      captionVariants: [
        "Risk controls are supposed to interrupt weak ideas. MarketOps is using fake-money runs to make that interruption visible.",
        "A blocked sample event can be useful data. The point is to learn what the lab should reject before anything gets close to real-world use."
      ],
      imagePromptIdeas: [
        "Paper trading dashboard card showing a sample risk block with clear fake-money and not-financial-advice labels.",
        "Minimal dark chart panel with risk controls highlighted, no broker logos, no trade instructions."
      ],
      carouselOutline: [
        "Slide 1: Risk Desk blocks are signal, not noise",
        "Slide 2: Weak sample events get stopped",
        "Slide 3: Fake-money testing keeps the lesson cheap",
        "Slide 4: Human review before public claims"
      ],
      hashtags: ["#RiskManagement", "#MarketResearch", "#PaperSimulation"],
      linkTarget: "https://sj3labs.com/marketops/dashboard",
      approvalQuestion: "Approve this X draft for later manual posting?"
    },
    {
      ...base,
      id: "social-preview-instagram-dashboard-001",
      platform: "instagram",
      contentType: "caption",
      phase: "active_preview",
      title: "Public dashboard update",
      draftText: "MarketOps is becoming a paper-simulation research lab with dashboards, analytics, backtesting scaffolds, and local review queues. Everything shown is fake-money/sample-data preview. No real performance claims. Not financial advice.",
      captionVariants: [
        "MarketOps is a paper-simulation research lab first: fake-money runs, sample-data dashboards, backtesting scaffolds, and local review queues.",
        "The dashboard is not a performance flex. It is a transparency surface for a fake-money research system while the process is still being built."
      ],
      imagePromptIdeas: [
        "Instagram square graphic of a dark futuristic paper-simulation dashboard with sample-data badges and ember accents.",
        "Clean carousel cover: MarketOps Paper Lab, with fake-money and not-financial-advice labels visible."
      ],
      carouselOutline: [
        "Slide 1: MarketOps paper dashboard",
        "Slide 2: Sample data, not live performance",
        "Slide 3: Analytics and backtesting scaffolds",
        "Slide 4: Review queue before public use"
      ],
      hashtags: ["#MarketOps", "#PaperSimulation", "#AIResearchLab"],
      linkTarget: "https://sj3labs.com/marketops",
      approvalQuestion: "Approve this Instagram caption for later manual posting?"
    },
    {
      ...base,
      id: "social-preview-instagram-transparency-002",
      platform: "instagram",
      contentType: "caption",
      phase: "active_preview",
      title: "Fake-money lab transparency",
      draftText: "A useful market lab should be honest about what it is. MarketOps is paper simulation, sample data, local QA, and review-gated research. The point is discipline before claims. Not financial advice.",
      captionVariants: [
        "Useful market research starts with saying what the system is not. MarketOps is not live trading, not advice, and not a promise. It is paper simulation with review gates.",
        "Fake-money testing is not glamorous, which is exactly why it is useful. It lets the process get judged before the claims get loud."
      ],
      imagePromptIdeas: [
        "Dark editorial graphic with four labels: paper simulation, sample data, local QA, human review.",
        "Graphite dashboard closeup with a visible draft-only approval card and no external posting controls."
      ],
      carouselOutline: [
        "Slide 1: Be honest about the lab",
        "Slide 2: Paper simulation only",
        "Slide 3: QA and review gates",
        "Slide 4: Discipline before claims"
      ],
      hashtags: ["#BuildInPublic", "#MarketResearch", "#RiskControls"],
      linkTarget: "https://sj3labs.com/marketops/about",
      approvalQuestion: "Approve this Instagram caption for later manual posting?"
    }
  ];

  const future = [
    {
      ...base,
      id: "social-preview-tiktok-risk-desk-future-001",
      platform: "tiktok",
      contentType: "short_video_script",
      phase: "future_prep_only",
      videoQualityApproved: false,
      title: "Why Risk Desk blocks matter",
      draftText: "Hook: The boring part of a trading lab might be the part that saves it. Beats: show sample signal, show Risk Desk block, explain fake-money testing, close with review-gated research. Disclaimer: paper simulation only, not financial advice.",
      hookOptions: [
        "The boring part of a trading lab might be the part that saves it.",
        "This is why a blocked fake-money signal can be good news."
      ],
      storyboardBullets: [
        "Open on a fake-money dashboard with sample labels visible.",
        "Show a risk block card, not a trade instruction.",
        "Explain that paper simulation is for process testing.",
        "Close on human review required before any public use."
      ],
      brollIdeas: [
        "Dashboard screen recording with sample-data badges.",
        "Close-up of Risk Desk summary card.",
        "Approval queue cards scrolling slowly."
      ],
      captionTitleIdeas: [
        "Why Risk Blocks Matter",
        "Fake-Money Testing Before Claims"
      ],
      hashtags: ["#PaperTrading", "#RiskManagement", "#MarketOps"],
      linkTarget: "https://sj3labs.com/marketops",
      approvalQuestion: "Hold this TikTok script for future video quality review?"
    },
    {
      ...base,
      id: "social-preview-youtube-signal-desk-future-001",
      platform: "youtube",
      contentType: "shorts_script",
      phase: "future_prep_only",
      videoQualityApproved: false,
      title: "Signal Desk is not a signal service",
      draftText: "Hook: MarketOps has a Signal Desk, but it is not telling anyone what to trade. Beats: research labels, synthetic previews, human review, no live alerts. Disclaimer: research/educational only, not financial advice.",
      hookOptions: [
        "MarketOps has a Signal Desk, but it is not a signal service.",
        "A research alert is not a trade command."
      ],
      storyboardBullets: [
        "Show the Signal Desk label with synthetic preview tags.",
        "Show classification examples: observation, regime shift, elevated risk.",
        "Show no live alerts and no execution labels.",
        "Close with research-only and human-review-required disclaimer."
      ],
      brollIdeas: [
        "Synthetic signal schema card.",
        "Compliance checklist overlay.",
        "Admin review console approval question."
      ],
      captionTitleIdeas: [
        "Signal Desk Is Research Only",
        "No Trade Commands, No Live Alerts"
      ],
      hashtags: ["#MarketResearch", "#AITradingLab", "#PaperSimulation"],
      linkTarget: "https://sj3labs.com/marketops/signals",
      approvalQuestion: "Hold this YouTube Shorts script for future video quality review?"
    }
  ];

  active.forEach((item) => Object.assign(item, socialApprovalFields(item, "manual_copy_paste")));
  future.forEach((item) => Object.assign(item, {
    ...socialApprovalFields(item, "api_ready_disabled"),
    manualPostStatus: "draft_only",
    approvalSimulationOnly: true,
    postingAdapterEnabled: false
  }));

  const deferred = [
    {
      platform: "linkedin",
      phase: "deferred",
      reason: "Wait for stronger writing/video maturity before professional-channel rollout.",
      approvalSimulationOnly: true,
      postingAdapterEnabled: false,
      apiPostingEnabled: false
    },
    {
      platform: "facebook",
      phase: "deferred",
      reason: "Wait for stronger writing/video maturity before broader distribution.",
      approvalSimulationOnly: true,
      postingAdapterEnabled: false,
      apiPostingEnabled: false
    }
  ];

  return {
    generatedAt,
    mode: "paper_simulation",
    sampleData: true,
    fakeMoney: true,
    notFinancialAdvice: true,
    notLiveMarketData: true,
    noAutoPosting: true,
    externalSendingEnabled: false,
    apiPostingEnabled: false,
    publishAllowed: false,
    activePlatforms: ["instagram", "x"],
    futurePrepPlatforms: ["tiktok", "youtube"],
    deferredPlatforms: ["linkedin", "facebook"],
    previews: active.concat(future),
    deferred,
    igXPublishingWorkflow: buildIgXPublishingPrep(generatedAt, active)
  };
}

function buildIgXPublishingPrep(generatedAt, activeItems) {
  return {
    schemaVersion: "0.1",
    generatedAt,
    mode: "paper_simulation",
    localOnly: true,
    externalSendingEnabled: false,
    apiPostingEnabled: false,
    actualPostingEnabled: false,
    autoApprovalEnabled: false,
    publishAllowed: false,
    allowedPublishModes: ["manual_copy_paste", "api_ready_disabled", "api_posting_later"],
    currentAllowedPublishMode: "manual_copy_paste",
    platforms: activeItems
      .filter((item) => item.platform === "x" || item.platform === "instagram")
      .map((item) => ({
        id: `${item.id}-publishing-prep`,
        platform: item.platform,
        title: item.title,
        caption: item.caption,
        hashtags: item.hashtags,
        link: item.link,
        imagePrompt: item.imagePrompt,
        status: item.manualPostStatus,
        approvalDecision: item.approvalDecision,
        approvedAt: item.approvedAt,
        publishMode: item.publishMode,
        paperMoneyDisclosure: item.paperMoneyDisclosure,
        notFinancialAdviceDisclosure: item.notFinancialAdviceDisclosure,
        approvedForManualPostAllowed: item.approvedForManualPostAllowed,
        apiPostingEnabled: item.apiPostingEnabled,
        actualPostingEnabled: item.actualPostingEnabled,
        reviewStatus: item.reviewStatus,
        safetyLabels: item.safetyLabels,
        approvalQuestion: item.approvalQuestion
      })),
    deferredPlatforms: [
      { platform: "tiktok", mode: "approval_simulation_only", postingAdapterEnabled: false },
      { platform: "youtube", mode: "approval_simulation_only", postingAdapterEnabled: false },
      { platform: "linkedin", mode: "deferred", postingAdapterEnabled: false },
      { platform: "facebook", mode: "deferred", postingAdapterEnabled: false }
    ]
  };
}

function buildHypePosts(generatedAt) {
  const common = {
    generatedAt,
    mode: "paper_simulation",
    fakeMoney: true,
    inDevelopment: true,
    notFinancialAdvice: true,
    noGuarantee: true,
    noLiveTrading: true,
    apiPosting: "disabled",
    approvalStatus: "pending_review",
    publishMode: "manual_copy_paste",
    link: "https://sj3labs.com/marketops",
    disclosureFlags: [
      "paper_simulation",
      "fake_money",
      "in_development",
      "not_financial_advice",
      "no_guarantee",
      "no_live_trading",
      "manual_review_required"
    ]
  };

  const drafts = [
    ["x", "The cockpit is coming online", "MarketOps update: the local paper-simulation lab now has dashboards, approval queues, signal previews, and a private admin console. Fake-money/sample-data only. In development. Not financial advice.", "#MarketOps #PaperSimulation #BuildInPublic", "Dark graphite admin cockpit with approval cards, paper dashboard stats, and ember accents.", "Single-card layout: headline, 3 system badges, fake-money footer.", "Hook: The lab now has a cockpit."],
    ["x", "Fake money, real process", "The point of MarketOps right now is not real performance. It is process: paper runs, QA checks, risk review, and approval gates before anything gets public. Fake money only. Not financial advice.", "#PaperTrading #RiskControls #MarketResearch", "Minimal dashboard card showing process pipeline: paper run -> QA -> review -> archive.", "Horizontal pipeline card with restrained orange arrows.", "Hook: Fake money can still teach real process discipline."],
    ["x", "Approval gates before noise", "MarketOps drafts now route into a local review queue before any public use. YES means manual review later, not auto-posting. Paper simulation only. Not financial advice.", "#BuildInPublic #AIResearch #MarketOps", "Review queue card stack with clear YES/NO/NEEDS EDIT buttons and no upload icon.", "Vertical approval queue mockup.", "Hook: The button exists, but the missiles are unplugged."],
    ["x", "Signal Desk, research only", "Signal Desk previews are local research notes, not trade commands. Observation, regime shift, elevated risk, and momentum watch labels stay sandbox-only. Paper simulation. Not financial advice.", "#SignalResearch #PaperSimulation #MarketOps", "Synthetic signal preview card with research-only and sandbox labels.", "Dark card with signal classification chips.", "Hook: A signal preview is not a command."],
    ["x", "Risk-first lab note", "A blocked sample idea is useful. MarketOps is built to notice weak setups in paper simulation before claims get loud. Fake money. In development. Not financial advice.", "#RiskManagement #MarketResearch #PaperTrading", "Risk Desk block card beside paper equity chart, no real-money claim.", "Two-panel card: block summary and lesson learned.", "Hook: Sometimes the best result is a clean rejection."],
    ["x", "Private admin console", "MarketOps now has a localhost-only admin console for reviewing paper results, drafts, and approvals. No public exposure, no posting, no broker connection. Fake-money lab only.", "#LocalFirst #MarketOps #BuildInPublic", "Private local admin console on dark workstation, localhost badge visible.", "Hero card with localhost-only warning.", "Hook: Private cockpit, public-safe process."],
    ["instagram", "Build-in-public lab milestone", "MarketOps is turning into a real paper-simulation operations lab: fake-money runs, dashboard bundles, Signal Desk previews, social drafts, and a private approval console. Everything is in development. Nothing here is financial advice.", "#MarketOps #PaperSimulation #BuildInPublic #AIResearchLab", "Square premium tech-lab graphic with dashboard panels and approval queue cards.", "Carousel: 1 milestone, 2 paper only, 3 review gates, 4 no execution.", "Hook: The lab has a cockpit now."],
    ["instagram", "Paper simulation transparency", "The dashboard is not a victory lap. It is a transparency surface for a fake-money research system while the process is still being built. Paper simulation/sample-data preview only. Not financial advice.", "#PaperTrading #MarketResearch #RiskControls", "Dark editorial card: sample-data dashboard with transparent disclosure labels.", "Carousel cover plus three disclosure slides.", "Hook: The useful part is the honesty."],
    ["instagram", "Risk Desk matters", "Risk controls are supposed to interrupt weak ideas. MarketOps uses fake-money runs to make that interruption visible before any public claim gets taken seriously. Paper simulation only. Not financial advice.", "#RiskManagement #PaperSimulation #MarketOps", "Graphite risk-control card with approved/blocked bars and fake-money footer.", "Carousel: weak idea, risk block, lesson, next review.", "Hook: A block is data."],
    ["instagram", "Signal Desk boundaries", "MarketOps Signal Desk previews are research labels, not instructions. Observation. Regime shift. Elevated risk. Momentum watch. Everything stays sandbox-only until reviewed. Not financial advice.", "#SignalResearch #AITradingLab #PaperSimulation", "Signal taxonomy card with sandbox-only labels and no execution button.", "Carousel: classifications, research use, no execution, human review.", "Hook: Labels, not orders."],
    ["instagram", "Private review queue", "Before a MarketOps draft becomes useful outside the lab, it hits local review first. YES, NO, NEEDS EDIT, HOLD, ESCALATE. No auto-posting. No external sending. Fake-money lab only.", "#LocalFirst #BuildInPublic #MarketOps", "Approval queue UI mockup with five local-only decision buttons.", "Single square card with button row and no external-send badge.", "Hook: Review before reach."],
    ["instagram", "No shiny shortcuts", "MarketOps is intentionally boring where it matters: paper simulation, local QA, risk checks, and human review gates. That is the foundation before anything bigger. In development. Not financial advice.", "#MarketResearch #PaperSimulation #AIResearchLab", "Dark premium lab bench with checklists, charts, and review cards.", "Carousel: boring systems, fake money, QA, review.", "Hook: Boring is a feature."],
    ["x", "Media pipeline next", "Next MarketOps media work is prompts and preview cards first: image ideas, short-video hooks, avatar scripts, and brand-safety checks. No uploads, no auto-posting. Paper simulation only.", "#ContentOps #MarketOps #BuildInPublic", "Media prompt cards arranged beside admin review queue.", "Grid card showing prompts, captions, and approvals.", "Hook: Content pipeline, brakes installed."],
    ["x", "Step 0 is stable", "Step 0 gave MarketOps a local paper engine, office runner, agent reviews, approval queue, and private review console. Step 1 waits for explicit data-provider planning. Fake money only. Not financial advice.", "#MarketOps #PaperSimulation #AIResearch", "Milestone card with Step 0 complete and Step 1 gated.", "Timeline card from Step 0 to gated Step 1.", "Hook: Stable baseline before new inputs."]
  ];

  return {
    schemaVersion: "0.1",
    generatedAt,
    mode: "paper_simulation",
    localOnly: true,
    platforms: ["instagram", "x"],
    deferredPlatforms: ["tiktok", "youtube", "linkedin", "facebook"],
    externalSendingEnabled: false,
    apiPostingEnabled: false,
    publishAllowed: false,
    items: drafts.map(([platform, title, caption, hashtags, imagePrompt, layoutIdea, videoHook], index) => ({
      ...common,
      id: `ig-x-hype-preview-${String(index + 1).padStart(3, "0")}`,
      platform,
      title,
      caption,
      hashtags: hashtags.split(" "),
      imagePrompt,
      stillCardLayoutIdea: layoutIdea,
      videoHook,
      approvalQuestion: `Review this ${platform} draft for possible later manual posting?`
    }))
  };
}

function buildHypeReport(bundle) {
  const rows = bundle.items.map((item) => `| ${item.platform} | ${item.title} | ${item.approvalStatus} | ${item.publishMode} | ${item.apiPosting} |`).join("\n");
  return `# MarketOps IG/X Hype Post Previews v0.1

Generated: ${bundle.generatedAt}

## Scope

These are local-only IG/X draft previews for human review. They are build-in-public style posts for a paper-simulation MarketOps lab. They do not post, schedule, upload, call APIs, or imply real-money performance.

## Drafts

| Platform | Draft | Approval Status | Publish Mode | API Posting |
|---|---|---|---|---|
${rows}

## Safety

- Paper simulation / fake money / in development language is required.
- Not financial advice disclosure is required.
- No guaranteed outcome claims.
- No live-trading implication.
- No paid signal or subscriber claim.
- TikTok, YouTube, LinkedIn, and Facebook remain deferred or script-only.
`;
}

function buildHypeGallery(bundle) {
  const cards = bundle.items.map((item) => `
    <article class="card ${item.platform}">
      <p class="eyebrow">${item.platform}</p>
      <h2>${item.title}</h2>
      <p>${item.caption}</p>
      <p class="tags">${item.hashtags.join(" ")}</p>
      <p><strong>Image prompt:</strong> ${item.imagePrompt}</p>
      <p><strong>Layout:</strong> ${item.stillCardLayoutIdea}</p>
      <p><strong>Hook:</strong> ${item.videoHook}</p>
      <div class="labels">${item.disclosureFlags.map((flag) => `<span>${flag}</span>`).join("")}</div>
    </article>`).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MarketOps IG/X Preview Gallery</title>
  <style>
    :root { color-scheme: dark; --bg:#05080c; --panel:#111a24; --text:#e8edf2; --muted:#a7b0ba; --accent:#f05a3c; --line:rgba(150,170,190,.22); }
    body { margin:0; background:radial-gradient(circle at top right, rgba(240,90,60,.14), transparent 34%), var(--bg); color:var(--text); font-family:Inter, ui-sans-serif, system-ui, Segoe UI, sans-serif; }
    main { width:min(1180px, calc(100% - 28px)); margin:0 auto; padding:32px 0; }
    .hero,.card { background:linear-gradient(145deg, rgba(22,34,48,.96), rgba(8,13,18,.96)); border:1px solid var(--line); border-radius:10px; box-shadow:0 18px 48px rgba(0,0,0,.26); }
    .hero { padding:26px; margin-bottom:16px; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:14px; }
    .card { padding:18px; }
    .eyebrow { color:var(--accent); text-transform:uppercase; letter-spacing:.12em; font-size:.75rem; margin:0 0 8px; }
    p { color:var(--muted); line-height:1.5; }
    .tags { color:#ffb09f; }
    .labels { display:flex; flex-wrap:wrap; gap:6px; }
    .labels span { border:1px solid var(--line); border-radius:999px; padding:4px 8px; color:var(--muted); font-size:.72rem; }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <p class="eyebrow">Local-only media preview</p>
      <h1>MarketOps IG/X Preview Gallery</h1>
      <p>Static preview cards only. No posting, upload, API calls, scheduling, or external sending.</p>
    </section>
    <section class="grid">${cards}</section>
  </main>
</body>
</html>`;
}

function buildReport(bundle) {
  const rows = bundle.previews.map((item) => `| ${item.platform} | ${item.phase} | ${item.contentType} | ${item.title} | ${item.reviewStatus} | ${item.publishAllowed} |`).join("\n");
  const artifactRows = bundle.previews.map((item) => {
    const textVariants = item.captionVariants || item.hookOptions || [];
    const visualIdeas = item.imagePromptIdeas || item.brollIdeas || [];
    const sequenceIdeas = item.carouselOutline || item.storyboardBullets || [];
    return `| ${item.title} | ${textVariants.length} | ${visualIdeas.length} | ${sequenceIdeas.length} | ${item.complianceDisclaimer} |`;
  }).join("\n");
  return `# MarketOps Social Preview Sandbox v0.1

Generated: ${bundle.generatedAt}

## Scope

This is a local-only preview sandbox. It creates draft social copy and future video-script ideas for review. It does not post, send, call APIs, upload, schedule, or publish.

## Platform Priority

- Active preview: Instagram, X
- Future prep only: TikTok, YouTube
- Deferred: LinkedIn, Facebook

## Preview Items

| Platform | Phase | Type | Title | Review Status | Publish Allowed |
|---|---|---|---|---|---:|
${rows}

## Preview Artifacts

| Draft | Text/Hook Variants | Still/B-roll Ideas | Carousel/Storyboard Beats | Disclaimer |
|---|---:|---:|---:|---|
${artifactRows}

## Safety

- Paper simulation only.
- Fake/sample money only.
- Not financial advice.
- No guaranteed outcome language.
- No live-trading implication.
- No subscriber execution claims.
- Human review required before any future manual use.
`;
}

function buildIgXPrepReport(bundle) {
  const workflow = bundle.igXPublishingWorkflow;
  const rows = workflow.platforms.map((item) => `| ${item.platform} | ${item.title} | ${item.status} | ${item.publishMode} | ${item.apiPostingEnabled} | ${item.actualPostingEnabled} |`).join("\n");
  return `# MarketOps IG/X Publishing Prep v0.1

Generated: ${bundle.generatedAt}

## Status

IG and X are ready for approval-gated manual-post preparation only. No API posting, scheduling, automatic publishing, external sending, or credential handling is enabled.

## What Is Ready

- Public-safe IG/X draft copy exists in the local social preview sandbox.
- Each IG/X item has caption, hashtags, link target, still-image prompt, paper-money disclosure, and not-financial-advice disclosure fields.
- YES approval can mark a draft for later manual copy/paste use only.

## What Remains Manual

- Account login.
- Final human copy review.
- Final image/video selection.
- Manual copy/paste posting, if approved later by the user.

## Disabled

- API posting.
- Auto-posting.
- Scheduling.
- Credential storage.
- TikTok/YouTube posting adapters.
- LinkedIn/Facebook rollout.

## Platform Readiness

| Platform | Draft | Status | Publish Mode | API Posting | Actual Posting |
|---|---|---|---|---:|---:|
${rows}

## Deferred / Simulated Platforms

- TikTok: approval simulation and script review only until video quality improves.
- YouTube: approval simulation and script review only until video quality improves.
- LinkedIn: deferred until writing/video quality is more mature.
- Facebook: deferred until broader distribution is worth testing.

## Missing Account Checks

- Confirm final IG handle and account security.
- Confirm final X handle and account security.
- Confirm password-manager entries and two-factor setup outside the repo.
- Confirm manual posting workflow before any public use.

## Video / Avatar Resource Gaps

- Image generation workflow is not connected.
- Short video generation workflow is not connected.
- Avatar presenter workflow is not connected.
- Captions/subtitles are prompt-only for now.
- No automatic upload or post path exists.

## Next Recommended Pass

Run a manual review of the IG/X drafts in the admin console, approve only drafts that still read as paper simulation and fake/sample money, then prepare separate exported assets for manual posting.`;
}

function runSocialPreview() {
  const bundle = buildPreviews();
  const hypeBundle = buildHypePosts(bundle.generatedAt);
  writeJson(previewPath, bundle);
  writeJson(igXPrepPath, bundle.igXPublishingWorkflow);
  writeJson(hypePreviewPath, hypeBundle);
  writeText(reportPath, buildReport(bundle));
  writeText(igXPrepReportPath, buildIgXPrepReport(bundle));
  writeText(hypePreviewReportPath, buildHypeReport(hypeBundle));
  writeText(hypePreviewGalleryPath, buildHypeGallery(hypeBundle));
  console.log("MarketOps social preview sandbox generated");
  console.log(`previews: ${bundle.previews.length}`);
  console.log(`ig/x hype previews: ${hypeBundle.items.length}`);
  console.log(`active platforms: ${bundle.activePlatforms.join(", ")}`);
  console.log(`future prep: ${bundle.futurePrepPlatforms.join(", ")}`);
  console.log(`deferred: ${bundle.deferredPlatforms.join(", ")}`);
  console.log(`preview bundle: ${previewPath}`);
  console.log(`ig/x prep bundle: ${igXPrepPath}`);
  console.log(`ig/x hype bundle: ${hypePreviewPath}`);
  console.log(`report: ${reportPath}`);
  console.log(`ig/x prep report: ${igXPrepReportPath}`);
  console.log(`ig/x hype report: ${hypePreviewReportPath}`);
  return { bundle, previewPath, reportPath };
}

if (require.main === module) {
  try {
    runSocialPreview();
  } catch (error) {
    console.error(`social:preview failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { runSocialPreview, previewPath, reportPath, igXPrepPath, igXPrepReportPath, hypePreviewPath, hypePreviewReportPath };
