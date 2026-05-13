const path = require("path");
const { paths } = require("../utils/paths");
const { ensureOfficeContentDirs, writeJson, readJson } = require("./officeContentUtils");

function rel(filePath) {
  return path.relative(paths.projectRoot, filePath).replace(/\\/g, "/");
}

function baseItem({ id, type, platform, title, filePath, notes }) {
  return {
    id,
    type,
    platform: platform || null,
    title,
    path: rel(filePath),
    status: "draft_review_required",
    generatedAt: new Date().toISOString(),
    complianceStatus: "pending_scan",
    publishAllowed: false,
    notes: notes || "Local draft only. Human review required before any external use."
  };
}

function buildContentQueue() {
  ensureOfficeContentDirs();
  const socialPack = readJson(paths.socialPackJson, { items: [] }) || { items: [] };
  const videoPackages = readJson(paths.videoPackagesJson, { packages: [] }) || { packages: [] };
  const socialItems = Array.isArray(socialPack.items) ? socialPack.items : [];
  const videoPackageItems = Array.isArray(videoPackages.packages) ? videoPackages.packages : [];
  const generatedAt = new Date().toISOString();

  const queueItems = [
    baseItem({
      id: "queue-weekly-marketops-field-report-v0.1",
      type: "blog_report",
      title: "Weekly MarketOps Field Report Draft v0.1",
      filePath: paths.weeklyMarketOpsFieldReport
    }),
    baseItem({
      id: "queue-monthly-marketops-lab-report-v0.1",
      type: "blog_report",
      title: "Monthly MarketOps Lab Report Draft v0.1",
      filePath: paths.monthlyMarketOpsLabReport
    }),
    baseItem({
      id: "queue-trade-case-study-v0.1",
      type: "case_study",
      title: "Trade/Event Case Study Draft v0.1",
      filePath: paths.tradeCaseStudyReport
    }),
    ...socialItems.map((item) => baseItem({
      id: `queue-${item.id}`,
      type: "social_post",
      platform: item.platform,
      title: `${item.platform.toUpperCase()} Draft - ${item.id}`,
      filePath: paths.socialPackJson,
      notes: "Social copy draft. Review required. No auto-posting is enabled."
    })),
    ...[1, 2, 3].map((scriptNumber) => baseItem({
      id: `queue-faceless-video-script-${scriptNumber}-v0.1`,
      type: "faceless_video_script",
      title: `Faceless Video Script ${scriptNumber}`,
      filePath: paths.facelessVideoPack,
      notes: "Short-form video script draft. Review required before production."
    })),
    ...[1, 2, 3].map((scriptNumber) => baseItem({
      id: `queue-avatar-presenter-script-${scriptNumber}-v0.1`,
      type: "avatar_presenter_script",
      title: `Avatar Presenter Script ${scriptNumber}`,
      filePath: paths.avatarPresenterPack,
      notes: "Business-safe presenter script draft. Review required before production."
    })),
    ...videoPackageItems.map((item) => baseItem({
      id: `queue-${item.id}`,
      type: "video_generation_package",
      platform: item.platformTarget,
      title: item.title,
      filePath: paths.videoPackagesJson,
      notes: "Video Generation Specialist package. Review required before any media production, upload, or public use."
    }))
  ].map((item) => ({ ...item, generatedAt }));

  const queue = {
    generatedAt,
    mode: "paper_simulation",
    paperOnly: true,
    sampleData: true,
    status: "draft_review_required",
    publishAllowed: false,
    items: queueItems
  };

  writeJson(paths.contentQueueJson, queue);

  const latestSummary = {
    generatedAt,
    mode: "paper_simulation",
    paperOnly: true,
    sampleData: true,
    contentGenerated: 10,
    videoPackagesGenerated: videoPackageItems.length,
    queueItems: queueItems.length,
    complianceStatus: "pending_scan",
    publishAllowed: false,
    nextHumanAction: "Review drafts, inspect compliance report, and approve or reject items manually. No publishing is automated."
  };

  writeJson(paths.latestOfficeRunSummaryJson, latestSummary);

  console.log("MarketOps local content queue updated");
  console.log(`queue items: ${queueItems.length}`);
  console.log(`publish allowed: ${queue.publishAllowed}`);
  console.log(`queue path: ${paths.contentQueueJson}`);

  return { queue, latestSummary };
}

if (require.main === module) {
  try {
    buildContentQueue();
  } catch (error) {
    console.error(`office:queue failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { buildContentQueue };
