#!/bin/bash
# Check Discord Bot status and display helpful message
# This script is called by UserPromptSubmit hook

PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA_DIR="$PLUGIN_DIR/data"
STATUS_FILE="$DATA_DIR/status.json"

if [ -f "$STATUS_FILE" ]; then
    local last_ping=$(cat "$STATUS_FILE" 2>/dev/null | grep -o '"lastPing":[0-9]*' | cut -d':' -f2)
    if [ -n "$last_ping" ]; then
        local now=$(date +%s%3N)
        local diff=$((now - last_ping))
        if [ $diff -lt 15000 ]; then
            # Bot is running, don't show message
            exit 0
        fi
    fi
fi

# Bot is not running, show reminder
echo ""
echo "💡 Discord Bot not running. Start with: /discord-bot:status or node $PLUGIN_DIR/bot.js start"
echo ""
