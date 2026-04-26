const express = require("express");
const {
  createArticle,
  getUserArticles,
  getAllUserArticles,
  getReadingSuggestions,
  updateArticleStatus,
  scheduleArticle,
  deleteArticle
} = require("../controllers/articleController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/articles -> fetch only the logged-in user's articles
// The route is protected and returns only 5 oldest articles
router.get("/", protect, getUserArticles);

// GET /api/articles/all -> fetch all articles for the logged-in user
// This route supports search and status filtering without the 5-item limit
router.get("/all", protect, getAllUserArticles);

// GET /api/articles/suggestions?minutes=10 -> suggest articles that fit the time
// This is used by the Chrome extension's time-based reading nudge
router.get("/suggestions", protect, getReadingSuggestions);

// POST /api/articles -> add a new article
// The route is protected, so a valid JWT token is required
router.post("/", protect, createArticle);

// POST /api/articles/add -> add a new article
// This route uses the same logic as the main create article route
router.post("/add", protect, createArticle);

// PUT /api/articles/:id/status -> update an article status
// The route is protected and only allows valid status values
router.put("/:id/status", protect, updateArticleStatus);

// PUT /api/articles/schedule/:id -> schedule an article for later
// The route is protected and stores a scheduled date/time
router.put("/schedule/:id", protect, scheduleArticle);

// DELETE /api/articles/:id -> delete an article
// The route is protected and only deletes articles owned by the logged-in user
router.delete("/:id", protect, deleteArticle);

module.exports = router;
