#!/bin/bash
# Monitor de mensajes de Discord con notificaciones a Claude Code

PLUGIN_DIR="/Users/lcuevas/Codigo/tirant1/commands/plugins/discord-bot"
LOG_FILE="$PLUGIN_DIR/data/messages-stream.log"
LAST_POS_FILE="$PLUGIN_DIR/data/.last_log_pos"
NOTIFY_FILE="$PLUGIN_DIR/data/.discord-notification"

# Crear archivo de notificación si no existe
touch "$NOTIFY_FILE"

# Obtener posición inicial
if [[ -f "$LAST_POS_FILE" ]]; then
    LAST_POS=$(cat "$LAST_POS_FILE")
else
    LAST_POS=$(wc -c < "$LOG_FILE" 2>/dev/null || echo 0)
fi

while true; do
    CURRENT_SIZE=$(wc -c < "$LOG_FILE" 2>/dev/null || echo 0)

    if [[ $CURRENT_SIZE -gt $LAST_POS ]]; then
        # Hay nuevo contenido
        tail -c +$((LAST_POS + 1)) "$LOG_FILE" 2>/dev/null | while IFS= read -r line; do
            [[ -z "$line" ]] && continue

            # Parsear JSON
            MSG=$(echo "$line" | jq -r '[.author, .content] | @tsv' 2>/dev/null)
            if [[ -n "$MSG" ]]; then
                AUTHOR=$(echo "$line" | jq -r '.author' 2>/dev/null)
                CONTENT=$(echo "$line" | jq -r '.content' 2>/dev/null)
                AUTHOR_ID=$(echo "$line" | jq -r '.authorId' 2>/dev/null)
                IS_DM=$(echo "$line" | jq -r '.isDM' 2>/dev/null)

                # Escribir notificación al archivo
                {
                    echo "════════════════════════════════════════════════"
                    echo "📩 NUEVO MENSAJE DE DISCORD"
                    echo "════════════════════════════════════════════════"
                    echo "👤 De: $AUTHOR (ID: $AUTHOR_ID)"
                    echo "💬 Mensaje: $CONTENT"
                    if [[ "$IS_DM" == "true" ]]; then
                        echo "📍 Tipo: DM"
                    else
                        echo "📍 Tipo: Canal"
                    fi
                    echo ""
                    echo "💡 Para responder:"
                    echo "   node $PLUGIN_DIR/send.js \"Tu respuesta\" --user=$AUTHOR_ID"
                    echo "════════════════════════════════════════════════"
                    echo ""
                } >> "$NOTIFY_FILE"

                # Enviar notificación de escritorio (macOS)
                osascript -e "display notification \"$CONTENT\" with title \"Discord: $AUTHOR\" sound name \"Glass\"" 2>/dev/null || true
            fi
        done

        LAST_POS=$CURRENT_SIZE
        echo "$LAST_POS" > "$LAST_POS_FILE"
    fi

    sleep 0.5
done
