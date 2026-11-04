import { expect } from "chai"
import { requester } from "./helpers/request.js"
import { expectError } from "./helpers/expectError.js"
import { clearCollections, countDocuments, nonExistentId, toObjectId } from "./helpers/db.js"
import {
    buildOrderData, createOrder, createUser,
    INVALID_ID, MALFORMED_JSON, ORDER_ITEMS, ORDER_SUBTOTAL
} from "./helpers/factories.js"
import { ErrorDictionary } from "../src/utils/error.js"

describe("Orders: endpoints de /api/orders", () => {

    let customer

    // Cada test arranca con la base vacía y un cliente propio (los pedidos necesitan uno).
    beforeEach(async () => {
        await clearCollections()
        customer = await createUser()
    })

    describe("POST /api/orders", () => {

        it("Crear un pedido con datos válidos", async () => {
            const response = await requester.post("/api/orders").send(buildOrderData(customer._id))

            expect(response.status).to.equal(201)
            expect(response.body).to.have.property("status", "success")

            const order = response.body.payload
            expect(order).to.have.property("_id").that.is.a("string")
            expect(order).to.include({
                customer: customer._id,
                deliveryAddress: "Av. Siempre Viva 742",
                status: "created",
                priority: "high"
            })
            expect(order.items).to.be.an("array").with.lengthOf(ORDER_ITEMS.length)
            expect(order.items[0]).to.include(ORDER_ITEMS[0])
            expect(order.delivery).to.equal(null)
            // total, shippingCost y declaredValue los calcula el servidor
            expect(order.total).to.be.a("number").and.to.be.at.least(ORDER_SUBTOTAL)
            expect(order.shippingCost).to.be.a("number")
            expect(order.declaredValue).to.be.a("number")

            expect(await countDocuments("orders", { _id: toObjectId(order._id) })).to.equal(1)
        })

        it("Crear un pedido sin prioridad usa los valores por defecto", async () => {
            const data = buildOrderData(customer._id)
            delete data.priority
            const response = await requester.post("/api/orders").send(data)

            expect(response.status).to.equal(201)
            expect(response.body.payload).to.include({ status: "created", priority: "normal" })
            expect(response.body.payload.delivery).to.equal(null)
        })

        it("Error: JSON mal formado", async () => {
            const response = await requester.post("/api/orders").set("Content-Type", "application/json").send(MALFORMED_JSON)
            expectError(response, ErrorDictionary.INVALID_JSON)
        })

        it("Error: datos incompletos (sin items)", async () => {
            const response = await requester.post("/api/orders").send({ customer: customer._id })
            expectError(response, ErrorDictionary.INVALID_QUANTITY)
            expect(await countDocuments("orders")).to.equal(0)
        })

        it("Error: el pedido tiene la lista de items vacía", async () => {
            const response = await requester.post("/api/orders").send(buildOrderData(customer._id, { items: [] }))
            expectError(response, ErrorDictionary.INVALID_QUANTITY)
            expect(await countDocuments("orders")).to.equal(0)
        })

        it("Error: falta la dirección de entrega", async () => {
            const data = buildOrderData(customer._id)
            delete data.deliveryAddress
            const response = await requester.post("/api/orders").send(data)

            const error = expectError(response, ErrorDictionary.VALIDATION_ERROR)
            expect(error.details).to.be.an("array").that.is.not.empty
            expect(await countDocuments("orders")).to.equal(0)
        })

        it("Error: item con cantidad inválida", async () => {
            const items = [{ name: "Pizza", quantity: 0, price: 5000 }]
            const response = await requester.post("/api/orders").send(buildOrderData(customer._id, { items }))

            expectError(response, ErrorDictionary.VALIDATION_ERROR)
            expect(await countDocuments("orders")).to.equal(0)
        })

        it("Error: item con precio negativo", async () => {
            const items = [{ name: "Pizza", quantity: 1, price: -10 }]
            const response = await requester.post("/api/orders").send(buildOrderData(customer._id, { items }))

            expectError(response, ErrorDictionary.VALIDATION_ERROR)
            expect(await countDocuments("orders")).to.equal(0)
        })

        it("Error: prioridad inválida", async () => {
            const response = await requester.post("/api/orders").send(buildOrderData(customer._id, { priority: "urgentisimo" }))

            expectError(response, ErrorDictionary.VALIDATION_ERROR)
            expect(await countDocuments("orders")).to.equal(0)
        })

        it("Error: ID de cliente inválido", async () => {
            const response = await requester.post("/api/orders").send(buildOrderData(INVALID_ID))
            expectError(response, ErrorDictionary.INVALID_ID)
        })

        it("Error: cliente no encontrado", async () => {
            const response = await requester.post("/api/orders").send(buildOrderData(nonExistentId()))

            expectError(response, ErrorDictionary.USER_NOT_FOUND)
            expect(await countDocuments("orders")).to.equal(0)
        })
    })

    describe("GET /api/orders", () => {

        it("Listar: sin pedidos devuelve un array vacío", async () => {
            const response = await requester.get("/api/orders")

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body.payload).to.be.an("array").that.is.empty
        })

        it("Listar: devuelve todos los pedidos con su estructura", async () => {
            const first = await createOrder(customer._id)
            const second = await createOrder(customer._id, { deliveryAddress: "Calle Falsa 123", priority: "low" })

            const response = await requester.get("/api/orders")

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body.payload).to.be.an("array").with.lengthOf(2)
            expect(response.body.payload.map((o) => o._id)).to.have.members([first._id, second._id])
            response.body.payload.forEach((order) => {
                expect(order).to.include.keys("_id", "customer", "items", "deliveryAddress", "total", "status", "priority")
                expect(order.items).to.be.an("array").that.is.not.empty
            })
        })
    })

    describe("GET /api/orders/:id", () => {

        it("Buscar por id: pedido encontrado con el cliente populado", async () => {
            const order = await createOrder(customer._id)
            const response = await requester.get(`/api/orders/${order._id}`)

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body.payload).to.include({
                _id: order._id,
                deliveryAddress: "Av. Siempre Viva 742",
                status: "created",
                priority: "high"
            })
            expect(response.body.payload.total).to.be.a("number").and.to.be.at.least(ORDER_SUBTOTAL)
            expect(response.body.payload.items).to.be.an("array").with.lengthOf(ORDER_ITEMS.length)
            expect(response.body.payload.customer).to.include({
                _id: customer._id,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email
            })
        })

        it("Error: ID inválido", async () => {
            const response = await requester.get(`/api/orders/${INVALID_ID}`)
            expectError(response, ErrorDictionary.INVALID_ID)
        })

        it("Error: pedido no encontrado", async () => {
            const response = await requester.get(`/api/orders/${nonExistentId()}`)
            expectError(response, ErrorDictionary.ORDER_NOT_FOUND)
        })
    })

    describe("PUT /api/orders/:id (datos y estados)", () => {

        it("Actualizar: datos del pedido", async () => {
            const order = await createOrder(customer._id)
            const response = await requester.put(`/api/orders/${order._id}`).send({ deliveryAddress: "Calle Nueva 456", priority: "low" })

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property("status", "success")
            expect(response.body.payload).to.include({
                _id: order._id,
                deliveryAddress: "Calle Nueva 456",
                priority: "low",
                status: "created"
            })

            const finded = await requester.get(`/api/orders/${order._id}`)
            expect(finded.body.payload).to.include({ deliveryAddress: "Calle Nueva 456", priority: "low" })
        })

        it("Estados: el pedido avanza created → assigned → picked_up → in_transit → delivered", async () => {
            const order = await createOrder(customer._id)
            expect(order.status).to.equal("created")

            for (const status of ["assigned", "picked_up", "in_transit", "delivered"]) {
                const response = await requester.put(`/api/orders/${order._id}`).send({ status })

                expect(response.status, `cambio a ${status}`).to.equal(200)
                expect(response.body).to.have.property("status", "success")
                expect(response.body.payload).to.include({ _id: order._id, status })

                const finded = await requester.get(`/api/orders/${order._id}`)
                expect(finded.body.payload).to.have.property("status", status)
            }
        })

        it("Estados: el pedido se puede cancelar", async () => {
            const order = await createOrder(customer._id)
            const response = await requester.put(`/api/orders/${order._id}`).send({ status: "cancelled" })

            expect(response.status).to.equal(200)
            expect(response.body.payload).to.include({ _id: order._id, status: "cancelled" })
        })

        it("Error: estado inválido", async () => {
            const order = await createOrder(customer._id)
            const response = await requester.put(`/api/orders/${order._id}`).send({ status: "volando" })

            expectError(response, ErrorDictionary.INVALID_STATUS)

            const finded = await requester.get(`/api/orders/${order._id}`)
            expect(finded.body.payload).to.have.property("status", "created")
        })

        it("Error: ID inválido", async () => {
            const response = await requester.put(`/api/orders/${INVALID_ID}`).send({ deliveryAddress: "Otra" })
            expectError(response, ErrorDictionary.INVALID_ID)
        })

        it("Error: JSON mal formado", async () => {
            const order = await createOrder(customer._id)
            const response = await requester.put(`/api/orders/${order._id}`).set("Content-Type", "application/json").send(MALFORMED_JSON)
            expectError(response, ErrorDictionary.INVALID_JSON)
        })

        it("Error: pedido no encontrado", async () => {
            const response = await requester.put(`/api/orders/${nonExistentId()}`).send({ deliveryAddress: "Otra" })
            expectError(response, ErrorDictionary.ORDER_NOT_FOUND)
        })
    })

    describe("DELETE /api/orders/:id", () => {

        it("Eliminar: pedido eliminado", async () => {
            const order = await createOrder(customer._id)
            const response = await requester.delete(`/api/orders/${order._id}`)

            expect(response.status).to.equal(200)
            expect(response.body).to.deep.equal({ status: "success", message: "Pedido eliminado" })

            expect(await countDocuments("orders", { _id: toObjectId(order._id) })).to.equal(0)
            const finded = await requester.get(`/api/orders/${order._id}`)
            expectError(finded, ErrorDictionary.ORDER_NOT_FOUND)
        })

        it("Error: ID inválido", async () => {
            const response = await requester.delete(`/api/orders/${INVALID_ID}`)
            expectError(response, ErrorDictionary.INVALID_ID)
        })

        it("Error: pedido no encontrado", async () => {
            const response = await requester.delete(`/api/orders/${nonExistentId()}`)
            expectError(response, ErrorDictionary.ORDER_NOT_FOUND)
        })
    })
})