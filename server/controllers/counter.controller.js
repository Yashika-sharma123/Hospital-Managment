const Counter = require('../models/Counter.model');
const Service = require('../models/Service.model');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @route   POST /api/counters
// @access  Private/Admin
const createCounter = asyncHandler(async (req, res) => {
  const { name, serviceId } = req.body;

  const service = await Service.findById(serviceId);
  if (!service) throw new ApiError(404, 'Service not found');

  const counter = await Counter.create({ name, service: serviceId, status: 'inactive' });
  new ApiResponse(201, { counter }, 'Counter created').send(res);
});

// @route   GET /api/counters
// @access  Private/Admin, Staff
const listCounters = asyncHandler(async (req, res) => {
  const counters = await Counter.find()
    .populate('service', 'name code')
    .populate('assignedStaff', 'name email')
    .populate('currentToken', 'tokenNumber status');

  new ApiResponse(200, { counters }, 'Counters list').send(res);
});

// @route   PATCH /api/counters/:counterId/assign-staff
// @access  Private/Admin
const assignStaff = asyncHandler(async (req, res) => {
  const { counterId } = req.params;
  const { staffId } = req.body;

  const counter = await Counter.findById(counterId);
  if (!counter) throw new ApiError(404, 'Counter not found');

  const staff = await User.findById(staffId);
  if (!staff || staff.role !== 'staff') {
    throw new ApiError(400, 'staffId must reference a valid staff account');
  }

  counter.assignedStaff = staffId;
  await counter.save();

  staff.assignedCounter = counter._id;
  await staff.save();

  new ApiResponse(200, { counter }, 'Staff assigned to counter').send(res);
});

// @route   PATCH /api/counters/:counterId/status
// @access  Private/Admin, Staff (staff can only toggle their own counter)
const setCounterStatus = asyncHandler(async (req, res) => {
  const { counterId } = req.params;
  const { status } = req.body;

  if (!['active', 'inactive', 'on-break'].includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }

  const counter = await Counter.findById(counterId);
  if (!counter) throw new ApiError(404, 'Counter not found');

  if (req.user.role === 'staff' && String(counter.assignedStaff) !== String(req.user._id)) {
    throw new ApiError(403, 'You are not assigned to this counter');
  }

  counter.status = status;
  await counter.save();

  new ApiResponse(200, { counter }, 'Counter status updated').send(res);
});

// @route   PUT /api/counters/:counterId
// @access  Private/Admin
// Edit a counter's name and/or which department it belongs to.
const updateCounter = asyncHandler(async (req, res) => {
  const { counterId } = req.params;
  const { name, serviceId } = req.body;

  const counter = await Counter.findById(counterId);
  if (!counter) throw new ApiError(404, 'Counter not found');

  if (counter.currentToken) {
    throw new ApiError(400, 'Cannot edit a counter while it is actively serving a token — mark it served/no-show first');
  }

  if (serviceId) {
    const service = await Service.findById(serviceId);
    if (!service) throw new ApiError(404, 'Service not found');
    counter.service = serviceId;
  }
  if (name) counter.name = name;

  await counter.save();
  new ApiResponse(200, { counter }, 'Counter updated').send(res);
});

// @route   DELETE /api/counters/:counterId
// @access  Private/Admin
const deleteCounter = asyncHandler(async (req, res) => {
  const { counterId } = req.params;

  const counter = await Counter.findById(counterId);
  if (!counter) throw new ApiError(404, 'Counter not found');

  if (counter.currentToken) {
    throw new ApiError(400, 'Cannot delete a counter while it is actively serving a token');
  }

  // unassign any staff pointing at this counter before removing it
  if (counter.assignedStaff) {
    await User.updateOne({ _id: counter.assignedStaff }, { assignedCounter: null });
  }

  await counter.deleteOne();
  new ApiResponse(200, { counterId }, 'Counter deleted').send(res);
});

module.exports = { createCounter, listCounters, assignStaff, setCounterStatus, updateCounter, deleteCounter };
