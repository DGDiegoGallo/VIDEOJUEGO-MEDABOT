import React from 'react';
import { FaTrophy, FaClock, FaStar, FaRedo } from 'react-icons/fa';
import { GiDeathSkull } from 'react-icons/gi';

interface GameOverStatsProps {
  score: number;
  time: number;
  level: number;
  reason?: 'death' | 'victory';
  survivalBonus?: number;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const GameOverStats: React.FC<GameOverStatsProps> = ({
  score,
  time,
  level,
  reason = 'death',
  survivalBonus = 0,
  onRestart,
  onMainMenu
}) => {
  const formatTime = (seconds: number) => {
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getRank = (score: number) => {
    if (score >= 1000) return { name: 'LEYENDA', color: 'text-yellow-400', bg: 'from-yellow-600 to-orange-600' };
    if (score >= 500) return { name: 'MAESTRO', color: 'text-purple-400', bg: 'from-purple-600 to-pink-600' };
    if (score >= 250) return { name: 'EXPERTO', color: 'text-blue-400', bg: 'from-blue-600 to-cyan-600' };
    if (score >= 100) return { name: 'VETERANO', color: 'text-green-400', bg: 'from-green-600 to-emerald-600' };
    return { name: 'NOVATO', color: 'text-gray-400', bg: 'from-gray-600 to-gray-700' };
  };

  const rank = getRank(score);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-700/50 shadow-2xl animate-modal-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-3 mb-4">
            {reason === 'victory' ? (
              <FaTrophy className="text-yellow-500 text-4xl animate-pulse" />
            ) : (
              <GiDeathSkull className="text-red-500 text-4xl animate-pulse" />
            )}
            <div>
              <h2 className={`text-3xl font-bold text-white bg-gradient-to-r ${
                reason === 'victory' 
                  ? 'from-yellow-500 to-orange-500' 
                  : 'from-red-500 to-orange-500'
              } bg-clip-text text-transparent`}>
                {reason === 'victory' ? '¡VICTORIA!' : 'GAME OVER'}
              </h2>
              <p className="text-gray-400 text-sm">
                {reason === 'victory' 
                  ? '¡Sobreviviste los 8 minutos completos!' 
                  : '¡Has luchado valientemente!'}
              </p>
            </div>
          </div>
        </div>

        {/* Rank Badge */}
        <div className="text-center mb-6">
          <div className={`inline-block bg-gradient-to-r ${rank.bg} rounded-full px-6 py-2 mb-2`}>
            <span className="text-white font-bold text-lg">{rank.name}</span>
          </div>
          <p className="text-gray-400 text-sm">Tu rango de supervivencia</p>
        </div>

        {/* Stats */}
        <div className="space-y-4 mb-6">
          <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 rounded-lg p-4 border border-yellow-700/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FaTrophy className="text-yellow-500 text-xl" />
                <span className="text-white font-semibold">Puntuación Final</span>
              </div>
              <div className="text-right">
                <span className="text-yellow-400 text-xl font-bold">{score.toLocaleString()}</span>
                {survivalBonus > 0 && (
                  <div className="text-green-400 text-sm">+{survivalBonus.toLocaleString()} bonus</div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-lg p-4 border border-blue-700/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FaClock className="text-blue-400 text-xl" />
                <span className="text-white font-semibold">Tiempo Sobrevivido</span>
              </div>
              <span className="text-blue-400 text-xl font-bold">{formatTime(time)}</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-4 border border-purple-700/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FaStar className="text-purple-400 text-xl" />
                <span className="text-white font-semibold">Nivel Alcanzado</span>
              </div>
              <span className="text-purple-400 text-xl font-bold">{level}</span>
            </div>
          </div>
        </div>

        {/* Achievement Message */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-4 mb-6 border border-gray-600/30">
          <p className="text-center text-gray-300 text-sm">
            {reason === 'victory' 
              ? "🏆 ¡FELICIDADES! Eres un maestro de la supervivencia zombie. ¡Has completado el desafío de 8 minutos!"
              : score >= 500 
              ? "¡Increíble! Eres un verdadero superviviente zombie." 
              : score >= 250 
              ? "¡Excelente trabajo! Tienes potencial de superviviente." 
              : score >= 100 
              ? "¡Buen intento! Cada batalla te hace más fuerte." 
              : "¡No te rindas! La práctica hace al maestro."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onRestart}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <FaRedo className="text-lg" />
            <span>JUGAR DE NUEVO</span>
          </button>

          <button
            onClick={onMainMenu}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            MENÚ PRINCIPAL
          </button>
        </div>

        {/* Tips */}
        <div className="mt-6 pt-4 border-t border-gray-700/50">
          <p className="text-center text-gray-500 text-xs">
            💡 Consejo: Recoge los rombos azules para ganar experiencia y subir de nivel
          </p>
        </div>
      </div>
    </div>
  );
};