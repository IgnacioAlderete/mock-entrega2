## Manejo de errores (Pre-entrega Módulo 3)

Todos los errores esperados pasan por un solo lugar: `src/middlewares/errorHandler.js`.
Services y controllers **no arman respuestas de error**: los services lanzan `createError(ErrorDictionary.X)` y los controllers hacen `next(error)`.

```
src/utils/error.js                      # EErrors, ErrorDictionary y createError
src/middlewares/errorHandler.js         # middleware global (respuesta uniforme)
src/middlewares/routeNotFoundHandler.js # 404 para rutas inexistentes
```

En `app.js` van al final, en este orden: `routeNotFoundHandler` y después `errorHandler`.

### Uso

```js
throw createError(ErrorDictionary.USER_NOT_FOUND);
throw createError(ErrorDictionary.QTY_EXCEEDS_MAX, { details: { max: 50 } });   // details/cause opcionales
```

### Estructura de la respuesta de error

```json
{
  "status": "error",
  "error": {
    "name": "QtyExceedsMax",
    "code": 6,
    "message": "La cantidad supera el máximo permitido",
    "details": { "received": 51, "max": 50 }
  }
}
```

- `name`: nombre del error (entrada del diccionario). `code`: categoría (`EErrors`). El HTTP status sale de la entrada del diccionario.
- `details` es opcional.
- El handler también traduce `CastError` (ID inválido), JSON mal formado, `ValidationError` de Mongoose y claves duplicadas (11000).
- Un error inesperado (bug) responde `500 InternalError` y, en `NODE_ENV=production`, no expone el mensaje interno.

| HTTP | Errores del diccionario |
|------|-------------------------|
| 400 | `InvalidId`, `InvalidJson`, `InvalidStatus`, `InvalidQuantity`, `InvalidQty`, `QtyExceedsMax`, `MissingFields`, `ValidationError`, `InvalidDriverRole` |
| 403 | `AdminCreationForbidden` |
| 404 | `UserNotFound`, `OrderNotFound`, `DeliverNotFound`, `DriverNotFound`, `RouteNotFound` |
| 409 | `UserAlreadyExists`, `DuplicateKey` |
| 500 | `MockGenerationFailed`, `SeedFailed`, `MissingApiKey`, `InternalError` |

### Mocks: validación de `qty`

`qty` debe ser un entero entre **1 y 50** (`MOCKING_PARAMETERS.MAX`). Si no se envía, usa 10.
Fallas posibles: cantidad inválida, cantidad sobre el máximo, error al generar datos (`MockGenerationFailed`) y error al insertar en la base (`SeedFailed`).

### Cómo probar los casos inválidos

Con el servidor levantado (puerto por defecto 8080):

```bash
# Mocks
curl "localhost:8080/api/mocks/users?qty=5"            # 200
curl "localhost:8080/api/mocks/users"                  # 200 (10 usuarios)
curl "localhost:8080/api/mocks/users?qty=0"            # 400 InvalidQty
curl "localhost:8080/api/mocks/users?qty=-3"           # 400 InvalidQty
curl "localhost:8080/api/mocks/users?qty=abc"          # 400 InvalidQty
curl "localhost:8080/api/mocks/users?qty=2.5"          # 400 InvalidQty
curl "localhost:8080/api/mocks/users?qty=51"           # 400 QtyExceedsMax
curl -X POST "localhost:8080/api/mocks/seed?qty=3"     # 201 { inserted: 3 }
curl -X POST "localhost:8080/api/mocks/seed?qty=0"     # 400 InvalidQty
# SeedFailed (500): apagar MongoDB (o forzar un email duplicado) y repetir el POST /seed

# Resto de la API
curl localhost:8080/api/nada                                              # 404 RouteNotFound
curl localhost:8080/api/users/abc                                         # 400 InvalidId
curl localhost:8080/api/users/64b000000000000000000000                    # 404 UserNotFound
curl -X POST localhost:8080/api/users -H "Content-Type: application/json" -d '{'                                  # 400 InvalidJson
curl -X POST localhost:8080/api/users -H "Content-Type: application/json" -d '{"role":"admin","email":"a@a.com"}' # 403 AdminCreationForbidden
curl -X POST localhost:8080/api/users -H "Content-Type: application/json" -d '{"firstName":"Ana"}'                # 400 MissingFields
curl -X POST localhost:8080/api/users -H "Content-Type: application/json" -d '{"email":"a@a.com"}'                # 400 ValidationError (campos requeridos)
curl -X PUT  localhost:8080/api/orders/<id> -H "Content-Type: application/json" -d '{"status":"volando"}'         # 400 InvalidStatus
curl -X POST localhost:8080/api/deliveries -H "Content-Type: application/json" -d '{"order":"64b000000000000000000000"}'  # 404 OrderNotFound
```
