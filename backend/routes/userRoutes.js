const express = require("express");
const {
  getUsers,
  registerUser,
  loginUser
} = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/users -> fetch all users
// This route is protected, so the user must send a valid JWT token
router.get("/", protect, getUsers);

// POST /api/users/register -> create a new user account
router.post("/register", registerUser);

// POST /api/users/login -> login and receive a JWT token
router.post("/login", loginUser);

module.exports = router;
