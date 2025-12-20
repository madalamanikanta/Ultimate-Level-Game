require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const progressRoutes = require("./routes/progress");
const leaderboardRoutes = require("./routes/leaderboard");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Enable CORS for frontend access (adjust origin in production)
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
