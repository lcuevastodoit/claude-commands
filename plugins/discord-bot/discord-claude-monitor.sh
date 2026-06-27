#!/bin/bash
# Monitor de Claude Code para mensajes de Discord
# Este script corre en background y notifica a Claude

PLUGIN_DIR="/Users/lcuevas/Codigo/tirant1/commands/plugins/discord-bot"
LOG_FILE="$PLUGIN_DIR/data/messages-stream.log"
LAST_POS_FILE="$PLUGIN_DIR/data/.last_log_pos_claude"
NOTIFY_SCRIPT="$PLUGIN_DIR/bin/discord-message-monitor.sh"

# Inicializar posición
if [[ ! -f "$LAST_POS_FILE" ]]; then
    wc -c < "$LOG_FILE" > "$LAST_POS_FILE" 2>/dev/null || echo "0" > "$LAST_POS_FILE"
fi

echo "[Discord Claude Monitor] Iniciado"
echo "[Discord Claude Monitor] Observando: $LOG_FILE"

while true; do
    LAST_POS=$(cat "$LAST_POS_FILE" 2>/dev/null || echo "0")
    CURRENT_SIZE=$(wc -c < "$LOG_FILE" 2>/dev/null || echo "0")

    if [[ $CURRENT_SIZE -gt $LAST_POS ]]; then
        # Hay mensajes nuevos
        echo "$CURRENT_SIZE" > "$LAST_POS_FILE"
        # Ejecutar el script de notificación
        "$NOTIFY_SCRIPT" > /dev/null 2>&1
    fi

    sleep 5
done
