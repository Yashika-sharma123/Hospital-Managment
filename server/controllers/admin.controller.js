const Token = require('../models/Token.model');
const Counter = require('../models/Counter.model');
const Service = require('../models/Service.model');
const History = require('../models/History.model');
const User = require('../models/User.model');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { predictWaitTime } = require('../ml/waitTimePredictor');

const ACTIVE_STATUSES = ['waiting', 'called', 'grace-period', 're-queued'];

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardOverview = asyncHandler(async (req, res) => {
  const today = startOfToday();

  const [tokensToday, activeCounters, totalCounters, todaysHistory] = await Promise.all([
    Token.countDocuments({ createdAt: { $gte: today } }),
    Counter.countDocuments({ status: 'active' }),
    Counter.countDocuments({}),
    History.find({ createdAt: { $gte: today } }).lean(),
  ]);

  const servedToday = todaysHistory.filter((h) => h.finalStatus === 'served');
  const noShowToday = todaysHistory.filter((h) => h.finalStatus === 'no-show');

  const avgWaitMinutes =
    servedToday.length > 0
      ? Math.round(servedToday.reduce((sum, h) => sum + (h.waitTimeMinutes || 0), 0) / servedToday.length)
      : 0;

  const noShowRate =
    servedToday.length + noShowToday.length > 0
      ? Math.round((noShowToday.length / (servedToday.length + noShowToday.length)) * 100)
      : 0;

  const liveQueueLength = await Token.countDocuments({ status: { $in: ACTIVE_STATUSES } });

  new ApiResponse(
    200,
    {
      tokensToday,
      activeCounters,
      totalCounters,
      avgWaitMinutes,
      noShowRatePercent: noShowRate,
      liveQueueLength,
    },
    'Dashboard overview'
  ).send(res);
});

// @route   GET /api/admin/analytics?days=7
// @access  Private/Admin
// Peak-hour heatmap + no-show trend + per-department breakdown, all
// computed from the History collection so it never touches live queue data.
const getAnalytics = asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 7;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const records = await History.find({ createdAt: { $gte: since } }).populate('service', 'name code').lean();

  // ---- peak hours heatmap: count of tokens per hour of day ----
  const hourlyCounts = Array.from({ length: 24 }, () => 0);
  records.forEach((r) => {
    hourlyCounts[r.hour] += 1;
  });

  // ---- no-show rate per day ----
  const byDate = {};
  records.forEach((r) => {
    const dateKey = new Date(r.createdAt).toISOString().slice(0, 10);
    if (!byDate[dateKey]) byDate[dateKey] = { served: 0, noShow: 0 };
    if (r.finalStatus === 'served') byDate[dateKey].served += 1;
    if (r.finalStatus === 'no-show') byDate[dateKey].noShow += 1;
  });
  const noShowTrend = Object.entries(byDate).map(([date, counts]) => ({
    date,
    noShowRatePercent:
      counts.served + counts.noShow > 0 ? Math.round((counts.noShow / (counts.served + counts.noShow)) * 100) : 0,
  }));

  // ---- per-department breakdown ----
  const byService = {};
  records.forEach((r) => {
    const key = r.service?.name || 'Unknown';
    if (!byService[key]) byService[key] = { served: 0, noShow: 0, totalWait: 0, waitSamples: 0 };
    if (r.finalStatus === 'served') {
      byService[key].served += 1;
      if (r.waitTimeMinutes != null) {
        byService[key].totalWait += r.waitTimeMinutes;
        byService[key].waitSamples += 1;
      }
    }
    if (r.finalStatus === 'no-show') byService[key].noShow += 1;
  });
  const departmentBreakdown = Object.entries(byService).map(([name, s]) => ({
    service: name,
    served: s.served,
    noShow: s.noShow,
    avgWaitMinutes: s.waitSamples > 0 ? Math.round(s.totalWait / s.waitSamples) : null,
  }));

  new ApiResponse(200, { hourlyCounts, noShowTrend, departmentBreakdown }, 'Analytics').send(res);
});

// @route   GET /api/admin/staff-allocation-suggestion
// @access  Private/Admin
// For each department: compares current live queue length against how many
// counters are actively serving it. If the ratio is too high, suggests
// opening another counter — using the same AI wait-time model as booking,
// so the number shown ("predicted wait if unchanged") is consistent everywhere.
const getStaffAllocationSuggestion = asyncHandler(async (req, res) => {
  const services = await Service.find({ isActive: true });
  const suggestions = [];

  for (const service of services) {
    const queueLength = await Token.countDocuments({ service: service._id, status: { $in: ACTIVE_STATUSES } });
    const activeCounters = await Counter.countDocuments({ service: service._id, status: 'active' });

    const now = new Date();
    const { predictedMinutes } = await predictWaitTime(service._id, service.avgServiceTimeMinutes, {
      hour: now.getHours(),
      dayOfWeek: now.getDay(),
      queueLengthAtBooking: queueLength,
    });

    const loadPerCounter = queueLength / Math.max(activeCounters, 1);
    // heuristic: more than ~5 people stacked up behind each open counter,
    // or predicted wait already over 25 minutes -> flag it
    const needsAttention = loadPerCounter > 5 || predictedMinutes > 25;

    suggestions.push({
      service: service.name,
      queueLength,
      activeCounters,
      predictedWaitMinutes: predictedMinutes,
      needsAttention,
      recommendation: needsAttention
        ? `Consider opening another counter for ${service.name} — ${queueLength} waiting across only ${activeCounters} active counter(s).`
        : 'No action needed right now.',
    });
  }

  new ApiResponse(200, { suggestions }, 'Staff allocation suggestions').send(res);
});

// @route   GET /api/admin/staff
// @access  Private/Admin
// Lists all staff accounts — used to populate the "assign staff to counter" dropdown
const getStaffList = asyncHandler(async (req, res) => {
  const staff = await User.find({ role: 'staff' }).select('name email assignedCounter');
  new ApiResponse(200, { staff }, 'Staff list').send(res);
});

module.exports = { getDashboardOverview, getAnalytics, getStaffAllocationSuggestion, getStaffList };
