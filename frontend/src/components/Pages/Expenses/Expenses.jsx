import { useEffect, useState } from "react";
import "./Expenses.css";

export default function Expenses() {
  const [mode, setMode] = useState("expense"); 

  const [name, setName] = useState(""); 
  const [amount, setAmount] = useState("");
  const [mopId, setMopId] = useState("");

  const [mopList, setMopList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://192.168.254.196:5000/api/payment/get")
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
      const url =
        mode === "expense"
          ? "http://192.168.254.196:5000/api/expense/add"
          : "http://192.168.254.196:5000/api/expense/preorder";

      const body =
        mode === "expense"
          ? {
              expense: name,
              amount: Number(amount),
              mop_id: mopId,
            }
          : {
              item: name,
              payment: Number(amount),
              mop_id: mopId,
            };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setMessage(
        mode === "expense"
          ? "Expense added successfully!"
          : "Pre-order added successfully!"
      );

      setName("");
      setAmount("");
      setMopId("");
    } catch (err) {
      setError(err.message || "Error saving record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pos-container">
      <h1>Records</h1>

      <div className="filter-bar">
        <button
          onClick={() => setMode("expense")}
          className={mode === "expense" ? "print-btn" : ""}
        >
          Expense
        </button>
        <button
          onClick={() => setMode("preorder")}
          className={mode === "preorder" ? "print-btn" : ""}
        >
          Pre-Order
        </button>
      </div>

      <form className="sales-list" onSubmit={handleSubmit}>
        <div className="sale-item">
          <div className="sale-main">
            <label>{mode === "expense" ? "Expense" : "Item"}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                mode === "expense"
                  ? "e.g. Transportation, Supplies"
                  : "e.g. iPhone 13, iPad Air"
              }
              required
            />
          </div>
        </div>

        <div className="sale-item">
          <div className="sale-main">
            <label>
              {mode === "expense" ? "Amount" : "Payment"}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
        </div>

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

        <div className="sale-total">
          <button className="print-btn" type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : mode === "expense"
              ? "Add Expense"
              : "Add Pre-Order"}
          </button>
        </div>

        {message && <p className="tag badge-cash">{message}</p>}
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}