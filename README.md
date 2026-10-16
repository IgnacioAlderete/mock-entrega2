# ShipNow API

API REST de logística (Node.js + Express + MongoDB) con arquitectura por capas
(routes → controllers → services → repositories), mocks de datos y manejo
centralizado de errores.

## Logging y monitoreo básico (Winston)

El logger centralizado vive en `src/utils/logger.js` y se importa donde haga falta:

```js
import logger from '../utils/logger.js';

logger.info('Pedido creado', { orderId });
```

### Instalación de dependencias

```bash
npm install winston winston-daily-rotate-file
```

### Niveles

De más a menos severo:

| Nivel     | Uso                                                              |
|-----------|------------------------------------------------------------------|
| `fatal`   | La app no puede continuar (falla al iniciar, `uncaughtException`) |
| `error`   | Errores inesperados o 5xx                                        |
| `warning` | Errores esperados del cliente (4xx) y situaciones anómalas        |
| `info`    | Eventos normales (servidor iniciado, DB conectada)               |
| `http`    | Cada request (método, URL, status, duración)                     |
| `debug`   | Detalle para desarrollo                                          |

Se loguea el nivel configurado y todos los más severos. Ejemplo: con
`LOG_LEVEL=info` se ven `fatal`, `error`, `warning` e `info`, pero no `http` ni `debug`.

### Configuración (`.env`)

```env
LOG_LEVEL=debug   # default: debug en desarrollo, info en producción
LOG_DIR=logs      # carpeta donde se guardan los archivos (default: logs)
```

Agregá `logs/` a tu `.gitignore`.

### Dónde se guardan los logs

- **Consola**: todos los niveles desde `LOG_LEVEL`, con colores.
- **`logs/errors-AAAA-MM-DD.log`**: `error` y `fatal` (JSON, una línea por evento, con stack trace).
- **`logs/fatal-AAAA-MM-DD.log`**: sólo `fatal`.

**Rotación** (`winston-daily-rotate-file`): un archivo nuevo por día, también se
rota si supera 5 MB, los archivos viejos se comprimen (`.gz`) y se eliminan a los 14 días.

### Integración con el middleware de errores

`src/middlewares/errorHandler.js` registra cada error que llega con `next(err)`:

- errores inesperados o 5xx → `logger.error` (con stack, método, URL y status) → se guardan en archivo.
- errores de negocio 4xx (ej. `UserNotFound`) → `logger.warning` (sólo consola).

`src/middlewares/httpLogger.js` registra cada request con nivel `http`.
En `src/server.js` los fallos de arranque, `uncaughtException` y `unhandledRejection` se registran como `fatal`.

### Probar el logger

Levantá el servidor y llamá al endpoint de prueba:

```bash
curl http://localhost:8080/api/loggerTest
```

Genera un log de cada nivel (`debug`, `http`, `info`, `warning`, `error`, `fatal`).
Respuesta:

```json
{
  "status": "success",
  "message": "Se generaron logs de todos los niveles",
  "levels": ["debug", "http", "info", "warning", "error", "fatal"],
  "activeLevel": "debug"
}
```

Para comprobar el resto de la integración:

1. En la consola deberías ver los 6 niveles (según `LOG_LEVEL`) más el log `http` del request.
2. Revisá `logs/errors-<fecha>.log` (debe contener `error` y `fatal`) y `logs/fatal-<fecha>.log` (sólo `fatal`).
3. Provocá un 404 de negocio: `curl http://localhost:8080/api/users/000000000000000000000000` → aparece un `warning`.
4. Provocá un error de ruta: `curl http://localhost:8080/api/noexiste` → `warning` `RouteNotFound`.
5. Cambiá `LOG_LEVEL=info`, reiniciá y repetí: ya no deberían aparecer `http` ni `debug`.