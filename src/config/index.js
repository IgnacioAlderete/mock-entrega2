import dotenv from 'dotenv';

// Entorno separado: con NODE_ENV=test se lee .env.test (base de datos y variables
// propias de testing); en cualquier otro caso se lee .env como siempre.
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile, quiet: true });

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];

// si falta algo crítico, mejor fallar acá
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(
      `Falta configurar la variable de entorno: ${envVar}\n` +
      `Revisá el archivo ${envFile} (copiado desde .env.example)`
    );
  }
});

const config = {
  port: parseInt(process.env.PORT, 10) || 8080,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'debug',
  logDir: process.env.LOG_DIR || 'logs'
};

export default config;