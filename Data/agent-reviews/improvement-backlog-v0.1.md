# MarketOps Improvement Backlog v0.1

reviewCadence: biweekly_digest  
humanReviewRequired: true  
autoApplyAllowed: false

## Trading / Signals

### PROP-SIGNAL-001: Explain candidate filter outcomes

- proposalId: PROP-SIGNAL-001
- sourceEntity: Signal Desk
- problemObserved: Signals are summarized by count, but the human reviewer cannot quickly see why most events were filtered.
- proposedChange: Add a public-safe reason summary by outcome bucket, avoiding exact formulas.
- expectedBenefit: Improves review quality without exposing strategy mechanics.
- riskOfChange: Too much detail could drift toward strategy disclosure.
- requiredValidation: Compliance review for wording plus paper-only output validation.
- recommendedPriority: medium
- priority: review_next_digest
- promotionPath: idea -> experiment -> paper test -> QA -> human review -> approved change
- humanReviewRequired: true
- autoApplyAllowed: false

### PROP-SIGNAL-002: Add false signal audit notes

- proposalId: PROP-SIGNAL-002
- sourceEntity: Signal Desk
- problemObserved: The signal layer does not yet separate noisy candidates from potentially useful misses.
- proposedChange: Create a review-only false-signal note field for paper experiments.
- expectedBenefit: Helps tune the research process while keeping changes human-approved.
- riskOfChange: Could imply certainty if written too strongly.
- requiredValidation: Staff Writer and compliance review before any public summary.
- recommendedPriority: medium
- priority: review_next_digest
- promotionPath: idea -> experiment -> paper test -> QA -> human review -> approved change
- humanReviewRequired: true
- autoApplyAllowed: false

## Risk

### PROP-RISK-001: Track block reason themes

- proposalId: PROP-RISK-001
- sourceEntity: Risk Desk
- problemObserved: Risk blocks are counted, but recurring themes are not summarized for digest review.
- proposedChange: Group high-level block themes into a review-only summary.
- expectedBenefit: Makes risk discipline easier to inspect over time.
- riskOfChange: Theme labels may oversimplify risk decisions.
- requiredValidation: QA should verify that no private rule details are exposed.
- recommendedPriority: medium
- priority: review_next_digest
- promotionPath: idea -> experiment -> paper test -> QA -> human review -> approved change
- humanReviewRequired: true
- autoApplyAllowed: false

### PROP-RISK-002: Add risk override request template

- proposalId: PROP-RISK-002
- sourceEntity: Risk Desk
- problemObserved: There is no structured way for a human to request a paper-only risk experiment.
- proposedChange: Create a template that requires hypothesis, paper validation, and approval before any rule change.
- expectedBenefit: Keeps experiments disciplined and review-gated.
- riskOfChange: A template could be misread as permission to alter rules automatically.
- requiredValidation: QA must verify autoApplyAllowed remains false.
- recommendedPriority: medium
- priority: review_next_digest
- promotionPath: idea -> experiment -> paper test -> QA -> human review -> approved change
- humanReviewRequired: true
- autoApplyAllowed: false

## Data Quality

### PROP-DATA-001: Expand sample history depth

- proposalId: PROP-DATA-001
- sourceEntity: Market Data Desk
- problemObserved: The current sample dataset is enough for a smoke test but too small for richer pattern review.
- proposedChange: Add more deterministic sample bars for the same public-safe vehicle set, labeled as sample data.
- expectedBenefit: Improves chart continuity, drawdown review, and report realism without using live feeds.
- riskOfChange: More sample rows could create a false sense of evidence if labels are weak.
- requiredValidation: QA must verify sample labels and public disclaimers before use.
- recommendedPriority: medium
- priority: review_next_digest
- promotionPath: idea -> experiment -> paper test -> QA -> human review -> approved change
- humanReviewRequired: true
- autoApplyAllowed: false

### PROP-DATA-002: Add stale sample warning

- proposalId: PROP-DATA-002
- sourceEntity: Market Data Desk
- problemObserved: The system can run repeatedly against unchanged sample data.
- proposedChange: Add an internal warning when repeated runs use the same sample snapshot.
- expectedBenefit: Prevents stale data from being mistaken for fresh research progress.
- riskOfChange: Could add noisy warnings if not scoped to internal reports.
- requiredValidation: Paper run comparison plus QA validation of warning copy.
- recommendedPriority: medium
- priority: review_next_digest
- promotionPath: idea -> experiment -> paper test -> QA -> human review -> approved change
- humanReviewRequired: true
- autoApplyAllowed: false

## Paper Execution

### PROP-PAPER-001: Add execution quality notes

- proposalId: PROP-PAPER-001
- sourceEntity: Paper Trader
- problemObserved: Paper events show outcomes, but not enough review context about simulated execution quality.
- proposedChange: Add high-level notes about timing assumptions and sample limitations.
- expectedBenefit: Improves honesty around fake-money execution results.
- riskOfChange: Could clutter reports if added to every draft.
- requiredValidation: Paper QA should check for concise, public-safe wording.
- recommendedPriority: medium
- priority: review_next_digest
- promotionPath: idea -> experiment -> paper test -> QA -> human review -> approved change
- humanReviewRequired: true
- autoApplyAllowed: false

## Dashboard / Reporting

### PROP-PERF-001: Add rolling paper metrics

- proposalId: PROP-PERF-001
- sourceEntity: Performance Desk
- problemObserved: The dashboard shows current run metrics but limited rolling comparison.
- proposedChange: Add a rolling paper-only view using internal history summaries.
- expectedBenefit: Helps separate one run from trend behavior.
- riskOfChange: Trend views can invite overinterpretation with small samples.
- requiredValidation: Require sample-size warning and compliance review.
- recommendedPriority: medium
- priority: review_next_digest
- promotionPath: idea -> experiment -> paper test -> QA -> human review -> approved change
- humanReviewRequired: true
- autoApplyAllowed: false

## Staff Writer / Blogs

### PROP-WRITER-001: Tighten draft length bands

- proposalId: PROP-WRITER-001
- sourceEntity: Staff Writer
- problemObserved: Generated drafts are safe, but length and density may vary by run.
- proposedChange: Add target length ranges for weekly, monthly, and case study drafts.
- expectedBenefit: Improves consistency for human review.
- riskOfChange: Over-tight limits could flatten useful context.
- requiredValidation: Manual review against the next three draft cycles.
- recommendedPriority: medium
- priority: review_next_digest
- promotionPath: idea -> experiment -> paper test -> QA -> human review -> approved change
- humanReviewRequired: true
- autoApplyAllowed: false

## Growth Desk / Social

### PROP-GROWTH-001: Add platform intent labels

- proposalId: PROP-GROWTH-001
- sourceEntity: Growth Desk
- problemObserved: Social drafts are safe, but they do not clearly label whether a post is educational, build log, or dashboard update.
- proposedChange: Add intent labels to each draft record.
- expectedBenefit: Makes review and scheduling easier without enabling posting.
- riskOfChange: Too many labels could add queue clutter.
- requiredValidation: QA should verify labels are descriptive and not promotional claims.
- recommendedPriority: medium
- priority: review_next_digest
- promotionPath: idea -> experiment -> paper test -> QA -> human review -> approved change
- humanReviewRequired: true
- autoApplyAllowed: false

## Video / Avatar Content

### PROP-VIDEO-001: Add chart asset checklist

- proposalId: PROP-VIDEO-001
- sourceEntity: Video Desk
- problemObserved: Video scripts suggest visuals, but do not list exactly which safe chart image should be captured.
- proposedChange: Add a review-only checklist for dashboard captures and captions.
- expectedBenefit: Speeds video production while staying manual.
- riskOfChange: Could imply final production readiness before review.
- requiredValidation: Human approval before using any asset publicly.
- recommendedPriority: medium
- priority: review_next_digest
- promotionPath: idea -> experiment -> paper test -> QA -> human review -> approved change
- humanReviewRequired: true
- autoApplyAllowed: false

### PROP-VIDGEN-001: Add package scoring rubric

- proposalId: PROP-VIDGEN-001
- sourceEntity: Video Generation Specialist
- problemObserved: Video production packets exist, but the office does not yet rank which concepts are most worth producing first.
- proposedChange: Add a review-only scoring rubric for clarity, compliance, visual feasibility, and platform fit.
- expectedBenefit: Helps the human reviewer choose the best draft without enabling upload or posting.
- riskOfChange: A score could be misread as production approval if labels are weak.
- requiredValidation: QA must verify publishAllowed remains false and every score is advisory only.
- recommendedPriority: medium
- priority: review_next_digest
- promotionPath: idea -> experiment -> paper test -> QA -> human review -> approved change
- humanReviewRequired: true
- autoApplyAllowed: false

### PROP-VIDGEN-002: Add safe asset dependency checklist

- proposalId: PROP-VIDGEN-002
- sourceEntity: Video Generation Specialist
- problemObserved: Packages list shots and B-roll ideas, but not whether each needed asset already exists locally.
- proposedChange: Add a local asset checklist that marks dashboard capture, thumbnail, avatar read, and captions as missing/ready/rejected.
- expectedBenefit: Makes future video production less fuzzy while staying local.
- riskOfChange: Could create unnecessary queue noise if too detailed.
- requiredValidation: Run against local folders only and keep all items draft_review_required.
- recommendedPriority: medium
- priority: review_next_digest
- promotionPath: idea -> experiment -> paper test -> QA -> human review -> approved change
- humanReviewRequired: true
- autoApplyAllowed: false

### PROP-AVATAR-001: Add presenter compliance preface

- proposalId: PROP-AVATAR-001
- sourceEntity: Avatar Desk
- problemObserved: Presenter scripts include disclaimers, but the opening frame could be clearer.
- proposedChange: Add a short first-line compliance preface for presenter drafts.
- expectedBenefit: Reduces risk of viewers missing the paper-only context.
- riskOfChange: Could make scripts feel stiff if overused.
- requiredValidation: Staff Writer review for tone and clarity.
- recommendedPriority: medium
- priority: review_next_digest
- promotionPath: idea -> experiment -> paper test -> QA -> human review -> approved change
- humanReviewRequired: true
- autoApplyAllowed: false

## Compliance

### PROP-COMP-001: Expand review folder scan

- proposalId: PROP-COMP-001
- sourceEntity: Compliance Desk
- problemObserved: Office compliance scans generated content, while agent QA scans review output separately.
- proposedChange: Keep review-output scanning as a separate QA gate and add summary counts to the digest.
- expectedBenefit: Makes safety state visible without overloading the queue.
- riskOfChange: Duplicate scan wording could confuse reviewers.
- requiredValidation: Compare office QA and agent QA outputs for consistency.
- recommendedPriority: medium
- priority: review_next_digest
- promotionPath: idea -> experiment -> paper test -> QA -> human review -> approved change
- humanReviewRequired: true
- autoApplyAllowed: false

### PROP-COMP-002: Add urgent issue routing

- proposalId: PROP-COMP-002
- sourceEntity: Compliance Desk
- problemObserved: The new cadence defers routine items, but urgent safety issues need a distinct path.
- proposedChange: Reserve urgent_human_review for compliance failure, safety risk, or system failure only.
- expectedBenefit: Protects the human from daily noise while preserving interrupt behavior for serious issues.
- riskOfChange: Urgent tagging could be overused unless QA checks the conditions.
- requiredValidation: QA should verify routine proposals default to review_next_digest.
- recommendedPriority: medium
- priority: review_next_digest
- promotionPath: idea -> experiment -> paper test -> QA -> human review -> approved change
- humanReviewRequired: true
- autoApplyAllowed: false

## Automation / QA

### PROP-COORD-001: Add run health trend summary

- proposalId: PROP-COORD-001
- sourceEntity: Coordinator
- problemObserved: The office run records pass/fail state, but the human view does not yet show trend quality across multiple runs.
- proposedChange: Create a paper-only trend summary that compares recent run status, content count, and QA state across the last several internal observations.
- expectedBenefit: Gives the human reviewer a faster view of whether the system is getting steadier or noisier.
- riskOfChange: A weak summary could hide important one-off failures.
- requiredValidation: Paper test against archived observations, then QA checks for missing or stale run fields.
- recommendedPriority: medium
- priority: review_next_digest
- promotionPath: idea -> experiment -> paper test -> QA -> human review -> approved change
- humanReviewRequired: true
- autoApplyAllowed: false

### PROP-COORD-002: Add digest due calculation

- proposalId: PROP-COORD-002
- sourceEntity: Coordinator
- problemObserved: The digest cadence is documented, but the due/not-due decision is still simple.
- proposedChange: Add a deterministic cadence helper that marks whether the next biweekly digest is due, without creating extra human queue burden on routine runs.
- expectedBenefit: Keeps daily reflection useful while avoiding review fatigue.
- riskOfChange: Incorrect cadence logic could delay useful human review.
- requiredValidation: Unit-style paper test with fixed dates and QA checks for cadence fields.
- recommendedPriority: medium
- priority: review_next_digest
- promotionPath: idea -> experiment -> paper test -> QA -> human review -> approved change
- humanReviewRequired: true
- autoApplyAllowed: false
