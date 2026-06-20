# /paso-6-cierre-consciente

Cierra la sesión de trabajo de forma consciente generando un **resumen ejecutivo** de lo logrado y lo técnicamente más notable. Ese resumen se publica como comentario en la tarjeta del sistema de seguimiento (Jira, Azure DevOps, Linear, etc.) usando el MCP si es posible. Si no se puede publicar automáticamente, se sugiere al usuario que lo pegue manualmente. Además, se incluyen **5 sugerencias de testeo manual** para los reviewers de la funcionalidad.

## Prompt / Contexto de la tarea

$ARGUMENTS

---

## Objetivo

Finalizar la tarea dejando constancia clara y útil para el equipo:

1. Resumir lo más importante logrado con los cambios.
2. Destacar lo técnicamente más notable a tener en cuenta (riesgos, decisiones, dependencias, deuda técnica).
3. Publicar ese resumen como comentario en la tarjeta del sistema de seguimiento asociada, si se conoce y el MCP está disponible.
4. Si no es posible publicar automáticamente, entregar el texto listo para que el usuario lo pegue manualmente.
5. Sugerir 5 instrucciones de testeo manual para los reviewers.
6. Dejar la tarea lista para que el usuario decida commitear, pushear o pasar a revisión humana.

## Precondiciones

1. Los pasos anteriores deberían haber dejado la funcionalidad implementada, tests unitarios en GREEN y pruebas funcionales revisadas.
2. Debe existir una clave de ticket en el contexto de la sesión, o el usuario debe proporcionarla.
3. El entorno debe permitir publicar comentarios en el sistema de seguimiento mediante el MCP, o el usuario debe estar dispuesto a hacerlo manualmente.

## Fases del comando

### Fase 0 — Recopilar contexto del cierre

1. Identificar del historial de la sesión:
   - Clave de ticket asociada.
   - Título y descripción de la funcionalidad implementada.
   - Proyectos afectados del repositorio.
   - Archivos de implementación y tests creados o modificados.
   - Decisiones técnicas importantes tomadas durante el TDD o el code review.
   - Riesgos, deuda técnica o puntos de atención.
   - Estado final de las suites de tests.
   - Resultado de pruebas funcionales manuales.

2. Si no se conoce la clave del ticket, preguntar al usuario:
   - `¿Cuál es la clave del ticket asociado?`
   - Si no hay ticket, ofrecer generar solo el resumen en texto plano.

### Fase 1 — Redactar resumen ejecutivo

El resumen debe ser breve, claro y útil para reviewers, QA y stakeholders. Estructura sugerida:

```markdown
## Resumen de cambios

- Funcionalidad implementada en una oración.
- Proyectos afectados.
- Archivos o áreas principales tocadas.

## Lo técnicamente más notable

- Decisiones clave y su justificación.
- Riesgos o dependencias introducidas.
- Deuda técnica o puntos a revisar en el futuro.
- Consideraciones de performance, seguridad o compatibilidad.

## Tests

- Suites ejecutadas y estado final.
- Nuevos tests unitarios añadidos.

## Instrucciones de testeo manual para reviewers

1. ...
2. ...
3. ...
4. ...
5. ...
```

Reglas para el resumen:

- Máximo 2-3 párrafos en cada sección.
- Lenguaje claro, sin jerga innecesaria.
- Enfocado en lo que un reviewer o QA necesita saber.
- Si hay deuda técnica, mencionarla con honestidad.
- Si un cambio es sensible (seguridad, permisos, datos), destacarlo explícitamente.

### Fase 2 — Sugerir 5 instrucciones de testeo manual

Generar exactamente 5 sugerencias de pruebas manuales para los reviewers. Deben cubrir:

1. **Happy path principal**: el flujo normal de uso de la funcionalidad.
2. **Caso límite de datos**: entrada inválida, vacía, extrema o inesperada.
3. **Permisos / autenticación / autorización**: acceso con usuarios sin permisos o sesiones inválidas.
4. **Error o fallo controlado**: cómo se comporta la funcionalidad ante un error (servicio externo caído, validación fallida, timeout).
5. **Integración o efecto colateral**: verificar que el cambio no rompa una funcionalidad adyacente o que los datos persistan/actualicen correctamente en otro sistema.

Cada instrucción debe incluir:

- Precondiciones.
- Pasos concretos.
- Resultado esperado.
- Nota técnica si aplica (endpoint, pantalla, job, etc.).

### Fase 3 — Publicar en el sistema de seguimiento

1. **Si se conoce la clave del ticket**:
   - Usar el MCP del sistema de seguimiento (por ejemplo, `mcp__jira__jira_add_comment` si está disponible) para publicar el resumen como comentario.
   - El cuerpo del comentario debe estar en Markdown.
   - Confirmar al usuario que se publicó correctamente, incluyendo el ID o enlace del comentario si está disponible.

2. **Si no se conoce la clave del ticket o el MCP no responde**:
   - Mostrar el texto completo del resumen al usuario.
   - Sugerir que lo pegue manualmente como comentario en el ticket correspondiente.
   - No intentar publicar sin clave válida.

3. **Si el MCP falla al publicar**:
   - Reportar el error claramente.
   - Entregar el texto listo para copiar y pegar.
   - No reintentar indefinidamente sin autorización del usuario.

### Fase 4 — Cierre final

1. Presentar al usuario un resumen mínimo final:
   - Funcionalidad entregada.
   - Estado de tests.
   - Resumen publicado en el sistema de seguimiento (o instrucciones para pegarlo).
   - Próximos pasos sugeridos (commit, push, MR/PR, revisión humana, QA).

2. Preguntar si desea:
   - Finalizar la sesión.
   - Continuar con otro comando.
   - Realizar commit/push manual (no automatizar sin aprobación).

## Reglas

1. **No modificar código en este paso**: solo resumir y publicar.
2. **Clave de ticket**: si no se conoce, preguntar antes de intentar publicar.
3. **Resumen honesto**: no ocultar deuda técnica, riesgos o decisiones discutibles.
4. **5 sugerencias de testeo manual**: exactamente cinco, cubriendo happy path, datos límite, permisos, error controlado e integración.
5. **Markdown claro**: usar formato que el sistema de seguimiento renderice bien (encabezados, listas, negritas).
6. **Idioma**: la comunicación con el usuario debe ser en el idioma en que se solicite la tarea. El resumen para el ticket puede estar en español o inglés según la convención del equipo.
7. **No reintentar publicación sin autorización**: si falla la publicación, entregar el texto al usuario.
8. **No commitear ni pushear**: el cierre es informativo; la acción final queda en manos del usuario.
9. **No ignorar errores**: si falla la publicación en el sistema de seguimiento, reportarlo y ofrecer la alternativa manual.

## Formato de salida

### 1. Resumen ejecutivo generado

```markdown
## Resumen de cambios
...

## Lo técnicamente más notable
...

## Tests
...

## Instrucciones de testeo manual para reviewers

1. ...
2. ...
3. ...
4. ...
5. ...
```

### 2. Estado de publicación en el sistema de seguimiento

- Publicado como comentario en `[CLAVE-TICKET]` con éxito.
- O: No se pudo publicar; copiar y pegar manualmente.
- O: No se conoció la clave del ticket; proporcionarla para publicar.

### 3. Cierre final

- Funcionalidad lista.
- Tests en GREEN.
- Siguiente paso sugerido.
- Decisión del usuario.

## Nota sobre contexto

Si `$ARGUMENTS` está vacío, usar el historial completo de la conversación actual para construir el resumen. Si no se encuentra una clave de ticket, pedirla explícitamente al usuario antes de continuar.
