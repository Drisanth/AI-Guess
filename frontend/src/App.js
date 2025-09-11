import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Game from './components/Game';
import Admin from './components/Admin';

function App() {
  const [teamId, setTeamId] = useState(null);
  const [gameDuration, setGameDuration] = useState(120); // Default timer, admin can override

  return (
    <Routes>
      <Route
        path="/"
        element={<Login onLogin={setTeamId} />}
      />
      <Route
        path="/game"
        element={
          teamId && teamId !== 'admin' ? (
            <Game teamId={teamId} gameDuration={gameDuration} />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/admin"
        element={
          teamId === 'admin' ? (
            <Admin setGameDuration={setGameDuration} />
          ) : (
            <Navigate to="/" />
          )
        }
      />
    </Routes>
  );
}

export default App;
