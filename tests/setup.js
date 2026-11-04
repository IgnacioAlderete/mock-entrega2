// Hooks globales: se cargan antes que cualquier test (ver .mocharc.json).
// Conectan mongoose a la base de TEST y la dejan limpia al terminar.
import mongoose from "mongoose"
import config from "../src/config/index.js"
import { clearCollections } from "./helpers/db.js"

before(async function () {
    this.timeout(20000)

    // Seguro contra accidentes: estos tests borran colecciones enteras.
    if (config.nodeEnv !== "test") {
        throw new Error("Los tests tienen que correr con NODE_ENV=test. Usá `npm test`.")
    }

    await mongoose.connect(config.mongoUri)

    if (!/test/i.test(mongoose.connection.name)) {
        await mongoose.disconnect()
        throw new Error(
            `La base "${mongoose.connection.name}" no parece de testing. ` +
            `Cambiá MONGODB_URI en .env.test para que el nombre incluya "test".`
        )
    }

    // Asegura que los índices (por ejemplo, email único) existan antes del primer test.
    await Promise.all(Object.values(mongoose.models).map((model) => model.init()))
    await clearCollections()
})

after(async () => {
    await clearCollections()
    await mongoose.disconnect()
})