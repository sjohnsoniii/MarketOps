# MarketOps Agent Improvement Loop v0.1

Generated: 2026-05-14T02:20:20Z

## Current State

- Latest paper run: paper-20260514-022020137Z
- Latest cycle: cycle-20260514-0220
- Cycle status: active
- Starting cycle balance: 1000
- Current cycle balance: 1000
- Approved fake paper trades: 0
- Rejected or observation-only signals: 8
- External effects: false
- Publish allowed: false
- Live trading enabled: false
- Broker execution enabled: false

## Improvement Loop

Agents may propose improvements from observed evidence only:

- cycle performance and depletion events
- rejected trade reasons
- bad fake paper trades
- missed watchlist moves
- drawdown behavior
- stale-data or failed-refresh patterns
- market regime summaries

Agents must write improvements as recommendations, playbook updates, parameter suggestions, or versioned strategy proposals. They must not freely rewrite core code, weaken risk gates, enable execution, or auto-apply trading behavior.

## Required Proposal Fields

Each improvement proposal must include:

- observed evidence
- rejected trade or cycle metric it responds to
- expected benefit
- risk introduced
- how it will be tested
- target script or playbook area
- human-review-needed flag
- approval status

## Current Observations

- Risk Desk rejected 8 of 8 reviewed signals.
- Dominant rejection reasons were non-candidate movement, low confidence, long/up-only gate, and missing invalidation on crypto rows.
- The public dashboard can still show movement through watchlist summaries, direction counts, movement buckets, rejection counts, almost-approved candidates, bot activity, and cycle status.
- The current cycle is active and not depleted, so no reset is required.

## Current Recommendations

1. Track rejected watchlist moves against later outcomes before loosening gates.
2. Improve candidate scoring language so small moves can be shown as watchlist movement without being presented as trade-ready.
3. Require clear invalidation text before a candidate can become approvable.
4. Keep long/up-only, no margin, no leverage, no options, and no futures gates until human-approved risk changes exist.
5. Add a cycle postmortem report when balance reaches the depletion threshold.

## Depleted Cycle Behavior

If a cycle is depleted:

- mark the cycle `reset_pending`
- write the cycle closeout report
- record the depletion trigger and final balance
- generate a deeper postmortem
- propose next-cycle improvements
- keep proposed changes review-gated
- schedule the next cycle for the next market morning
- do not silently reset

## Surviving Cycle Behavior

If a cycle survives:

- keep the same cycle active
- accumulate approved and rejected trade counts
- track days and hours survived
- record lessons learned
- do not reset daily
- do not force a strategy change just because a refresh ran

## Guardrails

- externalEffects: false
- publishAllowed: false
- no live trading
- no broker execution
- no social posting
- no email/SMS
- no payments
- no secret exposure
- no automatic risk-gate weakening
- no code self-modification without QA and human review
