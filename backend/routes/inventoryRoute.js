const express = require('express');
const router = express.Router();

const inventoryController = require('../controllers/inventoryController.js');

router.post('/add/unit', inventoryController.addUnit);
router.get('/summary', inventoryController.getSummary);
router.get('/all', inventoryController.getAllUnits);

module.exports = router;