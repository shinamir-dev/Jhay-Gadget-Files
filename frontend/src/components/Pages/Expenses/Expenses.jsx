import { useEffect, useState } from "react";
import "./Expenses.css";

export default function Expenses() {
  const [expense, setExpense] = useState("");
  const [amount, setAmount] = useState("");
  const [mopId, setMopId] = useState("");

  const [mopList, setMopList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // 🔹 Fetch payment methods
  useEffect(() => {
    fetch("http://192.168.1.252:5000/api/payment/get")
      .then((res) => res.json())
      .then((data) => setMopList(data))
      .catch(() => setMopList([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(
        "http://192.168.1.252:5000/api/expense/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            expense,
            amount,
            mop_id: mopId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setMessage("✅ Expense added successfully!");
      setExpense("");
      setAmount("");
      setMopId("");
    } catch (err) {
      setError(err.message || "Error adding expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pos-container">
      <h1>Add Expense</h1>

      <div className="filter-bar">
        <span className="date-label">
          Record daily operational expenses
        </span>
      </div>

      <form className="sales-list" onSubmit={handleSubmit}>
        {/* EXPENSE NAME */}
        <div className="sale-item">
          <div className="sale-main">
            <label>Expense</label>
            <input
              type="text"
              value={expense}
              onChange={(e) => setExpense(e.target.value)}
              placeholder="e.g. Transportation, Supplies"
              required
            />
          </div>
        </div>

        {/* AMOUNT */}
        <div className="sale-item">
          <div className="sale-main">
            <label>Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* PAYMENT METHOD */}
        <div className="sale-item">
          <div className="sale-main">
            <label>Payment Method</label>
            <select
              value={mopId}
              onChange={(e) => setMopId(e.target.value)}
              required
            >
              <option value="">Select method</option>
              {mopList.map((m) => (
                <option key={m.mop_id} value={m.mop_id}>
                  {m.payment_method}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* BUTTON */}
        <div className="sale-total">
          <button className="print-btn" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add Expense"}
          </button>
        </div>

        {/* FEEDBACK */}
        {message && <p className="tag badge-cash">{message}</p>}
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}