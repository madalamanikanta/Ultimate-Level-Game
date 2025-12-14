const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * POST /api/progress/save
 */
router.post("/save", auth, async (req, res) => {
  const { maxLevel, deaths } = req.body;

  const user = await User.findById(req.user);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (maxLevel > user.maxLevel) {
    user.maxLevel = maxLevel;
  }

  user.deaths = deaths;
  await user.save();

  res.json({ message: "Progress saved" });
});

/**
 * GET /api/progress/me
 */
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user).select("-password");

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(user);
});

module.exports = router;
