#!/usr/bin/env node
/**
 * Script de prueba rápida para verificar configuración
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(process.env.HOME, 'Codigo', '.discord-config.json');

console.log('🧪 Probando configuración del bot...\n');

// Verificar archivo de config
console.log('1. Verificando archivo de configuración...');
if (!fs.existsSync(CONFIG_PATH)) {
    console.error(`   ❌ No existe: ${CONFIG_PATH}`);
    process.exit(1);
}
console.log(`   ✅ Archivo encontrado: ${CONFIG_PATH}`);

// Leer y validar config
let config;
try {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    console.log('   ✅ Configuración JSON válida');
} catch (e) {
    console.error('   ❌ Error parseando JSON:', e.message);
    process.exit(1);
}

// Verificar campos
console.log('\n2. Verificando campos requeridos:');
const required = ['token', 'channelId', 'userId'];
let allValid = true;

required.forEach(field => {
    if (config[field]) {
        const display = field === 'token'
            ? `${config[field].substring(0, 10)}...${config[field].substring(config[field].length - 5)}`
            : config[field];
        console.log(`   ✅ ${field}: ${display}`);
    } else {
        console.log(`   ❌ ${field}: FALTANTE`);
        allValid = false;
    }
});

if (!allValid) {
    console.error('\n❌ Configuración incompleta');
    process.exit(1);
}

// Verificar node_modules
console.log('\n3. Verificando dependencias...');
const nodeModulesPath = path.join(__dirname, 'node_modules', 'discord.js');
if (fs.existsSync(nodeModulesPath)) {
    console.log('   ✅ discord.js instalado');
} else {
    console.log('   ❌ discord.js no instalado');
    console.log('   Ejecuta: npm install');
    process.exit(1);
}

// Verificar directorio data
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('   ✅ Directorio data creado');
}

console.log('\n✅ Configuración válida. Todo listo para iniciar el bot!');
console.log('\nPróximos pasos:');
console.log('  1. node bot.js start    - Iniciar el bot');
console.log('  2. node send.js "Hola"   - Enviar mensaje de prueba');
console.log('  3. node read.js         - Leer mensajes recibidos');
