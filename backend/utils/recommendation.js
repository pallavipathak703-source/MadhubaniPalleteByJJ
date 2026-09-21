const Product = require("../models/Product");
const Interaction = require("../models/Interaction");

const getRecommendations = async (userId, limit = 10) => {
  try {
    const interactions = await Interaction.find({ userId })
      .populate("product")
      .sort({ createdAt: -1 })
      .limit(20);

    // New user → featured/popular products
    if (interactions.length === 0) {
      return await Product.find({
        isAvailable: true,
      })
        .sort({ featured: -1, views: -1, createdAt: -1 })
        .limit(limit);
    }

    const categories = [];
    const tags = [];
    const interactedProductIds = [];

    interactions.forEach((interaction) => {
      if (!interaction.product) return;

      interactedProductIds.push(interaction.product._id);

      if (interaction.product.category) {
        categories.push(interaction.product.category);
      }

      if (interaction.product.tags) {
        tags.push(...interaction.product.tags);
      }
    });

    const uniqueCategories = [...new Set(categories)];
    const uniqueTags = [...new Set(tags)];

    const recommendations = await Product.find({
      isAvailable: true,

      // Don't recommend products the user already interacted with
      _id: { $nin: interactedProductIds },

      $or: [
        { category: { $in: uniqueCategories } },
        { tags: { $in: uniqueTags } },
      ],
    })
      .sort({
        featured: -1,
        views: -1,
        createdAt: -1,
      })
      .limit(limit);

    // If no similar products are found
    if (recommendations.length === 0) {
      return await Product.find({
        isAvailable: true,
        _id: { $nin: interactedProductIds },
      })
        .sort({ featured: -1, views: -1, createdAt: -1 })
        .limit(limit);
    }

    return recommendations;
  } catch (error) {
    console.error("Recommendation error:", error.message);
    return [];
  }
};

module.exports = {
  getRecommendations,
};