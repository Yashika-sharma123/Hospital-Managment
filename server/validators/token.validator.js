const { body, param } = require('express-validator');

const bookTokenValidator = [
  body('serviceId').isMongoId().withMessage('Valid serviceId is required'),
  body('bookingType').isIn(['online', 'walk-in']).withMessage('bookingType must be online or walk-in'),
  body('priorityType')
    .optional()
    .isIn(['normal', 'senior-citizen', 'pregnant', 'emergency'])
    .withMessage('Invalid priorityType'),
  // required only for guest bookings — checked in the controller, since
  // express-validator can't easily see req.user here
  body('guestName').optional().trim().isLength({ max: 80 }),
  body('guestPhone').optional().trim().isLength({ min: 7, max: 15 }),
];

const tokenIdParamValidator = [param('tokenId').isMongoId().withMessage('Valid tokenId is required')];

const ratingValidator = [body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')];

module.exports = { bookTokenValidator, tokenIdParamValidator, ratingValidator };
