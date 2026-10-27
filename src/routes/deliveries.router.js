import { Router } from 'express';
import deliveriesController from '../controllers/deliveries.controllers.js';
const router = Router();

/**
 * @openapi
 * tags:
 *   name: Deliveries
 *   description: Gestión de envíos
 */

router.get('/', deliveriesController.findAll);
/**
 * @openapi
 * /api/deliveries:
 *   get:
 *     summary: Listar todos los envíos
 *     tags: [Deliveries]
 *     responses:
 *       200:
 *         description: Lista de envíos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Delivery'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Crear un envío
 *     tags: [Deliveries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeliveryInput'
 *     responses:
 *       201:
 *         description: Envío creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Delivery'
 *       400:
 *         description: Error de validación (pedido obligatorio)
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
router.get('/:id', deliveriesController.findById);

/**
 * @openapi
 * /api/deliveries/{id}:
 *   get:
 *     summary: Obtener un envío por ID
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del envío
 *     responses:
 *       200:
 *         description: Envío encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Delivery'
 *       404:
 *         description: Envío no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Actualizar un envío
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del envío
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeliveryInput'
 *     responses:
 *       200:
 *         description: Envío actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Delivery'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Envío no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Eliminar un envío
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del envío
 *     responses:
 *       200:
 *         description: Envío eliminado
 *       404:
 *         description: Envío no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
 
router.post('/', deliveriesController.create);
/**
 * @openapi
 * components:
 *   schemas:
 *     Delivery:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 66f1c2a9e4b0a1d2c3e4f5b7
 *         order:
 *           type: string
 *           description: ID del pedido (ref Order)
 *           example: 66f1c2a9e4b0a1d2c3e4f5a6
 *         driver:
 *           type: string
 *           nullable: true
 *           description: ID del repartidor (ref User)
 *           example: 66f1c2a9e4b0a1d2c3e4f5c8
 *         status:
 *           type: string
 *           enum: [pending, assigned, in_transit, delivered]
 *           default: pending
 *         priority:
 *           type: string
 *           enum: [low, normal, high]
 *           default: normal
 *         assignedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     DeliveryInput:
 *       type: object
 *       required: [order]
 *       properties:
 *         order:
 *           type: string
 *           example: 66f1c2a9e4b0a1d2c3e4f5a6
 *         driver:
 *           type: string
 *           nullable: true
 *           example: 66f1c2a9e4b0a1d2c3e4f5c8
 *         status:
 *           type: string
 *           enum: [pending, assigned, in_transit, delivered]
 *         priority:
 *           type: string
 *           enum: [low, normal, high]
 *         assignedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 */
router.put('/:id', deliveriesController.update);
router.delete('/:id', deliveriesController.delete);

export default router;