const History = require('../models/History.model');

// Called whenever a Token reaches a final state (served / no-show / cancelled).
// Copies the relevant fields into History so analytics + ML training never
// have to touch the live, frequently-changing Token collection.
async function archiveToken(token, finalStatus) {
  const bookedAt = token.createdAt;

  let waitTimeMinutes = null;
  let serviceDurationMinutes = null;

  if (finalStatus === 'served' && token.calledAt && token.servedAt) {
    waitTimeMinutes = Math.round((token.calledAt - bookedAt) / 60000);
    serviceDurationMinutes = Math.round((token.servedAt - token.calledAt) / 60000);
  }

  await History.create({
    token: token._id,
    service: token.service,
    counter: token.counter || null,
    finalStatus,
    bookingType: token.bookingType,
    priorityType: token.priorityType,
    hour: bookedAt.getHours(),
    dayOfWeek: bookedAt.getDay(),
    queueLengthAtBooking: token.queueLengthAtBooking,
    leadTimeMinutes: 0, // this system books into the live queue immediately; reserved for future scheduled-appointment support
    waitTimeMinutes,
    serviceDurationMinutes,
    predictedWaitMinutes: token.predictedWaitMinutes,
    noShowProbability: token.noShowProbability,
    rating: token.rating,
  });
}

module.exports = archiveToken;
