const db = require('../config/db');

exports.getDailySales = (req, res) => {
  const selectedDate =
    req.query.date || new Date().toISOString().slice(0, 10);

  const detailQuery = `
    SELECT 
      s.sales_id,
      DATE(s.sale_date) AS sale_date,
      p.name AS product_name,
      p.model,
      p.storage,
      c.color_name,

      p_old.name AS old_product_name,
      p_old.model AS old_model,
      c_old.color_name AS old_color,
      ut.old_condition,

      s.quantity,
      s.total,
      m.status,

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

    LEFT JOIN upgrade_transactions ut ON s.sales_id = ut.sales_id
    LEFT JOIN products p_old ON ut.old_product_id = p_old.product_id
    LEFT JOIN colors c_old ON ut.old_color_id = c_old.color_id

    JOIN sale_payments sp ON s.sales_id = sp.sales_id
    JOIN mode_of_payment mop ON sp.mop_id = mop.mop_id
    LEFT JOIN modification m ON s.status_id = m.status_id

    WHERE DATE(s.sale_date) = ?

    GROUP BY 
      s.sales_id,
      s.sale_date,
      p.name, p.model, p.storage, c.color_name,
      p_old.name, p_old.model, c_old.color_name, ut.old_condition,
      s.quantity, s.total, m.status

    ORDER BY s.sales_id ASC
  `;

  const summaryQuery = `
    SELECT 
      mop.payment_method,
      COUNT(DISTINCT s.sales_id) AS total_transactions,
      SUM(sp.amount + IFNULL(sp.finance,0)) AS total_sales
    FROM sale_payments sp
    JOIN sales s ON sp.sales_id = s.sales_id
    JOIN mode_of_payment mop ON sp.mop_id = mop.mop_id
    WHERE DATE(s.sale_date) = ?
    GROUP BY mop.payment_method
  `;

  const expenseQuery = `
    SELECT 
      e.expense_id,
      e.expense,
      e.amount,
      mop.payment_method
    FROM expenses e
    JOIN mode_of_payment mop ON e.mop_id = mop.mop_id
    WHERE DATE(e.expense_date) = ?
  `;

  const preorderQuery = `
    SELECT 
      p.preorder_id,
      p.item,
      p.payment,
      mop.payment_method
    FROM preorder p
    JOIN mode_of_payment mop ON p.mop_id = mop.mop_id
    WHERE DATE(p.created_at) = ?
  `;

  db.query(detailQuery, [selectedDate], (err, sales) => {
    if (err) return res.status(500).json(err);

    db.query(summaryQuery, [selectedDate], (err2, summary) => {
      if (err2) return res.status(500).json(err2);

      db.query(expenseQuery, [selectedDate], (err3, expenses) => {
        if (err3) return res.status(500).json(err3);

        db.query(preorderQuery, [selectedDate], (err4, preorders) => {
          if (err4) return res.status(500).json(err4);

          const totalExpenses = expenses.reduce(
            (sum, e) => sum + Number(e.amount || 0),
            0
          );

          const totalSales = summary.reduce(
            (sum, s) => sum + Number(s.total_sales || 0),
            0
          );

          const totalPreorders = preorders.reduce(
            (sum, p) => sum + Number(p.payment || 0),
            0
          );

          const netSales = totalSales + totalPreorders - totalExpenses;

          res.json({
            date: selectedDate,
            sales,
            summary,
            expenses,
            preorders,
            total_expenses: totalExpenses,
            total_preorders: totalPreorders,
            net_sales: netSales,
          });
        });
      });
    });
  });
};
