import { memo, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { getProductImageUrl } from "../cartUtils";
import { useCart } from "../context/CartContext";

function ProductModalComponent({ product, onClose }) {
  const { addToCart, buyNow } = useCart();

  // Self-contained body scroll lock and Escape key handling
  useEffect(() => {
    if (!product) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow || "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [product, onClose]);

  const tags = useMemo(() => {
    if (!product?.tags) return [];
    if (Array.isArray(product.tags)) {
      return product.tags.filter(Boolean);
    }
    if (typeof product.tags === "string" && product.tags.trim()) {
      return product.tags
        .split(/[,]+/)
        .map((t) => t.trim())
        .filter(Boolean);
    }
    return [];
  }, [product?.tags]);

  if (!product) return null;

  const imageUrl = getProductImageUrl(product);
  const isAvailable = Number(product?.stock || 0) > 0 && product?.isAvailable !== false;
  const productName = product?.name || "Madhubani Artwork";
  const categoryName = product?.category || "MADHUBANI ART";
  const artistName = product?.artist || "Janvi Jha";
  const price = Number(product?.price || 0);

  const modalContent = (
    <div
      className="product-modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="product-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        <div className="modal-image">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={productName}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="modal-placeholder">
              <span>✦</span>
              <p>Madhubani Palette</p>
            </div>
          )}
        </div>

        <div className="modal-details">
          <p className="modal-category">{categoryName}</p>

          <h2>{productName}</h2>

          <p className="modal-artist">
            Hand-painted by <strong>{artistName}</strong>
          </p>

          <div className="modal-divider" />

          <p className="modal-description">
            {product?.description ||
              "A thoughtful handmade creation from Madhubani Palette, rooted in traditional Mithila motifs."}
          </p>

          <div className="modal-price">
            <span>
              {product?.priceType === "starting" ? "Starting from" : "Price"}
            </span>
            <strong>₹{price.toLocaleString("en-IN")}</strong>
          </div>

          <div className="modal-stock">
            {isAvailable ? (
              <>
                <span className="stock-dot" />
                {product.stock} available in studio
              </>
            ) : (
              "Out of stock"
            )}
          </div>

          {tags.length > 0 && (
            <div className="modal-tags">
              {tags.map((tag, idx) => (
                <span key={`${tag}-${idx}`}>{tag}</span>
              ))}
            </div>
          )}

          <div className="modal-actions-row">
            {isAvailable ? (
              <>
                <button
                  type="button"
                  className="modal-add-cart-button"
                  onClick={() => {
                    addToCart(product);
                    onClose();
                  }}
                >
                  Add to Bag
                </button>
                <button
                  type="button"
                  className="modal-order-button"
                  onClick={() => {
                    buyNow(product);
                    onClose();
                  }}
                >
                  Buy Now →
                </button>
              </>
            ) : (
              <button
                type="button"
                className="modal-order-button"
                disabled
              >
                Out of Stock
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export const ProductModal = memo(ProductModalComponent);
