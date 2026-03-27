import React, { useState, useEffect } from "react";
import { addUnit } from "../../../api/inventoryAPI";
import { getColors, getProducts } from "../../../api/unitsAPI";
import "./Units.css";

function Units() {
  const [formData, setFormData] = useState({
    product_id: "",
    color_id: "",
    quantity: "",
    item_condition: "BRAND_NEW"
  });

  const [products, setProducts] = useState([]);
  const [colors, setColors] = useState([]);

  const [modal, setModal] = useState({
    show: false,
    type: "",
    text: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const productData = await getProducts();
      const colorData = await getColors();

      setProducts(productData);
      setColors(colorData);
    } catch (error) {
      console.error("Error fetching dropdown data", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await addUnit(formData);

      setModal({
        show: true,
        type: "success",
        text: data.message || "Unit added successfully!"
      });

      setFormData({
        product_id: "",
        color_id: "",
        quantity: "",
        item_condition: "BRAND_NEW"
      });

      setTimeout(() => {
        setModal((prev) => ({ ...prev, show: false }));
      }, 2000);

    } catch (error) {
      console.error(error);

      setModal({
        show: true,
        type: "error",
        text: "Failed to add unit. Please try again."
      });
    }
  };

  return (
    <div className="add-unit-container">
      <h2 className="add-unit-title">Add Inventory Unit</h2>

      <form className="add-unit-form" onSubmit={handleSubmit}>
        <label>Product</label>
        <select
          name="product_id"
          value={formData.product_id}
          onChange={handleChange}
          required
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.product_id} value={p.product_id}>
              {p.name} - {p.model} ({p.storage})
            </option>
          ))}
        </select>

        <label>Color</label>
        <select
          name="color_id"
          value={formData.color_id}
          onChange={handleChange}
          required
        >
          <option value="">Select Color</option>
          {colors.map((c) => (
            <option key={c.color_id} value={c.color_id}>
              {c.color_name}
            </option>
          ))}
        </select>

        <label>Quantity</label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
        />

        <label>Condition</label>
        <select
          name="item_condition"
          value={formData.item_condition}
          onChange={handleChange}
          required
        >
          <option value="BRAND_NEW">BRAND NEW</option>
          <option value="PREOWNED">PRE-OWNED</option>
        </select>

        <button type="submit">Add Unit</button>
      </form>

      {modal.show && (
        <div className="modal-overlay">
          <div className={`modal-box ${modal.type}`}>
            <h3>{modal.type === "success" ? "Success" : "Error"}</h3>
            <p>{modal.text}</p>
            <button onClick={() => setModal({ ...modal, show: false })}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Units;