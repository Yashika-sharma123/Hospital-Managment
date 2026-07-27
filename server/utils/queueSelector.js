const Token = require('../models/Token.model');

// How many extra "priority points" a token earns per minute it has been
// waiting. This is the fairness mechanism: a normal token that's been
// waiting 40 minutes (40 * AGING_RATE = 40 points) will eventually
// outrank a freshly-booked senior-citizen token (50 points), so nobody
// waits forever just because priority tokens keep arriving.
const AGING_RATE_PER_MINUTE = 1.2;

// Picks the single best next token to call for a given service — shared
// across ALL counters serving that service (this is what makes multiple
// doctors in the same department work correctly: whichever counter goes
// free next simply pulls the current highest-ranked token).
async function getNextTokenForService(serviceId) {
  const candidates = await Token.find({
    service: serviceId,
    status: { $in: ['waiting', 're-queued'] },
  }).lean();

  if (candidates.length === 0) return null;

  const now = Date.now();
  const ranked = candidates
    .map((t) => {
      const minutesWaited = (now - new Date(t.queueEntryTime).getTime()) / 60000;
      const effectiveScore = t.priorityScore + minutesWaited * AGING_RATE_PER_MINUTE;
      return { token: t, effectiveScore };
    })
    .sort((a, b) => {
      if (b.effectiveScore !== a.effectiveScore) return b.effectiveScore - a.effectiveScore;
      // tie-break: whoever entered the queue earliest goes first
      return new Date(a.token.queueEntryTime) - new Date(b.token.queueEntryTime);
    });

  return ranked[0].token;
}

module.exports = { getNextTokenForService, AGING_RATE_PER_MINUTE };
