#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# DISCORD NOTIFIER - Sistema de notificaciones dual
# Notifica a Claude Code y escritorio (macOS) de mensajes nuevos
# ═══════════════════════════════════════════════════════════════════════════

# Configurar directorio del plugin
PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$PLUGIN_DIR/data"
LOG_FILE="$DATA_DIR/messages-stream.log"
LAST_POS_FILE="$DATA_DIR/.last_log_pos"
NOTIFY_FILE="$DATA_DIR/.discord-notification"

# Crear directorios si no existen
mkdir -p "$DATA_DIR"
touch "$NOTIFY_FILE"
touch "$LOG_FILE"

# Detectar sistema operativo
IS_MACOS=false
if [[ "$OSTYPE" == "darwin"* ]]; then
    IS_MACOS=true
fi

# Obtener posición inicial
if [[ -f "$LAST_POS_FILE" ]]; then
    LAST_POS=$(cat "$LAST_POS_FILE")
else
    LAST_POS=$(wc -c < "$LOG_FILE" 2>/dev/null || echo 0)
    echo "$LAST_POS" > "$LAST_POS_FILE"
fi

echo "[Discord Notifier] Iniciado"
echo "[Discord Notifier] Observando: $LOG_FILE"
echo "[Discord Notifier] OS: $([[ "$IS_MACOS" == true ]] && echo 'macOS' || echo 'Linux/Other')"

# Función para notificación de escritorio
notify_desktop() {
    local author="$1"
    local content="$2"

    if [[ "$IS_MACOS" == true ]]; then
        osascript -e "display notification \"$content\" with title \"Discord: $author\" sound name \"Glass\"" 2>/dev/null || true
    else
        # Linux - usar notify-send si está disponible
        if command -v notify-send &> /dev/null; then
            notify-send "Discord: $author" "$content" 2>/dev/null || true
        fi
    fi
}

# Función para notificar a Claude
notify_claude() {
    local author="$1"
    local content="$2"
    local author_id="$3"
    local is_dm="$4"

    {
        echo "════════════════════════════════════════════════"
        echo "📩 NUEVO MENSAJE DE DISCORD"
        echo "════════════════════════════════════════════════"
        echo "👤 De: $author (ID: $author_id)"
        echo "💬 Mensaje: $content"
        if [[ "$is_dm" == "true" ]]; then
            echo "📍 Tipo: DM"
        else
            echo "📍 Tipo: Canal"
        fi
        echo ""
        echo "💡 Para responder:"
        echo "   node $PLUGIN_DIR/send.js \"Tu respuesta\" --user=$author_id"
        echo "════════════════════════════════════════════════"
        echo ""
    } >> "$NOTIFY_FILE"
}

# Bucle principal
while true; do
    CURRENT_SIZE=$(wc -c < "$LOG_FILE" 2>/dev/null || echo 0)

    if [[ $CURRENT_SIZE -gt $LAST_POS ]]; then
        # Hay nuevo contenido
        tail -c +$((LAST_POS + 1)) "$LOG_FILE" 2>/dev/null | while IFS= read -r line; do
            [[ -z "$line" ]] && continue

            # Verificar que es JSON válido
            if ! echo "$line" | jq empty 2>/dev/null; then
                continue
            fi

            # Extraer datos
            AUTHOR=$(echo "$line" | jq -r '.author // empty' 2>/dev/null)
            CONTENT=$(echo "$line" | jq -r '.content // empty' 2>/dev/null)
            AUTHOR_ID=$(echo "$line" | jq -r '.authorId // empty' 2>/dev/null)
            IS_DM=$(echo "$line" | jq -r '.isDM // false' 2>/dev/null)
            MSG_ID=$(echo "$line" | jq -r '.id // empty' 2>/dev/null)

            if [[ -n "$AUTHOR" && -n "$CONTENT" && -n "$MSG_ID" ]]; then
                # Notificar escritorio
                notify_desktop "$AUTHOR" "$CONTENT"

                # Notificar a Claude
                notify_claude "$AUTHOR" "$CONTENT" "$AUTHOR_ID" "$IS_DM"

                # Guardar mensaje para procesamiento
                echo "$line" >> "$DATA_DIR/.recent_messages.jsonl"
            fi
        done

        LAST_POS=$CURRENT_SIZE
        echo "$LAST_POS" > "$LAST_POS_FILE"
    fi

    sleep 0.5
done
