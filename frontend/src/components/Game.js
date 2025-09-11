import React, { useState, useEffect, useRef } from 'react';
import { generateImage, submitRound, getTimerDuration } from '../api';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../index.css'; // Make sure to import your CSS (contains popup styles)

export default function Game({ teamId }) {
  const [prompt, setPrompt] = useState('');
  const [promptsUsed, setPromptsUsed] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const [score, setScore] = useState(10);
  const [timer, setTimer] = useState(0);
  const [initialTimer, setInitialTimer] = useState(120);
  const [guessCorrect, setGuessCorrect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);

  const timerRef = useRef(null);
  const navigate = useNavigate(); // Initialize navigate

  // Fetch timer from backend on load
  useEffect(() => {
    const fetchTimer = async () => {
      try {
        const duration = await getTimerDuration();
        setInitialTimer(duration);
        setTimer(duration);
      } catch (err) {
        console.error('Failed to fetch timer duration:', err);
      }
    };

    fetchTimer();
  }, []);

  // Timer logic
  useEffect(() => {
    if (loading || guessCorrect) {
      clearInterval(timerRef.current);
      return;
    }

    if (timer <= 0) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, guessCorrect, timer]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      setLoading(true);
      const url = await generateImage(prompt);
      setPromptsUsed((prev) => [...prev, prompt]);
      setImageUrls((prev) => [...prev, url]);
      setCurrentImage(url);

      if (imageUrls.length < 5) {
        const newScore = 10 - imageUrls.length * 2;
        setScore(Math.max(newScore, 2));
      }

      setPrompt('');
    } catch (err) {
      console.error('Image generation failed:', err);
      alert('Image generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCorrectGuess = async () => {
    const taken = initialTimer - timer;
    setTimeTaken(taken);
    setGuessCorrect(true);
    clearInterval(timerRef.current);

    try {
      await submitRound({
        teamId,
        promptsUsed,
        imageUrls,
        score,
        timeTaken: taken,
      });

      setShowPopup(true); // Show modal instead of alert
    } catch (err) {
      console.error('Failed to save round:', err);
      alert('Failed to save data.');
    }
  };

  const resetGame = () => {
    setPrompt('');
    setPromptsUsed([]);
    setImageUrls([]);
    setCurrentImage(null);
    setScore(10);
    setTimer(initialTimer);
    setGuessCorrect(false);
    setShowPopup(false);
  };

  const handleNextClick = () => {
    // Navigate to the login page after clicking next in the popup
    resetGame(); // Reset the game state
    navigate('/'); // Redirect to login page
  };

  return (
    <div className="container">
      <h2>🧠 Guess the Object</h2>

      <div className={`timer ${timer < 30 ? 'low' : ''}`}>
        ⏱️ {timer > 0 ? `${timer}s` : '⏰ Time’s up!'}
      </div>

      {!currentImage && (
        <div className="prompt-box">
          <textarea
            placeholder="Enter a prompt to generate an image"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading || guessCorrect || timer === 0}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim() || guessCorrect || timer === 0}
          >
            {loading ? 'Generating...' : 'Generate Image'}
          </button>
        </div>
      )}

      {currentImage && (
        <div>
          <div className="image-box">
            <img src={currentImage} alt="AI Generated" />
          </div>

          <div className="button-row">
            <button onClick={handleCorrectGuess} disabled={guessCorrect || timer === 0}>
              ✅ Correct Guess
            </button>
            <button
              onClick={() => {
                setCurrentImage(null);
                setPrompt('');
              }}
              disabled={loading || guessCorrect || timer === 0}
            >
              ➕ Next Clue
            </button>
          </div>
        </div>
      )}

      <div className="score">⭐ Score: {score}</div>

      {/* ✅ Modal popup after correct guess */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>✅ Correct Guess!</h3>
            <p>🆔 <strong>Team:</strong> {teamId}</p>
            <p>⭐ <strong>Score:</strong> {score} points</p>
            <p>⏱️ <strong>Time Taken:</strong> {timeTaken} seconds</p>
            <p>📝 <strong>Prompts Used:</strong> {promptsUsed.length} prompts</p> {/* Number of prompts used */}
            <button onClick={handleNextClick}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
