const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    urlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Url",
      required: true,
    },

    browser: {
      type: String,
      default: "Unknown",
    },

        device: {
      type: String,
      default: "Unknown",
    },

    country: {
      type: String,
      default: "United States",
    },

    visitedAt: {
      type: Date,
      default: Date.now,
    },
    isQr: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Visit", visitSchema);