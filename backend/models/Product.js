const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    priceType: {
      type: String,
      enum: ["fixed", "starting"],
      default: "fixed",
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Madhubani Paintings / Artwork",
        "Clothing",
        "Sarees",
        "Dupattas",
        "Bags & Accessories",
        "Jewellery",
        "Home Decor",
        "Essentials / Gifts",
      ],
    },

    artist: {
      type: String,
      default: "Janvi Jha",
      trim: true,
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;