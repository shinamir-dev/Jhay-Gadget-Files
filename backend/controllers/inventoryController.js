const db = require('../config/db.js');

exports.addUnit = (req, res) => {
    const { product_id, color, serial_number, purchase_price } = req.body;
    const sql = `INSERT INTO inventory_units(product_id, color, serial_number, purchase_price)
    VALUES (?, ?, ?, ?)`;

    db.query(sql, [product_id, color, serial_number, purchase_price], (error, result) => {
        if (error) {
            return res.status(500).json(error);
        }

        res.json({
            message:'Unit added successfully!'
        })
    })
}

exports.getSummary = (req, res) => {

const sql = `
SELECT 
CONCAT(p.name,' ',p.model,' ',p.storage) AS unit,
c.color_name,
COUNT(i.inventory_id) AS stock

FROM products p

LEFT JOIN inventory_units i
ON p.product_id = i.product_id
AND i.status = 'available'

LEFT JOIN colors c
ON i.color_id = c.color_id

GROUP BY p.product_id, c.color_id
ORDER BY p.name
`;

db.query(sql, (err, result) => {

if(err){
return res.status(500).json(err);
}

const sheet = {};

result.forEach(r => {

if(!sheet[r.unit]){
sheet[r.unit] = { unit: r.unit, total: 0 };
}

sheet[r.unit][r.color_name] = r.stock;
sheet[r.unit].total += r.stock;

});

res.json(Object.values(sheet));

});

};