import swaggerJSDoc from "swagger-jsdoc"

export const options = {
    definition:{
        openapi: "3.0.0",
        info:{
            title: "ShipNow",
            version: "1.0.0",
            descripcion: "Documentación de la API"
        }
    },
    servers:[{url:"http://localhost:8080"}],
    apis:["./src/routes/*.js"]
}

export default swaggerJSDoc(options)
