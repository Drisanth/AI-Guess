// backend/utils/safePromptFilter.js
const fs = require('fs');

const badWords = fs.readFileSync('./utils/banned_words.txt', 'utf-8')
  .split('\n')
  .map(w => w.trim().toLowerCase())
  .filter(Boolean); // remove empty lines

function isSafePrompt(prompt) {
  const loweredWords = prompt.toLowerCase().split(/\W+/); // split prompt into words
  return !badWords.some(badWord => loweredWords.includes(badWord));
}

module.exports = { isSafePrompt };
