import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/LoginForm';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import type { LoginCredentials } from '@/types/api';
import { FaArrowLeft } from 'react-icons/fa';

export const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuthStore();
  const { loadUserGameData } = useGameStore();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(credentials);
      
      // After successful login, load game data
      const user = useAuthStore.getState().user;
      if (user) {
        await loadUserGameData(user.id);
      }
      
      // Navigate to game after successful login
      navigate('/lobby');
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Error de login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-6 left-6 flex items-center space-x-2 text-gray-300 hover:text-white transition-colors z-10"
      >
        <FaArrowLeft />
        <span>Volver</span>
      </button>
      
      <div className="text-center">
        {/* Title */}
        <h1 className="text-6xl font-bold text-white mb-4 tracking-wide">
          MEDABOT GAME
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl text-gray-300 mb-12">
          Herramienta para el aprendizaje y tratamiento de TDAH
        </p>
        
        {/* Login Form */}
        <LoginForm 
          onSubmit={handleLogin}
          loading={isLoading}
          error={error}
          onClearError={() => setError(null)}
        />
        
        {/* Registration Link */}
        <p className="mt-6 text-gray-400">
          ¿No tienes cuenta?{' '}
          <button 
            onClick={() => navigate('/register')} 
            className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
          >
            Regístrate aquí
          </button>
        </p>
        
        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">🎮 Gamificación</h3>
            <p className="text-gray-400 text-sm">
              Obtén medallas NFT únicas como recompensa por tus logros
            </p>
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-green-400 mb-2">🧠 IA Adaptativa</h3>
            <p className="text-gray-400 text-sm">
              Desafíos personalizados según tus habilidades y progreso
            </p>
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-purple-400 mb-2">🎯 Terapéutico</h3>
            <p className="text-gray-400 text-sm">
              Diseñado específicamente para ayudar con TDAH y déficit de atención
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};