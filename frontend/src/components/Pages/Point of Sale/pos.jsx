import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./pos.css";

export default function Pos() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://192.168.1.189:5000/api/inventory/all")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  const openPOS = (product, unit) => {
    navigate(`/pos/${product.product_id}/${unit.color}`, {
      state: {
        product: product,
        unit: unit,
      },
    });
  };

  return (
    <div className="product-grid-page">
      <h1 className="grid-title">Select Unit for POS</h1>

      {loading ? (
        <div className="loading-text">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="loading-text">No products available.</div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.product_id} className="product-card">
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />

              <div className="product-info">
                <h3>{product.name}</h3>
                <p>{product.model}</p>
                <p>{product.storage}</p>
                <span>Qty: {product.total}</span>

                {/* Unit Selection */}
                {product.units?.length > 0 && (
                  <div className="product-variants">
                    {product.units.map((unit, idx) => (
                      <button
                        key={idx}
                        className="unit-btn"
                        onClick={() => openPOS(product, unit)}
                      >
                        {unit.color} ({unit.quantity})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}