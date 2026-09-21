const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("../../models/Product");
dotenv.config();

const products = [
  {
    name: "Men's Kurta",
    description:
      "Authentic Madhubani hand-painted men's kurta in traditional Mithila art style.",
    price: 1500,
    priceType: "fixed",
    category: "Clothing",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: true,
    tags: ["Madhubani", "Hand Painted", "Men", "Kurta", "Traditional"],
  },

  {
    name: "Ladies Long Kurti",
    description:
      "Beautiful Madhubani hand-painted ladies long kurti.",
    price: 1300,
    priceType: "fixed",
    category: "Clothing",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Hand Painted", "Women", "Kurti"],
  },

  {
    name: "Kurti + Pant",
    description:
      "Madhubani hand-painted kurti with matching pant.",
    price: 1500,
    priceType: "fixed",
    category: "Clothing",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Kurti", "Pant", "Hand Painted"],
  },

  {
    name: "Kurti + Pant + Dupatta",
    description:
      "Complete Madhubani hand-painted kurti, pant and dupatta set.",
    price: 2500,
    priceType: "fixed",
    category: "Clothing",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: true,
    tags: ["Madhubani", "Kurti", "Pant", "Dupatta", "Full Set"],
  },

  {
    name: "Short Kurti",
    description:
      "Madhubani hand-painted short kurti.",
    price: 1300,
    priceType: "fixed",
    category: "Clothing",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Short Kurti", "Hand Painted"],
  },

  {
    name: "Silk Saree",
    description:
      "Beautiful Madhubani hand-painted silk saree.",
    price: 9500,
    priceType: "fixed",
    category: "Sarees",
    artist: "Janvi Jha",
    images: [],
    stock: 5,
    isAvailable: true,
    featured: true,
    tags: ["Madhubani", "Silk", "Saree", "Hand Painted"],
  },

  {
    name: "Cotton Silk Saree",
    description:
      "Madhubani hand-painted cotton silk saree.",
    price: 5000,
    priceType: "fixed",
    category: "Sarees",
    artist: "Janvi Jha",
    images: [],
    stock: 5,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Cotton Silk", "Saree"],
  },

  {
    name: "Khadi Cotton Dupatta",
    description:
      "Madhubani hand-painted Khadi cotton dupatta.",
    price: 900,
    priceType: "starting",
    category: "Dupattas",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Khadi Cotton", "Dupatta"],
  },

  {
    name: "Cotton Silk Dupatta",
    description:
      "Madhubani hand-painted cotton silk dupatta.",
    price: 1500,
    priceType: "starting",
    category: "Dupattas",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Cotton Silk", "Dupatta"],
  },

  {
    name: "Silk Bandhani Dupatta",
    description:
      "Beautiful Madhubani hand-painted silk Bandhani dupatta.",
    price: 1800,
    priceType: "fixed",
    category: "Dupattas",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Silk", "Bandhani", "Dupatta"],
  },

  {
    name: "Canvas Bag",
    description:
      "Madhubani hand-painted canvas bag.",
    price: 1500,
    priceType: "fixed",
    category: "Bags & Accessories",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Canvas", "Bag"],
  },

  {
    name: "Sling Bag",
    description:
      "Madhubani hand-painted sling bag.",
    price: 500,
    priceType: "fixed",
    category: "Bags & Accessories",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Sling Bag"],
  },

  {
    name: "Side Bag",
    description:
      "Madhubani hand-painted side bag.",
    price: 500,
    priceType: "fixed",
    category: "Bags & Accessories",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Side Bag"],
  },

  {
    name: "Kolkata Bag",
    description:
      "Madhubani hand-painted Kolkata bag.",
    price: 450,
    priceType: "fixed",
    category: "Bags & Accessories",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Kolkata Bag"],
  },

  {
    name: "Canvas Clutch",
    description:
      "Madhubani hand-painted canvas clutch.",
    price: 1300,
    priceType: "fixed",
    category: "Bags & Accessories",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Canvas", "Clutch"],
  },

  {
    name: "Folder",
    description:
      "Madhubani hand-painted folder.",
    price: 300,
    priceType: "fixed",
    category: "Bags & Accessories",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Folder"],
  },

  {
    name: "Men's Wallet",
    description:
      "Madhubani hand-painted men's wallet.",
    price: 300,
    priceType: "fixed",
    category: "Bags & Accessories",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Wallet", "Men"],
  },

  {
    name: "Women's Clutch",
    description:
      "Madhubani hand-painted women's clutch.",
    price: 450,
    priceType: "fixed",
    category: "Bags & Accessories",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Clutch", "Women"],
  },

  {
    name: "Laptop Bag",
    description:
      "Madhubani hand-painted laptop bag.",
    price: 600,
    priceType: "fixed",
    category: "Bags & Accessories",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Laptop Bag"],
  },

  {
    name: "Tote Bag",
    description:
      "Madhubani hand-painted tote bag.",
    price: 550,
    priceType: "fixed",
    category: "Bags & Accessories",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Tote Bag"],
  },

  {
    name: "Small Earrings",
    description:
      "Beautiful Madhubani hand-painted small earrings.",
    price: 90,
    priceType: "fixed",
    category: "Jewellery",
    artist: "Janvi Jha",
    images: [],
    stock: 20,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Earrings", "Jewellery"],
  },

  {
    name: "Big Beads Earrings",
    description:
      "Madhubani hand-painted big beads earrings.",
    price: 200,
    priceType: "fixed",
    category: "Jewellery",
    artist: "Janvi Jha",
    images: [],
    stock: 20,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Beads", "Earrings"],
  },

  {
    name: "Jewellery Set",
    description:
      "Madhubani hand-painted necklace and earrings set.",
    price: 500,
    priceType: "fixed",
    category: "Jewellery",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: true,
    tags: ["Madhubani", "Jewellery", "Necklace", "Earrings"],
  },

  {
    name: "Hairpin",
    description:
      "Madhubani hand-painted decorative hairpin.",
    price: 150,
    priceType: "fixed",
    category: "Jewellery",
    artist: "Janvi Jha",
    images: [],
    stock: 20,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Hairpin"],
  },

  {
    name: "Hair Stick",
    description:
      "Madhubani hand-painted decorative hair stick.",
    price: 170,
    priceType: "fixed",
    category: "Jewellery",
    artist: "Janvi Jha",
    images: [],
    stock: 20,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Hair Stick"],
  },

  {
    name: "Bookmark",
    description:
      "Madhubani hand-painted bookmark.",
    price: 80,
    priceType: "fixed",
    category: "Essentials / Gifts",
    artist: "Janvi Jha",
    images: [],
    stock: 20,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Bookmark", "Gift"],
  },

  {
    name: "Coasters",
    description:
      "Madhubani hand-painted decorative coasters.",
    price: 500,
    priceType: "fixed",
    category: "Home Decor",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Coasters", "Home Decor"],
  },

  {
    name: "Handkerchief",
    description:
      "Madhubani hand-painted handkerchief.",
    price: 90,
    priceType: "fixed",
    category: "Essentials / Gifts",
    artist: "Janvi Jha",
    images: [],
    stock: 20,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Handkerchief", "Gift"],
  },

  {
    name: "Tray",
    description:
      "Madhubani hand-painted decorative tray.",
    price: 700,
    priceType: "fixed",
    category: "Home Decor",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Tray", "Home Decor"],
  },

  {
    name: "Coin Pouch",
    description:
      "Madhubani hand-painted coin pouch.",
    price: 90,
    priceType: "fixed",
    category: "Essentials / Gifts",
    artist: "Janvi Jha",
    images: [],
    stock: 20,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Coin Pouch", "Gift"],
  },

  {
    name: "Diary",
    description:
      "Madhubani hand-painted diary.",
    price: 350,
    priceType: "fixed",
    category: "Essentials / Gifts",
    artist: "Janvi Jha",
    images: [],
    stock: 20,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Diary", "Gift"],
  },

  {
    name: "Key Holder",
    description:
      "Madhubani hand-painted key holder.",
    price: 600,
    priceType: "fixed",
    category: "Home Decor",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "Key Holder", "Home Decor"],
  },

  {
    name: "Toran",
    description:
      "Beautiful Madhubani hand-painted toran for home decor.",
    price: 650,
    priceType: "fixed",
    category: "Home Decor",
    artist: "Janvi Jha",
    images: [],
    stock: 10,
    isAvailable: true,
    featured: true,
    tags: ["Madhubani", "Toran", "Home Decor"],
  },

  {
    name: "Kohbar Painting",
    description:
      "Traditional Madhubani hand-painted Kohbar painting.",
    price: 2000,
    priceType: "fixed",
    category: "Madhubani Paintings / Artwork",
    artist: "Janvi Jha",
    images: [],
    stock: 5,
    isAvailable: true,
    featured: true,
    tags: ["Madhubani", "Kohbar", "Painting", "Artwork"],
  },

  {
    name: "Ram Darbar Painting",
    description:
      "Authentic Madhubani hand-painted Ram Darbar painting.",
    price: 2000,
    priceType: "fixed",
    category: "Madhubani Paintings / Artwork",
    artist: "Janvi Jha",
    images: [],
    stock: 5,
    isAvailable: true,
    featured: true,
    tags: ["Madhubani", "Ram Darbar", "Painting", "Artwork"],
  },

  {
    name: "Dashavatar & Navdurga",
    description:
      "Traditional Madhubani hand-painted Dashavatar and Navdurga artwork.",
    price: 4000,
    priceType: "fixed",
    category: "Madhubani Paintings / Artwork",
    artist: "Janvi Jha",
    images: [],
    stock: 5,
    isAvailable: true,
    featured: true,
    tags: ["Madhubani", "Dashavatar", "Navdurga", "Painting"],
  },

  {
    name: "Madhubani Artwork A0",
    description:
      "Hand-painted authentic Madhubani artwork, A0 size (84.1 × 118.9 cm).",
    price: 2500,
    priceType: "fixed",
    category: "Madhubani Paintings / Artwork",
    artist: "Janvi Jha",
    images: [],
    stock: 5,
    isAvailable: true,
    featured: true,
    tags: ["Madhubani", "A0", "Artwork"],
  },

  {
    name: "Madhubani Artwork A1",
    description:
      "Hand-painted authentic Madhubani artwork, A1 size (59.4 × 84.1 cm).",
    price: 2000,
    priceType: "fixed",
    category: "Madhubani Paintings / Artwork",
    artist: "Janvi Jha",
    images: [],
    stock: 5,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "A1", "Artwork"],
  },

  {
    name: "Madhubani Artwork A2",
    description:
      "Hand-painted authentic Madhubani artwork, A2 size (42 × 59.4 cm).",
    price: 1500,
    priceType: "fixed",
    category: "Madhubani Paintings / Artwork",
    artist: "Janvi Jha",
    images: [],
    stock: 5,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "A2", "Artwork"],
  },

  {
    name: "Madhubani Artwork A3",
    description:
      "Hand-painted authentic Madhubani artwork, A3 size (29.7 × 42 cm).",
    price: 1000,
    priceType: "fixed",
    category: "Madhubani Paintings / Artwork",
    artist: "Janvi Jha",
    images: [],
    stock: 5,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "A3", "Artwork"],
  },

  {
    name: "Madhubani Artwork A4",
    description:
      "Hand-painted authentic Madhubani artwork, A4 size (21 × 29.7 cm).",
    price: 500,
    priceType: "fixed",
    category: "Madhubani Paintings / Artwork",
    artist: "Janvi Jha",
    images: [],
    stock: 5,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "A4", "Artwork"],
  },

  {
    name: "Madhubani Artwork A5",
    description:
      "Hand-painted authentic Madhubani artwork, A5 size (14.8 × 21 cm).",
    price: 350,
    priceType: "fixed",
    category: "Madhubani Paintings / Artwork",
    artist: "Janvi Jha",
    images: [],
    stock: 5,
    isAvailable: true,
    featured: false,
    tags: ["Madhubani", "A5", "Artwork"],
  },
];

// ==========================================
// SEED DATABASE
// ==========================================

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected Successfully");

    // Existing products ko delete nahi karenge
    // Sirf naye products add honge.
    for (const productData of products) {
      const existingProduct = await Product.findOne({
        name: productData.name,
      });

      if (existingProduct) {
        console.log(`Already exists: ${productData.name}`);
      } else {
        await Product.create(productData);
        console.log(`Added: ${productData.name}`);
      }
    }

    console.log("=================================");
    console.log("Products seeding completed!");
    console.log(`Total products in seed list: ${products.length}`);
    console.log("=================================");

    process.exit(0);
  } catch (error) {
    console.error("Seed Error:", error.message);
    process.exit(1);
  }
};

seedDatabase();