#!/usr/bin/env node
/**
 * Setup script to configure Claude Code hooks for automatic Discord bot startup
 * and real-time message monitoring
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILL_DIR = __dirname;
const HOME = os.homedir();
const CLAUDE_SETTINGS_DIR = path.join(HOME, '.claude');
const SETTINGS_FILE = path.join(CLAUDE_SETTINGS_DIR, 'settings.json');

console.log('🔧 Configuring Claude Code hooks for Discord Bot Gateway...\n');

// Ensure .claude directory exists
if (!fs.existsSync(CLAUDE_SETTINGS_DIR)) {
    fs.mkdirSync(CLAUDE_SETTINGS_DIR, { recursive: true });
    console.log('✅ Created ~/.claude directory');
}

// Read existing settings or create new
let settings = {};
if (fs.existsSync(SETTINGS_FILE)) {
    try {
        settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        console.log('✅ Loaded existing settings.json');
    } catch (e) {
        console.log('⚠️  Creating new settings.json');
    }
} else {
    console.log('✅ Creating new settings.json');
}

// Ensure hooks object exists
if (!settings.hooks) {
    settings.hooks = {};
}
if (!settings.hooks.SessionStart) {
    settings.hooks.SessionStart = [];
}

// Normalize path for all platforms
const skillPath = SKILL_DIR.replace(/\\/g, '/');

// Check if our hooks already exist
const botHookExists = settings.hooks.SessionStart.some(h =>
    h.hooks?.some(hook =>
        hook.command?.includes('bot.js') && !hook.command?.includes('start-message-monitor')
    )
);

const monitorHookExists = settings.hooks.SessionStart.some(h =>
    h.hooks?.some(hook =>
        hook.command?.includes('start-message-monitor')
    )
);

// Remove existing hooks to update them
settings.hooks.SessionStart = settings.hooks.SessionStart.filter(h =>
    !h.hooks?.some(hook =>
        hook.command?.includes('discord-bot') ||
        hook.command?.includes('bot.js start') ||
        hook.command?.includes('start-message-monitor')
    )
);

// Add startup hook for bot
settings.hooks.SessionStart.push({
    matcher: "startup",
    hooks: [
        {
            type: "command",
            command: `echo "[Discord Bot] Starting..." && cd "${skillPath}" && node bot.js status > /dev/null 2>&1 || (nohup node bot.js start > bot.log 2>&1 &)`
        },
        {
            type: "command",
            command: `echo "[Discord Bot] Starting message monitor..." && sleep 3 && "${skillPath}/bin/start-message-monitor.sh"`
        }
    ]
});

// Add resume hook
settings.hooks.SessionStart.push({
    matcher: "resume",
    hooks: [
        {
            type: "command",
            command: `echo "[Discord Bot] Resuming..." && cd "${skillPath}" && node bot.js status > /dev/null 2>&1 || (nohup node bot.js start > bot.log 2>&1 &)`
        },
        {
            type: "command",
            command: `sleep 3 && "${skillPath}/bin/start-message-monitor.sh"`
        }
    ]
});

// Add clear hook
const clearHookIndex = settings.hooks.SessionStart.findIndex(h => h.matcher === "clear");
if (clearHookIndex === -1) {
    settings.hooks.SessionStart.push({
        matcher: "clear",
        hooks: [
            {
                type: "command",
                command: `"${skillPath}/bin/check-status.sh"`
            }
        ]
    });
}

console.log(botHookExists || monitorHookExists ? '✅ Updated Discord Bot hooks' : '✅ Added Discord Bot auto-start hooks');

// Write settings
fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
console.log(`\n✅ Saved configuration to: ${SETTINGS_FILE}`);

console.log('\n📋 Configuration Summary:');
console.log('  - Bot will auto-start on new Claude Code sessions');
console.log('  - Message monitor will auto-start 3 seconds after bot');
console.log('  - Claude will receive real-time notifications of Discord messages');
console.log('  - Bot will auto-restart on session resume (/resume)');
console.log('  - Logs will be saved to:', path.join(skillPath, 'bot.log'));

console.log('\n🧪 Testing configuration...');
console.log('  Run "claude" to start a new session and verify:');
console.log('    1. Bot starts automatically');
console.log('    2. Message monitor starts after 3 seconds');
console.log('    3. Send a test message in Discord');

console.log('\n⚠️  Important: Make sure jq is installed for message monitoring:');
console.log('    macOS: brew install jq');
console.log('    Ubuntu: sudo apt-get install jq');

console.log('\n💡 To disable auto-start:');
console.log(`    Edit ${SETTINGS_FILE} and remove the SessionStart hooks for discord-bot`);
