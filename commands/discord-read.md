---
description: Lee mensajes de Discord usando Node.js
---

# Comando: discord-read

## Uso Rápido

```bash
node /Users/<user>/root-project-path/scripts/discord.js read --limit=10
```

## Ejemplos

```bash
# Leer últimos 10 mensajes (default)
node /Users/<user>/root-project-path/scripts/discord.js read

# Leer más mensajes
node /Users/<user>/root-project-path/scripts/discord.js read --limit=20

# Canal específico
node /Users/<user>/root-project-path/scripts/discord.js read --channel=1019945518501204002 --limit=5
```

## Configuración

El script lee automáticamente desde `~/.discord-config.json`:
- Token del bot
- Canal por defecto

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
