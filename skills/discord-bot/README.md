# Discord Bot Plugin para Claude Code

Plugin completo para integración bidireccional con Discord. Recibe mensajes en tiempo real y responde automáticamente como una conversación natural.

## Características

- **WebSocket Gateway persistente** - Conexión en tiempo real con Discord
- **Notificaciones duales** - Desktop (macOS) + Claude Code
- **Respuestas automáticas** - El bot responde directamente a los mensajes
- **Inicio manual controlado** - Comando `/iniciar-discord-bot` (sin hooks automáticos)
- **Instalación manual** - npm install + configuración

> **NOTA**: Los hooks automáticos fueron removidos para evitar bucles infinitos. Ahora el bot se inicia manualmente con `/iniciar-discord-bot`.

## Requisitos

- Node.js 16+
- jq (para procesar mensajes)
- macOS (para notificaciones de escritorio) o Linux

## Instalación Rápida

### 1. Clonar o copiar el plugin

```bash
# Copiar a la ubicación de plugins de Claude Code
cp -r discord-bot ~/.claude/plugins/
# O mantener en tu ubicación preferida
```

### 2. Instalar dependencias

```bash
cd discord-bot
npm install
```

Esto instalará:
- `discord.js` - Cliente Discord oficial
- Otras dependencias de package.json

**Nota**: `node_modules/` está en `.gitignore` y no debe versionarse.

### 3. Configurar Discord Bot

#### 3.1 Crear aplicación en Discord Developer Portal

1. Ve a https://discord.com/developers/applications
2. Click en "New Application" → Dale un nombre
3. Ve a la pestaña "Bot" → Click "Reset Token" y guárdalo
4. Activa estos intents:
   - ✅ `Message Content Intent` (necesario para leer mensajes)
   - ✅ `Server Members Intent` (opcional, para información de miembros)

#### 3.2 Invitar el bot a tu servidor

1. Ve a "OAuth2" → "URL Generator"
2. Selecciona scopes: `bot`
3. Selecciona permisos:
   - ✅ Send Messages
   - ✅ Read Message History
   - ✅ View Channels
4. Copia la URL generada y ábrela en tu navegador
5. Selecciona el servidor y autoriza

#### 3.3 Configurar archivo de configuración

Crea el archivo `~/.discord-config.json`:

```json
{
  "token": "TU_BOT_TOKEN_AQUI",
  "channelId": "ID_CANAL_POR_DEFECTO",
  "userId": "TU_USER_ID"
}
```

**Obtener los valores:**

- **Token**: Discord Developer Portal → Tu App → Bot → Reset Token
- **Channel ID**: Click derecho en canal → "Copiar ID del canal" (modo desarrollador activado)
- **User ID**: Click derecho en tu usuario → "Copiar ID de usuario" (modo desarrollador)

**Activar Modo Desarrollador en Discord:**
- Discord → Configuración → Avanzado → Modo Desarrollador: ON

## Uso

### Inicio Manual (RECOMENDADO)

Ejecuta el comando unificado:

```bash
/iniciar-discord-bot
```

Este comando:
- Limpia procesos anteriores
- Inicia el bot Discord con WebSocket Gateway
- Inicia el notificador con protección anti-duplicados
- Inicia el Monitor Tool de Claude Code para recibir mensajes
- Muestra el estado final

**¿Por qué no auto-inicio?** Los hooks automáticos causaban bucles infinitos y múltiples instancias. El inicio manual da control total.

### Comandos Manuales

```bash
# En el directorio del plugin
cd /ruta/al/discord-bot

# Iniciar bot
node bot.js start

# Ver estado
node bot.js status

# Detener bot
node bot.js stop

# Enviar mensaje a usuario (DM)
node send.js "Hola, ¿cómo estás?" --user=ID_USUARIO

# Enviar mensaje a canal
node send.js "Mensaje de prueba" --channel=ID_CANAL

# Leer últimos mensajes
node read.js --limit=10

# Leer solo DMs
node read.js --dm
```

### Estructura de Archivos

```
discord-bot/
├── bot.js                      # Bot principal con WebSocket Gateway
├── send.js                     # CLI para enviar mensajes
├── read.js                     # CLI para leer mensajes
├── test.js                     # Verificar configuración
├── auto-responder.js           # Respuestas automáticas del bot
├── discord-notifier.sh         # Notificador con anti-duplicados
├── check-discord-messages.sh   # Script para Monitor Tool de Claude
├── iniciar-discord-bot.sh      # Script unificado (bot + notifier)
├── install.sh                  # Instalador automático
├── package.json                # Dependencias npm
├── SKILL.md                    # Skill para Claude Code
├── README.md                   # Documentación principal
├── CHANGELOG.md                # Historial de cambios
├── QUICKSTART.md               # Guía rápida
├── PLUGIN_README.md            # Documentación detallada
├── LICENSE                     # Licencia MIT
├── .gitignore                  # Ignorar node_modules, data, logs
├── .discord-config.json.example # Ejemplo de configuración
├── bin/
│   └── start-message-monitor.sh  # Legacy: inicia monitor (opcional)
├── data/                       # Datos de runtime (no va al repo)
│   └── .gitkeep                # Mantiene el directorio en git
├── hooks/
│   └── hooks.json.disabled     # Hooks deshabilitados (evitan bucles)
└── monitors/
    └── monitors.json.disabled  # Monitores deshabilitados
```

## Flujo de Mensajes

```
Discord Gateway
      ↓
  bot.js (WebSocket)
      ↓
messages-stream.log
      ↓
discord-notifier.sh
      ├──→ Notificación Desktop (macOS)
      └──→ Notificación Claude Code
              ↓
        Claude responde (opcional)
              ↓
          send.js → Discord
```

## Solución de Problemas

### El bot no se conecta

```bash
# Verificar configuración
node test.js

# Verificar logs
tail -f data/bot.log

# Reiniciar
pkill -f "bot.js"
node bot.js start
```

### No llegan notificaciones

```bash
# Verificar que notifier está corriendo
ps aux | grep discord-notifier

# Verificar últimos mensajes
tail -5 data/messages-stream.log

# Reiniciar notifier
pkill -f "discord-notifier"
./discord-notifier.sh &
```

### Error "No se pudo cargar la configuración"

```bash
# Verificar que existe el archivo
ls -la ~/.discord-config.json

# Verificar formato JSON
jq . ~/.discord-config.json

# Si está en otra ubicación, crear enlace simbólico
ln -s ~/.discord-config.json ~/Codigo/.discord-config.json
```

## Desarrollo

### Agregar Respuestas Automáticas

Editar `auto-responder.js` y agregar patrones:

```javascript
// En la función generateResponse
if (/tu-patron/.test(lowerContent)) {
    return 'Tu respuesta personalizada';
}
```

### Estructura del Mensaje

Cada mensaje en `messages-stream.log` tiene este formato:

```json
{
  "ts": 1234567890123,
  "id": "mensaje-id-discord",
  "content": "Contenido del mensaje",
  "author": "Nombre de usuario",
  "authorId": "id-del-usuario",
  "isDM": true,
  "channelId": "id-del-canal"
}
```

## Licencia

MIT - Ver archivo LICENSE para detalles

## Changelog

### v3.0.0 - Inicio Manual (Sin Hooks Automáticos)
- **BREAKING**: Removidos hooks automáticos de SessionStart (causaban bucles infinitos)
- Agregado comando `/iniciar-discord-bot` para inicio manual controlado
- Agregado `check-discord-messages.sh` para integración con Monitor Tool
- Protección anti-duplicados mejorada en notificador
- Documentación actualizada con flujo correcto

### v2.1.0
- Sistema de notificación dual (Desktop + Claude Code)
- Instalador automático
- Auto-responder integrado
- Soporte multi-plataforma (macOS/Linux)

### v2.0.0
- Sistema de monitoreo en tiempo real
- Notificaciones nativas de macOS
- Monitor de Claude Code

### v1.0.0
- Bot WebSocket Gateway básico
- Comandos send.js y read.js
- Auto-inicio con SessionStart hooks
