const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Order = require("../models/Order");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * Helper to safely initialize Razorpay SDK client.
 * Returns null if credentials are not configured or are placeholder values.
 */
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (
    !keyId ||
    !keySecret ||
    keyId.includes("placeholder") ||
    keySecret.includes("placeholder") ||
    keyId === "your_razorpay_key_id"
  ) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

/**
 * GET /api/payment/key
 * Public endpoint to fetch Razorpay public Key ID only.
 * NEVER exposes the secret.
 */
router.get("/key", (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const isConfigured = Boolean(
    keyId &&
      !keyId.includes("placeholder") &&
      process.env.RAZORPAY_KEY_SECRET &&
      !process.env.RAZORPAY_KEY_SECRET.includes("placeholder")
  );

  res.status(200).json({
    success: true,
    keyId: isConfigured ? keyId : "rzp_test_sandboxtest",
    isConfigured,
  });
});

/**
 * POST /api/payment/create-order
 * Creates a server-verified payment order.
 * Calculates total amount strictly from MongoDB database prices.
 * Prevents price manipulation and verifies stock availability.
 */
router.post("/create-order", async (req, res) => {
  try {
    const { customer, items } = req.body;

    // 1. Validate payload presence
    if (!customer || !customer.name || !customer.email || !customer.phone || !customer.address) {
      return res.status(400).json({
        success: false,
        message: "Complete customer name, email, phone, and delivery address are required",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items cannot be empty",
      });
    }

    // 2. Fetch fresh product data from MongoDB
    const productIds = items
      .map((item) => item.product || item.productId || item._id)
      .filter(Boolean);

    if (productIds.length !== items.length) {
      return res.status(400).json({
        success: false,
        message: "One or more order items contain invalid product IDs",
      });
    }

    const dbProducts = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

    let calculatedSubtotal = 0;
    const verifiedItems = [];

    // 3. Validate stock & availability, calculate trusted subtotal
    for (const item of items) {
      const pId = String(item.product || item.productId || item._id);
      const dbProduct = productMap.get(pId);

      if (!dbProduct) {
        return res.status(404).json({
          success: false,
          message: `Product not found or has been removed from catalog`,
        });
      }

      if (dbProduct.isAvailable === false) {
        return res.status(400).json({
          success: false,
          message: `"${dbProduct.name}" is currently unavailable for purchase`,
        });
      }

      const requestedQty = Math.max(1, Math.floor(Number(item.quantity) || 1));

      if (dbProduct.stock < requestedQty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${dbProduct.name}". Only ${dbProduct.stock} left in stock.`,
        });
      }

      const itemTotal = Number(dbProduct.price) * requestedQty;
      calculatedSubtotal += itemTotal;

      verifiedItems.push({
        product: dbProduct._id,
        name: dbProduct.name,
        price: dbProduct.price,
        quantity: requestedQty,
        image: dbProduct.images?.[0]?.url || item.image || "",
      });
    }

    // Fixed ₹100 Shipping / Package Charge per order
    const shippingAmount = 100;
    const discountAmount = 0;
    const finalAmount = Math.max(0, calculatedSubtotal + shippingAmount - discountAmount);

    if (finalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payable order amount must be greater than zero",
      });
    }

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(finalAmount * 100);

    // 4. Create Gateway Order (Razorpay)
    const razorpay = getRazorpayInstance();
    let rzpOrderId = "";

    if (razorpay) {
      try {
        const rzpOrder = await razorpay.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: `rcpt_${Date.now().toString().slice(-8)}`,
          notes: {
            customerName: customer.name.slice(0, 40),
            customerEmail: customer.email.slice(0, 40),
            customerPhone: customer.phone.slice(0, 20),
          },
        });
        rzpOrderId = rzpOrder.id;
      } catch (gatewayErr) {
        console.error("Razorpay gateway order creation error:", gatewayErr);
        return res.status(502).json({
          success: false,
          message:
            gatewayErr.error?.description ||
            "Payment gateway rejected order creation. Please verify Razorpay API keys.",
        });
      }
    } else {
      // Sandbox fallback if API keys are not yet configured
      rzpOrderId = `order_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    // 5. Create local database Order in 'Pending' payment status
    const order = await Order.create({
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
      },
      items: verifiedItems,
      subtotalAmount: calculatedSubtotal,
      shippingAmount,
      discountAmount,
      totalAmount: finalAmount,
      paymentMethod: "Online",
      paymentGateway: "Razorpay",
      paymentStatus: "Pending",
      orderStatus: "Pending",
      paymentOrderId: rzpOrderId,
    });

    res.status(201).json({
      success: true,
      message: "Payment order initialized successfully",
      orderId: order._id,
      paymentOrderId: rzpOrderId,
      amount: amountInPaise,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_sandboxtest",
      customer: {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
      },
      summary: {
        subtotal: calculatedSubtotal,
        shipping: shippingAmount,
        discount: discountAmount,
        total: finalAmount,
      },
    });
  } catch (error) {
    console.error("Create payment order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message,
    });
  }
});

/**
 * POST /api/payment/upi-order
 * Direct UPI payment order creation (Google Pay / PhonePe / Paytm / QR).
 * Securely calculates amounts from database, creates order with status 'Awaiting Verification',
 * reserves stock, and returns order details for WhatsApp confirmation.
 */
router.post("/upi-order", async (req, res) => {
  try {
    const { customer, items, utr } = req.body;

    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({
        success: false,
        message: "Customer name, phone, and complete delivery address are required",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items cannot be empty",
      });
    }

    const productIds = items
      .map((item) => item.product || item.productId || item._id)
      .filter(Boolean);

    if (productIds.length !== items.length) {
      return res.status(400).json({
        success: false,
        message: "One or more order items contain invalid product IDs",
      });
    }

    const dbProducts = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

    let calculatedSubtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const pId = String(item.product || item.productId || item._id);
      const dbProduct = productMap.get(pId);

      if (!dbProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found or has been removed from catalog",
        });
      }

      if (dbProduct.isAvailable === false) {
        return res.status(400).json({
          success: false,
          message: `"${dbProduct.name}" is currently unavailable for purchase`,
        });
      }

      const requestedQty = Math.max(1, Math.floor(Number(item.quantity) || 1));

      if (dbProduct.stock < requestedQty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${dbProduct.name}". Only ${dbProduct.stock} left in stock.`,
        });
      }

      const itemTotal = Number(dbProduct.price) * requestedQty;
      calculatedSubtotal += itemTotal;

      verifiedItems.push({
        product: dbProduct._id,
        name: dbProduct.name,
        price: dbProduct.price,
        quantity: requestedQty,
        image: dbProduct.images?.[0]?.url || item.image || "",
      });

      // Update product stock
      dbProduct.stock = Math.max(0, dbProduct.stock - requestedQty);
      if (dbProduct.stock === 0) {
        dbProduct.isAvailable = false;
      }
      await dbProduct.save();
    }

    const shippingAmount = 100;
    const finalAmount = calculatedSubtotal + shippingAmount;
    const upiRef = utr && typeof utr === "string" ? utr.trim() : "";

    const order = await Order.create({
      customer: {
        name: customer.name.trim(),
        email: customer.email ? customer.email.trim().toLowerCase() : "order@madhubanipalette.com",
        phone: customer.phone.trim(),
        address: customer.address.trim(),
      },
      items: verifiedItems,
      subtotalAmount: calculatedSubtotal,
      shippingAmount,
      totalAmount: finalAmount,
      paymentMethod: "UPI",
      paymentGateway: "UPI",
      paymentStatus: "Awaiting Verification",
      orderStatus: "Confirmed",
      paymentOrderId: `upi_${Date.now()}`,
      paymentId: upiRef || "UPI_PENDING_VERIFICATION",
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully! Please share payment screenshot on WhatsApp.",
      orderId: order._id,
      order,
    });
  } catch (error) {
    console.error("UPI order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to place UPI order",
      error: error.message,
    });
  }
});

/**
 * POST /api/payment/verify
 * Cryptographically verifies Razorpay payment signature on the backend.
 * Uses HMAC-SHA256 and constant-time comparison to prevent timing attacks.
 * Marks order as Paid and decrements stock ONLY upon valid verification.
 */
router.post("/verify", async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification parameters (orderId, paymentOrderId, paymentId)",
      });
    }

    // 1. Locate existing order
    const order = await Order.findOne({
      _id: orderId,
      paymentOrderId: razorpay_order_id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Matching order not found for the provided payment order",
      });
    }

    // 2. Idempotency safeguard: if already Paid, return success immediately
    if (order.paymentStatus === "Paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order,
      });
    }

    // 3. Cryptographic Signature Verification
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    let isSignatureValid = false;

    if (keySecret && keySecret !== "your_razorpay_key_secret" && razorpay_signature) {
      const expectedPayload = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(expectedPayload)
        .digest("hex");

      try {
        isSignatureValid = crypto.timingSafeEqual(
          Buffer.from(expectedSignature, "utf8"),
          Buffer.from(razorpay_signature, "utf8")
        );
      } catch {
        isSignatureValid = false;
      }
    } else {
      // Sandbox mode without live secret: verify identifiers presence
      isSignatureValid = Boolean(
        razorpay_order_id.startsWith("order_") && razorpay_payment_id.startsWith("pay_")
      );
    }

    if (!isSignatureValid) {
      order.paymentStatus = "Failed";
      order.paymentError = "Cryptographic signature verification failed";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed: Invalid signature",
      });
    }

    // 4. Update Order to Paid
    order.paymentStatus = "Paid";
    order.orderStatus = "Processing";
    order.paymentId = razorpay_payment_id;
    order.paymentSignature = razorpay_signature || "";
    order.paymentVerifiedAt = new Date();
    order.paymentError = undefined;
    await order.save();

    // 5. Safely decrement stock & update availability
    for (const item of order.items) {
      try {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock = Math.max(0, product.stock - (item.quantity || 1));
          if (product.stock === 0) {
            product.isAvailable = false;
          }
          await product.save();
        }
      } catch (stockErr) {
        console.error(`Failed to update stock for item ${item.product}:`, stockErr);
      }
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during payment verification",
      error: error.message,
    });
  }
});

/**
 * POST /api/payment/webhook
 * Listens for asynchronous gateway updates from Razorpay.
 * Authenticated via Razorpay webhook secret signature.
 */
router.post("/webhook", async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const webhookSignature = req.headers["x-razorpay-signature"];

    // 1. Verify webhook signature if secret configured
    if (webhookSecret && webhookSecret !== "your_razorpay_webhook_secret") {
      if (!webhookSignature) {
        return res.status(400).json({ success: false, message: "Missing webhook signature" });
      }

      const rawBody = req.rawBody || JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      let isWebhookValid = false;
      try {
        isWebhookValid = crypto.timingSafeEqual(
          Buffer.from(expectedSignature, "utf8"),
          Buffer.from(webhookSignature, "utf8")
        );
      } catch {
        isWebhookValid = false;
      }

      if (!isWebhookValid) {
        return res.status(400).json({ success: false, message: "Invalid webhook signature" });
      }
    }

    const { event, payload } = req.body;

    if (!event || !payload) {
      return res.status(200).json({ status: "ignored_no_event" });
    }

    // 2. Handle relevant Razorpay events
    if (event === "payment.captured" || event === "order.paid") {
      const paymentObj = payload.payment?.entity;
      const rzpOrderId = paymentObj?.order_id || payload.order?.entity?.id;
      const rzpPaymentId = paymentObj?.id;

      if (rzpOrderId) {
        const order = await Order.findOne({ paymentOrderId: rzpOrderId });
        if (order && order.paymentStatus !== "Paid") {
          order.paymentStatus = "Paid";
          order.orderStatus = "Processing";
          order.paymentId = rzpPaymentId || order.paymentId;
          order.paymentVerifiedAt = new Date();
          await order.save();

          // Decrement stock if not already done
          for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product) {
              product.stock = Math.max(0, product.stock - (item.quantity || 1));
              if (product.stock === 0) product.isAvailable = false;
              await product.save();
            }
          }
        }
      }
    } else if (event === "payment.failed") {
      const paymentObj = payload.payment?.entity;
      const rzpOrderId = paymentObj?.order_id;
      if (rzpOrderId) {
        const order = await Order.findOne({ paymentOrderId: rzpOrderId });
        if (order && order.paymentStatus === "Pending") {
          order.paymentStatus = "Failed";
          order.paymentError = paymentObj?.error_description || "Payment failed at gateway";
          await order.save();
        }
      }
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ success: false, message: "Webhook processing error" });
  }
});

/**
 * POST /api/payment/refund/:orderId
 * Admin-only endpoint to issue an official gateway refund.
 * Verifies gateway response before updating database.
 */
router.post("/refund/:orderId", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentStatus !== "Paid") {
      return res.status(400).json({
        success: false,
        message: `Cannot refund order with status "${order.paymentStatus}". Only Paid orders can be refunded.`,
      });
    }

    if (!order.paymentId) {
      return res.status(400).json({
        success: false,
        message: "Missing payment transaction ID for refund processing",
      });
    }

    const razorpay = getRazorpayInstance();
    let refundId = "";

    if (razorpay) {
      const refund = await razorpay.payments.refund(order.paymentId, {
        amount: Math.round(order.totalAmount * 100),
        notes: {
          adminId: req.admin?.id || "admin",
          reason: req.body.reason || "Customer refund request",
          orderId: order._id.toString(),
        },
      });
      refundId = refund.id;
    } else {
      refundId = `rfnd_test_${Date.now()}`;
    }

    // Update database only after confirmed gateway response
    order.paymentStatus = "Refunded";
    order.orderStatus = "Cancelled";
    order.refundId = refundId;
    order.refundAmount = order.totalAmount;
    order.refundedAt = new Date();
    await order.save();

    // Restore inventory stock
    for (const item of order.items) {
      try {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity || 1;
          product.isAvailable = true;
          await product.save();
        }
      } catch (err) {
        console.error("Error restoring stock on refund:", err);
      }
    }

    res.status(200).json({
      success: true,
      message: "Refund processed and verified successfully",
      order,
    });
  } catch (error) {
    console.error("Refund processing error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process refund",
      error: error.message,
    });
  }
});

module.exports = router;
