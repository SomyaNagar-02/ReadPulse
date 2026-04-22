// Loads environment variables from the .env file
require("dotenv").config();

const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const articleRoutes = require("./routes/articleRoutes");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

// Connect to MongoDB before handling requests
connectDB();

// Allow requests from the Vite frontend and from the local Chrome extension
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === "http://localhost:5173" || origin.startsWith("chrome-extension://")) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    }
  })
);

// Lets the server read JSON data from request bodies
app.use(express.json());

// Simple home route to confirm the server is running
app.get("/", (req, res) => {
  res.json({ message: "ReadPulse backend is running" });
});

// All user-related routes will start with /api/users
app.use("/api/users", userRoutes);

// Authentication routes will start with /api/auth
app.use("/api/auth", authRoutes);

// All article-related routes will start with /api/articles
app.use("/api/articles", articleRoutes);

// This middleware handles errors in one place
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
