#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# DISCORD NOTIFIER - Sistema de notificaciones (Versión Corregida)
# Notifica a Claude Code y escritorio (macOS) de mensajes nuevos
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

# Configurar directorio del plugin
PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$PLUGIN_DIR/data"
LOG_FILE="$DATA_DIR/messages-stream.log"
LAST_POS_FILE="$DATA_DIR/.last_log_pos"
NOTIFY_FILE="$DATA_DIR/.discord-notification"
PROCESSED_IDS_FILE="$DATA_DIR/.processed_message_ids"
LOCK_FILE="$DATA_DIR/.notifier.lock"
PID_FILE="$DATA_DIR/.notifier.pid"

# Crear directorios si no existen
mkdir -p "$DATA_DIR"
touch "$NOTIFY_FILE"
touch "$LOG_FILE"
touch "$PROCESSED_IDS_FILE"

# Detectar sistema operativo
IS_MACOS=false
if [[ "$OSTYPE" == "darwin"* ]]; then
    IS_MACOS=true
fi

# ═══════════════════════════════════════════════════════════════════════════
# MECANISMO DE BLOQUEO - Evitar múltiples instancias
# ═══════════════════════════════════════════════════════════════════════════
cleanup_lock() {
    if [[ -f "$LOCK_FILE" ]]; then
        local lock_pid
        lock_pid=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
        if [[ "$lock_pid" == "$$" ]]; then
            rm -f "$LOCK_FILE"
        fi
    fi
}

# Verificar si ya hay otra instancia corriende
if [[ -f "$LOCK_FILE" ]]; then
    lock_pid=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
    if [[ -n "$lock_pid" ]] && kill -0 "$lock_pid" 2>/dev/null; then
        echo "[Discord Notifier] Error: Ya hay una instancia corriendo (PID: $lock_pid)"
        echo "[Discord Notifier] Usa: pkill -f discord-notifier.sh para detenerla"
        exit 1
    else
        # El proceso anterior murió sin limpiar
        rm -f "$LOCK_FILE"
    fi
fi

# Crear archivo de lock
echo "$$" > "$LOCK_FILE"
echo "$$" > "$PID_FILE"
trap cleanup_lock EXIT

# ═══════════════════════════════════════════════════════════════════════════
# FUNCIONES DE UTILIDAD
# ═══════════════════════════════════════════════════════════════════════════

# Verificar si un mensaje ya fue procesado
is_message_processed() {
    local msg_id="$1"
    grep -q "^${msg_id}$" "$PROCESSED_IDS_FILE" 2>/dev/null
}

# Marcar mensaje como procesado
mark_message_processed() {
    local msg_id="$1"
    echo "$msg_id" >> "$PROCESSED_IDS_FILE"

    # Limpiar archivo si crece demasiado (mantener últimos 1000 IDs)
    if [[ $(wc -l < "$PROCESSED_IDS_FILE") -gt 1000 ]]; then
        tail -n 500 "$PROCESSED_IDS_FILE" > "$PROCESSED_IDS_FILE.tmp"
        mv "$PROCESSED_IDS_FILE.tmp" "$PROCESSED_IDS_FILE"
    fi
}

# Notificación de escritorio
notify_desktop() {
    local author="$1"
    local content="$2"

    if [[ "$IS_MACOS" == true ]]; then
        osascript -e "display notification \"$(echo "$content" | sed 's/"/\\"/g')\" with title \"Discord: $(echo "$author" | sed 's/"/\\"/g')\" sound name \"Glass\"" 2>/dev/null || true
    elif command -v notify-send &> /dev/null; then
        notify-send "Discord: $author" "$content" 2>/dev/null || true
    fi
}

# Notificación a Claude
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

# ═══════════════════════════════════════════════════════════════════════════
# INICIALIZACIÓN
# ═══════════════════════════════════════════════════════════════════════════

# Obtener posición inicial
if [[ -f "$LAST_POS_FILE" ]]; then
    LAST_POS=$(cat "$LAST_POS_FILE" 2>/dev/null || echo "0")
else
    LAST_POS=$(wc -c < "$LOG_FILE" 2>/dev/null || echo 0)
    echo "$LAST_POS" > "$LAST_POS_FILE"
fi

echo "[Discord Notifier] Iniciado (PID: $$)"
echo "[Discord Notifier] Archivo de lock: $LOCK_FILE"
echo "[Discord Notifier] Observando: $LOG_FILE"
echo "[Discord Notifier] OS: $([[ "$IS_MACOS" == true ]] && echo 'macOS' || echo 'Linux/Other')"
echo "[Discord Notifier] Mensajes procesados: $(wc -l < "$PROCESSED_IDS_FILE" 2>/dev/null || echo 0)"

# ═══════════════════════════════════════════════════════════════════════════
# BUCLE PRINCIPAL - Versión corregida sin subshell problemático
# ═══════════════════════════════════════════════════════════════════════════
NEW_LAST_POS="$LAST_POS"

while true; do
    CURRENT_SIZE=$(wc -c < "$LOG_FILE" 2>/dev/null || echo 0)

    if [[ $CURRENT_SIZE -gt "$LAST_POS" ]]; then
        # Hay nuevo contenido - procesar línea por línea
        while IFS= read -r line; do
            [[ -z "$line" ]] && continue

            # Verificar que es JSON válido
            if ! echo "$line" | jq empty 2>/dev/null; then
                continue
            fi

            # Extraer datos del mensaje
            AUTHOR=$(echo "$line" | jq -r '.author // empty' 2>/dev/null)
            CONTENT=$(echo "$line" | jq -r '.content // empty' 2>/dev/null)
            AUTHOR_ID=$(echo "$line" | jq -r '.authorId // empty' 2>/dev/null)
            IS_DM=$(echo "$line" | jq -r '.isDM // false' 2>/dev/null)
            MSG_ID=$(echo "$line" | jq -r '.id // empty' 2>/dev/null)

            # Validar datos y verificar duplicados
            if [[ -n "$AUTHOR" && -n "$CONTENT" && -n "$MSG_ID" ]]; then
                if ! is_message_processed "$MSG_ID"; then
                    # Notificaciones
                    notify_desktop "$AUTHOR" "$CONTENT"
                    notify_claude "$AUTHOR" "$CONTENT" "$AUTHOR_ID" "$IS_DM"

                    # Marcar como procesado
                    mark_message_processed "$MSG_ID"

                    echo "[Discord Notifier] $(date '+%H:%M:%S') - Mensaje de $AUTHOR procesado"
                fi
            fi

            # Actualizar posición
            NEW_LAST_POS=$(($(echo "$line" | wc -c) + ${NEW_LAST_POS:-0}))
        done < <(tail -c +$((LAST_POS + 1)) "$LOG_FILE" 2>/dev/null)

        # Guardar nueva posición
        LAST_POS="$CURRENT_SIZE"
        echo "$LAST_POS" > "$LAST_POS_FILE"
    fi

    # Verificar que el lock sigue siendo nuestro
    if [[ -f "$LOCK_FILE" ]]; then
        current_lock=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
        if [[ "$current_lock" != "$$" ]]; then
            echo "[Discord Notifier] Lock perdido, terminando..."
            exit 0
        fi
    fi

    sleep 2
done
