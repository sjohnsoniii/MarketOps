# MarketOps Video / Avatar Resource Plan v0.1

## Current Status

MarketOps video and avatar work is prompts/scripts only. The system can draft concepts, hooks, storyboard beats, caption ideas, and presenter copy for local review. It does not render video, create avatars, upload files, post to platforms, or call external APIs.

## Required Future Tools

- Image generation workflow for stills, thumbnails, and carousel graphics.
- Short video generation workflow for local draft clips.
- Avatar / presenter workflow for business-safe MarketOps explainers.
- Caption and subtitle generator for accessibility and platform fit.
- Review/export folder for human-approved assets.

## Folder Plan

- Inputs: `Data/social-previews`
- Video prompts: `Data/social-previews`
- Future rendered drafts: `Data/video-previews`
- Avatar scripts: `Data/content/avatar`
- Review queue: `Data/approvals`
- Export candidates: `Data/social-previews/exports`
- Media source inputs: `Media/inputs`
- Local rendered outputs: `Media/outputs`
- Human-approved media: `Media/approved`
- Rejected media: `Media/rejected`
- Revision queue: `Media/needs-edit`

## Prompt Format

Each future video prompt should include:

- title
- platform
- duration target
- hook
- scene beats
- chart or dashboard visual suggestions
- on-screen captions
- paper-money disclosure
- not-financial-advice disclosure
- brand-safety notes
- approval status

## Quality Checklist

- Clear in the first few seconds.
- Uses paper simulation / fake-money language when performance is mentioned.
- Avoids trade instructions and exact strategy mechanics.
- Shows charts as sample-data preview only.
- Includes a short disclaimer line.
- Feels polished enough for public review before export.

## Brand-Safety Checklist

- Business-safe presenter tone.
- No sexualized avatar copy.
- No hype claims.
- No guaranteed outcome language.
- No live-trading implication.
- No subscriber execution claim.
- No hidden local paths, IDs, secrets, or internal notes.

## Paper-Money Disclosure Requirement

Every video, avatar script, caption, and visual prompt that mentions performance must clearly state that MarketOps is paper simulation / fake-money / sample-data preview only and is not financial advice.

## No Automatic Upload

This plan does not enable upload, posting, scheduling, email, SMS, API posting, or external publishing. Any future export or upload path requires a separate human-approved integration pass.

## Manual Workflow

1. Review IG/X draft text in the private admin console.
2. Review the still-card prompt and layout idea.
3. Generate or design media outside the automation layer.
4. Place raw inputs in `Media/inputs`.
5. Place rendered local outputs in `Media/outputs`.
6. Move acceptable assets to `Media/approved` only after human review.
7. Move rejected or revision-needed assets to `Media/rejected` or `Media/needs-edit`.

No folder movement posts, uploads, schedules, or sends anything.
