import { expect } from "chai"
import { requester } from "./helpers/request.js"
import { expectError } from "./helpers/expectError.js"
import { ErrorDictionary } from "../src/utils/error.js"

describe("Rutas inexistentes", () => {

    it("GET a una ruta de /api que no existe devuelve 404 con el formato de error", async () => {
        const response = await requester.get("/api/ruta-que-no-existe")

        const error = expectError(response, ErrorDictionary.ROUTE_NOT_FOUND)
        expect(error.details).to.deep.equal({ method: "GET", path: "/api/ruta-que-no-existe" })
    })

    it("POST a una ruta que no existe devuelve 404 e indica el método usado", async () => {
        const response = await requester.post("/api/ruta-que-no-existe").send({})

        const error = expectError(response, ErrorDictionary.ROUTE_NOT_FOUND)
        expect(error.details).to.deep.equal({ method: "POST", path: "/api/ruta-que-no-existe" })
    })

    it("Una ruta fuera de /api también devuelve 404", async () => {
        const response = await requester.get("/otra-ruta")

        const error = expectError(response, ErrorDictionary.ROUTE_NOT_FOUND)
        expect(error.details).to.deep.equal({ method: "GET", path: "/otra-ruta" })
    })

    it("Un recurso conocido con una subruta inexistente devuelve 404", async () => {
        const response = await requester.get("/api/users/123/no-existe")

        expectError(response, ErrorDictionary.ROUTE_NOT_FOUND)
    })
})