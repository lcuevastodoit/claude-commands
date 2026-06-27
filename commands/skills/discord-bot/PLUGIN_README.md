# Discord Bot Gateway Plugin

Plugin de Claude Code para gestionar un bot de Discord con WebSocket Gateway y monitoreo de mensajes en tiempo real.

## Características Principales

- ✅ **Bot con WebSocket Gateway** - Conexión persistente a Discord
- ✅ **Auto-inicio** - Bot y monitor se inician automáticamente con Claude Code
- ✅ **Monitoreo en tiempo real** - Claude recibe notificaciones instantáneas de mensajes entrantes
- ✅ **Respuestas bidireccionales** - Claude puede responder a mensajes de Discord en vivo
- ✅ **Estado "online"** - El bot aparece como online en Discord

## Instalación

### Opción 1: Desde el directorio local

```bash
claude --plugin-dir /Users/lcuevas/Codigo/claude-commands/commands/skills/discord-bot
```

### Opción 2: Instalar permanentemente

```bash
# Copiar a ~/.claude/skills/
cp -r /Users/lcuevas/Codigo/claude-commands/commands/skills/discord-bot ~/.claude/skills/

# O crear un marketplace privado
```

## Configuración Inicial

1. **Instalar dependencias:**
```bash
cd ~/.claude/skills/discord-bot-gateway
npm install
```

2. **Configurar Discord:**
Crear `~/.discord-config.json`:
```json
{
  "token": "TU_BOT_TOKEN",
  "channelId": "ID_CANAL_POR_DEFECTO",
  "userId": "TU_USER_ID"
}
```

3. **Instalar jq (si no está instalado):**
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# O verificar que está instalado
jq --version
```

4. **Verificar:**
```bash
node test.js
```

## Uso

### Inicio Automático

Al instalar el plugin, se configuran automáticamente:

1. **Bot de Discord** - Inicia al abrir Claude Code
2. **Monitor de mensajes** - Inicia 3 segundos después del bot
3. **Hooks de sesión** - Reinician componentes si es necesario

### Comando del Plugin

El plugin se invoca con: `/discord-bot-gateway:discord-bot`

### Scripts Directos

```bash
# Enviar mensaje
node send.js "Hola mundo"

# Leer mensajes
node read.js --dm --limit=10

# Ver estado del bot
node bot.js status

# Verificar monitor de mensajes
ps aux | grep discord-notifier
```

## Flujo de Mensajes en Tiempo Real

```
┌──────────────┐     WebSocket      ┌─────────┐
│   Discord    │ ◄────────────────► │ bot.js  │
│   Gateway    │                    └────┬────┘
└──────────────┘                         │
                                         │ append
                                         ▼
                              ┌─────────────────────┐
                              │ messages-stream.log │
                              │ (JSON Lines format) │
                              └──────────┬──────────┘
                                         │
                                         │ read
                                         ▼
                              ┌─────────────────────┐
                              │ discord-notifier.sh │
                              │   (poll 0.5s)       │
                              └──────────┬──────────┘
                                         │
                                         │ notify
                                         ▼
                              ┌─────────────────────┐
                              │   Claude Code       │
                              │ (recibe notificación│
                              │  y puede responder) │
                              └─────────────────────┘
```

## Estructura del Plugin

```
discord-bot-gateway/
├── .claude-plugin/
│   └── plugin.json          # Manifiesto del plugin
├── skills/
│   └── discord-bot/
│       └── SKILL.md         # Skill para Claude
├── hooks/
│   └── hooks.json           # Hooks de auto-inicio
├── monitors/
│   └── monitors.json        # Monitor de background
├── bin/
│   ├── start-bot.sh         # Script de inicio del bot
│   ├── start-message-monitor.sh  # Inicia monitor de mensajes
│   ├── check-status.sh      # Verificador de estado
│   └── monitor-bot.sh       # Monitor del bot (legacy)
├── discord-notifier.sh      # Monitor de mensajes en tiempo real
├── bot.js                   # Bot principal con WebSocket
├── send.js                  # Enviar mensajes
├── read.js                  # Leer mensajes
├── test.js                  # Verificar configuración
└── data/
    ├── messages.json        # Cache de mensajes
    ├── messages-stream.log  # Log append para monitoreo
    └── status.json          # Estado del bot
```

## Hooks Incluidos

### SessionStart
- **startup**: Inicia el bot y el monitor de mensajes
- **resume**: Reinicia componentes al resumir sesión
- **clear**: Verifica estado después de /clear

### UserPromptSubmit
- Verifica estado del bot antes de cada mensaje del usuario

### Monitors
- **discord-bot-status**: Monitorea el bot cada 30 segundos y reinicia si es necesario

## Monitoreo de Mensajes en Tiempo Real

### Cómo funciona

1. **bot.js** recibe mensajes vía WebSocket
2. **appendMessageLog()** escribe cada mensaje a `data/messages-stream.log` (formato JSON Lines)
3. **discord-notifier.sh** revisa el archivo cada 0.5 segundos
4. Cuando detecta una nueva línea, envía notificación a Claude Code
5. Claude recibe los datos del mensaje y puede responder

### Formato del Log

```json
{"ts":1782536649484,"id":"1520293640076001321","content":"que hora es","author":"Luis Cuevas","authorId":"970114927488557146","isDM":true,"channelId":"1520255457422475413"}
```

### Notificación a Claude

```
═══════════════════════════════════════════════
📩 NUEVO MENSAJE DE DISCORD
═══════════════════════════════════════════════
🕐 14:32:15
👤 De: Username (ID: 123456789)
💬 Mensaje: "Contenido del mensaje"
📍 Tipo: DM (o Canal)
🆔 Channel ID: 987654321

💡 Para responder:
   node /path/to/send.js "Tu respuesta" --user=123456789
═══════════════════════════════════════════════
```

### Control Manual del Monitor

```bash
# Iniciar monitor manualmente
./bin/start-message-monitor.sh

# Verificar si está corriendo
ps aux | grep discord-notifier

# Detener monitor
pkill -f discord-notifier
rm data/.message-monitor.pid
```

## Solución de Problemas

### El bot no inicia automáticamente

1. Verificar hooks están configurados:
```bash
cat ~/.claude/skills/discord-bot-gateway/hooks/hooks.json
```

2. Verificar scripts son ejecutables:
```bash
chmod +x ~/.claude/skills/discord-bot-gateway/bin/*.sh
chmod +x ~/.claude/skills/discord-bot-gateway/*.sh
```

3. Verificar logs:
```bash
tail -f ~/.claude/skills/discord-bot-gateway/bot.log
```

### El monitor de mensajes no notifica

1. Verificar que jq está instalado:
```bash
jq --version
```

2. Verificar que el archivo de log existe:
```bash
ls -la ~/.claude/skills/discord-bot-gateway/data/messages-stream.log
```

3. Verificar que el monitor está corriendo:
```bash
ps aux | grep discord-notifier
```

4. Reiniciar el monitor:
```bash
pkill -f discord-notifier
./bin/start-message-monitor.sh
```

5. Probar manualmente:
```bash
# Escribir línea de prueba
echo '{"ts":123,"id":"test","content":"prueba","author":"Test","authorId":"123","isDM":true,"channelId":"456"}' >> ~/.claude/skills/discord-bot-gateway/data/messages-stream.log

# Deberías recibir notificación en Claude
```

### Comandos útiles

```bash
# Ver si el bot está corriendo
ps aux | grep "node bot.js"

# Ver si el monitor está corriendo
ps aux | grep discord-notifier

# Detener el bot manualmente
pkill -f "node bot.js start"

# Detener el monitor
pkill -f discord-notifier

# Iniciar manualmente
cd ~/.claude/skills/discord-bot-gateway && node bot.js start
sleep 3 && ./bin/start-message-monitor.sh
```

## Diferencias con Skills

| Característica | Skill | Plugin |
|----------------|-------|--------|
| Auto-inicio | Configuración manual | Hooks automáticos |
| Monitoreo de bot | No | Sí (cada 30s) |
| Monitoreo de mensajes | No | Sí (tiempo real) |
| Notificaciones a Claude | No | Sí (instantáneas) |
| Namespace | /discord-bot | /discord-bot-gateway:discord-bot |
| Compartir | Copiar archivos | Marketplace o git |

## Desinstalación

```bash
# Eliminar plugin
rm -rf ~/.claude/skills/discord-bot-gateway

# Recargar plugins
/reload-plugins
```

## Changelog

### v2.0.0 - Monitoreo en Tiempo Real
- Agregado sistema de monitoreo de mensajes en tiempo real
- Nuevo archivo `messages-stream.log` (append-only)
- Nuevo script `discord-notifier.sh` para notificar a Claude
- Hook SessionStart actualizado para iniciar monitor automáticamente
- Documentación actualizada con flujo completo

### v1.0.0 - Bot WebSocket Gateway
- Bot con conexión WebSocket persistente
- Auto-inicio con SessionStart hooks
- Comandos send.js y read.js
- Almacenamiento de mensajes en JSON
