const { body } = require('express-validator');

const requestOtpValidator = [
  body('phone').trim().isLength({ min: 7, max: 15 }).withMessage('Enter a valid phone number'),
  body('name').optional().trim().isLength({ max: 80 }),
];

const verifyOtpValidator = [
  body('phone').trim().isLength({ min: 7, max: 15 }).withMessage('Enter a valid phone number'),
  body('code').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

// Used by admin only, to create staff/admin accounts
const createStaffValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
  body('phone').trim().isLength({ min: 7, max: 15 }).withMessage('Enter a valid phone number'),
  body('email').optional().trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('role').isIn(['staff', 'admin']).withMessage('Role must be staff or admin'),
];

module.exports = { requestOtpValidator, verifyOtpValidator, createStaffValidator };
