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
    GROUP BY 
      s.sales_id, 
      s.quantity, 
      s.total, 
      p.name, 
      p.model, 
      p.storage, 
      c.color_name
    ORDER BY s.sales_id ASC
  `;

  const summaryQuery = `
    SELECT 
      mop.payment_method,
      COUNT(DISTINCT s.sales_id) AS total_transactions,
      SUM(sp.amount + IFNULL(sp.finance,0)) AS total_sales,
      IFNULL(exp.total_expenses, 0) AS total_expenses,
      SUM(sp.amount + IFNULL(sp.finance,0)) - IFNULL(exp.total_expenses, 0) AS net_sales
    FROM sale_payments sp
    JOIN sales s ON sp.sales_id = s.sales_id
    JOIN mode_of_payment mop ON sp.mop_id = mop.mop_id

    LEFT JOIN (
      SELECT 
        mop_id,
        SUM(amount) AS total_expenses
      FROM expenses
      WHERE DATE(expense_date) = ?
      GROUP BY mop_id
    ) exp ON exp.mop_id = mop.mop_id

    WHERE DATE(s.sale_date) = ?
    GROUP BY mop.payment_method, exp.total_expenses
  `;

  const expenseQuery = `
    SELECT 
      e.expense_id,
      e.expense,
      e.amount,
      mop.payment_method,
      e.expense_date
    FROM expenses e
    JOIN mode_of_payment mop ON e.mop_id = mop.mop_id
    WHERE DATE(e.expense_date) = ?
  `;

  const expenseSummaryQuery = `
    SELECT 
      SUM(amount) AS total_expenses
    FROM expenses
    WHERE DATE(expense_date) = ?
  `;

  db.query(detailQuery, [selectedDate], (err, details) => {
    if (err) return res.status(500).json(err);

    db.query(summaryQuery, [selectedDate, selectedDate], (err2, summary) => {
      if (err2) return res.status(500).json(err2);

      db.query(expenseQuery, [selectedDate], (err3, expenses) => {
        if (err3) return res.status(500).json(err3);

        db.query(expenseSummaryQuery, [selectedDate], (err4, expenseTotal) => {
          if (err4) return res.status(500).json(err4);

          const totalExpenses = expenseTotal[0].total_expenses || 0;

          const totalSales = summary.reduce(
            (sum, item) => sum + Number(item.total_sales || 0),
            0
          );

          const netSales = totalSales - totalExpenses;

          res.json({
            date: selectedDate,
            sales: details,
            summary: summary,
            expenses: expenses,
            total_expenses: totalExpenses,
            net_sales: netSales
          });
        });
      });
    });
  });
};

exports.upgradeUnit = (req, res) => {
  
}