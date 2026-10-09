import { generateMockUsers } from "../mocks/user.mocks.js";
import usersRepo from "../repositories/users.repo.js";
import bcrypt from "bcrypt"
import {createError, ErrorDictionary} from "../utils/errors.js";
import { MOCKING_PARAMETERS } from "../constants/index.js";
class MocksService {

     // qty válida: entero entre 1 y MOCKING_PARAMETERS.MAX. Si no se envía, usa DEFAULT.
  parseQty(qty) {
    if (qty === undefined) return MOCKING_PARAMETERS.DEFAULT;

    const parsed = typeof qty === "string" && qty.trim() === "" ? NaN : Number(qty);

    if (!Number.isInteger(parsed) || parsed < 1) {
      throw createError(ErrorDictionary.INVALID_QTY, { details: { received: qty } });
    }
    if (parsed > MOCKING_PARAMETERS.MAX) {
      throw createError(ErrorDictionary.QTY_EXCEEDS_MAX, {
        details: { received: parsed, max: MOCKING_PARAMETERS.MAX }
      });
    }
    return parsed;
  }
    getUsers(qty) {
    const parsedQty = this.parseQty(qty);

    try {
      return generateMockUsers(parsedQty);
    } catch (cause) {
      throw createError(ErrorDictionary.MOCK_GENERATION_FAILED, { cause, details: { reason: cause.message } });
    }
  }

    async seedUsers(qty) {
    const users = this.getUsers(qty);

    try {
      const usersToInsert = await Promise.all(
        users.map(async (user) => ({
          ...user,
          password: await bcrypt.hash(user.password, 10)
        }))
      );
      const usersInserted = await usersRepo.insertMany(usersToInsert);

      return { inserted: usersInserted.length, users: usersInserted, collection: "users" };
    } catch (cause) {
      throw createError(ErrorDictionary.SEED_FAILED, { cause, details: { reason: cause.message } });
    }
  }
}

export default new MocksService()