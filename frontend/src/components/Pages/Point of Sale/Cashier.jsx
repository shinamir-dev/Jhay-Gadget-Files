import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Cashier.css";

export default function Cashier() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { product, unit } = state || {};

  const [quantity, setQuantity] = useState(1);
  const [payment, setPayment] = useState("");
  const [success, setSuccess] = useState(false);

  if (!product || !unit) {
    return <div>No product selected.</div>;
  }

  const price = product.price || 0;
  const total = price * quantity;
  const change = payment ? payment - total : 0;

  const handleCheckout = () => {
    if (payment < total) {
      alert("Insufficient payment!");
      return;
    }

    // 👉 You can POST this to backend later
    console.log("Transaction:", {
      product_id: product.product_id,
      color: unit.color,
      quantity,
      total,
      payment,
      change,
    });

    setSuccess(true);
  };

  return (
    <div className="pos-container">
      <h1>POS Transaction</h1>

      <div className="pos-card">
        <img src={`http://192.168.1.252:5000/uploads/products/${product.image}`} alt={product.name} />

        <div className="pos-details">
          <h2>{product.name}</h2>
          <p>Model: {product.model}</p>
          <p>Storage: {product.storage}</p>
          <p>Color: {unit.color}</p>

          <p>Price: ₱{price}</p>

          <div className="pos-inputs">
            <label>Quantity:</label>
            <input
              type="number"
              min="1"
              max={unit.quantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />

            <label>Payment:</label>
            <input
              type="number"
              value={payment}
              onChange={(e) => setPayment(Number(e.target.value))}
            />
          </div>

          <div className="pos-summary">
            <p>Total: ₱{total}</p>
            <p>Change: ₱{change >= 0 ? change : 0}</p>
          </div>

          {!success ? (
            <button className="checkout-btn" onClick={handleCheckout}>
              Checkout
            </button>
          ) : (
            <div className="success-msg">
              ✅ Transaction Complete!
            </div>
          )}

          <button className="back-btn" onClick={() => navigate(-1)}>
            ⬅ Back
          </button>
        </div>
      </div>
    </div>
  );
}