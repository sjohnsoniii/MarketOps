const path = require("path");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const dataRoot = path.join(projectRoot, "Data");
const paperRoot = path.join(dataRoot, "paper");
const historyRoot = path.join(paperRoot, "history");
const cyclesRoot = path.join(paperRoot, "cycles");
const logsRoot = path.join(dataRoot, "logs");
const marketDataRoot = path.join(dataRoot, "market-data");
const alpacaMarketDataRoot = path.join(marketDataRoot, "alpaca");
const contentRoot = path.join(dataRoot, "content");
const agentReviewsRoot = path.join(dataRoot, "agent-reviews");
const agentReviewsArchiveRoot = path.join(agentReviewsRoot, "archive");
const contentBlogsRoot = path.join(contentRoot, "blogs");
const contentReportsRoot = path.join(contentRoot, "reports");
const contentSocialRoot = path.join(contentRoot, "social");
const contentVideoRoot = path.join(contentRoot, "video");
const contentVideoPackagesRoot = path.join(contentRoot, "video-packages");
const contentAvatarRoot = path.join(contentRoot, "avatar");
const contentQueueRoot = path.join(contentRoot, "queue");
const contentComplianceRoot = path.join(contentRoot, "compliance");
const contentArchiveRoot = path.join(contentRoot, "archive");
const sj3labsRoot = path.join(projectRoot, "..", "sj3labs");
const sj3labsMarketOpsDataRoot = path.join(sj3labsRoot, "data", "marketops");

const rollingMarketDataRoot = path.join(marketDataRoot, "rolling");

const vehicleHistoryRoot = path.join(dataRoot, "vehicle-history");

const paths = {
  coreRoot,
  projectRoot,
  dataRoot,
  marketDataRoot,
  alpacaMarketDataRoot,
  rollingMarketDataRoot,
  vehicleHistoryRoot,
  vehicleHistoryJson: path.join(vehicleHistoryRoot, "vehicle-history-14d-v0.1.json"),
  vehicleHistoryReport: path.join(projectRoot, "Reports", "MarketData", "marketops-vehicle-history-14d-v0.1.md"),
  approvalBandsJson: path.join(paperRoot, "risk", "approval-bands-v0.1.json"),
  approvalBandsReport: path.join(projectRoot, "Reports", "Risk", "marketops-approval-bands-v0.1.md"),
  config: path.join(coreRoot, "config", "marketops.phase1.config.json"),
  localEnv: path.join(projectRoot, ".env.local"),
  coreLocalEnv: path.join(coreRoot, ".env.local"),
  sampleVehicles: path.join(dataRoot, "sample", "sample-vehicles-v0.1.json"),
  sampleMarketBars: path.join(dataRoot, "sample", "sample-market-bars-v0.1.json"),
  alpacaMarketDataLatestJson: path.join(alpacaMarketDataRoot, "alpaca-market-data-latest-v0.1.json"),
  alpacaMarketBarsLatestJson: path.join(alpacaMarketDataRoot, "alpaca-market-bars-latest-v0.1.json"),
  alpacaMarketDataReport: path.join(projectRoot, "Reports", "MarketData", "marketops-alpaca-market-data-v0.1.md"),
  backfillDataJson: path.join(marketDataRoot, "backfill-market-data-v0.1.json"),
  backfillReport: path.join(projectRoot, "Reports", "MarketData", "marketops-market-data-backfill-v0.1.md"),
  rollingHistoryJson: path.join(rollingMarketDataRoot, "rolling-market-history-v0.1.json"),
  rollingHistoryReport: path.join(projectRoot, "Reports", "MarketData", "marketops-rolling-market-history-v0.1.md"),
  signalsJson: path.join(paperRoot, "signals", "signal-scan-v0.1.json"),
  riskJson: path.join(paperRoot, "risk", "risk-decisions-v0.1.json"),
  tradesJson: path.join(paperRoot, "trades", "paper-trades-v0.1.json"),
  paperPositionsJson: path.join(paperRoot, "positions", "paper-positions-v0.1.json"),
  paperPerformanceJson: path.join(paperRoot, "performance", "paper-performance-v0.1.json"),
  equityJson: path.join(paperRoot, "equity", "equity-curve-v0.1.json"),
  dashboardJson: path.join(paperRoot, "dashboard", "dashboard-bundle-v0.1.json"),
  cyclesRoot,
  cycleStateJson: path.join(cyclesRoot, "paper-cycle-state-v0.1.json"),
  cycleLatestJson: path.join(cyclesRoot, "paper-cycle-latest-v0.1.json"),
  cycleArchiveRoot: path.join(cyclesRoot, "archive"),
  cycleStatusReport: path.join(projectRoot, "Reports", "Cycles", "marketops-paper-cycle-status-v0.1.md"),
  cycleQaReport: path.join(projectRoot, "Reports", "Cycles", "marketops-paper-cycle-qa-v0.1.md"),
  weatherStationJson: path.join(marketDataRoot, "market-weather-station-v0.1.json"),
  weatherStationReport: path.join(projectRoot, "Reports", "MarketData", "marketops-market-weather-station-v0.1.md"),
  confidenceJson: path.join(paperRoot, "signals", "confidence-calibration-v0.1.json"),
  confidenceReport: path.join(projectRoot, "Reports", "Signals", "marketops-confidence-calibration-v0.1.md"),
  approvalWaterfallJson: path.join(projectRoot, "Data", "approvals", "approval-waterfall-v0.1.json"),
  approvalWaterfallReport: path.join(projectRoot, "Reports", "Approvals", "marketops-approval-waterfall-v0.1.md"),
  fullSimulationQaReport: path.join(projectRoot, "Reports", "QA", "marketops-full-simulation-qa-v0.1.md"),
  tradeRejectionExplainabilityReport: path.join(projectRoot, "Reports", "Risk", "marketops-trade-rejection-explainability-v0.1.md"),
  agentImprovementLoopReport: path.join(projectRoot, "Reports", "Optimization", "marketops-agent-improvement-loop-v0.1.md"),
  dashboardRefreshSchedulePlan: path.join(projectRoot, "Reports", "Automation", "marketops-dashboard-refresh-schedule-plan-v0.1.md"),
  publicDataHandoffPlan: path.join(projectRoot, "Reports", "Dashboard", "marketops-public-data-handoff-plan-v0.1.md"),
  historyRoot,
  logsRoot,
  runHistoryJson: path.join(historyRoot, "run-history.json"),
  latestRunSummaryJson: path.join(historyRoot, "latest-run-summary.json"),
  contentRoot,
  agentReviewsRoot,
  agentReviewsArchiveRoot,
  latestAgentReviewSummaryJson: path.join(agentReviewsRoot, "latest-agent-review-summary.json"),
  improvementBacklog: path.join(agentReviewsRoot, "improvement-backlog-v0.1.md"),
  monthlyHumanReviewBrief: path.join(agentReviewsRoot, "monthly-human-review-brief-v0.1.md"),
  coordinatorReview: path.join(agentReviewsRoot, "coordinator-review-v0.1.md"),
  marketDataReview: path.join(agentReviewsRoot, "market-data-review-v0.1.md"),
  signalReview: path.join(agentReviewsRoot, "signal-review-v0.1.md"),
  riskDeskReview: path.join(agentReviewsRoot, "risk-desk-review-v0.1.md"),
  paperTraderReview: path.join(agentReviewsRoot, "paper-trader-review-v0.1.md"),
  performanceReview: path.join(agentReviewsRoot, "performance-review-v0.1.md"),
  staffWriterReview: path.join(agentReviewsRoot, "staff-writer-review-v0.1.md"),
  growthDeskReview: path.join(agentReviewsRoot, "growth-desk-review-v0.1.md"),
  videoDeskReview: path.join(agentReviewsRoot, "video-desk-review-v0.1.md"),
  avatarDeskReview: path.join(agentReviewsRoot, "avatar-desk-review-v0.1.md"),
  complianceDeskReview: path.join(agentReviewsRoot, "compliance-desk-review-v0.1.md"),
  contentBlogsRoot,
  contentReportsRoot,
  contentSocialRoot,
  contentSocialXRoot: path.join(contentSocialRoot, "x"),
  contentSocialInstagramRoot: path.join(contentSocialRoot, "instagram"),
  contentSocialFacebookRoot: path.join(contentSocialRoot, "facebook"),
  contentSocialLinkedinRoot: path.join(contentSocialRoot, "linkedin"),
  contentVideoRoot,
  contentVideoPackagesRoot,
  contentAvatarRoot,
  contentQueueRoot,
  contentComplianceRoot,
  contentArchiveRoot,
  weeklyMarketOpsFieldReport: path.join(contentBlogsRoot, "weekly-marketops-field-report-v0.1.md"),
  monthlyMarketOpsLabReport: path.join(contentBlogsRoot, "monthly-marketops-lab-report-v0.1.md"),
  tradeCaseStudyReport: path.join(contentReportsRoot, "trade-case-study-v0.1.md"),
  socialPackJson: path.join(contentSocialRoot, "social-pack-v0.1.json"),
  socialPackMarkdown: path.join(contentSocialRoot, "social-pack-v0.1.md"),
  facelessVideoPack: path.join(contentVideoRoot, "faceless-video-pack-v0.1.md"),
  videoPackagesJson: path.join(contentVideoPackagesRoot, "video-generation-packages-v0.1.json"),
  videoPackagesMarkdown: path.join(contentVideoPackagesRoot, "video-generation-packages-v0.1.md"),
  videoSpecialistReport: path.join(contentVideoPackagesRoot, "video-generation-specialist-report-v0.1.md"),
  avatarPresenterPack: path.join(contentAvatarRoot, "avatar-presenter-pack-v0.1.md"),
  contentQueueJson: path.join(contentQueueRoot, "content-queue-v0.1.json"),
  latestOfficeRunSummaryJson: path.join(contentQueueRoot, "latest-office-run-summary.json"),
  contentComplianceReport: path.join(contentComplianceRoot, "content-compliance-report-v0.1.md"),
  sj3labsRoot,
  sj3labsMarketOpsDataRoot,
  siteDashboardPublicV04Json: path.join(sj3labsMarketOpsDataRoot, "dashboard-bundle-public-v0.4.json"),
  siteDashboardPublicV05Json: path.join(sj3labsMarketOpsDataRoot, "dashboard-bundle-public-v0.5.json"),
  reportsDir: path.join(paperRoot, "reports"),
  signalReport: path.join(paperRoot, "reports", "signal-scan-v0.1.md"),
  riskReport: path.join(paperRoot, "reports", "risk-desk-v0.1.md"),
  tradesReport: path.join(paperRoot, "reports", "paper-trades-v0.1.md"),
  equityReport: path.join(paperRoot, "reports", "equity-curve-v0.1.md"),
  performanceReport: path.join(paperRoot, "reports", "performance-summary-v0.1.md"),
  staffWriterReport: path.join(paperRoot, "reports", "staff-writer-brief-v0.1.md"),
  qaReport: path.join(paperRoot, "reports", "qa-report-v0.1.md")
};

module.exports = { paths };

