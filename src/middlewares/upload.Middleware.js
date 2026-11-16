// src/middlewares/upload.middleware.js
import multer from 'multer'
import path from 'path'
import fs from 'fs'

import { createError, ErrorDictionary } from '../utils/error.js'

const MAX_SIZE = 5 * 1024 * 1024

const buildStorage = (folder) => {
  fs.mkdirSync(folder, { recursive: true }) // crea la carpeta si no existe
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, folder),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname)
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`)
    }
  })
}

const buildFilter = (allowedMimeTypes) => (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) return cb(null, true)
  cb(createError(ErrorDictionary.INVALID_FILE_TYPE))
}

const buildUploader = (folder, allowedMimeTypes) =>
  multer({
    storage: buildStorage(folder),
    fileFilter: buildFilter(allowedMimeTypes),
    limits: { fileSize: MAX_SIZE }
  })

// Documentos: identidad, licencia, etc.
export const uploadDocument = buildUploader('uploads/documents', [
  'application/pdf', 'image/jpeg', 'image/png'
])

// Comprobantes: pagos, entregas, etc.
export const uploadReceipt = buildUploader('uploads/receipts', [
  'application/pdf', 'image/jpeg', 'image/png', 'image/webp'
])