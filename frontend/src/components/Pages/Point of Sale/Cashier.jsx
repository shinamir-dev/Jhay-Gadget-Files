import { useLocation, useParams } from "react-router-dom";

export default function Cashier() {
  const location = useLocation();
  const { productId, color } = useParams();

  const product = location.state?.product;
  const unit = location.state?.unit;

  return (
    <div style={{ padding: "40px" }}>
      <h1>Point of Sale</h1>

      <h2>{product?.name}</h2>
      <p>Model: {product?.model}</p>
      <p>Storage: {product?.storage}</p>

      <h3>Selected Unit</h3>
      <p>Color: {unit?.color}</p>
      <p>Available Stock: {unit?.quantity}</p>
    </div>
  );
}