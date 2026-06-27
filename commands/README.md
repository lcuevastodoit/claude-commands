# Comandos de Discord para Claude Code

Colección de herramientas para interactuar con Discord desde Claude Code.

## ⚡ Uso Rápido

### Enviar Mensaje
```bash
node /Users/lcuevas/Codigo/scripts/discord.js send "Tu mensaje aquí"
```

### Leer Mensajes
```bash
node /Users/lcuevas/Codigo/scripts/discord.js read --limit=10
```

### Ver Ayuda
```bash
node /Users/lcuevas/Codigo/scripts/discord.js help
```

---

## 📁 Archivos

### Scripts Ejecutables (Node.js)

| Archivo | Descripción |
|---------|-------------|
| `discord.js` | CLI unificado - envía y lee mensajes |
| `discord-send.js` | Script específico para enviar |
| `discord-read.js` | Script específico para leer |
| `discord-monitor.js` | Monitoreo en tiempo real |

### Comandos Claude Code

| Archivo | Comando | Descripción |
|---------|---------|-------------|
| `discord-send.md` | `/discord-send` | Instrucciones para enviar mensajes |
| `discord-read.md` | `/discord-read` | Instrucciones para leer mensajes |
| `discord-help.md` | `/discord-help` | Ayuda general |

### Documentación

| Archivo | Contenido |
|---------|-----------|
| `discord-setup-guide.md` | Guía completa de instalación y configuración |
| `discord-send.md` | Documentación del comando send |
| `discord-read.md` | Documentación del comando read |

---

## 🔧 Configuración

**Archivo:** `~/.discord-config.json`

```json
{
  "token": "TU_BOT_TOKEN",
  "channelId": "1019945518501204002",
  "userId": "970114927488557146",
  "serverId": "1019945518501203999",
  "serverName": "LC Server",
  "defaultChannel": "general"
}
```

---

## 📝 IDs Importantes

- **Servidor LC:** `1019945518501203999`
- **Canal #general:** `1019945518501204002`
- **Usuario (Luis):** `970114927488557146`
- **Bot:** `1520243336282374264`

---

## 🚀 Ejemplos

### Enviar al canal por defecto
```bash
node /Users/lcuevas/Codigo/scripts/discord.js send "¡Hola equipo!"
```

### Enviar a canal específico
```bash
node /Users/lcuevas/Codigo/scripts/discord.js send "Alerta" --channel=1019945518501204002
```

### Enviar DM
```bash
node /Users/lcuevas/Codigo/scripts/discord.js send "Hola Luis" --user=970114927488557146
```

### Leer mensajes
```bash
node /Users/lcuevas/Codigo/scripts/discord.js read --limit=20
```

---

## ❓ Solución de Problemas

| Error | Causa | Solución |
|-------|-------|----------|
| 401 | Token inválido | Verificar `~/.discord-config.json` |
| 403 | Sin permisos | Verificar permisos del bot en Discord Developer Portal |
| 404 | Canal no existe | Verificar el ID del canal |

---

**Fecha de creación:** 2026-06-26
