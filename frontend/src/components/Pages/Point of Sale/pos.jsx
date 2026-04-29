import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./pos.css";

const groupUnitsByColor = (units = []) => {
  const map = {};
  for (const unit of units) {
    if (map[unit.color]) {
      map[unit.color] = {
        ...map[unit.color],
        quantity: Number(map[unit.color].quantity) + Number(unit.quantity),
      };
    } else {
      map[unit.color] = { ...unit, quantity: Number(unit.quantity) };
    }
  }
  return Object.values(map);
};

export default function Pos() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("BRAND NEW");

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://192.168.254.196:5000/api/inventory/all")
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
    let filtered = products;

    if (category) {
      filtered = filtered
        .map((product) => {
          // Group units by color, summing quantities for duplicates
          const groupedUnits = groupUnitsByColor(
            product.units?.filter((unit) => unit.item_condition === category)
          );

          return {
            ...product,
            units: groupedUnits,
            total: groupedUnits.reduce(
              (sum, unit) => sum + Number(unit.quantity),
              0
            ),
          };
        })
        .filter((product) => product.units && product.units.length > 0);
    }

    if (searchTerm !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.model.toLowerCase().includes(term) ||
          product.storage.toLowerCase().includes(term)
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, products, category]);

  const openPOS = (product, unit) => {
    navigate(`/dashboard/cashier/${product.product_id}/${unit.color}`, {
      state: { product, unit },
    });
  };

  return (
    <div className="product-grid-page">
      <h1 className="grid-title">Select Unit for POS</h1>

      <div className="category-buttons">
        <button
          className={category === "PREOWNED" ? "active" : ""}
          onClick={() => setCategory("PREOWNED")}
        >
          Preowned
        </button>
        <button
          className={category === "BRAND NEW" ? "active" : ""}
          onClick={() => setCategory("BRAND NEW")}
        >
          Brand New
        </button>
        <button
          className={category === "ANDROID" ? "active" : ""}
          onClick={() => setCategory("ANDROID")}
        >
          Android
        </button>
                <button
          className={category === "PARTS" ? "active" : ""}
          onClick={() => setCategory("PARTS")}
        >
          PARTS
        </button>
      </div>

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
                src={`http://192.168.254.196:5000/uploads/products/${product.image}`}
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