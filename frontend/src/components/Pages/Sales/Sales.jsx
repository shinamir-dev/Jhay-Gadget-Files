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

const statusClass = (status) => {
  const map = {
    sold: "status-sold",
    upgrade: "status-upgrade",
  };
  return map[status?.toLowerCase()] || "status-unknown";
};

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [preorders, setPreorders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    setLoading(true);

    fetch(
      `http://192.168.254.196:5000/api/sale/get/summary?date=${selectedDate}`
    )
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load sales data");
        return r.json();
      })
      .then((data) => {
        setSales(data.sales || []);
        setSummary(data.summary || []);
        setExpenses(data.expenses || []);
        setPreorders(data.preorders || []);
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

  const totalSales = sales.reduce((sum, s) => {
    return (
      sum +
      (s.payments || []).reduce(
        (pSum, p) => pSum + Number(p.cash || 0) + Number(p.finance || 0),
        0
      )
    );
  }, 0);

  const totalCashFromSales = sales.reduce((sum, s) => {
    return (
      sum +
      (s.payments || []).reduce((pSum, p) => {
        if (p.method === "Cash") {
          return pSum + Number(p.cash || 0) + Number(p.finance || 0);
        }
        return pSum;
      }, 0)
    );
  }, 0);

  const totalPreorderCash = preorders.reduce((sum, p) => {
    if (p.payment_method === "Cash") {
      return sum + Number(p.payment || 0);
    }
    return sum;
  }, 0);

  const totalPreorders = preorders.reduce(
    (sum, p) => sum + Number(p.payment || 0),
    0
  );

  const totalCashSales = totalCashFromSales + totalPreorderCash;
  const totalNonCashSales = totalSales - totalCashFromSales;
  const totalExpenses = expenses.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0
  );

  const remainingCash = totalCashSales - totalExpenses;
  const netRevenue = totalSales + totalPreorders - totalExpenses;

  const totalTx = sales.length;

  const grandQty = sales.reduce(
    (sum, s) => sum + (Number(s.quantity) || 1),
    0
  );

  const preorderSummary = preorders.reduce((acc, p) => {
    const method = p.payment_method || "Other";

    if (!acc[method]) {
      acc[method] = {
        payment_method: method,
        total_sales: 0,
        total_transactions: 0,
      };
    }

    acc[method].total_sales += Number(p.payment || 0);
    acc[method].total_transactions += 1;

    return acc;
  }, {});

  const mergedSummaryMap = {};

  summary.forEach((s) => {
    mergedSummaryMap[s.payment_method] = {
      payment_method: s.payment_method,
      total_sales: Number(s.total_sales || 0),
      total_transactions: Number(s.total_transactions || 0),
    };
  });

  Object.values(preorderSummary).forEach((p) => {
    if (!mergedSummaryMap[p.payment_method]) {
      mergedSummaryMap[p.payment_method] = { ...p };
    } else {
      mergedSummaryMap[p.payment_method].total_sales += p.total_sales;
      mergedSummaryMap[p.payment_method].total_transactions +=
        p.total_transactions;
    }
  });

  const mergedSummary = Object.values(mergedSummaryMap);
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

      <div className="metrics-inline">
        <div>
          <span>Total Revenue:</span> <strong>{fmt(totalSales)}</strong>
        </div>

        <div>
          <span>Cash Sales:</span> <strong>{fmt(totalCashSales)}</strong>
        </div>

        <div>
          <span>Non-Cash Sales:</span> <strong>{fmt(totalNonCashSales)}</strong>
        </div>

        <div>
          <span>Total Expenses:</span> <strong>{fmt(totalExpenses)}</strong>
        </div>

        <div>
          <span>Cash Remaining:</span> <strong>{fmt(remainingCash)}</strong>
        </div>

        <div>
          <span>Net Revenue:</span> <strong>{fmt(netRevenue)}</strong>
        </div>

        <div>
          <span>Transactions:</span> <strong>{totalTx}</strong>
        </div>

        <div>
          <span>Items Sold:</span> <strong>{grandQty}</strong>
        </div>
      </div>

      <div className="summary-inline">
        <h2>Sales & Pre-Orders by Payment Method</h2>

        {mergedSummary.map((s) => (
          <div className="summary-row" key={s.payment_method}>
            <span className={`tag ${badgeClass(s.payment_method)}`}>
              {s.payment_method}
            </span>

            <span>{s.total_transactions} txn</span>

            <strong>{fmt(s.total_sales)}</strong>
          </div>
        ))}
      </div>

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

      <div className="expenses-section">
        <h2>Pre-Orders</h2>

        {preorders.length === 0 ? (
          <p className="empty">No pre-orders recorded.</p>
        ) : (
          preorders.map((p) => (
            <div key={p.preorder_id} className="expense-row">
              <span>{p.item}</span>

              <span className={`tag ${badgeClass(p.payment_method)}`}>
                {p.payment_method}
              </span>

              <strong>{fmt(p.payment)}</strong>
            </div>
          ))
        )}

        <div className="expense-total">
          <span>Total Pre-Orders</span>
          <strong>{fmt(totalPreorders)}</strong>
        </div>
      </div>

      <div className="sales-list">
        <h2>Transaction Details</h2>

        {sales.map((s) => {
          const isUpgrade = !!s.old_product_name;

          return (
            <div className="sale-item" key={s.sales_id}>
              <div className="sale-main">
                {isUpgrade ? (
                  <div className="upgrade-wrapper">
                    <div className="upgrade-old">
                      <span className="label">TRADE-IN</span>
                      <strong>
                        {s.old_product_name} {s.old_model}
                      </strong>
                      <div className="sale-meta">
                        {s.old_storage || "N/A"} • {s.old_color} •{" "}
                        {s.old_condition || "N/A"}
                      </div>
                    </div>

                    <div className="upgrade-arrow">→</div>

                    <div className="upgrade-new">
                      <span className="label">UPGRADED TO</span>
                      <strong>
                        {s.product_name} {s.model}
                      </strong>
                      <div className="sale-meta">
                        {s.storage} • {s.color_name}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <strong>{s.product_name}</strong>
                    <span className="sale-meta">
                      {s.model} • {s.color_name} • {s.storage}
                    </span>
                  </>
                )}

                <span className={`status-tag ${statusClass(s.status)}`}>
                  {isUpgrade ? "Upgrade" : s.status || "Sold"}
                </span>
              </div>

              <div className="sale-side">
                <span>{s.quantity}x</span>

                {(s.payments || []).map((p) => (
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
          );
        })}
      </div>
    </div>
  );
}