import React from 'react';
import type { GameAnalytics } from '@/types/admin';

interface WeaponStatsProps {
  weaponStats: GameAnalytics['weaponStats'];
  onExplain: (type: string) => void;
}

export const WeaponStats: React.FC<WeaponStatsProps> = ({ weaponStats, onExplain }) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'uncommon': return 'text-green-600 bg-green-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Estadísticas de Armas</h3>
          <p className="text-sm text-gray-600">Uso y rendimiento de las armas en el juego</p>
        </div>
        <button
          onClick={() => onExplain('weapons')}
          className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
        >
          ?
        </button>
      </div>

      <div className="space-y-3">
        {weaponStats.slice(0, 8).map((weapon, index) => (
          <div key={weapon.weaponId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{weapon.weaponName}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(weapon.rarity)}`}>
                    {weapon.rarity}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Daño promedio: {weapon.averageDamage.toFixed(1)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">{weapon.usageCount}</div>
              <div className="text-sm text-gray-600">usos</div>
            </div>
          </div>
        ))}
      </div>

      {weaponStats.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay datos de armas disponibles</p>
        </div>
      )}
    </div>
  );
};