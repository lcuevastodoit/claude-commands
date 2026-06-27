#!/usr/bin/env node
/**
 * Monitor de Discord - revisa nuevos mensajes periódicamente
 * Uso: node discord-monitor.js --channel=ID --interval=30
 */

const https = require('https');
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.argv.find(a => a.startsWith('--channel='))?.split('=')[1];
const INTERVAL = parseInt(process.argv.find(a => a.startsWith('--interval='))?.split('=')[1]) || 30;

if (!TOKEN || !CHANNEL_ID) {
    console.error('Usage: DISCORD_BOT_TOKEN=xxx node discord-monitor.js --channel=ID --interval=30');
    process.exit(1);
}

let lastMessageId = null;

function getMessages(channelId, after = null) {
    return new Promise((resolve, reject) => {
        let path = `/api/v10/channels/${channelId}/messages?limit=10`;
        if (after) path += `&after=${after}`;

        const options = {
            hostname: 'discord.com',
            port: 443,
            path: path,
            method: 'GET',
            headers: {
                'Authorization': `Bot ${TOKEN}`,
                'User-Agent': 'DiscordBot (claude-code, 1.0.0)'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) resolve(JSON.parse(data));
                else reject(new Error(`HTTP ${res.statusCode}`));
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function checkMessages() {
    try {
        const messages = await getMessages(CHANNEL_ID, lastMessageId);
        if (messages.length > 0) {
            messages.reverse().forEach(msg => {
                if (!msg.author.bot) {
                    const time = new Date(msg.timestamp).toLocaleTimeString();
                    console.log(`[${time}] @${msg.author.username}: ${msg.content}`);
                }
            });
            lastMessageId = messages[0].id;
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

console.log(`🔍 Monitoreando canal cada ${INTERVAL}s...`);
checkMessages();
setInterval(checkMessages, INTERVAL * 1000);
