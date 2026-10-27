# Documentación de la API (Swagger / OpenAPI)

La API está documentada con **swagger-jsdoc** y **swagger-ui-express**. La documentación se escribe en comentarios `@openapi` y se publica como interfaz interactiva donde se pueden probar los endpoints.

## Ruta de Swagger

Con el servidor levantado, la documentación está en:

```
http://localhost:8080/api/docs
```

> Ajustá el puerto y la ruta (`/api/docs`) según tu configuración.

### Configuración de referencia

```javascript
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'Documentación de la API',
      description: 'API de pedidos, envíos, usuarios, mocks y logger'
    }
  },
  apis: ['./src/docs/*.js'] // carpeta donde están los archivos *.swagger.js
};

const specs = swaggerJSDoc(swaggerOptions);
app.use('/api/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));
```

## Cómo levantar el servidor

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Configurar las variables de entorno (por ejemplo `PORT` y la URI de MongoDB) en el archivo `.env`.

3. Iniciar el servidor:

   ```bash
   npm start
   ```

   o, en modo desarrollo:

   ```bash
   npm run dev
   ```

4. Abrir `http://localhost:8080/api/docs` en el navegador.

Se necesita tener MongoDB accesible, porque los endpoints de Orders, Deliveries y el `POST /seed` leen y escriben en la base de datos.

## Módulos documentados

| Módulo | Archivo | Endpoints |
|---|---|---|
| Orders | `order.swagger.js` | `GET /api/orders`, `GET /api/orders/{id}`, `POST /api/orders`, `PUT /api/orders/{id}`, `DELETE /api/orders/{id}` |
| Deliveries | `delivery.swagger.js` | `GET /api/deliveries`, `GET /api/deliveries/{id}`, `POST /api/deliveries`, `PUT /api/deliveries/{id}`, `DELETE /api/deliveries/{id}` |
| Logger | `logger.swagger.js` | `GET /api/logger` |
| Mocks | `mock.swagger.js` | `GET /api/mocks/users`, `POST /api/mocks/seed` |
| Users | _pendiente_ | — |

Los schemas comunes (`Order`, `OrderItem`, `Delivery`, `MockUser`, `Error`, etc.) están definidos en `components/schemas` dentro de cada archivo. El schema `Error` se comparte entre módulos, así que debe estar definido en al menos un archivo que `swagger-jsdoc` procese.

## Aclaraciones para probar los endpoints

- **Probar desde Swagger UI:** abrir un endpoint, hacer clic en **Try it out**, completar los datos y presionar **Execute**.
- **Orders:**
  - `customer` es el ID de un usuario existente (ObjectId de MongoDB).
  - `items` debe tener al menos un elemento, con `name`, `quantity` (mínimo 1) y `price` (no negativo).
  - `deliveryAddress` es obligatorio.
  - Estados válidos de `status`: `created`, `assigned`, `picked_up`, `in_transit`, `delivered`, `cancelled`.
- **Deliveries:**
  - `order` es obligatorio y debe ser el ID de un pedido existente.
  - `driver` es opcional (ID de un usuario).
  - Estados válidos de `status`: `pending`, `assigned`, `in_transit`, `delivered`.
- **Prioridad:** tanto en pedidos como en envíos, `priority` acepta `low`, `normal` o `high`.
- **Mocks:**
  - `GET /api/mocks/users` genera usuarios falsos en memoria y no los guarda.
  - `POST /api/mocks/seed` genera usuarios, hashea sus contraseñas con bcrypt y los inserta en la colección `users`.
  - `qty` debe ser un entero entre 1 y el máximo configurado. Si se omite, se usa el valor por defecto. Un valor inválido o mayor al máximo devuelve error 400.
- **Logger:** `GET /api/logger` genera un log por cada nivel (`debug`, `http`, `info`, `warning`, `error`, `fatal`). Lo que se ve en consola o archivo depende del nivel activo, que la respuesta devuelve en `activeLevel`.
- **IDs inválidos o inexistentes:** los endpoints con `{id}` devuelven 404 si el recurso no existe.