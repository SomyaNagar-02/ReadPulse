const axios = require("axios");
const cheerio = require("cheerio");
const Article = require("../models/Article");

// This helper fetches the article page and estimates reading time from real text
// If scraping fails for any reason, it falls back to 5 minutes
const estimateReadingTimeFromUrl = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 ReadPulseBot"
      }
    });

    const $ = cheerio.load(response.data);

    // Remove elements that usually do not belong to the main readable content
    $("script, style, noscript").remove();

    // Extract visible text from the page and normalize spacing
    const text = $("body").text().replace(/\s+/g, " ").trim();
    const words = text.split(" ").filter(Boolean).length;

    // Reading time is based on 200 words per minute
    // Keep at least 1 minute even for short pages
    return Math.max(1, Math.ceil(words / 200));
  } catch (error) {
    // If scraping fails, return a simple safe default
    return 5;
  }
};

// These are the only valid article status values
const allowedStatuses = ["saved", "reading", "scheduled", "completed"];

// This simple threshold prevents marking an article as completed too early
// We keep it small and easy to understand: at least 1 minute of reading
const completionThreshold = 1;

// This helper builds a simple MongoDB filter for the logged-in user's articles
// It is reused by both the queue API and the all-articles API
const buildArticleFilter = (userId, query) => {
  const { status, keyword } = query;

  const filter = {
    user: userId
  };

  // If a valid status is sent in the query, filter by that status
  if (status && allowedStatuses.includes(status)) {
    filter.status = status;
  }

  // If a keyword is sent, search inside the article title
  if (keyword) {
    filter.title = { $regex: keyword, $options: "i" };
  }

  return filter;
};

// Add a new article for the logged-in user
const createArticle = async (req, res, next) => {
  try {
    const { title, url } = req.body;

    // Validate the required fields before saving to MongoDB
    if (!title || !url) {
      return res.status(400).json({
        message: "Title and url are required"
      });
    }

    // Estimate reading time from the actual article HTML
    // If scraping fails, the helper returns a default of 5 minutes
    const readingTime = await estimateReadingTimeFromUrl(url);

    // Save the article and connect it to the logged-in user
    // req.userId is added by the JWT auth middleware
    const article = await Article.create({
      user: req.userId,
      title,
      url,
      readingTime,
      timeSpent: 0
    });

    res.status(201).json({
      message: "Article added successfully",
      article
    });
  } catch (error) {
    next(error);
  }
};

// Fetch articles for the logged-in user
const getUserArticles = async (req, res, next) => {
  try {
    const filter = {
      user: req.userId,
      $or: [
        { status: "saved" },
        {
          status: "scheduled",
          scheduledAt: { $lte: new Date() }
        }
      ]
    };

    // Optional title search still works, but queue membership stays behavior-driven
    if (req.query.keyword) {
      filter.title = { $regex: req.query.keyword, $options: "i" };
    }

    const articles = await Article.find(filter)
      // Scheduled articles that are due are surfaced by the earliest time first
      // If times are similar, older articles are shown before newer ones
      .sort({ scheduledAt: 1, createdAt: 1 })
      // Limit keeps the response small and returns only 5 articles
      .limit(5);

    res.status(200).json(articles);
  } catch (error) {
    next(error);
  }
};

// Fetch all articles for the logged-in user
const getAllUserArticles = async (req, res, next) => {
  try {
    const filter = buildArticleFilter(req.userId, req.query);

    const articles = await Article.find(filter)
      // Scheduled items are grouped by their planned time, then by age
      .sort({ scheduledAt: 1, createdAt: 1 });

    res.status(200).json(articles);
  } catch (error) {
    next(error);
  }
};

// Suggest a few articles that fit inside the user's available reading time
const getReadingSuggestions = async (req, res, next) => {
  try {
    const minutes = Number(req.query.minutes);

    // The extension sends minutes after the user picks 5, 10, or 30
    if (!minutes || minutes <= 0) {
      return res.status(400).json({
        message: "minutes must be a positive number"
      });
    }

    const articles = await Article.find({
      user: req.userId,
      readingTime: { $lte: minutes },
      $or: [
        { status: "saved" },
        {
          status: "scheduled",
          scheduledAt: { $lte: new Date() }
        }
      ]
    })
      // Older eligible articles are nudged first so the reading list does not go stale
      .sort({ scheduledAt: 1, createdAt: 1 })
      .limit(3);

    res.status(200).json(articles);
  } catch (error) {
    next(error);
  }
};

// Update the status of an article for the logged-in user
const updateArticleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, timeSpent } = req.body;

    // Validate the new status before updating the article
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Status must be saved, reading, scheduled, or completed"
      });
    }

    // If timeSpent is sent, it must be a valid number and not negative
    if (timeSpent !== undefined) {
      if (typeof timeSpent !== "number" || timeSpent < 0) {
        return res.status(400).json({
          message: "timeSpent must be a number greater than or equal to 0"
        });
      }
    }

    // Find the article by id and make sure it belongs to the logged-in user
    const article = await Article.findOne({
      _id: id,
      user: req.userId
    });

    if (!article) {
      return res.status(404).json({
        message: "Article not found"
      });
    }

    // Store the new reading time if the client sends it
    // This keeps reading tracking simple and tied to the same update flow
    if (timeSpent !== undefined) {
      article.timeSpent = timeSpent;
    }

    // To keep the rule simple, an article can be completed only after
    // the user has spent at least the minimum threshold reading it
    if (status === "completed" && article.timeSpent <= completionThreshold) {
      return res.status(400).json({
        message: `Spend more than ${completionThreshold} minute reading before marking as completed`
      });
    }

    // Update the status field and save the changes
    article.status = status;

    // If the article moves away from scheduled mode, clear the scheduled time
    if (status !== "scheduled") {
      article.scheduledAt = null;
    }

    await article.save();

    res.status(200).json({
      message: "Article status updated successfully",
      article
    });
  } catch (error) {
    next(error);
  }
};

// Schedule an article for a future time
const scheduleArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { scheduledAt } = req.body;

    // Validate that a date value was actually sent
    if (!scheduledAt) {
      return res.status(400).json({
        message: "scheduledAt is required"
      });
    }

    const scheduledDate = new Date(scheduledAt);

    // Invalid dates become "Invalid Date", so check that before saving
    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        message: "Please provide a valid scheduled date"
      });
    }

    const article = await Article.findOne({
      _id: id,
      user: req.userId
    });

    if (!article) {
      return res.status(404).json({
        message: "Article not found"
      });
    }

    // Scheduling means the article should be reintroduced later
    article.status = "scheduled";
    article.scheduledAt = scheduledDate;
    await article.save();

    res.status(200).json({
      message: "Article scheduled successfully",
      article
    });
  } catch (error) {
    next(error);
  }
};

// Delete an article for the logged-in user
const deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the article by id and user so users can delete only their own articles
    const article = await Article.findOneAndDelete({
      _id: id,
      user: req.userId
    });

    if (!article) {
      return res.status(404).json({
        message: "Article not found"
      });
    }

    res.status(200).json({
      message: "Article deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createArticle,
  getUserArticles,
  getAllUserArticles,
  getReadingSuggestions,
  updateArticleStatus,
  scheduleArticle,
  deleteArticle
};
