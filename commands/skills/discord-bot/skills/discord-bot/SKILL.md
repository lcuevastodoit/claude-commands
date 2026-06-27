---
description: Manage Discord Bot Gateway for real-time bidirectional communication. Use when the user wants to send messages to Discord, read received messages, check bot status, or troubleshoot Discord integration.
---

## Discord Bot Gateway Plugin

This plugin manages a Discord bot with WebSocket Gateway for real-time bidirectional communication.

### Current Bot Status

!`node ${CLAUDE_PLUGIN_ROOT}/bot.js status 2>/dev/null || echo "⚠️  Bot not running"`

### Available Commands

| Command | Purpose |
|---------|---------|
| Check status | `node ${CLAUDE_PLUGIN_ROOT}/bot.js status` |
| Start bot | `node ${CLAUDE_PLUGIN_ROOT}/bot.js start` |
| Send message | `node ${CLAUDE_PLUGIN_ROOT}/send.js "message" [--user=ID\|--channel=ID]` |
| Read messages | `node ${CLAUDE_PLUGIN_ROOT}/read.js [--limit=N] [--dm] [--channel=ID]` |
| View cached | `node ${CLAUDE_PLUGIN_ROOT}/bot.js messages [N]` |

### Quick Actions

**To send a Discord message:**
```bash
node ${CLAUDE_PLUGIN_ROOT}/send.js "Your message here"
```

**To read recent DMs:**
```bash
node ${CLAUDE_PLUGIN_ROOT}/read.js --dm --limit=10
```

**To check bot status:**
```bash
node ${CLAUDE_PLUGIN_ROOT}/bot.js status
```

### When to Use

Use this plugin when the user wants to:
- Send messages to Discord (DMs or channels)
- Read received Discord messages
- Check the bot status or troubleshoot issues
- Verify the Discord configuration

### Automatic Startup

This plugin includes hooks that automatically start the Discord bot when Claude Code initializes:

1. **SessionStart (startup)** - Starts the bot on new sessions
2. **SessionStart (resume)** - Restarts the bot when resuming sessions
3. **Background Monitor** - Watches the bot and restarts if it stops responding

The bot runs in the background and maintains its WebSocket connection to Discord Gateway.

### Configuration

Requires `~/.discord-config.json`:
```json
{
  "token": "BOT_TOKEN",
  "channelId": "DEFAULT_CHANNEL_ID",
  "userId": "YOUR_USER_ID"
}
```

Run `node ${CLAUDE_PLUGIN_ROOT}/test.js` to verify configuration.

### Plugin Structure

```
discord-bot-gateway/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── skills/
│   └── discord-bot/
│       └── SKILL.md         # This file
├── hooks/
│   └── hooks.json           # Auto-start hooks
├── monitors/
│   └── monitors.json        # Background monitor
├── bin/
│   ├── start-bot.sh         # Auto-start script
│   ├── check-status.sh      # Status checker
│   └── monitor-bot.sh       # Background monitor
├── bot.js                   # Main bot
├── send.js                  # Send messages
├── read.js                  # Read messages
├── test.js                  # Verify config
└── data/                    # Message persistence
```

### Key Features

Unlike the Discord MCP:
- ✅ Shows "online" status in Discord
- ✅ Receives messages instantly (no polling)
- ✅ Maintains WebSocket connection
- ✅ Auto-starts with Claude Code sessions
- ✅ Background monitor ensures uptime
- Requires `bot.js` to be running (handled automatically)

### Dependencies

- discord.js ^14.26.4
- Node.js >= 16.0.0

For detailed documentation, see README.md in the plugin directory.
