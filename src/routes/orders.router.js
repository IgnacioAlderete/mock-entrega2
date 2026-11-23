import { Router } from 'express';
import ordersController from '../controllers/orders.controllers.js';
import { uploadReceipt } from '../middlewares/upload.Middleware.js'

const router = Router();

/**
 * @openapi
 * /api/orders/{id}/receipts:
 *   post:
 *     summary: Subir un comprobante a un pedido
 *     description: >
 *       Carga un comprobante (pago, entrega o reembolso) y lo asocia al pedido.
 *       Acepta PDF, JPG, PNG y WEBP de hasta 5 MB.
 *       No se pueden subir comprobantes a pedidos cancelados.
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pedido
 *         example: 66f1c2a9e4b0a1d2c3e4f5a6
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [receipt, type]
 *             properties:
 *               receipt:
 *                 type: string
 *                 format: binary
 *                 description: Archivo (PDF, JPG, PNG o WEBP, máx. 5 MB)
 *               type:
 *                 type: string
 *                 enum: [payment, delivery, refund]
 *                 example: payment
 *     responses:
 *       201:
 *         description: Comprobante subido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Archivo faltante, formato no permitido o tipo de comprobante inválido
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
 *               InvalidReceiptType:
 *                 summary: Tipo de comprobante inválido
 *                 value:
 *                   status: error
 *                   error:
 *                     name: InvalidReceiptType
 *                     code: 14
 *                     message: Tipo de comprobante inválido
 *       404:
 *         description: Pedido no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: OrderNotFound
 *                 code: 4
 *                 message: Pedido no encontrado
 *       409:
 *         description: El pedido está cancelado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: OrderCancelled
 *                 code: 6
 *                 message: No se pueden subir comprobantes a un pedido cancelado
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

router.post(
  '/:id/receipts',
  uploadReceipt.single('receipt'),   // el campo del form-data se llama "receipt"
  ordersController.uploadReceipt
)

/**
 * @openapi
 * tags:
 *   name: Orders
 *   description: Gestión de pedidos
 */

/**
 * @openapi
 * /api/orders/{id}/receipts:
 *   get:
 *     summary: Listar los comprobantes de un pedido
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pedido
 *     responses:
 *       200:
 *         description: Lista de comprobantes del pedido
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
 *                     $ref: '#/components/schemas/Receipt'
 *       404:
 *         description: Pedido no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               error:
 *                 name: OrderNotFound
 *                 code: 4
 *                 message: Pedido no encontrado
 */
router.get('/:id/receipts', ordersController.getReceipts)

router.get('/', ordersController.findAll);
/**
 * @openapi
 * /api/orders:
 *   get:
 *     summary: Listar todos los pedidos
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Crear un pedido
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderInput'
 *     responses:
 *       201:
 *         description: Pedido creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Error de validación (cliente, items o dirección faltantes/inválidos)
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

router.get('/:id', ordersController.findById);


/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     summary: Obtener un pedido por ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pedido
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Pedido no encontrado
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
 *   put:
 *     summary: Actualizar un pedido
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderInput'
 *     responses:
 *       200:
 *         description: Pedido actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Pedido no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Eliminar un pedido
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pedido
 *     responses:
 *       200:
 *         description: Pedido eliminado
 *       404:
 *         description: Pedido no encontrado
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

router.post('/', ordersController.create);
/**
 * @openapi
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       required: [name, quantity, price]
 *       properties:
 *         name:
 *           type: string
 *           example: Pizza muzzarella
 *         quantity:
 *           type: number
 *           minimum: 1
 *           example: 2
 *         price:
 *           type: number
 *           minimum: 0
 *           example: 8500
 *
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 66f1c2a9e4b0a1d2c3e4f5a6
 *         customer:
 *           type: string
 *           description: ID del usuario (ref User)
 *           example: 66f1c2a9e4b0a1d2c3e4f5a1
 *         items:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         deliveryAddress:
 *           type: string
 *           example: Av. Perón 1234, San Miguel
 *         total:
 *           type: number
 *           default: 0
 *           example: 17000
 *         shippingCost:
 *           type: number
 *           default: 0
 *           example: 1500
 *         declaredValue:
 *           type: number
 *           default: 0
 *           example: 17000
 *         status:
 *           type: string
 *           enum: [created, assigned, picked_up, in_transit, delivered, cancelled]
 *           default: created
 *         priority:
 *           type: string
 *           enum: [low, normal, high]
 *           default: normal
 *         delivery:
 *           type: string
 *           nullable: true
 *           description: ID del envío asignado (ref Delivery)
 *           example: null
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     OrderInput:
 *       type: object
 *       required: [customer, items, deliveryAddress]
 *       properties:
 *         customer:
 *           type: string
 *           example: 66f1c2a9e4b0a1d2c3e4f5a1
 *         items:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         deliveryAddress:
 *           type: string
 *           example: Av. Perón 1234, San Miguel
 *         total:
 *           type: number
 *         shippingCost:
 *           type: number
 *         declaredValue:
 *           type: number
 *         status:
 *           type: string
 *           enum: [created, assigned, picked_up, in_transit, delivered, cancelled]
 *         priority:
 *           type: string
 *           enum: [low, normal, high]
 *         delivery:
 *           type: string
 *           nullable: true
 *
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Pedido no encontrado
 */


router.put('/:id', ordersController.update);


router.delete('/:id', ordersController.delete);

export default router;