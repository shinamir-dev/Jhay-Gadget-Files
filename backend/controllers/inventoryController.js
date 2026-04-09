const db = require('../config/db.js');

exports.addUnit = (req, res) => {
    const { product_id, color_id, quantity, item_condition, mop_id } = req.body;
    let status = "available";
    if (Number(quantity) === 0) {
        status = "no stock";
    }

    const sql = `
        INSERT INTO inventory_units(product_id, color_id, quantity, item_condition, status, mop_id)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [product_id, color_id, quantity, item_condition, status, mop_id], (error, result) => {
        if (error) {
            return res.status(500).json(error);
        }

        res.json({
            message: 'Unit added successfully!',
            status: status 
        });
    });
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

exports.getAllUnits = (req, res) => {
  const sql = `
    SELECT 
        p.product_id,
        p.name,
        p.model,
        p.storage,
        p.image,
        COALESCE(c.color_name, 'Unknown') AS color_name,
        COALESCE(i.quantity, 0) AS quantity,
        COALESCE(i.status, 'not_assigned') AS status
    FROM products p
    LEFT JOIN inventory_units i
        ON p.product_id = i.product_id
    LEFT JOIN colors c
        ON i.color_id = c.color_id
    ORDER BY p.name, p.model, c.color_name
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);

    const summary = {};

    result.forEach((r) => {
      if (!summary[r.product_id]) {
        summary[r.product_id] = {
          product_id: r.product_id, 
          name: r.name,
          model: r.model,
          storage: r.storage,
          image: r.image,
          total: 0,
          units: []
        };
      }

      const unitInfo = {
        color: r.color_name,
        quantity: Number(r.quantity),
        status: r.status
      };

      summary[r.product_id].units.push(unitInfo);
      summary[r.product_id].total += Number(r.quantity);
    });

    res.json(Object.values(summary));
  });
};

exports.saleUnit = (req, res) => {
    const { product_id, color_id, quantity, payment_method } = req.body;

    const checkSql = `
        SELECT quantity 
        FROM inventory_units 
        WHERE product_id = ? AND color_id = ?
    `;

    db.query(checkSql, [product_id, color_id], (err, results) => {
        if (err) return res.status(500).json(err);

        if (results.length === 0) {
            return res.status(404).json({ message: "Item not found" });
        }

        const currentQty = results[0].quantity;

        if (currentQty < quantity) {
            return res.status(400).json({
                message: "Not enough stock",
                currentQty
            });
        }

        const newQty = currentQty - quantity;
        const newStatus = newQty === 0 ? "no stock" : "available";
        const updateSql = `
            UPDATE inventory_units
            SET quantity = ?, status = ?
            WHERE product_id = ? AND color_id = ?
        `;

        db.query(updateSql, [newQty, newStatus, product_id, color_id, payment_method], (error, result) => {
            if (error) return res.status(500).json(error);

            res.json({
                message: "Stock deducted successfully",
                remaining: newQty,
                status: newStatus
            });
        });
    });
};