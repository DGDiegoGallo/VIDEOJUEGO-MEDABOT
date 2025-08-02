import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { LobbyPage } from '@/pages/LobbyPage';
import { GamePage } from '@/pages/GamePage';
import GameSessionTestPage from '@/pages/GameSessionTestPage';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="w-full h-full">
        <Routes>
          {/* Ruta principal - Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Rutas de autenticación */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Lobby y juego */}
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/game" element={<GamePage />} />
          
          {/* Ruta de juego con autenticación (opcional) */}
          <Route path="/play" element={<GamePage />} />
          
          {/* Página de prueba de sesiones de juego */}
          <Route path="/test-sessions" element={<GameSessionTestPage />} />
          
          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};