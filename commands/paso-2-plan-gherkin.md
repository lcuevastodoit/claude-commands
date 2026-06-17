# /paso-2-plan-gherkin

Convierte el contexto de la conversación actual (o los argumentos recibidos) en un plan de especificaciones ejecutables escritas en **Gherkin** siguiendo el estándar de Cucumber: https://cucumber.io/docs/gherkin/reference/.

## Prompt / Contexto de la tarea

$ARGUMENTS

---

## Objetivo

Transformar los requerimientos de historia de usuario, criterios de aceptación y detalles técnicos descubiertos durante la conversación actual en una suite de escenarios Gherkin completa, clara y lista para convertirse en tests automáticos. **No ejecutar cambios de código ni modificar archivos en la primera fase.**

Una vez que el usuario apruebe, modifique o sugiera cambios al plan Gherkin, se debe convertir cada escenario aprobado en **test cases reales** dentro de la suite de pruebas del proyecto correspondiente (RSpec para Ruby/Rails, Jest para Vue.js/JavaScript), respetando los patrones, helpers y estilo de tests existentes en cada proyecto.

## Inputs a considerar

1. **Argumentos del comando**: `$ARGUMENTS`.
2. **Contexto de la conversación actual**: historial de mensajes de esta sesión (preguntas, respuestas, investigaciones, decisiones).
3. **Tickets de seguimiento** mencionados: título, descripción, criterios de aceptación, Definition of Done.
4. **MRs/PRs relacionados**: cambios técnicos detectados.
5. **Proyectos del repositorio involucrados**: deducir del prompt, estructura del repo y conversación (backend, frontend, librerías compartidas, legacy, etc.).

## Stack y tecnologías de referencia

- **Ruby/Rails**: RSpec puede usar `feature/scenario` con Capybara o `describe/context/it` convencional. Los escenarios Gherkin se pueden adaptar a ambos.
- **Vue.js/JavaScript**: Jest + Testing Library, Vue Test Utils, Cypress e2e.
- **Legacy**: Grails / Spock.

## Fases del comando

### Fase 1 — Generar plan Gherkin

Analizar el contexto y producir la especificación Gherkin siguiendo las reglas de esta sección. **No escribir código de tests ni modificar archivos del proyecto todavía.**

### Fase 2 — Aprobación / Revisión del plan

Presentar el plan Gherkin y pedir al usuario que:

- **Apruebe** el plan tal cual.
- **Modifique** escenarios, añada nuevos o elimine los que no apliquen.
- **Sugiera cambios** en redacción, alcance, casos límite o división de features.

**No avanzar a Fase 3 sin aprobación explícita del usuario.**

### Fase 3 — Convertir Gherkin a tests reales

Una vez aprobado el plan Gherkin:

1. Identificar los proyectos del repositorio que se van a modificar con seguridad.
2. Para cada proyecto identificado, generar los archivos de test correspondientes:
   - **Ruby/Rails**: usar **RSpec** o la suite definida en el proyecto.
   - **Vue.js/JavaScript**: usar **Jest**, Testing Library o la suite definida en el proyecto.
   - **Otros lenguajes**: usar el framework de tests predominante del proyecto.
3. Mapear cada escenario Gherkin a uno o más test cases en la suite correspondiente.
4. Antes de crear tests, inspeccionar la suite existente del proyecto para respetar:
   - Estructura de carpetas (`spec/`, `__tests__/`, etc.).
   - Nomenclatura de archivos y `describe/context/it`.
   - Helpers, factories, fixtures y mocks más usados.
   - Estilo de assertions/expectations predominante.
   - Forma de manejar base de datos, sidekiq, requests, componentes, stores, etc.

## Estructura de salida esperada

### Fase 1

Para cada **Feature** identificada, generar:

```gherkin
@<tag-de-proyecto> @<tag-de-prioridad>
Feature: <Nombre descriptivo de la funcionalidad>

  As a <tipo de usuario>
  I want <objetivo>
  So that <beneficio>

  Background:
    Given <precondiciones comunes>

  Scenario: <descripción breve>
    Given <estado inicial>
    When <acción>
    Then <resultado esperado>
    And <resultado adicional>
```

### Fase 3

Para cada test case generado, el archivo debe cumplir:

- Código 100% en **inglés**.
- **Sin comentarios** en el código salvo que la complejidad lo justifique de forma excepcional.
- **Una sola expectation por test case** (`expect(...).to ...`). Si un escenario Gherkin valida múltiples resultados, dividirlo en varios `it` dentro del mismo `describe/context`.
- Usar los **mismos helpers, factories, fixtures y mocks** que la mayoría de tests del proyecto.
- Seguir el orden: `describe` → `context` → `it`, con nombres descriptivos que reflejen el escenario Gherkin.
- Preferir `let`, `let!`, `before` según el patrón del proyecto; evitar repetir setup entre tests.
- En RSpec:
  - Usar `feature/scenario` o `describe/context/it` según el estándar del proyecto.
  - Usar FactoryBot, WebMock, Shoulda Matchers, helpers persoalizados, shared context, etc., si están presentes.
- En Jest:
  - Usar `@testing-library/vue`, `@vue/test-utils`, `jest.mock`, `msw`, etc., según el estándar del proyecto.
  - Mockear stores, servicios y dependencias siguiendo el patrón existente.

## Reglas

### Reglas de la fase Gherkin

1. **Un escenario por requerimiento claro**: cada criterio de aceptación debe mapearse al menos a un escenario Gherkin.
2. **Casos límite obligatorios**: incluir siempre escenarios para:
   - Happy path (flujo principal)
   - Datos inválidos / errores de validación
   - Permisos / autenticación / autorización
   - Estados extremos (vacío, límite, timeout, fallo de servicio externo)
   - Idempotencia y concurrencia cuando aplique
3. **Lenguaje ubícuo**: usar los mismos términos del negocio, del ticket de seguimiento y de la conversación (no inventar nombres).
4. **No especificar detalles de UI a menos que sean requeridos**: enfocarse en comportamiento observable, no en IDs de botón o color.
5. **Tags**: usar `@<proyecto>` (nombre del proyecto afectado), `@regression`, `@smoke`, `@wip` según corresponda.
6. **Background común**: si varios escenarios comparten precondiciones, extraerlas a un `Background`.
7. **Scenario Outline**: cuando haya múltiples variaciones de datos para la misma lógica, usar `Scenario Outline` + `Examples`.
8. **Criterios de aceptación explícitos**: incluir al final una lista de criterios de aceptación verificables.
9. **Solo planificar en Fase 1**: no crear, editar ni borrar archivos de código hasta que el usuario apruebe.
10. **Idioma**: responder siempre en español. El Gherkin puede estar en inglés.
11. **No ignorar errores**: si falta contexto o hay ambigüedad, reportarlo claramente y pedir aclaración.

### Reglas de la fase de tests reales

1. **Aprobación previa obligatoria**: no generar tests sin confirmación explícita del usuario sobre el plan Gherkin.
2. **Proyectos seguros solo**: crear tests únicamente para los proyectos que se van a modificar con certeza. Si hay duda, preguntar antes.
3. **Idioma del código**: todos los test cases en **inglés**.
4. **Sin comentarios**: el código de los tests no debe llevar comentarios inline; el nombre del test debe ser suficientemente descriptivo.
5. **Una sola expectation por test case** (`expect(...).to ...` o equivalente). Si un escenario Gherkin tiene múltiples `Then`, dividirlo en varios `it`.
6. **Usar helpers y patrones del proyecto**: revisar tests existentes del mismo tipo (modelo, request, componente, store, job, servicio) y replicar su estilo, helpers y setup.
7. **No duplicar factories/fixtures**: reutilizar los que ya existen; si hace falta uno nuevo, crearlo siguiendo las convenciones del proyecto.
8. **Mantener DRY dentro del archivo de test**: extraer setup común a `let`, `before`, `shared_examples`, `setup()` o helpers locales, según el estándar del proyecto.
9. **No implementar la funcionalidad**: en esta fase solo se crean los tests; deben fallar (RED) si la funcionalidad aún no existe.
10. **Mostrar diff y listado**: al terminar, presentar un resumen de archivos creados y un diff claro antes de pedir aprobación para continuar.

## Formato de salida

### Fase 1 — Plan Gherkin

#### 1. Resumen de la tarea
- 2-3 frases sobre qué se debe lograr.

#### 2. Features identificadas
- Lista de features con su tag y propósito.

#### 3. Especificaciones Gherkin
- Bloques Gherkin completos por cada feature.

#### 4. Criterios de aceptación verificables
- Lista numerada de condiciones que deben cumplirse.

#### 5. Preguntas / Bloqueos / Riesgos
- Lo que falta aclarar antes de pasar a implementación.

#### 6. Siguientes pasos recomendados
- Pedir aprobación, modificación o sugerencias sobre el plan Gherkin.

### Fase 3 — Tests reales (tras aprobación)

#### 1. Resumen de conversión
- Tabla que mapee cada escenario Gherkin a su test case correspondiente (proyecto, archivo, línea aproximada, nombre del `it`).

#### 2. Archivos de test creados
- Ruta absoluta de cada archivo.
- Proyecto al que pertenece.
- Tipo de test (modelo, request, servicio, componente, store, job, etc.).

#### 3. Diff resumido
- Cambios introducidos (solo archivos nuevos en esta fase, no modificación de código de producción).

#### 4. Estado de los tests
- Comando recomendado para ejecutarlos.
- Si se ejecutaron, resultado esperado: **RED** (fallan porque la funcionalidad aún no existe).

#### 5. Siguientes pasos recomendados
- Iniciar implementación TDD o aprobación para continuar.

## Nota sobre contexto

Si `$ARGUMENTS` está vacío, asumir que el contexto completo está en el historial de conversación de esta sesión. En ese caso, sintetizar los requerimientos a partir de dicho historial en lugar de pedir más información.
