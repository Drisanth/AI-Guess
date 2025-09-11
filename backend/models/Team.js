const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamId: { type: String, required: true, unique: true },
  totalPoints: { type: Number, default: 0 },
  roundsPlayed: { type: Number, default: 0 },
});

module.exports = mongoose.model('Team', teamSchema);
