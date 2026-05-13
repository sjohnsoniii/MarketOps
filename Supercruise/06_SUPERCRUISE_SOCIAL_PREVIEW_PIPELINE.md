# Supercruise Social Preview Pipeline v0.1

## Purpose

Generate reviewable social media drafts and preview artifacts without posting anything.

## Phase Priority

### Phase 1 Active

- Instagram
- X

### Phase 2 Future

- TikTok
- YouTube

Reason: video/avatar quality needs several iterations before these become useful.

### Phase 3 Deferred

- LinkedIn
- Facebook

Reason: wait for stronger writer polish and more mature brand confidence.

## Outputs

For IG/X, generate:

- post text drafts
- caption variants
- image/still prompt ideas
- carousel outline ideas
- compliance-safe disclaimers
- hashtag candidates
- link targets
- approval items

For TT/YT future prep:

- short video script drafts
- avatar script drafts
- storyboard bullets
- hook options
- b-roll ideas
- caption/title ideas
- approval items

No video rendering required unless already supported locally. If not supported, generate scripts/prompts only.

## Paths

Social preview data:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Data\social-previews`

Social reports:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Reports\Social`

Social docs:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Docs\Social`

## Safety Rules

All social previews must:

- say paper simulation/fake money where performance is discussed
- avoid financial advice
- avoid buy/sell/copy language
- avoid guaranteed returns
- avoid live-trading implication
- avoid subscriber promise
- avoid unreviewed claims
- avoid internal IDs/local paths/secrets

## Approval Queue Integration

Each draft should create approval items with:

- platform
- content type
- preview text
- safety labels
- YES/NO/NEEDS_EDIT decision

## Admin Console Integration

Admin interface should display:

- X drafts
- Instagram drafts
- future TT/YT draft scripts
- approval question
- safety labels
- source paths

## Suggested npm Scripts

- `social:check`
- `social:qa`
- `social:preview`
- `social:queue`

## QA Rules

Fail if:

- any social preview has API posting code
- any social preview claims live trading
- any social preview says guaranteed returns
- any social preview contains buy/sell/copy trade language
- any social preview lacks review status
- LinkedIn/Facebook are active before allowed
- TikTok/YouTube marked posting-ready before video pipeline quality is approved
