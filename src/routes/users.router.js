import { Router } from 'express';
import usersController from '../controllers/users.controllers.js';
const router = Router();


/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 6ad6b1eb0f2bce6b04fb30db
 *         firstName:
 *           type: string
 *           example: Juan
 *         lastName:
 *           type: string
 *           example: Lopez
 *         email:
 *           type: string
 *           example: juan_lopez33@gmail.com
 *         role:
 *           type: string
 *           enum: [customer, driver, admin]
 *           example: customer
 *         isAvailable:
 *           type: boolean
 *           example: true
 *         documents:
 *           type: array
 *           items:
 *             type: object
 *           example: []
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-10-20T00:12:27.808Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-10-20T00:12:27.808Z"
 *         __v:
 *           type: integer
 *           example: 0
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *         error:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             code:
 *               type: integer
 *             message:
 *               type: string
 */

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */

router.get('/', usersController.findAll);
/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6ad6b1eb0f2bce6b04fb30db
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: El ID recibido no es válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: InvalidId
 *                 code: 2
 *                 message: El ID recibido no es válido
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: UserNotFound
 *                 code: 4
 *                 message: Usuario no encontrado
 */


router.get('/:id', usersController.findById);

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Crear un usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Juan
 *               lastName:
 *                 type: string
 *                 example: Lopez
 *               email:
 *                 type: string
 *                 example: juan_lopez@gmail.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Usuario creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos o cuerpo de la petición con JSON mal formado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               ValidationError:
 *                 summary: Datos inválidos
 *                 value:
 *                   status: error
 *                   error:
 *                     name: ValidationError
 *                     code: 2
 *                     message: Datos inválidos
 *               InvalidJson:
 *                 summary: JSON mal formado
 *                 value:
 *                   status: error
 *                   error:
 *                     name: InvalidJson
 *                     code: 2
 *                     message: El cuerpo de la petición no es un JSON válido
 *       403:
 *         description: No se permite crear un admin desde este endpoint
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: AdminCreationForbidden
 *                 code: 6
 *                 message: No se puede crear un admin desde este endpoint
 *       409:
 *         description: El usuario ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: UserAlreadyExists
 *                 code: 5
 *                 message: Ya existe un usuario
 */

router.post('/', usersController.create);
router.put('/:id', usersController.update);
/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6ad6b1eb0f2bce6b04fb30db
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: El ID recibido no es válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: InvalidId
 *                 code: 2
 *                 message: El ID recibido no es válido
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: UserNotFound
 *                 code: 4
 *                 message: Usuario no encontrado
 */


router.delete('/:id', usersController.delete);

export default router;

