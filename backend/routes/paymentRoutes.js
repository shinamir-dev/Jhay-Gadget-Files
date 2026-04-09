const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController.js');

router.post('/create', paymentController.createPaymentMethod);
router.post('/sale/checkout', paymentController.checkoutSale)
router.get('/get', paymentController.getPaymentMethod)
router.get('/sale/get', paymentController.getUnitDetails)

module.exports = router;