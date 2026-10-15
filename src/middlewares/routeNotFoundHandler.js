import {createError, ErrorDictionary} from "../utils/error.js"

export const routeNotFoundHandler = (req, res, next) => {
  next(createError(ErrorDictionary.ROUTE_NOT_FOUND, {
    details: { method: req.method, path: req.originalUrl }
  }));
};
