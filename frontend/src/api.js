const BASE_URL = 'http://localhost:5000/api';

export async function teamLogin(teamId) {
  const res = await fetch(`${BASE_URL}/game/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamId }),
  });
  if (!res.ok) throw new Error(await res.text());
}

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

export async function submitRound(data) {
  const res = await fetch(`${BASE_URL}/game/submit-round`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function getLeaderboard() {
  const res = await fetch(`${BASE_URL}/admin/leaderboard`);
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}
