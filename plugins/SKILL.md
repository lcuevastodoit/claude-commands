---
description: Manage Discord Bot Gateway for real-time bidirectional communication. Use when the user wants to send messages to Discord, read received messages, start/stop the bot, or troubleshoot Discord integration.
hooks:
  SessionStart:
    - matcher: startup
      hooks:
        - type: command
          command: "cd ${CLAUDE_SKILL_DIR} && node bot.js status > /dev/null 2>&1 || (echo 'Starting Discord bot...' && nohup node bot.js start > bot.log 2>&1 &)"
    - matcher: startup
      hooks:
        - type: command
          command: "sleep 3 && ${CLAUDE_SKILL_DIR}/bin/start-message-monitor.sh"
---

## Discord Bot Gateway Skill

This skill manages a Discord bot with WebSocket Gateway for real-time bidirectional communication.

### Current Bot Status

!`node ${CLAUDE_SKILL_DIR}/bot.js status 2>/dev/null || echo "⚠️  Bot not running. Starting automatically..." && cd ${CLAUDE_SKILL_DIR} && node bot.js status`

### Real-Time Message Monitoring

**Automatic Setup:**
- Bot starts automatically when Claude Code initializes
- Message monitor starts automatically 3 seconds after bot
- Incoming Discord messages trigger instant notifications to Claude

**Manual Control:**
```bash
# Start message monitor manually
${CLAUDE_SKILL_DIR}/bin/start-message-monitor.sh

# Check if monitor is running
ps aux | grep discord-notifier

# Stop monitor
pkill -f discord-notifier
```

### Available Commands

| Command | Purpose |
|---------|---------|
| Start bot | `node ${CLAUDE_SKILL_DIR}/bot.js start` |
| Send message | `node ${CLAUDE_SKILL_DIR}/send.js "message" [--user=ID\|--channel=ID]` |
| Read messages | `node ${CLAUDE_SKILL_DIR}/read.js [--limit=N] [--dm] [--channel=ID]` |
| Check status | `node ${CLAUDE_SKILL_DIR}/bot.js status` |
| View cached | `node ${CLAUDE_SKILL_DIR}/bot.js messages [N]` |
| Start message monitor | `${CLAUDE_SKILL_DIR}/bin/start-message-monitor.sh` |

### Quick Actions

**To send a Discord message:**
```bash
node ${CLAUDE_SKILL_DIR}/send.js "Your message here"
```

**To read recent DMs:**
```bash
node ${CLAUDE_SKILL_DIR}/read.js --dm --limit=10
```

**To start the bot (if not running):**
```bash
cd ${CLAUDE_SKILL_DIR} && node bot.js start
```

### When to Use

Use this skill when the user wants to:
- Send messages to Discord (DMs or channels)
- Read received Discord messages
- Start, stop, or check the bot status
- Troubleshoot Discord connectivity issues
- Verify the bot configuration
- Set up real-time message notifications

### Automatic Startup

This skill is configured with SessionStart hooks that automatically:
1. Starts the Discord bot when Claude Code initializes
2. Starts the message monitor 3 seconds later
3. Maintains WebSocket connection to Discord Gateway
4. Notifies Claude of incoming messages in real-time

**To verify everything started automatically:**
```bash
cd ${CLAUDE_SKILL_DIR} && node bot.js status
ps aux | grep discord-notifier
```

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
- **start-message-monitor.sh** - Initializes the message monitor

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
- ✅ Auto-starts with Claude Code sessions
- ✅ **Real-time message notifications to Claude**
- ✅ **Claude can respond to Discord messages live**
- Requires `bot.js` to be running (started automatically)

### Real-Time Message Flow

When a message arrives:
1. Discord Gateway sends it via WebSocket to bot.js
2. bot.js appends it to `data/messages-stream.log` (JSON Lines)
3. discord-notifier.sh detects the new line
4. Claude Code receives a notification with message details
5. Claude can compose and send a response via send.js

**Example Notification:**
```
═══════════════════════════════════════════════
📩 NUEVO MENSAJE DE DISCORD
═══════════════════════════════════════════════
🕐 14:32:15
👤 De: Username (ID: 123456789)
💬 Mensaje: "Hola, ¿cómo estás?"
📍 Tipo: DM
🆔 Channel ID: 987654321

💡 Para responder:
   node /path/to/send.js "Tu respuesta" --user=123456789
═══════════════════════════════════════════════
```

### Dependencies

- discord.js ^14.26.4
- Node.js >= 16.0.0
- jq (for JSON parsing in monitor scripts)

For detailed documentation, see README.md in the same directory.
