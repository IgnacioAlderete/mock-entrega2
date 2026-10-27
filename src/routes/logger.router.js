import { Router } from 'express';
import loggerControllers from '../controllers/logger.controllers.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Logger
 *   description: Endpoint de prueba del sistema de logs
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     LoggerTestResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Se generaron logs de todos los niveles
 *         levels:
 *           type: array
 *           items:
 *             type: string
 *           example: [debug, http, info, warning, error, fatal]
 *         activeLevel:
 *           type: string
 *           description: Nivel de log activo en el logger según el entorno
 *           example: debug
 */

router.get('/', loggerControllers.test);


/**
 * @openapi
 * /api/logger:
 *   get:
 *     summary: Generar logs de prueba en todos los niveles
 *     description: >
 *       Dispara un log por cada nivel (debug, http, info, warning, error, fatal).
 *       Los logs que se muestran o guardan dependen del nivel activo del logger.
 *     tags: [Logger]
 *     responses:
 *       200:
 *         description: Logs generados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoggerTestResponse'
 */

export default router;
