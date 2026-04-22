const dotenv = require("dotenv");
dotenv.config();

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

console.log("Testing Cloudinary Configuration...");
console.log("Cloud Name:", process.env.CLOUD_NAME);
console.log("API Key:", process.env.API_KEY ? "✓ Set" : "✗ Missing");
console.log("API Secret:", process.env.API_SECRET ? "✓ Set" : "✗ Missing");

// Test with a simple base64 image
const testBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAAA//EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8EAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=";

cloudinary.uploader.upload(
  testBase64,
  {
    folder: "test_civic_issues",
    resource_type: "image",
  },
  (error, result) => {
    if (error) {
      console.error("❌ Upload failed:", error);
      process.exit(1);
    } else {
      console.log("✅ Upload successful!");
      console.log("URL:", result.secure_url);
      console.log("Public ID:", result.public_id);
      process.exit(0);
    }
  }
);
