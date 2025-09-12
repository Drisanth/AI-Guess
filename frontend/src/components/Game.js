import React, { useState, useEffect, useRef } from 'react';
import { generateImage, submitRound, getTimerDuration } from '../api';
import { useNavigate } from 'react-router-dom';
import '../index.css';

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

  const timerRef = useRef(null);
  const timerStartedRef = useRef(false); // Track if timer started
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
    if (loading || guessCorrect) {
      clearInterval(timerRef.current);
      return;
    }

    // Don't start timer until initialTimer is set
    if (timer === 0) {
      clearInterval(timerRef.current);
      // Only show timeout popup if timer has started counting down
      if (timerStartedRef.current && !showTimeoutPopup) {
        setScore(0);
        setTimeTaken(initialTimer);
        setShowTimeoutPopup(true);
      }
      return;
    }

    // Start counting down timer
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
  }, [loading, guessCorrect, timer, initialTimer, showTimeoutPopup]);

  // Update score as time changes only if guess not correct and timer running
  useEffect(() => {
    if (!guessCorrect && timer > 0) {
      setScore(timer * 2);
    }
  }, [timer, guessCorrect]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      setLoading(true);
      const url = await generateImage(prompt);
      setPromptsUsed((prev) => [...prev, prompt]);
      setImageUrls((prev) => [...prev, url]);
      setCurrentImage(url);
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
    timerStartedRef.current = false; // reset timer started flag
  };

  const handleNextClick = () => {
    resetGame();
    navigate('/');
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

      {/* Popup for timer running out */}
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
