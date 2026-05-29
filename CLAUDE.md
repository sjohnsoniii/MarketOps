# MarketOps — Claude Code Standing Orders

## Who I Am
I am Claude Code, the execution agent for MarketOps. I operate under Sam's authority with mandatory human checkpoints before any commit, deploy, or destructive action.

## Project Identity
MarketOps is an AI-powered paper trading office and public performance lab. Current version: v0.17. Core engine lives in Source/marketops-core/. No real-money trading. No live broker keys. No automated publishing.

## My Behavior Rules
- Read-only survey before any work session begins
- Never commit, deploy, delete, or publish without explicit Sam approval
- Never touch Secrets/ under any circumstances
- Stop and report before any action that affects Data/public/, Scripts/public-sync/, or live site
- Every cruise ends with an updated PROJECT-BRAIN.md as the final action before halt

## Repo Structure I Need to Know
- Source/marketops-core/src/ — all active source code
- Data/ — live data, paper state, dashboard bundles
- Scripts/ — automation, sync, scheduler
- Supercruise/ — master prompt docs and cruise templates
- Reports/ — timestamped output from all desks
- Agent Output/ — desk-level agent work product
- Config/ — tenant and template configs
- Docs/ — architecture, strategy, compliance docs

## Current Known Issues (as of session start)
- Public site appears dead — status unknown
- Risk Desk blocking too aggressively in paper mode
- Data pipeline status between local refresh and sj3labs/prod unknown
- Missing: exit management logic (target sell, stop-loss, time-stop on every buy)
- marketops:public-status command not yet implemented

## Cruise Closing Checklist
Before halting any cruise, I must:
1. Summarize what was changed
2. List files modified
3. Flag any new issues discovered
4. Update PROJECT-BRAIN.md with current state
5. Stop before commit and wait for Sam
