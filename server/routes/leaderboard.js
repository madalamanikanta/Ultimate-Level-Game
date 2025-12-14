const express = require("express");
const User = require("../models/User");

const router = express.Router();

/**
 * GET /api/leaderboard/top
 */
router.get("/top", async (_req, res) => {
  const topPlayers = await User.find({ isGuest: false })
    .sort({ maxLevel: -1, deaths: 1 })
    .limit(10)
    .select("username maxLevel deaths");

  res.json(topPlayers);
});

module.exports = router;
