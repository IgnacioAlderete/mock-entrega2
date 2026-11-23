## Ejecución con Docker

### Requisitos
- Docker 24+ (y Docker Compose v2 si se usa `docker compose`)

### Variables de entorno
La configuración se lee desde variables de entorno (ver `.env.example`). El archivo `.env`
**no se copia a la imagen** (está en `.dockerignore`): se inyecta al ejecutar el contenedor.

| Variable | Obligatoria | Default | Descripción |
|---|---|---|---|
| `MONGODB_URI` | Sí | – | Cadena de conexión a MongoDB |
| `JWT_SECRET` | Sí | – | Secreto para firmar tokens |
| `NODE_ENV` | No | `development` | `development`, `test` o `production` |
| `PORT` | No | `8080` | Puerto de la API |
| `LOG_LEVEL` | No | `debug` | Nivel de logging de Winston |
| `LOG_DIR` | No | `logs` | Carpeta de logs |
| `CORS_ORIGIN` | No | `*` | Orígenes permitidos, separados por coma |
| `JSON_LIMIT` | No | `1mb` | Tamaño máximo del body JSON |
| `PUBLIC_URL` | No | `http://localhost:PORT` | URL base que muestra Swagger |
| `UPLOAD_DIR` | No | `uploads` | Carpeta de archivos subidos |
| `MAX_FILE_SIZE_MB` | No | `5` | Tamaño máximo por archivo |
| `DEFAULT_PAGE_LIMIT` | No | `10` | Registros por página por defecto |
| `MAX_PAGE_LIMIT` | No | `100` | Máximo de registros por página |

Para empezar: `cp .env.example .env` y completar los valores.

### Construir la imagen
```bash
docker build -t shipnow-api .
```

### Ejecutar el contenedor
```bash
docker run -d --name shipnow-api -p 8080:8080 \
  --env-file .env \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/shipnow \
  -v shipnow-uploads:/app/uploads \
  -v shipnow-logs:/app/logs \
  shipnow-api
```
Dentro del contenedor `localhost` es el propio contenedor, por eso `MONGODB_URI` apunta a
`host.docker.internal` si MongoDB corre en tu máquina (en Linux agregar
`--add-host=host.docker.internal:host-gateway`).

### Con Docker Compose (API + MongoDB)
```bash
docker compose up -d --build
docker compose logs -f api
docker compose down
```

### Verificar que funciona
```bash
curl http://localhost:8080/api/health
docker ps            # la columna STATUS debe indicar "healthy"
```
- Health check: `GET /api/health` → `200` con `database: "connected"`, o `503` si no hay conexión a la base.
- Documentación Swagger: `http://localhost:8080/api/docs`

### Despliegue básico
1. Construir la imagen y publicarla en un registro (`docker push`).
2. En el servidor, definir las variables de entorno (nunca subir el `.env` real al repositorio).
3. Ejecutar el contenedor con un volumen para `/app/uploads` y apuntar el health check de la plataforma a `/api/health`.
4. El contenedor maneja `SIGTERM`: al detenerlo cierra el servidor y la conexión a MongoDB ordenadamente.