const db = require('../config/db.js');

exports.addExpenses = (req, res) => {
    const { expense, amount, mop_id } = req.body;

    if (!expense || !amount || !mop_id) {
        return res.status(400).json({
            message: "Expense, amount, and payment method are required."
        });
    }

    const sql = `INSERT INTO expenses (expense, amount, mop_id) VALUES (?, ?, ?)`;

    db.query(sql, [expense, amount, mop_id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                message: "Database error while adding expense."
            });
        }

        res.status(201).json({
            message: "Expense added successfully!",
            expense_id: result.insertId
        });
    });
};