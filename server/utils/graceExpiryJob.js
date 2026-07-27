const Token = require('../models/Token.model');
const Counter = require('../models/Counter.model');
const archiveToken = require('../utils/archiveToken');
const logger = require('./logger');
const env = require('../config/env');
const { emitToService, emitToToken, emitToAdmin } = require('../sockets/socket');

async function runGraceExpiryCheck() {
  const now = new Date();

  // ---- 1. Auto no-show ----
  const expiredCalled = await Token.find({ status: 'called', graceExpiresAt: { $lt: now } }).populate('service', 'name');
  for (const token of expiredCalled) {
    token.status = 'no-show';
    token.noShowAt = now;
    await token.save();

    await Counter.updateOne({ currentToken: token._id }, { currentToken: null });

    emitToToken(token._id, 'token:no-show', { token, reEntryWindowMinutes: env.queue.reEntryWindowMinutes });
    emitToService(token.service._id, 'queue:update', { serviceId: token.service._id, reason: 'auto-no-show' });
    emitToAdmin('activity', {
      type: 'no-show',
      tokenNumber: token.tokenNumber,
      serviceName: token.service.name,
      message: `${token.tokenNumber} auto-marked no-show (grace period expired)`,
      timestamp: now,
    });

    logger.info(`Auto no-show: token ${token.tokenNumber} (grace period expired)`);
  }

  // ---- 2. Expire the re-entry window ----
  const reEntryDeadline = new Date(now.getTime() - env.queue.reEntryWindowMinutes * 60000);
  const expiredNoShows = await Token.find({
    status: 'no-show',
    noShowAt: { $lt: reEntryDeadline },
  }).populate('service', 'name');
  for (const token of expiredNoShows) {
    token.status = 'cancelled';
    token.cancelledAt = now;
    await token.save();
    await archiveToken(token, 'cancelled');

    emitToToken(token._id, 'token:cancelled', { token });
    emitToAdmin('activity', {
      type: 'cancelled',
      tokenNumber: token.tokenNumber,
      serviceName: token.service.name,
      message: `${token.tokenNumber} cancelled (re-entry window expired)`,
      timestamp: now,
    });

    logger.info(`Re-entry window expired, token ${token.tokenNumber} cancelled`);
  }
}

function startGraceExpiryJob(intervalMs = 30000) {
  setInterval(() => {
    runGraceExpiryCheck().catch((err) => logger.error(`Grace expiry job failed: ${err.message}`));
  }, intervalMs);
  logger.info('Grace expiry background job started');
}

module.exports = { startGraceExpiryJob, runGraceExpiryCheck };
