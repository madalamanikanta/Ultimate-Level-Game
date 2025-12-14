const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String
  },

  isGuest: {
    type: Boolean,
    default: false
  },

  maxLevel: {
    type: Number,
    default: 1
  },

  deaths: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);
