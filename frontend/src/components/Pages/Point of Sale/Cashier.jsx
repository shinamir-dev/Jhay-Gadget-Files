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
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔥 Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedUpgrade, setSelectedUpgrade] = useState("");

  const [payments, setPayments] = useState([
    { mop_id: "", amount: "" }
  ]);

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
    } catch (err) {
      console.error(err);
    }
  };

  const addPaymentField = () => {
    setPayments([...payments, { mop_id: "", amount: "" }]);
  };

  const removePaymentField = (index) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const updatePaymentField = (index, field, value) => {
    const updated = [...payments];
    updated[index][field] = value;
    setPayments(updated);
  };

  if (!product || !unit) return <div>No product selected.</div>;
  if (!data) return <div>Loading...</div>;

  const total = Number(data.price) * Number(quantity);

  const totalEntered = payments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const change = totalEntered > total ? totalEntered - total : 0;

  const handleCheckout = async () => {
    if (quantity <= 0 || quantity > data.quantity) {
      alert("Invalid quantity or exceeds stock!");
      return;
    }

    if (totalEntered <= 0) {
      alert("Enter at least one payment!");
      return;
    }

    if (totalEntered < total) {
      alert("Payment is less than total!");
      return;
    }

    let paymentData = [];

    for (let pay of payments) {
      if (!pay.mop_id || Number(pay.amount) <= 0) continue;

      paymentData.push({
        mop_id: pay.mop_id,
        amount: Number(pay.amount),
        finance: null,
      });
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
          upgrade: selectedUpgrade || null, // 🔥 send upgrade
          payments: paymentData,
        }
      );

      alert(response.data.message);
      setSuccess(true);

      fetchUnitDetails();
      setQuantity(1);
      setPayments([{ mop_id: "", amount: "" }]);
      setSelectedUpgrade("");

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

          {/* ✅ Show selected upgrade */}
          {selectedUpgrade && (
            <p style={{ color: "#facc15" }}>
              Upgrade: {selectedUpgrade}
            </p>
          )}

          <div className="pos-inputs">
            <label>Quantity:</label>

            <div className="qty-control">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>

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

              <button onClick={() =>
                setQuantity((q) => Math.min(data.quantity, q + 1))
              }>+</button>
            </div>

            {/* 🔘 Upgrade Button */}
            <button
              className="upgrade-btn"
              onClick={() => setShowUpgradeModal(true)}
            >
              ⬆ Upgrade
            </button>

            {/* Payments */}
            <div className="additional-payments">
              <label>Payments:</label>

              {payments.map((pay, index) => (
                <div key={index} className="payment-row">
                  <select
                    value={pay.mop_id}
                    onChange={(e) =>
                      updatePaymentField(index, "mop_id", Number(e.target.value))
                    }
                  >
                    <option value="">Select Method</option>
                    {paymentMethods.map((method) => (
                      <option key={method.mop_id} value={method.mop_id}>
                        {method.payment_method}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Amount"
                    value={pay.amount}
                    onChange={(e) =>
                      updatePaymentField(index, "amount", e.target.value)
                    }
                  />

                  {payments.length > 1 && (
                    <button onClick={() => removePaymentField(index)}>❌</button>
                  )}
                </div>
              ))}

              <button onClick={addPaymentField}>➕ Add Payment</button>
            </div>

            {/* Summary */}
            <div className="pos-summary">
              <p>Total: ₱{total}</p>
              <p>Total Paid: ₱{totalEntered}</p>
              {change > 0 && <p>Change: ₱{change}</p>}
            </div>
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

      {/* 🪟 UPGRADE MODAL */}
      {showUpgradeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Upgrade Product</h2>

            <select
              value={selectedUpgrade}
              onChange={(e) => setSelectedUpgrade(e.target.value)}
            >
              <option value="">Select Upgrade</option>
              <option value="Premium">Premium</option>
              <option value="Pro">Pro</option>
            </select>

            <div className="modal-actions">
              <button
                className="confirm-btn"
                onClick={() => setShowUpgradeModal(false)}
              >
                Confirm
              </button>

              <button
                className="cancel-btn"
                onClick={() => setShowUpgradeModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}