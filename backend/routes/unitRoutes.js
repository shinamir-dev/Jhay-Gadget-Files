const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

const unitController = require('../controllers/unitController.js');

router.post('/create', upload.single('image'), unitController.createProduct);
router.post('/color', unitController.createColor);
router.get('/get/products', unitController.getProducts);
router.get('/get/colors', unitController.getColors)

module.exports = router;
