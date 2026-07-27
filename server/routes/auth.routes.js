const express = require('express');
const router = express.Router();

const { requestOtp, verifyOtp, getMe, createStaffOrAdmin } = require('../controllers/auth.controller');
const { requestOtpValidator, verifyOtpValidator, createStaffValidator } = require('../validators/auth.validator');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');

router.post('/request-otp', authLimiter, requestOtpValidator, validate, requestOtp);
router.post('/verify-otp', authLimiter, verifyOtpValidator, validate, verifyOtp);

router.get('/me', protect, getMe);
router.post('/staff', protect, restrictTo('admin'), createStaffValidator, validate, createStaffOrAdmin);

module.exports = router;
