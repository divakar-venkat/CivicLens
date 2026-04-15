const express = require("express");
const router = express.Router();

const {
  createComplaint,
  getComplaints,
  updateComplaint,
  upvoteComplaint,
  addComment,
} = require("../controllers/complaintController");

const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

// POST - create complaint (requires auth)
router.post("/", verifyToken, createComplaint);

// GET - all complaints
router.get("/", getComplaints);

// PUT - update complaint status and department (requires admin)
router.put("/:id", verifyToken, requireAdmin, updateComplaint);

// PATCH - upvote complaint (requires auth)
router.patch("/:id/upvote", verifyToken, upvoteComplaint);

// POST - add comment to complaint (requires auth)
router.post("/:id/comment", verifyToken, addComment);

module.exports = router;