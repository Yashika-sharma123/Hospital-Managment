const express = require('express');
const router = express.Router();

const {
  bookToken,
  getTokenStatus,
  getLiveQueueSummary,
  cancelToken,
  submitRating,
} = require('../controllers/token.controller');
const { reEnterQueue } = require('../controllers/staff.controller');
const { bookTokenValidator, tokenIdParamValidator, ratingValidator } = require('../validators/token.validator');
const validate = require('../middleware/validate.middleware');
const { optionalAuth } = require('../middleware/auth.middleware');
const { bookingLimiter } = require('../middleware/rateLimiter.middleware');

// optionalAuth: works for both logged-in customers and guest walk-ins
router.post('/', bookingLimiter, optionalAuth, bookTokenValidator, validate, bookToken);

router.get('/queue/:serviceId', getLiveQueueSummary);
router.get('/:tokenId', tokenIdParamValidator, validate, getTokenStatus);
router.patch('/:tokenId/cancel', tokenIdParamValidator, validate, cancelToken);
router.patch('/:tokenId/re-enter', tokenIdParamValidator, validate, reEnterQueue);
router.patch('/:tokenId/rating', tokenIdParamValidator, ratingValidator, validate, submitRating);

module.exports = router;
