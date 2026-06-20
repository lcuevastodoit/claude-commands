# /web-snapshot

Captura y analiza cualquier página web usando Chrome DevTools MCP + Playwright. Ideal para obtener datos de sitios con Shadow DOM, JavaScript dinámico o protecciones anti-scraping.

## Cuándo usarlo

- Sitios con contenido cargado dinámicamente con JavaScript
- Páginas que usan Shadow DOM (como marca.com)
- Cuando las APIs tradicionales fallan o requieren autenticación
- Para obtener una "foto" completa del estado actual de una página
- **Cuando necesitas extraer datos específicos** (precios, resultados, noticias, etc.)

## ⚙️ Requerimientos Técnicos

### Dependencias necesarias

| Componente | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | ≥ 16.x | Ejecutar scripts de Playwright |
| **Playwright** | Última | Lanzar Chrome con `--remote-debugging-port=9222` |
| **Chrome DevTools MCP** | Configurado | Conectarse al Chrome remoto y ejecutar comandos |

### Instalación de dependencias

```bash
# Instalar Playwright globalmente
npm install -g playwright

# O en el proyecto
npm install playwright

# Instalar browsers de Playwright
npx playwright install chromium
```

### Configuración del entorno

**Paso 1:** Verificar que Chrome DevTools MCP esté disponible
- El MCP debe estar configurado en Claude Code
- Puerto por defecto: `9222`

**Paso 2:** Verificar conexión
```bash
# Chrome debe estar corriendo con remote debugging
lsof -i :9222  # Verificar que el puerto esté en uso
```

### Arquitectura del sistema

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Usuario       │────▶│  Claude Code     │────▶│  Chrome DevTools│
│   /web-snapshot │     │  Skill           │     │  MCP            │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                              │                          │
                              │  Lanza (si no existe)    │
                              ▼                          │
                        ┌──────────────────┐            │
                        │  Playwright      │────────────▶
                        │  Chromium        │   Conexión CDP
                        │  --remote-debug  │
                        └──────────────────┘
```

### Comando de lanzamiento automático

Si Chrome no está corriendo, el comando ejecuta:

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--remote-debugging-port=9222']
  });
  const page = await browser.newPage();
  await page.goto('about:blank');
  console.log('Chrome ready on port 9222');
  await new Promise(() => {});  // Mantiene vivo
})();
"
```

### Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `CHROME_DEBUG_PORT` | Puerto para remote debugging | 9222 |
| `PLAYWRIGHT_BROWSERS_PATH` | Ruta a browsers de Playwright | Auto-detect |

### Solución de problemas comunes

**Error: "Cannot connect to Chrome DevTools"**
- Verificar que Chrome esté corriendo: `lsof -i :9222`
- Si no está corriendo, se lanzará automáticamente
- Verificar que Playwright esté instalado: `npm list -g playwright`

**Error: "Playwright not found"**
```bash
npm install -g playwright
npx playwright install chromium
```

**Error: "Screenshot failed"**
- Verificar permisos de escritura en el directorio
- Cambiar ruta de salida si es necesario

**La página no carga completamente**
- Aumentar el parámetro `wait` (default: 5s)
- Ejemplo: `wait=10` para esperar 10 segundos

### Requisitos de sistema

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| RAM | 4 GB | 8 GB |
| Disco | 500 MB | 2 GB (para browsers) |
| Red | Conexión estable | Alta velocidad |

### Compatibilidad

| Sistema | Soporte | Notas |
|---------|---------|-------|
| macOS | ✅ | Nativo con Playwright |
| Linux | ✅ | Requiere dependencias del sistema |
| Windows | ✅ | WSL recomendado |

### Prueba de funcionamiento

Para verificar que todo está configurado correctamente:

```bash
/web-snapshot url="https://example.com" goal="título de la página"
```

Si obtienes el título sin errores, el sistema está funcionando correctamente.

## Parámetros

- `url` (requerido) - La URL a visitar
- `goal` (opcional pero recomendado) - **Descripción de QUÉ extraer**. Ejemplos:
  - `goal="resultados de partidos de fútbol con equipos y marcadores"`
  - `goal="precios de productos en la lista"`
  - `goal="titulares de noticias principales"`
  - `goal="tabla de clasificación con posiciones y puntos"`
- `wait` (opcional) - Segundos a esperar para carga dinámica (default: 5)
- `extract` (opcional) - Formato de salida: `text`, `structured`, `screenshot`, `all` (default: `all`)
- `cookies` (opcional) - Si es `true`, acepta automáticamente banners de cookies (default: `true`)

## Ejemplos de uso

```bash
# Extraer resultados deportivos
/web-snapshot url="https://www.marca.com/resultados/futbol/mundial.html" goal="resultados de partidos con equipos, marcadores y estado"

# Extraer precios de productos
/web-snapshot url="https://ejemplo.com/tienda" goal="precios y nombres de los productos listados"

# Obtener noticias principales
/web-snapshot url="https://news.ycombinator.com" goal="titulares de las noticias principales con sus puntajes"

# Datos estructurados específicos
/web-snapshot url="https://ejemplo.com/datos" goal="tabla de datos con columnas Nombre, Valor, Fecha" wait=3
```

## 🔄 Uso con `/loop` para monitoreo continuo

Para ejecutar el comando periódicamente (ej: cada 2 minutos), usar `/loop`:

### Ejemplo 1: Monitoreo de resultados deportivos cada 2 minutos

```bash
/loop 2m /web-snapshot url="https://www.marca.com/resultados/futbol/mundial.html" goal="resultados de partidos con equipos, marcadores y estado"
```

**Qué hace:**
- Ejecuta `/web-snapshot` cada 2 minutos
- Extrae resultados actualizados automáticamente
- El loop se autoregenera hasta que canceles

### Ejemplo 2: Monitoreo de precios con autoregeneración

```bash
/loop 5m /web-snapshot url="https://ejemplo.com/producto" goal="precio actual del producto"
```

### Ejemplo 3: Modo dinámico (sin intervalo fijo)

```bash
/loop /web-snapshot url="https://www.marca.com/futbol/mundial/calendario/dieciseisavos.html" goal="equipos clasificados"
```

**Nota:** En modo dinámico, elige el delay más apropiado (recomendado: 120s para monitoreo).

### Cómo funciona la autoregeneración

Cuando usas `/loop`:
1. Ejecuta el comando inmediatamente
2. Programa la siguiente ejecución según el intervalo
3. Se autoregenera automáticamente
4. Para detener: omite el `ScheduleWakeup` en la siguiente iteración o cierra la sesión

### Recomendaciones para loops

| Caso de uso | Intervalo recomendado | Ejemplo |
|-------------|----------------------|---------|
| Resultados deportivos en vivo | 2m | `/loop 2m /web-snapshot ...` |
| Precios de productos | 5-10m | `/loop 5m /web-snapshot ...` |
| Noticias | 10-15m | `/loop 10m /web-snapshot ...` |
| Monitorización general | 30m-1h | `/loop 30m /web-snapshot ...` |

**⚠️ Importante:** Los loops en sesión local se detienen al cerrar Claude Code. Para loops persistentes en la nube, usar `/schedule` en lugar de `/loop`.

## Qué hace internamente

1. **Verifica requerimientos** - Comprueba que Playwright y Chrome DevTools MCP están disponibles
2. **Lanza Chrome si es necesario** - Usa Playwright para iniciar Chrome con remote debugging
3. **Navega** a la URL usando Chrome DevTools MCP
4. **Acepta cookies** si aparece un banner (configurable)
5. **Espera** el tiempo especificado para carga dinámica
6. **Toma screenshot** para análisis visual
7. **Extrae el accessibility tree** completo de la página
8. **Analiza según el GOAL** - Busca específicamente los datos descritos en el parámetro `goal`
9. **Presenta resultados** enfocados en lo solicitado
10. **Limpia** archivos temporales

## Ventajas del parámetro GOAL

- 🎯 **Extracción enfocada** - No devuelve todo, solo lo que necesitas
- 🧠 **Análisis inteligente** - Claude interpreta el goal y busca patrones relevantes
- 📊 **Formato adecuado** - Presenta los datos de forma útil (tablas, listas, etc.)
- ⏱️ **Eficiente** - Evita procesar información irrelevante

## Ejemplos de GOAL efectivos

| Tipo de página | GOAL sugerido |
|---------------|----------------|
| Resultados deportivos | `"partidos del día: equipos locales, visitantes, marcadores y estado (finalizado/en curso)"` |
| Tienda online | `"productos en oferta: nombre, precio actual, precio anterior, descuento"` |
| Noticias | `"titulares principales, resumen breve y hora de publicación"` |
| Redes sociales | `"posts recientes: autor, contenido, likes, comentarios"` |
| Dashboard | `"métricas principales: nombre del indicador y valor numérico"` |
| Clasificación | `"tabla de posiciones: posición, equipo, puntos, partidos jugados"` |

## Ventajas sobre scraping tradicional

- ✅ Sin problemas de CORS
- ✅ Renderiza JavaScript completo (React, Angular, Vue, etc.)
- ✅ Accede a Shadow DOM y Web Components
- ✅ Maneja banners de cookies automáticamente
- ✅ Obtiene el estado "visual" real de la página
- ✅ No requiere APIs ni tokens de autenticación
- ✅ Funciona con protecciones Cloudflare y similares
- ✅ **Extracción semántica** - entiende el contexto, no solo el HTML

## Limitaciones

- Requiere Chrome DevTools MCP configurado
- Necesita Chrome corriendo con `--remote-debugging-port=9222` (se maneja automáticamente)
- Más lento que una petición HTTP simple (pero más completo)
- Depende de la claridad del `goal` para resultados óptimos
- Consumo de recursos más alto (requiere Chrome completo)

## Flujo técnico

```
Usuario → /web-snapshot url=... goal="..." 
  → Verifica requerimientos → Lanza Chrome si es necesario
    → MCP se conecta → Navega → Espera 
      → Screenshot + Accessibility Tree → Análisis con GOAL 
        → Extracción enfocada → Resultados estructurados
```

## Casos de uso reales

- **Resultados deportivos** en tiempo real de cualquier sitio
- **Precios de productos** que cargan dinámicamente
- **Noticias** de sitios con paywalls suaves
- **Datos de dashboards** que requieren login previo (si hay sesión activa)
- **Monitorización** de cambios en páginas web
- **Competencia** - seguimiento de precios de competidores
- **Research** - extracción de datos para análisis

## Tip: Cómo escribir un buen GOAL

1. **Sé específico**: `"precios de productos"` vs `"información"`
2. **Menciona el formato**: `"tabla con..."`, `"lista de..."`, `"tarjetas con..."`
3. **Incluye campos clave**: `"nombre, precio, disponibilidad"`
4. **Contexto ayuda**: `"partidos de fútbol del Mundial 2026"` vs `"partidos"`

## Si no se proporciona GOAL

El comando funcionará en modo genérico, extrayendo:
- Título de la página
- Descripción meta
- Imágenes principales
- Texto visible general
- Estructura básica

Pero **se recomienda siempre usar `goal`** para resultados óptimos.

## Diagnóstico de errores

### Error Code: CONN_REFUSED
**Causa:** Chrome no está corriendo en el puerto 9222  
**Solución:** El comando intentará lanzar Chrome automáticamente. Si falla, ejecutar manualmente:
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

### Error Code: TIMEOUT
**Causa:** La página tarda demasiado en cargar  
**Solución:** Aumentar `wait` o verificar conectividad a internet

### Error Code: PLAYWRIGHT_NOT_FOUND
**Causa:** Playwright no está instalado  
**Solución:** Verificar sección de instalación de dependencias

### Error Code: SCREENSHOT_FAILED
**Causa:** No hay permisos de escritura o ruta inválida  
**Solución:** Verificar que la ruta de salida exista y tenga permisos

## Recursos adicionales

- [Documentación de Playwright](https://playwright.dev/)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Claude Code MCP Docs](https://docs.anthropic.com/)

## Mantenimiento

Para mantener el comando funcionando correctamente:

1. **Actualizar Playwright** periódicamente: `npm update -g playwright`
2. **Actualizar browsers**: `npx playwright install chromium`
3. **Verificar logs** en `~/.claude/commands/web-snapshot-log.json`
4. **Limpiar archivos temporales** si el disco se llena
