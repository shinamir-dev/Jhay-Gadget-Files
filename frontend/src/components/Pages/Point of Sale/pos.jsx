import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./pos.css";

export default function Pos() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // <-- new state
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://192.168.1.252:5000/api/inventory/all")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredProducts(products);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = products.filter((product) => 
        product.name.toLowerCase().includes(term) ||       // exact sequence
        product.model.toLowerCase().includes(term) ||
        product.storage.toLowerCase().includes(term)
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const openPOS = (product, unit) => {
    navigate(`/dashboard/cashier/${product.product_id}/${unit.color}`, {
      state: { product, unit },
    });
  };

  return (
    <div className="product-grid-page">
      <h1 className="grid-title">Select Unit for POS</h1>

      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
      </div>

      {loading ? (
        <div className="loading-text">Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="loading-text">No products found.</div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div key={product.product_id} className="product-card">
              <img
                src={`http://192.168.1.252:5000/uploads/products/${product.image}`}
                alt={product.name}
                className="product-image"
              />

              <div className="product-info">
                <h3>{product.name}</h3>
                <p>{product.model}</p>
                <p>{product.storage}</p>
                <span>Qty: {product.total}</span>

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