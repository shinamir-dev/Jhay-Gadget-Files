const express = require('express');
const router = express.Router();

const saleUnitController = require('../controllers/saleUnitController.js');

router.get('/get/summary', saleUnitController.getDailySales);

module.exports = router;