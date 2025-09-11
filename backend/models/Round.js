const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  teamId: String,
  roundNumber: Number,
  promptsUsed: [String],
  imageUrls: [String],
  score: Number,
  timeTaken: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Round', roundSchema);
