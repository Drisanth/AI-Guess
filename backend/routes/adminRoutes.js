const express = require('express');
const router = express.Router();
const Round = require('../models/Round');
const Team = require('../models/Team');
const { Parser } = require('json2csv');

router.get('/leaderboard', async (req, res) => {
  const teams = await Team.find({});
  res.json({
    leaderboard: teams.map(team => ({
      teamId: team.teamId,
      totalPoints: team.totalPoints,
      roundsPlayed: team.roundsPlayed,
    }))
  });
});

router.get('/export-rounds/:teamId', async (req, res) => {
  const { teamId } = req.params;
  const rounds = await Round.find({ teamId });
  const fields = ['teamId', 'roundNumber', 'promptsUsed', 'imageUrls', 'score', 'timeTaken', 'createdAt'];
  const parser = new Parser({ fields });
  const csv = parser.parse(rounds);
  res.header('Content-Type', 'text/csv');
  res.attachment(`rounds_${teamId}.csv`);
  res.send(csv);
});

router.post('/reset-team/:teamId', async (req, res) => {
  const { teamId } = req.params;
  await Team.deleteOne({ teamId });
  await Round.deleteMany({ teamId });
  res.json({ message: `Team ${teamId} reset successfully` });
});

module.exports = router;
