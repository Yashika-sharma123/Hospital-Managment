const express = require('express');
const router = express.Router();

const { getWaitTimePrediction, getNoShowPrediction } = require('../controllers/prediction.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

router.use(protect, restrictTo('admin'));

router.get('/wait-time/:serviceId', getWaitTimePrediction);
router.get('/no-show/:serviceId', getNoShowPrediction);

module.exports = router;
