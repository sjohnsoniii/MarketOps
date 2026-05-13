# MarketOps Private Admin Console Plan v0.1

Generated: 2026-05-08T18:27:45.881Z

## Purpose

MarketOps needs a private operator console for reviewing local sandbox outputs, approval queues, social drafts, signal previews, reports, and video/avatar scripts. This console is not a public website and must never become an external posting, alerting, trading, email, or deployment surface.

## Why MAC Address Allowlisting Is Not The Right Internet Control

MAC addresses are link-local network identifiers. A browser request from an internet-hosted app does not reliably expose the visitor device MAC address to the server, and routers, VPNs, and cellular networks do not forward it as an application-level identity. MAC addresses can also be spoofed on local networks. For an internet-accessible admin console, device identity should come from authenticated private-network access, not MAC filtering.

## Recommended Access Path

### Phase 1: Localhost / Private Local Console

- Keep the console as static local files under Admin\review-console.
- Open it directly on the operator machine or through a localhost-only static server.
- No public DNS, no public hosting, no external posting controls.

### Phase 2: Tailscale Private Access

- Put the MarketOps operator machine and approved devices on a private Tailnet.
- Serve the console only on a private Tailscale address or localhost forwarded through Tailscale.
- Use Tailscale device identity, user identity, ACLs, and device approval.
- Add the future Beast PC as a named approved device before it can reach the console.

### Phase 3: Cloudflare Access / WARP Later

- Consider Cloudflare Access only after the local and Tailscale phases are stable.
- Require identity provider login, device posture, and explicit allow policies.
- Keep the admin console private; do not convert it into a public route.

## Admin Auth Requirements

- Human login or private-network identity required before remote access is allowed.
- Device approval required for any new workstation.
- Approval actions remain local review guidance only.
- YES approval never means post now, send now, trade now, email now, publish now, or deploy now.

## No Public Exposure Rule

The admin console is private infrastructure. It must not be copied to sj3labs, deployed publicly, linked from public pages, or exposed without a private access layer and a fresh safety review.
