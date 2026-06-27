#!/usr/bin/env node
/**
 * Auto-Responder para Discord Bot
 * Procesa mensajes entrantes y genera respuestas automáticas
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PLUGIN_DIR = path.dirname(__filename);
const DATA_DIR = path.join(PLUGIN_DIR, 'data');
const PROCESSED_FILE = path.join(DATA_DIR, '.processed_messages.json');
const RESPONSE_QUEUE_FILE = path.join(DATA_DIR, '.response_queue.json');

// Cargar mensajes procesados
let processedMessages = new Set();
try {
    const data = JSON.parse(fs.readFileSync(PROCESSED_FILE, 'utf8'));
    processedMessages = new Set(data);
} catch (e) {
    processedMessages = new Set();
}

// Guardar mensajes procesados
function saveProcessed() {
    fs.writeFileSync(PROCESSED_FILE, JSON.stringify([...processedMessages]));
}

// Procesar mensaje y generar respuesta
async function processMessage(message) {
    const { id, content, author, authorId, channelId, isDM } = message;

    // Evitar procesar el mismo mensaje
    if (processedMessages.has(id)) {
        return null;
    }
    processedMessages.add(id);
    saveProcessed();

    // Generar respuesta basada en el contenido
    let response = generateResponse(content, author);

    if (response) {
        return {
            response,
            userId: authorId,
            channelId,
            isDM,
            originalMessage: content
        };
    }

    return null;
}

// Generar respuesta basada en el mensaje
function generateResponse(content, author) {
    const lowerContent = content.toLowerCase().trim();

    // Saludos
    if (/^(hola|hey|buenas|buenos días|buenas tardes|buenas noches)/.test(lowerContent)) {
        return `¡Hola ${author}! 👋 ¿En qué puedo ayudarte hoy?`;
    }

    // Preguntas sobre el clima (ejemplo)
    if (/clima|tiempo|temperatura/.test(lowerContent)) {
        return `No tengo acceso al clima en tiempo real, pero puedes consultar tu app de clima preferida. ¿Hay algo más en lo que pueda ayudarte?`;
    }

    // Preguntas sobre hora
    if (/hora|qué hora es/.test(lowerContent)) {
        const now = new Date();
        return `Son las ${now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} ⏰`;
    }

    // Preguntas sobre qué es algo
    if (/^(qué es|que es|definición de|explica)/.test(lowerContent)) {
        // Extraer el tema
        const match = content.match(/(?:qué es|que es|definición de|explica)\s+(.+?)(?:\?|$)/i);
        if (match) {
            const topic = match[1].trim();
            return generateKnowledgeResponse(topic);
        }
    }

    // Despedidas
    if (/^(adiós|adios|chao|hasta luego|nos vemos|bye)/.test(lowerContent)) {
        return `¡Hasta luego ${author}! 👋 Que tengas un buen día.`;
    }

    // Agradecimientos
    if (/^(gracias|thanks|thank you)/.test(lowerContent)) {
        return `¡De nada ${author}! 😊 Estoy aquí para lo que necesites.`;
    }

    // Mensaje por defecto para conversaciones
    return `Entiendo "${content}". ¿En qué más puedo ayudarte ${author}?`;
}

// Generar respuesta basada en conocimiento
function generateKnowledgeResponse(topic) {
    const knowledge = {
        'melon': '🍈 El melón es una fruta dulce de la familia Cucurbitaceae. Tiene una pulpa jugosa y dulce, y puede ser de diferentes variedades como cantalupo, honeydew o galia.',
        'sandía': '🍉 La sandía es una fruta grande, jugosa y refrescante. Pertenece a la familia de las cucurbitáceas y es muy popular en verano por su alto contenido de agua.',
        'abedul': '🌳 El abedul es un árbol de la familia Betulaceae, conocido por su corteza blanca y papelosa. Es común en climas templados del hemisferio norte.',
        'plátano': '🍌 El plátano (o banana) es una fruta alargada de la familia Musaceae. Rica en potasio y carbohidratos, es ideal para deportistas.',
        'discord': '💬 Discord es una plataforma de comunicación diseñada para comunidades, especialmente gamers. Permite chat de voz, texto y video en servidores.',
        'claude': '🤖 Claude es un asistente de IA creado por Anthropic. Estoy aquí para ayudarte con información, análisis, escritura y muchas otras tareas.',
    };

    const lowerTopic = topic.toLowerCase();

    for (const [key, value] of Object.entries(knowledge)) {
        if (lowerTopic.includes(key)) {
            return value;
        }
    }

    return `${topic.charAt(0).toUpperCase() + topic.slice(1)} es un tema interesante. ¿Te gustaría saber más sobre algún aspecto específico?`;
}

// Enviar respuesta a Discord
function sendResponse(responseData) {
    const { response, userId, channelId, isDM } = responseData;

    // Construir comando de envío
    let sendCmd;
    if (isDM) {
        sendCmd = `node "${path.join(PLUGIN_DIR, 'send.js')}" "${response.replace(/"/g, '\\"')}" --user=${userId}`;
    } else {
        sendCmd = `node "${path.join(PLUGIN_DIR, 'send.js')}" "${response.replace(/"/g, '\\"')}" --channel=${channelId}`;
    }

    // Ejecutar comando
    const child = spawn('bash', ['-c', sendCmd], {
        detached: true,
        stdio: 'ignore'
    });
    child.unref();

    console.log(`[Auto-Responder] Respuesta enviada a ${isDM ? 'DM' : 'canal'}: "${response.substring(0, 50)}..."`);
}

// Monitorear mensajes
function monitorMessages() {
    const messagesFile = path.join(DATA_DIR, 'messages.json');

    try {
        const data = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
        const messages = data.messages || [];

        // Procesar últimos 5 mensajes
        const recentMessages = messages.slice(-5);

        recentMessages.forEach(async (msg) => {
            const response = await processMessage(msg);
            if (response) {
                sendResponse(response);
            }
        });
    } catch (e) {
        // Error silencioso
    }
}

// Iniciar monitoreo
console.log('[Auto-Responder] Iniciado. Verificando mensajes cada 3 segundos...');
setInterval(monitorMessages, 3000);

// Verificación inicial
monitorMessages();
