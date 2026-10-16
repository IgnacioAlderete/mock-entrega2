import logger from '../utils/logger.js';

// Registra cada request al terminar la respuesta (nivel `http`).
// Los errores los registra el errorHandler (warning/error); acá siempre es `http`.
export const httpLogger = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(1)}ms`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 10) / 10,
      ip: req.ip
    });
  });

  next();
};
