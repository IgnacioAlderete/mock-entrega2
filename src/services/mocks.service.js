import { generateMockUsers } from "../mocks/user.mocks.js";
import usersRepo from "../repositories/users.repo.js";
import bcrypt from "bcrypt"
import AppError from "../utils/errors.js";
import { MOCKING_PARAMETERS } from "../constants/index.js";
class MocksService {
    getUsers(qty = MOCKING_PARAMETERS.DEFAULT){
        let parsedQty = Number(qty)
        if(!Number.isInteger(parsedQty)){
            throw new AppError("qty debe ser un numero")
        }
        console.log(MOCKING_PARAMETERS, parsedQty)
        if(parsedQty > MOCKING_PARAMETERS.MAX){
            throw new AppError(`el maximo de qty es hasta ${ MOCKING_PARAMETERS.MAX}`)
        }
        return generateMockUsers(parsedQty)
    }

    async seedUsers(qty){
        let users = this.getUsers(qty)
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
            collection: "user"
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