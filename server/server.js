const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const connectDB = require("./config/db");
const { createAdminUser, createDemoUser } = require("./scripts/setupUsers");

// Load env
dotenv.config();

// Connect DB
connectDB();

const app = express();

// Multer configuration - use memory storage for files
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed"));
    }
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 CivicLens API Running");
});

// Test Cloudinary Upload
app.post("/api/test-upload", upload.single("file"), async (req, res) => {
  const { uploadToCloudinary } = require("./utils/cloudinaryUpload");

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    console.log("Testing Cloudinary upload...");
    console.log("File:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    const url = await uploadToCloudinary(req.file.buffer, req.file.mimetype);

    res.json({
      message: "Upload successful!",
      url,
      file: req.file.originalname,
    });
  } catch (error) {
    console.error("Test upload error:", error);
    res.status(500).json({
      message: "Upload failed",
      error: error.message,
    });
  }
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/complaints", upload.array("media", 3), require("./routes/complaintRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);

  // Create default users on startup
  try {
    await createAdminUser();
    await createDemoUser();
  } catch (error) {
    console.error("Error creating default users:", error);
  }
});