import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { teamLogin } from '../api';
import '../index.css';

export default function Login({ onLogin }) {
  const [teamId, setTeamId] = useState('');
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false); // To control popup visibility
  const navigate = useNavigate();

  // Handle login logic
  const handleLogin = async (e) => {
    e.preventDefault();
    const trimmed = teamId.trim();
    if (!trimmed) {
      setError('Please enter a team ID');
      return;
    }

    try {
      await teamLogin(trimmed); // API call to handle team login
      onLogin(trimmed); // Call parent method to update team ID in the parent component
      setShowPopup(true); // Show instructions popup after successful login
    } catch (err) {
      setError('Login failed');
    }
  };

  // Handle the start game logic
  const handleStartGame = () => {
    setShowPopup(false); // Hide popup
    if (teamId.toLowerCase() === 'admin') {
      navigate('/admin'); // Navigate to admin page if team is admin
    } else {
      navigate('/game'); // Navigate to game page for normal teams
    }
  };

  return (
    <div className="login-container">
      <h2>Team Login</h2>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="text"
          placeholder="Enter Team ID"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="login-input"
        />
        <button type="submit" className="login-button">Login</button>
      </form>
      {error && <p className="error">{error}</p>}

      {/* Instruction Popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>🎮 How to Play</h3>
            <p>
              Welcome to the AI Guessing Game! Here's how you can play:
              <ul>
                <li>Enter a prompt to generate an image.</li>
                <li>Guess what the image represents based on your clues.</li>
                <li>Earn points based on your accuracy and speed!</li>
                <li>The game ends when all rounds are completed.</li>
              </ul>
            </p>
            <button onClick={handleStartGame} className="start-button">Start Game</button>
          </div>
        </div>
      )}
    </div>
  );
}
