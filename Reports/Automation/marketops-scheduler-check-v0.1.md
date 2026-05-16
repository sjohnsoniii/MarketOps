# MarketOps Scheduler Check v0.1

Generated: 2026-05-16T02:50:18.316Z
Platform: linux
Username: sjohnsoniii

## Verdict

ISSUES_FOUND

## Summary

- Systemd available: true
- Scheduler installed: false
- Install allowed (MARKETOPS_ALLOW_LOCAL_SCHEDULER_INSTALL=1): true
- Scheduler files exist: 5/5

## Checks

- PASS: Platform is Linux - linux
- PASS: systemctl available - systemctl found
- PASS: Scheduler env flag allows install - 1
- PASS: Scheduler run script exists - /home/sjohnsoniii/Projects/MarketOps/Scripts/scheduler/run-marketops-refresh.sh
- PASS: Scheduler install script exists - /home/sjohnsoniii/Projects/MarketOps/Scripts/scheduler/install-marketops-refresh.sh
- PASS: Scheduler uninstall script exists - /home/sjohnsoniii/Projects/MarketOps/Scripts/scheduler/uninstall-marketops-refresh.sh
- PASS: Scheduler check script exists - /home/sjohnsoniii/Projects/MarketOps/Scripts/scheduler/check-marketops-refresh.sh
- PASS: Scheduler README exists - /home/sjohnsoniii/Projects/MarketOps/Scripts/scheduler/README.md
- FAIL: Systemd user service installed - Service and timer files not found

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
