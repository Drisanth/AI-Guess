import React, { useEffect, useState } from 'react';
import {
  getLeaderboard,
  getTimerDuration,
  setTimerDuration,
  resetTeam,
  resetAllTeams,
} from '../api';
import '../admin.css';

export default function Admin() {
  const [teams, setTeams] = useState([]);
  const [timerDuration, setTimerDurationState] = useState(120);
  const [newDuration, setNewDuration] = useState('');

  useEffect(() => {
    fetchLeaderboard();
    fetchCurrentTimer();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const data = await getLeaderboard();
      setTeams(data.leaderboard);
    } catch (err) {
      alert('Failed to fetch leaderboard');
    }
  };

  const fetchCurrentTimer = async () => {
    try {
      const duration = await getTimerDuration();
      setTimerDurationState(duration);
    } catch (err) {
      console.error('Failed to fetch timer duration');
    }
  };

  const handleExport = (teamId) => {
    window.open(`http://localhost:5000/api/admin/export-rounds/${teamId}`, '_blank');
  };

  const handleReset = async (teamId) => {
    if (!window.confirm(`Reset data for ${teamId}?`)) return;
    try {
      await resetTeam(teamId);
      fetchLeaderboard();
      alert(`✅ Reset data for ${teamId}`);
    } catch (err) {
      alert('Reset failed');
    }
  };

  const handleResetAll = async () => {
    if (!window.confirm('Are you sure you want to reset data for ALL teams?')) return;
    try {
      await resetAllTeams();
      fetchLeaderboard();
      alert('✅ Reset data for ALL teams');
    } catch (err) {
      alert('Reset all failed');
    }
  };

  const handleSetDuration = async () => {
    const num = parseInt(newDuration);
    if (isNaN(num) || num <= 0) {
      alert('Enter valid duration in seconds.');
      return;
    }

    try {
      await setTimerDuration(num);
      setTimerDurationState(num);
      alert('⏱️ Timer duration updated!');
      setNewDuration('');
    } catch (err) {
      alert('Failed to update timer duration');
    }
  };

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>

      <div className="timer-config">
        <h4>⏱️ Current Timer Duration: {timerDuration} seconds</h4>
        <input
          type="number"
          placeholder="Set new timer duration"
          value={newDuration}
          onChange={(e) => setNewDuration(e.target.value)}
        />
        <button onClick={handleSetDuration}>Update Timer</button>
      </div>

      <button className="reset-all-btn" onClick={handleResetAll}>
        Reset All Teams
      </button>

      <table>
        <thead>
          <tr>
            <th>Team ID</th>
            <th>Points</th>
            <th>Rounds</th>
            <th>Avg</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t) => {
            const avg = t.roundsPlayed ? (t.totalPoints / t.roundsPlayed).toFixed(2) : 0;
            return (
              <tr key={t.teamId}>
                <td>{t.teamId}</td>
                <td>{t.totalPoints}</td>
                <td>{t.roundsPlayed}</td>
                <td>{avg}</td>
                <td>
                  <button onClick={() => handleExport(t.teamId)}>Export</button>
                  <button onClick={() => handleReset(t.teamId)}>Reset</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
