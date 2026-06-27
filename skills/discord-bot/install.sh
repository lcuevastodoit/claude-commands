#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# DISCORD BOT PLUGIN - Instalador Automático
# ═══════════════════════════════════════════════════════════════════════════

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directorios
PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$PLUGIN_DIR/data"
BIN_DIR="$PLUGIN_DIR/bin"

# Funciones de utilidad
print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Verificar dependencias
check_dependencies() {
    print_header "VERIFICANDO DEPENDENCIAS"

    local missing_deps=()

    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("Node.js")
    else
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ "$NODE_VERSION" -lt 16 ]]; then
            print_error "Node.js versión 16+ requerida (actual: $(node --version))"
            exit 1
        fi
        print_success "Node.js $(node --version)"
    fi

    # Verificar jq
    if ! command -v jq &> /dev/null; then
        missing_deps+=("jq")
        print_warning "jq no instalado (necesario para el monitor de mensajes)"
    else
        print_success "jq $(jq --version | cut -d'-' -f2)"
    fi

    # Verificar npm
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    else
        print_success "npm $(npm --version)"
    fi

    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        print_error "Dependencias faltantes: ${missing_deps[*]}"
        echo ""
        echo "Instalación:"
        echo "  macOS:    brew install node jq"
        echo "  Ubuntu:   sudo apt-get install nodejs npm jq"
        echo "  Fedora:   sudo dnf install nodejs npm jq"
        exit 1
    fi
}

# Instalar dependencias npm
install_npm_deps() {
    print_header "INSTALANDO DEPENDENCIAS NPM"

    cd "$PLUGIN_DIR"

    if [[ -f "package.json" ]]; then
        if [[ -d "node_modules" ]]; then
            print_info "node_modules ya existe, verificando..."
        else
            print_info "Instalando dependencias..."
            npm install
        fi
        print_success "Dependencias npm listas"
    else
        print_warning "No se encontró package.json"
    fi
}

# Crear estructura de directorios
setup_directories() {
    print_header "CONFIGURANDO DIRECTORIOS"

    mkdir -p "$DATA_DIR"
    touch "$DATA_DIR/messages.json"
    touch "$DATA_DIR/messages-stream.log"
    touch "$DATA_DIR/.discord-notification"

    # Inicializar messages.json si está vacío
    if [[ ! -s "$DATA_DIR/messages.json" ]]; then
        echo '{"messages":[]}' > "$DATA_DIR/messages.json"
    fi

    print_success "Directorios creados en $DATA_DIR"
}

# Configurar permisos de scripts
setup_permissions() {
    print_header "CONFIGURANDO PERMISOS"

    chmod +x "$PLUGIN_DIR"/*.sh 2>/dev/null || true
    chmod +x "$BIN_DIR"/*.sh 2>/dev/null || true
    chmod +x "$PLUGIN_DIR"/*.js 2>/dev/null || true

    print_success "Permisos configurados"
}

# Configurar archivo de configuración
setup_config() {
    print_header "CONFIGURACIÓN DEL BOT"

    CONFIG_FILE="$HOME/.discord-config.json"

    if [[ -f "$CONFIG_FILE" ]]; then
        print_success "Configuración encontrada en $CONFIG_FILE"

        # Verificar que tiene los campos necesarios
        if jq -e '.token and .channelId and .userId' "$CONFIG_FILE" > /dev/null 2>&1; then
            print_success "Configuración válida"
        else
            print_warning "Configuración incompleta"
            echo ""
            echo "El archivo debe contener:"
            echo '  { "token": "TU_BOT_TOKEN", "channelId": "ID_CANAL", "userId": "TU_USER_ID" }'
        fi
    else
        print_warning "No se encontró configuración"
        echo ""
        echo "Para configurar el bot:"
        echo "1. Ve a https://discord.com/developers/applications"
        echo "2. Crea una nueva aplicación o usa una existente"
        echo "3. Ve a 'Bot' → 'Reset Token' y copia el token"
        echo "4. Activa 'Message Content Intent' en Privileged Gateway Intents"
        echo "5. Obtén tu User ID (click derecho en tu nombre con modo desarrollador)"
        echo ""
        echo "Crea el archivo:"
        echo "  $CONFIG_FILE"
        echo ""
        echo "Contenido:"
        cat << 'EOF'
{
  "token": "TU_BOT_TOKEN_AQUI",
  "channelId": "ID_CANAL_POR_DEFECTO",
  "userId": "TU_USER_ID"
}
EOF
        echo ""
        print_warning "El bot no funcionará sin configuración válida"
    fi
}

# Verificar instalación del plugin
verify_plugin_installation() {
    print_header "VERIFICANDO INSTALACIÓN DEL PLUGIN"

    # Verificar estructura
    local required_files=(
        "bot.js"
        "send.js"
        "read.js"
        "discord-notifier.sh"
        "bin/start-bot.sh"
        "bin/discord-message-monitor.sh"
        "monitors/monitors.json"
        "hooks/hooks.json"
    )

    local missing_files=()
    for file in "${required_files[@]}"; do
        if [[ ! -f "$PLUGIN_DIR/$file" ]]; then
            missing_files+=("$file")
        fi
    done

    if [[ ${#missing_files[@]} -eq 0 ]]; then
        print_success "Todos los archivos requeridos presentes"
    else
        print_error "Archivos faltantes: ${missing_files[*]}"
        exit 1
    fi
}

# Instrucciones de uso
show_instructions() {
    print_header "INSTALACIÓN COMPLETADA"

    echo "El plugin está configurado. Para usarlo:"
    echo ""
    echo -e "${GREEN}1. Iniciar el bot manualmente:${NC}"
    echo "   cd $PLUGIN_DIR"
    echo "   ./bin/start-bot.sh"
    echo ""
    echo -e "${GREEN}2. O usar los comandos:${NC}"
    echo "   node bot.js start        # Iniciar bot"
    echo "   node bot.js status       # Ver estado"
    echo "   node bot.js stop         # Detener bot"
    echo ""
    echo -e "${GREEN}3. Enviar mensajes:${NC}"
    echo "   node send.js 'Hola' --user=ID_USUARIO"
    echo "   node send.js 'Mensaje' --channel=ID_CANAL"
    echo ""
    echo -e "${GREEN}4. Ver mensajes:${NC}"
    echo "   node read.js --limit=10"
    echo "   node read.js --dm"
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Menú principal
main() {
    clear
    print_header "DISCORD BOT PLUGIN - INSTALADOR"

    check_dependencies
    install_npm_deps
    setup_directories
    setup_permissions
    verify_plugin_installation
    setup_config
    show_instructions
}

# Ejecutar
main "$@"
