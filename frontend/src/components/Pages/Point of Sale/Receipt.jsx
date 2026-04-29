import { useRef } from "react";
import "./Receipt.css";

export default function Receipt({ data, quantity, total, payments, onClose }) {
  const receiptRef = useRef(null);

  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-PH", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = now.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const change = totalPaid > total ? totalPaid - total : 0;

  const vatRate = 0.12;
  const vatableAmount = total / (1 + vatRate);
  const vatAmount = total - vatableAmount;

  const fmt = (num) =>
    Number(num).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const getPaymentMethodName = (pay) =>
    pay.method_name || pay.payment_method || "Payment";

  const invoiceNum = `1101/${String(Date.now()).slice(-7)}`;
  const transNum = `1/${String(Date.now()).slice(-7)}`;

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=1000,height=700");
    win.document.write(`
      <html>
        <head>
          <title>Sales Invoice</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Special+Elite&display=swap');

            @page {
              size: A4 landscape;
              margin: 8mm 12mm;
            }

            * { margin: 0; padding: 0; box-sizing: border-box; }

            body {
              background: #fff;
              font-family: 'Share Tech Mono', 'Courier New', monospace;
              font-size: 9px;
              color: #1a1a1a;
            }

            .landscape-receipt {
              width: 100%;
              display: grid;
              grid-template-columns: 1fr 1fr;
              border: 1px solid #bbb;
            }

            .col-left {
              padding: 10px 14px;
              border-right: 1px dashed #999;
              display: flex;
              flex-direction: column;
            }

            .col-right {
              padding: 10px 14px;
              display: flex;
              flex-direction: column;
            }

            .shop-name {
              text-align: center;
              font-family: 'Special Elite', monospace;
              font-size: 12px;
              font-weight: bold;
              letter-spacing: 1px;
              line-height: 1.5;
              margin-bottom: 2px;
            }

            .shop-sub {
              text-align: center;
              font-size: 7.5px;
              color: #444;
              line-height: 1.4;
              margin-bottom: 2px;
            }

            .invoice-title {
              text-align: center;
              font-family: 'Special Elite', monospace;
              font-size: 13px;
              font-weight: bold;
              letter-spacing: 2px;
              margin: 6px 0 1px;
            }

            .invoice-num {
              text-align: center;
              font-size: 11px;
              font-weight: bold;
              margin-bottom: 5px;
            }

            hr.dashed { border: none; border-top: 1px dashed #888; margin: 4px 0; }
            hr.solid  { border: none; border-top: 1px solid #555;  margin: 4px 0; }

            .info-row {
              display: flex;
              justify-content: space-between;
              font-size: 8.5px;
              margin: 1px 0;
              gap: 6px;
            }

            .info-label { color: #555; min-width: 55px; flex-shrink: 0; }
            .info-value { text-align: right; flex: 1; }

            .items-header {
              display: grid;
              grid-template-columns: 28px 1fr 70px;
              font-size: 8.5px;
              font-weight: bold;
              border-bottom: 1px solid #555;
              padding-bottom: 3px;
              margin-bottom: 3px;
            }

            .item-row {
              display: grid;
              grid-template-columns: 28px 1fr 70px;
              font-size: 8.5px;
              margin: 3px 0;
              align-items: start;
            }

            .item-desc { font-size: 8px; color: #222; line-height: 1.45; }
            .item-amount { text-align: right; }

            .total-row {
              display: flex;
              justify-content: space-between;
              font-size: 8.5px;
              margin: 1px 0;
            }

            .total-row.bold { font-weight: bold; font-size: 9.5px; margin: 2px 0; }

            .payments-header {
              text-align: center;
              font-size: 8.5px;
              margin: 4px 0 2px;
              letter-spacing: 1px;
            }

            .payment-row {
              display: flex;
              justify-content: space-between;
              font-size: 8.5px;
              margin: 1px 0;
            }

            .footer-text {
              font-size: 7.5px;
              color: #444;
              margin-top: 8px;
              line-height: 1.55;
            }

            .sig-row {
              display: flex;
              justify-content: space-between;
              margin-top: 20px;
            }

            .sig-block { text-align: center; flex: 1; }

            .sig-line {
              border-top: 1px solid #555;
              margin: 0 8px;
              padding-top: 3px;
              font-size: 7.5px;
              color: #444;
            }

            .page-info {
              text-align: center;
              font-size: 7.5px;
              color: #555;
              margin-top: 8px;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
          <div class="landscape-receipt">
            <!-- LEFT: items, totals, payments, footer -->
            <div class="col-left">
              <div class="items-header">
                <span>QTY</span>
                <span>BARCODE / DESCRIPTION</span>
                <span style="text-align:right;">AMOUNT</span>
              </div>

              <div class="item-row">
                <span>${quantity}</span>
                <span class="item-desc">
                  ${data.name}<br/>
                  ${data.model}${data.storage ? ` &bull; ${data.storage}` : ""}<br/>
                  ${data.color_name}<br/>
                  @&#8369;${fmt(data.price)}
                </span>
                <span class="item-amount">&#8369;${fmt(total)}</span>
              </div>

              <hr class="dashed"/>
              <div class="info-row"><span>Total Package Quantity: ${quantity}</span></div>
              <div class="info-row"><span>Total Piece Quantity: ${quantity}</span></div>
              <hr class="dashed"/>

              <div class="total-row"><span>Vatable Sales:</span><span>&#8369;${fmt(vatableAmount)}</span></div>
              <div class="total-row"><span>Vat-Exempt Sales:</span><span>&#8369;0.00</span></div>
              <div class="total-row"><span>Zero-Rated Sales:</span><span>&#8369;0.00</span></div>
              <div class="total-row"><span>12% VAT:</span><span>&#8369;${fmt(vatAmount)}</span></div>
              <hr class="dashed"/>

              <div class="payments-header">------PAYMENTS------</div>
              ${payments
                .filter((p) => Number(p.amount) > 0)
                .map(
                  (pay) => `
                <div class="payment-row">
                  <span>${getPaymentMethodName(pay)}</span>
                  <span>&#8369;${fmt(pay.amount)}</span>
                </div>`
                )
                .join("")}
              <hr class="dashed"/>

              <div class="total-row bold"><span>AMOUNT DUE:</span><span>&#8369;${fmt(total)}</span></div>
              <div class="total-row bold"><span>CHANGE DUE:</span><span>&#8369;${fmt(change)}</span></div>
              <hr class="solid"/>

              <div class="footer-text">
                PTU DATE ISSUED: 12/19/2024<br/>
                POS Supplier: DIGIFOS INFORMATION TECHNOLOGY SERVICES 1549 PUGOSO COR TOMAS MAPUA STS,
                BARANGAY 335 ZONE 33 SANTA CRUZ NCR, CITY OF MANILA, FIRST DISTRICT<br/>
                SUPPLIER VAT REG TIN: 606-516-120-00000 ACC DATE ISSUED: 09/25/2024 ACC VALID UNTIL: 09/24/2029<br/><br/>
                THIS SERVES AS A SALES INVOICE.<br/>
                THIS INVOICE IN CASE OF EXCHANGE OF MERCHANDISE WITHIN 2 DAYS
              </div>

              <div class="sig-row">
                <div class="sig-block">
                  <div style="height:26px;"></div>
                  <div class="sig-line">Cashier/Authorized Representative</div>
                </div>
                <div class="sig-block">
                  <div style="height:26px;"></div>
                  <div class="sig-line">Received by: Customer</div>
                </div>
              </div>

              <div class="page-info">
                page 1 of 1 &nbsp;|&nbsp; Issued By: &nbsp;|&nbsp;
                Printed: ${formattedDate} ${formattedTime}
              </div>
            </div>

            <!-- RIGHT: shop header, invoice num, customer info -->
            <div class="col-right">
              <div class="shop-name">SMARTNOTE COMPUTER SYSTEM INC.</div>
              <div class="shop-sub">Owned or Operated By: SMARTNOTE COMPUTER SYSTEM INC.</div>
              <div class="shop-sub">
                MICON BLDG, LA PURISIMA STREET BARANGAY ZONE III,
                CITY OF ZAMBOANGA ZAMBOANGA DEL SUR
              </div>
              <div class="shop-sub">
                PTU NO: FP122024-93A-049111-000000 | ACC NO: 031606516120202409211
              </div>
              <div class="shop-sub">VAT REG TIN: 010-784-498-00000</div>
              <div class="shop-sub">
                MIN: 241217140747240321 / SERIAL NO: DEP1121720247P271101
              </div>

              <hr class="solid"/>
              <div class="invoice-title">SALES INVOICE</div>
              <div class="invoice-num">${invoiceNum}</div>
              <hr class="dashed"/>

              <div class="info-row"><span class="info-label">Date</span><span class="info-value">${formattedDate} ${formattedTime}</span></div>
              <div class="info-row"><span class="info-label">Trans #</span><span class="info-value">${transNum}</span></div>
              <div class="info-row"><span class="info-label">Terminal</span><span class="info-value">1</span></div>
              <div class="info-row"><span class="info-label">Terms</span><span class="info-value">DET</span></div>
              <div class="info-row"><span class="info-label">Salesman</span><span class="info-value">&#8212;</span></div>
              <div class="info-row"><span class="info-label">Cashier</span><span class="info-value">&#8212;</span></div>
              <hr class="dashed"/>

              <div class="info-row"><span class="info-label">Sold To</span><span class="info-value">WALK-IN CUSTOMER</span></div>
              <div class="info-row"><span class="info-label">Address</span><span class="info-value">&#8212;</span></div>
              <div class="info-row"><span class="info-label">TIN</span><span class="info-value">&#8212;</span></div>
              <div class="info-row"><span class="info-label">Tel #</span><span class="info-value">&#8212;</span></div>
            </div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div className="receipt-overlay">
      <div className="receipt-modal landscape-modal">
        <div className="receipt-actions">
          <button className="print-action-btn" onClick={handlePrint}>
            🖨 Print Receipt (Landscape)
          </button>
          <button className="close-action-btn" onClick={onClose}>
            ✕ Close
          </button>
        </div>

        {/* Screen preview — two-column landscape */}
        <div className="receipt-landscape-preview" ref={receiptRef}>

          {/* LEFT COLUMN */}
          <div className="col-left">
            <div className="items-header">
              <span>QTY</span>
              <span>BARCODE / DESCRIPTION</span>
              <span style={{ textAlign: "right" }}>AMOUNT</span>
            </div>

            <div className="item-row">
              <span>{quantity}</span>
              <span className="item-desc">
                {data.name}<br />
                {data.model}{data.storage ? ` • ${data.storage}` : ""}<br />
                {data.color_name}<br />
                @₱{fmt(data.price)}
              </span>
              <span className="item-amount">₱{fmt(total)}</span>
            </div>

            <hr className="divider" />
            <div className="info-row"><span>Total Package Quantity: {quantity}</span></div>
            <div className="info-row"><span>Total Piece Quantity: {quantity}</span></div>
            <hr className="divider" />

            <div className="total-row"><span>Vatable Sales:</span><span>₱{fmt(vatableAmount)}</span></div>
            <div className="total-row"><span>Vat-Exempt Sales:</span><span>₱0.00</span></div>
            <div className="total-row"><span>Zero-Rated Sales:</span><span>₱0.00</span></div>
            <div className="total-row"><span>12% VAT:</span><span>₱{fmt(vatAmount)}</span></div>

            <hr className="divider" />

            <div className="payments-header">------PAYMENTS------</div>
            {payments
              .filter((p) => Number(p.amount) > 0)
              .map((pay, i) => (
                <div className="payment-row" key={i}>
                  <span>{getPaymentMethodName(pay)}</span>
                  <span>₱{fmt(pay.amount)}</span>
                </div>
              ))}

            <hr className="divider" />

            <div className="total-row bold"><span>AMOUNT DUE:</span><span>₱{fmt(total)}</span></div>
            <div className="total-row bold"><span>CHANGE DUE:</span><span>₱{fmt(change)}</span></div>

            <hr className="divider-solid" />

            <div className="footer-text">
              PTU DATE ISSUED: 12/19/2024<br />
              POS Supplier: DIGIFOS INFORMATION TECHNOLOGY SERVICES 1549 PUGOSO COR TOMAS MAPUA STS,
              BARANGAY 335 ZONE 33 SANTA CRUZ NCR, CITY OF MANILA, FIRST DISTRICT<br />
              SUPPLIER VAT REG TIN: 606-516-120-00000 ACC DATE ISSUED: 09/25/2024 ACC VALID UNTIL: 09/24/2029<br /><br />
              THIS SERVES AS A SALES INVOICE.<br />
              THIS INVOICE IN CASE OF EXCHANGE OF MERCHANDISE WITHIN 2 DAYS
            </div>

            <div className="sig-row">
              <div className="sig-block">
                <div style={{ height: 26 }} />
                <div className="sig-line">Cashier/Authorized Representative</div>
              </div>
              <div className="sig-block">
                <div style={{ height: 26 }} />
                <div className="sig-line">Received by: Customer</div>
              </div>
            </div>

            <div className="page-info">
              page 1 of 1 &nbsp;|&nbsp; Issued By: &nbsp;|&nbsp;
              Printed: {formattedDate} {formattedTime}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-right">
            <div className="shop-name">SMARTNOTE COMPUTER SYSTEM INC.</div>
            <div className="shop-sub">Owned or Operated By: SMARTNOTE COMPUTER SYSTEM INC.</div>
            <div className="shop-sub">
              MICON BLDG, LA PURISIMA STREET BARANGAY ZONE III,
              CITY OF ZAMBOANGA ZAMBOANGA DEL SUR
            </div>
            <div className="shop-sub">
              PTU NO: FP122024-93A-049111-000000 | ACC NO: 031606516120202409211
            </div>
            <div className="shop-sub">VAT REG TIN: 010-784-498-00000</div>
            <div className="shop-sub">
              MIN: 241217140747240321 / SERIAL NO: DEP1121720247P271101
            </div>

            <hr className="divider-solid" />
            <div className="invoice-title">SALES INVOICE</div>
            <div className="invoice-num">{invoiceNum}</div>
            <hr className="divider" />

            <div className="info-row">
              <span className="info-label">Date</span>
              <span className="info-value">{formattedDate} {formattedTime}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Trans #</span>
              <span className="info-value">{transNum}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Terminal</span>
              <span className="info-value">1</span>
            </div>
            <div className="info-row">
              <span className="info-label">Terms</span>
              <span className="info-value">DET</span>
            </div>
            <div className="info-row">
              <span className="info-label">Salesman</span>
              <span className="info-value">—</span>
            </div>
            <div className="info-row">
              <span className="info-label">Cashier</span>
              <span className="info-value">—</span>
            </div>

            <hr className="divider" />

            <div className="info-row">
              <span className="info-label">Sold To</span>
              <span className="info-value">WALK-IN CUSTOMER</span>
            </div>
            <div className="info-row">
              <span className="info-label">Address</span>
              <span className="info-value">—</span>
            </div>
            <div className="info-row">
              <span className="info-label">TIN</span>
              <span className="info-value">—</span>
            </div>
            <div className="info-row">
              <span className="info-label">Tel #</span>
              <span className="info-value">—</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}