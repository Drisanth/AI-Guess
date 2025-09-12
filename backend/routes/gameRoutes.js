const express = require('express');
const router = express.Router();
const Round = require('../models/Round');
const Team = require('../models/Team');

// Team login or registration
router.post('/login', async (req, res) => {
  const { teamId } = req.body;
  if (!teamId) return res.status(400).json({ message: 'Team ID required' });

  try {
    let team = await Team.findOne({ teamId });
    if (!team) {
      team = await Team.create({ teamId });
    }
    res.json({ message: 'Login successful' });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Failed to log in', error: err.message });
  }
});

// Generate image URL directly without filtering
router.post('/generate-image', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ message: 'Prompt required' });

  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
  res.json({ imageUrl });
});

// Submit round/session data
router.post('/submit-round', async (req, res) => {
  const { teamId, promptsUsed, imageUrls, score, timeTaken } = req.body;

  // Validate input
  if (!teamId || score === undefined || timeTaken === undefined) {
    return res.status(400).json({ message: 'Missing required fields: teamId, score, or timeTaken' });
  }

  try {
    // Create a new round entry in the database
    const round = await Round.create({
      teamId,
      promptsUsed,
      imageUrls,
      score,
      timeTaken,
    });

    // Find the team and update their total points, rounds played, etc.
    let team = await Team.findOne({ teamId });
    if (team) {
      // Update the team stats
      team.totalPoints += score;  // Add score to total points
      team.roundsPlayed += 1;  // Increment rounds played
      team.totalTime += timeTaken;  // Add the time taken to the total time
      team.promptsUsedCount += promptsUsed.length;  // Increment the number of prompts used

      await team.save();  // Save the updated team data
    } else {
      // If the team doesn't exist, create a new entry
      team = new Team({
        teamId,
        totalPoints: score,
        roundsPlayed: 1,
        totalTime: timeTaken,
        promptsUsedCount: promptsUsed.length,
      });

      await team.save();
    }

    res.json({ message: 'Round saved and team updated successfully', round });
  } catch (err) {
    console.error('Failed to save round:', err);
    res.status(500).json({ message: 'Failed to save round', error: err.message });
  }
});

module.exports = router;
