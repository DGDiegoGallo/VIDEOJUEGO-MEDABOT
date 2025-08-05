import React from 'react';
import { FiTarget, FiZap, FiClock } from 'react-icons/fi';
import { BsBox } from 'react-icons/bs';
import type { GameAnalytics } from '@/types/admin';

interface GameAnalyticsStatsProps {
  analytics: GameAnalytics;
}

export const GameAnalyticsStats: React.FC<GameAnalyticsStatsProps> = ({ analytics }) => {
  const stats = [
    {
      name: 'Enemigos Derrotados',
      value: analytics.combatStats.totalEnemiesDefeated.toLocaleString(),
      icon: FiTarget,
      color: 'bg-red-500',
      description: 'Total de enemigos eliminados por todos los jugadores'
    },
    {
      name: 'Precisión Promedio',
      value: `${analytics.combatStats.averageAccuracy.toFixed(1)}%`,
      icon: FiZap,
      color: 'bg-yellow-500',
      description: 'Porcentaje promedio de disparos que dieron en el objetivo'
    },
    {
      name: 'Tiempo de Supervivencia',
      value: `${Math.round(analytics.survivalStats.totalSurvivalTime / 3600)}h`,
      icon: FiClock,
      color: 'bg-blue-500',
      description: 'Tiempo total que los jugadores han sobrevivido en el juego'
    },
    {
      name: 'Cajas de Suministros',
      value: analytics.survivalStats.totalSupplyBoxes.toLocaleString(),
      icon: BsBox,
      color: 'bg-green-500',
      description: 'Total de cajas de suministros recolectadas'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500">{stat.description}</p>
          </div>
        );
      })}
    </div>
  );
};