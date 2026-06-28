# /paso-7-fix-review-comments

Procesa los **comentarios de review en Merge Requests de GitLab** relacionados con la tarea actual. El comando obtiene los MRs asociados al ticket de Jira, extrae los comentarios de review, analiza si tienen fundamento técnico, propone un plan de corrección con justificación, identifica casos donde no aplica modificar algo, y tras aprobación del usuario, agrega tests cases nuevos (solo si es necesario) y aplica las correcciones.

## Prompt / Contexto de la tarea

$ARGUMENTS

---

## Objetivo

Cerrar el ciclo de feedback de code review humano de forma estructurada:

1. Identificar los MRs de GitLab asociados a la clave de Jira de la tarea actual.
2. Obtener todos los comentarios de review (threads) pendientes o no resueltos.
3. Analizar cada comentario para determinar si tiene fundamento técnico válido.
4. Proponer un plan de corrección con justificación técnica para cada comentario válido.
5. Identificar claramente los casos donde no aplica modificar algo (falso positivo, opinión subjetiva, conflicto con requerimientos).
6. Presentar el plan al usuario y esperar aprobación explícita.
7. Tras aprobación, agregar tests cases nuevos solo si es necesario para cubrir los cambios.
8. Aplicar las correcciones aprobadas y validar con tests.

## Precondiciones

1. Debe existir una clave de Jira en el contexto de la sesión (del paso anterior o proporcionada por el usuario).
2. El MR debe estar creado en GitLab y accesible mediante el MCP.
3. Debe haber comentarios de review pendientes por procesar.
4. El usuario debe estar disponible para revisar el plan y aprobar/rechazar cada corrección propuesta.

## Fases del comando

### Fase 0 — Identificar MRs asociados

1. Obtener la clave de Jira del contexto o preguntar al usuario: `¿Cuál es la clave del ticket de Jira?`
2. Buscar en el historial si se mencionó un MR de GitLab relacionado.
3. Usar `mcp__gitlab__gitlab_search_mrs` para buscar MRs que contengan la clave de Jira en título o descripción.
4. Si hay múltiples MRs, listarlos y pedir al usuario que confirme cuál(es) procesar.
5. Para cada MR seleccionado, obtener:
   - `mcp__GitLab-MCP__get_merge_request`: detalles del MR (título, descripción, autor, estado).
   - `mcp__GitLab-MCP__mr_discussions`: lista de threads/discusiones de review.

**⚠️ Importante - Uso correcto del MCP de GitLab:**
- El `project_id` debe ser el **path completo** del proyecto (`"owner/project"`), NO el ID numérico.
- Ejemplo correcto: `project_id: "sofia/conversa-js"` ✅
- Ejemplo incorrecto: `project_id: "548"` ❌ (devuelve 404)
- El `merge_request_iid` es el número del MR (ej: `"442"`).

### Fase 1 — Extraer y clasificar comentarios

Para cada discusión obtenida:

1. **Filtrar comentarios relevantes**:
   - Ignorar notas del sistema ("added 3 commits", "merged", etc.).
   - Ignorar comentarios del propio autor del MR (autoreplies).
   - Ignorar discusiones ya resueltas o marcadas como "resolved".
   - Focar en comentarios de reviewers que sugieran cambios.

2. **Clasificar por tipo**:
   - **Bug/Omisión**: el código tiene un error o falta algo funcional.
   - **Calidad/Mantenibilidad**: estilo, nombres, complejidad, DRY.
   - **Seguridad**: vulnerabilidades, validaciones faltantes.
   - **Performance**: N+1, queries ineficientes, loops.
   - **Testing**: falta cobertura, tests incompletos.
   - **Diseño/Arquitectura**: violaciones de patrones del proyecto.
   - **Nitpick/Estilo menor**: preferencias subjetivas, espacios, formato.

3. **Para cada comentario extraer**:
   - Autor del comentario.
   - Texto del comentario.
   - Ubicación (archivo, línea si aplica).
   - Contexto de código alrededor (si es un comment en diff).
   - ID de la discusión para referencia futura.

### Fase 2 — Análisis de fundamento técnico

Para cada comentario clasificado, analizar:

1. **¿Tiene fundamento técnico?**
   - Aplica principios SOLID, DRY, seguridad, performance.
   - Es consistente con patrones del proyecto (revisar código existente similar).
   - Resuelve un problema real o previene un bug.

2. **Casos donde NO aplica modificar** (marcar como "no aplica"):
   - **Falso positivo**: el comentario se basa en una mala interpretación del código.
   - **Contradice requerimientos**: la sugerencia va contra lo especificado en Jira.
   - **Opinión subjetiva**: preferencia de estilo sin impacto técnico (ej: "no me gusta este nombre" sin alternativa mejor).
   - **Fuera de alcance**: el comentario pide cambios que corresponden a otra tarea.
   - **Ya abordado**: el punto fue discutido y se decidió no cambiar.
   - **Inconsistencia del reviewer**: el comentario contradice otras decisiones del proyecto.

3. **Para comentarios válidos, determinar**:
   - Severidad: Crítico, Alto, Medio, Bajo.
   - Esfuerzo estimado: S (minutos), M (hora), L (varias horas).
   - Archivos afectados.
   - Si requiere nuevos tests o actualizar tests existentes.

### Fase 3 — Presentar plan de corrección

Generar un informe estructurado para el usuario:

#### Resumen de comentarios procesados

| # | Autor | Tipo | Archivo | Línea | Estado análisis |
|---|---|---|---|---|---|
| 1 | `@reviewer` | Bug | `app/models/user.rb` | 45 | ✅ Válido - Aplica corregir |
| 2 | `@reviewer` | Estilo | `app/services/x.rb` | 12 | ❌ No aplica - Preferencia subjetiva |

#### Plan de corrección propuesto

**Comentarios a corregir:**

| # | Tipo | Severidad | Ubicación | Descripción del issue | Propuesta de fix | Requiere tests nuevos |
|---|---|---|---|---|---|---|
| 1 | Bug | 🔴 Crítico | `app/models/user.rb:45` | Falta validación de nil antes de llamar a método | Agregar guard clause `return if value.nil?` | Sí - caso nil |
| 2 | Calidad | 🟠 Alto | `app/services/x.rb:30` | Método con 50 líneas, viola SRP | Extraer lógica a servicio auxiliar | Sí - tests del nuevo servicio |

**Comentarios marcados como "no aplica" (con justificación):**

| # | Tipo | Ubicación | Comentario original | Justificación de por qué no aplica |
|---|---|---|---|---|
| 2 | Estilo | `app/services/x.rb:12` | "Cambia el nombre de la variable" | El nombre sigue convención del proyecto (ver `SimilarService`), cambio puramente subjetivo. |

Para cada comentario válido, presentar:
- **Justificación técnica**: por qué el comentario tiene fundamento.
- **Riesgo si no se corrige**: qué podría fallar.
- **Propuesta específica**: cambio concreto sugerido.
- **Alternativas**: otras formas de resolverlo si existen.

Esperar aprobación explícita del usuario para cada comentario:
- `aprobar`: proceder con la corrección.
- `rechazar`: no aplicar, registrar motivo.
- `discutir`: necesita más contexto.

### Fase 4 — Diseñar tests nuevos (solo si es necesario)

Si el usuario aprueba correcciones que requieren nuevos tests:

1. **Analizar cobertura actual**:
   - Revisar tests existentes del archivo a modificar.
   - Identificar si el comportamiento a cambiar ya tiene test coverage.

2. **Determinar necesidad de tests nuevos**:
   - Si el fix cubre un caso límite no testeado → agregar test.
   - Si el fix extrae lógica a un nuevo componente → agregar tests del componente.
   - Si el fix es refactor interno sin cambio de comportamiento → tests existentes deberían bastar.

3. **Diseñar tests siguiendo TDD**:
   - Describir el caso de prueba antes de implementar.
   - Input, condiciones, expectativa de salida.
   - Tipo: unitario, integración, etc.

4. **Presentar al usuario**:
   - "Se agregarán X tests nuevos: [descripción de cada uno]"
   - Esperar confirmación antes de escribir código de tests.

### Fase 5 — Aplicar correcciones aprobadas

Por cada comentario aprobado:

1. **Implementar el fix**:
   - Seguir la propuesta aprobada.
   - Mantener estilo y patrones del proyecto.
   - Código en inglés, sin comentarios inline innecesarios.

2. **Agregar/actualizar tests**:
   - Si se diseñaron tests nuevos, implementarlos primero (TDD).
   - Ejecutar los tests nuevos, deben fallar (red).
   - Luego aplicar el fix, los tests deben pasar (green).
   - Si el fix afecta tests existentes, actualizarlos.

3. **Verificar por corrección**:
   - Mostrar diff del cambio aplicado.
   - Ejecutar tests específicos del archivo modificado.
   - Confirmar que pasan.

4. **Actualizar estado en GitLab (si es posible)**:
   - Usar `mcp__gitlab__gitlab_resolve_discussion` para marcar la discusión como resuelta.
   - O agregar un comentario de respuesta explicando el fix aplicado.

### Fase 6 — Validación final

1. Ejecutar linting sobre archivos modificados.
2. Ejecutar la suite completa de tests del proyecto.
3. Si hay fallos, analizar y corregir.
4. Generar resumen final:
   - Comentarios procesados: total, aprobados, rechazados.
   - Correcciones aplicadas.
   - Tests nuevos agregados.
   - Discusiones resueltas en GitLab.
   - Estado final de la suite de tests.

## Reglas

1. **No asumir que todo comentario debe aplicarse**: analizar críticamente cada uno.
2. **Justificar "no aplica"**: cuando se rechaza un comentario, explicar claramente por qué.
3. **Aprobación explícita del usuario**: nunca aplicar cambios sin confirmación previa.
4. **Tests solo si es necesario**: no agregar tests por inercia, solo si el fix lo requiere.
5. **Mantener coherencia del proyecto**: el fix debe alinearse con patrones existentes.
6. **Idioma**: código en inglés, comunicación con usuario en español.
7. **Respetar al reviewer**: cuando se rechaza un comentario, hacerlo con argumentos técnicos, no personales.
8. **Marcar discusiones resueltas**: usar MCP para cerrar threads en GitLab cuando se aplique el fix.
9. **Suite en GREEN**: nunca terminar sin validar que todos los tests pasan.

## Formato de salida

### Fase 0 — MRs identificados

- Clave Jira: `XXX-1234`
- MRs encontrados: `[!123 - Título del MR](enlace)`
- Estado del MR: Abierto / Mergeado / Cerrado

### Fase 1 — Comentarios extraídos

| # | ID Discusión | Autor | Tipo | Archivo:Línea | Extracto |
|---|---|---|---|---|---|
| 1 | `abc123` | `@reviewer` | Bug | `user.rb:45` | "Falta validación aquí" |

### Fase 2 — Análisis de fundamento

| # | Fundamento | Severidad | Esfuerzo | Decisión |
|---|---|---|---|---|
| 1 | ✅ Válido - Previene NPE | 🔴 Crítico | S | Aprobar corrección |
| 2 | ❌ No aplica - Preferencia subjetiva | - | - | Rechazar |

### Fase 3 — Plan de corrección

**Comentarios a corregir:**

| # | Ubicación | Issue | Propuesta | Tests nuevos |
|---|---|---|---|---|
| 1 | `user.rb:45` | Falta validación nil | Guard clause | Sí - caso nil |

**Comentarios rechazados (justificación):**

| # | Comentario | Justificación de rechazo |
|---|---|---|
| 2 | "Cambia el nombre" | Convención del proyecto usa este naming, no hay alternativa objetivamente mejor |

### Fase 4 — Tests a agregar

| # | Descripción | Tipo | Cobertura |
|---|---|---|---|
| 1 | `User#process with nil value` | Unitario | Caso límite no cubierto |

### Fase 5 — Correcciones aplicadas

| # | Comentario | Archivos modificados | Tests agregados | Estado en GitLab |
|---|---|---|---|---|
| 1 | Validación nil | `user.rb` | `user_spec.rb` (1 test) | Resuelto |

### Fase 6 — Validación final

- Resultado linting: ✅ / ❌
- Suite de tests: ✅ PASS / ❌ FAIL
- Resumen: X comentarios procesados, Y aplicados, Z rechazados, W tests nuevos.

## Nota sobre contexto

Si `$ARGUMENTS` está vacío, usar el historial de la conversación para obtener:
- La clave de Jira del paso anterior.
- El número de MR mencionado previamente.
- Los archivos y cambios discutidos en la sesión.

Si no se puede determinar el MR, preguntar al usuario: `¿Cuál es el número del MR de GitLab a procesar?`
