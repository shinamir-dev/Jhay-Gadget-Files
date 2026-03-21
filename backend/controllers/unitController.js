const db = require('../config/db.js');

exports.createProduct = (req, res) => {
    const { name, model, storage} = req.body;

    const sql = `INSERT INTO products (name, model, storage) VALUES (?, ?, ?)`;

    db.query(sql, [name, model, storage], (error, result) => {
        if (error) {
            return res.status(500).json(error);
        }

        res.json({
            message: 'Product unit created!',
            product_id: result.insertId
        })
    })
}

