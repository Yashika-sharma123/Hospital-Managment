const Service = require('../models/Service.model');
const Token = require('../models/Token.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { predictWaitTime } = require('../ml/waitTimePredictor');
const { predictNoShowProbability } = require('../ml/noShowPredictor');

const ACTIVE_STATUSES = ['waiting', 'called', 'grace-period', 're-queued'];

// @route   GET /api/predict/wait-time/:serviceId
// @access  Public — lets you test the model directly without booking a token
const getWaitTimePrediction = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const service = await Service.findById(serviceId);
  if (!service) throw new ApiError(404, 'Service not found');

  const queueLength = await Token.countDocuments({ service: serviceId, status: { $in: ACTIVE_STATUSES } });
  const now = new Date();

  const result = await predictWaitTime(serviceId, service.avgServiceTimeMinutes, {
    hour: now.getHours(),
    dayOfWeek: now.getDay(),
    queueLengthAtBooking: queueLength,
  });

  new ApiResponse(200, { serviceId, queueLength, ...result }, 'Wait-time prediction').send(res);
});

// @route   GET /api/predict/no-show/:serviceId?priorityType=normal
// @access  Public
const getNoShowPrediction = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const priorityType = req.query.priorityType || 'normal';

  const service = await Service.findById(serviceId);
  if (!service) throw new ApiError(404, 'Service not found');

  const now = new Date();
  const probability = await predictNoShowProbability(serviceId, {
    hour: now.getHours(),
    dayOfWeek: now.getDay(),
    leadTimeMinutes: 0,
    priorityType,
  });

  new ApiResponse(200, { serviceId, priorityType, noShowProbability: probability }, 'No-show prediction').send(res);
});

module.exports = { getWaitTimePrediction, getNoShowPrediction };
