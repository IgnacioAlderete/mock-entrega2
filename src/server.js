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

let server;
let shuttingDown = false;

// Docker envía SIGTERM al detener el contenedor: se deja de aceptar conexiones,
// se cierra Mongo y recién ahí se sale. Si se cuelga, se fuerza a los 10 s.
const shutdown = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`${signal} recibido, cerrando el servidor`);

  setTimeout(() => {
    logger.error('Cierre forzado por timeout');
    exitAfterFlush(1);
  }, 10000).unref();

  const closeDb = async () => {
    try {
      await mongoose.connection.close();
      logger.info('Conexión a MongoDB cerrada');
      exitAfterFlush(0);
    } catch (error) {
      logger.error(`Error al cerrar MongoDB: ${error.message}`);
      exitAfterFlush(1);
    }
  };

  if (server) {
    server.close(closeDb);
  } else {
    closeDb();
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

async function startServer() {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info(`MongoDB conectado (${config.nodeEnv})`);

    server = app.listen(config.port, () => {
      logger.info(`Servidor en puerto ${config.port}`);
    });
  } catch (error) {
    logger.fatal(`Error al iniciar: ${error.message}`, { stack: error.stack });
    exitAfterFlush(1);
  }
}

startServer();