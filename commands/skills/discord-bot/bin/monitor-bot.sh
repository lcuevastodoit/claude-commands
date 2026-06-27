#!/bin/bash
# Monitor Discord Bot and restart if needed
# This runs continuously while Claude Code is active

PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA_DIR="$PLUGIN_DIR/data"
STATUS_FILE="$DATA_DIR/status.json"
LOG_FILE="$PLUGIN_DIR/bot.log"

# Create data directory if it doesn't exist
mkdir -p "$DATA_DIR"

echo "[Discord Bot Monitor] Started"
echo "[Discord Bot Monitor] Watching for status changes..."

# Function to check if bot is running
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

# Main loop - check every 30 seconds
while true; do
    if ! check_bot_running; then
        echo "[Discord Bot Monitor] Bot not responding, restarting..."
        cd "$PLUGIN_DIR" || exit 1
        nohup node bot.js start >> "$LOG_FILE" 2>&1 &
        echo "[Discord Bot Monitor] Bot restarted"
    fi
    sleep 30
done
