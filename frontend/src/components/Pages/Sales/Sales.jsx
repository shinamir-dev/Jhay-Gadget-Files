import { useEffect, useState } from "react";
import "./Sales.css";

const fmt = (n) =>
  "₱" + Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const badgeClass = (method) => {
  const map = {
    Cash: "badge-cash",
    GCash: "badge-gcash",
    "Credit Card": "badge-card",
    "Pag-IBIG": "badge-finance",
    "Bank Loan": "badge-finance",
    Finance: "badge-finance",
  };
  return map[method] || "badge-other";
};

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netSales, setNetSales] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    setLoading(true);

    fetch(
      `http://192.168.1.252:5000/api/sale/get/summary?date=${selectedDate}`
    )
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load sales data");
        return r.json();
      })
      .then((data) => {
        setSales(data.sales || []);
        setSummary(data.summary || []);
        setExpenses(data.expenses || []);
        setTotalExpenses(data.total_expenses || 0);
        setNetSales(data.net_sales || 0);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  if (loading)
    return (
      <div className="pos-container">
        <p>Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="pos-container">
        <p className="error">{error}</p>
      </div>
    );

  const totalSales = summary.reduce(
    (s, r) => s + Number(r.total_sales || 0),
    0
  );

  const totalTx = summary.reduce(
    (s, r) => s + Number(r.total_transactions || 0),
    0
  );

  const grandQty = sales.reduce((s, r) => s + Number(r.quantity || 0), 0);

  const formattedDate = new Date(selectedDate).toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="pos-container">
      <h1>Daily Sales Report</h1>
      <p className="date-label">{formattedDate}</p>

    <div className="filter-bar">
      <div className="date-control">
        <label>Select Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <button onClick={() => window.print()} className="print-btn">
        Print / Save PDF
      </button>
    </div>

      {/* METRICS */}
      <div className="metrics-inline">
        <div>
          <span>Total Revenue:</span> <strong>{fmt(totalSales)}</strong>
        </div>

        <div>
          <span>Total Expenses:</span> <strong>{fmt(totalExpenses)}</strong>
        </div>

        <div>
          <span>Net Revenue:</span> <strong>{fmt(netSales)}</strong>
        </div>

        <div>
          <span>Transactions:</span> <strong>{totalTx}</strong>
        </div>

        <div>
          <span>Items Sold:</span> <strong>{grandQty}</strong>
        </div>
      </div>

      <div className="summary-inline">
        <h2>Sales by Payment Method</h2>

        {summary.map((s) => (
          <div className="summary-row" key={s.payment_method}>
            <span className={`tag ${badgeClass(s.payment_method)}`}>
              {s.payment_method}
            </span>

            <span>{s.total_transactions} txn</span>

            <strong>{fmt(s.net_sales)}</strong>
          </div>
        ))}
      </div>

      {/* EXPENSES SECTION */}
      <div className="expenses-section">
        <h2>Expenses</h2>

        {expenses.length === 0 ? (
          <p className="empty">No expenses recorded.</p>
        ) : (
          expenses.map((e) => (
            <div key={e.expense_id} className="expense-row">
              <span>{e.expense}</span>

              <span className={`tag ${badgeClass(e.payment_method)}`}>
                {e.payment_method}
              </span>

              <strong>{fmt(e.amount)}</strong>
            </div>
          ))
        )}

        <div className="expense-total">
          <span>Total Expenses</span>
          <strong>{fmt(totalExpenses)}</strong>
        </div>
      </div>

      {/* SALES LIST */}
      <div className="sales-list">
        <h2>Transaction Details</h2>

        {sales.map((s) => (
          <div className="sale-item" key={s.sales_id}>
            <div className="sale-main">
              <strong>{s.product_name}</strong>
              <span className="sale-meta">
                {s.model} • {s.color_name} • {s.storage}
              </span>
            </div>

            <div className="sale-side">
              <span>{s.quantity}x</span>

              {s.payments.map((p) => (
                <div key={p.sale_payment_id}>
                  {p.cash > 0 && (
                    <span className={`tag ${badgeClass("Cash")}`}>
                      {p.method}: {fmt(p.cash)}
                    </span>
                  )}

                  {p.finance > 0 && (
                    <span className={`tag ${badgeClass(p.method)}`}>
                      {p.method}: {fmt(p.finance)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}