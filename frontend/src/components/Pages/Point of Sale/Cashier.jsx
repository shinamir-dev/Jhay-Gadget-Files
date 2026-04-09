import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "./Cashier.css";

export default function Cashier() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { product, unit } = state || {};

  const [data, setData] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [payment, setPayment] = useState(""); // For Cash-only
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [mopId, setMopId] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Split payments when method is not Cash
  const [payments, setPayments] = useState({ cash: "", finance: "" });

  useEffect(() => {
    if (product && unit) {
      fetchUnitDetails();
    }
    fetchPaymentMethods();
  }, [product, unit]);

  const fetchUnitDetails = async () => {
    try {
      const res = await axios.get(
        "http://192.168.1.252:5000/api/payment/sale/get",
        {
          params: {
            product_id: product.product_id,
            color_name: unit.color,
          },
        }
      );
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load product details.");
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const res = await axios.get("http://192.168.1.252:5000/api/payment/get");
      setPaymentMethods(res.data);
      if (res.data.length > 0) setMopId(res.data[0].mop_id);
    } catch (err) {
      console.error(err);
    }
  };

  if (!product || !unit) return <div>No product selected.</div>;
  if (!data) return <div>Loading...</div>;

  const total = Number(data.price) * Number(quantity);

  const handleCheckout = async () => {
    if (quantity <= 0 || quantity > data.quantity) {
      alert("Invalid quantity or exceeds stock!");
      return;
    }

    let paymentData = [];
    const selectedMop = paymentMethods.find((m) => m.mop_id === mopId);
    if (!selectedMop) return alert("Please select a payment method!");

    if (selectedMop.payment_method === "Cash") {
      if (!payment || Number(payment) <= 0) return alert("Enter valid payment!");
      paymentData.push({
        mop_id: mopId,
        amount: Number(payment),
        finance: null,
      });
    } else {
      const cashAmount = Number(payments.cash || 0);
      const financeAmount = Number(payments.finance || 0);

      if (cashAmount + financeAmount <= 0)
        return alert("Enter cash or finance amount!");

      if (cashAmount > 0) {
        const cashMop = paymentMethods.find((m) => m.payment_method === "Cash");
        if (cashMop) {
          paymentData.push({
            mop_id: cashMop.mop_id,
            amount: cashAmount,
            finance: null,
          });
        }
      }

      if (financeAmount > 0) {
        paymentData.push({
          mop_id: mopId,
          amount: 0,
          finance: financeAmount,
        });
      }
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "http://192.168.1.252:5000/api/payment/sale/checkout",
        {
          product_id: data.product_id,
          color_id: data.color_id,
          quantity,
          total,
          payments: paymentData,
        }
      );

      alert(response.data.message);
      setSuccess(true);
      fetchUnitDetails();
      setQuantity(1);
      setPayment("");
      setPayments({ cash: "", finance: "" });
    } catch (err) {
      console.error(err);
      alert("Checkout failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pos-container">
      <h1>POS Transaction</h1>

      <div className="pos-card">
        <img
          src={`http://192.168.1.252:5000/uploads/products/${data.image}`}
          alt={data.name}
        />

        <div className="pos-details">
          <h2>{data.name}</h2>
          <p>Model: {data.model}</p>
          <p>Storage: {data.storage}</p>
          <p>Color: {data.color_name}</p>

          <p>Available Stock: {data.quantity}</p>
          <p>Price: ₱{Number(data.price) || 0}</p>

          <div className="pos-inputs">
            <label>Quantity:</label>
            <div className="qty-control">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>

              <input
                type="number"
                value={quantity}
                min="1"
                max={data.quantity}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value < 1) setQuantity(1);
                  else if (value > data.quantity) setQuantity(data.quantity);
                  else setQuantity(value);
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setQuantity((q) => Math.min(data.quantity, q + 1))
                }
              >
                +
              </button>
            </div>

            {/* Payment inputs */}
            {paymentMethods.find((m) => m.mop_id === mopId)?.payment_method ===
            "Cash" ? (
              <>
                <label>Payment Amount:</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Enter payment amount"
                  value={payment}
                  onChange={(e) => setPayment(e.target.value)}
                />
              </>
            ) : (
              <div className="additional-payments">
                <label>Cash Payment:</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Enter cash amount"
                  value={payments.cash}
                  onChange={(e) =>
                    setPayments((prev) => ({ ...prev, cash: e.target.value }))
                  }
                />

                <label>Finance Payment:</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Enter finance amount"
                  value={payments.finance}
                  onChange={(e) =>
                    setPayments((prev) => ({ ...prev, finance: e.target.value }))
                  }
                />
              </div>
            )}

            <label>Payment Method:</label>
            <select value={mopId} onChange={(e) => setMopId(Number(e.target.value))}>
              {paymentMethods.map((method) => (
                <option key={method.mop_id} value={method.mop_id}>
                  {method.payment_method}
                </option>
              ))}
            </select>
          </div>

          <div className="pos-summary">
            <p>Total: ₱{total}</p>
          </div>

          {!success ? (
            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? "Processing..." : "Checkout"}
            </button>
          ) : (
            <div className="success-msg">✅ Transaction Complete!</div>
          )}

          <button className="back-btn" onClick={() => navigate(-1)}>
            ⬅ Back
          </button>
        </div>
      </div>
    </div>
  );
}