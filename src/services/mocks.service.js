import { generateMockUsers } from "../mocks/user.mocks.js";
import usersRepo from "../repositories/users.repo.js";
import bcrypt from "bcrypt"
import { createError, ErrorDictionary } from "../utils/error.js";
import { MOCKING_PARAMETERS } from "../constants/index.js";
class MocksService {
    // qty válida: entero entre 1 y MOCKING_PARAMETERS.MAX. Si no se envía, usa DEFAULT.
    parseQty(qty) {
        if (qty === undefined) return MOCKING_PARAMETERS.DEFAULT

        const parsedQty = typeof qty === "string" && qty.trim() === "" ? NaN : Number(qty)

        if (!Number.isInteger(parsedQty) || parsedQty < 1) {
            throw createError(ErrorDictionary.INVALID_QTY, { details: { received: qty } })
        }
        if (parsedQty > MOCKING_PARAMETERS.MAX) {
            throw createError(ErrorDictionary.QTY_EXCEEDS_MAX, {
                details: { received: parsedQty, max: MOCKING_PARAMETERS.MAX }
            })
        }
        return parsedQty
    }

    getUsers(qty) {
        const parsedQty = this.parseQty(qty)
        try {
            return generateMockUsers(parsedQty)
        } catch (cause) {
            throw createError(ErrorDictionary.MOCK_GENERATION_FAILED, { cause, details: { reason: cause.message } })
        }
    }

    async seedUsers(qty){
        const users = this.getUsers(qty)
        try {
            const usersToInsert = await Promise.all(
                users.map(async (user)=>({
                    ...user,
                    password: await bcrypt.hash(user.password, 10)
                }))
            )
            const usersInserted = await usersRepo.insertMany(usersToInsert)
            return {
                inserted: usersInserted.length,
                users: usersInserted,
                collection: "users"
            }
        } catch (cause) {
            throw createError(ErrorDictionary.SEED_FAILED, { cause, details: { reason: cause.message } })
        }
    }

    async seedOrders(qty, users){


    }

    async seedDeliveries(qty, orders){

    }
}

async function seed(){
    const mockService = new MocksService()

    let usersMocked = await mockService.seedUsers(10)
    let ordersMocked = await mockService.seedOrders(10, usersMocked)
    let deliveriesMocked = await mockService.seedDeliveries(10 , ordersMocked)

    return {
        users: {
            inserted: usersMocked.inserted
        },
        ordersMocked,
        deliveriesMocked
    }
}

export default new MocksService()