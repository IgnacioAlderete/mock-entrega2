# Carga de archivos (Multer)

Esta sección documenta la incorporación de carga de archivos a la API usando **Multer**. Permite subir **documentos** (asociados a usuarios) y **comprobantes** (asociados a pedidos), guardarlos en carpetas organizadas y registrar sus metadatos en MongoDB.

## Índice

1. [Resumen](#resumen)
2. [Arquitectura por capas](#arquitectura-por-capas)
3. [Estructura de carpetas](#estructura-de-carpetas)
4. [Endpoints](#endpoints)
5. [Validaciones](#validaciones)
6. [Metadatos guardados](#metadatos-guardados)
7. [Manejo de errores](#manejo-de-errores)
8. [Logging](#logging)
9. [Documentación Swagger](#documentación-swagger)
10. [Tests funcionales](#tests-funcionales)
11. [Cómo probar manualmente](#cómo-probar-manualmente)

---

## Resumen

| Tipo de archivo | Entidad asociada | Carpeta de destino | Campo del form-data |
|---|---|---|---|
| Documento | Usuario (`User`) | `uploads/documents/` | `document` |
| Comprobante | Pedido (`Order`) | `uploads/receipts/` | `receipt` |

Los archivos se guardan en disco con un nombre único (`<timestamp>-<aleatorio>.<ext>`), por lo que nunca se pisan entre sí. El nombre original se conserva en la base de datos.

## Arquitectura por capas

```
Request
  → Route         (conecta el middleware de multer con el controller)
  → Middleware    (multer: storage, fileFilter, limits)
  → Controller    (extrae id, file y type del request)
  → Service       (reglas de negocio y validaciones)
  → Repository    (acceso a MongoDB con $push atómico)
  → Model         (schemas: documentSchema, receiptSchema)
  → Response

Cualquier error en el camino → error.js (formato centralizado)
```

| Capa | Archivo | Responsabilidad |
|---|---|---|
| Middleware | `src/middlewares/upload.middleware.js` | Configura multer: carpeta, tipos permitidos y límite de tamaño |
| Routes | `users.routes.js`, `orders.routes.js` | Define los endpoints y encadena multer con el controller |
| Controller | `users.controller.js`, `orders.controller.js` | Traduce HTTP a parámetros y devuelve la respuesta |
| Service | `users.service.js`, `orders.service.js` | Valida reglas de negocio y borra el archivo si algo falla |
| Repository | `users.repository.js`, `orders.repository.js` | Guarda y consulta los metadatos |
| Model | `user.model.js`, `order.model.js` | Define la estructura de los datos |

## Estructura de carpetas

```
src/
├── middlewares/
│   └── upload.middleware.js
├── models/
│   ├── user.model.js          ← documents: [documentSchema]
│   └── order.model.js         ← receipts: [receiptSchema]
├── repositories/
├── services/
├── controllers/
├── routes/
└── errors/
    └── error.js

uploads/                       ← ignorada por git (se conserva con .gitkeep)
├── documents/
└── receipts/
```

Las carpetas `uploads/documents` y `uploads/receipts` se crean automáticamente al iniciar la aplicación si no existen.

## Endpoints

### Documentos de usuario

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/users/:id/documents` | Sube un documento y lo asocia al usuario |
| `GET` | `/api/users/:id/documents` | Lista los documentos del usuario |

**POST** — `multipart/form-data`

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `document` | archivo | Sí | PDF, JPG o PNG (máx. 5 MB) |
| `type` | texto | Sí | `dni`, `license` o `proofOfAddress` |

### Comprobantes de pedido

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/orders/:id/receipts` | Sube un comprobante y lo asocia al pedido |
| `GET` | `/api/orders/:id/receipts` | Lista los comprobantes del pedido |

**POST** — `multipart/form-data`

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `receipt` | archivo | Sí | PDF, JPG, PNG o WEBP (máx. 5 MB) |
| `type` | texto | Sí | `payment`, `delivery` o `refund` |

### Ejemplo de respuesta (201)

```json
{
  "ok": true,
  "message": "Comprobante subido correctamente",
  "data": {
    "_id": "6732a1b4c8e5f20012ab34cd",
    "status": "created",
    "receipts": [
      {
        "_id": "6738f0a1c8e5f20012ab99aa",
        "originalName": "comprobante.pdf",
        "fileName": "1731345600000-48213.pdf",
        "mimeType": "application/pdf",
        "size": 204800,
        "type": "payment",
        "uploadedAt": "2026-11-11T17:30:00.000Z"
      }
    ]
  }
}
```

> Los endpoints `GET` no devuelven el campo `path` (ruta interna del servidor) para no exponer la estructura de carpetas.

## Validaciones

| Validación | Dónde se aplica | Detalle |
|---|---|---|
| Tipo de archivo (MIME) | Middleware (`fileFilter`) | Documentos: PDF, JPG, PNG. Comprobantes: PDF, JPG, PNG, WEBP |
| Tamaño máximo | Middleware (`limits`) | 5 MB por archivo |
| Archivo requerido | Service | Debe enviarse un archivo |
| Tipo de documento / comprobante | Service | Debe pertenecer a la lista permitida |
| Entidad existente | Service | El usuario o pedido debe existir |
| Pedido no cancelado | Service | No se suben comprobantes a pedidos con estado `cancelled` |

Si una validación falla después de que multer guardó el archivo, el service lo **elimina del disco** para no dejar archivos huérfanos.

## Metadatos guardados

Cada archivo registra en MongoDB (dentro de `User.documents` u `Order.receipts`):

| Campo | Descripción |
|---|---|
| `originalName` | Nombre original del archivo subido |
| `fileName` | Nombre único generado en el servidor |
| `path` | Ruta interna del archivo (no se expone en la API) |
| `mimeType` | Tipo MIME |
| `size` | Tamaño en bytes |
| `type` | Categoría de negocio (`dni`, `payment`, etc.) |
| `uploadedAt` | Fecha y hora de la carga |

El guardado usa `$push` de MongoDB, que es atómico y evita pisar datos si dos subidas llegan al mismo tiempo.

## Manejo de errores

Todos los errores (de multer y de negocio) salen por el manejador centralizado con el mismo formato:

```json
{
  "ok": false,
  "code": "INVALID_FILE_TYPE",
  "message": "Tipo de archivo no permitido"
}
```

| Código | Status | Cuándo ocurre |
|---|---|---|
| `FILE_REQUIRED` | 400 | No se envió ningún archivo |
| `INVALID_FILE_TYPE` | 400 | Formato de archivo no permitido |
| `INVALID_DOCUMENT_TYPE` | 400 | `type` de documento inválido |
| `INVALID_RECEIPT_TYPE` | 400 | `type` de comprobante inválido |
| `UNEXPECTED_FILE_FIELD` | 400 | Nombre de campo incorrecto o demasiados archivos |
| `USER_NOT_FOUND` | 404 | El usuario no existe |
| `ORDER_NOT_FOUND` | 404 | El pedido no existe |
| `ORDER_CANCELLED` | 409 | El pedido está cancelado |
| `FILE_TOO_LARGE` | 413 | El archivo supera los 5 MB |

Los `MulterError` (tamaño y campo inesperado) se traducen en `error.js` a estos mismos códigos.

## Logging

- **Subida exitosa:** `logger.info` con el id de la entidad, el tipo y el nombre del archivo.
- **Error:** el manejador centralizado registra el error con el nivel correspondiente.

## Documentación Swagger

Los cuatro endpoints están documentados en Swagger. Los de subida usan `multipart/form-data` con `format: binary` para el archivo, de modo que Swagger UI muestre el botón de selección de archivo.

Con la aplicación corriendo, la documentación está disponible en:

```
http://localhost:<PUERTO>/api-docs
```

(Ajustar la ruta según la configuración de Swagger del proyecto.)

## Tests funcionales

Los tests usan **supertest** y cubren los casos principales de cada endpoint:

| Caso | Resultado esperado |
|---|---|
| Subida válida | `201` y metadatos en la respuesta |
| Sin archivo | `400 FILE_REQUIRED` |
| Archivo con formato no permitido | `400 INVALID_FILE_TYPE` |
| Archivo mayor a 5 MB | `413 FILE_TOO_LARGE` |
| `type` inválido | `400 INVALID_DOCUMENT_TYPE` / `INVALID_RECEIPT_TYPE` |
| ID inexistente | `404 USER_NOT_FOUND` / `ORDER_NOT_FOUND` |
| Pedido cancelado | `409 ORDER_CANCELLED` |
| Listado tras subir un archivo | `200` y el archivo aparece, sin el campo `path` |

Para ejecutarlos:

```bash
npm test
```

## Cómo probar manualmente

### Insomnia / Postman

1. Crear una request `POST` a `http://localhost:<PUERTO>/api/users/<ID_REAL>/documents`.
2. En **Body**, elegir **Multipart Form**.
3. Agregar el campo `document` de tipo **File** y el campo `type` de tipo **Text** (por ejemplo `dni`).
4. No definir el header `Content-Type` manualmente.

Para comprobantes: `POST /api/orders/<ID_REAL>/receipts`, campo `receipt` y `type` (por ejemplo `payment`).

### Swagger UI

1. Abrir el endpoint y presionar **Try it out**.
2. Completar el `id` con un valor real.
3. Seleccionar el archivo con **Choose File** y completar `type`.
4. Presionar **Execute**.

## Notas

- La carpeta `uploads/` está en `.gitignore`; se conserva la estructura con un archivo `.gitkeep`.
- Los archivos se almacenan en el disco del servidor. Para producción se puede reemplazar `buildStorage` por un almacenamiento en la nube (por ejemplo S3) sin modificar el resto de las capas.