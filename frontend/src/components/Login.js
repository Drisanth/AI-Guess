import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { teamLogin } from '../api';

export default function Login({ onLogin }) {
  const [teamId, setTeamId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const trimmed = teamId.trim();
    if (!trimmed) {
      setError('Please enter a team ID');
      return;
    }

    try {
      await teamLogin(trimmed);
      onLogin(trimmed);
      if (trimmed.toLowerCase() === 'admin') {
        navigate('/admin');
      } else {
        navigate('/game');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <div className="container">
      <h2>Team Login</h2>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="text"
          placeholder="Enter Team ID"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
