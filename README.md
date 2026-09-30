# Mock Entrega 2

API desarrollada con **Node.js, Express, MongoDB, Mongoose y Faker.js**.

El objetivo de esta entrega es generar datos simulados y permitir realizar un **seed de usuarios en MongoDB**.

---

## Instalación

Clonar el proyecto y entrar a la carpeta:

```bash
cd mock-entrega2
```

Instalar las dependencias:

```bash
npm install
```

Si Faker no está instalado:

```bash
npm install @faker-js/faker
```

---

## Configuración

Crear un archivo `.env` con las variables necesarias para la conexión a MongoDB.

Ejemplo:

```env
MONGO_URI=mongodb://localhost:27017/mock-entrega2
PORT=8080
```

> Los nombres de las variables deben coincidir con los utilizados en la configuración del proyecto.

---

## Iniciar el proyecto

Modo desarrollo:

```bash
npm run dev
```

O ejecución normal:

```bash
npm start
```

La API queda disponible en:

```text
http://localhost:8080
```

---

# Estructura de las rutas

Las rutas principales se encuentran en:

```text
src/routes/
```

El archivo `index.js` centraliza las rutas:

```text
/api/users
/api/orders
/api/deliveries
/api/mocks
```

Las rutas de mocking se encuentran en:

```text
src/routes/mocks.router.js
```

Estas rutas son montadas desde:

```text
/api/mocks
```

Por lo tanto:

```text
GET  /api/mocks/users
POST /api/mocks/seed
```

---

# Mocking

Los datos simulados se generan utilizando **Faker.js**.

Los mocks se encuentran en:

```text
src/mocks/
```

Actualmente se utilizan:

```text
user.mocks.js
order.mocks.js
delivery.mocks.js
```

El mock de usuarios genera datos como:

* nombre
* apellido
* email
* contraseña
* rol
* disponibilidad

Los datos generados mediante el endpoint `GET` **no se guardan en MongoDB**.

---

# Controller de Mocks

El controller se encuentra en:

```text
src/controllers/mocks.controllers.js
```

Se encarga de manejar las operaciones de mocking.

La diferencia principal es:

```text
GET /api/mocks/users
        ↓
Genera usuarios con Faker
        ↓
Devuelve los datos
        ↓
NO guarda en MongoDB
```

Mientras que:

```text
POST /api/mocks/seed
        ↓
Genera usuarios con Faker
        ↓
Inserta los usuarios en MongoDB
        ↓
Devuelve la cantidad insertada
```

---

# Probar los endpoints

## 1. Generar usuarios sin guardar

Realizar:

```http
GET http://localhost:8080/api/mocks/users?qty=2
```

La respuesta contiene los usuarios generados por Faker.

Ejemplo:

```json
[
    {
        "firstName": "Juan",
        "lastName": "Gómez",
        "email": "juan.gomez@example.com",
        "password": "123456",
        "role": "customer",
        "isAvailable": false
    },
    {
        "firstName": "Ana",
        "lastName": "Pérez",
        "email": "ana.perez@example.com",
        "password": "123456",
        "role": "driver",
        "isAvailable": true
    }
]
```

Estos datos **solamente se generan y se devuelven**. No se insertan en MongoDB.

---

## 2. Insertar usuarios en MongoDB

Realizar:

```http
POST http://localhost:8080/api/mocks/seed?qty=10
```

La API genera 10 usuarios y los inserta en MongoDB.

Respuesta esperada:

```json
{
    "insertados": 10,
    "coleccion": "usuarios"
}
```

---

# Comprobar en MongoDB

Después de ejecutar:

```http
POST /api/mocks/seed?qty=10
```

abrir **MongoDB Compass** y conectarse a la misma base de datos utilizada por la aplicación.

Buscar la colección:

```text
usuarios
```

o, si Mongoose utiliza el nombre plural automáticamente:

```text
users
```

Allí deberían aparecer los usuarios generados.

Cada documento tendrá su `_id` generado automáticamente por MongoDB/Mongoose.

Se puede comprobar que la cantidad de documentos insertados coincide con la respuesta del endpoint.

---

# Flujo general

```text
Cliente
   │
   ▼
/api
   │
   ▼
/mocks
   │
   ├── GET /users
   │       │
   │       ▼
   │    Faker
   │       │
   │       ▼
   │    Respuesta JSON
   │
   └── POST /seed
           │
           ▼
         Faker
           │
           ▼
      User.insertMany()
           │
           ▼
        MongoDB
```

---

## Tecnologías utilizadas

* Node.js
* Express
* MongoDB
* Mongoose
* Faker.js
* Nodemon
* MongoDB Compass
