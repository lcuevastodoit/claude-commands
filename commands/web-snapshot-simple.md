---
name: web-snapshot-simple
description: >
  Captures and analyzes any web page using Chrome DevTools MCP + Playwright.
  Use this skill whenever the user wants to scrape, extract, or monitor data
  from websites — especially those with dynamic JavaScript, Shadow DOM, React/Angular/Vue,
  Cloudflare protection, or cookie banners. Trigger this skill for requests like
  "extrae los resultados de...", "dame los precios de...", "monitorea esta página",
  "captura esta URL", "/web-snapshot-simple", or any task involving scraping a specific URL.
  Also use when traditional HTTP requests or APIs fail or require authentication.
---

# Web Snapshot Skill

Captura y analiza páginas web con JavaScript dinámico, Shadow DOM y protecciones anti-scraping usando Chrome DevTools MCP + Playwright.

## Parámetros

| Parámetro | Requerido | Descripción | Default |
|-----------|-----------|-------------|---------|
| `url` | ✅ | URL a visitar | — |
| `goal` | Recomendado | Qué extraer exactamente (ej: `"resultados con equipos y marcadores"`) | Extracción genérica |
| `wait` | No | Segundos de espera para carga dinámica | `5` |
| `extract` | No | Formato de salida: `text`, `structured`, `screenshot`, `all` | `all` |
| `cookies` | No | Aceptar banners de cookies automáticamente | `true` |

## Flujo de Ejecución

```
Verificar requisitos → Lanzar Chrome si no está activo
  → Navegar a URL → Aceptar cookies si aplica → Esperar `wait` segundos
    → Screenshot + Árbol de accesibilidad → Analizar según GOAL
      → Presentar resultados enfocados
```

### Paso 1 — Verificar requisitos

```bash
# Verificar Playwright
npm list -g playwright 2>/dev/null || echo "NOT_FOUND"

# Verificar Chrome en puerto 9222
lsof -i :9222 2>/dev/null | grep LISTEN || echo "CHROME_NOT_RUNNING"
```

Si Playwright no está instalado:
```bash
npm install -g playwright
npx playwright install chromium
```

### Paso 2 — Lanzar Chrome si es necesario

Si Chrome no está activo en puerto 9222:
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
  console.log('Chrome listo en puerto 9222');
  await new Promise(() => {});
})();
" &
sleep 3
```

### Paso 3 — Navegar y extraer

Usar **Chrome DevTools MCP** para:
1. Conectar al puerto `9222`
2. Navegar a `url`
3. Si `cookies=true`: buscar y hacer clic en botones de aceptar cookies
4. Esperar `wait` segundos
5. Tomar screenshot
6. Extraer árbol de accesibilidad completo

### Paso 4 — Analizar con GOAL

Con el árbol de accesibilidad y el screenshot:
- Si `goal` está definido: buscar específicamente los datos descritos y presentarlos en formato útil (tabla, lista, etc.)
- Si no hay `goal`: extraer título, meta descripción, imágenes principales, texto visible y estructura básica

## Ejemplos de Uso

```bash
# Resultados deportivos
/web-snapshot-simple url="https://www.marca.com/resultados/futbol/mundial.html" goal="partidos con equipos, marcadores y estado"

# Precios de productos
/web-snapshot-simple url="https://example.com/tienda" goal="nombre y precio de cada producto listado"

# Noticias principales
/web-snapshot-simple url="https://news.ycombinator.com" goal="titulares con sus puntuaciones"

# Tabla de posiciones
/web-snapshot-simple url="https://example.com/liga" goal="tabla: posición, equipo, puntos, partidos jugados" wait=8
```

## Uso con `/loop` para Monitoreo Continuo

```bash
# Resultados en vivo cada 2 minutos
/loop 2m /web-snapshot-simple url="https://marca.com/resultados" goal="partidos en curso con marcadores"

# Precios cada 10 minutos
/loop 10m /web-snapshot-simple url="https://tienda.com/producto" goal="precio actual"
```

| Caso de uso | Intervalo recomendado |
|-------------|----------------------|
| Resultados deportivos en vivo | 2m |
| Precios de productos | 5–10m |
| Noticias | 10–15m |
| Monitoreo general | 30m–1h |

> **Nota:** Los loops se detienen al cerrar Claude Code. Para monitoreo persistente usar `/schedule`.

## Cómo Escribir un Buen `goal`

1. **Sé específico**: `"precios de productos"` > `"información"`
2. **Menciona el formato**: `"tabla con..."`, `"lista de..."`
3. **Incluye los campos clave**: `"nombre, precio, disponibilidad"`
4. **Agrega contexto**: `"partidos del Mundial 2026"` > `"partidos"`

| Tipo de página | GOAL sugerido |
|----------------|---------------|
| Resultados deportivos | `"partidos de hoy: equipos, marcadores, estado (finalizado/en curso)"` |
| Tienda online | `"productos en oferta: nombre, precio actual, precio anterior, descuento"` |
| Noticias | `"titulares principales, resumen breve, hora de publicación"` |
| Dashboard | `"métricas principales: nombre del indicador y valor numérico"` |
| Clasificación | `"tabla: posición, equipo, puntos, partidos jugados"` |

## Resolución de Errores

| Error | Causa | Solución |
|-------|-------|----------|
| `CONN_REFUSED` | Chrome no corre en puerto 9222 | El skill lo lanza automáticamente; si falla: `google-chrome --remote-debugging-port=9222` |
| `TIMEOUT` | Página tarda en cargar | Aumentar `wait` (ej: `wait=10`) |
| `PLAYWRIGHT_NOT_FOUND` | Playwright no instalado | `npm install -g playwright && npx playwright install chromium` |
| `SCREENSHOT_FAILED` | Sin permisos de escritura | Verificar permisos del directorio de salida |

## Ventajas sobre Scraping Tradicional

- ✅ Sin problemas de CORS
- ✅ Renderiza JavaScript complejo (React, Angular, Vue)
- ✅ Accede a Shadow DOM y Web Components
- ✅ Maneja banners de cookies automáticamente
- ✅ Funciona con Cloudflare y protecciones similares
- ✅ Extracción semántica: entiende contexto, no solo HTML

## Requisitos del Sistema

| Componente | Versión | Propósito |
|------------|---------|-----------|
| Node.js | ≥ 16.x | Ejecutar scripts de Playwright |
| Playwright | Latest | Lanzar Chrome con `--remote-debugging-port=9222` |
| Chrome DevTools MCP | Configurado | Conectar a Chrome y ejecutar comandos |

## Reglas

1. Responder en el idioma del usuario (español o inglés).
2. Verificar disponibilidad de Chrome antes de ejecutar.
3. Usar siempre `goal` para resultados óptimos; sin él, extraer en modo genérico.
4. Limpiar archivos temporales al finalizar.
