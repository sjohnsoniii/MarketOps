# MarketOps Social Account Readiness v0.1

Generated at: 2026-05-08T03:26:50.683Z

## Scope

This is a local-only readiness check for MarketOps social publishing preparation. No credentials, secrets, tokens, API keys, or platform sessions are stored here. No social auto-posting is enabled.

## Active Platforms

| Platform | Readiness | Posting Mode | Manual Posting Ready | Missing Items |
|---|---|---:|---:|---|
| instagram | NEEDS_ACCOUNT_DETAIL_REVIEW | manual_only | false | handle, passwordManagerEntryName, twoFactorEnabled confirmation, manual posting device/workflow |
| x | NEEDS_ACCOUNT_DETAIL_REVIEW | manual_only | false | handle, passwordManagerEntryName, twoFactorEnabled confirmation, manual posting device/workflow |
| tiktok | NEEDS_ACCOUNT_DETAIL_REVIEW | manual_only | false | handle, passwordManagerEntryName, twoFactorEnabled confirmation, manual posting device/workflow |
| youtube | NEEDS_ACCOUNT_DETAIL_REVIEW | manual_only | false | handle/channel, passwordManagerEntryName, twoFactorEnabled confirmation, manual posting device/workflow |

## Deferred Platforms

| Platform | Readiness | Posting Mode | Missing Items |
|---|---|---|---|
| linkedin | DEFERRED | draft_export_only | deferred |
| facebook | DEFERRED | draft_export_only | deferred |

## Manual Posting Requirements

- Confirm platform handle/channel.
- Store account credentials only in a password manager or private local secret store.
- Confirm recovery options and two-factor status.
- Review every draft for paper-simulation transparency and not-financial-advice language.
- Export drafts manually; do not auto-post.

## Future API Posting Requirements

- YouTube: Google/YouTube Data API with OAuth review later.
- TikTok: developer app and scopes later.
- Instagram: Meta/Instagram professional account permissions later.
- X: developer app/API access later.

## Credential Reminder

Do not paste passwords, tokens, recovery codes, API keys, OAuth refresh tokens, or private account details into chat, reports, templates, or committed files.

## Recommended Next Steps

1. Fill in non-secret account references in a local ignored file if desired.
2. Confirm manual posting workflow for IG, X, TikTok, and YouTube Shorts.
3. Keep LinkedIn and Facebook deferred.
4. Use the draft publishing checklist before posting anything manually.
