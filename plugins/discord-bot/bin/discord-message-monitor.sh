#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# DISCORD MESSAGE MONITOR - Para Claude Code
# Verifica mensajes nuevos y notifica a Claude
# ═══════════════════════════════════════════════════════════════════════════

PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA_DIR="$PLUGIN_DIR/data"
LOG_FILE="$DATA_DIR/messages-stream.log"
LAST_POS_FILE="$DATA_DIR/.last_pos_check"
NOTIFY_FILE="$DATA_DIR/.discord-notification"

# Inicializar posición si no existe
if [[ ! -f "$LAST_POS_FILE" ]]; then
    wc -c < "$LOG_FILE" > "$LAST_POS_FILE" 2>/dev/null || echo "0" > "$LAST_POS_FILE"
fi

LAST_POS=$(cat "$LAST_POS_FILE" 2>/dev/null || echo "0")
CURRENT_SIZE=$(wc -c < "$LOG_FILE" 2>/dev/null || echo "0")

if [[ $CURRENT_SIZE -gt $LAST_POS ]]; then
    # Hay mensajes nuevos
    tail -c +$((LAST_POS + 1)) "$LOG_FILE" 2>/dev/null | while IFS= read -r line; do
        [[ -z "$line" ]] && continue

        # Verificar JSON válido
        if ! echo "$line" | jq empty 2>/dev/null; then
            continue
        fi

        AUTHOR=$(echo "$line" | jq -r '.author // empty' 2>/dev/null)
        CONTENT=$(echo "$line" | jq -r '.content // empty' 2>/dev/null)
        AUTHOR_ID=$(echo "$line" | jq -r '.authorId // empty' 2>/dev/null)
        IS_DM=$(echo "$line" | jq -r '.isDM // false' 2>/dev/null)
        MSG_ID=$(echo "$line" | jq -r '.id // empty' 2>/dev/null)

        if [[ -n "$AUTHOR" && -n "$CONTENT" && -n "$MSG_ID" ]]; then
            echo "📩 NUEVO MENSAJE DE DISCORD"
            echo "👤 De: $AUTHOR (ID: $AUTHOR_ID)"
            echo "💬 $CONTENT"
            if [[ "$IS_DM" == "true" ]]; then
                echo "📍 Tipo: DM"
            else
                echo "📍 Tipo: Canal"
            fi
            echo ""
        fi
    done

    echo "$CURRENT_SIZE" > "$LAST_POS_FILE"
fi
