const mongoose = require("mongoose");

/**
 * User model for storing game progress
 * 
 * Fields:
 * - username: Unique identifier for user (string)
 * - password: Hashed password (string)
 * - isGuest: Boolean flag for guest accounts (default: false)
 * - progress: Object containing game progress
 *   - highestLevelUnlocked: Highest level the user has reached (default: 1)
 *   - deaths: Total number of deaths (default: 0)
 * - createdAt: Timestamp of account creation
 * - updatedAt: Timestamp of last update
 */
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    isGuest: {
      type: Boolean,
      default: false
    },
    progress: {
      highestLevelUnlocked: {
        type: Number,
        default: 1,
        min: 1
      },
      deaths: {
        type: Number,
        default: 0,
        min: 0
      }
      ,
      completedLevels: {
        type: [Number],
        default: []
      },
      score: {
        type: Number,
        default: 0,
        min: 0
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
