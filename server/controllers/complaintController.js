const Complaint = require("../models/Complaint");
const classifyIssue = require("../services/aiService");

// Create Complaint
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, location } = req.body;

    // Handle media files
    let media = [];
    if (req.files && req.files.length > 0) {
      media = req.files.map((file) => ({
        data: file.buffer.toString("base64"),
        type: file.mimetype,
        uploaded: new Date(),
      }));
    }

    // Determine category: use provided or auto-classify
    let finalCategory = category;
    let severity = 3;

    if (!finalCategory) {
      const classified = classifyIssue(description);
      finalCategory = classified.category;
      severity = classified.severity;
    } else {
      // Auto-classify severity based on description
      const classified = classifyIssue(description);
      severity = classified.severity;
    }

    const complaint = await Complaint.create({
      title,
      description,
      media,
      location,
      category: finalCategory,
      severity,
    });

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Complaints with filtering
exports.getComplaints = async (req, res) => {
  try {
    const { category, status, severity } = req.query;

    let filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }
    if (status) {
      filter.status = status;
    }
    if (severity) {
      filter.severity = { $gte: parseInt(severity) };
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};