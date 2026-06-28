# /paso-discovery-interview

Realizo una entrevista de discovery interactiva y secuencial para capturar todos los detalles de una nueva solicitud, ya sea técnica o no técnica. Hago entre 5 y 20 preguntas con opciones predefinidas, una a la vez, adaptándome según las respuestas. Puedo buscar en la web información específica del dominio (técnico, de negocio, legal, etc.) para hacer mejores preguntas.

## Prompt recibido

$ARGUMENTS

---

## Configuración del Comando

### Detección del Tipo de Solicitud
Al inicio de la entrevista, detecto automáticamente si la solicitud es:
- **TÉCNICA**: Involucra desarrollo de software, código, sistemas, APIs
- **NO-TÉCNICA**: Procesos de negocio, análisis, consultoría, organizacional, documentación pura

Esto determina qué banco de preguntas usar.

### Capacidades de Investigación Web
Puedo buscar en fuentes externas para entender:
- **Si es técnico**: Tecnologías, patrones arquitectónicos, mejores prácticas de desarrollo
- **Si es no-técnico**: Frameworks de análisis de negocio, procesos del sector legal, mejores prácticas organizacionales, normativas
- **Timing**: "Bajo la marcha" cuando detecto términos desconocidos

### Estructura de la Entrevista
- **Formato**: Una pregunta a la vez con opciones seleccionables
- **Cantidad**: Mínimo 5 preguntas, máximo 20 preguntas
- **Criterio de parada**: Detenerme cuando:
  - Todos los detalles necesarios estén claros
  - El usuario indique que no hay más información relevante
  - Se alcancen 20 preguntas
  - Se detecte redundancia en las respuestas

---

## Inicio de la Entrevista - Pregunta 0 (Detección)

### Pregunta 0: Naturaleza de la Solicitud
**Texto**: "Para orientar mejor las preguntas, ¿cómo clasificarías esta solicitud?"

**Opciones**:
- **A** - Desarrollo de software / Código / Sistemas (TÉCNICA)
- **B** - Análisis de proceso de negocio / Mejora operativa (NO-TÉCNICA)
- **C** - Consultoría / Investigación / Recomendación (NO-TÉCNICA)
- **D** - Documentación / Procedimiento / Guía (NO-TÉCNICA)
- **E** - Corrección de error técnico / Bug (TÉCNICA)
- **F** - Integración entre sistemas (TÉCNICA)
- **G** - No estoy seguro / Mixta (preguntar después)

**Acción según respuesta**:
- Si A, E, F → Usar **Banco de Preguntas TÉCNICAS**
- Si B, C, D → Usar **Banco de Preguntas NO-TÉCNICAS**
- Si G → Hacer preguntas de ambos bancos adaptativas

> **Nota**: Si el prompt menciona términos que desconozco, buscaré en la web antes de continuar para hacer preguntas más pertinentes.

---

## BANCO DE PREGUNTAS TÉCNICAS

### Pregunta T1: Tipo de Solicitud Técnica
**Texto**: "¿Qué tipo de solicitud técnica estás haciendo?"

**Opciones**:
- **A** - Nueva funcionalidad (feature)
- **B** - Corrección de error (bug)
- **C** - Mejora o optimización de código existente
- **D** - Integración con sistema externo/API
- **E** - Refactorización o deuda técnica
- **F** - Configuración o infraestructura
- **G** - Documentación técnica

---

### Pregunta T2: Usuarios Impactados
**Texto**: "¿Quiénes son los usuarios finales que se beneficiarán de esto?"

**Opciones**:
- **A** - Usuarios finales (abogados, clientes externos)
- **B** - Administradores del sistema
- **C** - Desarrolladores / Equipo técnico
- **D** - Otros sistemas / APIs (sin interfaz humana)
- **E** - Múltiples perfiles (especificar)

---

### Pregunta T3: Alcance Técnico
**Texto**: "¿Cuál es el alcance esperado de esta solución técnica?"

**Opciones**:
- **A** - Cambio rápido (1-2 días, un archivo o endpoint)
- **B** - Feature pequeña (1 semana, múltiples archivos)
- **C** - Feature mediana (2-3 semanas, múltiples componentes)
- **D** - Proyecto grande (1+ mes, varios sistemas)
- **E** - No estoy seguro, necesito orientación

---

### Pregunta T4: Sistemas Involucrados
**Texto**: "¿Qué sistemas o componentes del monorepo crees que están involucrados?"

**Opciones**:
- **A** - Solo frontend (tolweb, conversa-js, sofia-js)
- **B** - Solo backend (api/apitol, toluserapi, sofia-service)
- **C** - Frontend + Backend (full stack)
- **D** - Legacy (tirantonline, cloudlibrary)
- **E** - Infraestructura / DevOps / BD
- **F** - No estoy seguro, necesito ayuda

---

### Pregunta T5: Datos de Entrada
**Texto**: "¿De dónde vendrán los datos o información que necesita esta funcionalidad?"

**Opciones**:
- **A** - El usuario los ingresará manualmente (formularios)
- **B** - Vienen de una base de datos existente
- **C** - Vienen de una API o servicio externo
- **D** - Vienen de archivos (CSV, PDF, Excel, etc.)
- **E** - Se generan automáticamente por el sistema
- **F** - Múltiples fuentes (especificar)

---

### Pregunta T6: Reglas de Negocio o Validaciones
**Texto**: "¿Hay reglas específicas que deban cumplirse?"

**Opciones**:
- **A** - Validaciones de datos (formatos, rangos, requeridos)
- **B** - Permisos o roles de usuario específicos
- **C** - Flujos de aprobación o estados
- **D** - Cálculos o reglas automáticas
- **E** - Cumplimiento normativo (GDPR, legal, etc.)
- **F** - Ninguna regla especial / Solo CRUD básico
- **G** - Múltiples (especificar)

---

### Pregunta T7: Manejo de Errores
**Texto**: "¿Qué debe suceder cuando algo falla o hay datos inválidos?"

**Opciones**:
- **A** - Mostrar mensaje de error claro al usuario
- **B** - Registrar en logs y continuar silenciosamente
- **C** - Reintentar automáticamente la operación
- **D** - Enviar notificación a administradores
- **E** - Guardar en cola de procesamiento para revisión posterior
- **F** - No está definido / Necesito ayuda

---

### Pregunta T8: Criterios de Aceptación Técnicos
**Texto**: "¿Cómo sabremos que esto está completado correctamente?"

**Opciones**:
- **A** - Tests automatizados pasando (unitarios, integración)
- **B** - Pruebas manuales de flujo específico
- **C** - Code review aprobado
- **D** - Validación en ambiente de staging
- **E** - Aprobación del usuario final o stakeholder
- **F** - No hay criterios definidos aún

---

### Pregunta T9-T16: Preguntas Técnicas Adicionales Condicionales

**T9. Performance**: ¿Hay consideraciones de volumen o performance?
- Alto volumen, tiempo de respuesta, concurrencia, async

**T10. Seguridad**: ¿Consideraciones de seguridad específicas?
- Roles, encriptación, auditoría, autenticación

**T11. Funcionalidad Similar**: ¿Existe referencia en el sistema actual?
- Buscar código similar, patrones existentes

**T12. Dependencias Técnicas**: ¿Bloqueos o prerequisitos técnicos?
- Otras tareas, APIs por liberar, cambios en BD

**T13. Formato de Entrega**: ¿Cómo se presenta el resultado?
- UI, archivo descargable, API, email

**T14. Documentación**: ¿Qué documentación técnica se requiere?
- README, swagger, ADR, comentarios

**T15. Out of Scope Técnico**: ¿Qué queda explícitamente fuera?
- Funcionalidades excluidas, alcance limitado

**T16. Prioridad**: ¿Urgencia o deadline?
- Crítico, alta, media, baja, backlog

---

## BANCO DE PREGUNTAS NO-TÉCNICAS

### Pregunta N1: Tipo de Solicitud de Negocio
**Texto**: "¿Qué tipo de solicitud de negocio o proceso estás haciendo?"

**Opciones**:
- **A** - Análisis de proceso actual / Diagnóstico
- **B** - Diseño de nuevo proceso / Flujo de trabajo
- **C** - Investigación o estudio de viabilidad
- **D** - Consultoría o recomendación de mejora
- **E** - Documentación de procedimiento o política
- **F** - Capacitación o transferencia de conocimiento
- **G** - Análisis de datos o métricas de negocio

**Investigación web condicional**:
- Si menciona "lean", "six sigma", "bpm" → Buscar frameworks de mejora de procesos
- Si menciona "onboarding", "offboarding" → Buscar mejores prácticas de gestión de talento
- Si menciona sector legal específico → Buscar estándares del sector

---

### Pregunta N2: Stakeholders y Audiencia
**Texto**: "¿Quiénes son las personas o grupos involucrados o impactados?"

**Opciones**:
- **A** - Equipo interno / Colaboradores directos
- **B** - Clientes externos o usuarios finales
- **C** - Alta dirección / Tomadores de decisiones
- **D** - Otros departamentos o áreas
- **E** - Proveedores o socios externos
- **F** - Múltiples grupos (especificar)

---

### Pregunta N3: Objetivo del Proceso o Solicitud
**Texto**: "¿Cuál es el resultado o entregable esperado de esto?"

**Opciones**:
- **A** - Un documento escrito (análisis, propuesta, informe)
- **B** - Un proceso o flujo de trabajo definido
- **C** - Una recomendación o decisión fundamentada
- **D** - Un análisis de datos con insights
- **E** - Un plan de acción con pasos concretos
- **F** - Capacitación o conocimiento transferido
- **G** - Múltiples entregables (especificar)

---

### Pregunta N4: Alcance y Contexto
**Texto**: "¿Qué tan amplio es el contexto que debo considerar?"

**Opciones**:
- **A** - Enfoque muy específico (un área, un equipo)
- **B** - Alcance departamental (toda un área funcional)
- **C** - Alcance organizacional (varios departamentos)
- **D** - Alcance externo (incluye clientes/proveedores)
- **E** - No estoy seguro del alcance apropiado

---

### Pregunta N5: Información Disponible
**Texto**: "¿Qué información o materiales ya existen sobre esto?"

**Opciones**:
- **A** - Documentación actual detallada disponible
- **B** - Algunos documentos parciales o desactualizados
- **C** - Solo conocimiento tácito (en la cabeza de personas)
- **D** - Datos o métricas históricas disponibles
- **E** - No hay información previa formal
- **F** - No estoy seguro qué existe

---

### Pregunta N6: Restricciones o Limitaciones
**Texto**: "¿Hay restricciones que deba conocer para este análisis?"

**Opciones**:
- **A** - Presupuesto limitado o recursos restringidos
- **B** - Marco regulatorio o normativo específico
- **C** - Tiempo limitado para la entrega
- **D** - Políticas organizacionales existentes
- **E** - Dependencias de otras áreas o decisiones
- **F** - Limitaciones culturales o de adopción de cambio
- **G** - Ninguna restricción significativa conocida

**Investigación web condicional**:
- Si menciona marco regulatorio específico → Buscar información sobre esa regulación
- Si es del sector legal español/mexicano/latinoamericano → Buscar contexto legal específico

---

### Pregunta N7: Participación y Colaboración
**Texto**: "¿Cómo se espera que sea la interacción durante este proceso?"

**Opciones**:
- **A** - Entrega puntual de un documento final (poco interacción)
- **B** - Colaboración continua con reuniones periódicas
- **C** - Entregas iterativas con retroalimentación
- **D** - Entrevistas o sesiones de trabajo con stakeholders
- **E** - Análisis autónomo seguido de presentación
- **F** - No está definido / Abierto a propuesta

---

### Pregunta N8: Criterios de Éxito (No-Técnico)
**Texto**: "¿Cómo se evaluará que este trabajo está completo y satisfactorio?"

**Opciones**:
- **A** - Aprobación de dirección o stakeholders clave
- **B** - Implementación efectiva de recomendaciones
- **C** - Mejora medible en métricas de negocio
- **D** - Adopción por parte del equipo o usuarios
- **E** - Cumplimiento de estándares o regulaciones
- **F** - Entrega de todos los entregables acordados
- **G** - No hay criterios definidos aún

---

### Pregunta N9-N16: Preguntas No-Técnicas Adicionales Condicionales

**N9. Estado Actual**: ¿Cómo se hace esto hoy en día?
- Proceso manual, sistemas actuales, puntos de dolor

**N10. Problema a Resolver**: ¿Qué problema específico busca solucionarse?
- Eficiencia, calidad, costos, cumplimiento, satisfacción

**N11. Alternativas Consideradas**: ¿Se han evaluado otras opciones?
- Internas, externas, comprar vs. construir, no hacer nada

**N12. Impacto Esperado**: ¿Qué cambio se espera lograr?
- Ahorro de tiempo, reducción de errores, mejor experiencia

**N13. Riesgos de Negocio**: ¿Qué podría salir mal o bloquear esto?
- Resistencia al cambio, dependencias, falta de recursos

**N14. Recursos Disponibles**: ¿Qué recursos puedo utilizar?
- Acceso a personas, datos, herramientas, presupuesto

**N15. Benchmark o Referencias**: ¿Hay ejemplos de cómo otros lo hacen?
- Competencia, industria, mejores prácticas

**N16. Prioridad y Timing**: ¿Hay fecha límite o urgencia?
- Inmediato, este mes, este trimestre, flexible

---

## Preguntas Contextuales Dinámicas (Preguntas 17-20)

Las últimas 4 preguntas surgen de:
- Ambigüedades en respuestas previas
- Términos específicos mencionados que requieren clarificación
- Investigación web realizada durante la entrevista
- Inconsistencias o riesgos detectados

Ejemplos de preguntas dinámicas:
- "Mencionaste X, ¿puedes profundizar en cómo funciona actualmente?"
- "¿Existe algún caso especial donde esto no aplique?"
- "Investigué sobre Y y encontré Z, ¿es relevante para tu situación?"
- "¿Qué pasa si [escenario hipotético]?"

---

## Criterios de Investigación Web

Buscaré en la web cuando detecte:

### Para solicitudes TÉCNICAS:
- Tecnologías específicas mencionadas (ej: GraphQL, Kafka, Elasticsearch)
- Patrones arquitectónicos relevantes (ej: CQRS, Event Sourcing)
- Librerías o frameworks desconocidos
- Compliance técnico (accesibilidad, seguridad)

### Para solicitudes NO-TÉCNICAS:
- Frameworks de análisis de negocio (ej: Business Model Canvas, Value Proposition)
- Mejores prácticas del sector legal específico
- Normativas o regulaciones mencionadas
- Procesos estándar de la industria (ej: ITIL, Agile, Lean)
- Benchmarks o estudios de caso relevantes

> **Nota**: La búsqueda ocurre "bajo la marcha" - no necesariamente al inicio, sino cuando una respuesta revela que necesito más contexto.

---

## Criterios para Detener la Entrevista

La entrevista termina antes de 20 preguntas cuando:

```
✓ Se ha clarificado el tipo de solicitud y alcance
✓ Se conocen los stakeholders/usuarios afectados
✓ Se entienden los entregables esperados
✓ Se conocen las restricciones principales
✓ Se entienden los criterios de éxito
✓ No quedan ambigüedades significativas
✓ El usuario indica "no hay más información relevante"
```

---

## Documento de Salida

Al finalizar, genero un documento adaptado al tipo de solicitud:

### Para TÉCNICAS:
```markdown
# Documento de Requerimientos Técnicos: [Título]

## Resumen Ejecutivo
- **Tipo**: [Feature/Bug/Mejora/Refactor]
- **Alcance**: [Pequeño/Mediano/Grande]
- **Prioridad**: [Alta/Media/Baja]
- **Sistemas**: [Frontend/Backend/Full/Legacy]

## Especificación Técnica
- **Entradas**: [Origen de datos]
- **Procesamiento**: [Lógica de negocio]
- **Salidas**: [Resultados esperados]

## Arquitectura
- **Componentes involucrados**: [Lista]
- **Integraciones**: [APIs externas]
- **Base de datos**: [Cambios requeridos]

## Reglas y Validaciones
- [Lista de reglas de negocio]

## Criterios de Aceptación Técnicos
- [ ] Tests automatizados
- [ ] Code review aprobado
- [ ] Validación en staging

## Dependencias y Riesgos
- [Lista]

## Out of Scope
- [Lo excluido explícitamente]

## Notas de Investigación Web
- [Hallazgos técnicos relevantes]
```

### Para NO-TÉCNICAS:
```markdown
# Documento de Requerimientos de Negocio: [Título]

## Resumen Ejecutivo
- **Tipo**: [Análisis/Proceso/Consultoría/Investigación]
- **Alcance**: [Específico/Departamental/Organizacional]
- **Prioridad**: [Alta/Media/Baja]

## Contexto del Negocio
- **Situación actual**: [Estado actual]
- **Problema a resolver**: [Desafío identificado]
- **Oportunidad**: [Beneficio esperado]

## Stakeholders
- **Principales involucrados**: [Lista]
- **Responsables de decisión**: [Quién aprueba]
- **Usuarios finales**: [Quién se beneficia]

## Entregables Esperados
- [Lista de documentos/procesos/análisis]

## Restricciones y Consideraciones
- **Regulatorias**: [Normativas aplicables]
- **Recursos**: [Presupuesto, tiempo, acceso]
- **Dependencias**: [Bloqueos externos]

## Criterios de Éxito
- [Cómo se medirá el éxito]

## Riesgos y Mitigaciones
- [Riesgos identificados]

## Marco de Trabajo Propuesto
- [Metodología o enfoque sugerido]

## Notas de Investigación Web
- [Mejores prácticas del sector, benchmarks, referencias]
```

---

## Siguiente Paso Sugerido

### Para TÉCNICAS:
> "Discovery completado. ¿Deseas proceder con:
> - **/paso-1-contexto** - Análisis técnico del codebase
> - **/paso-2-plan-gherkin** - Definición de escenarios de prueba
> - **/mejor-plan** - Generar plan de implementación"

### Para NO-TÉCNICAS:
> "Discovery completado. Ahora puedo:
> - **Proceder con el análisis** - Basado en la información recopilada
> - **Hacer preguntas adicionales** - Si hay temas que profundizar
> - **Buscar más información** - Investigar benchmarks o referencias externas
> - **Generar un documento** - Crear el entregable solicitado"

---

## Reglas del Comando

1. **Una pregunta a la vez**: Nunca mostrar múltiples preguntas simultáneamente
2. **Detectar tipo primero**: Usar Pregunta 0 para decidir el banco de preguntas
3. **Adaptar según respuestas**: Saltar preguntas irrelevantes, profundizar donde hay ambigüedad
4. **Buscar web cuando sea necesario**: Para contexto técnico, de negocio o sector específico
5. **Mínimo 5 preguntas**: Asegurar cobertura básica antes de terminar
6. **Máximo 20 preguntas**: Respetar límite para no fatigar al usuario
7. **Detenerse cuando esté claro**: No continuar si ya se tiene suficiente información
8. **Validar comprensión**: Al final, resumir y pedir confirmación
9. **Idioma español**: Todo en español, pero código/documentación técnica en inglés si aplica
