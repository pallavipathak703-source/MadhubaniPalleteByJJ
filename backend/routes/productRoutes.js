const express = require("express");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");

const router = express.Router();

const getPublicImageUrl = (result) =>
  `https://res.cloudinary.com/${cloudinary.config().cloud_name}/image/upload/v${result.version}/${result.public_id}${result.format ? `.${result.format}` : ""}`;

// ==========================================
// CREATE PRODUCT (ADMIN ONLY)
// ==========================================
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      priceType,
      category,
      artist,
      stock,
      isAvailable,
      featured,
      tags,
    } = req.body;

    // Required fields
    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, description, price and category are required",
      });
    }

    // ==========================================
    // IMAGES
    // ==========================================
    let images = [];

    // Accept existing Cloudinary images through JSON
    if (req.body.images) {
      try {
        images =
          typeof req.body.images === "string"
            ? JSON.parse(req.body.images)
            : req.body.images;

        if (!Array.isArray(images)) {
          images = [];
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid images format",
        });
      }
    }

    // ==========================================
    // UPLOAD IMAGE TO CLOUDINARY
    // ==========================================
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "madhubani-palette/products",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        stream.end(req.file.buffer);
      });

      images.push({
        url: getPublicImageUrl(result),
        public_id: result.public_id,
      });
    }

    // ==========================================
    // CREATE PRODUCT
    // ==========================================
    const product = await Product.create({
      name,
      description,
      price: Number(price),

      priceType:
        priceType === "starting"
          ? "starting"
          : "fixed",

      category,

      artist: artist || "Janvi Jha",

      images,

      stock:
        stock !== undefined
          ? Number(stock)
          : 1,

      isAvailable:
        isAvailable === undefined
          ? true
          : isAvailable === true || isAvailable === "true",

      featured:
        featured === undefined
          ? false
          : featured === true || featured === "true",

      tags:
        tags
          ? typeof tags === "string"
            ? tags.split(",").map((tag) => tag.trim())
            : tags
          : [],
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Product creation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
});

// ==========================================
// GET ALL PRODUCTS
// ==========================================
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    }).lean();

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
});

// ==========================================
// GET SINGLE PRODUCT
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Increase views
    product.views += 1;
    await product.save();

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get single product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
});

// ==========================================
// UPDATE PRODUCT (ADMIN ONLY)
// ==========================================
router.put("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ==========================================
    // UPDATE IMAGE
    // ==========================================
    if (req.file) {
      // Delete old Cloudinary image
      if (
        product.images &&
        product.images.length > 0 &&
        product.images[0].public_id &&
        product.images[0].public_id !== "placeholder-product"
      ) {
        try {
          await cloudinary.uploader.destroy(
            product.images[0].public_id
          );
        } catch (error) {
          console.error(
            "Old image delete error:",
            error.message
          );
        }
      }

      // Upload new image
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "madhubani-palette/products",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        stream.end(req.file.buffer);
      });

      product.images = [
        {
          url: getPublicImageUrl(result),
          public_id: result.public_id,
        },
      ];
    } else if (req.body.images !== undefined) {
      try {
        const incomingImages =
          typeof req.body.images === "string"
            ? JSON.parse(req.body.images)
            : req.body.images;

        if (Array.isArray(incomingImages)) {
          product.images = incomingImages
            .map((img) => ({
              url: img && img.url ? String(img.url) : "",
              public_id: img && img.public_id ? String(img.public_id) : "external-image",
            }))
            .filter((img) => img.url);
        }
      } catch (error) {
        console.error("Invalid images format:", error.message);
      }
    } else if (req.body.image) {
      const imageUrl = String(req.body.image).trim();

      if (imageUrl) {
        product.images = [
          {
            url: imageUrl,
            public_id: "external-image",
          },
        ];
      }
    }

    // ==========================================
    // UPDATE OTHER FIELDS
    // ==========================================
    if (req.body.name !== undefined) {
      product.name = req.body.name;
    }

    if (req.body.description !== undefined) {
      product.description = req.body.description;
    }

    if (req.body.price !== undefined) {
      product.price = Number(req.body.price);
    }

    if (req.body.priceType !== undefined) {
      product.priceType =
        req.body.priceType === "starting"
          ? "starting"
          : "fixed";
    }

    if (req.body.category !== undefined) {
      product.category = req.body.category;
    }

    if (req.body.artist !== undefined) {
      product.artist = req.body.artist;
    }

    if (req.body.stock !== undefined) {
      product.stock = Number(req.body.stock);
    }

    if (req.body.isAvailable !== undefined) {
      product.isAvailable =
        req.body.isAvailable === true ||
        req.body.isAvailable === "true";
    }

    if (req.body.featured !== undefined) {
      product.featured =
        req.body.featured === true ||
        req.body.featured === "true";
    }

    if (req.body.tags !== undefined) {
      product.tags =
        typeof req.body.tags === "string"
          ? req.body.tags
              .split(",")
              .map((tag) => tag.trim())
          : req.body.tags;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Product update error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
});

// ==========================================
// DELETE PRODUCT (ADMIN ONLY)
// ==========================================
router.delete("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.public_id && image.public_id !== "sample") {
          try {
            await cloudinary.uploader.destroy(
              image.public_id
            );
          } catch (cloudinaryError) {
            console.error(
              "Cloudinary delete error:",
              cloudinaryError.message
            );
          }
        }
      }
    }

    // Delete product from MongoDB
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
});

module.exports = router;