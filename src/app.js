import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import config from './config/index.js';
import swaggerSpec from './config/swagger.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { routeNotFoundHandler } from './middlewares/routeNotFoundHandler.js';
import { httpLogger } from './middlewares/httpLogger.js';

const app = express();

app.disable('x-powered-by');

app.use(cors({
  origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',').map((o) => o.trim())
}));
app.use(httpLogger);

// Swagger va antes de helmet: la CSP por defecto de helmet bloquea los scripts inline de swagger-ui
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: config.jsonLimit }));
app.use(express.urlencoded({ extended: true, limit: config.jsonLimit }));

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Estado de salud de la API
 *     description: Devuelve 200 si la API y la base de datos responden, 503 si no hay conexión a MongoDB.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API operativa
 *         content:
 *           application/json:
 *             example:
 *               status: ok
 *               database: connected
 *               uptime: 125
 *               timestamp: "2026-11-23T15:00:00.000Z"
 *       503:
 *         description: Base de datos no disponible
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               database: disconnected
 *               uptime: 125
 *               timestamp: "2026-11-23T15:00:00.000Z"
 */
app.get('/api/health', (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({
    status: dbUp ? 'ok' : 'error',
    database: dbUp ? 'connected' : 'disconnected',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.use('/api', apiRouter);

// rutas no matcheadas
app.use(routeNotFoundHandler);

// errores pasados con next(err)
app.use(errorHandler);

export default app;