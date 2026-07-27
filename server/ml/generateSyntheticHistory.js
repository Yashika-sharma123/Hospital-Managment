/**
 * Generates SYNTHETIC training records, purely in memory (nothing written
 * to MongoDB). Used to "bootstrap" the AI models when a service doesn't
 * have enough real History yet (e.g. a freshly seeded database for a
 * college demo). As real usage accumulates in the History collection,
 * waitTimePredictor.js and noShowPredictor.js automatically lean more
 * on real data and less on this synthetic set — see MIN_REAL_RECORDS
 * in those files.
 *
 * Patterns baked in on purpose, so the model has something real to learn:
 *  - Morning rush (9-11am) and evening rush (4-6pm) -> longer queues/waits
 *  - Weekends -> lower traffic
 *  - Longer lead time before an appointment -> higher no-show chance
 */
function hourMultiplier(hour) {
  if (hour >= 9 && hour < 11) return 2.2;
  if (hour >= 16 && hour < 18) return 1.9;
  if (hour >= 12 && hour < 14) return 1.3;
  return 1.0;
}

function dayMultiplier(dayOfWeek) {
  if (dayOfWeek === 0 || dayOfWeek === 6) return 0.55;
  if (dayOfWeek === 1) return 1.25;
  return 1.0;
}

function randn(m, s) {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return m + z * s;
}

function generateSyntheticRecords(avgServiceTimeMinutes = 6, count = 400) {
  const records = [];

  for (let i = 0; i < count; i++) {
    const dayOfWeek = Math.floor(Math.random() * 7);
    const hour = 9 + Math.floor(Math.random() * 8);
    const hMul = hourMultiplier(hour);
    const dMul = dayMultiplier(dayOfWeek);

    const queueLengthAtBooking = Math.max(0, Math.round(randn(6 * hMul * dMul, 2)));
    const waitTimeMinutes = Math.max(0, Math.round(queueLengthAtBooking * avgServiceTimeMinutes * randn(1, 0.15)));

    const leadTimeMinutes = Math.random() < 0.5 ? Math.max(0, Math.round(randn(45, 30))) : 0;
    let noShowProb = 0.04 + leadTimeMinutes / 1000 + (hMul - 1) * 0.05;
    noShowProb = Math.min(0.6, Math.max(0.01, noShowProb));
    const noShow = Math.random() < noShowProb ? 1 : 0;

    records.push({ hour, dayOfWeek, queueLengthAtBooking, leadTimeMinutes, waitTimeMinutes, noShow });
  }
  return records;
}

module.exports = generateSyntheticRecords;
