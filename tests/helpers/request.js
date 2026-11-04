import supertest from "supertest"
import app from "../../src/app.js"

// Supertest recibe la app de Express directamente: no hace falta levantar el servidor ni abrir un puerto.
export const requester = supertest(app)