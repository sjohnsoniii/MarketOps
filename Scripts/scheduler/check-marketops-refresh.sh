#!/usr/bin/env bash
set -euo pipefail

# Check MarketOps scheduler status

SERVICE_NAME="marketops-refresh"

echo "MarketOps Scheduler Status Check"
echo "================================"
echo ""

echo "Timer status:"
systemctl --user status "$SERVICE_NAME.timer" --no-pager 2>&1 || echo "  (not installed)"
echo ""

echo "Service status:"
systemctl --user status "$SERVICE_NAME.service" --no-pager 2>&1 || echo "  (not installed)"
echo ""

echo "Last trigger:"
journalctl --user -u "$SERVICE_NAME.service" --no-pager -n 10 2>&1 || echo "  (no logs)"
echo ""

echo "Next scheduled runs:"
systemctl --user list-timers --no-pager 2>&1 | grep "$SERVICE_NAME" || echo "  (no timers)"

echo ""
echo "Logs directory:"
ls -lt ~/Projects/MarketOps/logs/marketops-refresh-*.log 2>/dev/null | head -5 || echo "  (no log files found)"
