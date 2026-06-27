#!/usr/bin/env node
/**
 * Script de instalación para el skill discord-bot-gateway
 * Verifica dependencias, configura el entorno e inicializa el sistema de monitoreo
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG_PATH = path.join(process.env.HOME, 'Codigo', '.discord-config.json');
const DATA_DIR = path.join(__dirname, 'data');

console.log('🔧 Instalando Discord Bot Gateway Plugin...\n');

// 1. Verificar Node.js version
console.log('1. Verificando Node.js...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion < 16) {
    console.error(`   ❌ Node.js ${nodeVersion} encontrado. Se requiere Node.js 16+`);
    process.exit(1);
}
console.log(`   ✅ Node.js ${nodeVersion}`);

// 2. Verificar jq
console.log('\n2. Verificando jq (requerido para monitoreo)...');
try {
    execSync('jq --version', { stdio: 'pipe' });
    console.log('   ✅ jq instalado');
} catch (e) {
    console.log('   ⚠️  jq no encontrado. Instálalo para el monitoreo de mensajes:');
    console.log('      macOS: brew install jq');
    console.log('      Ubuntu: sudo apt-get install jq');
    console.log('      Otras: https://stedolan.github.io/jq/download/');
}

// 3. Instalar dependencias
console.log('\n3. Instalando dependencias npm...');
try {
    execSync('npm install', { stdio: 'inherit', cwd: __dirname });
    console.log('   ✅ Dependencias instaladas');
} catch (e) {
    console.error('   ❌ Error instalando dependencias:', e.message);
    process.exit(1);
}

// 4. Crear directorio data
console.log('\n4. Configurando directorio de datos...');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log('   ✅ Directorio data creado');
} else {
    console.log('   ✅ Directorio data ya existe');
}

// 5. Crear archivo de log para monitoreo
const logFile = path.join(DATA_DIR, 'messages-stream.log');
if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, '');
    console.log('   ✅ Archivo messages-stream.log creado');
}

// 6. Hacer ejecutables los scripts
console.log('\n5. Configurando permisos...');
const scripts = [
    'bot.js', 'send.js', 'read.js', 'test.js',
    'bin/start-bot.sh', 'bin/start-message-monitor.sh',
    'bin/check-status.sh', 'bin/monitor-bot.sh',
    'discord-notifier.sh'
];
scripts.forEach(script => {
    try {
        const scriptPath = path.join(__dirname, script);
        if (fs.existsSync(scriptPath)) {
            fs.chmodSync(scriptPath, 0o755);
        }
    } catch (e) {
        // Ignorar errores en Windows
    }
});
console.log('   ✅ Scripts configurados como ejecutables');

// 7. Verificar configuración
console.log('\n6. Verificando configuración de Discord...');
if (!fs.existsSync(CONFIG_PATH)) {
    console.log(`   ⚠️  No se encontró configuración en ${CONFIG_PATH}`);
    console.log('\n   Por favor, crea el archivo con el siguiente contenido:');
    console.log(`
{
  "token": "TU_BOT_TOKEN",
  "channelId": "ID_CANAL_POR_DEFECTO",
  "userId": "TU_USER_ID"
}
`);
    console.log('   Obtén tu token en: https://discord.com/developers/applications');
    console.log('   Activa "Message Content Intent" en el portal de desarrolladores');
} else {
    try {
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        if (config.token && config.token !== 'TU_BOT_TOKEN') {
            console.log('   ✅ Configuración encontrada');
        } else {
            console.log('   ⚠️  Configuración encontrada pero sin token válido');
        }
    } catch (e) {
        console.error('   ❌ Error leyendo configuración:', e.message);
    }
}

// 8. Verificar hooks
console.log('\n7. Verificando hooks de Claude Code...');
const hooksDir = path.join(__dirname, 'hooks');
if (fs.existsSync(path.join(hooksDir, 'hooks.json'))) {
    console.log('   ✅ Hooks configurados');
    console.log('   El bot y el monitor se iniciarán automáticamente con Claude Code');
} else {
    console.log('   ⚠️  No se encontraron hooks. El auto-inicio no funcionará.');
}

// 9. Mostrar resumen
console.log('\n' + '='.repeat(60));
console.log('✅ Instalación completada!');
console.log('='.repeat(60));
console.log('\n📋 Próximos pasos:');
console.log('  1. Configura ~/.discord-config.json si aún no lo has hecho');
console.log('  2. Ejecuta: node test.js              (verificar configuración)');
console.log('  3. Inicia Claude Code - el bot se iniciará automáticamente');
console.log('  4. El monitor de mensajes se iniciará 3 segundos después');
console.log('  5. Envía un mensaje en Discord para probar');

console.log('\n📖 Comandos útiles:');
console.log('  node bot.js status                      (ver estado)');
console.log('  node send.js "Mensaje" --user=ID        (enviar DM)');
console.log('  ./bin/start-message-monitor.sh          (iniciar monitor manual)');
console.log('  ps aux | grep discord-notifier          (verificar monitor)');

console.log('\n📚 Para más información:');
console.log('  cat SKILL.md        (documentación del skill)');
console.log('  cat PLUGIN_README.md (documentación completa)');
console.log('  cat README.md        (guía rápida)');

console.log('\n🚀 El sistema de monitoreo en tiempo real está listo!');
