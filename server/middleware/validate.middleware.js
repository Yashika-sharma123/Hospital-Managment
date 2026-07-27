const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Usage: router.post('/register', registerValidator, validate, controller)
// registerValidator is an array of express-validator checks (see validators/ folder).
// This middleware runs after them and turns any failures into a single
// ApiError(400) with all messages attached — so it flows into the same
// global error handler as everything else.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    throw new ApiError(400, 'Validation failed', messages);
  }
  next();
}

module.exports = validate;
