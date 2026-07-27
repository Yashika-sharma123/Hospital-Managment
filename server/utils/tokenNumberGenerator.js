const Sequence = require('../models/Sequence.model');

// Produces tokens like "A-001", "A-002" ... reset each day per service.
// Uses findOneAndUpdate with $inc, which MongoDB guarantees is atomic —
// two requests arriving at the exact same time will still get two
// different numbers, never the same one.
async function generateTokenNumber(service) {
  const today = new Date().toISOString().slice(0, 10); // e.g. "2026-07-22"
  const key = `${service._id}_${today}`;

  const sequence = await Sequence.findOneAndUpdate(
    { key },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  const padded = String(sequence.value).padStart(3, '0');
  return `${service.code}-${padded}`;
}

module.exports = generateTokenNumber;
