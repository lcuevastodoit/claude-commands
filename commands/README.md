# Comandos de Discord para Claude Code

Colección de herramientas para interactuar con Discord desde Claude Code.

## 🆕 NUEVO: Discord Bot Gateway Plugin

Para **monitoreo en tiempo real** y respuestas automáticas de Claude, usa el nuevo plugin:

```bash
cd ../plugin
node install.js
```

**Características:**
- ✅ Bot con WebSocket Gateway (siempre online)
- ✅ Monitoreo de mensajes en tiempo real
- ✅ Claude recibe notificaciones automáticas
- ✅ Respuestas bidireccionales

**Documentación:** `skills/discord-bot/README.md`

---

## ⚡ Scripts Clásicos (Legacy)

Para uso simple sin monitoreo en tiempo real:

### Enviar Mensaje
```bash
node discord.js send "Tu mensaje aquí"
```

### Leer Mensajes
```bash
node discord.js read --limit=10
```

### Ver Ayuda
```bash
node discord.js help
```

---

## 📁 Archivos

### Scripts Ejecutables (Node.js)

| Archivo | Descripción |
|---------|-------------|
| `discord.js` | CLI unificado - envía y lee mensajes |
| `discord-send.js` | Script específico para enviar |
| `discord-read.js` | Script específico para leer |
| `discord-monitor.js` | Monitoreo básico (legacy) |

### Plugin Discord Bot Gateway (Recomendado)

| Archivo | Descripción |
|---------|-------------|
| `../plugins/bot.js` | Bot con WebSocket Gateway |
| `../plugins/discord-notifier.sh` | Monitoreo en tiempo real |
| `../plugins/send.js` | Enviar mensajes |
| `../plugins/read.js` | Leer mensajes |
| `../plugins/README.md` | Documentación completa |

---

## 🔧 Configuración

**Archivo:** `~/.discord-config.json` (en tu home, NO en el repo)

```json
{
  "token": "YOUR_BOT_TOKEN_HERE",
  "channelId": "YOUR_CHANNEL_ID",
  "userId": "YOUR_USER_ID",
  "serverId": "YOUR_SERVER_ID",
  "serverName": "Your Server",
  "defaultChannel": "general"
}
```

**Obtener datos:**
- **Token**: https://discord.com/developers/applications
- **IDs**: Click derecho en Discord → "Copiar ID" (modo desarrollador)

---

## 🚀 Ejemplos

### Plugin (Recomendado)
```bash
cd ../plugin

# Enviar mensaje
node send.js "¡Hola equipo!"

# Enviar a canal específico
node send.js "Alerta" --channel=CHANNEL_ID

# Enviar DM
node send.js "Hola" --user=USER_ID

# Leer mensajes
node read.js --limit=20
```

### Scripts Legacy
```bash
# Enviar al canal por defecto
node discord.js send "¡Hola!"

# Leer mensajes
node discord.js read --limit=20
```

---

## ❓ Solución de Problemas

| Error | Causa | Solución |
|-------|-------|----------|
| 401 | Token inválido | Verificar `~/.discord-config.json` |
| 403 | Sin permisos | Verificar permisos del bot en Discord Developer Portal |
| 404 | Canal no existe | Verificar el ID del canal |

---

## 📚 Documentación

- **Plugin Gateway**: `../plugins/README.md`
- **Setup Guide**: `discord-setup-guide.md`
- **Quick Start**: `../plugins/QUICKSTART.md`

---

**Nota**: Los scripts legacy funcionan pero no tienen monitoreo en tiempo real. Para la experiencia completa con notificaciones automáticas a Claude, usa el **Discord Bot Gateway Plugin**.

**Fecha de creación:** 2026-06-26  
**Última actualización:** 2026-06-27
