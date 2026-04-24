const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController.js');

router.post('/create', paymentController.createPaymentMethod);
router.post('/sale/checkout', paymentController.checkoutSale);
router.post('/upgrade', paymentController.upgradeUnit)
router.get('/get', paymentController.getPaymentMethod)
router.get('/sale/get', paymentController.getUnitDetails)
router.get('/get/status', paymentController.showUpgrade)
router.get('/get/option', paymentController.getUpgradeOptions)
module.exports = router;