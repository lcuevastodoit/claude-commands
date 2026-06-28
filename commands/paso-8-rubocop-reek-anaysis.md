# Paso 8 - Análisis RuboCop + Reek

Realiza un análisis estático de calidad de código combinando reglas de RuboCop y detección de code smells tipo Reek sobre archivos Ruby.

## Uso

- Analizar un archivo: `/paso-8-rubocop-reek-anaysis app/services/mi_servicio.rb`
- Analizar una carpeta: `/paso-8-rubocop-reek-anaysis app/services/`
- Analizar diff de una rama: `/paso-8-rubocop-reek-anaysis --diff main..feature-branch`

## Pasos de ejecución

### 1. Determinar modo de análisis

Analiza el argumento recibido:
- Si contiene `--diff` o `..` → Modo diff entre ramas
- Si termina en `.rb` → Modo archivo individual
- Si es una ruta de directorio → Modo carpeta
- Si no hay argumento → Usar `git diff --name-only` de la rama actual

### 2. Recopilar archivos objetivo

Según el modo:

**Modo archivo:**
- Verificar que el archivo existe
- Verificar que tiene extensión `.rb`
- Agregar a lista de archivos a analizar

**Modo carpeta:**
- Usar `find` o `glob` para listar todos los archivos `.rb` recursivamente
- Filtrar archivos en `vendor/`, `tmp/`, `spec/` (opcional, según flags)

**Modo diff:**
- Ejecutar `git diff --name-only <rama-base>..<rama-compare>`
- Filtrar solo archivos `.rb`
- Verificar que los archivos existen en el working tree

### 3. Ejecutar RuboCop

Para cada archivo o en batch:

```bash
bundle exec rubocop <archivo(s)> --format json --force-default-config
```

Si RuboCop no está disponible:
- Intentar con `docker compose run --rm <servicio> bundle exec rubocop ...`
- O fallback a análisis manual de reglas comunes

Procesar salida JSON para extraer:
- Archivo
- Línea y columna
- Nivel (error, warning, convention, refactor)
- Código de regla (ej: `Style/FrozenStringLiteralComment`)
- Mensaje

### 4. Ejecutar análisis tipo Reek

Como Reek puede no estar instalado, simular su comportamiento buscando:

**Code Smells a detectar:**

| Smell | Patrón a buscar | Indicador |
|-------|-----------------|-----------|
| **Simulated Polymorphism** | Múltiples `if/else` o `case` basados en el mismo atributo | `if params[:type] == 'x'` repetido |
| **Control Parameter** | Parámetros que controlan flujo con `if` | Parámetro booleano o string usado en condicional |
| **Long Parameter List** | Métodos con >4 parámetros | Contar parámetros en definición |
| **Utility Function** | Métodos que no usan `self` ni instancia | Métodos privados puros |
| **Feature Envy** | Acceso repetido a atributos de otro objeto | Múltiples llamadas a `otro_obj.attr` |
| **Duplicate Method Call** | Misma llamada repetida en método | `obj.metodo` llamado >1 vez |
| **Instance Variable Assumption** | Uso de `@var` sin inicialización visible | `@var` en método sin asignación previa |
| **Nil Check** | Uso de `&.` o `try` o `unless nil?` | Defensive programming excesivo |
| **Too Many Statements** | Métodos con >10 líneas | Contar líneas no vacías |
| **Uncommunicative Name** | Nombres de 1 letra o con typos | Variables/métodos de 1 char o con `_` innecesario |

**Técnicas de detección:**
- Parseo básico con regex para identificar patrones
- Conteo de líneas por método
- Identificación de condicionales anidados
- Detección de asignaciones de instancia

### 5. Clasificar hallazgos

Agrupar por severidad:

**🔴 Críticos (RuboCop: error / Reek: Simulated Polymorphism, Long Parameter >6)**
- Bugs potenciales o violaciones graves de diseño

**🟠 Altos (RuboCop: warning / Reek: Control Parameter, Feature Envy)**
- Problemas de mantenibilidad significativos

**🟡 Medios (RuboCop: convention / Reek: Duplicate Method Call, Nil Check)**
- Desviaciones de estilo o code smells menores

**🟢 Bajos (RuboCop: refactor, info / Reek: Uncommunicative Name)**
- Sugerencias opcionales

### 6. Presentar resultados

Formato de salida:

```
## Análisis de Calidad de Código

### Resumen
| Métrica | Valor |
|---------|-------|
| Archivos analizados | N |
| Hallazgos Críticos | N |
| Hallazgos Altos | N |
| Hallazgos Medios | N |
| Hallazgos Bajos | N |

### Hallazgos por archivo

#### 🔴 Críticos
| Archivo | Línea | Tipo | Herramienta | Problema | Sugerencia |
|---------|-------|------|-------------|----------|------------|
| `path/to/file.rb` | 15 | Long Parameter List | Reek | Método con 6 parámetros | Usar objeto de parámetros |

#### 🟠 Altos
...

#### 🟡 Medios
...

#### 🟢 Bajos
...

### Archivos sin hallazgos
- `clean/file.rb` ✅
```

### 7. Recomendaciones finales

- Listar archivos que requieren atención inmediata
- Sugerir prioridad de correcciones
- Proponer refactorizaciones si aplica

## Notas técnicas

- Respetar configuración de RuboCop del proyecto (`.rubocop.yml`)
- Para análisis tipo Reek sin la herramienta, usar heurísticas conservadoras
- No modificar archivos, solo reportar
- Ignorar archivos de vendor, gems, y configuración
