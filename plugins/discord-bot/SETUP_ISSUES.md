# Discord Bot Plugin - Problemas Encontrados y Soluciones

## Resumen de Issues

Durante la configuración del bot de Discord para Claude Code, se encontraron múltiples problemas que impidieron el funcionamiento correcto desde el inicio.

## Problemas Críticos

### 1. Rutas Hardcodeadas Incorrectas

**Archivos afectados:**
- `discord-notifier.sh` (líneas 4-5)
- `bin/start-message-monitor.sh` (líneas 11-14)

**Problema:**
Las rutas estaban hardcodeadas a:
```bash
/Users/lcuevas/.claude/skills/discord-bot-gateway/data/
```

**Ubicación real:**
```bash
/Users/lcuevas/Codigo/tirant1/commands/plugins/discord-bot/data/
```

**Solución aplicada:**
Usar `PLUGIN_DIR` dinámico:
```bash
PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
```

### 2. Notificaciones No Llegaban a Claude Code

**Problema:**
El `start-message-monitor.sh` redirigía la salida a `/dev/null`:
```bash
nohup "$MONITOR_SCRIPT" > /dev/null 2>&1 &
```

Esto hacía que las notificaciones solo fueran visibles en logs, no en la interfaz de Claude.

**Solución aplicada:**
1. Crear `check-discord-messages.sh` - script que verifica mensajes nuevos
2. Crear `bin/discord-message-monitor.sh` - script de notificación
3. Usar `monitors/monitors.json` para que Claude Code ejecute el monitor automáticamente

### 3. Monitor de Claude Code No Configurado

**Problema:**
El `monitors/monitors.json` solo tenía el monitor de estado del bot, no el de mensajes:
```json
[
  {
    "name": "discord-bot-status",
    "command": "${CLAUDE_PLUGIN_ROOT}/bin/monitor-bot.sh",
    "description": "Monitor Discord bot status and restart if needed",
    "when": "always"
  }
]
```

**Solución aplicada:**
Agregar monitor de mensajes:
```json
{
  "name": "discord-message-check",
  "command": "${CLAUDE_PLUGIN_ROOT}/bin/discord-message-monitor.sh",
  "description": "Check for new Discord messages and notify Claude",
  "when": "always"
}
```

### 4. Falta Notificador de Escritorio

**Problema:**
No existía un sistema de notificaciones nativas de macOS para el usuario.

**Solución aplicada:**
Crear `discord-desktop-notifier.sh` que usa `osascript`:
```bash
osascript -e "display notification \"$CONTENT\" with title \"Discord: $AUTHOR\" sound name \"Glass\""
```

### 5. Scripts Nuevos Requeridos

Se crearon los siguientes scripts nuevos:

| Script | Propósito |
|--------|-----------|
| `check-discord-messages.sh` | Verifica mensajes nuevos para el monitor de Claude |
| `bin/discord-message-monitor.sh` | Script llamado por monitors.json |
| `discord-desktop-notifier.sh` | Notificaciones de escritorio macOS |
| `discord-claude-monitor.sh` | Monitor de respaldo para mensajes |

### 6. Configuración del Bot

**Problema:**
El archivo `.discord-config.json` debía estar en:
- Esperado: `~/Codigo/.discord-config.json`
- Real: `~/.discord-config.json`

**Solución:**
Copiar el archivo a la ubicación esperada.

## Cambios Necesarios para Instalación Limpia

### Paso 1: Corregir Rutas en Archivos Existentes

**discord-notifier.sh:**
```bash
# ANTES (INCORRECTO):
LOG_FILE="/Users/lcuevas/.claude/skills/discord-bot-gateway/data/messages-stream.log"

# DESPUÉS (CORRECTO):
PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$PLUGIN_DIR/data/messages-stream.log"
```

**bin/start-message-monitor.sh:**
```bash
# ANTES (INCORRECTO):
nohup "$MONITOR_SCRIPT" > /dev/null 2>&1 &

# DESPUÉS (CORRECTO):
nohup "$MONITOR_SCRIPT" >> "$PLUGIN_DIR/bot.log" 2>&1 &
```

### Paso 2: Agregar Monitor de Mensajes

**monitors/monitors.json:**
```json
[
  {
    "name": "discord-bot-status",
    "command": "${CLAUDE_PLUGIN_ROOT}/bin/monitor-bot.sh",
    "description": "Monitor Discord bot status and restart if needed",
    "when": "always"
  },
  {
    "name": "discord-message-check",
    "command": "${CLAUDE_PLUGIN_ROOT}/bin/discord-message-monitor.sh",
    "description": "Check for new Discord messages and notify Claude",
    "when": "always"
  }
]
```

### Paso 3: Crear Scripts Necesarios

**bin/discord-message-monitor.sh:**
```bash
#!/bin/bash
PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NOTIFY_FILE="$PLUGIN_DIR/data/.discord-notification"
LOG_FILE="$PLUGIN_DIR/data/messages-stream.log"
LAST_POS_FILE="$PLUGIN_DIR/data/.last_pos_check"

if [[ ! -f "$LAST_POS_FILE" ]]; then
    wc -c < "$LOG_FILE" > "$LAST_POS_FILE" 2>/dev/null || echo "0" > "$LAST_POS_FILE"
fi

LAST_POS=$(cat "$LAST_POS_FILE" 2>/dev/null || echo "0")
CURRENT_SIZE=$(wc -c < "$LOG_FILE" 2>/dev/null || echo "0")

if [[ $CURRENT_SIZE -gt $LAST_POS ]]; then
    tail -c +$((LAST_POS + 1)) "$LOG_FILE" 2>/dev/null | while IFS= read -r line; do
        [[ -z "$line" ]] && continue
        AUTHOR=$(echo "$line" | jq -r '.author // empty' 2>/dev/null)
        CONTENT=$(echo "$line" | jq -r '.content // empty' 2>/dev/null)
        if [[ -n "$AUTHOR" && -n "$CONTENT" ]]; then
            echo "📩 NUEVO MENSAJE DE DISCORD"
            echo "👤 De: $AUTHOR"
            echo "💬 $CONTENT"
            echo ""
        fi
    done
    echo "$CURRENT_SIZE" > "$LAST_POS_FILE"
fi
```

### Paso 4: Crear Notificador de Escritorio (Opcional)

**discord-desktop-notifier.sh:**
```bash
#!/bin/bash
# Notificador de escritorio para macOS

PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$PLUGIN_DIR/data/messages-stream.log"
LAST_POS_FILE="$PLUGIN_DIR/data/.last_log_pos_desktop"

if [[ ! -f "$LAST_POS_FILE" ]]; then
    wc -c < "$LOG_FILE" > "$LAST_POS_FILE" 2>/dev/null || echo "0" > "$LAST_POS_FILE"
fi

while true; do
    LAST_POS=$(cat "$LAST_POS_FILE" 2>/dev/null || echo "0")
    CURRENT_SIZE=$(wc -c < "$LOG_FILE" 2>/dev/null || echo "0")

    if [[ $CURRENT_SIZE -gt $LAST_POS ]]; then
        tail -c +$((LAST_POS + 1)) "$LOG_FILE" 2>/dev/null | while IFS= read -r line; do
            AUTHOR=$(echo "$line" | jq -r '.author // empty' 2>/dev/null)
            CONTENT=$(echo "$line" | jq -r '.content // empty' 2>/dev/null)
            if [[ -n "$AUTHOR" && -n "$CONTENT" ]]; then
                osascript -e "display notification \"$CONTENT\" with title \"Discord: $AUTHOR\" sound name \"Glass\"" 2>/dev/null || true
            fi
        done
        echo "$CURRENT_SIZE" > "$LAST_POS_FILE"
    fi
    sleep 0.5
done
```

## Estado Final del Sistema

### Componentes Activos:
1. **Bot Discord** (`bot.js start`) - Recibe mensajes vía WebSocket
2. **Monitor Claude Code** (vía `monitors.json`) - Notifica a Claude
3. **Notifier Escritorio** (`discord-desktop-notifier.sh`) - Alertas de macOS

### Archivos de Datos:
- `data/messages-stream.log` - Log de mensajes (JSON Lines)
- `data/.discord-notification` - Buffer de notificaciones
- `data/.last_pos_check` - Posición última verificación
- `data/status.json` - Estado del bot

## Lecciones Aprendidas

1. **Nunca usar rutas absolutas hardcodeadas** - Usar paths relativos o variables de entorno
2. **Siempre probar el flujo completo** - Desde Discord hasta la notificación final
3. **Usar el sistema de monitores de Claude Code** - Es la forma nativa de notificar al agente
4. **Separar responsabilidades** - Bot recibe, notifier notifica, monitor verifica
5. **Documentar dependencias** - Requiere `jq` instalado

## Comandos para Verificar Estado

```bash
# Ver procesos activos
ps aux | grep -E "discord|bot\.js"

# Ver últimos mensajes
tail -5 data/messages-stream.log | jq -r '"\(.author): \(.content)"'

# Ver notificaciones pendientes
cat data/.discord-notification

# Ver estado del bot
cat data/status.json | jq .
```
