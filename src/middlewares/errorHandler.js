import { createError, ErrorDictionary } from "../utils/error.js";

// Convierte errores de librerías (Mongoose, body-parser) en errores del diccionario.
const normalizeError = (err) => {
  if (err?.isAppError) return err;

  if (err?.name === "CastError") {
    return createError(ErrorDictionary.INVALID_ID, {
      cause: err,
      details: { field: err.path, value: String(err.value) }
    });
  }
  if (err?.type === "entity.parse.failed") {
    return createError(ErrorDictionary.INVALID_JSON, { cause: err });
  }
  if (err?.name === "ValidationError" && err.errors) {
    return createError(ErrorDictionary.VALIDATION_ERROR, {
      cause: err,
      details: Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }))
    });
  }
  if (err?.code === 11000) {
    return createError(ErrorDictionary.DUPLICATE_KEY, {
      cause: err,
      details: { fields: Object.keys(err.keyValue ?? {}) }
    });
  }
  return err;
};

// Único lugar que arma la respuesta de error.
// Formato: { status: "error", error: { name, code, message, details? } }
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const error = normalizeError(err);
  const isAppError = Boolean(error?.isAppError);

  const status = Number.isInteger(error?.status) && error.status >= 400 && error.status <= 599
    ? error.status
    : 500;

  if (!isAppError || status >= 500) console.error(err);

  // Errores inesperados: no se filtra el mensaje interno en producción.
  const internal = ErrorDictionary.INTERNAL_ERROR;
  const hideInternals = !isAppError && process.env.NODE_ENV === "production";

  res.status(status).json({
    status: "error",
    error: {
      name: isAppError ? error.name : internal.name,
      code: isAppError ? error.code : internal.code,
      message: isAppError ? error.message : (hideInternals ? internal.message : (error?.message || internal.message)),
      ...(isAppError && error.details !== undefined && { details: error.details })
    }
  });
};
