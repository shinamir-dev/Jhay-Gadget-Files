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
    const { product_id, color_id, quantity, serial_number, total, payments } = req.body;
    console.log(req.body);
    db.beginTransaction((err) => {
        if (err) return res.status(500).json(err);

        const saleSql = `
            INSERT INTO sales 
            (product_id, color_id, quantity, serial_number, total, status_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(saleSql, [product_id, color_id, quantity, serial_number, total, 4], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    res.status(500).json(err);
                });
            }

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
                if (err2) {
                    return db.rollback(() => {
                        res.status(500).json(err2);
                    });
                }

                const updateStockSql = `
                    UPDATE inventory_units
                    SET quantity = quantity - ?
                    WHERE product_id = ? AND color_id = ?
                `;

                db.query(updateStockSql, [quantity, product_id, color_id], (err3) => {
                    if (err3) {
                        return db.rollback(() => {
                            res.status(500).json(err3);
                        });
                    }

                    db.commit((err4) => {
                        if (err4) {
                            return db.rollback(() => {
                                res.status(500).json(err4);
                            });
                        }

                        res.json({ message: "Checkout successful" });
                    });
                });
            });
        });
    });
};

exports.showUpgrade = (req, res) => {
    const sql = `SELECT status_id, status FROM modification`;

    db.query(sql, (error, result) => {
        if (error) return res.status(500).json(error);
        res.json(result)
    })
}

exports.upgradeUnit = (req, res) => {
    const {
        product_id,
        color_id,
        payments,
        product_id2, 
        color_id2,
        item_condition
    } = req.body;

    console.log("REQUEST BODY:", req.body);
    if (!product_id || !color_id || !product_id2 || !color_id2) {
        return res.status(400).json({
            message: "Missing required fields"
        });
    }

    if (
        !payments ||
        !Array.isArray(payments) ||
        payments.length === 0 ||
        !payments[0].amount ||
        !payments[0].mop_id
    ) {
        return res.status(400).json({
            message: "Invalid payment data"
        });
    }

    const amount = payments[0].amount;
    const mop_id = payments[0].mop_id;

    const quantity = 1;
    const total = amount;
    const STATUS_ID = 3;

    db.beginTransaction((err) => {
        if (err) return res.status(500).json(err);

        const deductStockSql = `
            UPDATE inventory_units
            SET quantity = quantity - ?
            WHERE product_id = ? AND color_id = ? AND quantity >= ?
        `;

        db.query(
            deductStockSql,
            [quantity, product_id, color_id, quantity],
            (deductErr, deductResult) => {
                if (deductErr) {
                    return db.rollback(() => {
                        res.status(500).json({
                            message: "Stock deduction failed",
                            error: deductErr
                        });
                    });
                }

                if (deductResult.affectedRows === 0) {
                    return db.rollback(() => {
                        res.status(400).json({
                            message: "Not enough stock"
                        });
                    });
                }

                const salesSql = `
                    INSERT INTO sales (
                        product_id,
                        color_id,
                        quantity,
                        total,
                        status_id
                    )
                    VALUES (?, ?, ?, ?, ?)
                `;

                db.query(
                    salesSql,
                    [product_id2, color_id2, quantity, total, STATUS_ID],
                    (error, result) => {
                        if (error) {
                            return db.rollback(() => {
                                res.status(500).json({
                                    message: "Sales insert failed",
                                    error
                                });
                            });
                        }

                        const sales_id = result.insertId;

                        const paymentSql = `
                            INSERT INTO sale_payments 
                            (sales_id, mop_id, amount, finance)
                            VALUES (?, ?, ?, 0)
                        `;

                        db.query(
                            paymentSql,
                            [sales_id, mop_id, amount],
                            (payErr) => {
                                if (payErr) {
                                    return db.rollback(() => {
                                        res.status(500).json({
                                            message: "Payment insert failed",
                                            error: payErr
                                        });
                                    });
                                }

                                const upgradeSql = `
                                    INSERT INTO upgrade_transactions
                                    (sales_id, old_product_id, old_color_id, old_condition)
                                    VALUES (?, ?, ?, ?)
                                `;

                                db.query(
                                    upgradeSql,
                                    [sales_id, product_id, color_id, item_condition],
                                    (upgradeErr) => {
                                        if (upgradeErr) {
                                            return db.rollback(() => {
                                                res.status(500).json({
                                                    message: "Upgrade record failed",
                                                    error: upgradeErr
                                                });
                                            });
                                        }

                                        console.log("STOCK IN PARAMS:", {
                                            product_id2,
                                            color_id2,
                                            item_condition
                                        });

                                        const stockInUpdateSql = `
                                            UPDATE inventory_units
                                            SET quantity = quantity + ?
                                            WHERE product_id = ? 
                                            AND color_id = ? 
                                            AND item_condition = ?
                                        `;

                                        db.query(
                                            stockInUpdateSql,
                                            [quantity, product_id2, color_id2, item_condition], // ✅ FIXED
                                            (error2, result2) => {
                                                if (error2) {
                                                    return db.rollback(() => {
                                                        res.status(500).json({
                                                            message: "Stock update failed",
                                                            error: error2
                                                        });
                                                    });
                                                }

                                                if (result2.affectedRows === 0) {
                                                    const insertSql = `
                                                        INSERT INTO inventory_units
                                                        (product_id, color_id, quantity, item_condition, status)
                                                        VALUES (?, ?, ?, ?, 'available')
                                                    `;

                                                    db.query(
                                                        insertSql,
                                                        [product_id2, color_id2, quantity, item_condition], // ✅ FIXED
                                                        (error3) => {
                                                            if (error3) {
                                                                return db.rollback(() => {
                                                                    res.status(500).json({
                                                                        message: "Stock insert failed",
                                                                        error: error3
                                                                    });
                                                                });
                                                            }

                                                            db.commit((err4) => {
                                                                if (err4) {
                                                                    return db.rollback(() =>
                                                                        res.status(500).json(err4)
                                                                    );
                                                                }

                                                                return res.json({
                                                                    message: "Upgrade completed!",
                                                                    sales_id
                                                                });
                                                            });
                                                        }
                                                    );
                                                } else {
                                                    // ✅ Commit if update succeeded
                                                    db.commit((err5) => {
                                                        if (err5) {
                                                            return db.rollback(() =>
                                                                res.status(500).json(err5)
                                                            );
                                                        }

                                                        return res.json({
                                                            message: "Upgrade completed!",
                                                            sales_id
                                                        });
                                                    });
                                                }
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    });
};

exports.getUpgradeOptions = (req, res) => {
    const { product_id } = req.query;
    const sql = `
        SELECT DISTINCT
            iu.product_id,
            p.name,
            p.model,
            p.storage,
            iu.color_id,
            c.color_name,
            iu.quantity,
            iu.item_condition,
            iu.status
        FROM inventory_units iu
        JOIN products p ON iu.product_id = p.product_id
        JOIN colors c ON iu.color_id = c.color_id
        WHERE iu.product_id IS NOT NULL
        AND iu.status = 'available'
        AND iu.quantity > 0
    `;

    db.query(sql, [product_id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to load upgrades",
                error: err
            });
        }

        res.json(result);
    });
};