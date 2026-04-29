const db = require('../config/db.js');

exports.addUnit = (req, res) => {
    const {
        product_id,
        color_id,
        quantity,
        serial_number,
        item_condition,
    } = req.body;

    console.log(req.body);

    const checkSql = `
        SELECT * FROM inventory_units
        WHERE product_id = ? AND color_id = ? AND item_condition = ?
        LIMIT 1
    `;

    db.query(
        checkSql,
        [product_id, color_id, item_condition],
        (err, results) => {
            if (err) {
                return res.status(500).json(err);
            }

            if (results.length > 0) {
                const existing = results[0];
                const newQuantity = existing.quantity + Number(quantity);

                let status = newQuantity === 0 ? "no stock" : "available";

                const updateSql = `
                    UPDATE inventory_units
                    SET quantity = ?, status = ?
                    WHERE inventory_id = ?
                `;

                db.query(
                    updateSql,
                    [newQuantity, status, existing.inventory_id],
                    (error) => {
                        if (error) {
                            return res.status(500).json(error);
                        }

                        return res.json({
                            message: "Stock updated successfully!",
                            quantity: newQuantity,
                            status
                        });
                    }
                );
            } 

            else {
                let status = Number(quantity) === 0 ? "no stock" : "available";

                const insertSql = `
                    INSERT INTO inventory_units
                    (product_id, color_id, quantity, serial_number, item_condition, status)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;

                db.query(
                    insertSql,
                    [
                        product_id,
                        color_id,
                        quantity,
                        serial_number,
                        item_condition,
                        status,
                    ],
                    (error) => {
                        if (error) {
                            return res.status(500).json(error);
                        }

                        res.json({
                            message: "Unit added successfully!",
                            status
                        });
                    }
                );
            }
        }
    );
};
exports.getSummary = (req, res) => {
  const filter = req.query.status || "preowned";

  let conditionQuery = "";
  let values = [];


  if (filter === "preowned") {
    conditionQuery = "AND i.item_condition = 'PREOWNED'";
  } 
  else if (filter === "brandnew") {
    conditionQuery = "AND i.item_condition = 'BRAND NEW'";
  } 
  else if (filter === "android") {
    conditionQuery = "AND i.item_condition = 'ANDROID'";
  }

  const sql = `
    SELECT 
      CONCAT(p.name,' ',p.model,' ',p.storage) AS unit,
      COALESCE(c.color_name, 'Unknown') AS color_name,
      COALESCE(SUM(i.quantity), 0) AS stock

    FROM products p

    LEFT JOIN inventory_units i
      ON p.product_id = i.product_id
      ${conditionQuery}

    LEFT JOIN colors c
      ON i.color_id = c.color_id

    GROUP BY p.product_id, c.color_id
    HAVING SUM(i.quantity) > 0

    ORDER BY p.name
  `;

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error fetching summary:", err);
      return res.status(500).json(err);
    }

    const sheet = {};

    result.forEach(r => {
      if (!sheet[r.unit]) {
        sheet[r.unit] = {
          unit: r.unit,
          total: 0
        };
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
        COALESCE(i.status, 'not_assigned') AS status,
        COALESCE(i.item_condition, 'UNKNOWN') AS item_condition
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
        status: r.status,
        item_condition: r.item_condition
      };

      summary[r.product_id].units.push(unitInfo);
      summary[r.product_id].total += Number(r.quantity);
    });

    res.json(Object.values(summary));
  });
};

exports.saleUnit = (req, res) => {
    const { product_id, color_id, quantity, total } = req.body;
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

        db.query(updateSql, [newQty, newStatus, product_id, color_id], (error) => {
            if (error) return res.status(500).json(error);

            console.log({
                product_id,
                color_id,
                quantity,
                total,
                SOLD_STATUS_ID
            });

            const insertSaleSql = `
                INSERT INTO sales (product_id, color_id, quantity, total, status_id)
                VALUES (?, ?, ?, ?, ?)
            `;

            const SOLD_STATUS_ID = 2;

                
            db.query(
                insertSaleSql,
                [product_id, color_id, quantity, total, SOLD_STATUS_ID],
                (err2, result2) => {
                    if (err2) return res.status(500).json(err2);
                    res.json({
                        message: "Sale completed successfully",
                        remaining: newQty,
                        status: newStatus
                    });
                    
                }
            );
        });
    });
};

exports.getSerials = (req, res) => {
  const { product_id, color_id, search = "" } = req.query;

  const sql = `
    SELECT inventory_id, serial_number
    FROM inventory_units
    WHERE product_id = ?
      AND color_id = ?
      AND status = 'available'
      AND serial_number IS NOT NULL
      AND serial_number != ''
      AND serial_number LIKE ?
    ORDER BY serial_number ASC
    LIMIT 20
  `;

  db.query(sql, [product_id, color_id, `%${search}%`], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};