# /paso-5-code-review-ai

Realiza una **revisión de código asistida por IA** sobre los cambios implementados durante la sesión actual. Se evalúa contra principios como DRY, buenas prácticas, patrones del proyecto, sentido común, seguridad frecuente, performance, posibles bugs y linting según el lenguaje. La IA reporta los hallazgos **sin aplicar cambios automáticamente**; el usuario decide qué corregir. Si se acepta alguna corrección, se ajustan los tests unitarios correspondientes.

## Prompt / Contexto de la tarea

$ARGUMENTS

---

## Objetivo

Antes de dar por terminada una tarea, revisar críticamente el código introducido para detectar problemas de calidad, mantenibilidad, seguridad o riesgo. Este paso:

1. Analiza los archivos de implementación y tests creados o modificados en la sesión.
2. Compara el código contra los patrones y estándares del proyecto.
3. Detecta posibles bugs, duplicaciones, problemas de performance, riesgos de seguridad y desviaciones de estilo.
4. Evita falsos positivos: solo reporta hallazgos con fundamento técnico claro.
5. Presenta los hallazgos clasificados y priorizados al usuario.
6. **No modifica código hasta que el usuario apruebe explícitamente cada corrección.**
7. Si el usuario acepta correcciones, las aplica y actualiza los tests unitarios si el comportamiento o las estructuras cambian.
8. Ejecuta la suite completa al final para validar que todo sigue en GREEN.

## Precondiciones

1. Los pasos anteriores deberían haber dejado la funcionalidad implementada y los tests unitarios en GREEN.
2. Debe existir un diff claro de los cambios realizados en la sesión (archivos de implementación y tests).
3. El usuario debe estar disponible para revisar los hallazgos y tomar decisiones.

## Fases del comando

### Fase 0 — Recopilar cambios de la sesión

1. Identificar los archivos modificados o creados durante la sesión actual:
   - Archivos de implementación.
   - Archivos de tests.
   - Factories, fixtures, helpers, migraciones o configuraciones afectadas.
2. Obtener el diff de los cambios respecto al punto de partida.
3. Determinar los lenguajes involucrados (Ruby, JavaScript, Vue, Groovy/Grails, etc.).
4. Revisar brevemente el estilo y patrones predominantes en el proyecto para usarlo como referencia.

### Fase 1 — Verificación contra requerimiento original

Antes de revisar calidad interna, validar que lo implementado cumple con lo solicitado:

1. **Si existe una clave de ticket en el contexto de la sesión**:
   - Usar el MCP del sistema de seguimiento de issues (por ejemplo, Jira) con `fields: "*all"` y `expand: "renderedFields,transitions,changelog"`.
   - Extraer:
     - Título y descripción de la tarjeta.
     - Criterios de aceptación.
     - Definition of Done (DoD).
     - Comentarios relevantes.
     - Subtareas, links relacionados o épicas.
   - Comparar punto por punto con lo implementado.
   - Identificar requerimientos no cubiertos, mal interpretados o fuera de alcance.

2. **Si no se conoce la clave del ticket**:
   - Preguntar al usuario si existe un ticket asociado y cuál es su clave.
   - Si no hay ticket, pedir que el usuario confirme el alcance esperado y los criterios de aceptación.

3. **Verificación del DoD**:
   - Revisar cada ítem del Definition of Done.
   - Marcar si está cumplido, parcialmente cumplido o pendiente.
   - Si falta algo, reportarlo como hallazgo crítico antes de continuar con el resto de la revisión.

### Fase 2 — Revisión asistida por IA

Analizar los cambios desde múltiples dimensiones. Para cada dimensión, buscar problemas reales y evitar advertencias genéricas.

#### 1.1 DRY (Don't Repeat Yourself)

- Detectar lógica duplicada introducida en la sesión.
- Identificar si se repite código que ya existe en helpers, servicios, mixins, utils o librerías compartidas.
- Verificar si se pueden extraer métodos privados, funciones utilitarias o componentes reutilizables.
- No forzar abstracciones prematuras: solo proponer refactor si mejora claridad y mantenibilidad.

#### 1.2 Buenas prácticas y patrones del proyecto

- Revisar si el código sigue la arquitectura del proyecto (MVC, servicios, jobs, stores, componentes, etc.).
- Verificar uso de convenciones de nombres de archivos, clases, métodos y variables.
- Revisar si se usan los patrones existentes:
  - Rails: concerns, services, form objects, query objects, serializers, policies.
  - Vue.js: componentes, mixins, store modules, composables, servicios HTTP.
  - Grails: controllers, services, domains, plugins.
- Detectar violaciones a SOLID (responsabilidad única, inversión de dependencias, etc.).

#### 1.3 Sentido común y claridad

- Nombres descriptivos de variables, métodos y clases.
- Métodos demasiado largos o con muchos parámetros.
- Condicionales anidados excesivos o lógica difícil de seguir.
- Código muerto, comentarios obsoletos o debugging residual (`console.log`, `puts`, `debugger`, etc.).
- Valores mágicos sin constantes.
- Manejo de errores consistente con el resto del proyecto.

#### 1.4 Seguridad

- Validación y sanitización de entradas de usuario.
- Uso seguro de SQL (evitar inyección SQL, usar consultas parametrizadas).
- Manejo de autenticación y autorización (no exponer datos de otros usuarios, verificar permisos).
- Exposición de información sensible en logs, respuestas JSON o excepciones.
- Uso de `eval`, `send` dinámico, `innerHTML`, `dangerouslySetInnerHTML` o similar.
- Configuración de CORS, tokens, secrets.
- Posibles problemas de CSRF, XSS o SSRF.
- Manejo de archivos subidos o rutas de sistema.

#### 1.5 Performance

- Consultas N+1 no resueltas.
- Cargas excesivas en memoria.
- Bucles ineficientes o recursivos sin límites.
- Llamadas síncronas a servicios externos que deberían ser asíncronas.
- Uso inadecuado de caching si el proyecto usa Redis, Memcached, la librería interna de caching o similar.
- Renderizados innecesarios en componentes Vue.

#### 1.6 Posibles bugs

- Condiciones de carrera.
- Estados inconsistentes.
- Manejo de nil/null/undefined.
- Fechas, zonas horarias o formato de moneda.
- Off-by-one, división por cero, overflow.
- Concurrencia o idempotencia.
- Dependencia de orden de ejecución.
- Tests que pasan por casualidad pero no validan el comportamiento real.

#### 1.7 Linting y estilo por lenguaje

- **Ruby**: ejecutar `bundle exec rubocop` sobre los archivos modificados (si el proyecto lo soporta). Revisar alineación con `.rubocop.yml` del repositorio.
- **JavaScript/Vue**: ejecutar `yarn lint` o `npx eslint` sobre los archivos modificados. Revisar `.eslintrc.json` del proyecto.
- **Grails/Groovy**: revisar estilo del proyecto; si hay herramienta de linting configurada, ejecutarla.
- Reportar solo violaciones claras, no advertencias cosméticas irrelevantes.

### Fase 3 — Clasificar y presentar hallazgos

Agrupar los hallazgos en dos bloques principales:

#### Bloque A — Requerimiento original vs implementación

- Listado de criterios de aceptación / DoD verificados.
- Requerimientos pendientes o parcialmente implementados.
- Desviaciones de alcance detectadas.
- Acción recomendada para cada gap.

#### Bloque B — Revisión de calidad de código

1. Agrupar los hallazgos por dimensión (DRY, seguridad, performance, etc.).
2. Asignar una severidad a cada uno:
   - **Crítico**: bug probable, riesgo de seguridad o regresión. Recomendar corregir.
   - **Alto**: problema de mantenibilidad o performance importante. Sugerir corregir.
   - **Medio**: mejora de calidad o adherencia a patrones. Proponer corrección opcional.
   - **Bajo**: estilo menor o preferencia. Mencionar solo si es rápido de arreglar.
3. Para cada hallazgo incluir:
   - Ubicación exacta (archivo y línea aproximada).
   - Descripción del problema.
   - Justificación técnica.
   - Riesgo si no se corrige.
   - Propuesta de solución.
   - Indicación de si afecta tests unitarios.

4. **No proponer correcciones por inercia**: si un patrón del proyecto se viola intencionalmente o el cambio es válido, omitirlo o marcarlo como discutible.

### Fase 4 — Decisión del usuario

Presentar al usuario el listado completo de hallazgos (requerimiento + calidad) y pedir decisión para cada uno:

- **corregir**: aplicar la corrección propuesta.
- **omitir**: no hacer nada; registrar por qué se omite (por ejemplo, es un falso positivo o el usuario prefiere dejarlo así).
- **discutir**: pedir más contexto antes de decidir.

El usuario puede decidir:
- Corregir todo de una vez.
- Corregir uno a uno.
- No corregir nada.

**No aplicar ningún cambio sin aprobación explícita del usuario.**

### Fase 5 — Aplicar correcciones aprobadas

Si el usuario aprueba correcciones:

1. Aplicar los cambios siguiendo el estilo del proyecto.
2. Mantener el código en **inglés** y sin comentarios inline salvo justificación.
3. Si la corrección modifica comportamiento observable o estructuras usadas por tests:
   - Actualizar los tests unitarios afectados.
   - Ejecutar esos tests y confirmar GREEN.
4. Si la corrección introduce un nuevo caso límite o cambia expectativas:
   - Considerar añadir un test unitario adicional.
5. Mostrar diff de cada corrección aplicada.
6. Explicar brevemente la justificación técnica.

### Fase 6 — Validación final

1. Ejecutar linting sobre los archivos modificados.
2. Ejecutar la suite completa de cada proyecto afectado.
3. Si aparecen fallos, analizar si son causados por las correcciones aplicadas.
4. Corregir regresiones antes de declarar cierre.
5. Presentar resumen final:
   - Hallazgos totales.
   - Correcciones aplicadas.
   - Hallazgos omitidos y por qué.
   - Estado final de los tests.
   - Decisión del usuario: `¿continuar con el siguiente paso o dar la tarea por finalizada?`

## Reglas

1. **Verificación del requerimiento original primero**: antes de revisar calidad interna, confirmar que lo implementado cubre lo solicitado en el ticket de seguimiento o lo que el usuario definió como alcance.
2. **No modificar sin aprobación**: la IA solo reporta; el usuario decide.
3. **Evitar falsos positivos**: si un hallazgo es dudoso, débil o cuestionable, marcarlo como discutible o omitirlo.
4. **Contexto del proyecto**: usar como referencia el estilo, helpers, patrones y reglas de linting del proyecto, no estándares genéricos.
5. **Una corrección a la vez**: si hay varias, aplicarlas de forma ordenada, mostrando diff y justificación por cada una.
6. **Tests unitarios siempre ajustados**: cualquier cambio que afecte comportamiento o estructura debe reflejarse en tests.
7. **Idioma del código**: todo el código en inglés. Comunicación con el usuario en español.
8. **Suite completa tras correcciones**: nunca terminar sin validar que todo sigue en GREEN.
9. **No ignorar errores de linting o tests**: reportar y pedir decisión.
10. **Respetar decisiones del usuario**: si el usuario prefiere no corregir algo, aceptarlo y documentar el motivo.
11. **No commitear ni pushear**: este paso termina con el código revisado y listo para la decisión final del usuario.
12. **DoD como criterio de cierre**: si quedan ítems del Definition of Done pendientes, no declarar la tarea finalizada sin que el usuario los revise y decida.

## Formato de salida

### Fase 0 — Cambios analizados

- Archivos de implementación revisados.
- Archivos de tests revisados.
- Lenguajes involucrados.
- Herramientas de linting disponibles.

### Fase 2 — Hallazgos

#### Bloque A — Requerimiento original vs implementación

| # | Criterio / DoD | Estado | Observación | Acción recomendada |
|---|---|---|---|---|
| 1 | `...` | ✅ Cumplido / ⚠️ Parcial / ❌ Pendiente | `...` | `...` |

#### Bloque B — Calidad de código

##### 🔴 Críticos

| # | Archivo | Línea | Problema | Justificación | Riesgo | Propuesta | Afecta tests |
|---|---|---|---|---|---|---|---|
| 1 | `...` | `...` | `...` | `...` | `...` | `...` | Sí / No |

##### 🟠 Altos

| # | Archivo | Línea | Problema | Justificación | Riesgo | Propuesta | Afecta tests |
|---|---|---|---|---|---|---|---|
| 1 | `...` | `...` | `...` | `...` | `...` | `...` | Sí / No |

##### 🟡 Medios

| # | Archivo | Línea | Problema | Justificación | Riesgo | Propuesta | Afecta tests |
|---|---|---|---|---|---|---|---|
| 1 | `...` | `...` | `...` | `...` | `...` | `...` | Sí / No |

##### 🟢 Bajos

| # | Archivo | Línea | Problema | Justificación | Riesgo | Propuesta | Afecta tests |
|---|---|---|---|---|---|---|---|
| 1 | `...` | `...` | `...` | `...` | `...` | `...` | Sí / No |

### Fase 4 — Decisión del usuario

- Listado de acciones aprobadas / omitidas / en discusión.

### Fase 5 — Correcciones aplicadas

- Para cada corrección:
  - Archivos modificados.
  - Diff resumido.
  - Tests ajustados si aplica.
  - Justificación técnica.

### Fase 6 — Validación final

- Resultado de linting.
- Resultado de suite completa por proyecto.
- Hallazgos omitidos y motivo.
- Siguiente paso recomendado o cierre.

## Nota sobre contexto

Si `$ARGUMENTS` está vacío, usar el historial de la conversación actual para identificar los archivos modificados, la funcionalidad implementada y los proyectos afectados. Si no es posible determinar el diff exacto, pedir al usuario que especifique los archivos o use `git diff` / `git status` antes de continuar.
