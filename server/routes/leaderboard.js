const express = require("express");
const User = require("../models/User");

const router = express.Router();

/**
 * Get leaderboard
 * GET /api/leaderboard
 * 
 * Sorted by:
 * 1. Highest level unlocked (descending)
 * 2. Lowest deaths (ascending)
 * 
 * Returns top 100 players with username and progress
 */
router.get("/", async (req, res) => {
  try {
    const leaderboard = await User.find()
      .sort({
        "progress.highestLevelUnlocked": -1,
        "progress.deaths": 1
      })
      .limit(100)
      .select("username progress")
      .lean();

    res.json(leaderboard);
  } catch (err) {
    console.error("Leaderboard fetch error:", err);
    res.status(500).json({ msg: "Failed to fetch leaderboard" });
  }
});

module.exports = router;
