import ordersService from '../services/orders.service.js';
class OrdersController {
    async uploadReceipt(req, res, next) {
    try {
      const order = await ordersService.uploadReceipt(
        req.params.id,
        req.file,
        req.body.type
      )

      res.status(201).json({
        ok: true,
        message: 'Comprobante subido correctamente',
        data: order
      })
    } catch (error) {
      next(error)
    }
  
}

  async getReceipts(req, res, next) {
    try {
      const receipts = await ordersService.getReceipts(req.params.id)
      res.status(200).json({ ok: true, data: receipts })
  } catch (error) {
      next(error)
  }
}
  async findAll(req, res, next) {
    try {
      const orders = await ordersService.findAll();
      res.json({ status: 'success', payload: orders });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const order = await ordersService.findById(req.params.id);
      res.json({ status: 'success', payload: order });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const newOrder = await ordersService.create(req.body);
      res.status(201).json({ status: 'success', payload: newOrder });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updatedOrder = await ordersService.update(req.params.id, req.body);
      res.json({ status: 'success', payload: updatedOrder });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await ordersService.delete(req.params.id);
      res.json({ status: 'success', message: 'Pedido eliminado' });
    } catch (error) {
      next(error);
    }
  }
}

export default new OrdersController();