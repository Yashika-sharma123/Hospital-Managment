const ApiError = require('../utils/ApiError');

// Placed AFTER all routes but BEFORE error.middleware.js in server.js.
// If a request reaches this point, no route matched.
function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
}

module.exports = notFound;
