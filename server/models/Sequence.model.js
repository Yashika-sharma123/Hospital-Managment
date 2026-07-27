const mongoose = require('mongoose');

// One document per (service + day) — e.g. key "665f...abc_2026-07-22".
// The counter itself is incremented atomically (see tokenNumberGenerator.js),
// so even if two bookings hit the server at the exact same millisecond,
// MongoDB guarantees each one gets a different number. This replaces the
// old "count today's tokens, add 1" approach, which had a race condition:
// two nearly-simultaneous requests could both count the same total and
// generate the same token number, causing a duplicate-key error.
const sequenceSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 },
});

module.exports = mongoose.model('Sequence', sequenceSchema);
