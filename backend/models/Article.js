const mongoose = require("mongoose");

// This schema defines how an article document will look in MongoDB
const articleSchema = new mongoose.Schema(
  {
    // This links each article to the user who created or saved it
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Title of the article
    title: {
      type: String,
      required: true
    },

    // Original article link
    url: {
      type: String,
      required: true
    },

    // Estimated reading time in minutes
    readingTime: {
      type: Number,
      required: true
    },

    // Total time spent reading this article in minutes
    // We start from 0 and update it as the user reads
    timeSpent: {
      type: Number,
      default: 0
    },

    // If the user schedules an article for later,
    // this stores the exact date and time when it should return
    scheduledAt: {
      type: Date,
      default: null
    },

    // This stores when the user was last notified about the article
    // It helps keep the notification flow explicit and easy to inspect
    notifiedAt: {
      type: Date,
      default: null
    },

    // Current progress status of the article
    status: {
      type: String,
      enum: ["saved", "reading", "scheduled", "completed"],
      default: "saved"
    }
  },
  {
    // Adds createdAt and updatedAt automatically
    timestamps: true
  }
);

module.exports = mongoose.model("Article", articleSchema);
