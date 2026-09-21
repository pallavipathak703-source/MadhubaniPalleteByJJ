import { useEffect, useState } from "react";
import "./Shop.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getProductImageUrl = (product) =>
    product?.images?.[0]?.url || product?.image || product?.imageUrl || "";

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Products:", data);

        // Agar backend direct array bhej raha hai
        if (Array.isArray(data)) {
          setProducts(data);
        }
        // Agar { products: [...] } bhej raha hai
        else if (Array.isArray(data.products)) {
          setProducts(data.products);
        }
      })
      .catch((error) => {
        console.error("Products fetch error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section className="shop-page">
      <div className="shop-heading">
        <p className="shop-small">THE COLLECTION</p>

        <h1>
          Art made with
          <span> tradition.</span>
        </h1>

        <p className="shop-description">
          Discover handmade Madhubani art, clothing and beautiful
          pieces inspired by the cultural heritage of Bihar.
        </p>
      </div>

      {loading ? (
        <p className="shop-loading">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="shop-empty">
          No products available right now.
        </p>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div className="product-card" key={product._id}>
              
              <div className="product-image-box">
                <img
                  src={getProductImageUrl(product)}
                  alt={product.name}
                />
              </div>

              <div className="product-info">
                <p className="product-category">
                  {product.category}
                </p>

                <h2>{product.name}</h2>

                <p className="product-price">
                  ₹{product.price}
                </p>

                <button className="view-product">
                  View Product
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function App() {
  return (
    <>
      {/* Tumhara existing Home */}
      <section id="center">
        {/* existing home code */}
      </section>

      {/* Shop */}
      <Shop />
    </>
  );
}

export default App;