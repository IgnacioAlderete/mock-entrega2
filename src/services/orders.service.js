import fs from 'fs/promises'

import ordersRepo from '../repositories/orders.repo.js';
import usersRepo from '../repositories/users.repo.js';
import {createError, ErrorDictionary} from '../utils/error.js';
import config from '../config/index.js';
import  logger  from '../utils/logger.js'

import { ORDER_STATUS, DELIVERY_PRIORITY,RECEIPT_TYPES } from '../constants/index.js';



export function calculateShippingCost({ isProduction, shipmentValue, apiKey }) {
  if (!apiKey) {
    throw createError(ErrorDictionary.MISSING_API_KEY);
  }

  if (isProduction) {
    return 50 + shipmentValue * 0.01;
  }

  return 10;
}



class OrdersService {
  async uploadReceipt(orderId, file, type) {
    // 1. Validar datos requeridos
    if (!file) throw createError(ErrorDictionary.FILE_REQUIRED)

    try {
      if (!Object.values(RECEIPT_TYPES).includes(type)) {
        throw createError(ErrorDictionary.INVALID_RECEIPT_TYPE)
      }

      // 2. Verificar que el pedido exista
      const order = await ordersRepo.findById(orderId)
      if (!order) throw createError(ErrorDictionary.ORDER_NOT_FOUND)

      // 3. Regla de negocio: no se suben comprobantes a pedidos cancelados
      if (order.status === 'cancelled') {
        throw createError(ErrorDictionary.ORDER_CANCELLED)
      }

      // 4. Armar los metadatos y asociarlos al pedido
      const receipt = {
        originalName: file.originalname,
        fileName: file.filename,
        path: file.path,
        mimeType: file.mimetype,
        size: file.size,
        type,
        uploadedAt: new Date()
      }

      const updatedOrder = await ordersRepo.addReceipt(orderId, receipt)

      logger.info(`Comprobante subido: pedido ${orderId}, tipo ${type}, archivo ${file.filename}`)
      return updatedOrder

    } catch (error) {
      // Si algo falla, borramos el archivo para no dejarlo huérfano en disco
      await fs.unlink(file.path).catch(() => {})
      throw error
    }
  }

  // orders.service.js
  async getReceipts(orderId) {
    const order = await ordersRepo.findReceipts(orderId)
    if (!order) throw createError(ErrorDictionary.ORDER_NOT_FOUND)

   return order.receipts.map(({ path, ...receipt }) => receipt)
}

  async findAll(filter = {}) {
    return ordersRepo.findAll(filter);
  }

  async findById(id) {
    const order = await ordersRepo.findById(id);
    if (!order) {
      throw createError(ErrorDictionary.ORDER_NOT_FOUND);
    }
    return order;
  }

  async create(orderData) {
    const customer = await usersRepo.findById(orderData.customer);
    if (!customer) {
      throw createError(ErrorDictionary.USER_NOT_FOUND);
    }
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw createError(ErrorDictionary.INVALID_QUANTITY);
    }
    const itemsTotal = orderData.items.reduce(
      (sum, item) => sum + item.price * item.quantity, 0
    );

    const declaredValue = orderData.declaredValue || itemsTotal;
    const shippingCost = calculateShippingCost({
      isProduction: config.nodeEnv === 'production',
      shipmentValue: declaredValue,
      apiKey: config.jwtSecret
    });

    const newOrder = await ordersRepo.create({
      ...orderData,
      declaredValue,
      shippingCost,
      total: itemsTotal + shippingCost,
      status: ORDER_STATUS.CREATED,
      priority: orderData.priority || DELIVERY_PRIORITY.NORMAL
    });

    return newOrder;
  }

  async update(id, orderData) {
    if (orderData.status !== undefined && !Object.values(ORDER_STATUS).includes(orderData.status)) {
      throw createError(ErrorDictionary.INVALID_STATUS, {
        details: { received: orderData.status, allowed: Object.values(ORDER_STATUS) }
      });
    }
    const updatedOrder = await ordersRepo.update(id, orderData);
    if (!updatedOrder) {
      throw createError(ErrorDictionary.ORDER_NOT_FOUND);
    }
    return updatedOrder;
  }

  async delete(id) {
    const deletedOrder = await ordersRepo.delete(id);
    if (!deletedOrder) {
      throw createError(ErrorDictionary.ORDER_NOT_FOUND);
    }
    return deletedOrder;
  }
}

export default new OrdersService();