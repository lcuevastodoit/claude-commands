---
description: Manage Discord Bot Gateway for real-time bidirectional communication. Use when the user wants to send messages to Discord, read received messages, start/stop the bot, or troubleshoot Discord integration.
---

## Discord Bot Gateway Skill

This skill manages a Discord bot with WebSocket Gateway for real-time bidirectional communication.

**IMPORTANTE**: Este skill NO usa hooks automáticos. Debes iniciar el bot manualmente con `/iniciar-discord-bot` para evitar bucles infinitos.

### Current Bot Status

!`node ${CLAUDE_SKILL_DIR}/bot.js status 2>/dev/null || echo "⚠️  Bot not running. Start with: /iniciar-discord-bot"`

### Quick Start

```bash
# Iniciar bot y monitor (MÉTODO RECOMENDADO)
/iniciar-discord-bot

# O manualmente:
cd ${CLAUDE_SKILL_DIR} && bash iniciar-discord-bot.sh
```

### Available Commands

| Command | Purpose |
|---------|---------|
| Start bot + monitor | `/iniciar-discord-bot` |
| Send message | `node ${CLAUDE_SKILL_DIR}/send.js "message" [--user=ID\|--channel=ID]` |
| Read messages | `node ${CLAUDE_SKILL_DIR}/read.js [--limit=N] [--dm] [--channel=ID]` |
| Check status | `node ${CLAUDE_SKILL_DIR}/bot.js status` |
| View cached | `node ${CLAUDE_SKILL_DIR}/bot.js messages [N]` |
| Stop everything | `pkill -f "discord-bot-gateway"` |

### Quick Actions

**To send a Discord message:**
```bash
node ${CLAUDE_SKILL_DIR}/send.js "Your message here"
```

**To read recent DMs:**
```bash
node ${CLAUDE_SKILL_DIR}/read.js --dm --limit=10
```

**To start the bot:**
```bash
/iniciar-discord-bot
```

### Real-Time Message Monitoring

**How it works:**
1. User executes `/iniciar-discord-bot`
2. Script `iniciar-discord-bot.sh` inicia el bot y el notificador
3. Bot recibe mensajes via WebSocket y los escribe a `data/messages-stream.log`
4. `discord-notifier.sh` detecta nuevos mensajes y notifica a Claude
5. Claude puede responder directamente

**Manual Control:**
```bash
# Check if bot is running
node ${CLAUDE_SKILL_DIR}/bot.js status

# Check if notifier is running
ps aux | grep discord-notifier

# Stop everything
pkill -f "discord-bot-gateway"
```

### When to Use

Use this skill when the user wants to:
- Send messages to Discord (DMs or channels)
- Read received Discord messages
- Start, stop, or check the bot status
- Troubleshoot Discord connectivity issues
- Verify the bot configuration
- Set up real-time message notifications

### Configuration

Requires `~/.discord-config.json`:
```json
{
  "token": "BOT_TOKEN",
  "channelId": "DEFAULT_CHANNEL_ID",
  "userId": "YOUR_USER_ID"
}
```

Run `node ${CLAUDE_SKILL_DIR}/test.js` to verify configuration.

### Architecture

The bot maintains a persistent WebSocket connection to Discord Gateway:

**Core Components:**
- **bot.js** - Main process with WebSocket Gateway connection
- **send.js** - CLI to send messages
- **read.js** - CLI to read messages
- **data/** - Message persistence and streaming logs

**Real-Time Monitoring:**
- **messages-stream.log** - Append-only log of incoming messages (JSON Lines format)
- **discord-notifier.sh** - Polls log file and notifies Claude of new messages
- **iniciar-discord-bot.sh** - Unified script to start bot + notifier

**Message Flow:**
```
[Discord User] → [Discord Gateway] → [bot.js WebSocket]
                                         ↓
[Claude notified] ← [discord-notifier.sh] ← [messages-stream.log]
                                         ↓
[Claude responds] → [send.js] → [Discord API] → [User receives]
```

### Key Differences from MCP

Unlike the Discord MCP:
- ✅ Shows "online" status in Discord
- ✅ Receives messages instantly (no polling)
- ✅ Maintains WebSocket connection
- ✅ Real-time message notifications to Claude
- ✅ Claude can respond to Discord messages live
- ⚠️ Requires manual start with `/iniciar-discord-bot`

### Real-Time Message Flow

When a message arrives:
1. Discord Gateway sends it via WebSocket to bot.js
2. bot.js appends it to `data/messages-stream.log` (JSON Lines)
3. discord-notifier.sh detects the new line
4. Claude Code receives a notification with message details
5. Claude can compose and send a response via send.js

### IMPORTANT: Responder en el mismo canal

**Regla de oro**: Cuando el usuario me contacta por Discord, debo responderle **directamente en Discord**, no en otra interfaz (CLI, web, etc.).

- Si recibo un mensaje de Discord → Responder usando `send.js` para enviar la respuesta de vuelta a Discord
- Mantener la conversación en el canal donde fue iniciada para una experiencia fluida

**Example Notification:**
```
═══════════════════════════════════════════════
📩 NUEVO MENSAJE DE DISCORD
═══════════════════════════════════════════════
👤 De: Username (ID: 123456789)
💬 Mensaje: "Hola, ¿cómo estás?"
📍 Tipo: DM

💡 Para responder:
   node /path/to/send.js "Tu respuesta" --user=123456789
═══════════════════════════════════════════════
```

### Why No Auto-Start?

Previous versions used SessionStart hooks to auto-start the bot, but this caused:
- Infinite process loops
- Multiple bot instances
- Resource exhaustion

**Solution**: Manual start with `/iniciar-discord-bot` command.

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Bot won't start | Check `node test.js` for config errors |
| Duplicate notifications | `pkill -f discord-notifier` and restart |
| Notifier says "already running" | `rm data/.notifier.lock` and retry |
| 401 Unauthorized | Check token in `~/.discord-config.json` |
| Claude not receiving messages | Verify notifier is running: `ps aux \| grep discord-notifier` |

### Dependencies

- discord.js ^14.26.4
- Node.js >= 16.0.0
- jq (for JSON parsing in monitor scripts)

For detailed documentation, see README.md in the same directory.
