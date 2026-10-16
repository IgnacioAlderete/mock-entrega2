import mongoose from 'mongoose';
import app from './app.js';
import config from './config/index.js';
import logger from './utils/logger.js';

// Errores que nadie capturó: el proceso queda en estado indefinido, se loguea como fatal y se sale.
// Se espera a que Winston vacíe los transportes antes de terminar, para no perder el log.
const exitAfterFlush = (code) => {
  logger.on('finish', () => process.exit(code));
  logger.end();
  setTimeout(() => process.exit(code), 2000).unref();
};

process.on('uncaughtException', (error) => {
  logger.fatal(`uncaughtException: ${error.message}`, { stack: error.stack });
  exitAfterFlush(1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal(`unhandledRejection: ${reason?.message ?? reason}`, { stack: reason?.stack });
  exitAfterFlush(1);
});

async function startServer() {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info(`MongoDB conectado (${config.nodeEnv})`);

    app.listen(config.port, () => {
      logger.info(`Servidor en puerto ${config.port}`);
    });
  } catch (error) {
    logger.fatal(`Error al iniciar: ${error.message}`, { stack: error.stack });
    exitAfterFlush(1);
  }
}

startServer();
