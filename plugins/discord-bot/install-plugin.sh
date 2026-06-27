#!/bin/bash
# Install Discord Bot Gateway Plugin for Claude Code

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_NAME="discord-bot-gateway"
TARGET_DIR="$HOME/.claude/skills/$PLUGIN_NAME"

echo "🔧 Instalando plugin Discord Bot Gateway..."
echo ""

# Check if already installed
if [ -d "$TARGET_DIR" ]; then
    echo "⚠️  El plugin ya está instalado en $TARGET_DIR"
    read -p "¿Reinstalar? (s/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Instalación cancelada."
        exit 0
    fi
    rm -rf "$TARGET_DIR"
fi

# Create directory
echo "📁 Creando directorio..."
mkdir -p "$TARGET_DIR"

# Copy plugin files
echo "📦 Copiando archivos..."
cp -r "$SCRIPT_DIR/." "$TARGET_DIR/"

# Make scripts executable
echo "🔑 Configurando permisos..."
chmod +x "$TARGET_DIR/bin/"*.sh 2>/dev/null || true

# Install dependencies
echo "⬇️  Instalando dependencias..."
cd "$TARGET_DIR" && npm install

# Check Discord config
echo ""
echo "🔍 Verificando configuración..."
if [ -f "$HOME/.discord-config.json" ]; then
    echo "✅ Configuración de Discord encontrada"
    node "$TARGET_DIR/test.js" 2>/dev/null || echo "⚠️  Verifica tu configuración"
else
    echo "⚠️  No se encontró ~/.discord-config.json"
    echo ""
    echo "Crea el archivo con:"
    echo "cat > ~/.discord-config.json << 'EOF'"
    echo '{'
    echo '  "token": "TU_BOT_TOKEN",'
    echo '  "channelId": "ID_CANAL",'
    echo '  "userId": "TU_USER_ID"'
    echo '}'
    echo 'EOF'
    echo ""
    echo "Obtén tu token en: https://discord.com/developers/applications"
fi

echo ""
echo "✅ Instalación completada!"
echo ""
echo "📋 Resumen:"
echo "  - Plugin instalado en: $TARGET_DIR"
echo "  - Comando: /discord-bot-gateway:discord-bot"
echo "  - Auto-inicio: Configurado ✅"
echo ""
echo "🚀 Próximos pasos:"
echo "  1. Configura ~/.discord-config.json si aún no lo has hecho"
echo "  2. Reinicia Claude Code"
echo "  3. El bot se iniciará automáticamente"
echo "  4. Verifica el estado con: /discord-bot-gateway:discord-bot"
echo ""
echo "📖 Para más información:"
echo "  cat $TARGET_DIR/PLUGIN_README.md"
