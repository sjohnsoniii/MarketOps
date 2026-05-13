# The Office Multi-Tenant Framework Notes v0.1

## Definition

The Office is the reusable operating framework behind MarketOps. It coordinates desks, queues, QA, reporting, review gates, and local operator tooling.

MarketOps is the first active tenant.

## Tenant Model

A tenant should define:

- tenant name
- project root
- source root
- data output paths
- report output paths
- public-safe export paths
- enabled desks
- safety rules
- review queue behavior
- publish/post/send permissions

## Reusable Desks

Reusable desks should stay project-aware, not project-locked:

- Staff Writer / Reports Desk
- Growth / Social Preview Desk
- Video Generation Specialist
- Avatar / Presenter Desk
- Compliance Desk
- Agent Review / Self-Improvement Desk
- Approval/Admin Desk
- Dashboard/Data Export Desk

## Project-Specific Outputs

Each tenant can choose its own output folders, but outputs should keep the same high-level classes:

- local data
- public-safe exports
- internal reports
- approval queues
- admin review bundles
- logs
- archives

## Current Tenant

MarketOps uses The Office for a paper-only market research lab:

- real market data may feed local paper simulation
- live trading remains disabled
- content generation remains draft/review-only
- social posting remains disabled
- public publishing remains manual unless explicitly approved later

## Future Tenants

Potential future tenants:

- sj3labs
- The Streets
- Battleforge
- other local-first lab projects

Future tenants should inherit the framework patterns but define their own safety labels, public copy rules, data outputs, and approval gates.

## Boundary

Do not make a tenant reusable by weakening safety. Shared code should keep defaults conservative:

- local-only by default
- review-gated by default
- no external posting/sending by default
- no secrets in source or reports
- no publish/deploy actions without explicit approval
