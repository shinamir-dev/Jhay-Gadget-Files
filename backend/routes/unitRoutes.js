const express = require('express');
const router = express.Router();

const unitController = require('../controllers/unitController.js');

router.post('/create', unitController.createProduct);
router.post('/color', unitController.createColor);
router.get('/get/products', unitController.getProducts);
router.get('/get/colors', unitController.getColors)

module.exports = router;
