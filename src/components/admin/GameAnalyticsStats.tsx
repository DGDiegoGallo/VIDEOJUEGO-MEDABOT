import React from "react";
import { FiTarget, FiZap, FiClock, FiTrendingUp } from "react-icons/fi";
import { BsBox, BsShield } from "react-icons/bs";
import { GiTrophy, GiUnlitBomb } from "react-icons/gi";
import type { GameAnalytics } from "@/types/admin";

interface GameAnalyticsStatsProps {
  analytics: GameAnalytics;
  onExplain: (type: string) => void;
}

export const GameAnalyticsStats: React.FC<GameAnalyticsStatsProps> = ({
  analytics,
  onExplain,
}) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const combatStats = [
    {
      name: "Enemigos Derrotados",
      value: analytics.combatStats.totalEnemiesDefeated.toLocaleString(),
      icon: FiTarget,
      color: "bg-red-500",
      description: "Total de enemigos eliminados por todos los jugadores",
      category: "combat",
    },
    {
      name: "Precisión Promedio",
      value: `${analytics.combatStats.averageAccuracy.toFixed(1)}%`,
      icon: FiZap,
      color: "bg-yellow-500",
      description: "Porcentaje promedio de disparos que dieron en el objetivo",
      category: "combat",
    },
    {
      name: "Daño Total Infligido",
      value: analytics.combatStats.totalDamageDealt.toLocaleString(),
      icon: FiZap,
      color: "bg-orange-500",
      description: "Cantidad total de daño causado por todos los jugadores",
      category: "combat",
    },
    {
      name: "Barriles Destruidos",
      value: analytics.combatStats.barrelsDestroyed.toLocaleString(),
      icon: GiUnlitBomb,
      color: "bg-purple-500",
      description: "Total de barriles explosivos destruidos",
      category: "combat",
    },
  ];

  const survivalStats = [
    {
      name: "Tiempo Total de Juego",
      value: formatTime(analytics.survivalStats.totalSurvivalTime),
      icon: FiClock,
      color: "bg-blue-500",
      description: "Tiempo total que los jugadores han estado en partidas",
      category: "survival",
    },
    {
      name: "Tasa de Victoria",
      value: `${analytics.survivalStats.winRate.toFixed(1)}%`,
      icon: GiTrophy,
      color: "bg-green-500",
      description: "Porcentaje de partidas completadas exitosamente",
      category: "survival",
    },
    {
      name: "Nivel Promedio",
      value: analytics.survivalStats.averageLevel.toFixed(1),
      icon: FiTrendingUp,
      color: "bg-indigo-500",
      description: "Nivel promedio alcanzado por los jugadores",
      category: "survival",
    },
    {
      name: "Cajas de Suministros",
      value: analytics.survivalStats.totalSupplyBoxes.toLocaleString(),
      icon: BsBox,
      color: "bg-teal-500",
      description: "Total de cajas de suministros recolectadas",
      category: "survival",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Combat Statistics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Estadísticas de Combate
            </h3>
            <p className="text-sm text-gray-600">
              Rendimiento en batalla y eliminación de enemigos
            </p>
          </div>
          <button
            onClick={() => onExplain("combat")}
            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm hover:bg-blue-200 transition-colors"
          >
            ¿Qué significa esto?
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {combatStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-lg p-2`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-xs font-medium text-gray-600">
                      {stat.name}
                    </p>
                    <p className="text-xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">{stat.description}</p>
              </div>
            );
          })}
        </div>

        {/* Enemy Type Breakdown */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">
              {analytics.combatStats.zombiesKilled.toLocaleString()}
            </div>
            <div className="text-sm text-red-700">Zombies Eliminados</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analytics.combatStats.dashersKilled.toLocaleString()}
            </div>
            <div className="text-sm text-blue-700">Velocistas Eliminados</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-600">
              {analytics.combatStats.tanksKilled.toLocaleString()}
            </div>
            <div className="text-sm text-gray-700">Tanques Eliminados</div>
          </div>
        </div>
      </div>

      {/* Survival Statistics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Estadísticas de Supervivencia
            </h3>
            <p className="text-sm text-gray-600">
              Progreso, duración y éxito en las partidas
            </p>
          </div>
          <button
            onClick={() => onExplain("survival")}
            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm hover:bg-blue-200 transition-colors"
          >
            ¿Qué significa esto?
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {survivalStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-lg p-2`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-xs font-medium text-gray-600">
                      {stat.name}
                    </p>
                    <p className="text-xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">{stat.description}</p>
              </div>
            );
          })}
        </div>

        {/* Game Results Breakdown */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {analytics.survivalStats.totalVictories.toLocaleString()}
            </div>
            <div className="text-sm text-green-700">Victorias Totales</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">
              {analytics.survivalStats.totalDefeats.toLocaleString()}
            </div>
            <div className="text-sm text-red-700">Derrotas Totales</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analytics.survivalStats.totalGamesPlayed.toLocaleString()}
            </div>
            <div className="text-sm text-blue-700">Partidas Jugadas</div>
          </div>
        </div>
      </div>

      {/* Materials Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Materiales Recolectados
            </h3>
            <p className="text-sm text-gray-600">
              Recursos obtenidos por todos los jugadores
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-700">
              {analytics.totalMaterials.steel.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Acero</div>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-700">
              {analytics.totalMaterials.energy_cells.toLocaleString()}
            </div>
            <div className="text-sm text-yellow-600">Celdas de Energía</div>
          </div>
          <div className="bg-red-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-700">
              {analytics.totalMaterials.medicine.toLocaleString()}
            </div>
            <div className="text-sm text-red-600">Medicina</div>
          </div>
          <div className="bg-green-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700">
              {analytics.totalMaterials.food.toLocaleString()}
            </div>
            <div className="text-sm text-green-600">Comida</div>
          </div>
        </div>
      </div>
    </div>
  );
};
