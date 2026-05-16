#!/usr/bin/env bash
set -euo pipefail

# Install MarketOps systemd user timer for 2-hour refresh cadence.
# Requires MARKETOPS_ALLOW_LOCAL_SCHEDULER_INSTALL=1
# User-level only. No sudo. No root.
# Paper-only simulation loop. No live trading. No deploy. No post.

if [ "${MARKETOPS_ALLOW_LOCAL_SCHEDULER_INSTALL:-0}" != "1" ]; then
    echo "ERROR: MARKETOPS_ALLOW_LOCAL_SCHEDULER_INSTALL is not set to 1."
    echo "Set it and re-run:"
    echo "  MARKETOPS_ALLOW_LOCAL_SCHEDULER_INSTALL=1 bash $0"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CORE_DIR="$PROJECT_ROOT/Source/marketops-core"

SERVICE_NAME="marketops-refresh"
SERVICE_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
SERVICE_FILE="$SERVICE_DIR/$SERVICE_NAME.service"
TIMER_FILE="$SERVICE_DIR/$SERVICE_NAME.timer"

mkdir -p "$SERVICE_DIR"

# Write service file
cat > "$SERVICE_FILE" << EOF
[Unit]
Description=MarketOps Paper Simulation Refresh Service
Documentation=https://github.com/anomalyco/opencode
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=$SCRIPT_DIR/run-marketops-refresh.sh
WorkingDirectory=$CORE_DIR
Environment=MARKETOPS_ALLOW_LOCAL_SCHEDULER_INSTALL=0
Environment=NODE_ENV=production
StandardOutput=journal
StandardError=journal

# Safety: no live trading capability
CapabilityBoundingSet=
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=read-only
PrivateTmp=true

[Install]
WantedBy=default.target
EOF

# Write timer file (every 2 hours)
cat > "$TIMER_FILE" << EOF
[Unit]
Description=MarketOps Paper Simulation Refresh Timer (2-hour cadence)
Documentation=https://github.com/anomalyco/opencode

[Timer]
OnCalendar=*-*-* 08:00:00
OnCalendar=*-*-* 10:00:00
OnCalendar=*-*-* 12:00:00
OnCalendar=*-*-* 14:00:00
OnCalendar=*-*-* 16:00:00
OnCalendar=*-*-* 18:00:00
OnCalendar=*-*-* 20:00:00
Persistent=true

[Install]
WantedBy=default.target
EOF

echo "Service file: $SERVICE_FILE"
echo "Timer file: $TIMER_FILE"

systemctl --user daemon-reload
systemctl --user enable "$SERVICE_NAME.timer"
systemctl --user start "$SERVICE_NAME.timer"

echo ""
echo "MarketOps refresh timer installed."
echo "Status:"
systemctl --user status "$SERVICE_NAME.timer" --no-pager

echo ""
echo "To check: systemctl --user status $SERVICE_NAME.timer"
echo "To stop: systemctl --user stop $SERVICE_NAME.timer"
echo "To disable: systemctl --user disable $SERVICE_NAME.timer"
echo "To uninstall: bash $SCRIPT_DIR/uninstall-marketops-refresh.sh"
echo ""
echo "Next scheduled runs:"
systemctl --user list-timers "$SERVICE_NAME.timer" --no-pager
