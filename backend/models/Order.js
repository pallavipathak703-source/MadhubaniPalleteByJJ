const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: false,
        default: "",
        trim: true,
        lowercase: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      address: {
        type: String,
        required: true,
        trim: true,
      },
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },

        image: {
          type: String,
          default: "",
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded", "Awaiting Verification"],
      default: "Pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "Online", "UPI"],
      default: "UPI",
    },

    paymentGateway: {
      type: String,
      enum: ["Razorpay", "COD", "Manual", "UPI"],
      default: "UPI",
    },

    paymentOrderId: {
      type: String,
      trim: true,
      index: true,
    },

    paymentId: {
      type: String,
      trim: true,
      index: true,
    },

    paymentSignature: {
      type: String,
      trim: true,
    },

    paymentVerifiedAt: {
      type: Date,
    },

    paymentError: {
      type: String,
      trim: true,
    },

    subtotalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    shippingAmount: {
      type: Number,
      default: 100,
      min: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundId: {
      type: String,
      trim: true,
    },

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;