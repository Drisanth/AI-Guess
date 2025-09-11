const express = require('express');
const router = express.Router();
const Round = require('../models/Round');
const Team = require('../models/Team');

// Removed safe prompt filtering function entirely

router.post('/login', async (req, res) => {
  const { teamId } = req.body;
  if (!teamId) return res.status(400).json({ message: 'Team ID required' });
  let team = await Team.findOne({ teamId });
  if (!team) {
    team = await Team.create({ teamId });
  }
  res.json({ message: 'Login successful' });
});

router.post('/generate-image', async (req, res) => {
  const { prompt } = req.body;

  // No filtering, just generate image URL directly
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
  res.json({ imageUrl });
});

router.post('/submit-round', async (req, res) => {
  const { teamId, roundNumber, promptsUsed, imageUrls, score, timeTaken } = req.body;
  const round = await Round.create({ teamId, roundNumber, promptsUsed, imageUrls, score, timeTaken });
  const team = await Team.findOne({ teamId });
  team.totalPoints += score;
  team.roundsPlayed += 1;
  await team.save();
  res.json({ message: 'Round saved' });
});

module.exports = router;
