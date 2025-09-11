const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamId: { type: String, required: true, unique: true },
  totalPoints: { type: Number, default: 0 },
  roundsPlayed: { type: Number, default: 0 },
  totalTime: { type: Number, default: 0 }, // total time in seconds
  promptsUsedCount: { type: Number, default: 0 }, // number of prompts used by the team
});

module.exports = mongoose.model('Team', teamSchema);
