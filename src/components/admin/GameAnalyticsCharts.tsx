import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import type { GameAnalytics } from '@/types/admin';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface GameAnalyticsChartsProps {
  analytics: GameAnalytics;
  onExplain: (type: string) => void;
}

export const GameAnalyticsCharts: React.FC<GameAnalyticsChartsProps> = ({ analytics, onExplain }) => {
  // Materials Chart (Doughnut)
  const materialsData = {
    labels: ['Acero', 'Celdas de Energía', 'Medicina', 'Comida'],
    datasets: [
      {
        label: 'Materiales Recolectados',
        data: [
          analytics.totalMaterials.steel,
          analytics.totalMaterials.energy_cells,
          analytics.totalMaterials.medicine,
          analytics.totalMaterials.food,
        ],
        backgroundColor: [
          '#8B5CF6', // Purple for steel
          '#F59E0B', // Yellow for energy cells
          '#EF4444', // Red for medicine
          '#10B981', // Green for food
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  // Enemy Types Chart (Bar)
  const enemyTypesData = {
    labels: ['Zombies', 'Velocistas', 'Tanques'],
    datasets: [
      {
        label: 'Enemigos Eliminados',
        data: [
          analytics.combatStats.zombiesKilled,
          analytics.combatStats.dashersKilled,
          analytics.combatStats.tanksKilled,
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // Red for zombies
          'rgba(59, 130, 246, 0.8)',  // Blue for dashers
          'rgba(107, 114, 128, 0.8)', // Gray for tanks
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(107, 114, 128, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Top Players Activity Chart (Bar)
  const topPlayersData = {
    labels: analytics.playerRankings.slice(0, 5).map(p => p.username),
    datasets: [
      {
        label: 'Puntuación de Actividad',
        data: analytics.playerRankings.slice(0, 5).map(p => Math.round(p.activityScore)),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || context.parsed;
            return `${label}: ${value.toLocaleString()}`;
          }
        }
      }
    },
  };

  const doughnutOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Materials Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Materiales Recolectados
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Distribución de recursos obtenidos por todos los jugadores
            </p>
          </div>
          <button
            onClick={() => onExplain('materials')}
            className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
          >
            ?
          </button>
        </div>
        <div className="h-64">
          <Doughnut data={materialsData} options={doughnutOptions} />
        </div>
      </div>

      {/* Enemy Types Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Enemigos Eliminados por Tipo
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Distribución de enemigos derrotados por categoría
            </p>
          </div>
          <button
            onClick={() => onExplain('enemies')}
            className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
          >
            ?
          </button>
        </div>
        <div className="h-64">
          <Bar data={enemyTypesData} options={chartOptions} />
        </div>
      </div>

      {/* Top Players Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Top 5 Jugadores Más Activos
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Ranking basado en puntuación de actividad ponderada
            </p>
          </div>
          <button
            onClick={() => onExplain('topPlayers')}
            className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
          >
            ?
          </button>
        </div>
        <div className="h-64">
          <Bar data={topPlayersData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};