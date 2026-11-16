import fs from 'fs/promises'
import usersRepo from '../repositories/users.repo.js'
import { createError, ErrorDictionary } from '../utils/error.js'
import { USER_ROLES, DOCUMENT_TYPES } from '../constants/index.js'
import logger from '../utils/logger.js'

const USERS_RELATED_DOCUMENTS = [
  DOCUMENT_TYPES.DRIVER_LICENSE,
  DOCUMENT_TYPES.USER_DOCUMENT
]

class UsersService {
  async addDocument(id, file, type) {
    if (!file) throw createError(ErrorDictionary.FILE_REQUIRED)

    try {
      if (!USERS_RELATED_DOCUMENTS.includes(type)) {
        throw createError(ErrorDictionary.INVALID_DOCUMENT_TYPE)
      }

      const user = await usersRepo.findById(id)
      if (!user) throw createError(ErrorDictionary.USER_NOT_FOUND)

      // Regla de negocio: solo un driver puede subir licencia
      if (type === DOCUMENT_TYPES.DRIVER_LICENSE && user.role !== USER_ROLES.DRIVER) {
        throw createError(ErrorDictionary.DOCUMENT_NOT_ALLOWED_FOR_ROLE)
      }

      const updatedUser = await usersRepo.addDocument(id, {
        originalName: file.originalname,
        fileName: file.filename,
        path: file.path,
        mimeType: file.mimetype,
        size: file.size,
        type,
        uploadedAt: new Date()
      })

      logger.info(`Documento subido: usuario ${id}, tipo ${type}, archivo ${file.filename}`)
      return updatedUser
    } catch (error) {
      await fs.unlink(file.path).catch(() => {})
      throw error
    }
  }
  // ...resto igual
}