const express = require('express');
const router = express.Router();
const { getActiveServices } = require('../controllers/service.controller');

router.get('/', getActiveServices);

module.exports = router;
