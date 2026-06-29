---
description: Envía mensajes a Discord usando Node.js
---

# Comando: discord-send

## Uso Rápido

```bash
node /Users/<user>/root-project-path/scripts/discord.js send "Tu mensaje aquí"
```

## Ejemplos

```bash
# Canal por defecto (configurado en ~/.discord-config.json)
node /Users/<user>/root-project-path/scripts/discord.js send "Hola equipo"

# Canal específico
node /Users/<user>/root-project-path/scripts/discord.js send "Alerta" --channel=1019945518501204002

# DM a usuario
node /Users/<user>/root-project-path/scripts/discord.js send "Hola Luis" --user=970114927488557146
```

## Configuración

El script lee automáticamente desde `~/.discord-config.json`:
- Token del bot
- Canal por defecto
- IDs configurados

## Solución de problemas

| Error | Solución |
|-------|----------|
| 401 Unauthorized | Verificar token en `~/.discord-config.json` |
| 403 Forbidden | Verificar permisos del bot en el canal |
| 404 Not Found | Verificar ID del canal |

## Archivos

- Script: `/Users/<user>/root-project-path/scripts/discord.js`
- Config: `~/.discord-config.json`
- Guía: `/Users/<user>/root-project-path/claude-commands/commands/discord-setup-guide.md`
