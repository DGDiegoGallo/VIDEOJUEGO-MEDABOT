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
}

export const GameAnalyticsCharts: React.FC<GameAnalyticsChartsProps> = ({ analytics }) => {
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

  // Combat Stats Chart (Bar)
  const combatData = {
    labels: ['Disparos Realizados', 'Disparos Acertados', 'Daño Infligido', 'Daño Recibido'],
    datasets: [
      {
        label: 'Estadísticas de Combate',
        data: [
          analytics.combatStats.totalShotsFired,
          analytics.combatStats.totalShotsHit,
          analytics.combatStats.totalDamageDealt,
          analytics.combatStats.totalDamageReceived,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Materiales Recolectados
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Distribución de todos los materiales recolectados por los jugadores durante sus sesiones
        </p>
        <div className="h-64">
          <Doughnut data={materialsData} options={doughnutOptions} />
        </div>
      </div>

      {/* Combat Stats Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Estadísticas de Combate
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Resumen del rendimiento en combate de todos los jugadores
        </p>
        <div className="h-64">
          <Bar data={combatData} options={chartOptions} />
        </div>
      </div>

      {/* Top Players Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Top 5 Jugadores Más Activos
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Ranking basado en puntuación total, tiempo de juego, precisión, enemigos derrotados y misiones completadas
        </p>
        <div className="h-64">
          <Bar data={topPlayersData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};