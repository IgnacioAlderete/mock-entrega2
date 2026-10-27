import { Router } from 'express';
import ordersController from '../controllers/orders.controllers.js';
const router = Router();

/**
 * @openapi
 * tags:
 *   name: Orders
 *   description: Gestión de pedidos
 */

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