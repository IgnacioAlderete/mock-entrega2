import mocksControllers from "../controllers/mocks.controllers.js";
import { Router } from "express";

const router = Router();
/**
 * @openapi
 * tags:
 *   name: Mocks
 *   description: Generación de usuarios de prueba (mocking)
 */

router.get("/users", mocksControllers.getUsers);

/**
 * @openapi
 * /api/mocks/users:
 *   get:
 *     summary: Generar usuarios de prueba (sin guardarlos)
 *     description: Devuelve usuarios falsos generados en memoria. No se persisten en la base de datos.
 *     tags: [Mocks]
 *     parameters:
 *       - in: query
 *         name: qty
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: >
 *           Cantidad de usuarios a generar. Entero entre 1 y el máximo configurado
 *           (MOCKING_PARAMETERS.MAX). Si no se envía, se usa el valor por defecto
 *           (MOCKING_PARAMETERS.DEFAULT).
 *         example: 10
 *     responses:
 *       200:
 *         description: Usuarios generados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MocksGetUsersResponse'
 *       400:
 *         description: qty inválida (no es entero >= 1) o supera el máximo permitido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
 
/**
 * @openapi
 * /api/mocks/seed:
 *   post:
 *     summary: Generar e insertar usuarios de prueba en la base de datos
 *     description: >
 *       Genera usuarios falsos y los guarda en la colección de usuarios.
 *       Las contraseñas se hashean con bcrypt antes de insertarse.
 *     tags: [Mocks]
 *     parameters:
 *       - in: query
 *         name: qty
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: >
 *           Cantidad de usuarios a insertar. Entero entre 1 y el máximo configurado
 *           (MOCKING_PARAMETERS.MAX). Si no se envía, se usa el valor por defecto
 *           (MOCKING_PARAMETERS.DEFAULT).
 *         example: 50
 *     responses:
 *       201:
 *         description: Usuarios insertados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MocksSeedResponse'
 *       400:
 *         description: qty inválida (no es entero >= 1) o supera el máximo permitido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.post("/seed", mocksControllers.seedUsers);
/**
 * @openapi
 * components:
 *   schemas:
 *     MockUser:
 *       type: object
 *       description: Usuario de prueba generado por el servicio de mocks
 *       additionalProperties: true
 *       example:
 *         name: Juan Pérez
 *         email: juan.perez@example.com
 *         password: secret123
 *     MocksGetUsersResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         payload:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MockUser'
 *     MocksSeedResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         payload:
 *           type: object
 *           properties:
 *             inserted:
 *               type: integer
 *               description: Cantidad de usuarios insertados
 *               example: 50
 *             collection:
 *               type: string
 *               description: Colección donde se insertaron
 *               example: users
 */

export default router;