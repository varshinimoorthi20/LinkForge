const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    originalUrl: {
      type: String,
      required: true,
    },

    shortCode: {
      type: String,
      required: true,
      unique: true,
    },

    clickCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    category: {
      type: String,
      enum: ["Technology", "Education", "Social Media", "Shopping", "Entertainment", "News", "Uncategorized"],
      default: "Uncategorized",
    },
    healthStatus: {
      type: String,
      enum: ["Healthy", "Slow", "Down", "Unknown"],
      default: "Unknown",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Url", urlSchema);