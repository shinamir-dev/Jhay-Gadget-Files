import React, { useState, useEffect } from "react";
import { addUnit } from "../../../api/inventoryAPI";
import {
  getColors,
  getProducts,
  createProduct,
  createColor,
} from "../../../api/unitsAPI";
import { createPaymentMethod, getPaymentModes } from "../../../api/paymentAPI";
import "./Units.css";

function Units() {
  const [formData, setFormData] = useState({
    product_id: "",
    color_id: "",
    quantity: "",
    item_condition: "BRAND_NEW",
    mop_id: ""
  });

  // ✅ PRODUCT WITH IMAGE
  const [productForm, setProductForm] = useState({
    name: "",
    model: "",
    storage: "",
    image: null
  });

  const [colorForm, setColorForm] = useState({
    color_name: ""
  });

  const [paymentForm, setPaymentForm] = useState({
    mode_name: ""
  });

  const [products, setProducts] = useState([]);
  const [colors, setColors] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);

  const [modal, setModal] = useState({
    show: false,
    type: "",
    text: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const productData = await getProducts();
    const colorData = await getColors();
    const paymentData = await getPaymentModes();

    setProducts(productData);
    setColors(colorData);
    setPaymentModes(paymentData);
  };

  // ===== HANDLERS =====
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ HANDLE FILE
  const handleProductChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setProductForm({ ...productForm, image: files[0] });
    } else {
      setProductForm({ ...productForm, [name]: value });
    }
  };

  const handleColorChange = (e) => {
    setColorForm({ ...colorForm, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value });
  };

  // ===== SUBMIT UNIT =====
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
        item_condition: "BRAND_NEW",
        mop_id: ""
      });

    } catch {
      setModal({ show: true, type: "error", text: "Failed to add unit." });
    }
  };

  // ✅ CREATE PRODUCT WITH IMAGE
  const handleCreateProduct = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", productForm.name);
      formData.append("model", productForm.model);
      formData.append("storage", productForm.storage);
      formData.append("image", productForm.image);

      await createProduct(formData);

      setProductForm({
        name: "",
        model: "",
        storage: "",
        image: null
      });

      fetchData();

      setModal({
        show: true,
        type: "success",
        text: "Product created with image!"
      });

    } catch {
      setModal({
        show: true,
        type: "error",
        text: "Failed to create product"
      });
    }
  };

  const handleCreateColor = async (e) => {
    e.preventDefault();
    await createColor(colorForm);
    setColorForm({ color_name: "" });
    fetchData();
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();

    try {
      const res = await createPaymentMethod(paymentForm);

      setModal({
        show: true,
        type: "success",
        text: res.message
      });

      setPaymentForm({ mode_name: "" });
      fetchData();
    } catch {
      setModal({
        show: true,
        type: "error",
        text: "Failed to create payment mode"
      });
    }
  };

  return (
    <div className="add-unit-container">
      <h2 className="add-unit-title">Inventory Management</h2>

      <div className="forms-grid">

        {/* ===== ADD PRODUCT ===== */}
        <div className="add-unit-form">
          <h3>Add Product</h3>
          <form onSubmit={handleCreateProduct} encType="multipart/form-data">
            <input name="name" placeholder="Product Name" value={productForm.name} onChange={handleProductChange} required />
            <input name="model" placeholder="Model" value={productForm.model} onChange={handleProductChange} required />
            <input name="storage" placeholder="Storage" value={productForm.storage} onChange={handleProductChange} required />

            {/* ✅ IMAGE INPUT */}
            <input type="file" name="image" accept="image/*" onChange={handleProductChange} required />

            {/* ✅ PREVIEW */}
            {productForm.image && (
              <img
                src={URL.createObjectURL(productForm.image)}
                alt="preview"
                className="image-preview"
              />
            )}

            <button type="submit">Add Product</button>
          </form>
        </div>

        {/* ===== ADD COLOR ===== */}
        <div className="add-unit-form">
          <h3>Add Color</h3>
          <form onSubmit={handleCreateColor}>
            <input name="color_name" placeholder="Color Name" value={colorForm.color_name} onChange={handleColorChange} required />
            <button type="submit">Add Color</button>
          </form>
        </div>

        {/* ===== ADD PAYMENT ===== */}
        <div className="add-unit-form">
          <h3>Add Payment Mode</h3>
          <form onSubmit={handleCreatePayment}>
            <input name="mode_name" placeholder="GCash, Cash, etc." value={paymentForm.mode_name} onChange={handlePaymentChange} required />
            <button type="submit">Add Payment Mode</button>
          </form>
        </div>

        {/* ===== ADD UNIT ===== */}
        <div className="add-unit-form">
          <h3>Add Inventory Unit</h3>
          <form onSubmit={handleSubmit}>

            <select name="product_id" value={formData.product_id} onChange={handleChange} required>
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.product_id} value={p.product_id}>
                  {p.name} - {p.model}
                </option>
              ))}
            </select>

            <select name="color_id" value={formData.color_id} onChange={handleChange} required>
              <option value="">Select Color</option>
              {colors.map((c) => (
                <option key={c.color_id} value={c.color_id}>
                  {c.color_name}
                </option>
              ))}
            </select>

            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />

            <select name="item_condition" value={formData.item_condition} onChange={handleChange}>
              <option value="BRAND_NEW">BRAND NEW</option>
              <option value="PREOWNED">PRE-OWNED</option>
            </select>

            <button type="submit">Add Unit</button>
          </form>
        </div>

      </div>

      {/* MODAL */}
      {modal.show && (
        <div className="modal-overlay">
          <div className={`modal-box ${modal.type}`}>
            <h3>{modal.type}</h3>
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