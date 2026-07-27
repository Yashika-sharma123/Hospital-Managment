const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/generateToken');
const User = require('../models/User.model');

// Protects any route it's placed on. Reads the "Authorization: Bearer <token>"
// header, verifies it, and attaches the logged-in user to req.user so
// controllers and later middleware (like role.middleware.js) can use it.
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    // covers both expired and invalid/tampered tokens
    throw new ApiError(401, 'Not authorized, token invalid or expired');
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Not authorized, user no longer exists or is inactive');
  }

  req.user = user; // available to every controller after this point
  next();
});

// Like protect, but does NOT throw if there's no token — it just leaves
// req.user unset. Used on routes like token booking, where BOTH a
// logged-in customer AND a guest walk-in are allowed to hit the same
// endpoint. If a token IS present, it must still be valid (a bad/expired
// token is still rejected, since silently ignoring it would be confusing).
const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // no token provided at all — proceed as guest
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    throw new ApiError(401, 'Token provided but invalid or expired');
  }

  const user = await User.findById(decoded.id);
  if (user && user.isActive) {
    req.user = user;
  }
  next();
});

module.exports = { protect, optionalAuth };
