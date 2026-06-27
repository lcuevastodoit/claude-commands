# Iniciar Discord Bot

Inicia el bot de Discord, el notificador de mensajes y el monitor para Claude.

## Uso

```bash
/iniciar-discord-bot
```

## Qué hace

1. Verifica el estado actual del bot
2. Si no está corriendo, inicia el bot Discord con WebSocket Gateway
3. Inicia el notificador con protección anti-duplicados
4. **Inicia el Monitor Tool de Claude Code** para recibir mensajes en tiempo real
5. Muestra el estado final del sistema

## Configuración

- **Server ID**: `1019945518501203999`
- **Tu User ID**: `970114927488557146`

## Comandos relacionados

- **Detener**: `pkill -f "discord-bot-gateway"`
- **Ver estado**: `node ${CLAUDE_SKILL_DIR}/bot.js status`
- **Enviar DM**: `node ${CLAUDE_SKILL_DIR}/send.js "Mensaje" --user=970114927488557146`

## Notas

- El bot no se inicia automáticamente al reiniciar Claude Code (sin hooks)
- El notificador tiene protección contra instancias duplicadas
- **El Monitor Tool permite que Claude reciba notificaciones INSTANTÁNEAS de mensajes Discord**

---

## Ejecución

Cuando el usuario ejecute `/iniciar-discord-bot`, debes:

### 1. Iniciar el bot (si no está corriendo)

Usa el skill (recomendado):
```bash
Skill: discord-bot-gateway (args: start)
```

O manualmente:
```bash
cd ${CLAUDE_SKILL_DIR} && nohup node bot.js start >> bot.log 2>&1 &
sleep 5
```

### 2. Iniciar el notificador (si no está corriendo)

```bash
bash ${CLAUDE_SKILL_DIR}/discord-notifier.sh > /dev/null 2>&1 &
```

### 3. **CRÍTICO: Iniciar el Monitor Tool de Claude Code**

El Monitor Tool es la herramienta nativa de Claude Code que permite recibir notificaciones en tiempo real. A diferencia de `/loop`, el Monitor:
- Ejecuta un comando en background
- Stream cada línea de stdout como notificación a la conversación
- Solo despierta a Claude cuando hay output (eficiente en tokens)
- Funciona con `persistent: true` para toda la sesión

**USAR EL MONITOR TOOL (MÉTODO CORRECTO):**

```javascript
Monitor({
  command: "bash -c 'while true; do bash ${CLAUDE_SKILL_DIR}/check-discord-messages.sh; sleep 10; done'",
  description: "Discord messages watcher",
  persistent: true
})
```

O con tail del archivo de notificación:
```javascript
Monitor({
  command: "tail -f ${CLAUDE_SKILL_DIR}/data/.discord-notification | grep --line-buffered '📩'",
  description: "Discord message notifications",
  persistent: true
})
```

**IMPORTANTE**: El Monitor Tool debe llamarse directamente, no a través de un skill. Es una herramienta nativa de Claude Code.

### 4. Mostrar el estado final

```bash
echo "🤖 Bot:" && (pgrep -f "discord-bot-gateway/bot.js" > /dev/null && echo "   ✅ Corriendo" || echo "   ❌ Detenido")
echo "🔔 Notificador:" && (ls ${CLAUDE_SKILL_DIR}/data/.notifier.lock 2>/dev/null > /dev/null && echo "   ✅ Corriendo" || echo "   ❌ Detenido")
echo "👁️  Monitor Claude:" && echo "   ✅ Iniciado - Recibiendo notificaciones en tiempo real"
```

---

## Flujo de mensajes con Monitor Tool

```
[Discord] → [Bot WebSocket] → [messages-stream.log] → [Notificador]
                                         ↓
[Claude responde] ← [Monitor Tool] ← [.discord-notification]
```

Cuando llega un mensaje:
1. El bot lo recibe y escribe en `messages-stream.log`
2. El notificador detecta el cambio y escribe en `.discord-notification`
3. El **Monitor Tool** de Claude detecta el output y lo stream a la conversación
4. Claude recibe la notificación y puede responder

---

## Diferencia: Monitor Tool vs /loop

| Característica | Monitor Tool | /loop |
|----------------|--------------|-------|
| Tipo | Event-driven (nativo) | Polling (cron) |
| Eficiencia | Solo reacciona a eventos | Llama API cada X tiempo |
| Granularidad | Instantánea | Mínimo 1 minuto (cron) |
| Costo tokens | Bajo (solo cuando hay eventos) | Alto (cada iteración es una llamada API) |
| Uso | Procesos background, logs, streams | Tareas periódicas de estado |

---

## Método alternativo (Skill recomendado)

El método más confiable es usar el skill disponible:

```bash
/discord-bot-gateway start
```

Luego iniciar el Monitor Tool:
```javascript
Monitor({
  command: "while true; do bash ${CLAUDE_SKILL_DIR}/check-discord-messages.sh; sleep 10; done",
  description: "Discord messages monitor",
  persistent: true
})
```

---

## Solución de problemas

### El bot se detiene inmediatamente
- Usa el skill `discord-bot-gateway` con argumento `start`
- O usa `nohup` para ejecutar en segundo plano

### El notificador dice "Ya hay una instancia corriendo"
- Limpiar locks: `rm ${CLAUDE_SKILL_DIR}/data/.notifier.lock`
- Matar procesos: `pkill -f discord-notifier.sh`

### Múltiples instancias del bot
- Matar todas: `pkill -9 -f "discord-bot-gateway/bot.js"`
- Limpiar y reiniciar fresh

### Claude no recibe los mensajes
- **Verificar que el Monitor Tool esté corriendo**: Debe aparecer como notificación activa
- **Verificar archivo de notificación**: `cat ${CLAUDE_SKILL_DIR}/data/.discord-notification`
- **Verificar Monitor**: El Monitor Tool debe estar activo con `persistent: true`

### Para detener el Monitor Tool
El Monitor Tool corre hasta que:
- El proceso termina naturalmente
- Se cierra la sesión de Claude Code
- Se usa TaskStop (si se guardó el task_id)

Para detener manualmente:
```bash
pkill -f check-discord-messages
```

---

## Referencias

- [Monitor Tool - Claude Code](https://claudefa.st/blog/guide/mechanics/monitor)
- [Monitor tool: real-time background process streaming](https://www.aicodex.to/articles/monitor-tool-def)
- [File-Based Signaling in Claude Code](https://www.mindstudio.ai/blog/claude-code-monitor-tool-background-processes-2)
