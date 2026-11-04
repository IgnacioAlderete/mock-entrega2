import { expect } from "chai"

// Valida una respuesta de error contra una entrada de ErrorDictionary:
//   - status HTTP
//   - formato { status: "error", error: { name, code, message } }
// Acepta una lista de entradas cuando el endpoint puede responder con cualquiera de ellas.
// Devuelve el objeto `error` por si el test quiere revisar `details`.
export const expectError = (response, expected) => {
    const options = Array.isArray(expected) ? expected : [expected]
    const match = options.find((definition) => definition.name === response.body?.error?.name) ?? options[0]

    expect(response.status, `status HTTP (body: ${JSON.stringify(response.body)})`).to.equal(match.status)
    expect(response.headers["content-type"]).to.match(/application\/json/)
    expect(response.body).to.have.property("status", "error")
    expect(response.body).to.have.property("error").that.is.an("object")
    expect(response.body.error).to.include({
        name: match.name,
        code: match.code,
        message: match.message
    })

    return response.body.error
}