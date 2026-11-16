import Order from '../models/order.model.js';
class OrdersRepository {
  async addReceipt(orderId, receipt) {
  return Order.findByIdAndUpdate(
    orderId,
    { $push: { receipts: receipt } },
    { returnDocument: 'after', runValidators: true }
  );
}

// orders.repository.js
async findReceipts(orderId) {
  return Order.findById(orderId).select('receipts').lean()
}

  async findAll(filter = {}) {
    return Order.find(filter)
      .populate('customer', 'firstName lastName email')
      .populate('delivery');
  }

  async findById(id) {
    return Order.findById(id)
      .populate('customer', 'firstName lastName email')
      .populate('delivery');
  }

  async create(orderData) {
    return Order.create(orderData);
  }

  async update(id, orderData) {
  return Order.findByIdAndUpdate(id, orderData, { returnDocument: 'after', runValidators: true });
}

  async delete(id) {
    return Order.findByIdAndDelete(id);
  }
}

export default new OrdersRepository();