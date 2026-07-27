const History = require('../models/History.model');
const { LogisticRegression } = require('./regression');
const generateSyntheticRecords = require('./generateSyntheticHistory');
const { getBasePriorityScore } = require('../utils/priorityScorer');

const modelCache = new Map(); // serviceId -> { model, trainedAt }
const RETRAIN_INTERVAL_MS = 60 * 60 * 1000;
const MIN_REAL_RECORDS = 30;

async function trainModel(serviceId) {
  const realRecords = await History.find({
    service: serviceId,
    finalStatus: { $in: ['served', 'no-show'] },
  })
    .sort({ createdAt: -1 })
    .limit(1000)
    .lean();

  let trainingData = realRecords.map((r) => ({
    hour: r.hour,
    dayOfWeek: r.dayOfWeek,
    leadTimeMinutes: r.leadTimeMinutes,
    priorityWeight: getBasePriorityScore(r.priorityType),
    noShow: r.finalStatus === 'no-show' ? 1 : 0,
  }));

  if (trainingData.length < MIN_REAL_RECORDS) {
    const synthetic = generateSyntheticRecords(6, 400 - trainingData.length).map((r) => ({
      hour: r.hour,
      dayOfWeek: r.dayOfWeek,
      leadTimeMinutes: r.leadTimeMinutes,
      priorityWeight: 0, // synthetic bootstrap data assumes normal priority
      noShow: r.noShow,
    }));
    trainingData = trainingData.concat(synthetic);
  }

  const X = trainingData.map((r) => [r.hour, r.dayOfWeek, r.leadTimeMinutes, r.priorityWeight]);
  const y = trainingData.map((r) => r.noShow);

  const model = new LogisticRegression({ learningRate: 0.3, iterations: 2000 });
  model.fit(X, y);

  modelCache.set(serviceId.toString(), { model, trainedAt: Date.now() });
  return model;
}

async function getModel(serviceId) {
  const cached = modelCache.get(serviceId.toString());
  if (cached && Date.now() - cached.trainedAt < RETRAIN_INTERVAL_MS) {
    return cached.model;
  }
  return trainModel(serviceId);
}

/**
 * @param features { hour, dayOfWeek, leadTimeMinutes, priorityType }
 * @returns probability between 0 and 1
 */
async function predictNoShowProbability(serviceId, features) {
  const model = await getModel(serviceId);
  const x = [
    features.hour,
    features.dayOfWeek,
    features.leadTimeMinutes,
    getBasePriorityScore(features.priorityType),
  ];
  const probability = model.predict(x);
  return Math.min(0.95, Math.max(0.01, Number(probability.toFixed(2))));
}

module.exports = { predictNoShowProbability, trainModel };
