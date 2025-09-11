import React, { useState, useEffect, useRef } from 'react';
import { generateImage, submitRound } from '../api';

export default function Game({ teamId }) {
  const [roundNumber, setRoundNumber] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [promptsUsed, setPromptsUsed] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const [score, setScore] = useState(10);
  const [timer, setTimer] = useState(120);
  const [guessCorrect, setGuessCorrect] = useState(false);
  const [loading, setLoading] = useState(false);

  const timerRef = useRef(null);

  // Timer countdown - runs only if not loading and not guessed correct
  useEffect(() => {
    if (loading || guessCorrect) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    if (timer <= 0) return;

    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, guessCorrect, timer]);

  // Generate Image Handler
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      setLoading(true);
      console.log('🟡 Sending prompt to backend:', prompt);
      const url = await generateImage(prompt);
      console.log('🟢 Received image URL:', url);

      setPromptsUsed((prev) => [...prev, prompt]);
      setImageUrls((prev) => [...prev, url]);
      setCurrentImage(url);

      // Calculate score for this clue
      if (imageUrls.length < 5) {
        const newScore = 10 - (imageUrls.length * 2);
        setScore(Math.max(newScore, 2));
      }

      setPrompt('');
    } catch (err) {
      console.error('🔴 Image generation failed:', err);
      alert('Image generation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Correct Guess Handler - submit round and reset for next
  const handleCorrectGuess = async () => {
    const timeTaken = 120 - timer;
    setGuessCorrect(true);

    try {
      await submitRound({
        teamId,
        roundNumber,
        promptsUsed,
        imageUrls,
        score,
        timeTaken,
      });
      alert(`✅ Correct! You scored ${score} points.`);
      resetRound();
    } catch (err) {
      console.error('❌ Failed to save round:', err);
      alert('Failed to save round.');
    }
  };

  // Reset all for next round
  const resetRound = () => {
    setPrompt('');
    setPromptsUsed([]);
    setImageUrls([]);
    setCurrentImage(null);
    setScore(10);
    setTimer(120);
    setGuessCorrect(false);
    setRoundNumber((prev) => prev + 1);
  };

  return (
    <div className="container">
      <h2>🎯 Round {roundNumber}</h2>

      <div className={`timer ${timer < 30 ? 'low' : ''}`}>
        ⏱️ {timer > 0 ? `${timer}s` : '⏰ Time’s up!'}
      </div>

      {/* Show prompt input only if no current image (waiting for new prompt) */}
      {!currentImage && (
        <div className="prompt-box">
          <textarea
            placeholder="Enter prompt for image generation"
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

      {/* Show image + buttons when image is ready */}
      {currentImage && (
        <div>
          <div className="image-box">
            <img src={currentImage} alt="AI Generated" />
          </div>

          <div className="button-row">
            <button onClick={handleCorrectGuess} disabled={guessCorrect || timer === 0}>
              ✅ Correct Guess
            </button>

            {/* Next clue resets prompt input and allows new image generation */}
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

      <div className="score">⭐ Current Score: {score}</div>
    </div>
  );
}
