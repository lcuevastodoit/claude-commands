# Quick Start - Discord Bot Gateway v2.0

## 🚀 1-Minute Setup

```bash
# Install dependencies
npm install

# Configure auto-start (recommended)
node setup-hooks.js

# Test config
node test.js

# Start bot (or restart Claude Code for auto-start)
node bot.js start

# In another terminal, send message
node send.js "Hello World!"

# Read messages
node read.js --dm
```

---

## 📱 Real-Time Message Monitoring (NEW v2.0)

The plugin now includes **automatic real-time message monitoring**:

### How it works:
1. When someone sends you a message on Discord → Bot receives it instantly
2. Message is written to `data/messages-stream.log`
3. `discord-notifier.sh` detects the new message
4. **Claude Code receives a notification** with message details
5. Claude can compose and send a response

### Notification Example:
```
═══════════════════════════════════════════════════
📩 NUEVO MENSAJE DE DISCORD
═══════════════════════════════════════════════════
👤 De: Username (ID: 123456789)
💬 Mensaje: "Hola, ¿cómo estás?"
📍 Tipo: DM

💡 Para responder:
   node /path/to/send.js "Tu respuesta" --user=123456789
═══════════════════════════════════════════════════
```

### Manual Control:
```bash
# Start message monitor manually
./bin/start-message-monitor.sh

# Check if monitor is running
ps aux | grep discord-notifier

# Stop monitor
pkill -f discord-notifier
```

---

## 📋 Daily Commands

| Task | Command |
|------|---------|
| Bot status | `node bot.js status` |
| Start manually | `node bot.js start` (auto-starts with Claude) |
| Send DM | `node send.js "message"` |
| Send to user | `node send.js "message" --user=ID` |
| Send to channel | `node send.js "message" --channel=ID` |
| Read messages | `node read.js --limit=20` |
| Read DMs only | `node read.js --dm` |
| Start message monitor | `./bin/start-message-monitor.sh` |

---

## 🤖 Auto-Start with Claude Code

After running `node setup-hooks.js`, the bot starts automatically:

```bash
# Just open Claude Code - bot will start automatically
# You should see: [Discord Bot] Starting...
# Then: [Discord Message Monitor] Started

# To disable auto-start:
# Edit ~/.claude/settings.json and remove the discord-bot SessionStart hooks
```

---

## 💻 Background Mode

```bash
# Start in background (if not using auto-start)
nohup node bot.js start > bot.log 2>&1 &

# View logs
tail -f bot.log

# Stop
pkill -f "node bot.js start"
```

---

## 📝 Bot Auto-Responses

Message the bot in Discord:
- `ping` → Shows latency
- `hola` → Greets you
- `help` → Shows commands
- `status` → Shows uptime
- `dm` → Confirms if DM

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Bot not starting | Check `node test.js` for config errors |
| Monitor not notifying | Verify `jq` is installed: `jq --version` |
| 401 Unauthorized | Check token in `~/.discord-config.json` |
| Bot offline | Run `node bot.js status` to check |

---

## 📚 More Info

- **Full Documentation**: See `README.md` and `PLUGIN_README.md`
- **Skill Reference**: See `SKILL.md`
- **Changelog**: See `CHANGELOG.md`

**Version**: 2.0.0 - Real-time message monitoring
