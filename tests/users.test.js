import { expect } from "chai"
import { requester } from "./helpers/request.js"
import { expectError } from "./helpers/expectError.js"
import { clearCollections, countDocuments, nonExistentId } from "./helpers/db.js"
import { buildUserData, createUser, INVALID_ID, MALFORMED_JSON } from "./helpers/factories.js"
import { ErrorDictionary } from "../src/utils/error.js"

describe("Users: endpoints de /api/users", () => {

    // Cada test arranca con la base vacía y crea lo que necesita: no dependen del orden.
    beforeEach(clearCollections)

    describe("POST /api/users", () => {

        it("Crear un usuario con datos válidos", async () => {
            const data = buildUserData()
            const response = await requester.post("/api/users").send(data)

            expect(response.status).to.equal(201)
            expect(response.body).to.have.property("status", "success")
            expect(response.body.payload).to.include({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email
            })
            expect(response.body.payload).to.have.property("_id").that.is.a("string")

            expect(await countDocuments("users", { email: data.email })).to.equal(1)
        })

        it("Error: JSON mal formado", async () => {
            const response = await requester.post("/api/users").set("Content-Type", "application/json").send(MALFORMED_JSON)
            expectError(response, ErrorDictionary.INVALID_JSON)
        })

        it("Error: faltan campos obligatorios", async () => {
            const response = await requester.post("/api/users").send({ firstName: "Solo" })
            // Según dónde se detecte la falta, el endpoint responde con una de estas dos (ambas 400, código 6)
            expectError(response, [ErrorDictionary.MISSING_FIELDS, ErrorDictionary.VALIDATION_ERROR])
            expect(await countDocuments("users")).to.equal(0)
        })

        it("Error: no se puede crear un admin", async () => {
            const admin = buildUserData({ role: "admin" })
            const response = await requester.post("/api/users").send(admin)

            expectError(response, ErrorDictionary.ADMIN_CREATION_FORBIDDEN)
            expect(await countDocuments("users", { email: admin.email })).to.equal(0)
        })

        it("Error: el usuario ya existe", async () => {
            const existing = await createUser()
            const response = await requester.post("/api/users").send(buildUserData({ email: existing.email }))

            expectError(response, ErrorDictionary.USER_ALREADY_EXISTS)
            expect(await countDocuments("users", { email: existing.email })).to.equal(1)
        })
    })

    describe("GET /api/users", () => {

        it("Listar: sin usuarios devuelve un array vacío", async () => {
            const response = await requester.get("/api/users")

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body.payload).to.be.an("array").that.is.empty
        })

        it("Listar: devuelve todos los usuarios con su estructura", async () => {
            const first = await createUser()
            const second = await createUser({ firstName: "Maria", lastName: "Gomez" })

            const response = await requester.get("/api/users")

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body.payload).to.be.an("array").with.lengthOf(2)
            expect(response.body.payload.map((u) => u._id)).to.have.members([first._id, second._id])
            response.body.payload.forEach((user) => {
                expect(user).to.include.keys("_id", "firstName", "lastName", "email")
            })
        })
    })

    describe("GET /api/users/:id", () => {

        it("Buscar por id: usuario encontrado", async () => {
            const user = await createUser()
            const response = await requester.get(`/api/users/${user._id}`)

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body.payload).to.include({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            })
        })

        it("Error: ID inválido", async () => {
            const response = await requester.get(`/api/users/${INVALID_ID}`)
            expectError(response, ErrorDictionary.INVALID_ID)
        })

        it("Error: usuario no encontrado", async () => {
            const response = await requester.get(`/api/users/${nonExistentId()}`)
            expectError(response, ErrorDictionary.USER_NOT_FOUND)
        })
    })

    describe("PUT /api/users/:id", () => {

        it("Actualizar: usuario actualizado", async () => {
            const user = await createUser()
            const response = await requester.put(`/api/users/${user._id}`).send({ lastName: "Gonzalez", isAvailable: false })

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body.payload).to.include({
                _id: user._id,
                firstName: user.firstName,
                lastName: "Gonzalez",
                isAvailable: false
            })

            const finded = await requester.get(`/api/users/${user._id}`)
            expect(finded.body.payload).to.include({ lastName: "Gonzalez", isAvailable: false })
        })

        it("Error: ID inválido", async () => {
            const response = await requester.put(`/api/users/${INVALID_ID}`).send({ firstName: "Otro" })
            expectError(response, ErrorDictionary.INVALID_ID)
        })

        it("Error: JSON mal formado", async () => {
            const user = await createUser()
            const response = await requester.put(`/api/users/${user._id}`).set("Content-Type", "application/json").send(MALFORMED_JSON)
            expectError(response, ErrorDictionary.INVALID_JSON)
        })

        it("Error: usuario no encontrado", async () => {
            const response = await requester.put(`/api/users/${nonExistentId()}`).send({ firstName: "Otro" })
            expectError(response, ErrorDictionary.USER_NOT_FOUND)
        })
    })

    describe("DELETE /api/users/:id", () => {

        it("Eliminar: usuario eliminado", async () => {
            const user = await createUser()
            const response = await requester.delete(`/api/users/${user._id}`)

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")

            expect(await countDocuments("users")).to.equal(0)
            const finded = await requester.get(`/api/users/${user._id}`)
            expectError(finded, ErrorDictionary.USER_NOT_FOUND)
        })

        it("Error: ID inválido", async () => {
            const response = await requester.delete(`/api/users/${INVALID_ID}`)
            expectError(response, ErrorDictionary.INVALID_ID)
        })

        it("Error: usuario no encontrado", async () => {
            const response = await requester.delete(`/api/users/${nonExistentId()}`)
            expectError(response, ErrorDictionary.USER_NOT_FOUND)
        })
    })
})