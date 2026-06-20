# /paso-4-pruebas-funcionales

Guía al usuario en la ejecución de **pruebas funcionales manuales** sobre la funcionalidad implementada durante el ciclo TDD. Sugiere el plan de pruebas apropiado según el tipo de sistema afectado (API, frontend, servicio, legacy), espera el feedback del usuario, y aplica correcciones o ajustes (logs, fixes, tests unitarios) dentro del mismo paso. Al final el usuario decide si la tarea está lista o si debe invocar el siguiente paso.

## Prompt / Contexto de la tarea

$ARGUMENTS

---

## Objetivo

Validar que la funcionalidad implementada se comporta correctamente en un entorno lo más cercano posible a la realidad, fuera de la suite unitaria. Este paso:

1. Propone un plan de pruebas funcionales adaptado al tipo de proyecto afectado.
2. Proporciona comandos concretos (`curl`, `rails console`, scripts, navegador, etc.).
3. Espera que el usuario ejecute las pruebas y reporte resultados.
4. Aplica correcciones, logs o ajustes que el usuario solicite.
5. Actualiza o añade tests unitarios si las pruebas funcionales revelan nuevos casos o regresiones.
6. Deja la decisión final en manos del usuario: `todo bien` o `invocar siguiente paso`.

## Precondiciones

1. La implementación TDD del paso anterior (`paso-3-tdd-execution`) debe estar completa.
2. Los tests unitarios deben estar en GREEN.
3. Debe existir un entorno donde ejecutar las pruebas funcionales (local, Docker, staging, preview) accesible para el usuario.

## Fases del comando

### Fase 0 — Resumen del estado actual

1. Recopilar del contexto de la sesión:
   - Proyectos afectados.
   - Funcionalidad implementada.
   - Tests unitarios creados y su estado.
   - Archivos de implementación modificados.
2. Presentar al usuario un resumen claro:
   - Qué se implementó.
   - Qué proyectos se tocaron.
   - Qué endpoints, pantallas, jobs, servicios o componentes están involucrados.
   - Estado actual de los tests unitarios.
3. Confirmar que el entorno de pruebas funcionales está disponible. Si no lo está, proponer cómo levantarlo.

### Fase 1 — Plan de pruebas funcionales

Según el tipo de proyecto afectado, generar un plan detallado. El plan debe incluir:

- **Escenarios a probar**: happy path y casos límite relevantes.
- **Precondiciones**: datos, autenticación, estado del sistema.
- **Pasos**: acciones exactas a realizar.
- **Resultado esperado**: qué debe observarse.
- **Comando / herramienta**: cómo ejecutar la prueba.

#### 1.1 APIs (Rails/Node/Python/Go/etc.)

Sugerir pruebas con:

- `curl` para endpoints REST (incluir headers `Authorization`, `Content-Type`, idioma, etc.).
- Consola del framework (`rails console`, `python manage.py shell`, `node`, etc.) para verificar estados de modelo, jobs en cola, registros en base de datos.
- `docker exec <container> <comando>` si la app corre en contenedores.
- Logs de servidor para trazar requests y respuestas.

Ejemplo de estructura:

```bash
# Happy path
curl -X POST http://localhost:3000/api/v1/resource \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"field":"value"}'

# Caso límite: datos inválidos
curl -X POST http://localhost:3000/api/v1/resource \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"field":""}'
```

#### 1.2 Frontend Vue.js / React / Angular / SPA genérica

Sugerir pruebas con:

- Navegador + DevTools: verificar renderizado, estado de la store (Vuex, Redux, Context, etc.), llamadas de red, consola.
- Casos de interacción: clicks, formularios, validaciones, navegación, errores.
- Diferentes viewports o browsers si aplica.
- Verificación de i18n si la funcionalidad tiene traducciones.

#### 1.3 Monolitos backend (Rails, Django, Laravel, etc.)

Sugerir pruebas con:

- Consola del framework (`rails console`, `python manage.py shell`, etc.) para verificar lógica de negocio, servicios, jobs.
- Navegador para flujos que incluyan vistas server-side o componentes frontend embebidos.
- Logs del worker de jobs (Sidekiq, Celery, RQ, etc.) si hay procesos asíncronos.

#### 1.4 Legacy (Grails, Java antiguo, etc.)

Sugerir pruebas con:

- Navegador sobre la app levantada (usar el comando de arranque definido en el proyecto, por ejemplo `make serve`, `grails run-app`, etc.).
- Logs de la app legacy o contenedor Docker.
- Consola de la app si está disponible.

#### 1.5 Jobs / Procesos asíncronos

Sugerir pruebas con:

- Encolar el job manualmente desde `rails console` o endpoint.
- Verificar ejecución en Sidekiq / DelayedJob.
- Revisar logs de procesamiento y estado final en base de datos.

### Fase 2 — Ejecución por parte del usuario

1. Presentar el plan de pruebas de forma clara y numerada.
2. Esperar a que el usuario ejecute las pruebas y reporte resultados.
3. El usuario puede responder con:
   - `todo bien`: la funcionalidad se comporta como se espera.
   - `falla X`: describe qué prueba falló y por qué.
   - `agregar log en Y`: solicita añadir logs de depuración en un punto específico.
   - `corregir Z`: pide un ajuste en la implementación.
   - `nuevo caso W`: detecta un escenario no cubierto por tests unitarios.
   - `invocar siguiente paso`: pasa al comando siguiente si todo está correcto.

### Fase 3 — Aplicar feedback

Según el feedback recibido:

#### 3.1 Agregar logs

- Añadir logs mínimos y temporales en el punto solicitado.
- En Ruby/Rails: usar `Rails.logger.info`, `Rails.logger.debug`, `Rails.logger.error` según el nivel apropiado.
- En JavaScript/Vue: usar `console.log` o `console.error` temporalmente; eliminar antes de cerrar la tarea.
- En Grails: usar `log.info`, `log.debug`.
- Preferir logs estructurados si el proyecto los usa.
- Explicar qué información aporta cada log.

#### 3.2 Corregir implementación

- Identificar la causa raíz del fallo funcional.
- Aplicar la corrección mínima.
- Actualizar tests unitarios si el comportamiento esperado cambia.
- Re-ejecutar el test unitario afectado y, si aplica, la suite del proyecto.
- Mostrar diff y justificación técnica.

#### 3.3 Añadir nuevo caso funcional no cubierto

- Si el usuario detecta un escenario nuevo:
  - Convertirlo a test unitario siguiendo las reglas de `paso-2-plan-gherkin`.
  - Ejecutar TDD mini (`paso-3-tdd-execution`) para ese caso: RED → GREEN.
  - Actualizar el plan Gherkin si es necesario.

#### 3.4 Re-ejecutar pruebas funcionales

- Después de cada corrección, pedir al usuario que re-ejecute la prueba funcional afectada.
- Si el usuario lo solicita, proporcionar nuevos comandos o ajustar los existentes.

### Fase 4 — Cierre

Cuando el usuario reporte que las pruebas funcionales pasan:

1. Revisar que no queden logs temporales, `console.log`, `puts`, `debugger`, `binding.pry`, etc.
2. Re-ejecutar la suite unitaria completa de cada proyecto afectado para confirmar que nada se rompió.
3. Presentar resumen final:
   - Pruebas funcionales ejecutadas.
   - Correcciones aplicadas.
   - Tests unitarios agregados o modificados.
   - Estado final de las suites.
4. Preguntar al usuario:
   - `¿Todo quedó bien?` → finalizar la tarea.
   - `¿Invocar siguiente paso?` → preguntar cuál es el siguiente paso y proceder.

## Reglas

1. **Sugerencias concretas**: los planes de pruebas deben incluir comandos exactos, URLs, payloads, pasos de UI y datos de ejemplo. No quedarse en descripciones vagas.
2. **Esperar feedback del usuario**: este paso no automatiza las pruebas funcionales; el humano las ejecuta y reporta.
3. **Correcciones dentro del mismo paso**: si el usuario pide un fix, log o ajuste, aplicarlo aquí y no delegar a otro comando.
4. **Actualizar tests unitarios**: cualquier descubrimiento funcional nuevo debe reflejarse en la suite unitaria.
5. **No dejar logs de debugging**: antes de cerrar, eliminar `console.log`, `puts`, `debugger`, `Rails.logger.debug` temporales, etc.
6. **Idioma**: el código debe estar en **inglés**. La comunicación con el usuario debe ser en el idioma en que se solicite la tarea.
7. **Un cambio a la vez**: si hay múltiples correcciones, abordarlas una por una, mostrando diff y justificación.
8. **Suite completa tras correcciones**: cada corrección significativa debe terminar con la suite del proyecto en GREEN.
9. **No ignorar errores**: si un comando, test o prueba funcional falla, reportarlo y pedir decisión.
10. **Decisión final del usuario**: solo el usuario determina si la tarea quedó lista o si se invoca el siguiente paso.

## Formato de salida

### Fase 0 — Resumen

- Funcionalidad implementada.
- Proyectos afectados.
- Archivos de implementación.
- Estado de tests unitarios.

### Fase 1 — Plan de pruebas funcionales

Para cada escenario funcional:

| # | Escenario | Precondiciones | Pasos | Resultado esperado | Comando / Herramienta |
|---|---|---|---|---|---|
| 1 | Happy path | ... | ... | ... | `curl ...` |
| 2 | Caso límite X | ... | ... | ... | `rails console` |

### Fase 2 — Feedback del usuario

- Respuesta recibida.
- Acción decidida.

### Fase 3 — Correcciones aplicadas

- Logs añadidos / eliminados.
- Fixes implementados.
- Tests unitarios agregados o modificados.
- Diff resumido.

### Fase 4 — Cierre

- Suite unitaria final: resultado por proyecto.
- Resumen de pruebas funcionales.
- Decisión del usuario: `todo bien` o `invocar siguiente paso`.

## Nota sobre contexto

Si `$ARGUMENTS` está vacío, usar el historial completo de la conversación actual para reconstruir la funcionalidad implementada, los proyectos afectados y los tests unitarios existentes.
