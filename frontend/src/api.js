const BASE_URL = 'http://localhost:5000/api'; 

// Team Login
export async function teamLogin(teamId) {
  const res = await fetch(`${BASE_URL}/game/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamId }),
  });
  if (!res.ok) throw new Error(await res.text());
}

// Generate Image
export async function generateImage(prompt) {
  const res = await fetch(`${BASE_URL}/game/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.imageUrl;
}

// Submit Round Data
export async function submitRound(data) {
  const res = await fetch(`${BASE_URL}/game/submit-round`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
}

// Get Leaderboard
export async function getLeaderboard() {
  const res = await fetch(`${BASE_URL}/admin/leaderboard`);
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

// Get Timer Duration (New for Game.js to load)
export async function getTimerDuration() {
  const res = await fetch(`${BASE_URL}/admin/timer`);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.duration;  // Assuming the response is like { duration: 120 }
}

// Set Timer Duration (Used in Admin.js to set the timer)
export async function setTimerDuration(duration) {
  const res = await fetch(`${BASE_URL}/admin/timer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ duration }),
  });
  if (!res.ok) throw new Error(await res.text());
}
