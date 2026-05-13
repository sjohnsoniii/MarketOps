# MarketOps Private Admin Server v0.1

Generated: 2026-05-08T19:17:11.514Z

## Server

- Local URL: http://localhost:3131
- Default host binding: 127.0.0.1 / localhost only
- Default port: 3131
- Future private-network access: Tailscale device access after a separate review

## Auth Behavior

- Reads MARKETOPS_ADMIN_PIN or ADMIN_PIN from local environment or .env.local.
- Does not print secrets.
- If no PIN exists, localhost-only development mode is allowed with a visible warning.
- Non-localhost access requires a PIN.

## Data Sources

- Data\approvals\approval-queue-latest.json
- Data\approvals\admin-review-state-v0.1.json
- Data\social-previews\social-preview-sandbox-v0.1.json
- Data\social-previews\ig-x-publishing-prep-v0.1.json
- Data\signal-previews\synthetic-signal-previews-v0.1.json
- Reports\marketops-report-index-v0.1.md
- Data\logs

## Review Buttons

YES, NO, NEEDS EDIT, HOLD, and ESCALATE update local review-state JSON only. They do not post, send, publish, email, signal, trade, deploy, call APIs, or connect to brokers.

## IG/X Manual-Post Readiness

IG and X drafts can be marked approved_for_manual_post inside local review state. The server shows copy/paste captions, links, image prompts, and paper-money / not-financial-advice disclosure checks. API posting remains disabled.

## Disabled Features

- Public internet exposure
- Social platform API posting
- TikTok/YouTube posting
- LinkedIn/Facebook posting
- Email/SMS sending
- Broker/live trading
- Payment/subscription logic
- External API calls

## Next Recommended Pass

Use the localhost server for manual review. Add Tailscale reachability only after confirming device ACLs, admin PIN configuration, and a fresh safety check.
