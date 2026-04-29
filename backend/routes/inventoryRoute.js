const express = require('express');
const router = express.Router();

const inventoryController = require('../controllers/inventoryController.js');

router.post('/add/unit', inventoryController.addUnit);
router.get('/summary', inventoryController.getSummary);
router.get('/all', inventoryController.getAllUnits);
router.get('/serial/get', inventoryController.getSerials)
router.post('/sale', inventoryController.saleUnit);

module.exports = router;