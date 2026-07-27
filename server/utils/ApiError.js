// Custom error class — every intentional error in the app should be
// thrown as an ApiError so the global error middleware can read
// statusCode + message consistently, instead of generic Error objects.
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details; // e.g. validation error list
    this.isOperational = true; // distinguishes expected errors from bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
