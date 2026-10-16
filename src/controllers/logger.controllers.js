


import logger from '../utils/logger.js';

// Endpoint de prueba: genera un log por cada nivel.
// No es peligroso, pero conviene deshabilitarlo en producción (ver router).
const loggerControllers = {
  test: (req, res) => {
    logger.debug('Log de prueba: debug');
    logger.http('Log de prueba: http');
    logger.info('Log de prueba: info');
    logger.warning('Log de prueba: warning');
    logger.error('Log de prueba: error');
    logger.fatal('Log de prueba: fatal');

    res.json({
      status: 'success',
      message: 'Se generaron logs de todos los niveles',
      levels: ['debug', 'http', 'info', 'warning', 'error', 'fatal'],
      activeLevel: logger.level
    });
  }
};

export default loggerControllers;
