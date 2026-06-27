#!/usr/bin/env node
/**
 * Leer mensajes de Discord desde el bot Gateway activo
 * Muestra mensajes recibidos en tiempo real
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const STATUS_FILE = path.join(DATA_DIR, 'status.json');
const COMMAND_FILE = path.join(DATA_DIR, 'command.json');

// Parsear argumentos
function parseArgs() {
    const args = { _: [] };

    process.argv.slice(2).forEach((arg, i, arr) => {
        if (arg.startsWith('--')) {
            const [key, value] = arg.slice(2).split('=');
            if (value !== undefined) {
                args[key] = value;
            } else {
                args[key] = true;
            }
        } else {
            args._.push(arg);
        }
    });

    return args;
}

const args = parseArgs();

// Verificar que el bot esté corriendo
function isBotRunning() {
    if (!fs.existsSync(STATUS_FILE)) return false;

    try {
        const status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
        const lastPing = status.lastPing;

        return status.online && lastPing && (Date.now() - lastPing < 15000);
    } catch (e) {
        return false;
    }
}

// Leer mensajes del archivo
function readLocalMessages() {
    if (!fs.existsSync(MESSAGES_FILE)) {
        return [];
    }

    try {
        return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
    } catch (e) {
        return [];
    }
}

// Solicitar lectura al bot y esperar respuesta
async function requestReadCommand(options) {
    const command = {
        type: 'read',
        limit: parseInt(options.limit) || 10,
        channelId: options.channel,
        onlyDMs: options.dm || false,
        timestamp: Date.now(),
        processed: false
    };

    fs.writeFileSync(COMMAND_FILE, JSON.stringify(command, null, 2));

    // Esperar respuesta
    let attempts = 0;
    const maxAttempts = 20;

    return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
            attempts++;

            try {
                const cmd = JSON.parse(fs.readFileSync(COMMAND_FILE, 'utf8'));

                if (cmd.processed && cmd.type === 'read') {
                    clearInterval(checkInterval);

                    if (cmd.result?.success) {
                        resolve(cmd.result.messages);
                    } else {
                        reject(new Error(cmd.result?.error || 'Error desconocido'));
                    }
                }
            } catch (e) {
                // Ignorar
            }

            if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                // Fallback: leer localmente
                resolve(readLocalMessages().slice(0, options.limit || 10));
            }
        }, 500);
    });
}

// Mostrar mensajes
async function displayMessages() {
    const limit = parseInt(args.limit) || 10;
    const isOnline = isBotRunning();

    console.log(`📨 Leyendo mensajes...${isOnline ? ' (Bot online ✅)' : ' (Modo offline - leyendo caché)'}`);

    let messages = [];

    if (isOnline) {
        try {
            messages = await requestReadCommand({
                limit: limit,
                channel: args.channel,
                dm: args.dm
            });
        } catch (e) {
            console.log('⚠️ Error consultando al bot, usando caché local');
            messages = readLocalMessages();
        }
    } else {
        messages = readLocalMessages();
    }

    // Filtrar por tipo si se solicitó
    if (args.dm) {
        messages = messages.filter(m => m.channel.isDM);
    }

    // Limitar
    messages = messages.slice(0, limit);

    if (messages.length === 0) {
        console.log('\nNo hay mensajes disponibles.');
        if (!isOnline) {
            console.log('💡 Inicia el bot con: node bot.js start');
        }
        return;
    }

    console.log(`\nÚltimos ${messages.length} mensajes:\n`);

    messages.forEach(msg => {
        const time = new Date(msg.timestamp).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        const channelType = msg.channel.isDM ? 'DM' : 'Canal';
        const authorName = msg.author.globalName || msg.author.username;
        const botIndicator = msg.author.bot ? '[BOT] ' : '';

        console.log(`[${time}] ${channelType} | ${botIndicator}@${authorName}:`);
        console.log(`  ${msg.content || '(sin contenido)'}`);
        console.log('');
    });

    console.log(`✅ Total: ${messages.length} mensajes`);
}

// Ejecutar
if (args.help || args._.includes('help')) {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║                    READ.JS - Leer mensajes de Discord                    ║
╚══════════════════════════════════════════════════════════════════════════╝

USO:
  node read.js              Leer últimos 10 mensajes
  node read.js --limit=20   Leer últimos 20 mensajes
  node read.js --dm         Solo mensajes directos (DMs)
  node read.js --channel=ID Solo de un canal específico

El bot debe estar corriendo para recibir mensajes en tiempo real:
  node bot.js start
`);
    process.exit(0);
}

displayMessages().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
