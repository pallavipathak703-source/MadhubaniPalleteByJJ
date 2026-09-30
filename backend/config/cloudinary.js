const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "mtsvpbtq",
  api_key: process.env.CLOUDINARY_API_KEY || "378946189878945",
  api_secret: process.env.CLOUDINARY_API_SECRET || "_vUJKbYojwEuAUgLouI6-Fei3PY",
});

module.exports = cloudinary;