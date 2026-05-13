const allowedClassifications = [
  "observation",
  "regime_shift",
  "elevated_risk",
  "momentum_watch",
  "volatility_warning",
  "trend_confirmation",
  "synthetic_signal_preview",
  "risk_desk_note"
];

const requiredSafetyLabels = [
  "paper_simulation",
  "research_only",
  "not_financial_advice",
  "no_live_execution",
  "human_review_required",
  "sandbox_only"
];

const complianceLabels = {
  mode: "paper_simulation",
  paperOnly: true,
  sampleData: true,
  researchEducationalOnly: true,
  notFinancialAdvice: true,
  noGuarantee: true,
  noLiveExecution: true,
  noBrokerConnection: true,
  noSocialAutoPosting: true,
  reviewGated: true,
  safetyLabels: requiredSafetyLabels
};

const syntheticSignalSchema = {
  schemaVersion: "marketops-signal-desk-schema-v0.1",
  mode: "paper_simulation",
  sampleData: true,
  purpose: "Future research-alert structure only. Not trade execution, not financial advice, and not live alerts.",
  allowedClassifications,
  requiredFields: [
    "signalKey",
    "classification",
    "title",
    "vehicle",
    "researchSummary",
    "marketObservation",
    "regimeContext",
    "riskLabel",
    "safetyLabels",
    "reviewStatus",
    "publishAllowed",
    "complianceLabels"
  ],
  forbiddenBehaviors: [
    "live execution",
    "broker routing",
    "subscriber account connection",
    "social auto-posting",
    "promise-of-outcome language",
    "entry or exit commands",
    "copy-trading instructions"
  ],
  workflowStates: [
    "draft_research",
    "compliance_review_required",
    "human_review_required",
    "approved_for_future_public_research",
    "rejected_or_archived"
  ],
  defaultState: {
    reviewStatus: "human_review_required",
    publishAllowed: false,
    complianceLabels
  }
};

function buildSyntheticSignalPreviews(generatedAt) {
  const base = {
    generatedAt,
    mode: "paper_simulation",
    sampleData: true,
    researchEducationalOnly: true,
    notFinancialAdvice: true,
    noGuarantee: true,
    noLiveExecution: true,
    reviewStatus: "human_review_required",
    status: "PENDING_REVIEW",
    publishAllowed: false,
    externalSendEnabled: false,
    alertSendingEnabled: false,
    subscriberExecutionEnabled: false,
    safetyLabels: requiredSafetyLabels,
    yesEffect: "Approved for internal research archive or possible future public-safe summary only. Does not send, post, trade, alert, or notify anyone.",
    approvalQuestion: "Approve this signal preview for local research archive only?",
    complianceLabels
  };

  return [
    {
      ...base,
      signalKey: "preview-market-breadth-observation",
      classification: "observation",
      title: "Market breadth observation",
      vehicle: "sample_basket",
      researchSummary: "Sample vehicles show mixed participation, which is useful context for future paper-only watchlist commentary.",
      marketObservation: "A narrow move can make headline strength look cleaner than the underlying sample set.",
      regimeContext: "neutral_to_choppy",
      riskLabel: "routine_review"
    },
    {
      ...base,
      signalKey: "preview-synthetic-regime-shift",
      classification: "regime_shift",
      title: "Synthetic regime shift note",
      vehicle: "synthetic_regime_lab",
      researchSummary: "Synthetic regime scoring shows stronger paper behavior in trend-friendly samples than in inactive or drawdown-heavy samples.",
      marketObservation: "Future commentary should explain regime context before discussing any vehicle setup.",
      regimeContext: "trend_to_chop_transition",
      riskLabel: "review_next_digest"
    },
    {
      ...base,
      signalKey: "preview-elevated-risk",
      classification: "elevated_risk",
      title: "Elevated risk watch",
      vehicle: "sample_watchlist",
      researchSummary: "Risk Desk blocks are treated as useful information, not friction to bypass.",
      marketObservation: "When block counts rise, public commentary should emphasize caution, uncertainty, and paper-only testing.",
      regimeContext: "risk_controls_active",
      riskLabel: "elevated_review"
    },
    {
      ...base,
      signalKey: "preview-momentum-watch",
      classification: "momentum_watch",
      title: "Momentum watch preview",
      vehicle: "sample_momentum_group",
      researchSummary: "Momentum observations can become future watchlist commentary only after compliance and human review.",
      marketObservation: "The Signal Desk can describe direction bias, window, invalidation idea, and risk level without telling anyone what to do.",
      regimeContext: "paper_momentum_sample",
      riskLabel: "routine_review"
    },
    {
      ...base,
      signalKey: "preview-volatility-warning",
      classification: "volatility_warning",
      title: "Volatility warning preview",
      vehicle: "synthetic_panic_drawdown",
      researchSummary: "Synthetic panic drawdown remains the weakest regime in the current lab sample.",
      marketObservation: "Future public notes should flag uncertainty and avoid confidence theater during volatility spikes.",
      regimeContext: "panic_drawdown",
      riskLabel: "elevated_review"
    },
    {
      ...base,
      signalKey: "preview-trend-confirmation",
      classification: "trend_confirmation",
      title: "Trend confirmation research note",
      vehicle: "synthetic_trend_up",
      researchSummary: "Trend confirmation language should explain what changed in the sample context and what would invalidate the research view.",
      marketObservation: "Confirmation is a research label, not an instruction.",
      regimeContext: "trend_up",
      riskLabel: "routine_review"
    },
    {
      ...base,
      signalKey: "preview-synthetic-signal",
      classification: "synthetic_signal_preview",
      title: "Synthetic signal preview",
      vehicle: "synthetic_demo_vehicle",
      researchSummary: "This preview exists to test future structure, labeling, compliance review, and dashboard rendering.",
      marketObservation: "Synthetic previews should never be treated as real-time market alerts.",
      regimeContext: "local_sample_only",
      riskLabel: "review_next_digest"
    },
    {
      ...base,
      signalKey: "preview-risk-desk-note",
      classification: "risk_desk_note",
      title: "Risk Desk note",
      vehicle: "sample_risk_queue",
      researchSummary: "Risk Desk notes explain why a sample event was held for review instead of promoted.",
      marketObservation: "The useful signal may be that the system chose caution in a paper-only context.",
      regimeContext: "risk_review_active",
      riskLabel: "elevated_review"
    }
  ];
}

function buildReviewWorkflow(generatedAt) {
  return {
    generatedAt,
    mode: "paper_simulation",
    sampleData: true,
    researchEducationalOnly: true,
    notFinancialAdvice: true,
    noGuarantee: true,
    noLiveExecution: true,
    externalSendEnabled: false,
    alertSendingEnabled: false,
    subscriberExecutionEnabled: false,
    safetyLabels: requiredSafetyLabels,
    workflowVersion: "marketops-signal-desk-workflow-v0.1",
    workflow: [
      {
        step: 1,
        name: "draft_research",
        owner: "Signal Desk",
        output: "research note or synthetic signal preview",
        publishAllowed: false
      },
      {
        step: 2,
        name: "compliance_review_required",
        owner: "Compliance Desk",
        output: "label and language check",
        publishAllowed: false
      },
      {
        step: 3,
        name: "human_review_required",
        owner: "Sam",
        output: "approve, reject, or request revision",
        publishAllowed: false
      },
      {
        step: 4,
        name: "approved_for_future_public_research",
        owner: "Manual publishing process",
        output: "future public-safe research commentary only",
        publishAllowed: false
      }
    ],
    guardrails: [
      "No order execution.",
      "No broker connection.",
      "No account connection.",
      "No social auto-posting.",
      "No guarantee language.",
      "No entry or exit commands.",
      "Every item remains review-gated by default."
    ]
  };
}

module.exports = {
  allowedClassifications,
  requiredSafetyLabels,
  complianceLabels,
  syntheticSignalSchema,
  buildSyntheticSignalPreviews,
  buildReviewWorkflow
};
