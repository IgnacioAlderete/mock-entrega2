import { expect } from "chai"
import { requester } from "./helpers/request.js"

describe("Swagger: documentación en /api/docs", () => {

    it("La ruta /api/docs/ sirve la interfaz de documentación", async () => {
        const response = await requester.get("/api/docs/")

        expect(response.status).to.equal(200)
        expect(response.headers["content-type"]).to.match(/text\/html/)
        expect(response.text).to.include("Swagger UI")
    })

    it("La ruta /api/docs (sin barra final) redirige a /api/docs/", async () => {
        const response = await requester.get("/api/docs")

        expect(response.status).to.equal(301)
        expect(response.headers.location).to.equal("/api/docs/")
    })

    it("La especificación incluye el título de la API y la versión de OpenAPI", async () => {
        const response = await requester.get("/api/docs/swagger-ui-init.js")

        expect(response.status).to.equal(200)
        expect(response.text).to.include("ShipNow")
        expect(response.text).to.include("3.0.0")
    })

    it("La especificación documenta los endpoints principales", async () => {
        const response = await requester.get("/api/docs/swagger-ui-init.js")

        expect(response.status).to.equal(200)
        ;["/api/users", "/api/orders", "/api/mocks/users", "/api/mocks/seed", "/api/logger"].forEach((path) => {
            expect(response.text, `falta ${path} en la documentación`).to.include(path)
        })
    })
})