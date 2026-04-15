const Complaint = require("../models/Complaint");
const classifyIssue = require("../services/aiService");

// Create Complaint
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, location } = req.body;
    const userId = req.user?.userId; // Get from JWT token

    // Parse location from FormData (comes as JSON string)
    let parsedLocation = {};
    try {
      if (typeof location === "string") {
        parsedLocation = JSON.parse(location);
      } else {
        parsedLocation = location || {};
      }
    } catch (e) {
      parsedLocation = {
        address: typeof location === "string" ? location : "Not specified",
      };
    }

    // Ensure location has proper structure
    const finalLocation = {
      lat: parsedLocation.lat || null,
      lng: parsedLocation.lng || null,
      address: parsedLocation.address || "Not specified",
    };

    // Handle media files - store as plain base64 strings
    let media = [];
    if (req.files && req.files.length > 0) {
      media = req.files.map((file) => file.buffer.toString("base64"));
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
      location: finalLocation,
      category: finalCategory,
      severity,
      createdBy: userId,
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

// Helper function to get department based on category
const getDepartmentByCategory = (category) => {
  const departmentMap = {
    pothole: "PWD",
    garbage: "Waste Management",
    streetlight: "Electricity",
    water: "Water Supply",
    parking: "Traffic Police",
    dumping: "Municipal Corp",
    other: "Unassigned",
  };
  return departmentMap[category] || "Unassigned";
};

// Update Complaint (status and department)
exports.updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, department } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Update status
    if (status) {
      complaint.status = status;
      // Set resolvedAt when status changes to resolved
      if (status === "resolved" && !complaint.resolvedAt) {
        complaint.resolvedAt = new Date();
      }
    }

    // Update department
    if (department) {
      complaint.department = department;
    }

    await complaint.save();
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upvote Complaint
exports.upvoteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { $inc: { upvotes: 1 } },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add Comment to Complaint
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      {
        $push: {
          comments: {
            text: text.trim(),
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};