import { memo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCart } from "../context/CartContext";

function CartDrawerComponent() {
  const {
    cart,
    cartCount,
    cartTotal,
    isCartOpen,
    closeCart,
    openCheckout,
    updateQuantity,
    removeFromCart,
  } = useCart();

  // Self-contained body scroll lock and Escape key handling
  useEffect(() => {
    if (!isCartOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow || "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const drawerContent = (
    <div className="cart-drawer-overlay" onClick={closeCart}>
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Bag"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cart-drawer-header">
          <div className="cart-drawer-title">
            <span className="cart-motif">✿</span>
            <h3>Shopping Bag ({cartCount})</h3>
          </div>
          <button
            type="button"
            className="cart-drawer-close"
            onClick={closeCart}
            aria-label="Close Bag"
          >
            ✕
          </button>
        </div>

        <div className="cart-delivery-banner">
          <span>✦ Insured Package Delivery on Handmade Art ✦</span>
        </div>

        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-empty-icon">❀</div>
              <h4>Your Bag is Empty</h4>
              <p>
                Discover authentic Madhubani hand-painted clothing, original
                artwork, and keepsakes crafted with heritage.
              </p>
              <a
                href="#shop"
                className="cart-browse-button"
                onClick={closeCart}
              >
                Explore Collection →
              </a>
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map((item) => {
                const itemKey = item.productId || item._id;
                const unitPrice = Math.max(0, Number(item.price || 0));
                const quantity = Math.max(1, Math.floor(Number(item.quantity || 1)));
                const itemSubtotal = unitPrice * quantity;

                const hasStockLimit =
                  item.stock !== undefined &&
                  item.stock !== null &&
                  item.stock !== Infinity &&
                  Number(item.stock) >= 0;

                const isAtMaxStock = hasStockLimit && quantity >= item.stock;

                return (
                  <div className="cart-item-card" key={itemKey}>
                    <div className="cart-item-image">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="cart-item-placeholder">✦</div>
                      )}
                    </div>

                    <div className="cart-item-info">
                      <div className="cart-item-header-row">
                        <h4 className="cart-item-name">{item.name}</h4>
                        <button
                          type="button"
                          className="cart-item-remove"
                          onClick={() => removeFromCart(itemKey)}
                          title="Remove item"
                          aria-label={`Remove ${item.name}`}
                        >
                          ✕
                        </button>
                      </div>

                      <p className="cart-item-unit-price">
                        ₹{unitPrice.toLocaleString("en-IN")}
                      </p>

                      <div className="cart-item-bottom-row">
                        <div className="cart-stepper">
                          <button
                            type="button"
                            onClick={() => updateQuantity(itemKey, -1)}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="cart-stepper-qty">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(itemKey, 1)}
                            disabled={isAtMaxStock}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <strong className="cart-item-subtotal">
                          ₹{itemSubtotal.toLocaleString("en-IN")}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-drawer-total-row">
              <span>Subtotal</span>
              <strong>₹{cartTotal.toLocaleString("en-IN")}</strong>
            </div>
            <div className="cart-drawer-delivery-row">
              <span>Shipping / Package Charge</span>
              <strong>₹100</strong>
            </div>
            <div className="cart-drawer-divider" />
            <div className="cart-drawer-grand-total">
              <span>Total Due</span>
              <strong>₹{(cartTotal + 100).toLocaleString("en-IN")}</strong>
            </div>

            <button
              type="button"
              className="cart-checkout-btn"
              onClick={openCheckout}
            >
              Proceed to Checkout • ₹{(cartTotal + 100).toLocaleString("en-IN")} →
            </button>

            <button
              type="button"
              className="cart-continue-btn"
              onClick={closeCart}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </div>
  );

  return createPortal(drawerContent, document.body);
}

export const CartDrawer = memo(CartDrawerComponent);
