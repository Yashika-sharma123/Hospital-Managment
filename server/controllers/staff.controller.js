const Token = require('../models/Token.model');
const Counter = require('../models/Counter.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const archiveToken = require('../utils/archiveToken');
const { getNextTokenForService } = require('../utils/queueSelector');
const { emitToService, emitToToken, emitToAdmin } = require('../sockets/socket');
const env = require('../config/env');

// @route   POST /api/counters/:counterId/call-next
// @access  Private/Staff, Admin
const callNext = asyncHandler(async (req, res) => {
  const { counterId } = req.params;

  const counter = await Counter.findById(counterId).populate('service', 'name');
  if (!counter) throw new ApiError(404, 'Counter not found');

  if (req.user.role === 'staff' && String(counter.assignedStaff) !== String(req.user._id)) {
    throw new ApiError(403, 'You are not assigned to this counter');
  }
  if (counter.currentToken) {
    throw new ApiError(400, 'This counter is already serving a token — mark it served/no-show first');
  }

  const nextToken = await getNextTokenForService(counter.service._id);
  if (!nextToken) {
    return new ApiResponse(200, { token: null }, 'Queue is empty').send(res);
  }

  const now = new Date();
  const graceExpiresAt = new Date(now.getTime() + env.queue.gracePeriodMinutes * 60000);

  const token = await Token.findByIdAndUpdate(
    nextToken._id,
    { status: 'called', counter: counterId, calledAt: now, graceExpiresAt },
    { new: true }
  );

  counter.currentToken = token._id;
  counter.status = 'active';
  await counter.save();

  emitToToken(token._id, 'token:called', { token, counterName: counter.name });
  emitToService(counter.service._id, 'queue:update', { serviceId: counter.service._id, reason: 'token-called' });
  emitToAdmin('activity', {
    type: 'called',
    tokenNumber: token.tokenNumber,
    serviceName: counter.service.name,
    message: `${token.tokenNumber} called at ${counter.name}`,
    timestamp: now,
  });

  new ApiResponse(200, { token }, `Token ${token.tokenNumber} called`).send(res);
});

// @route   PATCH /api/counters/:counterId/served
// @access  Private/Staff, Admin
const markServed = asyncHandler(async (req, res) => {
  const { counterId } = req.params;

  const counter = await Counter.findById(counterId).populate('service', 'name');
  if (!counter) throw new ApiError(404, 'Counter not found');
  if (!counter.currentToken) throw new ApiError(400, 'This counter has no token currently being served');

  const token = await Token.findById(counter.currentToken);
  token.status = 'served';
  token.servedAt = new Date();
  await token.save();
  await archiveToken(token, 'served');

  counter.currentToken = null;
  await counter.save();

  emitToToken(token._id, 'token:served', { token });
  emitToService(token.service, 'queue:update', { serviceId: token.service, reason: 'served' });
  emitToAdmin('activity', {
    type: 'served',
    tokenNumber: token.tokenNumber,
    serviceName: counter.service.name,
    message: `${token.tokenNumber} served at ${counter.name}`,
    timestamp: new Date(),
  });

  new ApiResponse(200, { token }, `Token ${token.tokenNumber} marked served`).send(res);
});

// @route   PATCH /api/counters/:counterId/no-show
// @access  Private/Staff, Admin
const markNoShow = asyncHandler(async (req, res) => {
  const { counterId } = req.params;

  const counter = await Counter.findById(counterId).populate('service', 'name');
  if (!counter) throw new ApiError(404, 'Counter not found');
  if (!counter.currentToken) throw new ApiError(400, 'This counter has no token currently being served');

  const token = await Token.findById(counter.currentToken);
  token.status = 'no-show';
  token.noShowAt = new Date();
  await token.save();

  counter.currentToken = null;
  await counter.save();

  emitToToken(token._id, 'token:no-show', { token, reEntryWindowMinutes: env.queue.reEntryWindowMinutes });
  emitToService(token.service, 'queue:update', { serviceId: token.service, reason: 'no-show' });
  emitToAdmin('activity', {
    type: 'no-show',
    tokenNumber: token.tokenNumber,
    serviceName: counter.service.name,
    message: `${token.tokenNumber} marked no-show at ${counter.name}`,
    timestamp: new Date(),
  });

  new ApiResponse(200, { token }, `Token ${token.tokenNumber} marked no-show`).send(res);
});

// @route   PATCH /api/tokens/:tokenId/re-enter
// @access  Public
const reEnterQueue = asyncHandler(async (req, res) => {
  const { tokenId } = req.params;

  const token = await Token.findById(tokenId).populate('service', 'name');
  if (!token) throw new ApiError(404, 'Token not found');

  if (token.status !== 'no-show') {
    throw new ApiError(400, `Only a no-show token can re-enter the queue (current status: '${token.status}')`);
  }
  if (token.reQueueCount >= 1) {
    throw new ApiError(400, 'This token has already used its one re-entry chance');
  }

  const windowExpiresAt = new Date(token.noShowAt.getTime() + env.queue.reEntryWindowMinutes * 60000);
  if (new Date() > windowExpiresAt) {
    token.status = 'cancelled';
    token.cancelledAt = new Date();
    await token.save();
    await archiveToken(token, 'cancelled');
    emitToToken(token._id, 'token:cancelled', { token });
    throw new ApiError(400, 'Re-entry window has expired — this token has been cancelled');
  }

  token.status = 're-queued';
  token.queueEntryTime = new Date();
  token.reQueuedAt = new Date();
  token.reQueueCount += 1;
  await token.save();

  emitToToken(token._id, 'token:re-queued', { token });
  emitToService(token.service._id, 'queue:update', { serviceId: token.service._id, reason: 're-queued' });
  emitToAdmin('activity', {
    type: 're-queued',
    tokenNumber: token.tokenNumber,
    serviceName: token.service.name,
    message: `${token.tokenNumber} rejoined the queue`,
    timestamp: new Date(),
  });

  new ApiResponse(200, { token }, 'Welcome back — you have rejoined the queue').send(res);
});

module.exports = { callNext, markServed, markNoShow, reEnterQueue };
