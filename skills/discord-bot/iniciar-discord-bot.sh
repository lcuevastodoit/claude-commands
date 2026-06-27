#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# INICIAR DISCORD BOT - Comando manual para iniciar el bot y monitor
# Uso: bash iniciar-discord-bot.sh
#
# NOTA: Cuando el usuario me contacta por Discord, debo responderle
#       directamente en Discord usando send.js, no en otra interfaz.
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$PLUGIN_DIR/data"
LOG_FILE="$PLUGIN_DIR/bot.log"

echo "══════════════════════════════════════════════════════════════════"
echo "  INICIANDO DISCORD BOT PLUGIN"
echo "══════════════════════════════════════════════════════════════════"
echo ""

# 1. Verificar si el bot ya está corriendo
if pgrep -f "discord-bot-gateway/bot.js" > /dev/null 2>&1; then
    BOT_PID=$(pgrep -f "discord-bot-gateway/bot.js" | head -1)
    echo "✅ El bot ya está corriendo (PID: $BOT_PID)"
    echo "   No se reinicia para evitar pérdida de mensajes"
else
    # Iniciar el bot solo si no estaba corriendo
    echo "🤖 Iniciando bot Discord..."
    cd "$PLUGIN_DIR"
    nohup node bot.js start >> "$LOG_FILE" 2>&1 &
    sleep 3

    if pgrep -f "discord-bot-gateway/bot.js" > /dev/null 2>&1; then
        echo "✅ Bot iniciado correctamente"
    else
        echo "❌ Error al iniciar el bot"
        echo "   Ver logs: tail -20 $LOG_FILE"
        exit 1
    fi
fi

# 2. Limpiar locks huérfanos del notificador si existen
if [[ -f "$DATA_DIR/.notifier.lock" ]]; then
    lock_pid=$(cat "$DATA_DIR/.notifier.lock" 2>/dev/null || echo "")
    if [[ -n "$lock_pid" ]] && ! kill -0 "$lock_pid" 2>/dev/null; then
        echo "🧹 Limpiando lock huérfano del notificador..."
        rm -f "$DATA_DIR/.notifier.lock"
        rm -f "$DATA_DIR/.notifier.pid"
    fi
fi

# 3. Iniciar el notificador (siempre, para asegurar que el monitor esté activo)
echo "🔔 Iniciando notificador..."
bash "$PLUGIN_DIR/discord-notifier.sh" > /dev/null 2>&1 &
sleep 2

if [[ -f "$DATA_DIR/.notifier.lock" ]]; then
    lock_pid=$(cat "$DATA_DIR/.notifier.lock" 2>/dev/null || echo "")
    echo "✅ Notificador iniciado (PID: $lock_pid)"
else
    echo "⚠️  El notificador puede estar iniciando..."
fi

echo ""
echo "══════════════════════════════════════════════════════════════════"
echo "  ESTADO DEL SISTEMA"
echo "══════════════════════════════════════════════════════════════════"
echo ""
echo "🤖 Bot Discord:"
echo "   $(pgrep -f "discord-bot-gateway/bot.js" > /dev/null && echo "✅ Corriendo" || echo "❌ Detenido")"
echo ""
echo "🔔 Notificador:"
if [[ -f "$DATA_DIR/.notifier.lock" ]]; then
    lock_pid=$(cat "$DATA_DIR/.notifier.lock" 2>/dev/null || echo "Desconocido")
    echo "   ✅ Corriendo (PID: $lock_pid)"
else
    echo "   ❌ Detenido"
fi
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs:     tail -f $LOG_FILE"
echo "   Detener todo: pkill -f 'discord-bot-gateway'"
echo "   Enviar DM:    node $PLUGIN_DIR/send.js 'Mensaje' --user=970114927488557146"
echo ""
echo "══════════════════════════════════════════════════════════════════"
