#!/bin/bash
# Start Discord Bot automatically
# This script is called by SessionStart hooks

PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA_DIR="$PLUGIN_DIR/data"
LOG_FILE="$PLUGIN_DIR/bot.log"
STATUS_FILE="$DATA_DIR/status.json"

# Create data directory if it doesn't exist
mkdir -p "$DATA_DIR"

# Check if bot is already running
check_bot_running() {
    if [ -f "$STATUS_FILE" ]; then
        local last_ping=$(cat "$STATUS_FILE" 2>/dev/null | grep -o '"lastPing":[0-9]*' | cut -d':' -f2)
        if [ -n "$last_ping" ]; then
            local now=$(date +%s%3N)
            local diff=$((now - last_ping))
            if [ $diff -lt 15000 ]; then
                return 0
            fi
        fi
    fi
    return 1
}

if check_bot_running; then
    echo "[Discord Bot] Already running ✅"
    exit 0
fi

# Start the bot
echo "[Discord Bot] Auto-starting..."
cd "$PLUGIN_DIR" || exit 1
nohup node bot.js start >> "$LOG_FILE" 2>&1 &

# Wait a moment and check if it started
sleep 2

if check_bot_running; then
    echo "[Discord Bot] Started successfully ✅"
    echo "[Discord Bot] Logs: $LOG_FILE"
else
    echo "[Discord Bot] ⚠️  Failed to start. Check logs: $LOG_FILE"
    exit 1
fi
