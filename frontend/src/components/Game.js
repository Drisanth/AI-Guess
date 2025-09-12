import React, { useState, useEffect, useRef } from 'react';
import { generateImage, submitRound, getTimerDuration } from '../api';
import { useNavigate } from 'react-router-dom';
import '../Game.css';

export default function Game({ teamId }) {
  const [prompt, setPrompt] = useState('');
  const [promptsUsed, setPromptsUsed] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [initialTimer, setInitialTimer] = useState(120);
  const [guessCorrect, setGuessCorrect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showTimeoutPopup, setShowTimeoutPopup] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);

  const timerRef = useRef(null);
  const timerStartedRef = useRef(false);
  const navigate = useNavigate();

  // Fetch timer duration on mount
  useEffect(() => {
    const fetchTimer = async () => {
      try {
        const duration = await getTimerDuration();
        setInitialTimer(duration);
        setTimer(duration);
        setScore(duration * 2);
      } catch (err) {
        console.error('Failed to fetch timer duration:', err);
      }
    };
    fetchTimer();
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (loading || guessCorrect || timerPaused) {
      clearInterval(timerRef.current);
      return;
    }

    if (timer === 0) {
      clearInterval(timerRef.current);
      if (timerStartedRef.current && !showTimeoutPopup) {
        setScore(0);
        setTimeTaken(initialTimer);
        setShowTimeoutPopup(true);
      }
      return;
    }

    timerStartedRef.current = true;

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!showTimeoutPopup) {
            setScore(0);
            setTimeTaken(initialTimer);
            setShowTimeoutPopup(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, guessCorrect, timer, initialTimer, showTimeoutPopup, timerPaused]);

  // Update score as time changes only if guess not correct
  useEffect(() => {
    if (!guessCorrect && timer > 0) {
      setScore(timer * 2);
    }
  }, [timer, guessCorrect]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    try {
      setLoading(true);
      setTimerPaused(true);
      const url = await generateImage(prompt);
      setPromptsUsed((prev) => [...prev, prompt]);
      setImageUrls((prev) => [...prev, url]);
      setCurrentImage(url);
      setPrompt('');
    } catch (err) {
      console.error('Image generation failed:', err);
      alert('Image generation failed.');
      setTimerPaused(false);
    } finally {
      setLoading(false);
    }
  };

  const handleImageLoad = () => {
    setTimerPaused(false);
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
      setShowPopup(true);
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
    setScore(initialTimer * 2);
    setTimer(initialTimer);
    setGuessCorrect(false);
    setShowPopup(false);
    setShowTimeoutPopup(false);
    setTimeTaken(0);
    timerStartedRef.current = false;
    setTimerPaused(false);
  };

  const handleNextClick = () => {
    resetGame();
    navigate('/');
  };

  return (
    <div className="game-page">
      {/* Header */}
      <div className="header">
        <h2 className="header-title">PARAYATHE PARYAM</h2>
      </div>

      {/* Timer */}
      <div className="timer-bar">
        <div
          className="timer-progress"
          style={{ width: `${(timer / initialTimer) * 100}%` }}
        >
          {timer > 0 ? `${timer}s left` : '⏰ Time’s up!'}
        </div>
      </div>

      {/* Game Container */}
      <div className="game-container">
        {/* Prompt box (if no image yet) */}
        {!currentImage && (
          <>
            <div className="prompt-box">
              <textarea
                placeholder="Enter your prompt to generate an image clue..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading || guessCorrect || timer === 0}
              />
              <button
                className="prompt-button"
                onClick={handleGenerate}
                disabled={loading || !prompt.trim() || guessCorrect || timer === 0}
              >
                {loading ? '...' : '➤'}
              </button>
            </div>
            <p className="prompt-helper">
              Describe what you want to generate as a clue for Malayalam literature
            </p>
          </>
        )}

        {/* Image + Buttons */}
        {currentImage && (
          <div>
            <div className="image-box">
              <img
                src={currentImage}
                alt="AI Generated"
                onLoad={handleImageLoad}
              />
            </div>
            <div className="button-row">
              <button
                className="action-btn correct"
                onClick={handleCorrectGuess}
                disabled={guessCorrect || timer === 0}
              >
                ✅ Correct Guess
              </button>
              <button
                className="action-btn next"
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
      </div>

      {/* Footer */}
      <div className="footer">
        © Malayalam Literature Association
      </div>

      {/* Popup for correct guess */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>✅ Correct Guess!</h3>
            <p>🆔 <strong>Team:</strong> {teamId}</p>
            <p>⭐ <strong>Score:</strong> {score} points</p>
            <p>⏱️ <strong>Time Taken:</strong> {timeTaken} seconds</p>
            <p>📝 <strong>Prompts Used:</strong> {promptsUsed.length} prompts</p>
            <button onClick={handleNextClick}>Next</button>
          </div>
        </div>
      )}

      {/* Popup for timeout */}
      {showTimeoutPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>⏰ Time’s Up!</h3>
            <p>🆔 <strong>Team:</strong> {teamId}</p>
            <p>⭐ <strong>Score:</strong> {score} points</p>
            <p>⏱️ <strong>Time Taken:</strong> {timeTaken} seconds</p>
            <p>📝 <strong>Prompts Used:</strong> {promptsUsed.length} prompts</p>
            <button onClick={handleNextClick}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
