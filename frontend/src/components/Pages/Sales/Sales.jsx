import { useEffect, useState } from "react";
import "./Sales.css";

const fmt = (n) =>
  "₱" + Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

// Badge styles for different payment methods
const badgeClass = (method) => {
  const map = {
    Cash: "badge-cash",
    GCash: "badge-gcash",
    "Credit Card": "badge-card",
    "Pag-IBIG": "badge-finance",
    "Bank Loan": "badge-finance",
    "Finance": "badge-finance",
  };
  return map[method] || "badge-other";
};

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState([]);
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
  const totalItems = summary.reduce(
    (s, r) => s + Number(r.total_items_sold || 0),
    0
  );
  const totalTx = summary.reduce(
    (s, r) => s + Number(r.total_transactions || 0),
    0
  );

  const grandQty = sales.reduce((s, r) => s + Number(r.quantity || 0), 0);
  const grandTotal = sales.reduce((sum, sale) => {
  const paymentsTotal = sale.payments.reduce((pSum, p) => {
      return pSum + Number(p.cash || 0) + Number(p.finance || 0);
    }, 0);
    return sum + paymentsTotal;
  }, 0);

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
        <label>Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <button onClick={() => window.print()} className="print-btn">
          Print / Save PDF
        </button>
      </div>

      <div className="metrics-inline">
        <div>
          <span>Total Revenue:</span> <strong>{fmt(totalSales)}</strong>
        </div>
        <div>
          <span>Transactions:</span> <strong>{totalTx}</strong>
        </div>
        <div>
          <span>Items Sold:</span> <strong>{totalItems}</strong>
        </div>
        <div>
          <span>Avg per Sale:</span>{" "}
          <strong>{totalTx ? fmt(totalSales / totalTx) : "₱0.00"}</strong>
        </div>
      </div>

      {/* PAYMENT SUMMARY INLINE */}
      <div className="summary-inline">
        <h2>Sales by Payment Method</h2>

        {summary.map((s) => (
          <div className="summary-row" key={s.payment_method}>
            <span className={`tag ${badgeClass(s.payment_method)}`}>
              {s.payment_method}
            </span>
            <span>{s.total_transactions} txn</span>
            <span>{s.total_items_sold} items</span>
            <strong>{fmt(s.total_sales)}</strong>
          </div>
        ))}
      </div>

      <div className="sales-list">
        <h2>Transaction Details</h2>

        {sales.length === 0 ? (
          <p className="empty">No sales found.</p>
        ) : (
          <>
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
                    <div key={p.sale_payment_id} className="payment-info">
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
                  <strong>
                    {fmt(
                      s.payments.reduce(
                        (sum, p) => sum + Number(p.cash || 0) + Number(p.finance || 0),
                        0
                      )
                    )}
                  </strong>
                </div>
              </div>
            ))}

            {/* TOTAL */}
            <div className="sale-total">
              <span>Total Items: {grandQty}</span>
              <strong>{fmt(grandTotal)}</strong>
            </div>
          </>
        )}
      </div>
    </div>
  );
}