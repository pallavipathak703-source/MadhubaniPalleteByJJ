import { memo, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import { useCart } from "../context/CartContext";
import { API_URL } from "../config/api";

const SHIPPING_CHARGE = 100;
const UPI_ID = "sjha63004@okhdfcbank";
const UPI_NAME = "shivani Jha";
const WHATSAPP_NUMBER = "917045768778";

function CheckoutModalComponent() {
  const {
    cart,
    cartCount,
    cartTotal,
    showCheckout,
    closeCheckout,
    openCart,
    clearCart,
  } = useCart();

  const [step, setStep] = useState("details"); // 'details' | 'payment' | 'success'
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [utr, setUtr] = useState("");
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const grandTotal = cartTotal + SHIPPING_CHARGE;

  // Build the universal UPI payment URI
  const upiUri = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(
    UPI_NAME
  )}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent("Madhubani Palette Order")}`;

  // Generate dynamic QR code when stepping to payment
  useEffect(() => {
    if (step === "payment" && grandTotal > 0) {
      QRCode.toDataURL(upiUri, {
        width: 320,
        margin: 1,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("QR Generation error:", err));
    }
  }, [step, grandTotal, upiUri]);

  // Self-contained body scroll lock and Escape key handling
  useEffect(() => {
    if (!showCheckout) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !orderLoading) {
        closeCheckout();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow || "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showCheckout, closeCheckout, orderLoading]);

  // Reset modal state when closed
  const handleModalClose = () => {
    if (orderLoading) return;
    closeCheckout();
    setTimeout(() => {
      setStep("details");
      setOrderMessage("");
      setUtr("");
      setCopied(false);
    }, 300);
  };

  if (!showCheckout) return null;

  const handleCustomerChange = (event) => {
    const { name, value } = event.target;
    setCustomer((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Step 1 Validation -> Proceed to UPI QR Screen
  const handleProceedToPayment = (event) => {
    event.preventDefault();

    if (cart.length === 0) {
      setOrderMessage("Please add products to your bag first.");
      return;
    }
    if (!customer.name.trim()) {
      setOrderMessage("Please enter your full name.");
      return;
    }
    const cleanPhone = customer.phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setOrderMessage("Please provide a valid 10-digit mobile number.");
      return;
    }
    if (!customer.address.trim() || customer.address.trim().length < 8) {
      setOrderMessage("Please provide complete delivery address with postal pincode.");
      return;
    }

    setOrderMessage("");
    setStep("payment");
  };

  // Copy UPI ID helper
  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // WhatsApp Order Confirmation Helper
  const getWhatsAppMessage = (orderId) => {
    const orderNum = orderId ? `#${orderId.slice(-8).toUpperCase()}` : "";
    const itemsList = cart
      .map(
        (item) =>
          `• ${item.name} x ${item.quantity || 1} (₹${(
            Number(item.price || 0) * Number(item.quantity || 1)
          ).toLocaleString("en-IN")})`
      )
      .join("\n");

    return `*NAMASTE MADHUBANI PALETTE!* 🙏
I have placed an order through your website:

*Order Details:* ${orderNum}
*Customer Name:* ${customer.name}
*Phone Number:* ${customer.phone}
*Delivery Address:* ${customer.address}

*Ordered Items:*
${itemsList}

*Subtotal:* ₹${cartTotal.toLocaleString("en-IN")}
*Shipping:* ₹${SHIPPING_CHARGE}
*Total Paid:* ₹${grandTotal.toLocaleString("en-IN")}

*Payment Method:* Direct UPI
*Paid To:* ${UPI_NAME} (${UPI_ID})
${utr ? `*UPI Ref / UTR:* ${utr}\n` : ""}
I am attaching the payment screenshot below. Please confirm my order dispatch! ✨`;
  };

  // Step 2 Submission -> Place UPI Order in DB & Open WhatsApp
  const handleConfirmUpiOrder = async (openWhatsApp = true) => {
    setOrderLoading(true);
    setOrderMessage("");

    const payloadItems = cart.map((item) => ({
      product: item.productId || item._id,
      name: item.name,
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      image: item.image || "",
    }));

    try {
      const response = await fetch(`${API_URL}/payment/upi-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: customer.name.trim(),
            email: customer.email.trim() || `${customer.phone}@madhubanipalette.com`,
            phone: customer.phone.trim(),
            address: customer.address.trim(),
          },
          items: payloadItems,
          utr: utr.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to register order with the server.");
      }

      setConfirmedOrder(data.order);
      setStep("success");
      clearCart();

      // Open WhatsApp chat with prefilled message
      if (openWhatsApp) {
        const waText = getWhatsAppMessage(data.order?._id || data.orderId);
        const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;
        window.open(waUrl, "_blank");
      }
    } catch (err) {
      console.error("Order placement error:", err);
      setOrderMessage(err.message || "Something went wrong while placing your order. Please try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  const modalContent = (
    <div className="product-modal-overlay" onClick={handleModalClose}>
      <div
        className="checkout-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          className="modal-close"
          type="button"
          onClick={handleModalClose}
          disabled={orderLoading}
          aria-label="Close Checkout"
        >
          ×
        </button>

        {/* =========================================================
            STEP 1: CUSTOMER & DELIVERY DETAILS
        ========================================================= */}
        {step === "details" && (
          <>
            <div className="checkout-top-nav">
              <button
                type="button"
                className="back-to-bag-button"
                disabled={orderLoading}
                onClick={() => {
                  closeCheckout();
                  openCart();
                }}
              >
                ← Edit Bag ({cartCount})
              </button>
              <p className="small-heading">• STEP 1 OF 2: DELIVERY</p>
            </div>

            <h2>Shipping Details</h2>

            {/* ORDER SUMMARY */}
            <div className="checkout-summary">
              <div className="summary-title-row">
                <span className="summary-title">Order Items ({cartCount})</span>
                <span className="summary-secure-badge">🛡️ Direct UPI Payment</span>
              </div>

              <div className="checkout-items-list">
                {cart.map((item) => {
                  const itemKey = item.productId || item._id;
                  const unitPrice = Number(item.price || 0);
                  const quantity = Number(item.quantity || 1);

                  return (
                    <div className="checkout-item" key={itemKey}>
                      <div className="checkout-item-image">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <span>✦</span>
                        )}
                      </div>

                      <div className="checkout-item-text">
                        <strong>{item.name}</strong>
                        <p>
                          ₹{unitPrice.toLocaleString("en-IN")} × {quantity}
                        </p>
                      </div>

                      <strong className="checkout-item-cost">
                        ₹{(unitPrice * quantity).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  );
                })}
              </div>

              <div className="checkout-breakdown">
                <div className="breakdown-row">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="breakdown-row">
                  <span>Insured Delivery Charge</span>
                  <span>₹{SHIPPING_CHARGE.toLocaleString("en-IN")}</span>
                </div>
                <div className="checkout-total">
                  <span>Total Payable</span>
                  <strong>₹{grandTotal.toLocaleString("en-IN")}</strong>
                </div>
              </div>
            </div>

            {/* CUSTOMER FORM */}
            <form className="checkout-form" onSubmit={handleProceedToPayment}>
              <h3 className="section-title">Recipient Information</h3>

              <div className="form-grid">
                <label>
                  <span>Full Name *</span>
                  <input
                    type="text"
                    name="name"
                    value={customer.name}
                    onChange={handleCustomerChange}
                    placeholder="e.g. Pallavi Sharma"
                    required
                    disabled={orderLoading}
                  />
                </label>

                <label>
                  <span>10-Digit Mobile Number *</span>
                  <input
                    type="tel"
                    name="phone"
                    value={customer.phone}
                    onChange={handleCustomerChange}
                    placeholder="e.g. 9876543210"
                    required
                    maxLength="10"
                    disabled={orderLoading}
                  />
                </label>

                <label className="full-width">
                  <span>Email Address (Optional)</span>
                  <input
                    type="email"
                    name="email"
                    value={customer.email}
                    onChange={handleCustomerChange}
                    placeholder="e.g. pallavi@example.com (for order receipts)"
                    disabled={orderLoading}
                  />
                </label>

                <label className="full-width">
                  <span>Complete Delivery Address & Pincode *</span>
                  <textarea
                    name="address"
                    value={customer.address}
                    onChange={handleCustomerChange}
                    placeholder="House / Flat No., Building, Street, Landmark, City, State & Pincode"
                    rows="3"
                    required
                    disabled={orderLoading}
                  />
                </label>
              </div>

              {orderMessage && (
                <div className="checkout-message error" role="alert">
                  <p>{orderMessage}</p>
                </div>
              )}

              <button
                type="submit"
                className="modal-order-button"
                disabled={orderLoading || cart.length === 0}
              >
                Proceed to UPI Payment (₹{grandTotal.toLocaleString("en-IN")}) →
              </button>

              <p className="checkout-trust-notice">
                🔒 100% Authentic Madhubani Art • Direct Artist Payment • Insured Express Dispatch
              </p>
            </form>
          </>
        )}

        {/* =========================================================
            STEP 2: UPI SCANNER & PAYMENT VIEW
        ========================================================= */}
        {step === "payment" && (
          <div className="upi-step-container">
            <div className="checkout-top-nav">
              <button
                type="button"
                className="back-to-bag-button"
                disabled={orderLoading}
                onClick={() => setStep("details")}
              >
                ← Back to Address
              </button>
              <p className="small-heading">• STEP 2 OF 2: SCAN & PAY</p>
            </div>

            <div className="upi-header-banner">
              <h2>Scan & Pay with Any UPI App</h2>
              <div className="payable-amount-pill">
                Payable: <strong>₹{grandTotal.toLocaleString("en-IN")}</strong>
              </div>
            </div>

            {/* GOOGLE PAY STYLE SCANNER CARD */}
            <div className="gpay-card">
              <div className="gpay-card-header">
                <div className="gpay-avatar">s</div>
                <div className="gpay-user-info">
                  <strong>{UPI_NAME}</strong>
                  <span>Verified Merchant / Artist</span>
                </div>
              </div>

              {/* QR BOX WITH CENTER BADGE */}
              <div className="gpay-qr-box">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Scan to pay ${UPI_NAME} ₹${grandTotal}`}
                    className="gpay-qr-img"
                  />
                ) : (
                  <div className="qr-skeleton">Generating Scanner...</div>
                )}
                <div className="gpay-center-logo" title="Google Pay / UPI Verified">
                  <svg viewBox="0 0 24 24" width="22" height="22">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.32 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.32 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                </div>
              </div>

              {/* UPI ID ROW */}
              <div className="gpay-upi-id-row">
                <div className="upi-id-text">
                  <span className="upi-label">UPI ID:</span>
                  <code className="upi-code">{UPI_ID}</code>
                </div>
                <button
                  type="button"
                  className="copy-upi-btn"
                  onClick={handleCopyUpi}
                  aria-label="Copy UPI ID"
                >
                  {copied ? "Copied! ✓" : "Copy"}
                </button>
              </div>

              <p className="gpay-scan-tagline">Scan to pay with any UPI app</p>

              {/* SUPPORTED APPS */}
              <div className="upi-app-badges">
                <span className="upi-chip">Google Pay</span>
                <span className="upi-chip">PhonePe</span>
                <span className="upi-chip">Paytm</span>
                <span className="upi-chip">BHIM UPI</span>
                <span className="upi-chip">Cred</span>
              </div>
            </div>

            {/* MOBILE QUICK OPEN BUTTON */}
            <a href={upiUri} className="mobile-upi-btn" rel="noreferrer">
              <span>⚡</span> Open in UPI App (GPay / PhonePe / Paytm)
            </a>

            {/* UTR / REFERENCE NUMBER (OPTIONAL) */}
            <div className="utr-input-group">
              <label htmlFor="utr-input">
                <span>Enter 12-Digit UPI Reference / UTR No. (Optional):</span>
              </label>
              <input
                id="utr-input"
                type="text"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="e.g. 427819402812"
                maxLength="20"
                disabled={orderLoading}
              />
              <small>You will see this 12-digit number in your UPI app receipt after payment.</small>
            </div>

            {orderMessage && (
              <div className="checkout-message error" role="alert">
                <p>{orderMessage}</p>
              </div>
            )}

            {/* CONFIRM VIA WHATSAPP BUTTON */}
            <button
              type="button"
              className="whatsapp-order-btn"
              onClick={() => handleConfirmUpiOrder(true)}
              disabled={orderLoading}
            >
              {orderLoading ? (
                "Processing Order..."
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.79 14.07c-.24.68-1.2 1.27-1.8 1.32-.47.04-1.07.06-3.48-.93-2.64-1.09-4.33-3.8-4.46-3.98-.13-.18-1.07-1.42-1.07-2.72 0-1.29.67-1.93.91-2.19.24-.26.53-.32.7-.32.18 0 .36 0 .52.01.17.01.4.06.61.57.24.58.82 2 .89 2.15.07.15.12.33.02.53-.1.2-.15.32-.3.5-.15.17-.32.39-.46.52-.15.15-.31.32-.13.63.18.31.79 1.31 1.7 2.12 1.17 1.04 2.16 1.36 2.47 1.51.31.15.49.13.67-.08.18-.21.78-.91.99-1.22.21-.31.42-.26.7-.16.29.1 1.83.86 2.14 1.02.31.15.52.23.6.36.08.13.08.77-.16 1.45z" />
                  </svg>
                  Confirm Order & Send on WhatsApp
                </>
              )}
            </button>

            <button
              type="button"
              className="confirm-website-btn"
              onClick={() => handleConfirmUpiOrder(false)}
              disabled={orderLoading}
            >
              Confirm on Website (Without WhatsApp)
            </button>
          </div>
        )}

        {/* =========================================================
            STEP 3: ORDER SUCCESS CONFIRMATION
        ========================================================= */}
        {step === "success" && (
          <div className="order-success">
            <div className="success-icon">✓</div>
            <p className="small-heading">• ORDER CONFIRMED</p>
            <h2>Dhanyavaad, {customer.name}!</h2>
            <p className="success-subheading">
              Your handmade Madhubani piece order has been received. Our team will verify the payment and prepare it with sacred craftsmanship.
            </p>

            <div className="confirmed-order-card">
              <div className="confirmed-order-row">
                <span>Order ID:</span>
                <strong>
                  #{confirmedOrder?._id?.slice(-8).toUpperCase() || "ORD-SUCCESS"}
                </strong>
              </div>
              <div className="confirmed-order-row">
                <span>Payment Method:</span>
                <strong>Direct UPI (sjha63004@okhdfcbank)</strong>
              </div>
              <div className="confirmed-order-row">
                <span>Payment Status:</span>
                <span className="badge-payment pending">AWAITING VERIFICATION</span>
              </div>
              {confirmedOrder?.paymentId && confirmedOrder.paymentId !== "UPI_PENDING_VERIFICATION" && (
                <div className="confirmed-order-row">
                  <span>UPI Reference / UTR:</span>
                  <code className="mono-badge">{confirmedOrder.paymentId}</code>
                </div>
              )}
              <div className="confirmed-order-row">
                <span>Recipient:</span>
                <strong>{customer.name} ({customer.phone})</strong>
              </div>
              <div className="confirmed-order-row">
                <span>Delivery Address:</span>
                <span className="address-snippet">{customer.address}</span>
              </div>
              <div className="confirmed-order-row total">
                <span>Total Amount:</span>
                <strong>₹{grandTotal.toLocaleString("en-IN")}</strong>
              </div>
            </div>

            <div className="whatsapp-prompt-box">
              <p>
                <strong>📱 Important:</strong> Please send your payment screenshot on WhatsApp to <strong>+91 70457 68778</strong> for instant order dispatch.
              </p>
              <button
                type="button"
                className="whatsapp-order-btn"
                onClick={() => {
                  const waText = getWhatsAppMessage(confirmedOrder?._id);
                  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                    waText
                  )}`;
                  window.open(waUrl, "_blank");
                }}
              >
                Open WhatsApp Chat Now
              </button>
            </div>

            <button
              type="button"
              className="modal-order-button"
              onClick={() => {
                closeCheckout();
                setStep("details");
                setConfirmedOrder(null);
                setOrderMessage("");
                setUtr("");
                setCustomer({ name: "", email: "", phone: "", address: "" });
              }}
            >
              Continue Exploring Heritage Pieces →
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export const CheckoutModal = memo(CheckoutModalComponent);
