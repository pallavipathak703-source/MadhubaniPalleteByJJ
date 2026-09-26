const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Product = require("../models/Product");
const Order = require("../models/Order");
const auth = require("../middleware/auth");

const router = express.Router();

// ADMIN REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingAdmin = await Admin.findOne({
      email: email.toLowerCase(),
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Admin registration failed",
      error: error.message,
    });
  }
});

// ADMIN LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase(),
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET || "your_super_secret_key_change_this",
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Admin login failed",
      error: error.message,
    });
  }
});

// ==========================================
// CURRENT ADMIN PROFILE
// ==========================================
router.get("/me", auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    res.status(200).json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// UPDATE ADMIN PROFILE / PASSWORD
// ==========================================
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    if (name) {
      admin.name = name.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: "Current password is required to set new password" });
      }
      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Current password is incorrect" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
      }
      admin.password = await bcrypt.hash(newPassword, 10);
    }

    await admin.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// ADMIN DASHBOARD OVERVIEW METRICS
// ==========================================
router.get("/dashboard", auth, async (req, res) => {
  try {
    const [products, orders] = await Promise.all([
      Product.find().lean(),
      Order.find().sort({ createdAt: -1 }).lean(),
    ]);

    // Calculate metrics
    const totalProducts = products.length;
    const totalOrders = orders.length;

    let totalRevenue = 0;
    let pendingOrders = 0;
    const customerEmails = new Set();

    for (const o of orders) {
      totalRevenue += Number(o.totalAmount || 0);
      if (o.orderStatus === "Pending") {
        pendingOrders++;
      }
      if (o.customer?.email) {
        customerEmails.add(o.customer.email.toLowerCase().trim());
      }
    }

    const totalCustomers = customerEmails.size;

    // Low stock items (stock <= 3)
    const lowStockProducts = products
      .filter((p) => typeof p.stock === "number" && p.stock <= 3)
      .slice(0, 10);

    const lowStockCount = products.filter(
      (p) => typeof p.stock === "number" && p.stock <= 3
    ).length;

    const outOfStockCount = products.filter(
      (p) => typeof p.stock === "number" && p.stock === 0
    ).length;

    // Recent 6 orders
    const recentOrders = orders.slice(0, 6);

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        pendingOrders,
        lowStockCount,
        outOfStockCount,
      },
      recentOrders,
      lowStockProducts,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ success: false, message: "Failed to load dashboard metrics", error: error.message });
  }
});

// ==========================================
// ADMIN SALES ANALYTICS
// ==========================================
router.get("/analytics", auth, async (req, res) => {
  try {
    const { period = "30d" } = req.query;

    const now = new Date();
    let startDate = new Date();

    if (period === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "7d") {
      startDate.setDate(now.getDate() - 7);
    } else if (period === "30d") {
      startDate.setDate(now.getDate() - 30);
    } else if (period === "this_month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === "this_year") {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      startDate = new Date(0); // all time
    }

    const orders = await Order.find({
      createdAt: { $gte: startDate },
    }).sort({ createdAt: 1 }).lean();

    // Group revenue & orders by date (YYYY-MM-DD)
    const dateMap = new Map();
    const statusCounts = {};
    const categoryRevenue = {};
    let totalRevenue = 0;

    for (const o of orders) {
      totalRevenue += Number(o.totalAmount || 0);

      // Status distribution
      const st = o.orderStatus || "Pending";
      statusCounts[st] = (statusCounts[st] || 0) + 1;

      // Date trend
      const d = new Date(o.createdAt).toISOString().split("T")[0];
      if (!dateMap.has(d)) {
        dateMap.set(d, { date: d, revenue: 0, orders: 0 });
      }
      const entry = dateMap.get(d);
      entry.revenue += Number(o.totalAmount || 0);
      entry.orders += 1;

      // Category breakdown from items
      if (Array.isArray(o.items)) {
        for (const item of o.items) {
          const cat = item.category || "General";
          categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (Number(item.price || 0) * Number(item.quantity || 1));
        }
      }
    }

    const timeline = Array.from(dateMap.values());
    const averageOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

    res.status(200).json({
      success: true,
      period,
      totalOrders: orders.length,
      totalRevenue,
      averageOrderValue,
      timeline,
      statusCounts,
      categoryRevenue,
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    res.status(500).json({ success: false, message: "Failed to load analytics", error: error.message });
  }
});

// ==========================================
// ADMIN CUSTOMER DIRECTORY (AGGREGATED FROM REAL ORDERS)
// ==========================================
router.get("/customers", auth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();

    const customerMap = new Map();

    for (const o of orders) {
      const email = (o.customer?.email || "").toLowerCase().trim();
      if (!email) continue;

      if (!customerMap.has(email)) {
        customerMap.set(email, {
          name: o.customer.name || "Customer",
          email: email,
          phone: o.customer.phone || "",
          address: o.customer.address || "",
          totalOrders: 0,
          totalSpent: 0,
          firstOrderDate: o.createdAt,
          lastOrderDate: o.createdAt,
          orders: [],
        });
      }

      const c = customerMap.get(email);
      c.totalOrders += 1;
      c.totalSpent += Number(o.totalAmount || 0);
      if (new Date(o.createdAt) > new Date(c.lastOrderDate)) {
        c.lastOrderDate = o.createdAt;
      }
      if (new Date(o.createdAt) < new Date(c.firstOrderDate)) {
        c.firstOrderDate = o.createdAt;
      }
      c.orders.push({
        _id: o._id,
        totalAmount: o.totalAmount,
        orderStatus: o.orderStatus,
        createdAt: o.createdAt,
        itemCount: Array.isArray(o.items) ? o.items.length : 0,
      });
    }

    const customers = Array.from(customerMap.values()).sort(
      (a, b) => new Date(b.lastOrderDate) - new Date(a.lastOrderDate)
    );

    res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Admin customers error:", error);
    res.status(500).json({ success: false, message: "Failed to load customers", error: error.message });
  }
});

// ==========================================
// ADMIN INVENTORY QUICK STOCK UPDATE
// ==========================================
router.patch("/inventory/:id", auth, async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock === undefined || isNaN(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid non-negative stock number is required",
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    product.stock = Number(stock);
    if (product.stock === 0) {
      product.isAvailable = false;
    } else if (product.stock > 0 && product.isAvailable === false) {
      product.isAvailable = true;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: `Stock updated to ${product.stock}`,
      product: {
        _id: product._id,
        name: product.name,
        stock: product.stock,
        isAvailable: product.isAvailable,
      },
    });
  } catch (error) {
    console.error("Inventory update error:", error);
    res.status(500).json({ success: false, message: "Failed to update stock", error: error.message });
  }
});

module.exports = router;