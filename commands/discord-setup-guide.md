# Guía de Instalación y Configuración - Discord MCP

Esta guía documenta todos los requerimientos y pasos necesarios para integrar Claude Code con Discord usando MCP y scripts de Node.js.

## 📋 Resumen de lo implementado

- **MCP Discord**: Instalado pero requiere configuración adicional
- **Scripts Node.js**: Funcionan directamente con la API REST de Discord
- **Comandos personalizados**: `/discord-send` y `/discord-read`

---

## 🔧 Requerimientos Técnicos

### 1. Node.js

**Versión requerida:** >= 16.x (recomendado 18.x o superior)

**Verificar instalación:**
```bash
node --version
npm --version
```

**Instalación:**
```bash
# macOS con Homebrew
brew install node

# O descargar desde: https://nodejs.org/
```

### 2. Dependencias de Node.js

**No se requieren dependencias externas** - Los scripts usan solo módulos nativos de Node.js:
- `https` - Para llamadas a la API de Discord
- `readline` - Para lectura de entrada (en monitor)

### 3. Discord Bot Token

**Obtención:**
1. Ir a [Discord Developer Portal](https://discord.com/developers/applications)
2. Crear nueva aplicación (o usar una existente)
3. Ir a la sección **"Bot"**
4. Click en **"Reset Token"** y copiar el token
5. Guardar en lugar seguro (solo se muestra una vez)

---

## ⚙️ Configuración del Bot en Discord

### Paso 1: Privileged Gateway Intents

En Discord Developer Portal → Bot → Privileged Gateway Intents, activar:

- [x] **MESSAGE CONTENT INTENT** ← Obligatorio
- [x] **SERVER MEMBERS INTENT** ← Recomendado
- [x] **PRESENCE INTENT** ← Opcional

### Paso 2: Permisos del Bot (OAuth2)

Ir a OAuth2 → URL Generator y seleccionar:

**Scopes:**
- `bot`

**Bot Permissions:**
- Send Messages
- Send Messages in Threads
- Create Public Threads
- Create Private Threads
- Embed Links
- Attach Files
- Read Message History
- Mention Everyone
- Use Slash Commands
- Add Reactions
- Use External Emojis

**URL de invitación generada:**
```
https://discord.com/api/oauth2/authorize?client_id=TU_CLIENT_ID&permissions=535259329600&scope=bot
```

### Paso 3: Invitar al Bot

1. Usar la URL generada
2. Seleccionar el servidor (ej: LC Server)
3. Autorizar permisos

---

## 🔐 Variables de Entorno

### Configuración requerida

Agregar a tu `~/.zshrc`, `~/.bashrc` o archivo de entorno:

```bash
# Discord Bot Configuration
export DISCORD_BOT_TOKEN="YOUR_BOT_TOKEN_HERE"
export DISCORD_CHANNEL_ID="1019945518501204002"  # Canal #general por defecto
export DISCORD_USER_ID="970114927488557146"      # Tu ID de usuario
```

**Recargar configuración:**
```bash
source ~/.zshrc  # o ~/.bashrc
```

**Verificar:**
```bash
echo $DISCORD_BOT_TOKEN
echo $DISCORD_CHANNEL_ID
```

### Archivos de Configuración Claude Code

Claude Code usa dos niveles de configuración:

#### 1. Configuración Global (`~/.claude.json`)

Aplica a todos los proyectos:
```json
{
  "mcpServers": {
    "discord": {
      "command": "npx",
      "args": ["-y", "discord-mcp@latest"],
      "env": {
        "DISCORD_BOT_TOKEN": "tu_token_aqui"
      }
    }
  }
}
```

#### 2. Configuración de Proyecto (`.mcp.json`)

En el directorio del proyecto (`/Users/<user>/root-project-path/.mcp.json`):
```json
{
  "mcpServers": {
    "discord": {
      "command": "npx",
      "args": ["-y", "discord-mcp@latest"],
      "env": {
        "DISCORD_BOT_TOKEN": "tu_token_aqui"
      }
    }
  }
}
```

**Nota:** La configuración de proyecto requiere aprobación explícita con `claude` antes de usar.

---

## 📦 Archivos Instalados/Creados

### MCP Discord (Intento inicial)

```bash
# Instalación del MCP (no funcionó directamente)
claude mcp add discord -e DISCORD_BOT_TOKEN="$DISCORD_BOT_TOKEN" -- npx -y discord-mcp@latest

# Estado: Conectado pero 401 Unauthorized al usar
# Solución: Scripts de Node.js directos
```

### Configuración MCP (Archivo JSON)

Ubicación del archivo de configuración local de Claude Code:
- **macOS/Linux:** `~/.claude.json`
- **Proyecto:** `/Users/<user>/root-project-path/.mcp.json`

**Estructura del archivo `.mcp.json`:**

```json
{
  "mcpServers": {
    "discord": {
      "command": "npx",
      "args": ["-y", "discord-mcp@latest"],
      "env": {
        "DISCORD_BOT_TOKEN": "YOUR_BOT_TOKEN_HERE"
      }
    }
  }
}
```

**Configuración alternativa con script wrapper (intento):**

```json
{
  "mcpServers": {
    "discord": {
      "command": "/Users/<user>/root-project-path/discord-mcp-bridge.js"
    }
  }
}
```

**Comandos útiles para gestionar MCP:**

```bash
# Listar servidores MCP configurados
claude mcp list

# Ver detalles de un servidor
claude mcp get discord

# Agregar servidor MCP
claude mcp add discord -e DISCORD_BOT_TOKEN="$DISCORD_BOT_TOKEN" -- npx -y discord-mcp@latest

# Eliminar servidor MCP
claude mcp remove discord -s local
claude mcp remove discord -s project

# Agregar desde configuración JSON
claude mcp add-json discord '{"command": "npx", "args": ["-y", "discord-mcp@latest"], "env": {"DISCORD_BOT_TOKEN": "tu_token"}}'
```

### Scripts de Node.js (Funcionales)

Ubicación: `/Users/<user>/root-project-path/scripts/` y `/Users/<user>/root-project-path/claude-commands/commands/`

| Script | Propósito | Ejemplo de uso |
|--------|-----------|----------------|
| `discord-send.js` | Enviar mensajes | `node discord-send.js --message="Hola" --channel=ID` |
| `discord-read.js` | Leer mensajes | `node discord-read.js --channel=ID --limit=10` |
| `discord-monitor.js` | Monitorear en tiempo real | `node discord-monitor.js --channel=ID --interval=30` |

### Comandos Claude Code

Ubicación: `/Users/<user>/root-project-path/.claude/commands/`

- `discord-send.md` - Definición del comando `/discord-send`
- `discord-read.md` - Definición del comando `/discord-read`

---

## 🚀 Uso

### Enviar Mensajes

```bash
# Canal específico
node /Users/<user>/root-project-path/scripts/discord-send.js \
  --message="Hola equipo" \
  --channel=1019945518501204002

# DM a usuario
node /Users/<user>/root-project-path/scripts/discord-send.js \
  --message="Hola Luis" \
  --user=970114927488557146

# Usar canal por defecto (DISCORD_CHANNEL_ID)
node /Users/<user>/root-project-path/scripts/discord-send.js \
  --message="Deploy completado ✅"
```

### Leer Mensajes

```bash
# Últimos 10 mensajes (default)
node /Users/<user>/root-project-path/scripts/discord-read.js \
  --channel=1019945518501204002

# Especificar cantidad
node /Users/<user>/root-project-path/scripts/discord-read.js \
  --channel=1019945518501204002 \
  --limit=20
```

### Monitorear Mensajes

```bash
# Revisar cada 30 segundos
node /Users/<user>/root-project-path/scripts/discord-monitor.js \
  --channel=1019945518501204002 \
  --interval=30
```

---

## 🔍 Solución de Problemas

### Error 401: Unauthorized

**Causas:**
- Token inválido o expirado
- Variable de entorno no cargada
- Bot no configurado correctamente en Developer Portal

**Solución:**
```bash
# Verificar token
 echo $DISCORD_BOT_TOKEN

# Recargar shell
source ~/.zshrc

# Verificar en Discord Developer Portal que el token sea correcto
```

### Error 403: Forbidden

**Causas:**
- Bot sin permisos en el canal
- Privileged Intents no activados

**Solución:**
1. Verificar que el bot tenga permisos en el servidor
2. Activar MESSAGE CONTENT INTENT en Developer Portal
3. Reinvitar al bot si se cambiaron permisos

### Error 404: Not Found

**Causas:**
- ID de canal incorrecto
- Canal eliminado

**Solución:**
- Verificar el ID del canal (click derecho → Copiar ID)
- Activar Modo Desarrollador en Discord si no está visible

---

## 📊 IDs Importantes

### Servidor LC
- **Guild ID:** `1019945518501203999`
- **Canal #general:** `1019945518501204002`

### Usuario
- **User ID:** `970114927488557146`

### Bot
- **Application ID:** `1520243336282374264`
- **Bot ID:** `1520243336282374264`

---

## 🔄 Flujo de Trabajo Recomendado

### 1. Configuración inicial (una vez)
```bash
# 1. Configurar variables de entorno
export DISCORD_BOT_TOKEN="tu_token"
export DISCORD_CHANNEL_ID="id_canal_por_defecto"

# 2. Guardar en ~/.zshrc para persistencia
echo 'export DISCORD_BOT_TOKEN="..."' >> ~/.zshrc
```

### 2. Uso diario
```bash
# Leer mensajes recientes
node /Users/<user>/root-project-path/scripts/discord-read.js --limit=5

# Enviar notificación
node /Users/<user>/root-project-path/scripts/discord-send.js --message="Build completado"
```

### 3. Monitoreo (si es necesario)
```bash
# En una terminal separada o con Monitor
cd /Users/<user>/root-project-path/scripts && node discord-monitor.js --interval=60
```

---

## 📝 Notas Técnicas

### Rate Limits de Discord

Discord tiene límites de velocidad:
- **Mensajes:** 5 por 5 segundos por canal
- **DMs:** 10 por 10 segundos
- **Globales:** 50 por segundo (aproximadamente)

### Seguridad

- **Nunca compartir el token** - Da control total sobre el bot
- **No commitear tokens** - Usar variables de entorno
- **Rotar tokens** - Cambiar periódicamente en Developer Portal

### Alternativas Consideradas

| Opción | Estado | Notas |
|--------|--------|-------|
| MCP Discord oficial | ❌ No existe | `@modelcontextprotocol/server-discord` no está publicado |
| MCP `discord-mcp` | ❌ No funcionó | 401 Unauthorized, problema con paso de token |
| Scripts Node.js | ✅ Funcionan | Solución final implementada |

---

## 📚 Recursos Adicionales

- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord API Documentation](https://discord.com/developers/docs/reference)
- [Discord.js Guide](https://discordjs.guide/) (para referencia, aunque no usamos discord.js)

---

## ✅ Checklist de Instalación

- [ ] Node.js >= 16.x instalado
- [ ] Aplicación de Discord creada en Developer Portal
- [ ] Bot creado y token generado
- [ ] Privileged Intents activados (MESSAGE CONTENT INTENT)
- [ ] Variables de entorno configuradas
- [ ] Bot invitado al servidor con permisos
- [ ] Scripts probados y funcionando

---

**Fecha de creación:** 2026-06-26  
**Autor:** Claude Code  
**Última actualización:** 2026-06-26
