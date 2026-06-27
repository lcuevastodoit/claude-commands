#!/bin/bash
# Monitor de mensajes de Discord - Notifica a Claude Code

LOG_FILE="/Users/lcuevas/.claude/skills/discord-bot-gateway/data/messages-stream.log"
LAST_POS_FILE="/Users/lcuevas/.claude/skills/discord-bot-gateway/data/.last_log_pos"

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
            
            # Parsear JSON y mostrar notificación
            echo "$line" | jq -r '
                "═══════════════════════════════════════════════",
                "📩 NUEVO MENSAJE DE DISCORD",
                "═══════════════════════════════════════════════",
                "🕐 " + (.ts | tostring | "."),
                "👤 De: " + .author + " (ID: " + .authorId + ")",
                "💬 Mensaje: \"" + .content + "\"",
                "📍 Tipo: " + (if .isDM then "DM" else "Canal" end),
                "🆔 Channel ID: " + .channelId,
                "",
                "💡 Para responder:",
                "   node /Users/lcuevas/.claude/skills/discord-bot-gateway/send.js \"Tu respuesta\" --user=" + .authorId,
                "═══════════════════════════════════════════════",
                ""
            ' 2>/dev/null
        done
        
        LAST_POS=$CURRENT_SIZE
        echo "$LAST_POS" > "$LAST_POS_FILE"
    fi
    
    sleep 0.5
done
