## Testing

Tests funcionales de los endpoints de ShipNow: levantan la app de Express en memoria (sin abrir puertos) y le hacen peticiones HTTP reales contra una base de datos de testing.

### Herramientas

- [Mocha](https://mochajs.org/): organiza y ejecuta los tests.
- [Chai](https://www.chaijs.com/): validaciones (`expect`).
- [Supertest](https://github.com/ladjs/supertest): peticiones HTTP a la app, importada desde `src/app.js` (el `listen` y la conexión a la base viven aparte, en `src/server.js`).
- [cross-env](https://github.com/kentcdodds/cross-env): define `NODE_ENV=test` en cualquier sistema operativo.

### Cómo ejecutarlos

```bash
npm install
npm test
```

No hace falta levantar el servidor: `npm test` ejecuta todo con `NODE_ENV=test`.

### Base de datos y variables de entorno

El entorno de testing está separado del de desarrollo. Con `NODE_ENV=test` la app lee el archivo **`.env.test`** (en vez de `.env`), que apunta a una base de datos propia y descartable.

| Variable | Descripción | Valor en `.env.test` |
| --- | --- | --- |
| `MONGODB_URI` | Base de datos de testing. Su nombre **tiene que incluir "test"** | `mongodb://127.0.0.1:27017/shipnow_test` |
| `JWT_SECRET` | Secreto de prueba (no usar el real) | `secreto_solo_para_tests` |
| `LOG_LEVEL` | Nivel de logs durante los tests | `fatal` (salida limpia) |
| `LOG_DIR` | Carpeta de logs de testing | `logs/test` |

Se necesita una instancia de MongoDB accesible (local o en Atlas). Los tests **borran las colecciones** de esa base antes y después de correr, por eso se niegan a ejecutarse si el nombre de la base no contiene "test" o si `NODE_ENV` no es `test`. Nunca apuntes `.env.test` a la base de desarrollo o producción.

### Organización

```
tests/
├── setup.js            # conecta a la base de test y la limpia al terminar
├── helpers/
│   ├── request.js      # supertest(app)
│   ├── factories.js    # crea usuarios y pedidos de prueba vía API
│   ├── db.js           # limpieza y consultas directas a la base
│   └── expectError.js  # valida status + formato de error del ErrorDictionary
├── users.test.js
├── orders.test.js
├── mocks.test.js
├── logger.test.js
├── swagger.test.js
└── routes.test.js
```

Cada test crea sus propios datos (por ejemplo, un usuario válido antes de probar un pedido) y la base se vacía con `beforeEach`, así que ningún test depende del estado previo ni del orden de ejecución.

### Qué cubren

| Módulo | Endpoints | Casos exitosos | Errores validados |
| --- | --- | --- | --- |
| Usuarios | `/api/users` | crear, listar (vacío y con datos), buscar por ID, actualizar, eliminar | JSON mal formado, campos faltantes, admin prohibido, usuario duplicado, ID inválido, usuario inexistente |
| Pedidos | `/api/orders` | crear (con y sin valores por defecto), listar, buscar por ID (cliente populado), actualizar, eliminar | JSON mal formado, datos incompletos, items vacíos, cantidad/precio/prioridad inválidos, ID inválido, cliente o pedido inexistente |
| Estados | `PUT /api/orders/:id` | flujo `created → assigned → picked_up → in_transit → delivered` y cancelación | estado inválido |
| Mocks | `/api/mocks/users`, `/api/mocks/seed` | generar sin guardar, insertar con contraseñas hasheadas, cantidad por defecto | `qty` inválida (`abc`, `0`, `-5`, `1.5`) y `qty` sobre el máximo |
| Logger | `/api/logger` | logs de todos los niveles, `levels` y `activeLevel` | — |
| Swagger | `/api/docs` | interfaz, redirección, especificación con los endpoints documentados | — |
| Rutas | cualquier ruta inexistente | — | 404 `RouteNotFound` con `details` (método y ruta) |

En cada error se valida el **status HTTP** y el formato definido en el módulo de errores: `{ status: "error", error: { name, code, message } }`.