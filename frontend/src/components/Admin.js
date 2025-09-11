import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../api';

export default function Admin() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const data = await getLeaderboard();
      setTeams(data.leaderboard);
    } catch (err) {
      alert('Failed to fetch leaderboard');
    }
  };

  const handleExport = (teamId) => {
    window.open(`http://localhost:5000/api/admin/export-rounds/${teamId}`, '_blank');
  };

  const handleReset = async (teamId) => {
    if (!window.confirm(`Reset data for ${teamId}?`)) return;
    try {
      await fetch(`http://localhost:5000/api/admin/reset-team/${teamId}`, {
        method: 'POST',
      });
      fetchLeaderboard();
    } catch (err) {
      alert('Reset failed');
    }
  };

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
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
