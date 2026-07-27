const env = require('../config/env');
const logger = require('../utils/logger');

// This is the LAST app.use() in server.js. Express recognizes it as an
// error handler because it takes 4 arguments (err, req, res, next).
// Every thrown ApiError, every asyncHandler-caught rejection, and every
// unexpected bug lands here eventually.
function errorMiddleware(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // Log every 500-level error server-side regardless of environment
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${message}\n${err.stack}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    // stack trace only in development — never leak internals in production
    ...(env.nodeEnv === 'development' && { stack: err.stack }),
  });
}

module.exports = errorMiddleware;
