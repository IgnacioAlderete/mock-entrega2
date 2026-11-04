import { expect } from "chai"
import { requester } from "./helpers/request.js"
import { expectError } from "./helpers/expectError.js"
import { clearCollections, countDocuments, findAll } from "./helpers/db.js"
import { ErrorDictionary } from "../src/utils/error.js"

// Cantidades que el servicio rechaza: no son enteros mayores a 0
const INVALID_QTYS = ["abc", "0", "-5", "1.5"]
// Pensada para superar cualquier MOCKING_PARAMETERS.MAX razonable
const QTY_OVER_MAX = "1000000"

describe("Mocks: endpoints de /api/mocks", () => {

    beforeEach(clearCollections)

    describe("GET /api/mocks/users", () => {

        it("Generar usuarios: cantidad por defecto (sin qty)", async () => {
            const response = await requester.get("/api/mocks/users")

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body.payload).to.be.an("array").that.is.not.empty
        })

        it("Generar usuarios: cantidad indicada, con la estructura esperada", async () => {
            const response = await requester.get("/api/mocks/users?qty=5")

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body.payload).to.be.an("array").with.lengthOf(5)
            response.body.payload.forEach((user) => {
                expect(user).to.have.property("email").that.is.a("string")
                expect(user).to.have.property("password").that.is.a("string")
            })
        })

        it("Generar usuarios: no se guardan en la base de datos", async () => {
            await requester.get("/api/mocks/users?qty=3")
            expect(await countDocuments("users")).to.equal(0)
        })

        INVALID_QTYS.forEach((qty) => {
            it(`Error: qty inválida (${qty})`, async () => {
                const response = await requester.get(`/api/mocks/users?qty=${qty}`)
                expectError(response, ErrorDictionary.INVALID_QTY)
            })
        })

        it("Error: qty supera el máximo permitido", async () => {
            const response = await requester.get(`/api/mocks/users?qty=${QTY_OVER_MAX}`)
            expectError(response, ErrorDictionary.QTY_EXCEEDS_MAX)
        })
    })

    describe("POST /api/mocks/seed", () => {

        it("Seed: inserta la cantidad indicada", async () => {
            const response = await requester.post("/api/mocks/seed?qty=5")

            expect(response.status).to.equal(201)
            expect(response.body).to.have.property("status", "success")
            expect(response.body.payload).to.deep.equal({ inserted: 5, collection: "users" })
            expect(await countDocuments("users")).to.equal(5)
        })

        it("Seed: las contraseñas se guardan hasheadas con bcrypt", async () => {
            await requester.post("/api/mocks/seed?qty=3")

            const users = await findAll("users")
            expect(users).to.have.lengthOf(3)
            users.forEach((user) => {
                expect(user).to.have.property("password").that.is.a("string")
                expect(user.password).to.match(/^\$2[aby]\$/)
            })
        })

        it("Seed: cantidad por defecto (sin qty)", async () => {
            const response = await requester.post("/api/mocks/seed")

            expect(response.status).to.equal(201)
            expect(response.body).to.have.property("status", "success")
            expect(response.body.payload).to.have.property("collection", "users")
            expect(response.body.payload.inserted).to.be.a("number").that.is.above(0)
            expect(await countDocuments("users")).to.equal(response.body.payload.inserted)
        })

        INVALID_QTYS.forEach((qty) => {
            it(`Error: qty inválida (${qty}) y no inserta nada`, async () => {
                const response = await requester.post(`/api/mocks/seed?qty=${qty}`)

                expectError(response, ErrorDictionary.INVALID_QTY)
                expect(await countDocuments("users")).to.equal(0)
            })
        })

        it("Error: qty supera el máximo permitido y no inserta nada", async () => {
            const response = await requester.post(`/api/mocks/seed?qty=${QTY_OVER_MAX}`)

            expectError(response, ErrorDictionary.QTY_EXCEEDS_MAX)
            expect(await countDocuments("users")).to.equal(0)
        })
    })
})