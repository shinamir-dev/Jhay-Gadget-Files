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

exports.createColor = (req, res) => {
    const { color_name } = req.body;
    
    const sql = `INSERT INTO colors (color_name) VALUES(?)`;
    db.query(sql, [color_name], (error, result) => {
        if (error) {
            return res.status(500).json(error);
        }

        res.json({
            message: "Color added successfully!",
            color_id: result.insert
        })
    })
}

exports.getProducts = (req, res) => {
    const sql = `SELECT product_id, name, model, storage FROM products`;

    db.query(sql, (error, result) => {
        if (error) return res.status(500).json(error);
        res.json(result);
    });
};

exports.getColors = (req, res) => {
    const sql = `SELECT color_id, color_name FROM colors`;

    db.query(sql, (error, result) => {
        if (error) return res.status(500).json(error);
        res.json(result);
    });
};
