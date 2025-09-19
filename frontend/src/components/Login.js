import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [teamId, setTeamId] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!teamId.trim()) return;
    onLogin(teamId.trim());
    setShowPopup(true);
  };

  const handleStartGame = () => {
    setShowPopup(false);
    if (teamId.toLowerCase() === "admin") {
      navigate("/admin");
    } else {
      navigate("/game", { state: { teamId } });
    }
  };

  return (
    <div className="login-page">
      {/* Header */}
      <header className="header">
        <img
          src="/padakkalam.jpg"
          alt="Left Logo"
          className="header-logo left"
        />
        <h2 className="header-title">PARAYATHE PARYAM</h2>
        <img
          src="/mla.jpg"
          alt="Right Logo"
          className="header-logo right"
        />
      </header>

      {/* Main Content */}
      <main className="login-container">
        <form onSubmit={handleLogin} className="login-card">
          <h2 className="login-welcome">
            Welcome to <span>PARAYATHE PARYAM</span>
          </h2>
          <p className="login-desc">
            Test your Malayalam literature knowledge through AI-generated imagery
          </p>

          <div className="input-group">
            <input
              type="text"
              placeholder="Enter your team ID"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="start-button"
            disabled={!teamId.trim()}
          >
            Start Game
          </button>
        </form>
      </main>

      {/* Footer */}
      <footer className="footer">© Malayalam Literature Association</footer>

      {/* Popup */}
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
