#!/bin/bash
# Script para verificar mensajes de Discord
# Uso: Ejecutar cada 10 segundos vía monitor de Claude Code

PLUGIN_DIR="/Users/lcuevas/Codigo/tirant1/commands/plugins/discord-bot"
NOTIFY_FILE="$PLUGIN_DIR/data/.discord-notification"
LOG_FILE="$PLUGIN_DIR/data/messages-stream.log"
LAST_POS_FILE="$PLUGIN_DIR/data/.last_pos_check"

# Inicializar posición
if [[ ! -f "$LAST_POS_FILE" ]]; then
    wc -c < "$LOG_FILE" > "$LAST_POS_FILE" 2>/dev/null || echo "0" > "$LAST_POS_FILE"
fi

LAST_POS=$(cat "$LAST_POS_FILE" 2>/dev/null || echo "0")
CURRENT_SIZE=$(wc -c < "$LOG_FILE" 2>/dev/null || echo "0")

if [[ $CURRENT_SIZE -gt $LAST_POS ]]; then
    # Hay mensajes nuevos
    tail -c +$((LAST_POS + 1)) "$LOG_FILE" 2>/dev/null | while IFS= read -r line; do
        [[ -z "$line" ]] && continue
        
        AUTHOR=$(echo "$line" | jq -r '.author // empty' 2>/dev/null)
        CONTENT=$(echo "$line" | jq -r '.content // empty' 2>/dev/null)
        
        if [[ -n "$AUTHOR" && -n "$CONTENT" ]]; then
            echo "📩 NUEVO MENSAJE DE DISCORD"
            echo "👤 De: $AUTHOR"
            echo "💬 $CONTENT"
            echo ""
        fi
    done
    
    echo "$CURRENT_SIZE" > "$LAST_POS_FILE"
fi
