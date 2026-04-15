const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    title: String,
    description: String,

    media: [String],

    location: {
      lat: Number,
      lng: Number,
      address: String,
    },

    category: {
      type: String,
      enum: [
        "pothole",
        "garbage",
        "streetlight",
        "water",
        "parking",
        "dumping",
        "other",
      ],
      default: "other",
    },

    severity: {
      type: Number,
      default: 1,
    },

    status: {
      type: String,
      enum: ["submitted", "in_progress", "resolved"],
      default: "submitted",
    },

    upvotes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);