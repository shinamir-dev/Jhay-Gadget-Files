const db = require('../config/db.js');

exports.createPaymentMethod = (req, res) => {
    const { payment_method } = req.body;

    const sql = `INSERT INTO mode_of_payment (payment_method) VALUES (?)`;
    db.query(sql, [payment_method], (error, result) => {
        if (error) {
            return res.status(500).json(error);
        }

        res.json({
            message: "Payment Method Successfully Created",
            mop_id: result.insertId
        })
    })
};

exports.getPaymentMethod = (req, res) => {
    const sql = `SELECT mop_id, payment_method FROM mode_of_payment`;
    db.query(sql, (error, result) => {
        if (error) return res.status(500).json(error);
        res.json(result);
    });
}

