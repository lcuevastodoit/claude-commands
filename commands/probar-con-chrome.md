# /probar-con-chrome

Prueba aplicaciones web usando Chrome DevTools MCP de forma sistemática y reproducible.

## Uso

```
/probar-con-chrome [url] [acciones]
```

## Proceso Técnico

### 1. Verificación del Servicio

Antes de usar Chrome DevTools, verifica que el servicio esté disponible:

```bash
# Verificar puerto en uso
lsof -i :PUERTO | grep LISTEN

# Verificar contenedor Docker (si aplica)
docker ps --filter "name=CONTAINER_NAME"
```

### 2. Iniciar Chrome (si es necesario)

Si Chrome no está corriendo con remote debugging:

```bash
open -a "Google Chrome" --args --remote-debugging-port=9222 --no-first-run --no-default-browser-check --user-data-dir=/tmp/chrome-devtools-profile
```

Verifica que esté listo:
```bash
curl -s http://127.0.0.1:9222/json/version
```

### 3. Navegar a la Aplicación

Usa `mcp__chrome-devtools__navigate_page` para cargar la URL:

```json
{
  "type": "url",
  "url": "http://localhost:PUERTO",
  "timeout": 30000
}
```

### 4. Analizar la Estructura

Toma un snapshot para ver los elementos interactivos:

```json
{
  "tool": "mcp__chrome-devtools__take_snapshot"
}
```

**Campos importantes en el snapshot:**
- `uid`: Identificador único del elemento
- `focusable`: Indica si se puede interactuar
- `placeholder`: Texto placeholder en inputs
- `value`: Valor actual del elemento

### 5. Esperar Estados Específicos

Si la app necesita tiempo para cargar (modelos, datos, etc.):

```json
{
  "tool": "mcp__chrome-devtools__wait_for",
  "text": ["texto-esperado", "Ready", "Cargado"],
  "timeout": 120000
}
```

### 6. Interactuar con Elementos

#### Escribir en un campo de texto:
```json
{
  "tool": "mcp__chrome-devtools__fill",
  "uid": "ID_DEL_ELEMENTO",
  "value": "texto a escribir"
}
```

#### Hacer clic en un botón:
```json
{
  "tool": "mcp__chrome-devtools__click",
  "uid": "ID_DEL_BOTON"
}
```

#### Presionar teclas especiales:
```json
{
  "tool": "mcp__chrome-devtools__press_key",
  "key": "Enter"
}
```

### 7. Verificar Respuestas

Después de una acción, espera y verifica el resultado:

```json
{
  "tool": "mcp__chrome-devtools__wait_for",
  "text": ["palabra1", "palabra2", "resultado-esperado"],
  "timeout": 60000
}
```

Toma otro snapshot para leer el contenido generado.

### 8. Capturar Evidencia

#### Screenshot:
```json
{
  "tool": "mcp__chrome-devtools__take_screenshot",
  "fullPage": true,
  "filePath": "/ruta/evidencia.png"
}
```

#### Logs de consola:
```json
{
  "tool": "mcp__chrome-devtools__list_console_messages"
}
```

Para ver un mensaje específico:
```json
{
  "tool": "mcp__chrome-devtools__get_console_message",
  "msgid": 1
}
```

#### Network requests:
```json
{
  "tool": "mcp__chrome-devtools__list_network_requests"
}
```

### 9. Validar Resultados

Verifica:
1. **Visualmente**: Screenshots del estado final
2. **En logs**: Mensajes de consola relevantes
3. **En DOM**: Contenido de elementos específicos via snapshot
4. **Network**: Requests/responses de APIs

## Patrones Comunes

### Formulario de Login
```
1. snapshot → encontrar uid de username, password, submit
2. fill(username_uid, "usuario")
3. fill(password_uid, "contraseña")
4. click(submit_uid)
5. wait_for(["Bienvenido", "Dashboard"])
6. screenshot
```

### Chat/Mensajería
```
1. wait_for(["placeholder del input"])
2. fill(input_uid, "mensaje")
3. click(send_uid) o press_key("Enter")
4. wait_for(["palabras esperadas en respuesta"])
5. snapshot para leer respuesta completa
6. screenshot + console logs
```

### Carga de Archivos
```
1. snapshot → encontrar input type=file
2. upload_file(input_uid, "/ruta/archivo")
3. wait_for(["Cargado", "Procesado"])
4. verificar en snapshot o network requests
```

## Solución de Problemas

| Problema | Solución |
|----------|----------|
| Elemento no encontrado | Esperar con `wait_for` antes de interactuar |
| UID cambia entre snapshots | Tomar snapshot fresco antes de cada acción |
| Timeout en carga | Aumentar `timeout` o verificar servicio |
| Chrome no responde | Reiniciar Chrome con el comando de inicio |
| Acción no tiene efecto | Verificar que el elemento sea `focusable` |

## Checklist de Prueba

- [ ] Servicio corriendo y accesible
- [ ] Chrome iniciado con remote debugging
- [ ] Página carga sin errores 404/500
- [ ] Elementos interactivos identificados
- [ ] Acciones ejecutadas exitosamente
- [ ] Resultado verificado visualmente (screenshot)
- [ ] Logs revisados para errores
- [ ] Evidencia guardada

## Ejemplo Completo

Ver `/Users/<user>/root-project-path/webml-webpage/` para un ejemplo práctico de prueba de chat con modelo LLM local (Gemma 4).

Evidencia generada:
- Screenshot: `test-evidence.png`
- Respuesta del modelo: "Hola. Soy Gemma 4, un modelo de lenguaje grande desarrollado por Google DeepMind."
- Logs de consola verificando inicialización correcta
