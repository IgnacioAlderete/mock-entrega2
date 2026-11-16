import mongoose from 'mongoose';
import { DOCUMENT_TYPES } from '../constants/index.js';


const documentSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  fileName:     { type: String, required: true },
  path:         { type: String, required: true },
  mimeType:     { type: String, required: true },
  size:         { type: Number, required: true },
  type: {
  type: String,
  enum: [DOCUMENT_TYPES.USER_DOCUMENT, DOCUMENT_TYPES.DRIVER_LICENSE],
  required: true
},
  uploadedAt:   { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'El apellido es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria']
  },
  role: {
    type: String,
    enum: ['admin', 'customer', 'driver', 'store'],
    default: 'customer'
  },
  documents: {
    type: [
      {
        name: { type: String },
        reference: { type: String }
      }
    ],
    default: []
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  documents: {
    type: [documentSchema],
    default: []
  }
}, 

{timestamps: true});

const User = mongoose.model('User', userSchema);

export default User;