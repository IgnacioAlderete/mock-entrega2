import deliveriesRepo from '../repositories/deliveries.repo.js';
import ordersRepo from '../repositories/orders.repo.js';
import usersRepo from '../repositories/users.repo.js';
import {createError, ErrorDictionary} from '../utils/error.js';
import { USER_ROLES } from '../constants/index.js';
class DeliveriesService {
  async findAll(filter = {}) {
    return deliveriesRepo.findAll(filter);
  }

  async findById(id) {
    const delivery = await deliveriesRepo.findById(id);
    if (!delivery) {
      throw createError(ErrorDictionary.DELIVER_NOT_FOUND)
    }
    return delivery;
  }

  async create(deliveryData) {
    const order = await ordersRepo.findById(deliveryData.order);
    if (!order) {
      throw createError(ErrorDictionary.ORDER_NOT_FOUND)
    }
    if (deliveryData.driver) {
      const driver = await usersRepo.findById(deliveryData.driver);
      if (!driver) {
        throw createError(ErrorDictionary.DRIVER_NOT_FOUND)
      }
      if (driver.role !== USER_ROLES.DRIVER) {
        throw createError(ErrorDictionary.INVALID_DRIVER_ROLE)
      }
    }

    const newDelivery = await deliveriesRepo.create(deliveryData);
    return newDelivery;
  }

  async update(id, deliveryData) {
    const updatedDelivery = await deliveriesRepo.update(id, deliveryData);
    if (!updatedDelivery) {
      throw createError(ErrorDictionary.DELIVER_NOT_FOUND)
    }
    return updatedDelivery;
  }

  async delete(id) {
    const deletedDelivery = await deliveriesRepo.delete(id);
    if (!deletedDelivery) {
      throw createError(ErrorDictionary.DELIVER_NOT_FOUND)
    }
    return deletedDelivery;
  }
}

export default new DeliveriesService();