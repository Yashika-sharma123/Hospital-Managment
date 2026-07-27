const History = require('../models/History.model');
const { LinearRegression } = require('./regression');
const generateSyntheticRecords = require('./generateSyntheticHistory');

// A trained model is cached per service in memory so we don't retrain
// on every single booking request. Retrains if the cache is stale.
const modelCache = new Map(); // serviceId -> { model, trainedAt }
const RETRAIN_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const MIN_REAL_RECORDS = 30; // below this, synthetic data fills the gap

async function trainModel(serviceId, avgServiceTimeMinutes) {
  const realRecords = await History.find({
    service: serviceId,
    finalStatus: 'served',
    waitTimeMinutes: { $ne: null },
  })
    .sort({ createdAt: -1 })
    .limit(1000)
    .lean();

  let trainingData = realRecords.map((r) => ({
    hour: r.hour,
    dayOfWeek: r.dayOfWeek,
    queueLengthAtBooking: r.queueLengthAtBooking,
    waitTimeMinutes: r.waitTimeMinutes,
  }));

  // Not enough real data yet (e.g. fresh DB for a demo) -> top up with synthetic
  if (trainingData.length < MIN_REAL_RECORDS) {
    const synthetic = generateSyntheticRecords(avgServiceTimeMinutes, 400 - trainingData.length);
    trainingData = trainingData.concat(synthetic);
  }

  const X = trainingData.map((r) => [r.hour, r.dayOfWeek, r.queueLengthAtBooking]);
  const y = trainingData.map((r) => r.waitTimeMinutes);

  const model = new LinearRegression({ learningRate: 0.1, iterations: 2000 });
  model.fit(X, y);

  modelCache.set(serviceId.toString(), { model, trainedAt: Date.now(), usedRealRecords: realRecords.length });
  return model;
}

async function getModel(serviceId, avgServiceTimeMinutes) {
  const cached = modelCache.get(serviceId.toString());
  if (cached && Date.now() - cached.trainedAt < RETRAIN_INTERVAL_MS) {
    return cached.model;
  }
  return trainModel(serviceId, avgServiceTimeMinutes);
}

/**
 * @param serviceId          Mongo ObjectId of the service
 * @param avgServiceTimeMinutes  fallback baseline from the Service document
 * @param features            { hour, dayOfWeek, queueLengthAtBooking }
 * @returns { predictedMinutes, rangeLowMinutes, rangeHighMinutes }
 */
async function predictWaitTime(serviceId, avgServiceTimeMinutes, features) {
  const model = await getModel(serviceId, avgServiceTimeMinutes);
  const x = [features.hour, features.dayOfWeek, features.queueLengthAtBooking];

  let predicted = model.predict(x);
  predicted = Math.max(1, Math.round(predicted)); // never predict negative/zero wait

  const range = Math.round(model.residualStd) || 2;
  return {
    predictedMinutes: predicted,
    rangeLowMinutes: Math.max(0, predicted - range),
    rangeHighMinutes: predicted + range,
  };
}

module.exports = { predictWaitTime, trainModel };
