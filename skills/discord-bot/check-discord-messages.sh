#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# CHECK DISCORD MESSAGES - Para Claude Code (Versión Corregida)
# Verifica mensajes nuevos sin bucles infinitos ni duplicados
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$PLUGIN_DIR/data"
LOG_FILE="$DATA_DIR/messages-stream.log"
LAST_POS_FILE="$DATA_DIR/.claude_last_pos"
PROCESSED_IDS_FILE="$DATA_DIR/.claude_processed_ids"
PROCESSED_CONTENT_FILE="$DATA_DIR/.claude_processed_content"
DEDUP_WINDOW_SECONDS=30

# Crear archivos si no existen
mkdir -p "$DATA_DIR"
touch "$LOG_FILE"
touch "$PROCESSED_IDS_FILE"
touch "$PROCESSED_CONTENT_FILE"

# Función para generar hash del contenido
hash_content() {
    local author="$1"
    local content="$2"
    echo "${author}:${content}" | md5 | cut -d' ' -f1
}

# Verificar si contenido fue procesado recientemente
is_content_duplicate() {
    local author="$1"
    local content="$2"
    local hash=$(hash_content "$author" "$content")
    local now=$(date +%s)

    if [[ -f "$PROCESSED_CONTENT_FILE" ]]; then
        while IFS=: read -r h ts || [[ -n "$h" ]]; do
            [[ -z "$h" ]] && continue
            if [[ "$h" == "$hash" ]]; then
                local diff=$((now - ts))
                if [[ $diff -lt $DEDUP_WINDOW_SECONDS ]]; then
                    return 0
                fi
            fi
        done < "$PROCESSED_CONTENT_FILE"
    fi
    return 1
}

# Marcar contenido como procesado
mark_content_processed() {
    local author="$1"
    local content="$2"
    local hash=$(hash_content "$author" "$content")
    local now=$(date +%s)
    echo "${hash}:${now}" >> "$PROCESSED_CONTENT_FILE"
}

# Inicializar posición si no existe
if [[ ! -f "$LAST_POS_FILE" ]]; then
    wc -c < "$LOG_FILE" > "$LAST_POS_FILE" 2>/dev/null || echo "0" > "$LAST_POS_FILE"
fi

LAST_POS=$(cat "$LAST_POS_FILE" 2>/dev/null || echo "0")
CURRENT_SIZE=$(wc -c < "$LOG_FILE" 2>/dev/null || echo "0")

# Verificar si hay mensajes nuevos
if [[ $CURRENT_SIZE -gt $LAST_POS ]]; then
    # Procesar mensajes nuevos
    while IFS= read -r line; do
        [[ -z "$line" ]] && continue

        # Verificar JSON válido
        if ! echo "$line" | jq empty 2>/dev/null; then
            continue
        fi

        AUTHOR=$(echo "$line" | jq -r '.author // empty' 2>/dev/null)
        CONTENT=$(echo "$line" | jq -r '.content // empty' 2>/dev/null)
        AUTHOR_ID=$(echo "$line" | jq -r '.authorId // empty' 2>/dev/null)
        IS_DM=$(echo "$line" | jq -r '.isDM // false' 2>/dev/null)
        MSG_ID=$(echo "$line" | jq -r '.id // empty' 2>/dev/null)

        if [[ -n "$AUTHOR" && -n "$CONTENT" && -n "$MSG_ID" ]]; then
            # Verificar duplicado por ID o por contenido
            if ! grep -q "^${MSG_ID}$" "$PROCESSED_IDS_FILE" 2>/dev/null && ! is_content_duplicate "$AUTHOR" "$CONTENT"; then
                echo "📩 NUEVO MENSAJE DE DISCORD"
                echo "👤 De: $AUTHOR (ID: $AUTHOR_ID)"
                echo "💬 $CONTENT"
                if [[ "$IS_DM" == "true" ]]; then
                    echo "📍 Tipo: DM"
                else
                    echo "📍 Tipo: Canal"
                fi
                echo ""

                # Marcar como procesado (ambos métodos)
                echo "$MSG_ID" >> "$PROCESSED_IDS_FILE"
                mark_content_processed "$AUTHOR" "$CONTENT"

                # Limpiar si crece mucho
                if [[ $(wc -l < "$PROCESSED_IDS_FILE") -gt 500 ]]; then
                    tail -n 250 "$PROCESSED_IDS_FILE" > "$PROCESSED_IDS_FILE.tmp"
                    mv "$PROCESSED_IDS_FILE.tmp" "$PROCESSED_IDS_FILE"
                fi
            fi
        fi
    done < <(tail -c +$((LAST_POS + 1)) "$LOG_FILE" 2>/dev/null)

    # Actualizar posición
    echo "$CURRENT_SIZE" > "$LAST_POS_FILE"
fi
