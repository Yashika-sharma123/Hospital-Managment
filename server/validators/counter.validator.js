const { body, param } = require('express-validator');

const createCounterValidator = [
  body('name').trim().notEmpty().withMessage('Counter name is required'),
  body('serviceId').isMongoId().withMessage('Valid serviceId is required'),
];

const updateCounterValidator = [
  param('counterId').isMongoId().withMessage('Valid counterId is required'),
  body('name').optional().trim().notEmpty().withMessage('Counter name cannot be empty'),
  body('serviceId').optional().isMongoId().withMessage('Valid serviceId is required'),
];

const assignStaffValidator = [
  param('counterId').isMongoId().withMessage('Valid counterId is required'),
  body('staffId').isMongoId().withMessage('Valid staffId is required'),
];

const counterIdParamValidator = [param('counterId').isMongoId().withMessage('Valid counterId is required')];

module.exports = {
  createCounterValidator,
  updateCounterValidator,
  assignStaffValidator,
  counterIdParamValidator,
};
