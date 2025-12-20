const express = require("express");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

/**
 * Save progress (fire-and-forget, must never crash the game)
 * POST /api/progress/save
 * Headers: Authorization: Bearer <token>
 * Body: { maxLevel: number, deaths: number }
 *
 * This endpoint is idempotent and must:
 * - Never throw or block gameplay
 * - Always update maxLevel if higher than current
 * - Always update death count
 * - Return success (200) or silent failure (will be logged client-side)
 */
router.post("/save", auth, async (req, res) => {
  try {
    const { maxLevel, deaths } = req.body;
    const userId = req.user;

    // Validate input
    if (maxLevel === undefined || maxLevel === null || isNaN(maxLevel)) {
      return res.status(400).json({ msg: "Invalid maxLevel" });
    }

    if (deaths === undefined || deaths === null || isNaN(deaths)) {
      return res.status(400).json({ msg: "Invalid deaths count" });
    }

    // Find user - gracefully handle not found
    const user = await User.findById(userId);
    if (!user) {
      // User token is valid but user was deleted - still return 200 to not break game
      return res.status(200).json({ success: true, msg: "User not found but request processed" });
    }

    // Update highest level if new level is higher
    if (maxLevel > user.progress.highestLevelUnlocked) {
      user.progress.highestLevelUnlocked = maxLevel;
    }

    // Update deaths count
    user.progress.deaths = deaths;

    // Save to database
    await user.save();

    res.json({ success: true });
  } catch (err) {
    // CRITICAL: Never crash the game
    // Log error but return success to frontend
    console.error("Progress save error:", err);
    res.status(200).json({ success: true });
  }
});

module.exports = router;
