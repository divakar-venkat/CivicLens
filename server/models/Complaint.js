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

    department: {
      type: String,
      enum: [
        "PWD",
        "Waste Management",
        "Electricity",
        "Water Supply",
        "Traffic Police",
        "Municipal Corp",
        "Unassigned",
      ],
      default: "Unassigned",
    },

    upvotes: {
      type: Number,
      default: 0,
    },

    comments: [
      {
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    resolvedAt: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);