import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { CartProvider, useCart, CartToast } from "./context/CartContext";
import { Navbar } from "./components/Navbar";
import { ProductCard } from "./components/ProductCard";
import { ProductModal } from "./components/ProductModal";
import { CartDrawer } from "./components/CartDrawer";
import { CheckoutModal } from "./components/CheckoutModal";

import "./App.css";
import "./admin/admin.css";

import artist from "./assets/artist.jpg";
import logo from "./assets/logo.jpg";

import {
  AdminDashboard,
  AdminLogin,
  AddProduct,
  EditProduct,
  ProtectedAdminRoute,
} from "./admin/AdminPanel";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// In-memory cache for products so returning to home never refetches or flickers
let cachedProducts = null;

const CATEGORIES = [
  {
    id: "all",
    label: "All Pieces",
    icon: "✦",
    dbCategory: "All",
    tagline: "Explore our complete gallery of slow-crafted heritage pieces",
  },
  {
    id: "clothing",
    label: "Clothing",
    icon: "👗",
    dbCategory: "Clothing",
    tagline: "Handcrafted Madhubani suit sets, kurtas & ethnic silhouettes",
  },
  {
    id: "bags",
    label: "Bags & Accessories",
    icon: "👜",
    dbCategory: "Bags & Accessories",
    tagline: "Artisanal hand-painted tote bags, clutches & everyday companions",
  },
  {
    id: "sarees",
    label: "Sarees",
    icon: "🥻",
    dbCategory: "Sarees",
    tagline: "Slow-painted pure Tussar & silk sarees with sacred Mithila motifs",
  },
  {
    id: "jewellery",
    label: "Jewellery",
    icon: "💍",
    dbCategory: "Jewellery",
    tagline: "Handcrafted painted wooden & terracotta earrings, necklaces & jhumkas",
  },
  {
    id: "paintings",
    label: "Paintings & Artwork",
    icon: "🎨",
    dbCategory: "Madhubani Paintings / Artwork",
    tagline: "Original Mithila paintings on handmade paper & canvas with natural pigments",
  },
  {
    id: "dupattas",
    label: "Dupattas",
    icon: "🧣",
    dbCategory: "Dupattas",
    tagline: "Graceful silk & chanderi dupattas adorned with traditional borders",
  },
  {
    id: "homedecor",
    label: "Home Decor",
    icon: "🏺",
    dbCategory: "Home Decor",
    tagline: "Hand-painted terracotta pots, wall plates & cultural home accents",
  },
  {
    id: "gifts",
    label: "Gifts & Keepsakes",
    icon: "🎁",
    dbCategory: "Essentials / Gifts",
    tagline: "Thoughtful handmade keepsakes, bookmarks & festive gifting sets",
  },
];

/* =========================================================
   HOME PAGE (HIGH-PERFORMANCE ORCHESTRATOR)
========================================================= */

function HomePage() {
  const [products, setProducts] = useState(() => cachedProducts || []);
  const [loading, setLoading] = useState(() => !cachedProducts);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Decoupled from drawer/modal visibility: HomePage NEVER re-renders when drawer opens/closes
  const { addToCart, buyNow } = useCart();

  // Dynamic category product counts
  const categoryCounts = useMemo(() => {
    const counts = { All: products.length };
    for (const p of products) {
      const cat = p.category || "";
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [products]);

  const activeCategoryInfo = useMemo(() => {
    return CATEGORIES.find((c) => c.dbCategory === selectedCategory) || CATEGORIES[0];
  }, [selectedCategory]);

  // React 19 deferred search value for fluid, non-blocking typing
  const deferredSearchTerm = useDeferredValue(searchTerm);

  // 1. FETCH PRODUCTS (With In-Memory Caching & Resilient Abort Handling)
  useEffect(() => {
    if (cachedProducts && cachedProducts.length > 0) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);
    let isCancelled = false;

    const loadProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Could not load products. Please check if the backend is running.");
        }

        const data = await response.json();
        const productList = Array.isArray(data)
          ? data
          : data.products || data.data || [];

        cachedProducts = productList;

        if (!isCancelled) {
          setProducts(productList);
        }
      } catch (fetchError) {
        if (!isCancelled && fetchError.name !== "AbortError") {
          console.error("Products fetch error:", fetchError);
          setError(fetchError.message);
        } else if (!isCancelled && fetchError.name === "AbortError" && !cachedProducts) {
          setError("Products took too long to load. Server timed out.");
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  // 2. SEARCH & CATEGORY FILTER WITH DEFERRED VALUE (Main-thread friendly)
  const filteredProducts = useMemo(() => {
    const safeQuery = deferredSearchTerm.trim().toLowerCase();

    return products.filter((product) => {
      // 1. Category filter
      if (selectedCategory !== "All" && product.category !== selectedCategory) {
        return false;
      }

      // 2. Search query filter
      if (!safeQuery) return true;

      const tagsList = Array.isArray(product.tags)
        ? product.tags
        : typeof product.tags === "string"
        ? [product.tags]
        : [];

      const searchableText = [
        product.name,
        product.category,
        product.artist,
        ...tagsList,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(safeQuery);
    });
  }, [products, selectedCategory, deferredSearchTerm]);

  // 3. PRODUCT MODAL HANDLERS
  const handleOpenProduct = useCallback((product) => {
    setSelectedProduct(product);
  }, []);

  const handleCloseProduct = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  return (
    <div className="app">
      {/* TOAST NOTIFICATION (Isolated subscriber component) */}
      <CartToast />

      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
      <section className="hero-section" id="home">
        <div className="hero-content">
          <p className="small-heading">• HANDMADE BY JANVI</p>
          <h1>
            Art rooted in
            <br />
            <span>tradition.</span>
          </h1>
          <p className="hero-description">
            Discover authentic Madhubani art rooted in the ancient heritage of
            Mithila, Bihar — painted slowly by hand on textiles and keepsakes
            infused with wonder and cultural reverence.
          </p>
          <a href="#shop" className="hero-shop-cta">
            Shop the Collection ↓
          </a>
        </div>

        <div className="hero-art">
          <div className="art-circle">
            <div className="circle circle-one" />
            <div className="circle circle-two" />
            <div className="circle circle-three" />
            <div className="sun">✦</div>
            <div className="flower">✿</div>
          </div>
          <div className="location">
            MITHILA, BIHAR •
            <br />
            26°21'N
          </div>
        </div>
      </section>

      {/* MOTIF RIBBON */}
      <div className="motif-ribbon" aria-hidden="true">
        <span>✿</span>
        <span>❁</span>
        <span className="motif-animal">🐘</span>
        <span>✤</span>
        <span className="motif-animal">🦚</span>
        <span>❀</span>
        <span>✿</span>
      </div>

      {/* PRODUCTS SECTION */}
      <section className="products-section" id="shop">
        <div className="products-heading">
          <div>
            <p className="small-heading">
              • THE COLLECTION {selectedCategory !== "All" && `— ${activeCategoryInfo.label.toUpperCase()}`}
            </p>
            <h2>
              {selectedCategory === "All" ? "Shop the art." : activeCategoryInfo.label}
            </h2>
            <p className="category-tagline">{activeCategoryInfo.tagline}</p>
          </div>
          <p className="product-count">
            {filteredProducts.length} curated {filteredProducts.length === 1 ? "piece" : "pieces"}
          </p>
        </div>

        {/* SECTION / CATEGORY FILTER TABS */}
        <div className="category-filter-container">
          <div className="category-filter-bar" role="tablist" aria-label="Browse by section">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.dbCategory;
              const count = cat.dbCategory === "All"
                ? products.length
                : (categoryCounts[cat.dbCategory] || 0);

              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`category-pill ${isActive ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat.dbCategory)}
                >
                  <span className="category-pill-icon" aria-hidden="true">{cat.icon}</span>
                  <span className="category-pill-label">{cat.label}</span>
                  <span className="category-pill-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTROLS ROW: SEARCH & ACTIVE FILTER STATUS */}
        <div className="collection-controls-row">
          <div className="search-bar">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search in ${selectedCategory === "All" ? "all pieces" : activeCategoryInfo.label.toLowerCase()}...`}
              aria-label="Search collection"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {selectedCategory !== "All" && (
            <button
              type="button"
              className="clear-category-btn"
              onClick={() => setSelectedCategory("All")}
            >
              ✕ Show All Categories ({products.length})
            </button>
          )}
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="status">
            <div className="status-spinner">✦</div>
            <p>Gathering authentic artwork...</p>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="status error">
            {error}
            <small>Make sure the backend is active on port 5000.</small>
          </div>
        )}

        {/* EMPTY SEARCH STATE */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="status">
            {products.length === 0
              ? "No products available right now."
              : `No products match "${searchTerm}".`}
          </div>
        )}

        {/* HIGH-PERFORMANCE PRODUCT GRID */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id || product.id || product.name}
                product={product}
                onOpenProduct={handleOpenProduct}
                onAddToCart={addToCart}
                onBuyNow={buyNow}
              />
            ))}
          </div>
        )}
      </section>

      {/* MEET THE ARTIST */}
      <section className="artist-section" id="about">
        <div className="artist-image-container">
          <img
            src={artist}
            alt="Janvi Jha painting Madhubani art"
            className="artist-image"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="artist-content">
          <p className="small-heading">• MEET THE ARTIST</p>
          <h2>
            Meet Janvi,
            <br />
            <span>from Bihar to you.</span>
          </h2>
          <p>
            Janvi Jha brings the traditional art of Mithila into contemporary
            living through hand-painted clothing, accessories, home decor, and
            original Madhubani paintings on handmade paper and canvas.
          </p>
          <p>
            Every piece is created with patience, fine bamboo nibs, natural
            pigments, and a deep reverence for the sacred motifs passed down
            through generations.
          </p>
          <a href="#shop" className="shop-button">
            Explore the Collection →
          </a>
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact-section" id="contact">
        <p className="small-heading">• GET IN TOUCH</p>
        <h2>Let's connect.</h2>
        <p>
          For custom commissions, bespoke Madhubani bridal sarees, corporate
          gifts, and artistic collaborations, connect directly with Janvi.
        </p>
        <a
          href="https://www.instagram.com/madhubani.palette/"
          target="_blank"
          rel="noreferrer"
          className="instagram"
        >
          @madhubani.palette ↗
        </a>
      </section>

      {/* FOOTER */}
      <footer>
        <img src={logo} alt="Madhubani Palette" loading="lazy" />
        <p>Handmade with heritage • Madhubani Palette by Janvi Jha</p>
      </footer>

      {/* MODALS & DRAWERS (Decoupled from Catalog Re-renders) */}
      <ProductModal
        product={selectedProduct}
        onClose={handleCloseProduct}
      />
      <CartDrawer />
      <CheckoutModal />
    </div>
  );
}

/* =========================================================
   APP ROOT WITH CART PROVIDER
========================================================= */

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/products/new"
            element={
              <ProtectedAdminRoute>
                <AddProduct />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/products/:id/edit"
            element={
              <ProtectedAdminRoute>
                <EditProduct />
              </ProtectedAdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;