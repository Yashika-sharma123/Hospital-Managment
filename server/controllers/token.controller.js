const History = require('../models/History.model');
const Token = require('../models/Token.model');
const Service = require('../models/Service.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const generateTokenNumber = require('../utils/tokenNumberGenerator');
const { getBasePriorityScore } = require('../utils/priorityScorer');
const archiveToken = require('../utils/archiveToken');
const { predictWaitTime } = require('../ml/waitTimePredictor');
const { predictNoShowProbability } = require('../ml/noShowPredictor');
const { emitToService, emitToToken, emitToAdmin } = require('../sockets/socket');

const ACTIVE_STATUSES = ['waiting', 'called', 'grace-period', 're-queued'];

// @route   POST /api/tokens
// @access  Public (logged-in customer OR guest walk-in — see optionalAuth)
const bookToken = asyncHandler(async (req, res) => {
  const { serviceId, bookingType, priorityType, guestName, guestPhone } = req.body;

  const service = await Service.findById(serviceId);
  if (!service || !service.isActive) {
    throw new ApiError(404, 'Service not found or is currently inactive');
  }

  if (!req.user && (!guestName || !guestPhone)) {
    throw new ApiError(400, 'guestName and guestPhone are required when not logged in');
  }

  const queueLength = await Token.countDocuments({
    service: serviceId,
    status: { $in: ACTIVE_STATUSES },
  });

  const tokenNumber = await generateTokenNumber(service);
  const position = queueLength + 1;

  const now = new Date();
  const bookingFeatures = { hour: now.getHours(), dayOfWeek: now.getDay(), queueLengthAtBooking: queueLength };

  const { predictedMinutes, rangeLowMinutes, rangeHighMinutes } = await predictWaitTime(
    serviceId,
    service.avgServiceTimeMinutes,
    bookingFeatures
  );

  const noShowProbability = await predictNoShowProbability(serviceId, {
    hour: now.getHours(),
    dayOfWeek: now.getDay(),
    leadTimeMinutes: 0,
    priorityType: priorityType || 'normal',
  });

  const token = await Token.create({
    tokenNumber,
    queueEntryTime: now,
    service: serviceId,
    customer: req.user ? req.user._id : null,
    guestName: req.user ? null : guestName,
    guestPhone: req.user ? null : guestPhone,
    bookingType,
    priorityType: priorityType || 'normal',
    priorityScore: getBasePriorityScore(priorityType || 'normal'),
    predictedWaitMinutes: predictedMinutes,
    noShowProbability,
    queueLengthAtBooking: queueLength,
    status: 'waiting',
  });

  emitToService(serviceId, 'queue:update', { serviceId, queueLength: queueLength + 1, reason: 'new-booking' });

  emitToAdmin('activity', {
    type: 'booked',
    tokenNumber: token.tokenNumber,
    serviceName: service.name,
    message: `${token.tokenNumber} booked for ${service.name}`,
    timestamp: now,
  });

  new ApiResponse(
    201,
    {
      token,
      position,
      predictedWaitMinutes: predictedMinutes,
      waitRangeMinutes: [rangeLowMinutes, rangeHighMinutes],
      noShowProbability,
    },
    'Token booked successfully'
  ).send(res);
});

// @route   GET /api/tokens/:tokenId
// @access  Public
const getTokenStatus = asyncHandler(async (req, res) => {
  const { tokenId } = req.params;

  const token = await Token.findById(tokenId).populate('service', 'name code avgServiceTimeMinutes');
  if (!token) throw new ApiError(404, 'Token not found');

  let position = null;
  let liveEtaMinutes = null;

  if (ACTIVE_STATUSES.includes(token.status)) {
    position =
      (await Token.countDocuments({
        service: token.service._id,
        status: { $in: ACTIVE_STATUSES },
        queueEntryTime: { $lt: token.queueEntryTime },
      })) + 1;

    const now = new Date();
    const { predictedMinutes } = await predictWaitTime(token.service._id, token.service.avgServiceTimeMinutes, {
      hour: now.getHours(),
      dayOfWeek: now.getDay(),
      queueLengthAtBooking: position - 1,
    });
    liveEtaMinutes = predictedMinutes;
  }

  new ApiResponse(200, { token, position, liveEtaMinutes }, 'Token status').send(res);
});

// @route   GET /api/tokens/queue/:serviceId
// @access  Public
const getLiveQueueSummary = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const service = await Service.findById(serviceId);
  if (!service) throw new ApiError(404, 'Service not found');

  const queueLength = await Token.countDocuments({
    service: serviceId,
    status: { $in: ACTIVE_STATUSES },
  });

  const now = new Date();
  const { predictedMinutes } = await predictWaitTime(serviceId, service.avgServiceTimeMinutes, {
    hour: now.getHours(),
    dayOfWeek: now.getDay(),
    queueLengthAtBooking: queueLength,
  });

  new ApiResponse(
    200,
    { serviceId, queueLength, estimatedWaitForNextBooking: predictedMinutes },
    'Live queue summary'
  ).send(res);
});

// @route   PATCH /api/tokens/:tokenId/cancel
// @access  Public
const cancelToken = asyncHandler(async (req, res) => {
  const { tokenId } = req.params;

  const token = await Token.findById(tokenId).populate('service', 'name');
  if (!token) throw new ApiError(404, 'Token not found');

  if (!ACTIVE_STATUSES.includes(token.status)) {
    throw new ApiError(400, `Cannot cancel a token with status '${token.status}'`);
  }

  token.status = 'cancelled';
  token.cancelledAt = new Date();
  await token.save();

  await archiveToken(token, 'cancelled');

  emitToService(token.service._id, 'queue:update', { serviceId: token.service._id, reason: 'cancelled' });
  emitToToken(token._id, 'token:cancelled', { token });
  emitToAdmin('activity', {
    type: 'cancelled',
    tokenNumber: token.tokenNumber,
    serviceName: token.service.name,
    message: `${token.tokenNumber} cancelled by customer`,
    timestamp: new Date(),
  });

  new ApiResponse(200, { token }, 'Token cancelled').send(res);
});

// @route   PATCH /api/tokens/:tokenId/rating
// @access  Public — the customer rates their own visit after being served
const submitRating = asyncHandler(async (req, res) => {
  const { tokenId } = req.params;
  const { rating } = req.body;

  const token = await Token.findById(tokenId);
  if (!token) throw new ApiError(404, 'Token not found');

  if (token.status !== 'served') {
    throw new ApiError(400, 'Only a served token can be rated');
  }
  if (token.rating) {
    throw new ApiError(400, 'This token has already been rated');
  }

  token.rating = rating;
  await token.save();

  // keep the History record (used for analytics) in sync too
  await History.updateOne({ token: token._id }, { rating });

  new ApiResponse(200, { token }, 'Thanks for your feedback').send(res);
});

module.exports = { bookToken, getTokenStatus, getLiveQueueSummary, cancelToken, submitRating, ACTIVE_STATUSES };
