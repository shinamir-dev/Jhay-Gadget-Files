const db = require('../config/db');

exports.getDailySales = (req, res) => {
  const selectedDate = req.query.date || new Date().toISOString().slice(0, 10);

  // Detailed sales query with merged cash + finance payments
  const detailQuery = `
    SELECT 
      s.sales_id,
      DATE(s.sale_date) AS sale_date,
      p.name AS product_name,
      p.model,
      p.storage,
      c.color_name,
      s.quantity,
      s.total,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'sale_payment_id', sp.sale_payment_id,
          'cash', sp.amount,
          'finance', sp.finance,
          'method', mop.payment_method,
          'created_at', sp.created_at
        )
      ) AS payments
    FROM sales s
    JOIN products p ON s.product_id = p.product_id
    JOIN colors c ON s.color_id = c.color_id
    JOIN sale_payments sp ON s.sales_id = sp.sales_id
    JOIN mode_of_payment mop ON sp.mop_id = mop.mop_id
    WHERE DATE(s.sale_date) = ?
    GROUP BY s.sales_id, s.quantity, s.total, p.name, p.model, p.storage, c.color_name
    ORDER BY s.sales_id ASC
  `;

  // Summary by payment method (aggregates cash only)
  const summaryQuery = `
    SELECT 
      mop.payment_method,
      COUNT(DISTINCT s.sales_id) AS total_transactions,
      SUM(sp.amount + IFNULL(sp.finance, 0)) AS total_sales
    FROM sale_payments sp
    JOIN sales s ON sp.sales_id = s.sales_id
    JOIN mode_of_payment mop ON sp.mop_id = mop.mop_id
    WHERE DATE(s.sale_date) = ?
    GROUP BY mop.payment_method
  `;

  db.query(detailQuery, [selectedDate], (err, details) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }

    db.query(summaryQuery, [selectedDate], (err2, summary) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json(err2);
      }

      res.json({
        date: selectedDate,
        sales: details,
        summary: summary,
      });
    });
  });
};