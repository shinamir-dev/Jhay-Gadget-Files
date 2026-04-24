const express = require('express');
const router = express.Router();

const expensesController = require('../controllers/expensesController.js');

router.post('/add', expensesController.addExpenses);
router.post('/preorder', expensesController.addPreorder)
module.exports = router;