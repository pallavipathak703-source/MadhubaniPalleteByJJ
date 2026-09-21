const express = require("express");
const Product = require("../models/Product");
const Interaction = require("../models/Interaction");

const router = express.Router();

// GET RECOMMENDATIONS FOR A USER
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user's previous interactions
    const interactions = await Interaction.find({ userId })
      .populate("product")
      .sort({ createdAt: -1 })
      .limit(20);

    // If user has no interactions, return featured products
    if (interactions.length === 0) {
      const featuredProducts = await Product.find({
        featured: true,
        isAvailable: true,
      })
        .sort({ createdAt: -1 })
        .limit(10);

      return res.status(200).json({
        success: true,
        type: "featured",
        recommendations: featuredProducts,
      });
    }

    // Collect categories and tags from interacted products
    const categories = [];
    const tags = [];

    interactions.forEach((interaction) => {
      if (interaction.product) {
        if (interaction.product.category) {
          categories.push(interaction.product.category);
        }

        if (interaction.product.tags) {
          tags.push(...interaction.product.tags);
        }
      }
    });

    // Remove duplicates
    const uniqueCategories = [...new Set(categories)];
    const uniqueTags = [...new Set(tags)];

    // Find similar products
    const recommendations = await Product.find({
      isAvailable: true,
      $or: [
        { category: { $in: uniqueCategories } },
        { tags: { $in: uniqueTags } },
      ],
    })
      .sort({ featured: -1, views: -1, createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      type: "personalized",
      recommendations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate recommendations",
      error: error.message,
    });
  }
});

// RECORD USER INTERACTION
router.post("/interaction", async (req, res) => {
  try {
    const { userId, productId, type, score } = req.body;

    if (!userId || !productId || !type) {
      return res.status(400).json({
        success: false,
        message: "userId, productId and type are required",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const interaction = await Interaction.create({
      userId,
      product: productId,
      type,
      score: score || 1,
    });

    res.status(201).json({
      success: true,
      message: "Interaction recorded",
      interaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to record interaction",
      error: error.message,
    });
  }
});

module.exports = router;