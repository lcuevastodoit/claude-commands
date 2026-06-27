#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║                DISCORD BOT GATEWAY - WebSocket Real-Time                   ║
 * ║                                                                          ║
 * ║  Bot de Discord con conexión WebSocket persistente para comunicación     ║
 * ║  bidireccional en tiempo real.                                           ║
 * ║                                                                          ║
 * ║  Reemplaza al MCP de Discord con:                                        ║
 * ║  - Recepción de mensajes en tiempo real                                  ║
 * ║  - Estado "online" visible                                               ║
 * ║  - Comunicación bidireccional                                            ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * USO:
 *   node bot.js start     - Iniciar el bot (mantiene conexión activa)
 *   node bot.js status    - Ver estado de la conexión
 *   node bot.js stop      - Detener el bot
 */

const { Client, GatewayIntentBits, Events, ActivityType, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG_PATH = path.join(process.env.HOME, 'Codigo', '.discord-config.json');
const DATA_DIR = path.join(__dirname, 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const STATUS_FILE = path.join(DATA_DIR, 'status.json');
const COMMAND_FILE = path.join(DATA_DIR, 'command.json');

// Crear directorio de datos si no existe
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Cargar configuración
let config = {};
try {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} catch (err) {
    console.error('❌ Error: No se pudo cargar la configuración de', CONFIG_PATH);
    process.exit(1);
}

// ═══════════════════════════════════════════════════════════════════════════
// CLIENTE DISCORD
// ═══════════════════════════════════════════════════════════════════════════

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel, Partials.Message]
});

// Almacenamiento de mensajes recientes
let recentMessages = [];
const MAX_RECENT_MESSAGES = 100;

// Cargar mensajes previos si existen
if (fs.existsSync(MESSAGES_FILE)) {
    try {
        recentMessages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
    } catch (e) {
        recentMessages = [];
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENTOS DEL BOT
// ═══════════════════════════════════════════════════════════════════════════

// Bot listo - mostrar estado online
client.on(Events.ClientReady, () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);
    console.log(`📡 Gateway WebSocket activo`);
    console.log(`📝 Presencia: Online y escuchando mensajes`);

    // Establecer presencia
    client.user.setPresence({
        status: 'online',
        activities: [{
            name: 'para mensajes 📨',
            type: ActivityType.Watching
        }]
    });

    // Guardar estado
    saveStatus({
        online: true,
        username: client.user.tag,
        startedAt: new Date().toISOString(),
        lastPing: Date.now()
    });

    // Ping periódico para mantener status file actualizado
    setInterval(() => {
        saveStatus({
            online: true,
            username: client.user.tag,
            startedAt: client.readyAt?.toISOString(),
            lastPing: Date.now()
        });

        // Procesar comandos pendientes
        processPendingCommands();
    }, 5000);
});

// Recibir mensajes en tiempo real
client.on(Events.MessageCreate, async (message) => {
    // Ignorar mensajes de otros bots (excepto configurado)
    if (message.author.bot) return;

    const msgData = {
        id: message.id,
        content: message.content,
        author: {
            id: message.author.id,
            username: message.author.username,
            globalName: message.author.globalName,
            bot: message.author.bot
        },
        channel: {
            id: message.channel.id,
            type: message.channel.type,
            isDM: message.channel.isDMBased?.() || false
        },
        timestamp: message.createdTimestamp,
        receivedAt: Date.now()
    };

    // Guardar en memoria
    recentMessages.unshift(msgData);
    if (recentMessages.length > MAX_RECENT_MESSAGES) {
        recentMessages = recentMessages.slice(0, MAX_RECENT_MESSAGES);
    }

    // Guardar en archivo
    saveMessages();

    // Log en consola
    const channelName = msgData.channel.isDM ? 'DM' : `#${message.channel.name || 'unknown'}`;
    console.log(`\n📩 [${new Date().toLocaleTimeString()}] Nuevo mensaje en ${channelName}`);
    console.log(`   De: ${msgData.author.globalName || msgData.author.username}`);
    console.log(`   Contenido: ${msgData.content.substring(0, 100)}${msgData.content.length > 100 ? '...' : ''}`);

    // Guardar en archivo de log append para monitoreo con tail -f
    appendMessageLog(msgData);

    // Auto-responder a ciertos comandos
    await handleAutoResponse(message);
});

// Manejar reconexiones
client.on(Events.ShardReconnecting, () => {
    console.log('🔄 Reconectando al Gateway...');
});

client.on(Events.ShardDisconnect, () => {
    console.log('⚠️ Desconectado del Gateway');
    saveStatus({ online: false, lastDisconnect: Date.now() });
});

// Manejar errores
client.on(Events.Error, (error) => {
    console.error('❌ Error del cliente:', error);
});

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIONES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════

async function handleAutoResponse(message) {
    // Las auto-respuestas están desactivadas para evitar duplicados
    // El bot solo reenvía mensajes a Claude, no responde automáticamente
    return;
}

function saveMessages() {
    try {
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(recentMessages, null, 2));
    } catch (e) {
        console.error('Error guardando mensajes:', e.message);
    }
}

// Archivo de log append para monitoreo con tail -f
const MESSAGES_LOG = path.join(DATA_DIR, 'messages-stream.log');

function appendMessageLog(msgData) {
    try {
        const logEntry = JSON.stringify({
            ts: Date.now(),
            id: msgData.id,
            content: msgData.content,
            author: msgData.author.globalName || msgData.author.username,
            authorId: msgData.author.id,
            isDM: msgData.channel.isDM,
            channelId: msgData.channel.id
        });
        fs.appendFileSync(MESSAGES_LOG, logEntry + '\n');
    } catch (e) {
        console.error('Error escribiendo log:', e.message);
    }
}

function saveStatus(status) {
    try {
        fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
    } catch (e) {
        console.error('Error guardando estado:', e.message);
    }
}

async function processPendingCommands() {
    if (!fs.existsSync(COMMAND_FILE)) return;

    try {
        const command = JSON.parse(fs.readFileSync(COMMAND_FILE, 'utf8'));

        // Verificar si es un comando nuevo (no procesado)
        if (command.processed) return;

        console.log(`\n⚙️ Procesando comando: ${command.type}`);

        switch (command.type) {
            case 'send':
                await handleSendCommand(command);
                break;
            case 'read':
                await handleReadCommand(command);
                break;
            case 'status':
                await handleStatusCommand(command);
                break;
        }

        // Marcar como procesado
        command.processed = true;
        command.processedAt = Date.now();
        fs.writeFileSync(COMMAND_FILE, JSON.stringify(command, null, 2));

    } catch (e) {
        console.error('Error procesando comando:', e.message);
    }
}

async function handleSendCommand(command) {
    try {
        let channel;

        if (command.userId) {
            // Enviar DM
            const user = await client.users.fetch(command.userId);
            channel = await user.createDM();
        } else {
            // Enviar a canal
            channel = await client.channels.fetch(command.channelId || config.channelId);
        }

        if (!channel) {
            throw new Error('No se pudo obtener el canal');
        }

        const msg = await channel.send(command.message);
        console.log(`✅ Mensaje enviado: ${msg.id}`);

        // Guardar resultado
        command.result = {
            success: true,
            messageId: msg.id,
            timestamp: msg.createdTimestamp
        };
    } catch (err) {
        console.error('Error enviando mensaje:', err.message);
        command.result = { success: false, error: err.message };
    }
}

async function handleReadCommand(command) {
    try {
        const limit = command.limit || 10;
        let messages = recentMessages.slice(0, limit);

        // Filtrar por canal si se especifica
        if (command.channelId) {
            messages = messages.filter(m => m.channel.id === command.channelId);
        }

        // Filtrar solo DMs si se solicita
        if (command.onlyDMs) {
            messages = messages.filter(m => m.channel.isDM);
        }

        command.result = {
            success: true,
            messages: messages
        };

        console.log(`✅ Leídos ${messages.length} mensajes`);
    } catch (err) {
        command.result = { success: false, error: err.message };
    }
}

async function handleStatusCommand(command) {
    command.result = {
        success: true,
        online: client.isReady(),
        username: client.user?.tag,
        uptime: client.uptime,
        ping: client.ws.ping,
        readyAt: client.readyAt?.toISOString()
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// COMANDOS CLI
// ═══════════════════════════════════════════════════════════════════════════

const command = process.argv[2];

switch (command) {
    case 'start':
        console.log('🚀 Iniciando bot de Discord Gateway...');
        console.log('   Presiona Ctrl+C para detener\n');
        client.login(config.token).catch(err => {
            console.error('❌ Error al iniciar:', err.message);
            process.exit(1);
        });
        break;

    case 'status':
        if (fs.existsSync(STATUS_FILE)) {
            const status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
            const lastPing = status.lastPing ? Date.now() - status.lastPing : null;

            console.log('📊 Estado del Bot:');
            console.log(`   Online: ${status.online ? '✅ Sí' : '❌ No'}`);
            console.log(`   Usuario: ${status.username || 'N/A'}`);
            console.log(`   Último ping: ${lastPing ? `${Math.floor(lastPing / 1000)}s atrás` : 'N/A'}`);
            console.log(`   Iniciado: ${status.startedAt || 'N/A'}`);
        } else {
            console.log('❌ El bot no está corriendo (no hay archivo de estado)');
        }
        process.exit(0);
        break;

    case 'messages':
        if (fs.existsSync(MESSAGES_FILE)) {
            const msgs = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
            const limit = parseInt(process.argv[3]) || 10;

            console.log(`📨 Últimos ${Math.min(msgs.length, limit)} mensajes:\n`);

            msgs.slice(0, limit).forEach(msg => {
                const time = new Date(msg.timestamp).toLocaleString('es-ES', {
                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                });
                const channel = msg.channel.isDM ? 'DM' : 'Canal';
                console.log(`[${time}] ${channel} | ${msg.author.username}:`);
                console.log(`  ${msg.content || '(sin contenido)'}`);
                console.log('');
            });
        } else {
            console.log('No hay mensajes guardados');
        }
        process.exit(0);
        break;

    default:
        console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║                    DISCORD BOT GATEWAY - CLI                             ║
╚══════════════════════════════════════════════════════════════════════════╝

USO:
  node bot.js start          Iniciar el bot (mantiene conexión WebSocket)
  node bot.js status         Ver estado actual del bot
  node bot.js messages [N]   Ver últimos N mensajes recibidos

El bot mantiene una conexión WebSocket persistente que permite:
  ✅ Recibir mensajes en tiempo real
  ✅ Mostrar estado "online" en Discord
  ✅ Responder inmediatamente sin polling

Para enviar mensajes mientras el bot corre, usa send.js:
  node send.js "Mensaje" --user=ID
  node send.js "Mensaje" --channel=ID

Para leer mensajes mientras el bot corre:
  node read.js --limit=10
  node read.js --dm
`);
        process.exit(0);
}
