import swaggerJSDoc from 'swagger-jsdoc';
import config from './index.js';

export const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShipNow',
      version: '1.0.0',
      description: 'Documentación de la API'
    },
    servers: [{ url: config.publicUrl }],
    // components va DENTRO de definition: afuera swagger-jsdoc lo ignora
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: false },
            code: { type: 'string' },
            message: { type: 'string' }
          }
        },
        Document: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            originalName: { type: 'string', example: 'dni-frente.jpg' },
            fileName: { type: 'string', example: '1731345600000-48213.jpg' },
            mimeType: { type: 'string', example: 'image/jpeg' },
            size: { type: 'number', example: 204800 },
            type: { type: 'string', enum: ['dni', 'license', 'proofOfAddress'] },
            uploadedAt: { type: 'string', format: 'date-time' }
          }
        },
        Receipt: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            originalName: { type: 'string', example: 'comprobante.pdf' },
            fileName: { type: 'string', example: '1731345600000-48213.pdf' },
            mimeType: { type: 'string', example: 'application/pdf' },
            size: { type: 'number', example: 204800 },
            type: { type: 'string', enum: ['payment', 'delivery', 'refund'] },
            uploadedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  },
  // Rutas relativas a la carpeta desde donde se ejecuta node (/app en Docker)
  apis: ['./src/routes/*.js', './src/app.js']
};

export default swaggerJSDoc(options);