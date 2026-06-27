#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║                    DISCORD CLI - INSTRUCCIONES DE USO                    ║
 * ║                                                                          ║
 * ║  Este script permite enviar y leer mensajes de Discord sin necesidad de  ║
 * ║  configurar variables de entorno. Lee la configuración de un archivo      ║
 * ║  JSON ubicado en: ~/.discord-config.json                                 ║
 * ║                                                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * CONFIGURACIÓN REQUERIDA:
 * ------------------------
 * El archivo ~/.discord-config.json debe contener:
 * {
 *   "token": "TU_BOT_TOKEN",
 *   "channelId": "ID_DEL_CANAL_POR_DEFECTO",
 *   "userId": "TU_USER_ID"
 * }
 *
 * COMANDOS DISPONIBLES:
 * ---------------------
 * 1. ENVIAR MENSAJE:
 *    node discord.js send "Tu mensaje aquí"
 *    node discord.js send "Hola" --channel=1019945518501204002
 *    node discord.js send "Hola" --user=970114927488557146
 *
 * 2. LEER MENSAJES:
 *    node discord.js read
 *    node discord.js read --limit=20
 *    node discord.js read --channel=1019945518501204002 --limit=5
 *
 * 3. AYUDA:
 *    node discord.js help
 *    node discord.js
 *
 * EJEMPLOS DE USO:
 * ----------------
 * # Enviar mensaje al canal por defecto
 * node discord.js send "¡Hola equipo!"
 *
 * # Enviar mensaje a canal específico
 * node discord.js send "Alerta" --channel=1019945518501204002
 *
 * # Enviar DM a usuario
 * node discord.js send "Hola Luis" --user=970114927488557146
 *
 * # Leer últimos mensajes
 * node discord.js read --limit=10
 *
 * IDENTIFICADORES (IDs):
 * ----------------------
 * - Servidor LC: 1019945518501203999
 * - Canal #general: 1019945518501204002
 * - Usuario (Luis): 970114927488557146
 * - Bot: 1520243336282374264
 *
 * Para obtener IDs en Discord: Click derecho → "Copiar ID" (requiere Modo Desarrollador)
 *
 * DEPENDENCIAS:
 * -------------
 * - Node.js >= 16.x (usando módulos nativos: https, fs, path)
 * - No requiere instalación de paquetes externos
 *
 * Solución implementada el: 2026-06-26
 * Autor: Claude Code
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG_PATH = path.join(process.env.HOME, 'Codigo', '.discord-config.json');
let config = {};

// Intentar cargar configuración
try {
    if (fs.existsSync(CONFIG_PATH)) {
        config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } else {
        // Crear archivo de configuración de ejemplo si no existe
        const exampleConfig = {
            token: "TU_BOT_TOKEN_AQUI",
            channelId: "ID_CANAL_POR_DEFECTO",
            userId: "TU_USER_ID",
            serverId: "ID_DEL_SERVIDOR",
            serverName: "Nombre del Servidor",
            defaultChannel: "general"
        };
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(exampleConfig, null, 2));
        console.error(`⚠️  Archivo de configuración creado en: ${CONFIG_PATH}`);
        console.error('   Por favor, edítalo con tus credenciales reales de Discord.');
        process.exit(1);
    }
} catch (err) {
    console.error('❌ Error al cargar configuración:', err.message);
    console.error(`   Verifica que exista: ${CONFIG_PATH}`);
    process.exit(1);
}

// Verificar que la configuración sea válida
if (!config.token || config.token === "TU_BOT_TOKEN_AQUI") {
    console.error('❌ Error: El archivo de configuración no tiene un token válido.');
    console.error(`   Edita: ${CONFIG_PATH}`);
    console.error('   Obtén tu token en: https://discord.com/developers/applications');
    process.exit(1);
}

const TOKEN = config.token;
const DEFAULT_CHANNEL = config.channelId;

// ═══════════════════════════════════════════════════════════════════════════
// PARSEAR ARGUMENTOS
// ═══════════════════════════════════════════════════════════════════════════

function parseArgs() {
    const args = {
        _: [],
        channel: DEFAULT_CHANNEL,
        user: config.userId,
        limit: 10,
        interval: 30,
        message: ''
    };

    process.argv.slice(2).forEach((arg, i, arr) => {
        if (arg.startsWith('--')) {
            const [key, value] = arg.slice(2).split('=');
            if (value !== undefined) {
                args[key] = value;
            } else if (arr[i + 1] && !arr[i + 1].startsWith('--')) {
                args[key] = arr[i + 1];
            }
        } else if (!args.command) {
            args.command = arg;
        } else {
            args._.push(arg);
        }
    });

    // El mensaje es todo lo que queda en args._
    if (args._.length > 0) {
        args.message = args._.join(' ');
    }

    return args;
}

const args = parseArgs();

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIONES DE DISCORD API
// ═══════════════════════════════════════════════════════════════════════════

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
                    resolve(JSON.parse(responseData).id);
                } else if (res.statusCode === 401) {
                    reject(new Error('Token inválido. Verifica tu configuración.'));
                } else if (res.statusCode === 403) {
                    reject(new Error('Sin permisos para crear DM. Verifica los intents del bot.'));
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
                    resolve(JSON.parse(responseData));
                } else if (res.statusCode === 401) {
                    reject(new Error('Token inválido. Verifica tu configuración en ~/.discord-config.json'));
                } else if (res.statusCode === 403) {
                    reject(new Error('Sin permisos para enviar mensajes. Verifica los permisos del bot en el canal.'));
                } else if (res.statusCode === 404) {
                    reject(new Error('Canal no encontrado. Verifica el ID del canal.'));
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
                    reject(new Error('Token inválido. Verifica tu configuración.'));
                } else if (res.statusCode === 403) {
                    reject(new Error('Sin permisos para leer mensajes. Verifica los permisos del bot.'));
                } else if (res.statusCode === 404) {
                    reject(new Error('Canal no encontrado. Verifica el ID.'));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// COMANDOS
// ═══════════════════════════════════════════════════════════════════════════

async function send() {
    if (!args.message) {
        console.error('❌ Error: Debes proporcionar un mensaje');
        console.log('\nUso:');
        console.log('  node discord.js send "Tu mensaje"');
        console.log('  node discord.js send "Hola" --channel=ID_DEL_CANAL');
        console.log('  node discord.js send "Hola" --user=ID_DEL_USUARIO');
        console.log('\nEjemplo:');
        console.log('  node discord.js send "¡Buenas noches! 🌙"');
        process.exit(1);
    }

    try {
        let targetChannel = args.channel;
        let targetName = 'canal por defecto';

        if (args.user) {
            console.log('📝 Creando canal DM...');
            targetChannel = await createDM(args.user);
            targetName = `usuario ${args.user}`;
        } else if (args.channel) {
            targetName = `canal ${args.channel}`;
        }

        if (!targetChannel) {
            console.error('❌ Error: No se especificó canal.');
            console.error('   Soluciones:');
            console.error('   1. Configura "channelId" en ~/.discord-config.json');
            console.error('   2. Usa --channel=ID_DEL_CANAL');
            console.error('   3. Usa --user=ID_DEL_USUARIO para DM');
            process.exit(1);
        }

        console.log(`📤 Enviando mensaje al ${targetName}...`);
        const result = await sendMessage(targetChannel, args.message);
        console.log('✅ Mensaje enviado exitosamente');
        console.log(`   ID: ${result.id}`);
        console.log(`   Contenido: ${result.content}`);
        console.log(`   Timestamp: ${result.timestamp}`);

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

async function read() {
    try {
        const limit = parseInt(args.limit) || 10;
        const channelId = args.channel || DEFAULT_CHANNEL;

        if (!channelId) {
            console.error('❌ Error: No se especificó canal.');
            console.error('   Soluciones:');
            console.error('   1. Configura "channelId" en ~/.discord-config.json');
            console.error('   2. Usa --channel=ID_DEL_CANAL');
            process.exit(1);
        }

        console.log(`📥 Leyendo últimos ${limit} mensajes del canal ${channelId}...\n`);
        const messages = await getMessages(channelId, limit);

        if (messages.length === 0) {
            console.log('No hay mensajes en el canal.');
            return;
        }

        messages.reverse().forEach(msg => {
            const time = new Date(msg.timestamp).toLocaleString('es-ES', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
            });
            const bot = msg.author.bot ? '[BOT]' : '';
            const username = msg.author.global_name || msg.author.username;

            console.log(`[${time}] ${bot} @${username}:`);
            console.log(`  ${msg.content || '(sin contenido)'}`);

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

function help() {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║                    DISCORD CLI - AYUDA RÁPIDA                            ║
╚══════════════════════════════════════════════════════════════════════════╝

CONFIGURACIÓN:
--------------
Archivo: ~/.discord-config.json
Contiene: token, channelId, userId

COMANDOS:
---------
1. ENVIAR MENSAJE
   node discord.js send "Tu mensaje aquí"
   node discord.js send "Hola" --channel=1019945518501204002
   node discord.js send "Hola" --user=970114927488557146

2. LEER MENSAJES
   node discord.js read
   node discord.js read --limit=20
   node discord.js read --channel=1019945518501204002 --limit=5

3. ESTA AYUDA
   node discord.js help

IDs IMPORTANTES:
----------------
Servidor LC:      1019945518501203999
Canal #general:   1019945518501204002
Usuario (Luis):   970114927488557146
Bot:              1520243336282374264

Para obtener IDs: Click derecho en Discord → "Copiar ID"
(Requiere activar Modo Desarrollador en Discord)

SOLUCIÓN DE PROBLEMAS:
----------------------
• Error 401: Token inválido → Verifica ~/.discord-config.json
• Error 403: Sin permisos → Verifica permisos del bot en Discord Developer Portal
• Error 404: Canal no existe → Verifica el ID del canal

MÁS INFORMACIÓN:
----------------
Lee el encabezado de este archivo para instrucciones completas.
`);
}

// ═══════════════════════════════════════════════════════════════════════════
// EJECUCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

const command = args.command || 'help';

switch (command) {
    case 'send':
        send();
        break;
    case 'read':
        read();
        break;
    case 'help':
    default:
        help();
}
