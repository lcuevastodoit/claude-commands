# Quick Start - Discord Bot Gateway

## 1-Minute Setup

```bash
# Install
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

## Daily Commands

| Task | Command |
|------|---------|
| Bot status | `node bot.js status` |
| Start manually | `node bot.js start` (auto-starts with Claude) |
| Send DM | `node send.js "message"` |
| Send to user | `node send.js "message" --user=ID` |
| Send to channel | `node send.js "message" --channel=ID` |
| Read messages | `node read.js --limit=20` |
| Read DMs only | `node read.js --dm` |
| Check status | `node bot.js status` |

## Auto-Start with Claude Code

After running `node setup-hooks.js`, the bot starts automatically:

```bash
# Just open Claude Code - bot will start automatically
# You should see: [Discord Bot] Auto-starting...

# To disable auto-start:
# Edit ~/.claude/settings.json and remove the discord-bot SessionStart hooks
```

## Background Mode

```bash
# Start in background (if not using auto-start)
nohup node bot.js start > bot.log 2>&1 &

# View logs
tail -f bot.log

# Stop
pkill -f "node bot.js start"
```

## Bot Auto-Responses

Message the bot in Discord:
- `ping` → Shows latency
- `hola` → Greets you
- `help` → Shows commands
- `status` → Shows uptime
- `dm` → Confirms if DM
