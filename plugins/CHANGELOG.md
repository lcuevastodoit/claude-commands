# Changelog

Todos los cambios notables de este proyecto serán documentados aquí.

## [2.0.0] - 2026-06-27

### ✨ Nuevo - Monitoreo de Mensajes en Tiempo Real

#### Agregado
- **Sistema de monitoreo en tiempo real** para mensajes de Discord
- **Nuevo archivo** `messages-stream.log` (formato JSON Lines, append-only)
- **Nuevo script** `discord-notifier.sh` - Detecta nuevos mensajes y notifica a Claude
- **Nuevo script** `bin/start-message-monitor.sh` - Inicia el monitor automáticamente
- **Hook SessionStart actualizado** - Inicia bot + monitor al abrir Claude Code
- **Función `appendMessageLog()`** en `bot.js` - Escribe mensajes al log en tiempo real

#### Documentación
- **SKILL.md actualizado** - Incluye flujo de monitoreo en tiempo real
- **PLUGIN_README.md actualizado** - Documentación completa del sistema
- **README.md actualizado** - Guía rápida con monitoreo
- **install.js actualizado** - Verifica jq y configura archivos de log
- **setup-hooks.js actualizado** - Configura hooks para bot + monitor

#### Cambios en Arquitectura
```
Antes:
[Discord] → [bot.js] → [data/messages.json] (sobrescrito)

Ahora:
[Discord] → [bot.js] → [data/messages.json] (cache)
                   ↓
              [data/messages-stream.log] (append)
                   ↓
              [discord-notifier.sh] → [Claude Code]
```

#### Dependencias nuevas
- **jq** - Requerido para parsear JSON en el monitor de mensajes

#### Uso
El monitoreo funciona automáticamente:
1. Al iniciar Claude Code, el bot se conecta a Discord
2. 3 segundos después, el monitor de mensajes se inicia
3. Cuando llega un mensaje, Claude recibe notificación instantánea
4. Claude puede responder usando `node send.js "respuesta" --user=ID`

---

## [1.0.0] - 2026-06-26

### ✨ Lanzamiento Inicial

#### Agregado
- **Bot de Discord** con WebSocket Gateway persistente
- **Auto-inicio** con SessionStart hooks
- **Comandos CLI**: `send.js`, `read.js`, `bot.js`
- **Persistencia** de mensajes en `data/messages.json`
- **Estado "online"** visible en Discord
- **Auto-respuestas** a comandos básicos (hola, ping, ayuda, etc.)
- **Hooks** para auto-inicio con Claude Code
- **Monitor** de estado del bot (reinicio automático si falla)

#### Archivos
- `bot.js` - Bot principal con WebSocket
- `send.js` - CLI para enviar mensajes
- `read.js` - CLI para leer mensajes
- `test.js` - Verificar configuración
- `setup-hooks.js` - Configurar auto-inicio
- `bin/start-bot.sh` - Script de inicio
- `bin/check-status.sh` - Verificar estado
- `bin/monitor-bot.sh` - Monitor de background
- `hooks/hooks.json` - Hooks para plugin
- `claude-hooks.json` - Ejemplo de hooks
- `SKILL.md` - Documentación del skill
- `PLUGIN_README.md` - Documentación del plugin
- `README.md` - Guía rápida

#### Dependencias
- discord.js ^14.26.4
- Node.js >= 16.0.0

---

## Notas de Versión

### Formatos de Versión

- **2.0.0** - Monitoreo en tiempo real (actual)
- **1.0.0** - Bot WebSocket básico (inicial)

### Compatibilidad

- **2.0.0** requiere `jq` instalado para el monitoreo
- **2.0.0** es compatible con configuración de 1.0.0
- Hooks de 1.0.0 deben actualizarse para incluir el monitor