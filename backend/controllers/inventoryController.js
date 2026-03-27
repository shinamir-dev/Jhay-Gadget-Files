const db = require('../config/db.js');

exports.addUnit = (req, res) => {
    const { product_id, color_id, quantity, item_condition } = req.body;
    const sql = `INSERT INTO inventory_units(product_id, color_id, quantity, item_condition)
    VALUES (?, ?, ?, ?)`;

    db.query(sql, [product_id, color_id, quantity, item_condition], (error, result) => {
        if (error) {
            return res.status(500).json(error);
        }

        res.json({
            message:'Unit added successfully!'
        })
    })
}

exports.getSummary = (req, res) => {
  const status = req.query.status || "available";

  const sql = `
    SELECT 
        CONCAT(p.name,' ',p.model,' ',p.storage) AS unit,
        COALESCE(c.color_name, 'Unknown') AS color_name,
        COALESCE(SUM(i.quantity), 0) AS stock

        FROM products p

        LEFT JOIN inventory_units i
        ON p.product_id = i.product_id
        AND i.status = ?

        LEFT JOIN colors c
        ON i.color_id = c.color_id

        GROUP BY p.product_id, c.color_id
        HAVING SUM(i.quantity) > 0

    ORDER BY p.name
  `;

  db.query(sql, [status], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    const sheet = {};

    result.forEach(r => {
    if (!sheet[r.unit]) {
        sheet[r.unit] = { unit: r.unit, total: 0 };
    }

    const stock = Number(r.stock) || 0;

    sheet[r.unit][r.color_name] = stock;
    sheet[r.unit].total += stock;
    });

    res.json(Object.values(sheet));
  });
};