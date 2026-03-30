const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController.js');

router.post('/create', paymentController.createPaymentMethod);
router.get('/get', paymentController.getPaymentMethod)

module.exports = router;