import ordersRepo from '../repositories/orders.repo.js';
import usersRepo from '../repositories/users.repo.js';
import {createError, ErrorDictionary} from '../utils/error.js';
import config from '../config/index.js';
import { ORDER_STATUS, DELIVERY_PRIORITY } from '../constants/index.js';

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