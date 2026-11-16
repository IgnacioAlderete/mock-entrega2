import multer from 'multer'
import {createError, ErrorDictionary} from "../utils/error.js"

export const routeNotFoundHandler = (req, res, next) => {
  next(createError(ErrorDictionary.ROUTE_NOT_FOUND, {
    details: { method: req.method, path: req.originalUrl }
  }));
};

const MULTER_ERROR_MAP = {
  LIMIT_FILE_SIZE: ErrorDictionary.FILE_TOO_LARGE,
  LIMIT_UNEXPECTED_FILE: ErrorDictionary.UNEXPECTED_FILE_FIELD
}

// dentro de (err, req, res, next), antes de armar la respuesta:
if (err instanceof multer.MulterError) {
  err = createError(MULTER_ERROR_MAP[err.code] || ErrorDictionary.INVALID_FILE_TYPE)
}