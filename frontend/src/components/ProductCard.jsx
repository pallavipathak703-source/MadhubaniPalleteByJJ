import { memo, useMemo } from "react";
import { getProductImageUrl } from "../cartUtils";

function ProductCardComponent({ product, onOpenProduct, onAddToCart, onBuyNow }) {
  const imageUrl = useMemo(() => getProductImageUrl(product), [product]);
  const productId = product?._id || product?.id;
  const isAvailable = product?.stock > 0 && product?.isAvailable !== false;

  return (
    <article className="product-card" key={productId || product?.name}>
      <div
        className="product-image"
        onClick={() => onOpenProduct(product)}
        role="button"
        tabIndex={0}
        aria-label={`View details of ${product?.name}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpenProduct(product);
          }
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product?.name || "Madhubani Artwork"}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="image-placeholder">
            <span>✦</span>
            <p>Madhubani Palette</p>
          </div>
        )}

        {product?.featured && <span className="featured">FEATURED</span>}
      </div>

      <div className="product-info">
        <p className="category">{product?.category || "Madhubani Art"}</p>

        <h3
          onClick={() => onOpenProduct(product)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpenProduct(product);
            }
          }}
        >
          {product?.name}
        </h3>

        <p className="artist">By {product?.artist || "Janvi Jha"}</p>

        {product?.description && (
          <p className="product-description">{product.description}</p>
        )}

        <div className="product-bottom">
          <div className="product-price-row">
            <strong>
              ₹{Number(product?.price || 0).toLocaleString("en-IN")}
            </strong>
            {product?.priceType === "starting" && (
              <span className="price-type-label">Starting from</span>
            )}
          </div>

          {isAvailable ? (
            <div className="product-actions">
              <button
                type="button"
                className="add-cart-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                aria-label={`Add ${product?.name} to bag`}
              >
                + Add to Bag
              </button>

              <button
                type="button"
                className="buy-now-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBuyNow(product);
                }}
                aria-label={`Buy ${product?.name} now`}
              >
                Buy Now
              </button>

              <button
                type="button"
                className="view-product-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenProduct(product);
                }}
              >
                View Full Details ↗
              </button>
            </div>
          ) : (
            <span className="out-stock">Out of stock</span>
          )}
        </div>
      </div>
    </article>
  );
}

export const ProductCard = memo(ProductCardComponent);
