const Token = require('../models/Token.model');

const AGING_RATE_PER_MINUTE = 1.2;

function rankTokens(tokens) {
  const now = Date.now();
  return tokens
    .map((t) => {
      const minutesWaited = (now - new Date(t.queueEntryTime).getTime()) / 60000;
      const effectiveScore = t.priorityScore + minutesWaited * AGING_RATE_PER_MINUTE;
      return { token: t, effectiveScore };
    })
    .sort((a, b) => {
      if (b.effectiveScore !== a.effectiveScore) return b.effectiveScore - a.effectiveScore;
      return new Date(a.token.queueEntryTime) - new Date(b.token.queueEntryTime);
    })
    .map((r) => r.token);
}

// Picks the single best next token to call for a given service — shared
// across ALL counters serving that service.
async function getNextTokenForService(serviceId) {
  const candidates = await Token.find({
    service: serviceId,
    status: { $in: ['waiting', 're-queued'] },
  }).lean();

  if (candidates.length === 0) return null;
  return rankTokens(candidates)[0];
}

// Returns the top N ranked tokens — used for the no-show "standby buffer":
// when the #1 token is called and has high no-show risk, the #2 token
// (next in line) gets an early heads-up to stay nearby.
async function getUpcomingTokens(serviceId, count = 2) {
  const candidates = await Token.find({
    service: serviceId,
    status: { $in: ['waiting', 're-queued'] },
  }).lean();

  return rankTokens(candidates).slice(0, count);
}

module.exports = { getNextTokenForService, getUpcomingTokens, AGING_RATE_PER_MINUTE };