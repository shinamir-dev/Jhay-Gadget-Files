const express = require('express');
const router = express.Router();

const unitController = require('../controllers/unitController.js');

router.post('/create', unitController.createProduct);

module.exports = router;
