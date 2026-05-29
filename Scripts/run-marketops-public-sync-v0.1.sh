#!/usr/bin/env bash
set -euo pipefail

# MarketOps Public Sync Runner v0.1
# Runs the public sync with live push enabled.
# Safe to call from cron or manually after a successful refresh.
# Paper-only. No live trading. No secrets in output.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

export MARKETOPS_ALLOW_PUBLIC_SITE_SYNC=1

bash "$SCRIPT_DIR/public-sync/sync-marketops-to-sj3labs.sh"
