const mongoose = require("mongoose");
const Product = require("../models/Product");
require("dotenv").config();

const products = [
  // ==================== PAINTINGS / ARTWORK ====================

  {
    name: "Madhubani Artwork A0",
    description: "Authentic hand-painted Madhubani artwork. Size: 84.1 × 118.9 cm.",
    price: 2500,
    priceType: "fixed",
    category: "Madhubani Paintings / Artwork",
    artist: "Janvi Jha",
    images: [],
    stock: 5,
    isAvailable: true,
    featured: true,
    tags: ["Madhubani", "Painting", "Hand-Painted", "A0"]
  },

  {
    name: "Madhubani Artwork A1",
    description: "Authentic hand-painted Madhubani artwork. Size: 59.4 × 84.1 cm.",
    price: 2000,
    priceType: "fixed",
    category: "Madhubani Paintings / Artwork",
    artist: "Janvi Jha",
    images: [],
    stock: 5,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Painting", "Hand-Painted", "A1"]
  },

  {
    name: "Madhubani Artwork A2",
    description: "Authentic hand-painted Madhubani artwork. Size: 42 × 59.4 cm.",
    price: 1500,
    priceType: "fixed",
    category: "Madhubani Paintings / Artwork",
    artist: "Janvi Jha",
    images: [],
    stock: 5,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Painting", "Hand-Painted", "A2"]
  },

  {
    name: "Madhubani Artwork A3",
    description: "Authentic hand-painted Madhubani artwork. Size: 29.7 × 42 cm.",
    price: 1000,
    priceType: "fixed",
    category: "Madhubani Paintings / Artwork",
    artist: "Janvi Jha",
    images: [],
    stock: 5,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Painting", "Hand-Painted", "A3"]
  },

  {
    name: "Madhubani Artwork A4",
    description: "Authentic hand-painted Madhubani artwork. Size: 21 × 29.7 cm.",
    price: 500,
    priceType: "fixed",
    category: "Madhubani Paintings / Artwork",
    artist: "Janvi Jha",
    images: [],
    stock: 5,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Painting", "Hand-Painted", "A4"]
  },

  {
    name: "Madhubani Artwork A5",
    description: "Authentic hand-painted Madhubani artwork. Size: 14.8 × 21 cm.",
    price: 350,
    priceType: "fixed",
    category: "Madhubani Paintings / Artwork",
    artist: "Janvi Jha",
    images: [],
    stock: 5,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Painting", "Hand-Painted", "A5"]
  },

  {
    name: "Ram Darbar Madhubani Painting",
    description: "Authentic Madhubani hand-painted Ram Darbar painting. Size: A0.",
    price: 2000,
    priceType: "fixed",
    category: "Madhubani Paintings / Artwork",
    artist: "Janvi Jha",
    images: [],
    stock: 1,
    isAvailable: true,
    featured: true,
    tags: ["Ram Darbar", "Madhubani", "Painting", "A0"]
  },

  {
    name: "Kohbar Madhubani Painting",
    description: "Traditional hand-painted Madhubani Kohbar painting in authentic Mithila style. Size: A0.",
    price: 2000,
    priceType: "fixed",
    category: "Madhubani Paintings / Artwork",
    artist: "Janvi Jha",
    images: [],
    stock: 1,
    isAvailable: true,
    featured: true,
    tags: ["Kohbar", "Madhubani", "Mithila", "Painting"]
  },

  {
    name: "Dashavatar & Navdurga Madhubani Painting",
    description: "Traditional Madhubani hand-painted artwork featuring Dashavatar and Navdurga. Size: 90 × 110 cm.",
    price: 4000,
    priceType: "fixed",
    category: "Madhubani Paintings / Artwork",
    artist: "Janvi Jha",
    images: [],
    stock: 1,
    isAvailable: true,
    featured: true,
    tags: ["Dashavatar", "Navdurga", "Madhubani", "Mithila", "Hand-Painted"]
  },

  // ==================== CLOTHING ====================

  {
    name: "Men's Madhubani Hand-Painted Kurta",
    description: "Traditional men's kurta with authentic Madhubani hand-painted artwork.",
    price: 1500,
    priceType: "fixed",
    category: "Clothing",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: true,
    tags: ["Kurta", "Men", "Madhubani", "Hand-Painted"]
  },

  {
    name: "Ladies Long Kurti",
    description: "Beautiful Madhubani hand-painted ladies long kurti. Unstitched.",
    price: 1300,
    priceType: "fixed",
    category: "Clothing",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Kurti", "Women", "Madhubani", "Hand-Painted"]
  },

  {
    name: "Madhubani Kurti + Pant",
    description: "Hand-painted Madhubani kurti with pant. Unstitched.",
    price: 1500,
    priceType: "fixed",
    category: "Clothing",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Kurti", "Pant", "Women", "Madhubani"]
  },

  {
    name: "Madhubani Kurti + Pant + Dupatta Full Set",
    description: "Complete Madhubani hand-painted kurti, pant and dupatta full set.",
    price: 2500,
    priceType: "fixed",
    category: "Clothing",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: true,
    tags: ["Kurti", "Pant", "Dupatta", "Full Set", "Madhubani"]
  },

  {
    name: "Madhubani Short Kurti",
    description: "Beautiful short kurti with Madhubani hand-painted detailing. Unstitched.",
    price: 1300,
    priceType: "fixed",
    category: "Clothing",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Short Kurti", "Women", "Madhubani"]
  },

  // ==================== SAREES ====================

  {
    name: "Madhubani Hand-Painted Silk Saree",
    description: "Beautiful hand-painted Madhubani silk saree, perfect for weddings and special occasions. Comes with blouse piece and complimentary earrings.",
    price: 9500,
    priceType: "fixed",
    category: "Sarees",
    artist: "Janvi Jha",
    images: [],
    stock: 5,
    isAvailable: true,
    featured: true,
    tags: ["Silk Saree", "Wedding", "Madhubani", "Hand-Painted"]
  },

  {
    name: "Madhubani Cotton Silk Saree",
    description: "Beautiful hand-painted Madhubani cotton silk saree. Starting price ₹5,000.",
    price: 5000,
    priceType: "starting",
    category: "Sarees",
    artist: "Janvi Jha",
    images: [],
    stock: 5,
    isAvailable: true,
    featured: true,
    tags: ["Cotton Silk", "Saree", "Madhubani", "Hand-Painted"]
  },

  // ==================== DUPATTAS ====================

  {
    name: "Madhubani Khadi Cotton Dupatta",
    description: "Hand-painted Madhubani Khadi cotton dupatta. Starting price ₹900.",
    price: 900,
    priceType: "starting",
    category: "Dupattas",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Khadi", "Cotton", "Dupatta", "Madhubani"]
  },

  {
    name: "Madhubani Cotton Silk Dupatta",
    description: "Hand-painted Madhubani cotton silk dupatta. Starting price ₹1,500.",
    price: 1500,
    priceType: "starting",
    category: "Dupattas",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: true,
    tags: ["Cotton Silk", "Dupatta", "Madhubani"]
  },

  {
    name: "Madhubani Silk Bandhani Dupatta",
    description: "Beautiful hand-painted Madhubani Silk Bandhani dupatta.",
    price: 1800,
    priceType: "fixed",
    category: "Dupattas",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Silk", "Bandhani", "Dupatta", "Madhubani"]
  },

  // ==================== BAGS & ACCESSORIES ====================

  {
    name: "Madhubani Canvas Bag",
    description: "Hand-painted Madhubani canvas bag.",
    price: 1500,
    priceType: "fixed",
    category: "Bags & Accessories",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: true,
    tags: ["Canvas Bag", "Madhubani", "Hand-Painted"]
  },

  {
    name: "Madhubani Sling Bag",
    description: "Hand-painted Madhubani sling bag.",
    price: 500,
    priceType: "fixed",
    category: "Bags & Accessories",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Sling Bag", "Madhubani"]
  },

  {
    name: "Madhubani Side Bag",
    description: "Hand-painted Madhubani side bag.",
    price: 500,
    priceType: "fixed",
    category: "Bags & Accessories",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Side Bag", "Madhubani"]
  },

  {
    name: "Madhubani Kolkata Bag",
    description: "Traditional hand-painted Madhubani Kolkata bag.",
    price: 450,
    priceType: "fixed",
    category: "Bags & Accessories",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Kolkata Bag", "Madhubani"]
  },

  {
    name: "Madhubani Canvas Clutch",
    description: "Beautiful hand-painted Madhubani canvas clutch.",
    price: 1300,
    priceType: "fixed",
    category: "Bags & Accessories",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: true,
    tags: ["Canvas Clutch", "Clutch", "Madhubani"]
  },

  {
    name: "Madhubani Folder",
    description: "Hand-painted Madhubani folder.",
    price: 300,
    priceType: "fixed",
    category: "Bags & Accessories",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Folder", "Madhubani"]
  },

  {
    name: "Madhubani Men's Wallet",
    description: "Hand-painted Madhubani men's wallet.",
    price: 300,
    priceType: "fixed",
    category: "Bags & Accessories",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Wallet", "Men", "Madhubani"]
  },

  {
    name: "Madhubani Women's Clutch",
    description: "Hand-painted Madhubani women's clutch.",
    price: 450,
    priceType: "fixed",
    category: "Bags & Accessories",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Clutch", "Women", "Madhubani"]
  },

  {
    name: "Madhubani Laptop Bag",
    description: "Hand-painted Madhubani laptop bag.",
    price: 600,
    priceType: "fixed",
    category: "Bags & Accessories",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Laptop Bag", "Madhubani"]
  },

  {
    name: "Madhubani Tote Bag",
    description: "Hand-painted Madhubani tote bag.",
    price: 550,
    priceType: "fixed",
    category: "Bags & Accessories",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Tote Bag", "Madhubani"]
  },

  {
    name: "Madhubani Coin Pouch",
    description: "Small hand-painted Madhubani coin pouch.",
    price: 90,
    priceType: "fixed",
    category: "Bags & Accessories",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Coin Pouch", "Madhubani"]
  },

  // ==================== JEWELLERY ====================

  {
    name: "Madhubani Small Earrings",
    description: "Uniquely hand-painted Madhubani small earrings.",
    price: 90,
    priceType: "fixed",
    category: "Jewellery",
    artist: "Janvi Jha",
    images: [],
    stock: 20,
    isAvailable: true,
    featured: false,
    tags: ["Earrings", "Jewellery", "Madhubani"]
  },

  {
    name: "Madhubani Big Beads Earrings",
    description: "Beautiful hand-painted big beads earrings in Madhubani style.",
    price: 200,
    priceType: "fixed",
    category: "Jewellery",
    artist: "Janvi Jha",
    images: [],
    stock: 20,
    isAvailable: true,
    featured: false,
    tags: ["Earrings", "Beads", "Jewellery", "Madhubani"]
  },

  {
    name: "Madhubani Jewellery Set",
    description: "Hand-painted Madhubani jewellery set including necklace and earrings.",
    price: 500,
    priceType: "fixed",
    category: "Jewellery",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: true,
    tags: ["Jewellery Set", "Necklace", "Earrings", "Madhubani"]
  },

  {
    name: "Madhubani Hairpin",
    description: "Uniquely hand-painted Madhubani hairpin.",
    price: 150,
    priceType: "fixed",
    category: "Jewellery",
    artist: "Janvi Jha",
    images: [],
    stock: 20,
    isAvailable: true,
    featured: false,
    tags: ["Hairpin", "Madhubani"]
  },

  {
    name: "Madhubani Hair Stick",
    description: "Hand-painted Madhubani hair stick.",
    price: 170,
    priceType: "fixed",
    category: "Jewellery",
    artist: "Janvi Jha",
    images: [],
    stock: 20,
    isAvailable: true,
    featured: false,
    tags: ["Hair Stick", "Madhubani"]
  },

  // ==================== HOME DECOR ====================

  {
    name: "Madhubani Key Holder",
    description: "Hand-painted Madhubani key holder.",
    price: 600,
    priceType: "fixed",
    category: "Home Decor",
    artist: "Janvi Jha",
    images: [],
    stock: 5,
    isAvailable: true,
    featured: false,
    tags: ["Key Holder", "Home Decor", "Madhubani"]
  },

  {
    name: "Madhubani Hand-Painted Toran",
    description: "Beautiful handcrafted Madhubani toran. Size: 39 inches.",
    price: 650,
    priceType: "fixed",
    category: "Home Decor",
    artist: "Janvi Jha",
    images: [],
    stock: 5,
    isAvailable: true,
    featured: true,
    tags: ["Toran", "Home Decor", "Madhubani", "39 inches"]
  },

  {
    name: "Madhubani Hand-Painted Coasters",
    description: "Set of beautiful hand-painted Madhubani coasters.",
    price: 500,
    priceType: "fixed",
    category: "Home Decor",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Coasters", "Home Decor", "Madhubani"]
  },

  {
    name: "Madhubani Hand-Painted Tray",
    description: "Beautiful hand-painted Madhubani tray.",
    price: 700,
    priceType: "fixed",
    category: "Home Decor",
    artist: "Janvi Jha",
    images: [],
    stock: 5,
    isAvailable: true,
    featured: false,
    tags: ["Tray", "Home Decor", "Madhubani"]
  },

  // ==================== ESSENTIALS / GIFTS ====================

  {
    name: "Madhubani Hand-Painted Bookmark",
    description: "Beautiful hand-painted Madhubani bookmark.",
    price: 80,
    priceType: "fixed",
    category: "Essentials / Gifts",
    artist: "Janvi Jha",
    images: [],
    stock: 50,
    isAvailable: true,
    featured: false,
    tags: ["Bookmark", "Gift", "Madhubani"]
  },

  {
    name: "Madhubani Hand-Painted Handkerchief",
    description: "Hand-painted Madhubani handkerchief.",
    price: 90,
    priceType: "fixed",
    category: "Essentials / Gifts",
    artist: "Janvi Jha",
    images: [],
    stock: 20,
    isAvailable: true,
    featured: false,
    tags: ["Handkerchief", "Gift", "Madhubani"]
  },

  {
    name: "Madhubani Diary",
    description: "Beautiful diary featuring authentic Madhubani hand-painted artwork.",
    price: 350,
    priceType: "fixed",
    category: "Essentials / Gifts",
    artist: "Janvi Jha",
    images: [],
    stock: 20,
    isAvailable: true,
    featured: false,
    tags: ["Diary", "Gift", "Madhubani"]
  }
];

const seedProducts = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected Successfully");

    await Product.deleteMany({});

    console.log("Old products removed");

    // Always send a positive numeric price to MongoDB. This prevents the
    // schema default (0) from being used when a price is missing or invalid.
    const productsWithValidPrices = products.map((product) => {
      const price = Number(product.price);

      return {
        ...product,
        price: Number.isFinite(price) && price > 0 ? price : 1500,
        images: Array.isArray(product.images) && product.images.length > 0
          ? product.images
          : [{
              url: "/images/placeholder-product.jpg",
              public_id: "placeholder-product"
            }]
      };
    });

    const insertedProducts = await Product.insertMany(productsWithValidPrices);

    console.log(
      `${insertedProducts.length} products inserted successfully`
    );

    await mongoose.connection.close();

    console.log("Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding products:");
    console.error(error);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    process.exit(1);
  }
};

seedProducts();