#!/usr/bin/env bash
set -euo pipefail

# Uninstall MarketOps systemd user timer

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

SERVICE_NAME="marketops-refresh"
SERVICE_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
SERVICE_FILE="$SERVICE_DIR/$SERVICE_NAME.service"
TIMER_FILE="$SERVICE_DIR/$SERVICE_NAME.timer"

echo "Stopping and disabling $SERVICE_NAME.timer..."
systemctl --user stop "$SERVICE_NAME.timer" 2>/dev/null || true
systemctl --user disable "$SERVICE_NAME.timer" 2>/dev/null || true

echo "Removing service and timer files..."
rm -f "$SERVICE_FILE" "$TIMER_FILE"

systemctl --user daemon-reload

echo ""
echo "MarketOps refresh timer uninstalled."
echo ""
echo "Remaining schedule files in $SCRIPT_DIR:"
ls -la "$SCRIPT_DIR"/*.sh 2>/dev/null || echo "  (none)"
echo ""
echo "To reinstall:"
echo "  MARKETOPS_ALLOW_LOCAL_SCHEDULER_INSTALL=1 bash $SCRIPT_DIR/install-marketops-refresh.sh"
