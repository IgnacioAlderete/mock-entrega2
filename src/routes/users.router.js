import { Router } from 'express';
import usersController from '../controllers/users.controllers.js';
import {uploadDocument} from '../middlewares/upload.Middleware.js'

const router = Router();
router.post(
    "/:id/documents",
    uploadDocument.single("document"),
    usersController.uploadDocument
)

/**
 * @openapi
 * /api/users/{id}/documents:
 *   post:
 *     summary: Subir un documento a un usuario
 *     description: >
 *       Carga un documento y lo asocia al usuario indicado.
 *       Acepta PDF, JPG y PNG de hasta 5 MB.
 *       La licencia de conducir solo puede subirla un usuario con rol driver.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *         example: 6ad6b1eb0f2bce6b04fb30db
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [document, type]
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Archivo (PDF, JPG o PNG, máx. 5 MB)
 *               type:
 *                 type: string
 *                 enum: [user_document, driver_license]
 *                 description: Tipo de documento
 *                 example: user_document
 *     responses:
 *       201:
 *         description: Documento subido correctamente
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
 *         description: Archivo faltante, formato no permitido o tipo de documento inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               FileRequired:
 *                 summary: No se envió archivo
 *                 value:
 *                   status: error
 *                   error:
 *                     name: FileRequired
 *                     code: 9
 *                     message: Se requiere un archivo para subir
 *               InvalidFileType:
 *                 summary: Formato no permitido
 *                 value:
 *                   status: error
 *                   error:
 *                     name: InvalidFileType
 *                     code: 11
 *                     message: Tipo de archivo no permitido
 *               InvalidDocumentType:
 *                 summary: Tipo de documento inválido
 *                 value:
 *                   status: error
 *                   error:
 *                     name: InvalidDocumentType
 *                     code: 10
 *                     message: Tipo de documento inválido
 *       403:
 *         description: El rol del usuario no puede subir este tipo de documento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: DocumentNotAllowedForRole
 *                 code: 6
 *                 message: Tu rol no puede subir este tipo de documento
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
 *       413:
 *         description: El archivo supera el tamaño máximo (5 MB)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: FileTooLarge
 *                 code: 12
 *                 message: El archivo supera el tamaño máximo permitido (5 MB)
 */

  

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

// users.routes.js
/**
 * @openapi
 * /api/users/{id}/documents:
 *   post:
 *     summary: Subir un documento a un usuario
 *     description: >
 *       Carga un documento y lo asocia al usuario indicado.
 *       Acepta PDF, JPG y PNG de hasta 5 MB.
 *       La licencia de conducir solo puede subirla un usuario con rol driver.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *         example: 6ad6b1eb0f2bce6b04fb30db
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [document, type]
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Archivo (PDF, JPG o PNG, máx. 5 MB)
 *               type:
 *                 type: string
 *                 enum: [user_document, driver_license]
 *                 description: Tipo de documento
 *                 example: user_document
 *     responses:
 *       201:
 *         description: Documento subido correctamente
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
 *         description: Archivo faltante, formato no permitido o tipo de documento inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               FileRequired:
 *                 summary: No se envió archivo
 *                 value:
 *                   status: error
 *                   error:
 *                     name: FileRequired
 *                     code: 9
 *                     message: Se requiere un archivo para subir
 *               InvalidFileType:
 *                 summary: Formato no permitido
 *                 value:
 *                   status: error
 *                   error:
 *                     name: InvalidFileType
 *                     code: 11
 *                     message: Tipo de archivo no permitido
 *               InvalidDocumentType:
 *                 summary: Tipo de documento inválido
 *                 value:
 *                   status: error
 *                   error:
 *                     name: InvalidDocumentType
 *                     code: 10
 *                     message: Tipo de documento inválido
 *       403:
 *         description: El rol del usuario no puede subir este tipo de documento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: DocumentNotAllowedForRole
 *                 code: 6
 *                 message: Tu rol no puede subir este tipo de documento
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
 *       413:
 *         description: El archivo supera el tamaño máximo (5 MB)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: FileTooLarge
 *                 code: 12
 *                 message: El archivo supera el tamaño máximo permitido (5 MB)
 */
router.get('/:id/documents', usersController.getDocuments)

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

