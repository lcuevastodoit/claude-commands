# /paso-orquestador

Coordina **múltiples subagentes `general-purpose`** en **modo asincrónico** (`run_in_background: true` obligatorio) para resolver un **goal** bien definido. El orquestador **decide** qué comandos de esta carpeta (`paso-1-contexto`, `paso-2-plan-gherkin`, ..., `paso-8-rubocop-reek-anaysis`, `mejor-plan`, `limpiar`, `paso-discovery-interview`, `probar-con-chrome`, `web-snapshot-simple`) debe invocar cada subagente, pero **nunca ejecuta código, tests, ni herramientas de modificación por sí mismo**. Todos los subagentes escriben su avance en un **log común centralizado** compartido. Un **Monitor tool builtin** observa el log con grep filtrando estados terminales y emite notificaciones event-driven en tiempo real cada vez que un subagente escribe `COMPLETED`, `FAILED` o `BLOCKED`.

## Prompt / Goal recibido

$ARGUMENTS

---

## Objetivo

1. Analizar el `$ARGUMENTS` y **descomponerlo en múltiples subtareas** siempre que sea posible (preferir 2+ subagentes sobre 1 solo cuando el goal lo permita).
2. Mapear cada subtarea al comando `paso-N-*` (o auxiliar) más adecuado de esta carpeta.
3. Lanzar subagentes `general-purpose` con `subagent_type: "general-purpose"` y `run_in_background: true` (asincrónico obligatorio).
4. Iniciar un **Monitor tool builtin** sobre el log común con `tail -f` + `grep --line-buffered` filtrando estados terminales, como canal de notificación event-driven.
5. Mantener un **log único centralizado** que todos los subagentes actualizan con su estado, hallazgos y bloqueos.
6. Sintetizar el resultado final al cerrar y detener el Monitor.
7. El orquestador **no ejecuta** ningún paso: solo planifica, despacha, monitorea y sintetiza.

---

## Precondiciones

1. El `$ARGUMENTS` debe describir un goal concreto y verificable. Si es ambiguo, **detenerse** y pedir aclaración antes de despachar agentes.
2. El directorio de logs debe ser escribible: `/Users/<user>/Codigo/tirant1/.claude/orquestador/logs/`.
3. Los subagentes deben tener acceso a las herramientas `Read`, `Write`, `Edit`, `Bash`, `Grep`, `Glob` y a las MCP de Jira y GitLab. Si un subagente reporta falta de herramientas, **no proceder manualmente**: relanzarlo o reportar al usuario.
4. El tool builtin `Monitor` debe estar disponible. Es **obligatorio** para observar el log común; si no está disponible, **no despachar** y reportar al usuario.

---

## Comandos disponibles para despachar

| Comando | Tipo | Cuándo despacharlo |
|---------|------|--------------------|
| `paso-discovery-interview` | Discovery | El goal es ambiguo o necesita entrevistar al usuario para aclararse |
| `paso-1-contexto` | Investigación | Necesita contexto de Jira, GitLab, handbook, patrones previos |
| `paso-2-plan-gherkin` | Especificación | Convertir requisitos en escenarios Gherkin ejecutables |
| `paso-3-tdd-execution` | Implementación | Ejecutar ciclo RED/GREEN un test a la vez |
| `paso-4-pruebas-funcionales` | QA manual | Validar funcionalidad con curl/navegador/console |
| `paso-5-code-review-ai` | Revisión IA | Revisión DRY/seguridad/performance/linting |
| `paso-6-cierre-consciente` | Cierre | Resumen + comentario Jira + 5 sugerencias de testeo |
| `paso-7-fix-review-comments` | Review humana | Procesar comentarios de MR GitLab |
| `paso-8-rubocop-reek-anaysis` | Análisis Ruby | Análisis estático RuboCop + Reek |
| `mejor-plan` | Pipeline corto | Flujo TDD compacto 5 fases cuando el goal lo cubre end-to-end |
| `limpiar` | Limpieza | Purgar logs/dead code de un archivo modificado |
| `probar-con-chrome` | Navegador | Pruebas funcionales en navegador vía Chrome DevTools MCP |
| `web-snapshot-simple` | Scraping | Extracción de contenido web dinámico |

---

## Log común centralizado

**Ruta fija por sesión**: `/Users/<user>/Codigo/tirant1/.claude/orquestador/logs/<YYYYMMDD-HHMMSS>-<slug>.md`

El slug se deriva del goal (sin espacios, max 40 chars). El orquestador **crea el archivo vacío** al iniciar y comunica la ruta a cada subagente en su prompt.

### Estructura del log

```markdown
# Log de Orquestación — <timestamp>

**Goal**: <goal original>
**Orquestador**: claude-code (agente principal)
**Comandos despachados**: <lista>

---

## Estado global
- [ ] Fase 1: <comando> — <subagente>
- [ ] Fase 2: <comando> — <subagente>
- [ ] ...

---

## Entradas cronológicas

### [<ISO timestamp>] <subagente-name> — <comando>
- **Estado**: STARTED | IN_PROGRESS | BLOCKED | COMPLETED | FAILED
- **Archivos tocados**: <lista o "n/a">
- **Hallazgos clave**: <bullet points>
- **Bloqueos**: <descripción o "ninguno">
- **Próxima acción**: <qué hará el subagente a continuación>

```

### Reglas del log

1. **Append-only**: los subagentes **añaden** entradas, nunca borran las de otros.
2. **Una entrada por evento significativo**: STARTED al arrancar, IN_PROGRESS en avances, BLOCKED/COMPLETED/FAILED al cerrar.
3. **Lenguaje español** para comunicación; código/archivos en inglés.
4. **Sin secretos**: nunca loguear tokens, credenciales o PII.
5. **Trazabilidad**: cada entrada incluye timestamp ISO y nombre del subagente.

---

## Fases del comando

### Fase 0 — Validación del goal

1. Leer `$ARGUMENTS`.
2. Si el goal está vacío, ambiguo o falta información crítica, **no despachar agentes**: pedir aclaración al usuario usando `AskUserQuestion` o mensaje directo.
3. Generar el slug y la ruta del log.
4. Crear el archivo de log con la cabecera inicial y la lista de fases previstas (puede ajustarse después).

### Fase 1 — Descomposición y mapeo (preferir multi-agente)

1. Descomponer el goal en **múltiples subtareas** siempre que sea posible. **Preferir 2+ subagentes sobre 1 solo** cuando el goal lo permita (ej: frontend + backend, análisis + tests, Ruby + Python, investigación + especificación). Solo usar 1 subagente si la tarea es estrictamente indivisible.
2. Para cada subtarea, seleccionar **un** comando de la tabla anterior (o un subagente directo si ningún `paso-N` aplica, como en tareas de generación de contenido o smoke tests).
3. Decidir paralelización:
   - **Paralelo**: subtareas independientes (ej: `paso-1-contexto` + `paso-8-rubocop-reek-anaysis` sobre distintos archivos; o `ruby-writer` + `python-writer` para dos archivos independientes). **Default preferente**.
   - **Secuencia**: subtareas con dependencia estricta (ej: `paso-2-plan-gherkin` → `paso-3-tdd-execution` → `paso-4-pruebas-funcionales`). Usar solo cuando el output de una subtarea sea input de la siguiente.
4. Presentar al usuario el plan de despacho:
   - Tabla: Subtarea | Comando | Subagente (name) | Dependencias | Modo (Paralelo/Secuencia).
   - Indicar explícitamente cuántos subagentes se despacharán y por qué se eligió ese número.
5. **Esperar aprobación explícita** antes de lanzar subagentes.

### Fase 2 — Despacho de subagentes (asincrónico) + Monitor builtin

**Todos los subagentes se lanzan en modo asincrónico** con `run_in_background: true`. El orquestador no se bloquea esperando resultados: recibe el `agentId` inmediatamente y continúa con el despacho de los demás o con otras tareas de coordinación. Las notificaciones de finalización llegan automáticamente.

Para cada subtarea aprobada:

1. Crear tarea con `TaskCreate` y asignar ownership con `TaskUpdate`.
2. Lanzar el subagente con `Agent`:
   - `subagent_type: "general-purpose"` (OBLIGATORIO para acceso completo a herramientas).
   - `run_in_background: true` (OBLIGATORIO: despacho asincrónico).
   - `name`: identificador estable (ej: `ctx-investigator`, `gherkin-planner`, `tdd-executor`, `ruby-writer`, `python-writer`).
   - `prompt`: autocontenido con:
     - Goal general de la sesión.
     - Comando a ejecutar (referencia al archivo `.claude/commands/<comando>.md`).
     - Ruta del log común.
     - Subtarea específica de este subagente.
     - Instrucciones de lectura/escritura del log (incluyendo el formato exacto `- **Estado**: COMPLETED` para que el Monitor lo detecte).
     - Reglas: código en inglés, comunicación en español, no commitear, no pushear, reportar bloqueos.
3. Para subtareas paralelas, lanzar múltiples `Agent` en **un mismo mensaje** (múltiples tool calls en paralelo, todos con `run_in_background: true`). El orquestador recibe varios `agentId` y sigue trabajando mientras todos ejecutan concurrentemente.
4. Para subtareas secuenciales con dependencia estricta, lanzar el primer subagente con `run_in_background: true`, registrar el `agentId`, y **esperar la notificación de finalización** (vía Monitor o Agent) antes de lanzar el siguiente subagente dependiente. El orquestador no sondea: las notificaciones llegan solas.
5. **Inmediatamente después de despachar a todos los subagentes** (en el mismo mensaje o en el siguiente), iniciar el **Monitor tool builtin** sobre el log común:

```
Monitor({
  command: "tail -f <ruta-del-log-común> | grep --line-buffered -E '\\*\\*Estado\\*\\*: (COMPLETED|FAILED|BLOCKED)'",
  description: "<goal-slug> states watcher (COMPLETED|FAILED|BLOCKED)",
  persistent: true
})
```

**Reglas del Monitor**:
- `persistent: true`: corre hasta `TaskStop` o fin de sesión.
- `timeout_ms`: opcional, usar un valor alto (ej: 3600000 = 1h) si el runtime lo requiere.
- El filtro grep **debe** cubrir todos los estados terminales: `COMPLETED|FAILED|BLOCKED`. Nunca filtrar solo `COMPLETED` — un subagente colgado o en crashloop pasaría desapercibido (silence = ambiguity).
- El patrón grep usa `\\*\\*Estado\\*\\*` (markdown `**Estado**`) para coincidir con el formato exacto de las entradas del log común y evitar matches espurios en otros contenidos.
- El Monitor emitirá **una notificación por cada estado terminal** escrito por cualquier subagente. Esto complementa (no reemplaza) las notificaciones automáticas de `Agent` background.
- Guardar el `task_id` retornado por el Monitor para poder hacer `TaskStop` al cerrar (Fase 5).

### Fase 3 — Instrucciones estándar para cada subagente

Cada prompt de subagente debe incluir este bloque (adaptado):

```
Eres un subagente del orquestador /paso-orquestador. Fuiste despachado en modo
asincrónico (run_in_background: true): el orquestador NO está bloqueado esperándote,
por lo que tu canal de comunicación principal es el LOG COMÚN. Escribe tu estado
ahí conforme avances; el orquestador lo leerá cuando necesite coordinación.

Tu rol es ejecutar el comando /<comando> definido en:
/Users/<user>/Codigo/tirant1/.claude/commands/<comando>.md

Lee primero ese archivo completo y sigue sus fases.

Goal general de la sesión: <goal>

Tu subtarea específica: <subtarea>

LOG COMÚN (OBLIGATORIO):
- Ruta: <ruta del log>
- Debes leer el log antes de empezar para ver el estado de otros agentes.
- Debes añadir entradas con tu nombre, comando, estado, hallazgos y próximos pasos.
- Formato: append-only. Nunca borres entradas de otros agentes.
- Entradas mínimas:
  1. STARTED al comenzar.
  2. IN_PROGRESS en cada hito significativo (para que el orquestador vea progreso
     sin necesidad de sondearte).
  3. BLOCKED si encuentras un obstáculo (con causa y propuesta).
  4. COMPLETED o FAILED al cerrar.

REGLAS:
- Código en inglés, comunicación en español.
- No commitear ni pushear.
- No ignorar errores: reportarlos en el log y al orquestador.
- Si no tienes acceso a herramientas necesarias, reportar INMEDIATAMENTE como BLOCKED.
- Al terminar, devuelve al orquestador: resumen, archivos tocados, estado final,
  y el siguiente comando sugerido (si aplica).
- Recuerda: el orquestador no está esperándote sincrónicamente; tu reporte final
  llegará como notificación de finalización de tu turno.
```

### Fase 4 — Monitoreo y coordinación (event-driven, doble canal)

El orquestador recibe notificaciones por **dos canales paralelos**:

- **Canal A — Notificaciones de `Agent` background**: llegan automáticamente cuando el **turno** de un subagente termina (status `completed`/`failed` del Agent).
- **Canal B — Eventos del Monitor tool**: emitidos en tiempo real cada vez que un subagente **escribe** en el log una entrada con `**Estado**: (COMPLETED|FAILED|BLOCKED)`. Esto puede ocurrir **antes** de que el turno formal termine (ej: el subagente escribió `COMPLETED` pero sigue haciendo verificación final) — útil para reaccionar temprano a `BLOCKED`.

Reglas:

1. El orquestador **no sondea** a los subagentes: ambos canales son event-driven. Mientras tanto, el orquestador puede:
   - Lanzar nuevos subagentes independientes.
   - Leer el log común para inspeccionar avances parciales (`STARTED` / `IN_PROGRESS`).
   - Responder al usuario.
   - Preparar la síntesis parcial.
2. Ante un evento `BLOCKED` (típicamente vía Canal B — Monitor, antes de que el turno termine):
   - Leer el log para entender el contexto.
   - Decidir: relanzar el subagente con más contexto (usar `SendMessage` al `agentId` retomable, o lanzar uno nuevo), redirigir a otro comando, o escalar al usuario.
   - **No proceder manualmente** en lugar del subagente.
   - El Monitor seguirá emitiendo eventos si el subagente vuelve a escribir estados terminales; no se detiene automáticamente.
3. Ante una notificación de finalización de un subagente (Canal A) o un evento `COMPLETED` del Monitor (Canal B):
   - Marcar la tarea como completada/failed con `TaskUpdate`.
   - Si era subtarea secuencial con dependientes, lanzar el siguiente subagente ahora (también con `run_in_background: true`).
   - Si era subtarea paralela, evaluar si hay que despachar nuevas subtareas según el plan.
4. Si los hallazgos de un subagente cambian el plan, **registrar el cambio en el log** y pedir aprobación al usuario antes de despachar nuevos comandos fuera del plan original.
5. Para continuar un subagente que reportó `BLOCKED` o que necesita trabajo adicional, usar `SendMessage` con el `agentId` retornado en el despacho original (preserva contexto) en lugar de crear un agente nuevo cuando sea posible.
6. **Contar eventos del Monitor**: el orquestador debe llevar la cuenta de cuántos `COMPLETED|FAILED|BLOCKED` ha recibido vs. cuántos subagentes despachó. Cuando todos los subagentes hayan reportado un estado terminal, proceder a Fase 5.

### Fase 5 — Síntesis final y cierre del Monitor

Cuando todos los subagentes hayan reportado un estado terminal (Contar eventos del Monitor == número de subagentes despachados, o todas las task-notifications de Agent recibidas):

1. **Detener el Monitor tool** con `TaskStop` usando el `task_id` guardado de Fase 2. Esto evita que siga emitiendo eventos espurios si el orquestador escribe su propia entrada de síntesis en el log.
2. Leer el log completo.
3. Verificar independientemente con `Read` los archivos creados/modificados por los subagentes (principio "trust but verify").
4. Marcar todas las tareas restantes como `completed` o `failed` con `TaskUpdate`.
5. Generar síntesis siguiendo el formato del skill `parallel-agents`:
   - Task Summary.
   - Tabla de contribuciones por subagente (con `agentId`, duración, tokens si están disponibles).
   - Recomendaciones consolidadas (Críticas / Importantes / Nice-to-have).
   - Action items.
   - Comparación de canales de notificación (eventos del Monitor vs. notificaciones de Agent) si aplica.
6. Presentar al usuario:
   - Resumen de subtareas ejecutadas.
   - Estado final de tests / linting / revisiones.
   - Ruta del log para auditoría.
   - Próximos pasos sugeridos (commit manual, push, QA humano, etc.).
7. **No commitear ni pushear**.

---

## Reglas

1. **El orquestador no ejecuta código**: ni tests, ni migraciones, ni edits, ni bash de modificación. Solo `Read`, `Grep`, `Glob`, `TaskCreate`, `TaskUpdate`, `Agent`, `SendMessage`, `Monitor`, `TaskStop` y escritura del propio log.
2. **Subagentes `general-purpose` siempre**: `subagent_type: "general-purpose"` es obligatorio para que tengan acceso completo a herramientas.
3. **Despacho asincrónico obligatorio**: todo subagente se lanza con `run_in_background: true`. El orquestador recibe el `agentId` y continúa; las notificaciones de finalización llegan automáticamente. **Nunca** bloquear esperando un subagente sincrónicamente.
4. **Monitor builtin obligatorio**: tras despachar a todos los subagentes, el orquestador **debe** iniciar un `Monitor` con `tail -f log | grep --line-buffered -E 'Estado\*\*: (COMPLETED|FAILED|BLOCKED)'` y `persistent: true`. El `task_id` se guarda para `TaskStop` en Fase 5. Si el tool `Monitor` no está disponible, **no despachar** y reportar al usuario.
5. **Multi-agente preferente**: descomponer el goal en 2+ subtareas siempre que sea posible. Solo usar 1 subagente si la tarea es estrictamente indivisible (ej: smoke test trivial). Documentar la razón si se usa un único subagente.
6. **Log común obligatorio**: ningún subagente puede operar sin leer y escribir en el log compartido. El formato de la línea de estado debe ser exactamente `- **Estado**: <ESTADO>` para que el grep del Monitor lo detecte.
7. **Aprobación explícita del usuario** entre fases que cambien el alcance o el plan original.
8. **No proceder manualmente** si un subagente falla: relanzar (via `SendMessage` al `agentId` retomable, o nuevo `Agent`) o escalar.
9. **Idioma**: código en inglés, comunicación en español.
10. **No commitear ni pushear**: el cierre queda en manos del usuario.
11. **No ignorar errores**: todo bloqueo se registra en el log y se reporta al usuario.
12. **Subagentes nombrados**: usar `name` estable para poder dirigir `SendMessage` si hace falta.
13. **Sin secretos en el log**: nunca loguear tokens, credenciales o PII.
14. **No sondear subagentes**: con `run_in_background: true` + Monitor, las notificaciones llegan solas por dos canales; usar el tiempo para despachar otros independientes, leer el log, o preparar síntesis.
15. **Cerrar el Monitor al finalizar**: en Fase 5, ejecutar `TaskStop` con el `task_id` del Monitor antes de escribir la síntesis en el log (para evitar que el orquestador dispare eventos espurios al escribir su propia entrada).

---

## Formato de salida

### Fase 0 — Validación
- Goal recibido.
- Slug generado.
- Ruta del log creado.
- ¿Necesita aclaración al usuario? (sí/no + preguntas).

### Fase 1 — Plan de despacho

| Fase | Comando | Subagente (name) | Dependencias | Modo |
|------|---------|------------------|--------------|------|
| 1 | `paso-1-contexto` | `ctx-investigator` | — | Paralelo |
| 2 | `paso-2-plan-gherkin` | `gherkin-planner` | Fase 1 | Secuencia |
| ... | ... | ... | ... | ... |

### Fase 2 — Despacho
- Subagentes lanzados (lista con `name`, comando, `agentId`, `run_in_background: true`).
- Tareas creadas en `TaskList` con ownership asignado.
- Nota: el orquestador continúa sin bloquearse; las notificaciones de finalización llegarán automáticamente.

### Fase 4 — Coordinación
- Eventos relevantes recibidos de subagentes.
- Cambios de plan registrados (si los hay).

### Fase 5 — Síntesis

```markdown
## Síntesis de orquestación

### Resumen del goal
[Qué se logró]

### Contribuciones por subagente
| Subagente | Comando | Estado | Hallazgos clave |
|-----------|---------|--------|-----------------|
| ctx-investigator | paso-1-contexto | COMPLETED | ... |
| gherkin-planner | paso-2-plan-gherkin | COMPLETED | ... |

### Recomendaciones consolidadas
1. **Crítica**: ...
2. **Importante**: ...
3. **Nice-to-have**: ...

### Action items
- [ ] ...
- [ ] ...

### Auditoría
- Log completo: `<ruta del log>`
- Tareas en TaskList: `<ids>`
```

---

## Nota sobre contexto

Si `$ARGUMENTS` está vacío, **no despachar agentes**. Pedir al usuario un goal explícito y bien definido antes de continuar. El orquestador no puede inferir el objetivo sin un `$ARGUMENTS` claro.