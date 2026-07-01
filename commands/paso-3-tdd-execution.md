# /paso-3-tdd-execution

Ejecuta un ciclo TDD estricto usando los tests creados en el paso anterior (`paso-2-plan-gherkin`). Se resuelve **un test case a la vez**, en modo semáforo RED → GREEN, pausando entre cada uno para explicar el diff, su justificación técnica y obtener aprobación explícita del usuario antes de continuar con el siguiente. Al final se ejecuta la suite completa de cada proyecto afectado.

## Prompt / Contexto de la tarea

$ARGUMENTS

---

## Objetivo

Tomar los archivos de test generados en `paso-2-plan-gherkin` y, aplicando TDD puro, implementar la funcionalidad mínima necesaria para que cada test pase. Se trabaja **un solo test case por iteración**, verificando RED, alcanzando GREEN y deteniéndose a explicar antes de seguir. Al completar todos, se corre la suite completa de los proyectos afectados.

## Precondiciones

1. Los tests creados en el paso anterior deben existir y estar listados.
2. El usuario debe haber aprobado previamente el plan Gherkin y los test cases.
3. Debe haber un mapeo claro de qué test case cubre qué escenario Gherkin.

## Fases del comando

### Fase 0 — Preparación

1. Identificar los proyectos afectados y los archivos de test creados en el paso anterior.
2. Verificar que los tests existen y son ejecutables.
3. Ejecutar el/los test(s) creados para confirmar que fallan (RED inicial).
4. Presentar al usuario:
   - Lista de test cases pendientes ordenados por prioridad lógica (happy path primero, luego casos límite).
   - Comando para ejecutar el test actual.
   - Resultado RED inicial.
5. Pedir confirmación para comenzar con el primer test case.

### Fase 1 — Ciclo RED/GREEN por test case

Para cada test case, repetir:

#### 1.1 RED

- Ejecutar únicamente el test case actual.
- Capturar y mostrar el mensaje de fallo.
- Confirmar con el usuario que la falla es la esperada y que se entiende qué hay que implementar.

#### 1.2 Implementar GREEN

- Escribir el código mínimo y necesario para que el test pase.
- Respetar los principios SOLID y DRY del proyecto.
- No añadir funcionalidad extra no cubierta por el test actual.
- Mantener el idioma del código en **inglés** y evitar comentarios inline salvo que la complejidad lo justifique.

#### 1.3 GREEN

- Volver a ejecutar el test case actual.
- Confirmar que pasa.
- Si sigue fallando, iterar hasta alcanzar GREEN.

#### 1.4 Pausa / Diff / Justificación

- Mostrar el diff de los cambios introducidos en esta iteración.
- Explicar la justificación técnica:
  - Qué se implementó y por qué.
  - Qué principios o patrones se siguieron.
  - Qué decisiones se tomaron y por qué.
  - Si se reutilizó código existente, helpers, servicios o componentes.
  - Riesgos o deuda técnica si aplica.
- Pedir al usuario una de estas opciones:
  - **aprobar**: continuar con el siguiente test case.
  - **continuar**: sin cambios, avanzar al siguiente.
  - **refactor**: permitir una mejora adicional antes de continuar (solo si mejora calidad sin cambiar comportamiento).
  - **revisar**: el usuario quiere revisar o modificar algo antes de seguir.

**No avanzar al siguiente test case sin confirmación explícita del usuario.**

### Fase 2 — Refactor opcional

Si el usuario solicita refactor tras GREEN:

1. Aplicar mejoras de calidad sin cambiar el comportamiento observable.
2. Mantener GREEN en todo momento.
3. Mostrar diff y justificación.
4. Pedir aprobación para continuar.

### Fase 3 — Suite completa

Una vez todos los test cases creados en `paso-2-plan-gherkin` pasen en GREEN:

1. Ejecutar la suite completa de cada proyecto afectado:
   - **Ruby/Rails**: `bundle exec rspec` o el comando definido en el proyecto (`make test`).
   - **Vue.js/JavaScript**: `yarn test` o `npm test` según el proyecto.
2. Si algún test falla:
   - Analizar si la regresión fue introducida por los cambios de esta tarea.
   - Corregir antes de declarar la fase terminada.
3. Si hay tests previos que fallan por causas ajenas, reportarlo claramente y pedir decisión al usuario.

## Reglas

1. **Un test case a la vez**: nunca implementar dos tests simultáneamente. Cada ciclo debe ser atómico.
2. **RED confirmado**: siempre ejecutar el test antes de escribir código y verificar que falla por la razón esperada.
3. **Mínimo código para GREEN**: no adelantar funcionalidad futura. Resolver solo lo que el test actual exige.
4. **Idioma del código**: todo el código de implementación en **inglés**. La comunicación con el usuario debe ser en el idioma en que se solicite la tarea.
5. **Sin comentarios inline**: el nombre de métodos, variables y tests debe ser suficientemente descriptivo.
6. **Aprobación humana entre tests**: el usuario controla el ritmo. Nunca saltar al siguiente test sin su OK.
7. **Diff obligatorio después de GREEN**: cada iteración termina mostrando el diff y una explicación técnica.
8. **Suite completa al final**: no dar por terminada la tarea sin correr todos los tests del proyecto afectado.
9. **No commitear ni pushear**: esta fase termina con el código listo para QA manual, no se sube automáticamente.
10. **No ignorar errores**: si un test falla inesperadamente, un comando falla o hay ambigüedad, detenerse y reportar.

## Comandos de test por proyecto

| Tecnología | Tipo | Comando recomendado |
|------------|------|---------------------|
| Ruby/Rails | Ruby | `bundle exec rspec --fail-fast` |
| Vue.js/JavaScript | Jest | `yarn test --maxWorkers=1` |
| Node.js genérico | Jest | `yarn test` o `npm test` |
| Python | pytest | `pytest -x` |
| Go | go test | `go test ./...` |
| Otros | - | Usar el comando definido en el proyecto (`make test`, `npm test`, etc.). |

> Si el proyecto usa Docker, usar docker exec, y usar --fail-fast si es rspec. Para Jest, usar --maxWorkers=1 para evitar problemas de concurrencia.

## Formato de salida por iteración

### Iteración N — Nombre del test case

#### 1. Estado RED
- Comando ejecutado.
- Salida resumida del fallo.

#### 2. Implementación GREEN
- Archivos modificados.
- Decisiones técnicas clave.

#### 3. Diff
- Diff completo o resumido de la iteración.

#### 4. Justificación técnica
- Por qué se tomó cada decisión.
- Patrones aplicados.
- Reutilización de código existente.

#### 5. Próximo paso
- Preguntar al usuario: `¿Aprobar, continuar, refactor o revisar?`.

## Formato de salida final

### 1. Resumen del ciclo TDD
- Total de test cases.
- Test cases implementados.
- Iteraciones de refactor si las hubo.

### 2. Archivos modificados / creados
- Lista de archivos de implementación y tests.

### 3. Suite completa
- Proyectos ejecutados.
- Resultado global (pass / fail).
- Regresiones detectadas y corregidas.

### 4. Riesgos o deuda técnica
- Cosas que quedaron pendientes, hacks temporales o puntos a revisar en QA manual.

### 5. Siguientes pasos recomendados
- QA manual.
- Revisión de código.
- Commitear y pushear manualmente.

## Nota sobre contexto

Si `$ARGUMENTS` está vacío, usar el historial de la conversación actual para identificar los test cases creados en `paso-2-plan-gherkin` y los proyectos afectados.
