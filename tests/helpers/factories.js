import { requester } from "./request.js"

// Datos de prueba controlados y repetibles: se crean a través de la propia API
// dentro del entorno de test, y la base se limpia entre tests (ver clearCollections).
let sequence = 0

export const buildUserData = (overrides = {}) => {
    sequence++
    return {
        firstName: "Jose",
        lastName: "Perez",
        email: `usuario_${sequence}@shipnow-test.com`,
        password: "123456",
        ...overrides
    }
}

export const createUser = async (overrides = {}) => {
    const response = await requester.post("/api/users").send(buildUserData(overrides))
    if (response.status !== 201) {
        throw new Error(`No se pudo crear el usuario de prueba (${response.status}): ${JSON.stringify(response.body)}`)
    }
    return response.body.payload
}

// Items fijos para que el subtotal sea conocido: 2 x 5000 + 1 x 2500 = 12500
export const ORDER_ITEMS = [
    { name: "Pizza muzzarella", quantity: 2, price: 5000 },
    { name: "Gaseosa 1.5L", quantity: 1, price: 2500 }
]
export const ORDER_SUBTOTAL = 12500

export const buildOrderData = (customerId, overrides = {}) => ({
    customer: customerId,
    items: ORDER_ITEMS,
    deliveryAddress: "Av. Siempre Viva 742",
    priority: "high",
    ...overrides
})

export const createOrder = async (customerId, overrides = {}) => {
    const response = await requester.post("/api/orders").send(buildOrderData(customerId, overrides))
    if (response.status !== 201) {
        throw new Error(`No se pudo crear el pedido de prueba (${response.status}): ${JSON.stringify(response.body)}`)
    }
    return response.body.payload
}

export const INVALID_ID = "123abc"
export const MALFORMED_JSON = '{"firstName":"Jose","lastName":'