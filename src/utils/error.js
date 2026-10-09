// error con status HTTP para el middleware

/*
 class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default AppError; 

*/

export const EErrors = {
  ROUTING_ERROR:1,
  INVALID_TYPES_ERROR:2,
  DATA_BASE_ERROR:3,
  NOT_FOUND_ERROR:4,
  RESOURCE_ALREADY_EXISTS:5,
  INVALID_RESOURCE_PROPERTY:6,
  MISSING_API_KEY:7,
  MOCK_GENERATION_ERROR: 8

}
export const ErrorDictionary = {
  // 404
  USER_NOT_FOUND:     { name: "UserNotFound",     code: EErrors.NOT_FOUND_ERROR, status: 404, message: "Usuario no encontrado" },
  ORDER_NOT_FOUND:    { name: "OrderNotFound",    code: EErrors.NOT_FOUND_ERROR, status: 404, message: "Pedido no encontrado" },
  DELIVER_NOT_FOUND:  { name: "DeliverNotFound",  code: EErrors.NOT_FOUND_ERROR, status: 404, message: "Entrega no encontrada" },
  DRIVER_NOT_FOUND:   { name: "DriverNotFound",   code: EErrors.NOT_FOUND_ERROR, status: 404, message: "El repartidor especificado no existe" },
  ROUTE_NOT_FOUND:    { name: "RouteNotFound",    code: EErrors.ROUTING_ERROR,   status: 404, message: "Ruta no encontrada" },

  // 400
  INVALID_ID:         { name: "InvalidId",        code: EErrors.INVALID_TYPES_ERROR, status: 400, message: "El ID recibido no es válido" },
  INVALID_JSON:       { name: "InvalidJson",      code: EErrors.INVALID_TYPES_ERROR, status: 400, message: "El cuerpo de la petición no es un JSON válido" },
  INVALID_STATUS:     { name: "InvalidStatus",    code: EErrors.INVALID_TYPES_ERROR, status: 400, message: "Estado de pedido inválido" },
  INVALID_QUANTITY:   { name: "InvalidQuantity",  code: EErrors.INVALID_RESOURCE_PROPERTY, status: 400, message: "Cantidad inválida" },
  INVALID_DRIVER_ROLE:{ name: "InvalidDriverRole",code: EErrors.INVALID_RESOURCE_PROPERTY, status: 400, message: "El usuario especificado no es driver" },
  MISSING_FIELDS:     { name: "MissingFields",    code: EErrors.INVALID_RESOURCE_PROPERTY, status: 400, message: "Faltan campos obligatorios" },
  VALIDATION_ERROR:   { name: "ValidationError",  code: EErrors.INVALID_RESOURCE_PROPERTY, status: 400, message: "Los datos enviados no son válidos" },

  // 403 / 409
  ADMIN_CREATION_FORBIDDEN: { name: "AdminCreationForbidden", code: EErrors.INVALID_RESOURCE_PROPERTY, status: 403, message: "No se puede crear un admin desde este endpoint" },
  USER_ALREADY_EXISTS:{ name: "UserAlreadyExists", code: EErrors.RESOURCE_ALREADY_EXISTS, status: 409, message: "Ya existe un usuario" },
  DUPLICATE_KEY:      { name: "DuplicateKey",     code: EErrors.RESOURCE_ALREADY_EXISTS, status: 409, message: "Ya existe un registro con esos datos" },

  // Mocks (cantidad válida: entero entre 1 y MOCKING_PARAMETERS.MAX)
  INVALID_QTY:        { name: "InvalidQty",       code: EErrors.INVALID_RESOURCE_PROPERTY, status: 400, message: "La cantidad debe ser un número entero mayor a 0" },
  QTY_EXCEEDS_MAX:    { name: "QtyExceedsMax",    code: EErrors.INVALID_RESOURCE_PROPERTY, status: 400, message: "La cantidad supera el máximo permitido" },
  MOCK_GENERATION_FAILED: { name: "MockGenerationFailed", code: EErrors.MOCK_GENERATION_ERROR, status: 500, message: "Falló la generación de datos de prueba" },
  SEED_FAILED:        { name: "SeedFailed",       code: EErrors.DATA_BASE_ERROR, status: 500, message: "No se pudieron insertar los datos de prueba" },

  // 500
  MISSING_API_KEY:    { name: "MissingApiKey",    code: EErrors.MISSING_API_KEY, status: 500, message: "Configuración inválida: falta API key" },
  INTERNAL_ERROR:     { name: "InternalError",    code: 0, status: 500, message: "Error interno del servidor" }
};

// `extra` es opcional: { cause, details }. Compatible con createError(ErrorDictionary.X).
export const createError = ({ name, code, status, message, cause, details } = {}, extra = {}) => {
  const error = new Error(message, { cause: extra.cause ?? cause });
  error.name = name;
  error.code = code;
  error.status = status;
  const d = extra.details ?? details;
  if (d !== undefined) error.details = d;
  error.isAppError = true; // marca los errores propios (el resto se trata como inesperado)
  return error;
};
