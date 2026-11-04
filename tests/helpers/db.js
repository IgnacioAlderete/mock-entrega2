import mongoose from "mongoose"

// Vacía todas las colecciones de la base de test (conserva los índices).
export const clearCollections = async () => {
    const collections = Object.values(mongoose.connection.collections)
    await Promise.all(collections.map((collection) => collection.deleteMany({})))
}

export const countDocuments = (collection, filter = {}) =>
    mongoose.connection.collection(collection).countDocuments(filter)

export const findAll = (collection, filter = {}) =>
    mongoose.connection.collection(collection).find(filter).toArray()

export const toObjectId = (id) => new mongoose.Types.ObjectId(id)

// Un ObjectId válido que no existe en la base.
export const nonExistentId = () => new mongoose.Types.ObjectId().toString()