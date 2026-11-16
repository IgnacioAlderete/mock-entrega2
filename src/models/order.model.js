import mongoose from 'mongoose';
import { RECEIPT_TYPES } from '../constants/index.js';

const receiptSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  fileName:     { type: String, required: true },
  path:         { type: String, required: true },
  mimeType:     { type: String, required: true },
  size:         { type: Number, required: true },
  type: { type: String, enum: Object.values(RECEIPT_TYPES), required: true },
  uploadedAt:   { type: Date, default: Date.now }
});

const orderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del item es obligatorio']
  },
  quantity: {
    type: Number,
    required: [true, 'La cantidad es obligatoria'],
    min: [1, 'La cantidad mínima es 1']
  },
  price: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El cliente es obligatorio']
  },
  items: {
    type: [orderItemSchema],
    validate: {
      validator: (v) => v.length > 0,
      message: 'El pedido debe tener al menos un item'
    }
  },
  deliveryAddress: {
    type: String,
    required: [true, 'La dirección de entrega es obligatoria']
  },
  total: {
    type: Number,
    default: 0
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  declaredValue: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['created', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
    default: 'created'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  },
  delivery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Delivery',
    default: null
  },
    receipts: { type: [receiptSchema], default: [] }
}, { timestamps: true });


const Order = mongoose.model('Order', orderSchema);

export default Order;