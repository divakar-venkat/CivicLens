const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const connectDB = require("./config/db");

// Load env
dotenv.config();

// Connect DB
connectDB();

const app = express();

// Multer configuration
const upload = multer({
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

// Routes
app.use("/api/complaints", upload.array("media", 3), require("./routes/complaintRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🔥 Server running on http://localhost:${PORT}`)
);