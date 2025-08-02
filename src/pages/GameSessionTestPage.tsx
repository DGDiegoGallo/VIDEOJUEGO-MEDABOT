import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { GameSessionManager } from '@/components/game-session/GameSessionManager';
import { UserProgressOverview } from '@/components/game-session/UserProgressOverview';
import { SessionTestControls } from '@/components/game-session/SessionTestControls';

const GameSessionTestPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'session' | 'test'>('overview');

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Acceso Requerido
          </h1>
          <p className="text-gray-400">
            Debes estar logueado para acceder a las sesiones de juego
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">Game Session Test</h1>
              <p className="text-gray-400 mt-1">
                Usuario: {user.username} (ID: {user.id})
              </p>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Progreso
              </button>
              <button
                onClick={() => setActiveTab('session')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'session'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Sesiones
              </button>
              <button
                onClick={() => setActiveTab('test')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'test'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Test
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <UserProgressOverview userId={user.id} />}
        {activeTab === 'session' && <GameSessionManager userId={user.id} />}
        {activeTab === 'test' && <SessionTestControls userId={user.id} />}
      </div>
    </div>
  );
};

export default GameSessionTestPage;