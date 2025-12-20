const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/**
 * Register a new user account
 * POST /api/auth/register
 * Body: { username, password }
 * Response: { token }
 */
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ msg: "Username and password required" });
    }

    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashed,
      isGuest: false
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ msg: "Registration failed" });
  }
});

/**
 * Guest login - creates temporary guest account
 * Silent endpoint - never crashes the game
 * POST /api/auth/guest
 * Response: { token }
 */
router.post("/guest", async (req, res) => {
  try {
    // Create unique guest username with timestamp
    const guestUser = await User.create({
      username: `guest_${Date.now()}`,
      password: "guest_placeholder",
      isGuest: true
    });

    const token = jwt.sign(
      { id: guestUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Guest auth error:", err);
    // Always return 500 with token structure to prevent game crash
    // Frontend will retry or use cached token
    res.status(500).json({ token: null });
  }
});

/**
 * Login with existing account
 * POST /api/auth/login
 * Body: { username, password }
 * Response: { token }
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ msg: "Username and password required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Login failed" });
  }
});

module.exports = router;
