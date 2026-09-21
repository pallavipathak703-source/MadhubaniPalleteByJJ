const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

const router = express.Router();

// CREATE ORDER (COD Deprecated & Disabled; Online payments must go through /api/payment)
router.post("/", async (req, res) => {
  const { paymentMethod } = req.body;

  if (
    !paymentMethod ||
    paymentMethod === "COD" ||
    (typeof paymentMethod === "string" && paymentMethod.toLowerCase() === "cod")
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Cash on Delivery (COD) is no longer supported. Please proceed with secure online payment.",
    });
  }

  return res.status(400).json({
    success: false,
    message:
      "Direct unverified order creation is disabled. Please initialize your payment through /api/payment/create-order.",
  });
});

// GET ALL ORDERS (ADMIN ONLY)
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
});

// GET SINGLE ORDER (ADMIN ONLY)
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
});

// UPDATE ORDER STATUS (ADMIN ONLY)
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
});

module.exports = router;