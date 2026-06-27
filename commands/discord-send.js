#!/usr/bin/env node
/**
 * Script para enviar mensajes a Discord desde Claude Code
 * Uso: node discord-send.js --channel="ID" --message="texto"
 *    o: node discord-send.js --user="ID" --message="texto"
 */

const https = require('https');

// Parsear argumentos de línea de comandos
function parseArgs() {
    const args = {};
    const rawArgs = process.argv.slice(2);

    for (let i = 0; i < rawArgs.length; i++) {
        const arg = rawArgs[i];
        if (arg.startsWith('--')) {
            const [key, value] = arg.slice(2).split('=');
            args[key] = value || rawArgs[++i];
        }
    }

    return args;
}

// Leer variable de entorno
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const DEFAULT_CHANNEL = process.env.DISCORD_CHANNEL_ID;

const args = parseArgs();
const MESSAGE = args.message || args.m;
const CHANNEL_ID = args.channel || args.c || DEFAULT_CHANNEL;
const USER_ID = args.user || args.u;

// Validación
if (!TOKEN) {
    console.error('❌ Error: DISCORD_BOT_TOKEN no está configurado');
    console.error('   Configúralo con: export DISCORD_BOT_TOKEN="tu_token_aqui"');
    process.exit(1);
}

if (!MESSAGE) {
    console.error('❌ Error: Debes proporcionar un mensaje');
    console.error('   Uso: --message="Tu mensaje aquí"');
    process.exit(1);
}

if (!CHANNEL_ID && !USER_ID) {
    console.error('❌ Error: Debes proporcionar un canal o usuario');
    console.error('   Usa: --channel="ID_DEL_CANAL" o --user="ID_DEL_USUARIO"');
    console.error('   O configura DISCORD_CHANNEL_ID como variable de entorno');
    process.exit(1);
}

// Función para crear DM channel
function createDM(userId) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ recipient_id: userId });

        const options = {
            hostname: 'discord.com',
            port: 443,
            path: '/api/v10/users/@me/channels',
            method: 'POST',
            headers: {
                'Authorization': `Bot ${TOKEN}`,
                'Content-Type': 'application/json',
                'User-Agent': 'DiscordBot (claude-code, 1.0.0)'
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const data = JSON.parse(responseData);
                    resolve(data.id);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

// Función para enviar mensaje
function sendMessage(channelId, content) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ content });

        const options = {
            hostname: 'discord.com',
            port: 443,
            path: `/api/v10/channels/${channelId}/messages`,
            method: 'POST',
            headers: {
                'Authorization': `Bot ${TOKEN}`,
                'Content-Type': 'application/json',
                'User-Agent': 'DiscordBot (claude-code, 1.0.0)'
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 201) {
                    const response = JSON.parse(responseData);
                    resolve(response);
                } else if (res.statusCode === 401) {
                    reject(new Error('Token inválido o no autorizado'));
                } else if (res.statusCode === 403) {
                    reject(new Error('Sin permisos para enviar mensajes a este canal'));
                } else if (res.statusCode === 404) {
                    reject(new Error('Canal no encontrado'));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                }
            });
        });

        req.on('error', (err) => reject(err));
        req.write(data);
        req.end();
    });
}

// Ejecución principal
async function main() {
    try {
        let targetChannel = CHANNEL_ID;
        let targetName = 'canal';

        // Si se especificó un usuario, crear DM primero
        if (USER_ID) {
            try {
                console.log('📝 Creando canal DM...');
                targetChannel = await createDM(USER_ID);
                targetName = 'usuario';
                console.log('✅ Canal DM creado');
            } catch (err) {
                console.error('❌ Error al crear DM:', err.message);
                process.exit(1);
            }
        }

        // Enviar mensaje
        console.log(`📤 Enviando mensaje al ${targetName}...`);
        const result = await sendMessage(targetChannel, MESSAGE);

        console.log('✅ Mensaje enviado exitosamente');
        console.log(`   ID: ${result.id}`);
        console.log(`   Contenido: ${result.content}`);
        console.log(`   Timestamp: ${result.timestamp}`);

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

main();
