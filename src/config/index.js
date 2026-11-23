import dotenv from 'dotenv';

// Entorno separado: con NODE_ENV=test se lee .env.test (base de datos y variables
// propias de testing); en cualquier otro caso se lee .env como siempre.
// En Docker no hay archivo .env: las variables llegan por --env-file / environment
// y dotenv no pisa las que ya existen en process.env.
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile, quiet: true });

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];

// si falta algo crítico, mejor fallar acá
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(
      `Falta configurar la variable de entorno: ${envVar}\n` +
      `Definila en el entorno o en ${envFile} (copiado desde .env.example)`
    );
  }
});

const toInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const port = toInt(process.env.PORT, 8080);

const config = {
  port,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'debug',
  logDir: process.env.LOG_DIR || 'logs',

  // HTTP
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jsonLimit: process.env.JSON_LIMIT || '1mb',
  publicUrl: process.env.PUBLIC_URL || `http://localhost:${port}`,

  // Archivos (Multer)
  uploads: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSizeMb: toInt(process.env.MAX_FILE_SIZE_MB, 5)
  },

  // Paginación
  pagination: {
    defaultLimit: toInt(process.env.DEFAULT_PAGE_LIMIT, 10),
    maxLimit: toInt(process.env.MAX_PAGE_LIMIT, 100)
  }
};

export default config;