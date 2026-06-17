# /paso-1-contexto

Gano contexto rápido sobre una tarea **sin ejecutar cambios**. Analizo el prompt, investigo el ticket de seguimiento si existe, deduzco los proyectos y partes del repositorio involucrados, busco funciones similares/patrones previos, reviso la documentación local y consulto la plataforma de control de versiones por MRs/PRs relacionados. Al final presento un resumen claro y propongo un plan de acción.

## Prompt recibido

$ARGUMENTS

---

## Objetivo

Investigar y comprender el contexto completo de la tarea. **No modificar código, configuración ni datos.** Si un paso no aplica o falla, continuar con los siguientes.

## Stack y proyectos del repositorio

- Identifica los proyectos/lenguajes relevantes a partir del prompt (por ejemplo: Rails/Ruby, Vue.js/JavaScript, Python/Django, Go, Node/Nest, legacy Java/Grails, etc.).
- **Docs locales**: busca documentación en rutas comunes como `<repo>/handbook/`, `<repo>/docs/`, `<repo>/README.md` u otras que el proyecto use.

---

## Flujo de investigación

### 1. Analizar el prompt

1. Leer cuidadosamente `$ARGUMENTS`.
2. Extraer:
   - Posibles claves de ticket (formato `[A-Z]+-[0-9]+`, por ejemplo `PROJ-123`).
   - Nombres de proyectos, módulos, pantallas, endpoints o funcionalidades.
   - Tecnologías mencionadas (Vue.js 2, Rails, MongoDB, Grails, etc.).
   - Palabras clave para búsquedas posteriores.

### 2. Investigar ticket de seguimiento (si hay clave)

Si se detecta una clave de ticket en el prompt (formato típico `[A-Z]+-[0-9]+`):

1. Usar el MCP de seguimiento de issues disponible (por ejemplo, Jira) con `fields: "*all"` y `expand: "renderedFields,transitions,changelog"`.
2. Extraer del ticket:
   - Título, descripción y **Definition of Done**.
   - Estado, prioridad, asignado y reportero.
   - Comentarios relevantes si están disponibles.
   - Cualquier otra clave de issue relacionada (epic, subtasks, links).

Si no hay clave de ticket, omitir este paso.

### 3. Deducir proyectos y áreas involucradas

A partir del prompt y del ticket de seguimiento, determinar qué proyectos del repositorio están probablemente involucrados. Criterios de guía genéricos:

- **Frontend / SPA / web principal** → proyecto de frontend identificado en el prompt o en la estructura del repo.
- **APIs, bases de datos multi-region / microservicios** → proyectos backend/API identificados.
- **Asistentes, chatbots, funcionalidades conversacionales** → servicios y clientes asociados.
- **Documentos, gestión de contenido, bibliotecas** → módulos o gems/librerías correspondientes.
- **Legacy** → aplicaciones o módulos marcados como legacy o de mantenimiento.

### 4. Buscar funciones similares y patrones previos

En cada proyecto identificado:

1. Listar su estructura relevante (componentes, controladores, servicios, modelos, vistas).
2. Usar `grep` o búsquedas de archivos para encontrar:
   - Componentes o funciones similares a lo pedido.
   - Convenciones de nombres y estructura de archivos.
   - Helpers, mixins, stores o utilidades reutilizables.
   - Tests existentes como referencia.
3. Identificar patrones que el equipo ya haya resuelto antes y que se puedan reutilizar (DRY, SOLID).

### 5. Consultar la documentación local

Buscar documentación relevante en las rutas habituales del repositorio, por ejemplo:

- `<repo>/handbook/`
- `<repo>/docs/`
- `<repo>/README.md`
- `<repo>/ARCHITECTURE.md` u otros documentos de referencia.

Usar `grep -r` o lectura de archivos para encontrar guías sobre:

- Tecnologías involucradas.
- Estándares de diseño, accesibilidad o UX.
- Procedimientos del equipo (onboarding, metodología, incidencias).

### 6. Buscar MRs/PRs relacionados

Usar el MCP de la plataforma de control de versiones (GitLab, GitHub, Bitbucket, etc.) para buscar merge requests o pull requests relacionados:

1. Si se conoce el identificador del proyecto principal, usar `list_merge_requests` / `list_pull_requests` con `scope: "all"` y `search` con palabras clave del ticket o prompt.
2. Si no se conoce el identificador, usar `list_projects` / `list_repositories` u obtener candidatos con la API disponible.
3. Buscar por:
   - Clave del ticket de seguimiento.
   - Palabras clave del título o descripción de la tarea.
   - Nombre de rama si se conoce.
4. Revisar diffs de MRs/PRs abiertos o recientes que puedan solaparse o aportar contexto.

> **Nota**: Ningún paso bloquea a otro. Si el sistema de tickets no responde, la plataforma de control de versiones no devuelve resultados o la documentación local no tiene nada relevante, se continúa con el resto.

---

## Formato de salida

Al finalizar la investigación, presentar un resumen estructurado:

### 1. Entendimiento de la tarea
- Resumen en 2-3 frases de qué hay que hacer.
- Motivación o problema que resuelve (si se infiere).

### 2. Contexto del ticket (si aplica)
- Título y clave del ticket de seguimiento.
- Estado, prioridad y asignado.
- Criterios de aceptación / Definition of Done.

### 3. Proyectos y áreas involucradas
- Lista de proyectos del repositorio afectados.
- Capas o módulos dentro de cada proyecto (frontend, backend, tests, infraestructura).

### 4. Archivos y patrones relevantes encontrados
- Archivos similares existentes.
- Patrones o convenciones a reutilizar.
- Referencias de tests útiles como guía.

### 5. Documentación local
- Enlaces o rutas a documentos útiles encontrados.
- Decisiones arquitectónicas o estándares aplicables.

### 6. MRs/PRs relacionados
- MRs/PRs abiertos/cerrados relacionados, con título, autor y estado.
- Observaciones sobre solapamiento o dependencias.

### 7. Riesgos, bloqueos o incertidumbres
- Falta de información, dependencias externas, partes poco claras del prompt o ticket.

### 8. Plan propuesto
- Pasos sugeridos para abordar la tarea, ordenados lógicamente.
- Herramientas o comandos recomendados para cada paso.
- Puntos donde conviene pedir aprobación o confirmación antes de continuar.

---

## Reglas

1. **Solo investigar**: no crear, editar ni borrar archivos, ni ejecutar migraciones o tests destructivos.
2. **Idioma**: responder siempre en español.
3. **No bloquear**: si un paso no aplica o falla, continuar con los demás.
4. **Preferir herramientas MCP** para el sistema de tickets y la plataforma de control de versiones cuando sea posible.
5. **No ignorar errores en silencio**: si una herramienta falla, reportarlo en el resumen.
6. **DRY/SOLID**: al proponer el plan, destacar reutilización de patrones y componentes existentes.
