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

exports.getUnitDetails = (req, res) => {
    const { product_id, color_name } = req.query;
    const sql = `
        SELECT 
            iu.inventory_id,
            iu.product_id,
            iu.color_id,
            iu.quantity,
            iu.item_condition,
            iu.status,
            p.name,
            p.model,
            p.storage,
            p.price,
            p.image,
            c.color_name
        FROM inventory_units iu
        LEFT JOIN products p ON iu.product_id = p.product_id
        LEFT JOIN colors c ON iu.color_id = c.color_id
        WHERE iu.product_id = ? AND c.color_name = ?
        LIMIT 1
    `;

    db.query(sql, [product_id, color_name], (error, results) => {
        if (error) {
            return res.status(500).json(error);
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No unit found" });
        }

        res.json(results[0]);
    });
};

exports.checkoutSale = (req, res) => {
    const { product_id, color_id, quantity, total, payments } = req.body;
    console.log(payments)
    const saleSql = `
        INSERT INTO sales 
        (product_id, color_id, quantity, total)
        VALUES (?, ?, ?, ?)
    `;

    db.query(saleSql, [product_id, color_id, quantity, total], (err, result) => {
        if (err) return res.status(500).json(err);

        const sales_id = result.insertId;
        const paymentValues = payments.map(p => [
            sales_id,
            p.mop_id,
            p.amount,
            p.finance
        ]);

        const paymentSql = `
            INSERT INTO sale_payments (sales_id, mop_id, amount, finance)
            VALUES ?
        `;

        db.query(paymentSql, [paymentValues], (err2) => {
            if (err2) return res.status(500).json(err2);

            const updateStockSql = `
                UPDATE inventory_units
                SET quantity = quantity - ?
                WHERE product_id = ? AND color_id = ?
            `;

            db.query(updateStockSql, [quantity, product_id, color_id], (err3) => {
                if (err3) return res.status(500).json(err3);

                res.json({ message: "Checkout successful" });
            });
        });
    });
};