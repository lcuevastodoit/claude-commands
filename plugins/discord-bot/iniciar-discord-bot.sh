#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# INICIAR DISCORD BOT - Comando manual para iniciar el bot y monitor
# Uso: bash iniciar-discord-bot.sh
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$PLUGIN_DIR/data"
LOG_FILE="$PLUGIN_DIR/bot.log"

echo "══════════════════════════════════════════════════════════════════"
echo "  INICIANDO DISCORD BOT PLUGIN"
echo "══════════════════════════════════════════════════════════════════"
echo ""

# 1. Limpiar procesos anteriores si existen
echo "🧹 Limpiando procesos anteriores..."
pkill -f "discord-bot-gateway/bot.js" 2>/dev/null || true
pkill -f "discord-notifier.sh" 2>/dev/null || true
rm -f "$DATA_DIR/.notifier.lock" 2>/dev/null || true
rm -f "$DATA_DIR/.notifier.pid" 2>/dev/null || true
sleep 1

# 2. Verificar que el bot no esté corriendo
if pgrep -f "discord-bot-gateway/bot.js start" > /dev/null 2>&1; then
    echo "⚠️  El bot ya está corriendo"
    echo "   PID: $(pgrep -f "discord-bot-gateway/bot.js start")"
else
    # Iniciar el bot
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

# 3. Verificar que el notifier no esté corriendo
if [[ -f "$DATA_DIR/.notifier.lock" ]]; then
    lock_pid=$(cat "$DATA_DIR/.notifier.lock" 2>/dev/null || echo "")
    if [[ -n "$lock_pid" ]] && kill -0 "$lock_pid" 2>/dev/null; then
        echo "⚠️  El notificador ya está corriendo (PID: $lock_pid)"
    else
        rm -f "$DATA_DIR/.notifier.lock"
        echo "🧹 Lock anterior limpiado"
    fi
fi

# 4. Iniciar el notificador
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
