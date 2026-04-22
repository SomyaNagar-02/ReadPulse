const express = require("express");
const { registerUser, loginUser } = require("../controllers/userController");

const router = express.Router();

// POST /api/auth/register -> create a new user account
router.post("/register", registerUser);

// POST /api/auth/login -> login and receive a JWT token
router.post("/login", loginUser);

module.exports = router;
