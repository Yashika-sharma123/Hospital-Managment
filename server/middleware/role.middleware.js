const ApiError = require('../utils/ApiError');

// Usage: router.get('/admin/analytics', protect, restrictTo('admin'), handler)
// Must run AFTER protect (auth.middleware.js), since it reads req.user.role.
const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      // programmer error — restrictTo used without protect before it
      throw new ApiError(500, 'restrictTo used without protect middleware');
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, `Role '${req.user.role}' is not permitted to access this resource`);
    }
    next();
  };
};

module.exports = { restrictTo };
