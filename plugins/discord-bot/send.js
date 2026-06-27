#!/usr/bin/env node
/**
 * Enviar mensajes a Discord usando el bot Gateway activo
 * Este script comunica con bot.js a través de archivos
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const COMMAND_FILE = path.join(DATA_DIR, 'command.json');
const STATUS_FILE = path.join(DATA_DIR, 'status.json');

// Parsear argumentos
function parseArgs() {
    const args = { _: [], message: '' };
    const allArgs = process.argv.slice(2);

    for (let i = 0; i < allArgs.length; i++) {
        const arg = allArgs[i];

        if (arg.startsWith('--')) {
            const [key, value] = arg.slice(2).split('=');
            if (value !== undefined) {
                args[key] = value;
            } else if (allArgs[i + 1] && !allArgs[i + 1].startsWith('--')) {
                args[key] = allArgs[i + 1];
                i++; // Saltar el valor
            } else {
                args[key] = true;
            }
        } else {
            args._.push(arg);
        }
    }

    // El mensaje es todo lo que no es flag
    if (args._.length > 0) {
        args.message = args._.join(' ');
    }

    return args;
}

const args = parseArgs();

// Verificar que el bot esté corriendo
function isBotRunning() {
    if (!fs.existsSync(STATUS_FILE)) return false;

    try {
        const status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
        const lastPing = status.lastPing;

        // Considerar online si el último ping fue hace menos de 15 segundos
        return status.online && lastPing && (Date.now() - lastPing < 15000);
    } catch (e) {
        return false;
    }
}

// Enviar mensaje
async function sendMessage() {
    if (!args.message) {
        console.error('❌ Error: Debes proporcionar un mensaje');
        console.log('\nUso:');
        console.log('  node send.js "Tu mensaje aquí"');
        console.log('  node send.js "Hola" --user=970114927488557146');
        console.log('  node send.js "Hola" --channel=1019945518501204002');
        process.exit(1);
    }

    if (!isBotRunning()) {
        console.error('❌ Error: El bot no está corriendo');
        console.log('   Inicia el bot primero con: node bot.js start');
        process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(
        path.join(process.env.HOME, 'Codigo', '.discord-config.json'), 'utf8'
    ));

    const command = {
        type: 'send',
        message: args.message,
        userId: args.user,
        channelId: args.channel || config.channelId,
        timestamp: Date.now(),
        processed: false
    };

    console.log('📤 Enviando mensaje...');
    console.log(`   Contenido: ${args.message}`);
    console.log(`   Destino: ${args.user ? `Usuario ${args.user}` : `Canal ${command.channelId}`}`);

    // Escribir comando
    fs.writeFileSync(COMMAND_FILE, JSON.stringify(command, null, 2));

    // Esperar a que se procese (máximo 10 segundos)
    let attempts = 0;
    const maxAttempts = 20;

    return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
            attempts++;

            try {
                const cmd = JSON.parse(fs.readFileSync(COMMAND_FILE, 'utf8'));

                if (cmd.processed) {
                    clearInterval(checkInterval);

                    if (cmd.result?.success) {
                        console.log('✅ Mensaje enviado exitosamente');
                        console.log(`   ID: ${cmd.result.messageId}`);
                        console.log(`   Timestamp: ${new Date(cmd.result.timestamp).toISOString()}`);
                        resolve(cmd.result);
                    } else {
                        console.error('❌ Error al enviar:', cmd.result?.error || 'Error desconocido');
                        reject(new Error(cmd.result?.error || 'Error desconocido'));
                    }
                }
            } catch (e) {
                // Ignorar errores de lectura
            }

            if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.error('❌ Timeout esperando respuesta del bot');
                reject(new Error('Timeout'));
            }
        }, 500);
    });
}

// Ejecutar
sendMessage().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
