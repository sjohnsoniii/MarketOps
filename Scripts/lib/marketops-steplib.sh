#!/usr/bin/env bash
# MarketOps shared resilience step library.
# SOURCE this (do not execute). One hardened machine behind all scheduler doors:
# run-marketops-refresh.sh, run-marketops-run.sh, run-marketops-premarket.sh.
#
# Provides:
#   run_step <name> <CRITICAL|DEGRADABLE> <cmd...>
#       Run a step; capture exit code, stderr tail, duration. DEGRADABLE failure
#       -> log + append DEGRADED_STEPS + CONTINUE. CRITICAL failure -> set
#       CRITICAL_FAIL (caller must skip publish). Never aborts the script itself.
#   retry_cmd <cmd...>            Run any command via the shared transient-retry CLI.
#   git_push_retry               git -C "$SJ3LABS_ROOT" push origin main, with retry.
#   integrity_gate <file...>     CRITICAL parse + cycle-invariant gate (integrityGate.js).
#
# Exposes: DEGRADED_STEPS[], CRITICAL_FAIL, STEP_LOG[], LAST_STEP_CODE.
# The sourcing script MUST set before calling: LOG_FILE, CORE_DIR. For pushes
# also SJ3LABS_ROOT. (Retry policy itself lives in src/utils/transientRetry.js —
# the single source of truth shared with the Alpaca adapter.)

# Idempotent source.
[ -n "${MARKETOPS_STEPLIB_LOADED:-}" ] && return 0
MARKETOPS_STEPLIB_LOADED=1

DEGRADED_STEPS=()
CRITICAL_FAIL=""
LAST_STEP_CODE=0
declare -a STEP_LOG   # entries: name|class|code|seconds|status

run_step() {
    # usage: run_step <name> <CRITICAL|DEGRADABLE> <command...>
    local name="$1" cls="$2"; shift 2
    local errf start end code dur
    errf="$(mktemp)"
    start=$(date +%s)
    "$@" >>"$LOG_FILE" 2>>"$errf"
    code=$?
    end=$(date +%s); dur=$((end - start))
    LAST_STEP_CODE=$code
    cat "$errf" >>"$LOG_FILE"
    if [ "$code" -eq 0 ]; then
        STEP_LOG+=("$name|$cls|0|$dur|ok")
        echo "[STEP ok] $name (${dur}s)" >>"$LOG_FILE"
    elif [ "$cls" = "CRITICAL" ]; then
        STEP_LOG+=("$name|$cls|$code|$dur|critical_fail")
        [ -z "$CRITICAL_FAIL" ] && CRITICAL_FAIL="$name"
        echo "[STEP CRITICAL-FAIL] $name code=$code (${dur}s) :: $(tail -n 2 "$errf" | tr '\n' ' ')" >>"$LOG_FILE"
    else
        STEP_LOG+=("$name|$cls|$code|$dur|degraded")
        DEGRADED_STEPS+=("$name")
        echo "[STEP DEGRADED] $name code=$code (${dur}s) — continuing :: $(tail -n 2 "$errf" | tr '\n' ' ')" >>"$LOG_FILE"
    fi
    rm -f "$errf"
    return 0
}

retry_cmd() {
    node "$CORE_DIR/src/utils/transientRetry.js" "$@"
}

git_push_retry() {
    node "$CORE_DIR/src/utils/transientRetry.js" git -C "$SJ3LABS_ROOT" push origin main
}

integrity_gate() {
    # usage: integrity_gate <file...>  (CRITICAL — parse + cycle invariants)
    run_step "integrity:prepublish" CRITICAL node "$CORE_DIR/src/utils/integrityGate.js" "$@"
}

# Convenience: one-line resilience summary for the log.
log_step_summary() {
    local degraded="none"
    [ "${#DEGRADED_STEPS[@]}" -gt 0 ] && degraded="${DEGRADED_STEPS[*]}"
    {
        echo ""
        echo "Resilience step summary:"
        for entry in "${STEP_LOG[@]}"; do echo "  - $entry"; done
        echo "Degraded steps: $degraded"
        echo "Critical failure: ${CRITICAL_FAIL:-none}"
    } >> "$LOG_FILE"
}
