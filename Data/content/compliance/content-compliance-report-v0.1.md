# MarketOps Content Compliance Report v0.1

Status: passed
Generated at: 2026-05-13T20:42:22.287Z
Publish allowed: false

## Scope

This report checks generated MarketOps content drafts, queue records, and public-facing content packs. Drafts remain local, review-gated, and disabled for publishing.

## Scan Result

No restricted terms were found in generated draft content.

## Checks

- PASS: Config mode is paper_simulation
- PASS: allowBrokerConnection is false
- PASS: allowLiveTrading is false
- PASS: allowSmsAlerts is false
- PASS: allowSubscriberSignals is false
- PASS: Required script exists: office:content
- PASS: Required script exists: office:queue
- PASS: Required script exists: office:qa
- PASS: Required script exists: office:run
- PASS: Required content folder exists: content
- PASS: Required content folder exists: blogs
- PASS: Required content folder exists: reports
- PASS: Required content folder exists: social
- PASS: Required content folder exists: x
- PASS: Required content folder exists: instagram
- PASS: Required content folder exists: facebook
- PASS: Required content folder exists: linkedin
- PASS: Required content folder exists: video
- PASS: Required content folder exists: video-packages
- PASS: Required content folder exists: avatar
- PASS: Required content folder exists: queue
- PASS: Required content folder exists: compliance
- PASS: Required content folder exists: archive
- PASS: Required content folder exists: logs
- PASS: Required generated file exists: weekly-marketops-field-report-v0.1.md
- PASS: Required generated file exists: monthly-marketops-lab-report-v0.1.md
- PASS: Required generated file exists: trade-case-study-v0.1.md
- PASS: Required generated file exists: social-pack-v0.1.json
- PASS: Required generated file exists: social-pack-v0.1.md
- PASS: Required generated file exists: faceless-video-pack-v0.1.md
- PASS: Required generated file exists: avatar-presenter-pack-v0.1.md
- PASS: Required generated file exists: video-generation-packages-v0.1.json
- PASS: Required generated file exists: video-generation-packages-v0.1.md
- PASS: Required generated file exists: video-generation-specialist-report-v0.1.md
- PASS: Required generated file exists: content-queue-v0.1.json
- PASS: Required generated file exists: latest-office-run-summary.json
- PASS: Required generated file exists: approved-content-v0.1.json
- PASS: Content queue contains report, social, video, avatar, and video package drafts - 33 items
- PASS: Video Generation Specialist queue items exist - 16 item(s)
- PASS: Every queue item requires draft review
- PASS: Every queue item has publishAllowed false
- PASS: Approved content output preserves compliance and publishAllowed false - 0 item(s)
- PASS: No broker/live/social posting dependencies - No risky integration packages found.
- PASS: Video package bundle is valid JSON - 16 package(s)
- PASS: Video package bundle disables publish/upload/API
- PASS: Every video package is review-gated with paper labels
- PASS: Generated content compliance scan passed - 18 file(s) scanned.

## Publishing Boundary

All generated items must remain status draft_review_required with publishAllowed false until a human review approves a separate manual publishing step. No social posting, email sending, payment flow, live data fetch, broker connection, or real-money action is enabled.
