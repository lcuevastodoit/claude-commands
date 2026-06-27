# Discord Bot Gateway

Bot de Discord con conexión WebSocket persistente y **monitoreo de mensajes en tiempo real** para Claude Code.

## 🚀 Características Principales

✅ **Conexión WebSocket persistente** - Recibe mensajes en tiempo real sin polling  
✅ **Estado "online" visible** - El bot aparece conectado en Discord  
✅ **Monitoreo en tiempo real** - Claude recibe notificaciones instantáneas de mensajes entrantes  
✅ **Comunicación bidireccional** - Claude puede responder mensajes de Discord en vivo  
✅ **Auto-inicio completo** - Bot y monitor se inician automáticamente con Claude Code  
✅ **Persistencia** - Guarda mensajes en archivo para consulta posterior

## 📋 Requisitos

- Node.js 16+
- Token de bot de Discord
- Configuración en `~/.discord-config.json`
- **jq** (para el monitoreo de mensajes)

## 🛠 Instalación Rápida

```bash
cd discord-bot-gateway

# 1. Instalar dependencias y configurar
node install.js

# 2. Verificar configuración
node test.js
```

La instalación configura automáticamente:
- Dependencias npm
- Permisos de scripts
- Directorio de datos
- Archivo de log para monitoreo

## ⚙️ Configuración

1. **Copiar el archivo de ejemplo** (incluido en el repo):
```bash
cp .discord-config.json.example ~/.discord-config.json
```

2. **Editar `~/.discord-config.json`** con tus datos:

```json
{
  "token": "TU_BOT_TOKEN",
  "channelId": "ID_CANAL_POR_DEFECTO",
  "userId": "TU_USER_ID"
}
```

**Obtener los valores:**
- **Token**: https://discord.com/developers/applications → Tu App → Bot → Reset Token
- **Channel ID**: Click derecho en canal → "Copiar ID del canal" (modo desarrollador)
- **User ID**: Click derecho en tu usuario → "Copiar ID de usuario" (modo desarrollador)

### Intents requeridos en Discord Developer Portal

- ✅ `Message Content Intent` (necesario para leer mensajes)
- ✅ `Server Members Intent` (opcional)

### Instalar jq

```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq
```

## 🎯 Uso

### Inicio Automático (Recomendado)

Al instalar el plugin con `node install.js`, se configuran hooks automáticos:

1. **Bot** se inicia al abrir Claude Code
2. **Monitor de mensajes** se inicia 3 segundos después
3. Claude recibe notificaciones de mensajes entrantes automáticamente

Para verificar que todo funciona:
```bash
# Ver estado del bot
node bot.js status

# Ver si el monitor está corriendo
ps aux | grep discord-notifier
```

### Inicio Manual

Si necesitas iniciar componentes manualmente:

```bash
# Iniciar bot
node bot.js start

# Iniciar monitor de mensajes (en otra terminal)
./bin/start-message-monitor.sh
```

## 💬 Flujo de Mensajes en Tiempo Real

```
[Discord] → [bot.js WebSocket] → [messages-stream.log]
                                        ↓
                              [discord-notifier.sh]
                                        ↓
                              [Claude Code] → Responde → [send.js] → [Discord]
```

Cuando llega un mensaje, Claude recibe:
```
═══════════════════════════════════════════════
📩 NUEVO MENSAJE DE DISCORD
═══════════════════════════════════════════════
👤 De: Username (ID: 123456789)
💬 Mensaje: "Hola, ¿cómo estás?"
📍 Tipo: DM

💡 Para responder:
   node send.js "Tu respuesta" --user=123456789
═══════════════════════════════════════════════
```

## 📝 Comandos Disponibles

### Enviar mensajes
```bash
# Enviar al usuario por defecto (DM)
node send.js "Hola, ¿cómo estás?"

# Enviar a usuario específico
node send.js "Hola" --user=970114927488557146

# Enviar a canal específico
node send.js "Mensaje de prueba" --channel=1019945518501204002
```

### Leer mensajes
```bash
# Últimos 10 mensajes
node read.js

# Últimos 20 mensajes
node read.js --limit=20

# Solo mensajes directos (DMs)
node read.js --dm

# De canal específico
node read.js --channel=1019945518501204002
```

### Ver estado
```bash
node bot.js status
```

### Ver mensajes guardados (sin bot activo)
```bash
node bot.js messages
node bot.js messages 20
```

## 🔧 Control del Monitor de Mensajes

```bash
# Iniciar monitor manualmente
./bin/start-message-monitor.sh

# Verificar si está corriendo
ps aux | grep discord-notifier

# Detener monitor
pkill -f discord-notifier
```

## 📁 Estructura de Archivos

```
discord-bot-gateway/
├── bot.js                      # Bot principal con WebSocket
├── send.js                     # CLI para enviar mensajes
├── read.js                     # CLI para leer mensajes
├── test.js                     # Verificar configuración
├── install.js                  # Instalación automática
├── discord-notifier.sh         # Monitor de mensajes en tiempo real
├── bin/
│   ├── start-bot.sh            # Inicia el bot
│   ├── start-message-monitor.sh # Inicia el monitor
│   ├── check-status.sh         # Verifica estado
│   └── monitor-bot.sh          # Monitor legacy
├── hooks/
│   └── hooks.json              # Hooks de auto-inicio
├── data/
│   ├── messages.json           # Cache de mensajes
│   ├── messages-stream.log     # Log para monitoreo (append)
│   └── status.json             # Estado del bot
├── SKILL.md                    # Documentación del skill
├── PLUGIN_README.md            # Documentación del plugin
└── README.md                   # Este archivo
```

## 🔄 Diferencias con MCP de Discord

| Característica | MCP de Discord | Bot Gateway |
|----------------|----------------|-------------|
| Conexión | REST API (polling) | WebSocket (real-time) |
| Estado online | ❌ No aparece | ✅ Siempre visible |
| Recibir mensajes | Manual | ✅ Automático |
| Notificar a Claude | ❌ No | ✅ En tiempo real |
| Latencia | Delay por polling | Instantáneo |
| Claude puede responder | ❌ Solo enviar | ✅ Enviar y responder |
| Auto-inicio | ❌ No | ✅ Con hooks |

## 🐛 Troubleshooting

### El monitor no notifica mensajes

1. Verificar que jq está instalado:
```bash
jq --version
```

2. Verificar que el monitor está corriendo:
```bash
ps aux | grep discord-notifier
```

3. Reiniciar el monitor:
```bash
pkill -f discord-notifier
./bin/start-message-monitor.sh
```

4. Probar manualmente:
```bash
echo '{"ts":123,"id":"test","content":"prueba","author":"Test","authorId":"123","isDM":true,"channelId":"456"}' >> data/messages-stream.log
```

### El bot no se conecta

```bash
# Verificar configuración
node test.js

# Verificar intents en Discord Developer Portal
# https://discord.com/developers/applications
```

### Token inválido

1. Ir a https://discord.com/developers/applications
2. Seleccionar tu aplicación → Bot → Reset Token
3. Actualizar `~/.discord-config.json`

## 📚 Documentación

- `SKILL.md` - Skill para Claude Code (comandos y uso)
- `PLUGIN_README.md` - Documentación completa del plugin
- `README.md` - Guía rápida (este archivo)

## 🔗 Enlaces útiles

- [Discord.js Guide](https://discordjs.guide/)
- [Discord Gateway Documentation](https://discord.com/developers/docs/topics/gateway)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [jq Manual](https://stedolan.github.io/jq/manual/)

---

**Versión 2.0.0** - Sistema de monitoreo en tiempo real agregado
