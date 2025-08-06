import React from 'react';
import type { GameAnalytics } from '@/types/admin';

interface QuestStatsProps {
  questStats: GameAnalytics['questStats'];
  onExplain: (type: string) => void;
}

export const QuestStats: React.FC<QuestStatsProps> = ({ questStats, onExplain }) => {
  const getQuestTypeIcon = (type: string) => {
    switch (type) {
      case 'kill_enemies': return '⚔️';
      case 'kill_zombies': return '🧟';
      case 'kill_dashers': return '💨';
      case 'kill_tanks': return '🛡️';
      case 'destroy_barrels': return '💥';
      case 'survive_time': return '⏱️';
      case 'collect_materials': return '📦';
      default: return '🎯';
    }
  };

  const getQuestTypeName = (type: string) => {
    const names: Record<string, string> = {
      'kill_enemies': 'Eliminar Enemigos',
      'kill_zombies': 'Eliminar Zombies',
      'kill_dashers': 'Eliminar Velocistas',
      'kill_tanks': 'Eliminar Tanques',
      'destroy_barrels': 'Destruir Barriles',
      'survive_time': 'Tiempo de Supervivencia',
      'collect_materials': 'Recolectar Materiales'
    };
    return names[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const totalQuests = Object.values(questStats.questTypeDistribution).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Estadísticas de Misiones Diarias</h3>
          <p className="text-sm text-gray-600">Progreso y distribución de objetivos completados</p>
        </div>
        <button
          onClick={() => onExplain('quests')}
          className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
        >
          ?
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{questStats.totalQuestsCompleted}</div>
          <div className="text-sm text-green-700">Misiones Completadas</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{questStats.averageQuestsPerPlayer.toFixed(1)}</div>
          <div className="text-sm text-blue-700">Promedio por Jugador</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{Object.keys(questStats.questTypeDistribution).length}</div>
          <div className="text-sm text-purple-700">Tipos de Misiones</div>
        </div>
      </div>

      {/* Quest Type Distribution */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Distribución por Tipo de Misión</h4>
        <div className="space-y-3">
          {Object.entries(questStats.questTypeDistribution)
            .sort(([,a], [,b]) => b - a)
            .map(([type, count]) => {
              const percentage = totalQuests > 0 ? (count / totalQuests) * 100 : 0;
              return (
                <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getQuestTypeIcon(type)}</span>
                    <div>
                      <div className="font-medium text-gray-900">{getQuestTypeName(type)}</div>
                      <div className="text-sm text-gray-600">{percentage.toFixed(1)}% del total</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900 w-12 text-right">{count}</div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {questStats.totalQuestsCompleted === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay misiones completadas registradas</p>
        </div>
      )}
    </div>
  );
};