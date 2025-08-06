import React from 'react';
import { BsTrophy } from 'react-icons/bs';
import { FiTarget, FiClock, FiCheck, FiBox } from 'react-icons/fi';
import { GiTrophy } from 'react-icons/gi';
import type { GameAnalytics } from '@/types/admin';

interface PlayerRankingsProps {
  rankings: GameAnalytics['playerRankings'];
  onExplain: (type: string) => void;
}

export const PlayerRankings: React.FC<PlayerRankingsProps> = ({ rankings, onExplain }) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return `#${index + 1}`;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-100 border-yellow-300';
      case 1:
        return 'bg-gray-100 border-gray-300';
      case 2:
        return 'bg-orange-100 border-orange-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center">
          <BsTrophy className="h-6 w-6 text-yellow-500 mr-2" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Ranking de Jugadores</h3>
            <p className="text-sm text-gray-600 mt-1">
              Top 10 jugadores clasificados por puntuación de actividad
            </p>
          </div>
        </div>
        <button
          onClick={() => onExplain('rankings')}
          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm hover:bg-blue-200 transition-colors"
        >
          ¿Cómo se calcula?
        </button>
      </div>

      <div className="space-y-4">
        {rankings.slice(0, 10).map((player, index) => (
          <div
            key={player.userId}
            className={`border rounded-lg p-4 ${getRankColor(index)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-gray-700 min-w-[3rem]">
                  {getRankIcon(index)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{player.username}</h4>
                  <p className="text-sm text-gray-600">
                    Puntuación de Actividad: {Math.round(player.activityScore)}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
                <div className="flex flex-col items-center">
                  <BsTrophy className="h-4 w-4 text-yellow-500 mb-1" />
                  <span className="text-sm font-medium text-gray-900">
                    {player.totalScore.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">Puntos</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <FiClock className="h-4 w-4 text-blue-500 mb-1" />
                  <span className="text-sm font-medium text-gray-900">
                    {formatTime(player.totalPlayTime)}
                  </span>
                  <span className="text-xs text-gray-500">Tiempo</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <FiTarget className="h-4 w-4 text-red-500 mb-1" />
                  <span className="text-sm font-medium text-gray-900">
                    {player.averageAccuracy.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500">Precisión</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <GiTrophy className="h-4 w-4 text-green-500 mb-1" />
                  <span className="text-sm font-medium text-gray-900">
                    {player.winRate.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500">Victoria</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <FiCheck className="h-4 w-4 text-purple-500 mb-1" />
                  <span className="text-sm font-medium text-gray-900">
                    {player.dailyQuestsCompleted}
                  </span>
                  <span className="text-xs text-gray-500">Misiones</span>
                </div>

                <div className="flex flex-col items-center">
                  <FiBox className="h-4 w-4 text-teal-500 mb-1" />
                  <span className="text-sm font-medium text-gray-900">
                    {player.materialsCollected}
                  </span>
                  <span className="text-xs text-gray-500">Materiales</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rankings.length === 0 && (
        <div className="text-center py-8">
          <BsTrophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay datos de jugadores disponibles</p>
        </div>
      )}
    </div>
  );
};