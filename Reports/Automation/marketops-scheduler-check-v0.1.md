# MarketOps Scheduler Check v0.1

Generated: 2026-05-29T19:51:09.171Z
Platform: linux
Username: sjohnsoniii

## Verdict

ISSUES_FOUND

## Summary

- Systemd available: true
- Scheduler installed: true
- Install allowed (MARKETOPS_ALLOW_LOCAL_SCHEDULER_INSTALL=1): false
- Scheduler files exist: 5/5

## Checks

- PASS: Platform is Linux - linux
- PASS: systemctl available - systemctl found
- FAIL: Scheduler env flag allows install - 0
- PASS: Scheduler run script exists - /home/sjohnsoniii/Projects/MarketOps/Scripts/scheduler/run-marketops-refresh.sh
- PASS: Scheduler install script exists - /home/sjohnsoniii/Projects/MarketOps/Scripts/scheduler/install-marketops-refresh.sh
- PASS: Scheduler uninstall script exists - /home/sjohnsoniii/Projects/MarketOps/Scripts/scheduler/uninstall-marketops-refresh.sh
- PASS: Scheduler check script exists - /home/sjohnsoniii/Projects/MarketOps/Scripts/scheduler/check-marketops-refresh.sh
- PASS: Scheduler README exists - /home/sjohnsoniii/Projects/MarketOps/Scripts/scheduler/README.md
- PASS: Systemd user service installed - Timer status: active

## Install Command (when ready)

```bash
cd /home/sjohnsoniii/Projects/MarketOps
MARKETOPS_ALLOW_LOCAL_SCHEDULER_INSTALL=1 bash /home/sjohnsoniii/Projects/MarketOps/Scripts/scheduler/install-marketops-refresh.sh
```

## Uninstall Command

```bash
cd /home/sjohnsoniii/Projects/MarketOps
bash /home/sjohnsoniii/Projects/MarketOps/Scripts/scheduler/uninstall-marketops-refresh.sh
```

## Safety

- User-level only: yes
- No sudo/root: yes
- Paper-only commands: yes
- No live trading: yes
- No deploy/post/email: yes
