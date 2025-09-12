import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlayCircle, FaUsers, FaInstagram, FaGithub } from "react-icons/fa";

export default function Login({ onLogin }) {
  const [teamId, setTeamId] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    if (!teamId.trim()) return;
    onLogin(teamId.trim());
    setShowPopup(true);
  };

  // Handle start game
  const handleStartGame = () => {
    setShowPopup(false);
    if (teamId.toLowerCase() === "admin") {
      navigate("/admin");
    } else {
      navigate("/game", { state: { teamId } });
    }
  };

  return (
    <div className="login-wrapper">
      {/* Social Icons */}
      <div className="social-icons">
        <a href="https://github.com" target="_blank" rel="noreferrer">
          <FaGithub />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noreferrer">
          <FaInstagram />
        </a>
      </div>

      {/* Title */}
      <h1 className="app-title">PARAYATHE PARYAM</h1>

      {/* Card */}
      <form onSubmit={handleLogin} className="login-card">
        <FaPlayCircle className="play-icon" />

        <h2>
          Welcome to <span>PARAYATHE PARYAM</span>
        </h2>
        <p>
          Test your Malayalam literature knowledge through AI-generated imagery
        </p>

        {/* Input */}
        <div className="input-group">
          <FaUsers className="input-icon" />
          <input
            type="text"
            placeholder="Enter your team ID"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          className="start-button"
          disabled={!teamId.trim()}
        >
          Start Game
        </button>
      </form>

      {/* Footer */}
      <footer>© Malayalam Literature Association</footer>

      {/* Instruction Popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>🎮 How to Play</h3>
            <ul>
              <li>Enter a team ID to log in.</li>
              <li>Generate AI-based images using prompts.</li>
              <li>Guess what the image represents.</li>
              <li>Earn points based on speed and accuracy.</li>
              <li>The game ends when all rounds are completed.</li>
            </ul>
            <button onClick={handleStartGame} className="start-button">
              Start Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
