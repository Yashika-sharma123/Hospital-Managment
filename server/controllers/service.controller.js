const Service = require('../models/Service.model');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @route   GET /api/services
// @access  Public — customer needs this to see what they can book
const getActiveServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ isActive: true }).sort({ name: 1 });
  new ApiResponse(200, { services }, 'Active services').send(res);
});

module.exports = { getActiveServices };
