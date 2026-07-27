const express = require('express');
const router = express.Router();

const {
  getDashboardOverview,
  getAnalytics,
  getStaffAllocationSuggestion,
  getStaffList,
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

router.use(protect, restrictTo('admin'));

router.get('/dashboard', getDashboardOverview);
router.get('/analytics', getAnalytics);
router.get('/staff-allocation-suggestion', getStaffAllocationSuggestion);
router.get('/staff', getStaffList);

module.exports = router;
