const express = require('express');
const router = express.Router();
const Round = require('../models/Round');
const Team = require('../models/Team');

// Team login or registration
router.post('/login', async (req, res) => {
  const { teamId } = req.body;
  if (!teamId) return res.status(400).json({ message: 'Team ID required' });
  let team = await Team.findOne({ teamId });
  if (!team) {
    team = await Team.create({ teamId });
  }
  res.json({ message: 'Login successful' });
});

// Generate image URL directly without filtering
router.post('/generate-image', async (req, res) => {
  const { prompt } = req.body;
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
  res.json({ imageUrl });
});

// Submit round/session data (no roundNumber now)
router.post('/submit-round', async (req, res) => {
  const { teamId, promptsUsed, imageUrls, score, timeTaken } = req.body;

  const round = await Round.create({
    teamId,
    promptsUsed,
    imageUrls,
    score,
    timeTaken,
  });

  const team = await Team.findOne({ teamId });
  if (team) {
    // Update team's total points, rounds played, and total time
    team.totalPoints += score;
    team.roundsPlayed += 1;
    team.totalTime = (team.totalTime || 0) + (timeTaken || 0);
    team.promptsUsedCount += promptsUsed.length;  // Increment number of prompts used
    await team.save();
  }

  res.json({ message: 'Round saved' });
});

module.exports = router;
