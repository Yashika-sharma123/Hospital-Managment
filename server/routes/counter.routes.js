const express = require('express');
const router = express.Router();

const {
  createCounter,
  listCounters,
  assignStaff,
  setCounterStatus,
  updateCounter,
  deleteCounter,
} = require('../controllers/counter.controller');
const { callNext, markServed, markNoShow } = require('../controllers/staff.controller');
const {
  createCounterValidator,
  updateCounterValidator,
  assignStaffValidator,
  counterIdParamValidator,
} = require('../validators/counter.validator');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

router.use(protect); // every route below requires login

// ---- Admin: setting up the department/counter structure ----
router.post('/', restrictTo('admin'), createCounterValidator, validate, createCounter);
router.get('/', restrictTo('admin', 'staff'), listCounters);
router.put('/:counterId', restrictTo('admin'), updateCounterValidator, validate, updateCounter);
router.delete('/:counterId', restrictTo('admin'), counterIdParamValidator, validate, deleteCounter);
router.patch('/:counterId/assign-staff', restrictTo('admin'), assignStaffValidator, validate, assignStaff);

// ---- Staff: day-to-day counter operation ----
router.patch('/:counterId/status', restrictTo('admin', 'staff'), counterIdParamValidator, validate, setCounterStatus);
router.post('/:counterId/call-next', restrictTo('admin', 'staff'), counterIdParamValidator, validate, callNext);
router.patch('/:counterId/served', restrictTo('admin', 'staff'), counterIdParamValidator, validate, markServed);
router.patch('/:counterId/no-show', restrictTo('admin', 'staff'), counterIdParamValidator, validate, markNoShow);

module.exports = router;
