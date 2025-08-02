import React from 'react';

interface GameStatsProps {
  score: number;
  time: number;
  enemiesKilled: number;
  onRestart: () => void;
  onBackToMenu: () => void;
}

export const GameStats: React.FC<GameStatsProps> = ({
  score,
  time,
  enemiesKilled,
  onRestart,
  onBackToMenu
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreRank = (score: number) => {
    if (score >= 1000) return '🏆 MAESTRO';
    if (score >= 500) return '🥇 EXPERTO';
    if (score >= 200) return '🥈 VETERANO';
    if (score >= 100) return '🥉 NOVATO';
    return '👶 PRINCIPIANTE';
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md mx-4 text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-6">
          GAME OVER
        </h1>
        
        <div className="space-y-6">
          {/* Rango */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-white mb-2">🏆 Rango</h2>
            <p className="text-2xl font-bold text-yellow-400">
              {getScoreRank(score)}
            </p>
          </div>

          {/* Estadísticas */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-white mb-3">📊 Estadísticas</h2>
            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-gray-300">Puntuación:</span>
                <span className="text-yellow-400 font-bold">{score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Tiempo:</span>
                <span className="text-blue-400 font-bold">{formatTime(time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Zombies eliminados:</span>
                <span className="text-green-400 font-bold">{enemiesKilled}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Promedio por minuto:</span>
                <span className="text-purple-400 font-bold">
                  {time > 0 ? Math.round((enemiesKilled / (time / 60)) * 10) / 10 : 0}
                </span>
              </div>
            </div>
          </div>

          {/* Logros */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-white mb-3">🏅 Logros</h2>
            <div className="space-y-2 text-sm">
              {score >= 100 && (
                <div className="flex items-center space-x-2 text-green-400">
                  <span>✅</span>
                  <span>Primera puntuación (100+ puntos)</span>
                </div>
              )}
              {time >= 60 && (
                <div className="flex items-center space-x-2 text-blue-400">
                  <span>✅</span>
                  <span>Sobreviviente (1+ minuto)</span>
                </div>
              )}
              {enemiesKilled >= 50 && (
                <div className="flex items-center space-x-2 text-red-400">
                  <span>✅</span>
                  <span>Cazador de zombies (50+ eliminados)</span>
                </div>
              )}
              {score >= 500 && (
                <div className="flex items-center space-x-2 text-yellow-400">
                  <span>✅</span>
                  <span>Experto (500+ puntos)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="mt-8 space-y-4">
          <button
            onClick={onRestart}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 transform hover:scale-105"
          >
            🔄 Jugar de nuevo
          </button>
          
          <button
            onClick={onBackToMenu}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            🏠 Volver al menú
          </button>
        </div>

        <div className="mt-6 text-gray-400 text-sm">
          <p>¡Gracias por jugar Survival Zombie!</p>
          <p>Comparte tu puntuación con amigos</p>
        </div>
      </div>
    </div>
  );
}; 