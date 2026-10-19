# ShipNow API

> Este archivo reúne las secciones de **Manejo de errores** y **Logger**. Si tu README ya tiene otras secciones (instalación, endpoints, etc.), pegalas acá o copiá estas dos al tuyo.

## Variables de entorno

| Variable | Obligatoria | Default | Descripción |
|----------|:-----------:|---------|-------------|
| `MONGODB_URI` | sí | – | Conexión a MongoDB |
| `JWT_SECRET` | sí | – | Secreto JWT |
| `PORT` | no | `8080` | Puerto |
| `NODE_ENV` | no | `development` | En `production` se oculta el mensaje interno de los errores inesperados |
| `LOG_LEVEL` | no | `debug` | `fatal`, `error`, `warning`, `info`, `http`, `debug` |
| `LOG_DIR` | no | `logs` | Carpeta de logs (se crea sola si no existe). Conviene ignorarla en git: `logs/` en `.gitignore` |

```bash
npm install
npm run dev     # o npm start
```

## Manejo de errores

Todos los errores esperados pasan por un solo lugar: `src/middlewares/errorHandler.js`.
Los services lanzan `createError(ErrorDictionary.X)` y los controllers hacen `next(error)`: nadie arma respuestas de error a mano.

```
src/utils/error.js                      # EErrors, ErrorDictionary y createError
src/middlewares/errorHandler.js         # middleware global (respuesta uniforme + log)
src/middlewares/routeNotFoundHandler.js # 404 para rutas inexistentes
```

En `app.js` van al final, en este orden: `routeNotFoundHandler` y después `errorHandler`.

```js
throw createError(ErrorDictionary.USER_NOT_FOUND);
throw createError(ErrorDictionary.QTY_EXCEEDS_MAX, { details: { max: 50 } });   // details y cause son opcionales
```

### Estructura de la respuesta de error

```json
{
  "status": "error",
  "error": {
    "name": "QtyExceedsMax",
    "code": 6,
    "message": "La cantidad supera el máximo permitido",
    "details": { "received": 100000, "max": 50 }
  }
}
```

- `name`: nombre del error (entrada del diccionario). `code`: categoría (`EErrors`). El status HTTP sale de la entrada del diccionario.
- `details`: opcional.
- El handler también traduce `CastError` (ID inválido), JSON mal formado, `ValidationError` de Mongoose y claves duplicadas (11000).
- Un error inesperado responde `500 InternalError`; en `NODE_ENV=production` no expone el mensaje interno.
- Se registra en el logger: 4xx como `warning`, 5xx e inesperados como `error` (con stack).

| HTTP | Errores del diccionario |
|------|-------------------------|
| 400 | `InvalidId`, `InvalidJson`, `InvalidStatus`, `InvalidQuantity`, `InvalidQty`, `QtyExceedsMax`, `MissingFields`, `ValidationError`, `InvalidDriverRole` |
| 403 | `AdminCreationForbidden` |
| 404 | `UserNotFound`, `OrderNotFound`, `DeliverNotFound`, `DriverNotFound`, `RouteNotFound` |
| 409 | `UserAlreadyExists`, `DuplicateKey` |
| 500 | `MockGenerationFailed`, `SeedFailed`, `MissingApiKey`, `InternalError` |

### Mocks

`GET /api/mocks/users?qty=N` genera usuarios sin guardarlos. `POST /api/mocks/seed?qty=N` los guarda (con la contraseña hasheada).
`qty` debe ser un **entero entre 1 y 50**; si no se envía, usa 10. Fallas posibles: cantidad inválida, cantidad sobre el máximo, error al generar (`MockGenerationFailed`) y error al insertar en la base (`SeedFailed`).

### Cómo probar los casos inválidos

Con el servidor levantado (puerto 8080 por defecto):

```bash
# Mocks
curl "localhost:8080/api/mocks/users?qty=5"            # 200
curl "localhost:8080/api/mocks/users"                  # 200 (10 usuarios)
curl "localhost:8080/api/mocks/users?qty=0"            # 400 InvalidQty
curl "localhost:8080/api/mocks/users?qty=-5"           # 400 InvalidQty
curl "localhost:8080/api/mocks/users?qty=abc"          # 400 InvalidQty
curl "localhost:8080/api/mocks/users?qty=2.5"          # 400 InvalidQty
curl "localhost:8080/api/mocks/users?qty=51"           # 400 QtyExceedsMax
curl "localhost:8080/api/mocks/users?qty=100000"       # 400 QtyExceedsMax
curl -X POST "localhost:8080/api/mocks/seed?qty=3"     # 201 { inserted: 3 }
curl -X POST "localhost:8080/api/mocks/seed?qty=-1"    # 400 InvalidQty
# SeedFailed (500): cortar MongoDB (o forzar un email duplicado) y repetir el POST /seed

# Resto de la API
curl localhost:8080/api/nada                                              # 404 RouteNotFound
curl localhost:8080/api/users/abc                                         # 400 InvalidId
curl localhost:8080/api/users/64b000000000000000000000                    # 404 UserNotFound
curl -X POST localhost:8080/api/users -H "Content-Type: application/json" -d '{'                                  # 400 InvalidJson
curl -X POST localhost:8080/api/users -H "Content-Type: application/json" -d '{"role":"admin","email":"a@a.com"}' # 403 AdminCreationForbidden
curl -X POST localhost:8080/api/users -H "Content-Type: application/json" -d '{"firstName":"Ana"}'                # 400 MissingFields
curl -X POST localhost:8080/api/users -H "Content-Type: application/json" -d '{"email":"a@a.com"}'                # 400 ValidationError
curl -X PUT  localhost:8080/api/orders/<id> -H "Content-Type: application/json" -d '{"status":"volando"}'         # 400 InvalidStatus
curl -X POST localhost:8080/api/deliveries -H "Content-Type: application/json" -d '{"order":"64b000000000000000000000"}'  # 404 OrderNotFound
```

## Logger

Winston con niveles propios (de más a menos severo): `fatal`, `error`, `warning`, `info`, `http`, `debug`. Se loguea el nivel de `LOG_LEVEL` y todos los más severos (si el valor es inválido usa `info` en producción y `debug` en el resto).

- **Consola:** formato legible con colores.
- **Archivos** en `LOG_DIR` (default `logs/`): JSON, rotación diaria, máx. 5 MB por archivo, retención de 14 días, comprimidos.
  - `errors-YYYY-MM-DD.log`: `error` y `fatal`
  - `fatal-YYYY-MM-DD.log`: solo `fatal`
- `httpLogger` registra cada request (nivel `http`); el `errorHandler` registra los errores (`warning`/`error`).
- `server.js` registra como `fatal` las excepciones y promesas rechazadas sin capturar, y sale después de vaciar los logs.
- Probar: `GET /api/logger` genera un log de cada nivel. Solo está disponible fuera de producción.
