#!/usr/bin/env node
/**
 * Script para leer mensajes de Discord desde Claude Code
 * Uso: node discord-read.js --channel="ID" --limit=10
 */

const https = require('https');

// Parsear argumentos
function parseArgs() {
    const args = { limit: 10 };
    const rawArgs = process.argv.slice(2);

    for (let i = 0; i < rawArgs.length; i++) {
        const arg = rawArgs[i];
        if (arg.startsWith('--')) {
            const [key, value] = arg.slice(2).split('=');
            args[key] = value || rawArgs[++i];
        }
    }

    // Si hay un argumento posicional, usarlo como limit
    const positional = rawArgs.find(a => !a.startsWith('--'));
    if (positional) {
        args.limit = parseInt(positional) || 10;
    }

    return args;
}

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const DEFAULT_CHANNEL = process.env.DISCORD_CHANNEL_ID;
const args = parseArgs();
const CHANNEL_ID = args.channel || args.c || DEFAULT_CHANNEL;
const LIMIT = Math.min(Math.max(parseInt(args.limit) || 10, 1), 100);

// Validación
if (!TOKEN) {
    console.error('❌ Error: DISCORD_BOT_TOKEN no está configurado');
    process.exit(1);
}

if (!CHANNEL_ID) {
    console.error('❌ Error: Debes proporcionar un ID de canal o configurar DISCORD_CHANNEL_ID');
    console.error('   Uso: --channel="ID_DEL_CANAL"');
    process.exit(1);
}

// Función para obtener mensajes
function getMessages(channelId, limit) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'discord.com',
            port: 443,
            path: `/api/v10/channels/${channelId}/messages?limit=${limit}`,
            method: 'GET',
            headers: {
                'Authorization': `Bot ${TOKEN}`,
                'User-Agent': 'DiscordBot (claude-code, 1.0.0)'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else if (res.statusCode === 401) {
                    reject(new Error('Token inválido'));
                } else if (res.statusCode === 403) {
                    reject(new Error('Sin permisos para leer este canal'));
                } else if (res.statusCode === 404) {
                    reject(new Error('Canal no encontrado'));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

// Ejecución principal
async function main() {
    try {
        console.log(`📥 Leyendo últimos ${LIMIT} mensajes del canal...\n`);
        const messages = await getMessages(CHANNEL_ID, LIMIT);

        if (messages.length === 0) {
            console.log('No hay mensajes en el canal.');
            return;
        }

        // Mostrar mensajes en orden cronológico (más antiguos primero)
        messages.reverse().forEach(msg => {
            const time = new Date(msg.timestamp).toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            const username = msg.author.global_name || msg.author.username;
            const bot = msg.author.bot ? '[BOT]' : '';

            console.log(`[${time}] ${bot} @${username}:`);
            console.log(`  ${msg.content || '(sin contenido)'}`);

            // Mostrar adjuntos si hay
            if (msg.attachments && msg.attachments.length > 0) {
                msg.attachments.forEach(att => {
                    console.log(`  📎 Adjunto: ${att.filename}`);
                });
            }

            console.log('');
        });

        console.log(`✅ Total: ${messages.length} mensajes`);

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

main();
