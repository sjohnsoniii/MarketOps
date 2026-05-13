# MarketOps Private Admin Server v0.1

## Purpose

The MarketOps private admin server is a local browser console for reviewing paper-simulation outputs, approval queues, social drafts, signal previews, reports, and local review decisions.

It is not a public website and it does not post, send, email, trade, publish, call external APIs, connect brokers, or deploy anything.

## Start The Server

From `Source\marketops-core`:

```powershell
npm run admin:serve
```

Open locally:

```text
http://localhost:3131
```

The server listens on `127.0.0.1` by default.

## Stop The Server

Press `Ctrl+C` in the terminal running `npm run admin:serve`.

## Tailscale Later

Tailscale is the recommended private network layer for later device access. In a later pass, an approved device may reach the same local server through:

```text
http://<tailscale-device-name>:3131
http://<tailscale-ip>:3131
```

Do not expose this server to the public internet. Tailscale access should require approved devices, ACLs, and a local admin PIN.

## Why MAC Address Filtering Is Not Used

MAC addresses are local network identifiers. Internet-hosted web apps do not reliably receive a visitor device MAC address, and MAC filtering is not a secure identity layer for browser access. Tailscale device identity, private-network ACLs, and an admin PIN are safer controls.

## Local Admin PIN

Set the admin PIN locally with one of these options:

```powershell
$env:MARKETOPS_ADMIN_PIN="choose-a-local-pin"
npm run admin:serve
```

or create an ignored local file:

```text
C:\Users\sjohn\Desktop\Projects\MarketOps\.env.local
```

with:

```text
MARKETOPS_ADMIN_PIN=choose-a-local-pin
```

Do not commit real PINs, credentials, tokens, or secrets.

If no PIN exists, localhost-only development mode is allowed with a visible warning. Non-localhost access must configure a PIN.

## What The Console Can Do

- Read local approval queues.
- Read local social preview drafts.
- Read local signal previews.
- Read latest local log summaries.
- Show Step 0 and QA status context.
- Write local review-state decisions:
  - YES
  - NO
  - NEEDS EDIT
  - HOLD
  - ESCALATE

## What The Console Cannot Do

- Post to Instagram or X.
- Post to TikTok, YouTube, LinkedIn, or Facebook.
- Send email or SMS.
- Send signals externally.
- Connect to brokers.
- Trade real money.
- Fetch live market data.
- Publish or deploy.
- Auto-approve drafts.

## Safety Boundaries

All actions are local-only and review-gated. YES means approved for later manual/gated use only. It does not mean post now, send now, trade now, publish now, or deploy now.

## No Public Deployment Warning

This server must not be deployed publicly. If private remote access is needed, use Tailscale first and run a fresh safety check before enabling non-localhost binding.
