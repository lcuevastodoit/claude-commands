#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# INICIADOR DEL MONITOR DE MENSAJES DISCORD
#
# Este script inicia automáticamente el monitoreo de mensajes entrantes
# de Discord para que Claude Code pueda responder en tiempo real.
#
# Se ejecuta automáticamente al iniciar Claude Code vía SessionStart hook
# ═══════════════════════════════════════════════════════════════════════════

PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA_DIR="$PLUGIN_DIR/data"
LOG_FILE="$DATA_DIR/messages-stream.log"
MONITOR_SCRIPT="$PLUGIN_DIR/discord-notifier.sh"
PID_FILE="$DATA_DIR/.message-monitor.pid"

# Verificar si ya está corriendo
if [[ -f "$PID_FILE" ]]; then
    PID=$(cat "$PID_FILE" 2>/dev/null)
    if kill -0 "$PID" 2>/dev/null; then
        echo "[Discord Message Monitor] Already running (PID: $PID)"
        exit 0
    fi
fi

# Crear archivo de log si no existe
if [[ ! -f "$LOG_FILE" ]]; then
    touch "$LOG_FILE"
fi

# Establecer posición inicial
wc -c < "$LOG_FILE" > "$DATA_DIR/.last_log_pos" 2>/dev/null || echo "0" > "$DATA_DIR/.last_log_pos"

# Verificar que el script de notificación existe
if [[ ! -f "$MONITOR_SCRIPT" ]]; then
    echo "[Discord Message Monitor] Error: $MONITOR_SCRIPT not found"
    exit 1
fi

# Iniciar el monitor en background
nohup "$MONITOR_SCRIPT" > /dev/null 2>&1 &
NEW_PID=$!

# Guardar PID
echo "$NEW_PID" > "$PID_FILE"

echo "[Discord Message Monitor] Started (PID: $NEW_PID)"
echo "[Discord Message Monitor] Watching: $LOG_FILE"
echo "[Discord Message Monitor] Claude will be notified of new Discord messages"