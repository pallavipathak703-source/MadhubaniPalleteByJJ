import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import logo from "../assets/logo.jpg";
import { API_URL } from "../config/api";

const ADMIN_TOKEN_KEY = "madhubani_admin_token";
const ADMIN_USER_KEY = "madhubani_admin_user";

export const CATEGORIES_LIST = [
  "Clothing",
  "Bags & Accessories",
  "Sarees",
  "Jewellery",
  "Madhubani Paintings / Artwork",
  "Dupattas",
  "Home Decor",
  "Essentials / Gifts",
];

export function getProductImageUrl(product) {
  let image = product?.images?.[0]?.url || product?.images?.[0] || "";

  if (typeof image !== "string") {
    return "";
  }

  const consoleUrl = image.match(
    /^https:\/\/res-console\.cloudinary\.com\/([^/]+)\/thumbnails\/v1\/image\/upload\/v(\d+)\/([^/]+)\/preview$/
  );

  if (consoleUrl) {
    try {
      image = `https://res.cloudinary.com/${consoleUrl[1]}/image/upload/v${consoleUrl[2]}/${atob(consoleUrl[3])}`;
    } catch {
      return "";
    }
  }

  return image;
}

export function getAuthHeaders(includeJson = true) {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  const headers = {};

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/* =========================================================
   PROTECTED ADMIN ROUTE
========================================================= */
export function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

/* =========================================================
   1. ADMIN LOGIN / REGISTER
========================================================= */
export function AdminLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (localStorage.getItem(ADMIN_TOKEN_KEY)) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((curr) => ({ ...curr, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const endpoint = mode === "login" ? "/admin/login" : "/admin/register";
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to process authentication.");
      }

      if (mode === "login") {
        localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.admin || {}));
        navigate("/admin", { replace: true });
      } else {
        setMode("login");
        setMessage({
          type: "success",
          text: "Admin created successfully! You can now log in.",
        });
        setForm({ name: "", email: "", password: "" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-shell">
      <div className="admin-auth-card">
        <div className="admin-auth-brand">
          <img src={logo} alt="Madhubani Palette" className="admin-auth-logo" />
          <h1>Madhubani Palette</h1>
          <p>Management Portal & Operations Control</p>
        </div>

        <div className="admin-auth-toggle">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setMessage({ type: "", text: "" });
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => {
              setMode("register");
              setMessage({ type: "", text: "" });
            }}
          >
            New Admin
          </button>
        </div>

        {message.text && (
          <div
            className={`admin-feedback-banner ${
              message.type === "success" ? "success" : "error"
            }`}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "13px",
              background: message.type === "success" ? "#ecfdf5" : "#fef2f2",
              color: message.type === "success" ? "#065f46" : "#991b1b",
              border: `1px solid ${message.type === "success" ? "#a7f3d0" : "#fecaca"}`,
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-auth-form">
          {mode === "register" && (
            <div className="form-group" style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Janvi Jha"
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                }}
              />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@domain.com"
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                minLength={6}
                required
                style={{
                  width: "100%",
                  padding: "10px 40px 10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: "#173f49",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "15px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Authenticating..." : mode === "login" ? "Enter Admin Dashboard" : "Create Administrator"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
          <Link
            to="/"
            style={{
              color: "#64748b",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            ← Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   2. MAIN ADMIN DASHBOARD & WORKSPACE
========================================================= */
export function AdminDashboard() {
  const navigate = useNavigate();

  // Navigation State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Current Admin User
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_USER_KEY)) || { name: "Admin", email: "admin" };
    } catch {
      return { name: "Admin", email: "admin" };
    }
  });

  // Core Data States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Product Filter & Search
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("All");
  const [productStockFilter, setProductStockFilter] = useState("all");
  const [productPage, setProductPage] = useState(1);
  const productsPerPage = 8;

  // Order Filter & Search
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderPaymentFilter, setOrderPaymentFilter] = useState("all");
  const [processingRefund, setProcessingRefund] = useState(false);

  // Selected Item for Drawer / Modals
  const [viewingOrder, setViewingOrder] = useState(null);
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState(null);

  // Inline Stock Edit State: { [productId]: stockValue }
  const [stockEdits, setStockEdits] = useState({});
  const [savingStockId, setSavingStockId] = useState(null);

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    name: adminUser.name || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [settingsMessage, setSettingsMessage] = useState({ type: "", text: "" });
  const [savingSettings, setSavingSettings] = useState(false);

  // Analytics Period Selector
  const [analyticsPeriod, setAnalyticsPeriod] = useState("30d");

  /* ---------------- Fetch All Core Data ---------------- */
  const fetchAllData = async () => {
    setLoading(true);
    setError("");

    try {
      const headers = getAuthHeaders();

      // Parallel requests for optimal speed
      const [dashRes, prodRes, ordRes, custRes] = await Promise.all([
        fetch(`${API_URL}/admin/dashboard`, { headers }),
        fetch(`${API_URL}/products`, { headers }),
        fetch(`${API_URL}/orders`, { headers }),
        fetch(`${API_URL}/admin/customers`, { headers }),
      ]);

      if (dashRes.status === 401 || ordRes.status === 401) {
        handleLogout();
        return;
      }

      const [dashData, prodData, ordData, custData] = await Promise.all([
        dashRes.json(),
        prodRes.json(),
        ordRes.json(),
        custRes.json(),
      ]);

      if (dashData.success) {
        setDashboardStats(dashData.stats || dashData.data || {});
      }

      const prodList = Array.isArray(prodData) ? prodData : prodData.products || [];
      setProducts(prodList);

      if (ordData.success) {
        setOrders(ordData.orders || []);
      }

      if (custData.success) {
        setCustomers(custData.customers || []);
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
      setError(err.message || "Failed to load dashboard data. Ensure server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch Analytics when Analytics tab is opened or period changed
  useEffect(() => {
    if (activeTab !== "analytics") return;

    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/analytics?period=${analyticsPeriod}`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (data.success) {
          setAnalyticsData(data.timeline ? data : data.data || {});
        }
      } catch (err) {
        console.error("Analytics fetch error:", err);
      }
    };

    fetchAnalytics();
  }, [activeTab, analyticsPeriod]);

  /* ---------------- Logout ---------------- */
  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    navigate("/admin/login", { replace: true });
  };

  /* ---------------- Update Order Status ---------------- */
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderStatus(true);
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update order status.");
      }

      setOrders((curr) =>
        curr.map((ord) => (ord._id === orderId ? { ...ord, orderStatus: newStatus } : ord))
      );

      if (viewingOrder && viewingOrder._id === orderId) {
        setViewingOrder((curr) => ({ ...curr, orderStatus: newStatus }));
      }

      // Refresh dashboard stats quietly
      fetch(`${API_URL}/admin/dashboard`, { headers: getAuthHeaders() })
        .then((res) => res.json())
        .then((resData) => resData.success && setDashboardStats(resData.stats || resData.data || {}))
        .catch(() => {});
    } catch (err) {
      alert(err.message || "Failed to update order status.");
    } finally {
      setUpdatingOrderStatus(false);
    }
  };

  /* ---------------- Process Gateway Refund ---------------- */
  const handleProcessRefund = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to refund this order? This will contact Razorpay to refund the customer, mark the order as Refunded, and restore stock."
      )
    ) {
      return;
    }

    setProcessingRefund(true);
    try {
      const response = await fetch(`${API_URL}/payment/refund/${orderId}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason: "Admin initiated customer refund" }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to process gateway refund.");
      }

      alert("Refund processed successfully via Razorpay gateway!");

      setOrders((curr) =>
        curr.map((ord) => (ord._id === orderId ? data.order : ord))
      );

      if (viewingOrder && viewingOrder._id === orderId) {
        setViewingOrder(data.order);
      }

      // Refresh dashboard stats
      fetch(`${API_URL}/admin/dashboard`, { headers: getAuthHeaders() })
        .then((res) => res.json())
        .then((resData) => resData.success && setDashboardStats(resData.stats || resData.data || {}))
        .catch(() => {});
    } catch (err) {
      alert(err.message || "Error processing refund.");
    } finally {
      setProcessingRefund(false);
    }
  };

  /* ---------------- Delete Product ---------------- */
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeletingProduct(true);
    try {
      const response = await fetch(`${API_URL}/products/${productToDelete._id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete product.");
      }

      setProducts((curr) => curr.filter((p) => p._id !== productToDelete._id));
      setProductToDelete(null);
    } catch (err) {
      alert(err.message || "Could not delete product.");
    } finally {
      setDeletingProduct(false);
    }
  };

  /* ---------------- Inline Stock Update ---------------- */
  const handleInlineStockChange = (productId, newStock) => {
    setStockEdits((curr) => ({ ...curr, [productId]: Math.max(0, parseInt(newStock) || 0) }));
  };

  const saveInlineStock = async (productId) => {
    const newStock = stockEdits[productId];
    if (newStock === undefined) return;

    setSavingStockId(productId);
    try {
      const response = await fetch(`${API_URL}/admin/inventory/${productId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ stock: newStock }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update inventory.");
      }

      setProducts((curr) =>
        curr.map((p) => (p._id === productId ? { ...p, stock: newStock } : p))
      );
      setStockEdits((curr) => {
        const next = { ...curr };
        delete next[productId];
        return next;
      });
    } catch (err) {
      alert(err.message || "Error updating stock.");
    } finally {
      setSavingStockId(null);
    }
  };

  /* ---------------- Update Admin Profile / Password ---------------- */
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMessage({ type: "", text: "" });

    if (settingsForm.newPassword && settingsForm.newPassword !== settingsForm.confirmPassword) {
      setSettingsMessage({ type: "error", text: "New passwords do not match." });
      setSavingSettings(false);
      return;
    }

    try {
      const payload = { name: settingsForm.name };
      if (settingsForm.newPassword) {
        payload.currentPassword = settingsForm.currentPassword;
        payload.newPassword = settingsForm.newPassword;
      }

      const res = await fetch(`${API_URL}/admin/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update settings.");
      }

      setAdminUser((curr) => ({ ...curr, name: data.admin.name }));
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.admin));
      setSettingsMessage({ type: "success", text: "Profile updated successfully!" });
      setSettingsForm((curr) => ({
        ...curr,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      setSettingsMessage({ type: "error", text: err.message || "Error updating settings." });
    } finally {
      setSavingSettings(false);
    }
  };

  /* ---------------- Filtered Data Computations ---------------- */
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (productCategoryFilter !== "All" && p.category !== productCategoryFilter) {
        return false;
      }
      // Stock filter
      if (productStockFilter === "in_stock" && (p.stock || 0) <= 0) return false;
      if (productStockFilter === "low_stock" && ((p.stock || 0) > 3 || (p.stock || 0) === 0))
        return false;
      if (productStockFilter === "out_of_stock" && (p.stock || 0) > 0) return false;

      // Search
      if (!productSearch) return true;
      const q = productSearch.toLowerCase();
      return (
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.artist?.toLowerCase().includes(q)
      );
    });
  }, [products, productCategoryFilter, productStockFilter, productSearch]);

  const paginatedProducts = useMemo(() => {
    const start = (productPage - 1) * productsPerPage;
    return filteredProducts.slice(start, start + productsPerPage);
  }, [filteredProducts, productPage]);

  const totalProductPages = Math.ceil(filteredProducts.length / productsPerPage) || 1;

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (
        orderStatusFilter !== "all" &&
        (o.orderStatus || "").toLowerCase() !== orderStatusFilter.toLowerCase()
      ) {
        return false;
      }
      if (
        orderPaymentFilter !== "all" &&
        (o.paymentStatus || "Pending").toLowerCase() !== orderPaymentFilter.toLowerCase()
      ) {
        return false;
      }
      if (!orderSearch) return true;
      const q = orderSearch.toLowerCase();
      return (
        o._id?.toLowerCase().includes(q) ||
        o.customer?.name?.toLowerCase().includes(q) ||
        o.customer?.email?.toLowerCase().includes(q) ||
        o.customer?.phone?.toLowerCase().includes(q) ||
        o.paymentId?.toLowerCase().includes(q) ||
        o.paymentOrderId?.toLowerCase().includes(q)
      );
    });
  }, [orders, orderStatusFilter, orderPaymentFilter, orderSearch]);

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => (p.stock ?? 1) <= 3);
  }, [products]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter(
      (o) => (o.orderStatus || "").toLowerCase() === "pending"
    ).length;
  }, [orders]);

  const categoryCounts = useMemo(() => {
    const map = {};
    for (const cat of CATEGORIES_LIST) {
      map[cat] = 0;
    }
    for (const p of products) {
      if (map[p.category] !== undefined) {
        map[p.category] += 1;
      }
    }
    return map;
  }, [products]);

  return (
    <div className="admin-shell">
      {/* ================= SIDEBAR ================= */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-brand">
          <img src={logo} alt="Madhubani Palette" className="admin-brand-logo" />
          <div className="admin-brand-info">
            <h2>Madhubani Palette</h2>
            <span>Admin Console</span>
          </div>
        </div>

        <nav className="admin-nav">
          <button
            type="button"
            className={`admin-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("dashboard");
              setSidebarOpen(false);
            }}
          >
            <span className="admin-nav-icon">📊</span>
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "products" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("products");
              setSidebarOpen(false);
            }}
          >
            <span className="admin-nav-icon">🏷️</span>
            <span>Products</span>
            <span className="admin-nav-badge">{products.length}</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("orders");
              setSidebarOpen(false);
            }}
          >
            <span className="admin-nav-icon">📦</span>
            <span>Orders</span>
            {pendingOrdersCount > 0 && (
              <span className="admin-nav-badge pending">{pendingOrdersCount}</span>
            )}
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "customers" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("customers");
              setSidebarOpen(false);
            }}
          >
            <span className="admin-nav-icon">👥</span>
            <span>Customers</span>
            <span className="admin-nav-badge">{customers.length}</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "categories" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("categories");
              setSidebarOpen(false);
            }}
          >
            <span className="admin-nav-icon">📂</span>
            <span>Categories</span>
            <span className="admin-nav-badge">{CATEGORIES_LIST.length}</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "inventory" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("inventory");
              setSidebarOpen(false);
            }}
          >
            <span className="admin-nav-icon">📦</span>
            <span>Inventory</span>
            {lowStockProducts.length > 0 && (
              <span className="admin-nav-badge alert">{lowStockProducts.length} low</span>
            )}
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("analytics");
              setSidebarOpen(false);
            }}
          >
            <span className="admin-nav-icon">📈</span>
            <span>Analytics</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("settings");
              setSidebarOpen(false);
            }}
          >
            <span className="admin-nav-icon">⚙️</span>
            <span>Settings</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-pill">
            <div className="admin-user-avatar">{adminUser.name?.[0]?.toUpperCase() || "A"}</div>
            <div className="admin-user-info">
              <h4>{adminUser.name}</h4>
              <p>{adminUser.email}</p>
            </div>
          </div>
          <button type="button" className="admin-logout-btn" onClick={handleLogout} title="Sign Out">
            Sign Out ⎋
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ================= MAIN CONTAINER ================= */}
      <div className="admin-main">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle navigation"
            >
              ☰
            </button>
            <div className="admin-breadcrumbs">
              <span className="parent">Admin</span>
              <span className="divider">/</span>
              <span className="current" style={{ textTransform: "capitalize" }}>
                {activeTab}
              </span>
            </div>
          </div>

          <div className="admin-topbar-actions">
            <div className="admin-status-pill">
              <span className="status-dot online"></span>
              <span>Storefront Live</span>
            </div>

            <Link to="/admin/products/new" className="admin-primary-btn compact">
              <span>+ Add Product</span>
            </Link>

            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="admin-outline-btn compact"
              title="Open customer storefront in new tab"
            >
              Storefront ↗
            </Link>
          </div>
        </header>

        {/* CONTENT VIEWPORT */}
        <main className="admin-content">
          {error && (
            <div className="admin-alert-banner error">
              <span>⚠ {error}</span>
              <button type="button" onClick={fetchAllData}>
                Retry
              </button>
            </div>
          )}

          {/* ================= TAB 1: DASHBOARD ================= */}
          {activeTab === "dashboard" && (
            <div className="admin-tab-view animate-fade">
              <div className="admin-view-header">
                <div>
                  <h1>Store Overview</h1>
                  <p>Real-time metrics, order alerts, and quick actions</p>
                </div>
                <button
                  type="button"
                  className="admin-outline-btn"
                  onClick={fetchAllData}
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "↻ Refresh Data"}
                </button>
              </div>

              {/* KPI STATS CARDS */}
              <div className="admin-stats-grid">
                <div className="stat-card">
                  <div className="stat-icon revenue">₹</div>
                  <div className="stat-details">
                    <span className="stat-label">Total Revenue</span>
                    <h3 className="stat-value">
                      ₹{(dashboardStats?.totalRevenue || 0).toLocaleString("en-IN")}
                    </h3>
                    <span className="stat-subtext positive">Verified paid & completed</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon orders">📦</div>
                  <div className="stat-details">
                    <span className="stat-label">Total Orders</span>
                    <h3 className="stat-value">{dashboardStats?.totalOrders || orders.length}</h3>
                    <span className="stat-subtext">
                      {pendingOrdersCount} pending fulfillment
                    </span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon products">🏷️</div>
                  <div className="stat-details">
                    <span className="stat-label">Catalog Products</span>
                    <h3 className="stat-value">{products.length}</h3>
                    <span className="stat-subtext">Across {CATEGORIES_LIST.length} sections</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon customers">👥</div>
                  <div className="stat-details">
                    <span className="stat-label">Total Customers</span>
                    <h3 className="stat-value">
                      {dashboardStats?.totalCustomers || customers.length}
                    </h3>
                    <span className="stat-subtext">Active store patrons</span>
                  </div>
                </div>
              </div>

              {/* LOW STOCK ALERT (If any) */}
              {lowStockProducts.length > 0 && (
                <div className="admin-alert-banner warning">
                  <div>
                    <strong>Inventory Alert:</strong> {lowStockProducts.length} product(s) have 3
                    or fewer pieces in stock.
                  </div>
                  <button
                    type="button"
                    className="admin-outline-btn compact"
                    onClick={() => setActiveTab("inventory")}
                  >
                    Manage Inventory →
                  </button>
                </div>
              )}

              {/* RECENT ORDERS + RECENT PRODUCTS GRID */}
              <div className="admin-split-grid">
                {/* RECENT ORDERS */}
                <div className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <h3>Recent Orders</h3>
                      <p>Latest customer transactions</p>
                    </div>
                    <button
                      type="button"
                      className="text-link-btn"
                      onClick={() => setActiveTab("orders")}
                    >
                      View All Orders →
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order._id}>
                            <td className="mono-text">#{order._id?.slice(-6).toUpperCase()}</td>
                            <td>
                              <div className="table-customer-cell">
                                <strong>{order.customer?.name || "Customer"}</strong>
                                <small>{order.customer?.phone || ""}</small>
                              </div>
                            </td>
                            <td>
                              <strong>₹{(order.totalAmount || 0).toLocaleString("en-IN")}</strong>
                            </td>
                            <td>
                              <span className={`badge badge-${order.orderStatus}`}>
                                {order.orderStatus}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="action-btn"
                                onClick={() => setViewingOrder(order)}
                                title="Inspect order details"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                        {orders.length === 0 && (
                          <tr>
                            <td colSpan="5" className="empty-table-cell">
                              No orders placed yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* LOW STOCK SPOTLIGHT */}
                <div className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <h3>Stock Watchlist</h3>
                      <p>Items requiring replenishment</p>
                    </div>
                    <button
                      type="button"
                      className="text-link-btn"
                      onClick={() => setActiveTab("inventory")}
                    >
                      Stock Monitor →
                    </button>
                  </div>

                  <div className="watchlist-list">
                    {lowStockProducts.slice(0, 5).map((prod) => {
                      const img = getProductImageUrl(prod);
                      return (
                        <div key={prod._id} className="watchlist-item">
                          <img
                            src={img || logo}
                            alt={prod.name}
                            className="watchlist-thumb"
                            onError={(e) => {
                              e.currentTarget.src = logo;
                            }}
                          />
                          <div className="watchlist-info">
                            <h4>{prod.name}</h4>
                            <small>{prod.category}</small>
                          </div>
                          <div className="watchlist-stock">
                            <span className={`stock-badge ${prod.stock === 0 ? "zero" : "low"}`}>
                              {prod.stock === 0 ? "Out of Stock" : `${prod.stock} left`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {lowStockProducts.length === 0 && (
                      <div className="empty-state-box">
                        <span className="check-icon">✓</span>
                        <p>All catalog products are healthy and well-stocked.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: PRODUCTS ================= */}
          {activeTab === "products" && (
            <div className="admin-tab-view animate-fade">
              <div className="admin-view-header">
                <div>
                  <h1>Product Catalog</h1>
                  <p>Manage {products.length} handcrafted products, artwork & accessories</p>
                </div>
                <div className="header-action-group">
                  <Link to="/admin/products/new" className="admin-primary-btn">
                    + Add New Product
                  </Link>
                </div>
              </div>

              {/* SEARCH & FILTERS */}
              <div className="admin-controls-card">
                <div className="admin-search-input-wrap">
                  <span className="search-icon">🔍</span>
                  <input
                    type="search"
                    placeholder="Search by title, section, or artist..."
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setProductPage(1);
                    }}
                    className="admin-input"
                  />
                  {productSearch && (
                    <button
                      type="button"
                      className="clear-search-btn"
                      onClick={() => setProductSearch("")}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="admin-filter-group">
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => {
                      setProductCategoryFilter(e.target.value);
                      setProductPage(1);
                    }}
                    className="admin-select"
                  >
                    <option value="All">All Categories ({products.length})</option>
                    {CATEGORIES_LIST.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat} ({categoryCounts[cat] || 0})
                      </option>
                    ))}
                  </select>

                  <select
                    value={productStockFilter}
                    onChange={(e) => {
                      setProductStockFilter(e.target.value);
                      setProductPage(1);
                    }}
                    className="admin-select"
                  >
                    <option value="all">All Stock Statuses</option>
                    <option value="in_stock">In Stock (&gt;0)</option>
                    <option value="low_stock">Low Stock (1-3)</option>
                    <option value="out_of_stock">Out of Stock (0)</option>
                  </select>
                </div>
              </div>

              {/* PRODUCTS DATA TABLE */}
              <div className="admin-card">
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: "60px" }}>Image</th>
                        <th>Product Title</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Flags</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProducts.map((product) => {
                        const img = getProductImageUrl(product);
                        const isLow = (product.stock || 0) <= 3 && (product.stock || 0) > 0;
                        const isZero = (product.stock || 0) === 0;

                        return (
                          <tr key={product._id}>
                            <td>
                              <div className="table-thumb-wrap">
                                <img
                                  src={img || logo}
                                  alt={product.name}
                                  className="table-thumb"
                                  onError={(e) => {
                                    e.currentTarget.src = logo;
                                  }}
                                />
                              </div>
                            </td>
                            <td>
                              <div className="product-title-cell">
                                <strong>{product.name}</strong>
                                <small>By {product.artist || "Janvi Jha"}</small>
                              </div>
                            </td>
                            <td>
                              <span className="category-tag">{product.category}</span>
                            </td>
                            <td>
                              <strong>
                                {product.priceType === "starting" ? "From " : ""}₹
                                {(product.price || 0).toLocaleString("en-IN")}
                              </strong>
                            </td>
                            <td>
                              <span
                                className={`stock-pill ${
                                  isZero ? "zero" : isLow ? "low" : "ok"
                                }`}
                              >
                                {isZero ? "Out of Stock" : `${product.stock} in stock`}
                              </span>
                            </td>
                            <td>
                              <div className="flags-cell">
                                {product.featured && (
                                  <span className="mini-badge featured">Featured</span>
                                )}
                                {product.isAvailable === false && (
                                  <span className="mini-badge unavail">Hidden</span>
                                )}
                              </div>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <div className="table-actions">
                                <Link
                                  to={`/admin/products/${product._id}/edit`}
                                  className="action-btn edit"
                                  title="Edit Product"
                                >
                                  Edit
                                </Link>
                                <button
                                  type="button"
                                  className="action-btn delete"
                                  onClick={() => setProductToDelete(product)}
                                  title="Delete Product"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {paginatedProducts.length === 0 && (
                        <tr>
                          <td colSpan="7" className="empty-table-cell">
                            No products match the selected filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                {filteredProducts.length > productsPerPage && (
                  <div className="admin-pagination">
                    <span className="pagination-info">
                      Showing {(productPage - 1) * productsPerPage + 1}–
                      {Math.min(productPage * productsPerPage, filteredProducts.length)} of{" "}
                      {filteredProducts.length} items
                    </span>
                    <div className="pagination-buttons">
                      <button
                        type="button"
                        disabled={productPage === 1}
                        onClick={() => setProductPage((p) => p - 1)}
                        className="pagination-btn"
                      >
                        Previous
                      </button>
                      <span className="pagination-current">
                        Page {productPage} of {totalProductPages}
                      </span>
                      <button
                        type="button"
                        disabled={productPage >= totalProductPages}
                        onClick={() => setProductPage((p) => p + 1)}
                        className="pagination-btn"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 3: ORDERS ================= */}
          {activeTab === "orders" && (
            <div className="admin-tab-view animate-fade">
              <div className="admin-view-header">
                <div>
                  <h1>Customer Orders</h1>
                  <p>Track shipments, process fulfillment & update order statuses</p>
                </div>
                <button
                  type="button"
                  className="admin-outline-btn"
                  onClick={fetchAllData}
                  disabled={loading}
                >
                  ↻ Refresh Orders
                </button>
              </div>

              {/* SEARCH & FILTERS */}
              <div className="admin-controls-card">
                <div className="admin-search-input-wrap">
                  <span className="search-icon">🔍</span>
                  <input
                    type="search"
                    placeholder="Search by Order ID, customer name, email or phone..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="admin-input"
                  />
                  {orderSearch && (
                    <button
                      type="button"
                      className="clear-search-btn"
                      onClick={() => setOrderSearch("")}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="admin-filter-group">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="admin-select"
                  >
                    <option value="all">All Order Statuses ({orders.length})</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <select
                    value={orderPaymentFilter}
                    onChange={(e) => setOrderPaymentFilter(e.target.value)}
                    className="admin-select"
                  >
                    <option value="all">All Payment Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              {/* ORDERS TABLE */}
              <div className="admin-card">
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Payment Method</th>
                        <th>Payment Status</th>
                        <th>Fulfillment Status</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => {
                        const itemsCount = (order.items || []).reduce(
                          (sum, it) => sum + (it.quantity || 1),
                          0
                        );
                        const dateStr = order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Recent";

                        return (
                          <tr key={order._id}>
                            <td className="mono-text">#{order._id?.slice(-6).toUpperCase()}</td>
                            <td>{dateStr}</td>
                            <td>
                              <div className="table-customer-cell">
                                <strong>{order.customer?.name || "Patron"}</strong>
                                <small>{order.customer?.email || order.customer?.phone}</small>
                              </div>
                            </td>
                            <td>
                              <span className="item-count-badge">
                                {itemsCount} {itemsCount === 1 ? "item" : "items"}
                              </span>
                            </td>
                            <td>
                              <strong>₹{(order.totalAmount || 0).toLocaleString("en-IN")}</strong>
                            </td>
                            <td>
                              <span className="payment-pill">
                                {order.paymentMethod === "Online" || order.paymentMethod === "online"
                                  ? "Razorpay"
                                  : order.paymentMethod || "Online"}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge-payment-status status-${(
                                  order.paymentStatus || "pending"
                                ).toLowerCase()}`}
                              >
                                {order.paymentStatus || "Pending"}
                              </span>
                            </td>
                            <td>
                              <select
                                value={order.orderStatus || "pending"}
                                onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                className={`status-select status-${order.orderStatus}`}
                                disabled={updatingOrderStatus}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <button
                                type="button"
                                className="action-btn view"
                                onClick={() => setViewingOrder(order)}
                              >
                                Details →
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan="8" className="empty-table-cell">
                            No orders found matching your criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: CUSTOMERS ================= */}
          {activeTab === "customers" && (
            <div className="admin-tab-view animate-fade">
              <div className="admin-view-header">
                <div>
                  <h1>Customer Directory</h1>
                  <p>Patrons, total spend, order frequencies & contact info</p>
                </div>
              </div>

              <div className="admin-card">
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Total Orders</th>
                        <th>Lifetime Spend</th>
                        <th>Last Order Date</th>
                        <th style={{ textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((cust, idx) => (
                        <tr key={cust.email || idx}>
                          <td>
                            <div className="table-customer-cell">
                              <div className="customer-avatar">
                                {cust.name?.[0]?.toUpperCase() || "C"}
                              </div>
                              <strong>{cust.name}</strong>
                            </div>
                          </td>
                          <td>{cust.email || "—"}</td>
                          <td>{cust.phone || "—"}</td>
                          <td>
                            <span className="badge badge-neutral">{cust.orderCount} orders</span>
                          </td>
                          <td>
                            <strong>₹{(cust.totalSpent || 0).toLocaleString("en-IN")}</strong>
                          </td>
                          <td>
                            {cust.lastOrderDate
                              ? new Date(cust.lastOrderDate).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              type="button"
                              className="action-btn"
                              onClick={() => setViewingCustomer(cust)}
                            >
                              History
                            </button>
                          </td>
                        </tr>
                      ))}

                      {customers.length === 0 && (
                        <tr>
                          <td colSpan="7" className="empty-table-cell">
                            No customer records found yet. Customers will automatically appear as
                            orders are placed.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: CATEGORIES ================= */}
          {activeTab === "categories" && (
            <div className="admin-tab-view animate-fade">
              <div className="admin-view-header">
                <div>
                  <h1>Craft Sections & Categories</h1>
                  <p>Organize products across traditional Mithila craft forms</p>
                </div>
              </div>

              <div className="categories-grid">
                {CATEGORIES_LIST.map((catName) => {
                  const count = categoryCounts[catName] || 0;
                  return (
                    <div key={catName} className="category-admin-card">
                      <div className="category-card-top">
                        <div className="category-icon-wrap">✦</div>
                        <span className="category-count-badge">{count} pieces</span>
                      </div>
                      <h3>{catName}</h3>
                      <p className="category-card-desc">
                        Curated collection of authentic hand-painted slow crafts.
                      </p>
                      <div className="category-card-footer">
                        <button
                          type="button"
                          className="admin-outline-btn compact"
                          onClick={() => {
                            setProductCategoryFilter(catName);
                            setActiveTab("products");
                          }}
                        >
                          View {count} Products →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 6: INVENTORY ================= */}
          {activeTab === "inventory" && (
            <div className="admin-tab-view animate-fade">
              <div className="admin-view-header">
                <div>
                  <h1>Inventory Manager</h1>
                  <p>Adjust stock levels in real time to prevent overselling</p>
                </div>
              </div>

              {lowStockProducts.length > 0 && (
                <div className="admin-alert-banner warning">
                  <span>
                    ⚠ <strong>{lowStockProducts.length} items</strong> are critically low or out of
                    stock.
                  </span>
                </div>
              )}

              <div className="admin-card">
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: "60px" }}>Item</th>
                        <th>Product Title</th>
                        <th>Section</th>
                        <th>Price</th>
                        <th>Current Stock</th>
                        <th>Quick Stepper Adjustment</th>
                        <th style={{ textAlign: "right" }}>Save</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((prod) => {
                        const img = getProductImageUrl(prod);
                        const currentStock =
                          stockEdits[prod._id] !== undefined
                            ? stockEdits[prod._id]
                            : prod.stock ?? 1;
                        const hasModified =
                          stockEdits[prod._id] !== undefined &&
                          stockEdits[prod._id] !== (prod.stock ?? 1);
                        const isSaving = savingStockId === prod._id;

                        return (
                          <tr key={prod._id}>
                            <td>
                              <img
                                src={img || logo}
                                alt={prod.name}
                                className="table-thumb"
                                onError={(e) => {
                                  e.currentTarget.src = logo;
                                }}
                              />
                            </td>
                            <td>
                              <strong>{prod.name}</strong>
                            </td>
                            <td>
                              <span className="category-tag">{prod.category}</span>
                            </td>
                            <td>₹{(prod.price || 0).toLocaleString("en-IN")}</td>
                            <td>
                              <span
                                className={`stock-pill ${
                                  (prod.stock || 0) === 0
                                    ? "zero"
                                    : (prod.stock || 0) <= 3
                                    ? "low"
                                    : "ok"
                                }`}
                              >
                                {prod.stock || 0} left
                              </span>
                            </td>
                            <td>
                              <div className="stock-stepper-control">
                                <button
                                  type="button"
                                  className="stepper-btn"
                                  onClick={() =>
                                    handleInlineStockChange(
                                      prod._id,
                                      Math.max(0, currentStock - 1)
                                    )
                                  }
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={currentStock}
                                  onChange={(e) =>
                                    handleInlineStockChange(prod._id, e.target.value)
                                  }
                                  className="stepper-input"
                                />
                                <button
                                  type="button"
                                  className="stepper-btn"
                                  onClick={() =>
                                    handleInlineStockChange(prod._id, currentStock + 1)
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <button
                                type="button"
                                disabled={!hasModified || isSaving}
                                onClick={() => saveInlineStock(prod._id)}
                                className={`action-btn ${hasModified ? "primary" : ""}`}
                              >
                                {isSaving ? "Saving..." : hasModified ? "Save Changes" : "Saved"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 7: ANALYTICS ================= */}
          {activeTab === "analytics" && (
            <div className="admin-tab-view animate-fade">
              <div className="admin-view-header">
                <div>
                  <h1>Sales & Growth Analytics</h1>
                  <p>Performance trends, revenue breakdown and fulfillment tracking</p>
                </div>
                <div className="period-selector">
                  {["7d", "30d", "this_month", "this_year", "all"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`period-btn ${analyticsPeriod === p ? "active" : ""}`}
                      onClick={() => setAnalyticsPeriod(p)}
                    >
                      {p === "7d"
                        ? "7 Days"
                        : p === "30d"
                        ? "30 Days"
                        : p === "this_month"
                        ? "This Month"
                        : p === "this_year"
                        ? "This Year"
                        : "All Time"}
                    </button>
                  ))}
                </div>
              </div>

              {/* ANALYTICS SUMMARY CARDS */}
              <div className="admin-stats-grid">
                <div className="stat-card">
                  <div className="stat-icon revenue">₹</div>
                  <div className="stat-details">
                    <span className="stat-label">Period Revenue</span>
                    <h3 className="stat-value">
                      ₹{(analyticsData?.totalRevenue || 0).toLocaleString("en-IN")}
                    </h3>
                    <span className="stat-subtext">Completed sales</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon orders">📊</div>
                  <div className="stat-details">
                    <span className="stat-label">Period Orders</span>
                    <h3 className="stat-value">{analyticsData?.totalOrders || 0}</h3>
                    <span className="stat-subtext">Gross volume</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon customers">💎</div>
                  <div className="stat-details">
                    <span className="stat-label">Average Order Value</span>
                    <h3 className="stat-value">
                      ₹
                      {Math.round(
                        (analyticsData?.totalRevenue || 0) /
                          Math.max(1, analyticsData?.totalOrders || 1)
                      ).toLocaleString("en-IN")}
                    </h3>
                    <span className="stat-subtext">Per customer checkout</span>
                  </div>
                </div>
              </div>

              {/* REVENUE TIMELINE SVG CHART */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h3>Revenue Trend</h3>
                    <p>Daily order volume for the selected timeframe</p>
                  </div>
                </div>

                <div className="chart-container">
                  {analyticsData?.timeline && analyticsData.timeline.length > 0 ? (
                    <svg viewBox="0 0 600 200" className="analytics-svg-chart">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#173f49" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#173f49" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Area & Line */}
                      {(() => {
                        const items = analyticsData.timeline;
                        const maxRev =
                          Math.max(...items.map((i) => i.revenue || 0), 100);
                        const stepX = 560 / Math.max(1, items.length - 1);

                        const points = items.map((item, idx) => {
                          const x = 20 + idx * stepX;
                          const y = 170 - ((item.revenue || 0) / maxRev) * 140;
                          return { x, y, ...item };
                        });

                        const pathD = points.reduce((acc, pt, idx) => {
                          return `${acc} ${idx === 0 ? "M" : "L"} ${pt.x},${pt.y}`;
                        }, "");

                        const areaD = `${pathD} L ${points[points.length - 1].x},180 L ${
                          points[0].x
                        },180 Z`;

                        return (
                          <>
                            <path d={areaD} fill="url(#chartGrad)" />
                            <path
                              d={pathD}
                              fill="none"
                              stroke="#173f49"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                            {points.map((pt, idx) => (
                              <g key={idx}>
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r="4"
                                  fill="#ffffff"
                                  stroke="#173f49"
                                  strokeWidth="2"
                                />
                                <text
                                  x={pt.x}
                                  y="195"
                                  fontSize="9"
                                  textAnchor="middle"
                                  fill="#64748b"
                                >
                                  {pt.date?.slice(5)}
                                </text>
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  ) : (
                    <div className="empty-state-box">
                      <p>No transactions recorded for this period yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 8: SETTINGS ================= */}
          {activeTab === "settings" && (
            <div className="admin-tab-view animate-fade">
              <div className="admin-view-header">
                <div>
                  <h1>Store Settings & Security</h1>
                  <p>Manage admin account credentials and store configuration</p>
                </div>
              </div>

              <div className="settings-grid">
                {/* PROFILE & PASSWORD FORM */}
                <div className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <h3>Admin Profile & Security</h3>
                      <p>Update your display name and administrative credentials</p>
                    </div>
                  </div>

                  {settingsMessage.text && (
                    <div
                      className={`admin-feedback-banner ${
                        settingsMessage.type === "success" ? "success" : "error"
                      }`}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        marginBottom: "16px",
                        fontSize: "13px",
                        background:
                          settingsMessage.type === "success" ? "#ecfdf5" : "#fef2f2",
                        color: settingsMessage.type === "success" ? "#065f46" : "#991b1b",
                        border: `1px solid ${
                          settingsMessage.type === "success" ? "#a7f3d0" : "#fecaca"
                        }`,
                      }}
                    >
                      {settingsMessage.text}
                    </div>
                  )}

                  <form onSubmit={handleSaveSettings} className="admin-settings-form">
                    <div className="form-group">
                      <label>Administrator Name</label>
                      <input
                        type="text"
                        value={settingsForm.name}
                        onChange={(e) =>
                          setSettingsForm((curr) => ({ ...curr, name: e.target.value }))
                        }
                        className="admin-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        value={adminUser.email}
                        disabled
                        className="admin-input disabled"
                      />
                      <small className="form-hint">Email cannot be modified directly.</small>
                    </div>

                    <hr className="form-divider" />

                    <h4>Change Security Password</h4>
                    <p className="form-sub-hint">
                      Leave password fields blank if you only want to update your display name.
                    </p>

                    <div className="form-group">
                      <label>Current Password</label>
                      <input
                        type="password"
                        value={settingsForm.currentPassword}
                        onChange={(e) =>
                          setSettingsForm((curr) => ({
                            ...curr,
                            currentPassword: e.target.value,
                          }))
                        }
                        placeholder="••••••••"
                        className="admin-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        value={settingsForm.newPassword}
                        onChange={(e) =>
                          setSettingsForm((curr) => ({ ...curr, newPassword: e.target.value }))
                        }
                        placeholder="••••••••"
                        minLength={6}
                        className="admin-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        value={settingsForm.confirmPassword}
                        onChange={(e) =>
                          setSettingsForm((curr) => ({
                            ...curr,
                            confirmPassword: e.target.value,
                          }))
                        }
                        placeholder="••••••••"
                        minLength={6}
                        className="admin-input"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="admin-primary-btn"
                    >
                      {savingSettings ? "Updating..." : "Save Settings"}
                    </button>
                  </form>
                </div>

                {/* STORE SYSTEM HEALTH & INFO */}
                <div className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <h3>System Status</h3>
                      <p>Backend & Database connectivity</p>
                    </div>
                  </div>

                  <div className="system-status-list">
                    <div className="system-status-item">
                      <div>
                        <strong>API Backend Server</strong>
                        <p>Node.js / Express on Port 5000</p>
                      </div>
                      <span className="badge badge-delivered">Operational</span>
                    </div>

                    <div className="system-status-item">
                      <div>
                        <strong>Database</strong>
                        <p>MongoDB Atlas Replica Set</p>
                      </div>
                      <span className="badge badge-delivered">Connected</span>
                    </div>

                    <div className="system-status-item">
                      <div>
                        <strong>Image CDN</strong>
                        <p>Cloudinary Cloud Media Service</p>
                      </div>
                      <span className="badge badge-delivered">Active</span>
                    </div>

                    <div className="system-status-item">
                      <div>
                        <strong>Storefront Currency</strong>
                        <p>Indian Rupee (INR — ₹)</p>
                      </div>
                      <span className="badge badge-neutral">INR</span>
                    </div>

                    <div className="system-status-item">
                      <div>
                        <strong>Craft Guild</strong>
                        <p>Mithila Art Heritage by Janvi Jha</p>
                      </div>
                      <span className="badge badge-neutral">Authentic</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= MODAL: ORDER DETAILS DRAWER ================= */}
      {viewingOrder && (
        <div className="admin-modal-overlay" onClick={() => setViewingOrder(null)}>
          <div
            className="admin-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-drawer-header">
              <div>
                <h2>Order #{viewingOrder._id?.slice(-8).toUpperCase()}</h2>
                <span className="drawer-date">
                  Placed on {new Date(viewingOrder.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setViewingOrder(null)}
              >
                ✕
              </button>
            </div>

            <div className="admin-drawer-body">
              {/* STATUS UPDATER */}
              <div className="drawer-section status-box">
                <label>Fulfillment Status</label>
                <div className="status-update-row">
                  <select
                    value={viewingOrder.orderStatus}
                    onChange={(e) =>
                      handleUpdateOrderStatus(viewingOrder._id, e.target.value)
                    }
                    className={`status-select status-${viewingOrder.orderStatus}`}
                    disabled={updatingOrderStatus}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* CUSTOMER INFO */}
              <div className="drawer-section">
                <h3>Customer Details</h3>
                <div className="detail-list">
                  <div className="detail-row">
                    <span>Full Name:</span>
                    <strong>{viewingOrder.customer?.name}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Email Address:</span>
                    <strong>{viewingOrder.customer?.email || "—"}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Phone Number:</span>
                    <strong>{viewingOrder.customer?.phone || "—"}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Shipping Address:</span>
                    <strong style={{ maxWidth: "240px", textAlign: "right" }}>
                      {viewingOrder.shippingAddress?.address || "Address provided at checkout"},{" "}
                      {viewingOrder.shippingAddress?.city || ""}{" "}
                      {viewingOrder.shippingAddress?.postalCode || ""}
                    </strong>
                  </div>
                  <div className="detail-row">
                    <span>Payment Method:</span>
                    <strong>
                      {viewingOrder.paymentMethod === "Online" || viewingOrder.paymentMethod === "online"
                        ? "Razorpay (Online)"
                        : viewingOrder.paymentMethod || "Online"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* PAYMENT & TRANSACTION DETAILS */}
              <div className="drawer-section">
                <h3>Payment & Gateway Verification</h3>
                <div className="detail-list">
                  <div className="detail-row">
                    <span>Payment Gateway:</span>
                    <strong>{viewingOrder.paymentGateway || "Razorpay"}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Payment Status:</span>
                    <span
                      className={`badge-payment-status status-${(
                        viewingOrder.paymentStatus || "pending"
                      ).toLowerCase()}`}
                    >
                      {viewingOrder.paymentStatus || "Pending"}
                    </span>
                  </div>
                  {viewingOrder.paymentId && (
                    <div className="detail-row">
                      <span>Razorpay Payment ID:</span>
                      <code className="mono-badge">{viewingOrder.paymentId}</code>
                    </div>
                  )}
                  {viewingOrder.paymentOrderId && (
                    <div className="detail-row">
                      <span>Gateway Order ID:</span>
                      <code className="mono-badge">{viewingOrder.paymentOrderId}</code>
                    </div>
                  )}
                  {viewingOrder.paymentVerifiedAt && (
                    <div className="detail-row">
                      <span>Verified At:</span>
                      <strong>
                        {new Date(viewingOrder.paymentVerifiedAt).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  )}
                  {viewingOrder.refundId && (
                    <div className="detail-row">
                      <span>Refund Reference:</span>
                      <code className="mono-badge">{viewingOrder.refundId}</code>
                    </div>
                  )}
                  {viewingOrder.paymentError && (
                    <div className="detail-row">
                      <span>Gateway Notice:</span>
                      <strong style={{ color: "#d9534f" }}>{viewingOrder.paymentError}</strong>
                    </div>
                  )}
                </div>

                {viewingOrder.paymentStatus === "Paid" && (
                  <div
                    style={{
                      marginTop: "16px",
                      paddingTop: "14px",
                      borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                    }}
                  >
                    <button
                      type="button"
                      className="admin-outline-btn"
                      disabled={processingRefund}
                      onClick={() => handleProcessRefund(viewingOrder._id)}
                      style={{
                        width: "100%",
                        justifyContent: "center",
                        color: "#c0392b",
                        borderColor: "#e74c3c",
                        fontWeight: "600",
                        padding: "10px",
                        cursor: "pointer",
                      }}
                    >
                      {processingRefund
                        ? "Connecting to Gateway Refund..."
                        : "↩ Issue Official Gateway Refund"}
                    </button>
                    <small
                      style={{
                        display: "block",
                        marginTop: "6px",
                        textAlign: "center",
                        color: "#847268",
                        fontSize: "0.78rem",
                      }}
                    >
                      Funds will be credited back via Razorpay to the customer's original payment source.
                    </small>
                  </div>
                )}
              </div>

              {/* ORDER ITEMS */}
              <div className="drawer-section">
                <h3>Order Items</h3>
                <div className="drawer-items-list">
                  {(viewingOrder.items || []).map((item, idx) => (
                    <div key={idx} className="drawer-item-row">
                      <div className="item-details">
                        <h4>{item.name || item.product?.name || "Handmade Item"}</h4>
                        <small>
                          Quantity: {item.quantity || 1} × ₹
                          {(item.price || 0).toLocaleString("en-IN")}
                        </small>
                      </div>
                      <div className="item-price">
                        <strong>
                          ₹{((item.quantity || 1) * (item.price || 0)).toLocaleString("en-IN")}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="drawer-breakdown-rows" style={{ marginTop: "12px", borderTop: "1px dashed rgba(0,0,0,0.1)", paddingTop: "8px" }}>
                  <div className="detail-row">
                    <span>Subtotal:</span>
                    <strong>₹{(viewingOrder.subtotalAmount || Math.max(0, (viewingOrder.totalAmount || 0) - (viewingOrder.shippingAmount || 100))).toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Shipping / Package Charge:</span>
                    <strong>₹{(viewingOrder.shippingAmount || 100).toLocaleString("en-IN")}</strong>
                  </div>
                </div>

                <div className="drawer-total-row">
                  <span>Grand Total</span>
                  <strong className="grand-total-val">
                    ₹{(viewingOrder.totalAmount || 0).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE PRODUCT CONFIRMATION ================= */}
      {productToDelete && (
        <div className="admin-modal-overlay" onClick={() => setProductToDelete(null)}>
          <div
            className="admin-modal confirm-delete-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-icon danger">⚠</div>
            <h2>Delete Product?</h2>
            <p>
              Are you sure you want to permanently remove{" "}
              <strong>"{productToDelete.name}"</strong> from the store catalog?
            </p>
            <p className="modal-subtext">This action cannot be undone.</p>

            <div className="modal-actions">
              <button
                type="button"
                className="admin-outline-btn"
                onClick={() => setProductToDelete(null)}
                disabled={deletingProduct}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-danger-btn"
                onClick={confirmDeleteProduct}
                disabled={deletingProduct}
              >
                {deletingProduct ? "Deleting..." : "Yes, Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CUSTOMER ORDER HISTORY ================= */}
      {viewingCustomer && (
        <div className="admin-modal-overlay" onClick={() => setViewingCustomer(null)}>
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-drawer-header">
              <div>
                <h2>{viewingCustomer.name}</h2>
                <span className="drawer-date">
                  {viewingCustomer.email} • {viewingCustomer.phone}
                </span>
              </div>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setViewingCustomer(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ marginTop: "16px" }}>
              <div className="detail-row" style={{ marginBottom: "12px" }}>
                <span>Lifetime Spend:</span>
                <strong>₹{(viewingCustomer.totalSpent || 0).toLocaleString("en-IN")}</strong>
              </div>
              <div className="detail-row" style={{ marginBottom: "16px" }}>
                <span>Total Orders Placed:</span>
                <strong>{viewingCustomer.orderCount}</strong>
              </div>

              <h4>Past Orders</h4>
              <div className="drawer-items-list" style={{ maxHeight: "240px", overflowY: "auto" }}>
                {orders
                  .filter(
                    (o) =>
                      (o.customer?.email || "").toLowerCase() ===
                      (viewingCustomer.email || "").toLowerCase()
                  )
                  .map((ord) => (
                    <div key={ord._id} className="drawer-item-row">
                      <div>
                        <strong>#{ord._id?.slice(-6).toUpperCase()}</strong>
                        <small style={{ display: "block" }}>
                          {new Date(ord.createdAt).toLocaleDateString("en-IN")}
                        </small>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <strong>₹{(ord.totalAmount || 0).toLocaleString("en-IN")}</strong>
                        <span
                          className={`badge badge-${ord.orderStatus}`}
                          style={{ display: "block", marginTop: "4px" }}
                        >
                          {ord.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   3. ADD & EDIT PRODUCT FORM
========================================================= */
export function AddProduct() {
  return <ProductForm mode="create" />;
}

export function EditProduct() {
  return <ProductForm mode="edit" />;
}

function ProductForm({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    priceType: "fixed",
    category: CATEGORIES_LIST[0],
    artist: "Janvi Jha",
    stock: "1",
    tags: "",
    featured: false,
    isAvailable: true,
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (mode !== "edit" || !id) return;

    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/products/${id}`, {
          headers: getAuthHeaders(),
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load product.");
        }

        const prod = data.product;
        setForm({
          name: prod.name || "",
          description: prod.description || "",
          price: prod.price ?? "",
          priceType: prod.priceType === "starting" ? "starting" : "fixed",
          category: prod.category || CATEGORIES_LIST[0],
          artist: prod.artist || "Janvi Jha",
          stock: prod.stock ?? "1",
          tags: Array.isArray(prod.tags) ? prod.tags.join(", ") : "",
          featured: Boolean(prod.featured),
          isAvailable: prod.isAvailable !== false,
        });

        const existingImg = getProductImageUrl(prod);
        if (existingImg) {
          setPreviewUrl(existingImg);
        }
      } catch (err) {
        setMessage(err.message || "Unable to load product for editing.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, mode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((curr) => ({
      ...curr,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("description", form.description);
      payload.append("price", String(form.price));
      payload.append("priceType", form.priceType);
      payload.append("category", form.category);
      payload.append("artist", form.artist);
      payload.append("stock", String(form.stock));
      payload.append("tags", form.tags);
      payload.append("featured", String(Boolean(form.featured)));
      payload.append("isAvailable", String(Boolean(form.isAvailable)));

      if (selectedFile) {
        payload.append("image", selectedFile);
      }

      const url = mode === "edit" ? `${API_URL}/products/${id}` : `${API_URL}/products`;

      const response = await fetch(url, {
        method: mode === "edit" ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ADMIN_TOKEN_KEY) || ""}`,
        },
        body: payload,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save product.");
      }

      navigate("/admin");
    } catch (err) {
      setMessage(err.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-form-shell">
      <div className="admin-form-header">
        <div>
          <span className="admin-badge-label">Product Management</span>
          <h1>{mode === "edit" ? "Edit Product Piece" : "Add Handcrafted Product"}</h1>
          <p>Provide details, artwork attributes, and high-resolution photos</p>
        </div>
        <Link to="/admin" className="admin-outline-btn">
          ← Back to Catalog
        </Link>
      </div>

      {loading ? (
        <div className="admin-card" style={{ textAlign: "center", padding: "40px" }}>
          <p>Loading product details...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="admin-card admin-product-form">
          {message && (
            <div
              className="admin-feedback-banner error"
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: "#fef2f2",
                color: "#991b1b",
                marginBottom: "20px",
              }}
            >
              {message}
            </div>
          )}

          <div className="admin-form-grid">
            {/* Title */}
            <div className="form-group full-width">
              <label>Product Title *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Hand-Painted Madhubani Tussar Silk Saree"
                className="admin-input"
                required
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label>Craft Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="admin-select"
                required
              >
                {CATEGORIES_LIST.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="form-group">
              <label>Price (₹ INR) *</label>
              <input
                type="number"
                name="price"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="4500"
                className="admin-input"
                required
              />
            </div>

            {/* Price Type */}
            <div className="form-group">
              <label>Price Type</label>
              <select
                name="priceType"
                value={form.priceType}
                onChange={handleChange}
                className="admin-select"
              >
                <option value="fixed">Fixed Price</option>
                <option value="starting">Starting From (Customizable)</option>
              </select>
            </div>

            {/* Artist */}
            <div className="form-group">
              <label>Artist</label>
              <input
                type="text"
                name="artist"
                value={form.artist}
                onChange={handleChange}
                placeholder="Janvi Jha"
                className="admin-input"
              />
            </div>

            {/* Stock */}
            <div className="form-group">
              <label>Initial Stock Inventory</label>
              <input
                type="number"
                name="stock"
                min="0"
                value={form.stock}
                onChange={handleChange}
                placeholder="1"
                className="admin-input"
              />
            </div>

            {/* Tags */}
            <div className="form-group">
              <label>Search Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="hand-painted, pure silk, floral, festival"
                className="admin-input"
              />
            </div>

            {/* Description */}
            <div className="form-group full-width">
              <label>Product Story & Description *</label>
              <textarea
                name="description"
                rows="5"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the motifs, colors, fabric, dimensions, and craft story..."
                className="admin-textarea"
                required
              />
            </div>

            {/* Image Upload */}
            <div className="form-group full-width">
              <label>Artwork Image {mode === "create" ? "*" : "(Optional to update)"}</label>
              <div className="image-upload-box">
                {previewUrl && (
                  <div className="image-preview-wrap">
                    <img src={previewUrl} alt="Product preview" className="image-preview" />
                  </div>
                )}
                <div className="upload-btn-wrap">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    id="product-image-input"
                    className="file-input-hidden"
                  />
                  <label htmlFor="product-image-input" className="admin-outline-btn">
                    📷 {previewUrl ? "Change Artwork Image" : "Upload High-Res Photo"}
                  </label>
                  <small className="file-hint">JPG, PNG, WebP up to 10MB supported</small>
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="form-group full-width toggles-box">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="featured"
                  checked={form.featured}
                  onChange={handleChange}
                />
                <span>Feature this product in spotlight sections</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={form.isAvailable}
                  onChange={handleChange}
                />
                <span>Available for purchase on storefront</span>
              </label>
            </div>
          </div>

          <div className="form-actions-row">
            <Link to="/admin" className="admin-outline-btn">
              Cancel
            </Link>
            <button type="submit" disabled={saving} className="admin-primary-btn">
              {saving
                ? "Saving to Catalog..."
                : mode === "edit"
                ? "Save Changes"
                : "Publish Product to Store"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}