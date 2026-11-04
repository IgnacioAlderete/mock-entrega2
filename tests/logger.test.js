import { expect } from "chai"
import { requester } from "./helpers/request.js"

const LEVELS = ["debug", "http", "info", "warning", "error", "fatal"]

describe("Logger: endpoint GET /api/logger", () => {

    it("Genera logs de todos los niveles", async () => {
        const response = await requester.get("/api/logger")

        expect(response.status).to.equal(200)
        expect(response.headers["content-type"]).to.match(/application\/json/)
        expect(response.body).to.have.property("status", "success")
        expect(response.body).to.have.property("message", "Se generaron logs de todos los niveles")
    })

    it("Devuelve la lista completa de niveles", async () => {
        const response = await requester.get("/api/logger")

        expect(response.status).to.equal(200)
        expect(response.body.levels).to.deep.equal(LEVELS)
    })

    it("Informa el nivel activo del logger", async () => {
        const response = await requester.get("/api/logger")

        expect(response.status).to.equal(200)
        expect(response.body).to.have.property("activeLevel").that.is.a("string")
        expect(LEVELS).to.include(response.body.activeLevel)
    })

    it("Se puede llamar varias veces seguidas con el mismo resultado", async () => {
        const first = await requester.get("/api/logger")
        const second = await requester.get("/api/logger")

        expect(first.status).to.equal(200)
        expect(second.status).to.equal(200)
        expect(second.body).to.deep.equal(first.body)
    })
})