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
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import type { AdminDashboardData } from '@/types/admin';

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

interface AdminChartsProps {
  data: AdminDashboardData | null;
}

export const AdminCharts: React.FC<AdminChartsProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // User Level Distribution Chart
  const levelDistributionData = {
    labels: data.metrics.gameStats.levelDistribution.map(item => `Nivel ${item.level}`),
    datasets: [
      {
        label: 'Usuarios por Nivel',
        data: data.metrics.gameStats.levelDistribution.map(item => item.userCount),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#06B6D4',
          '#84CC16',
          '#F97316'
        ],
        borderWidth: 1,
      },
    ],
  };

  // User Engagement Chart
  const engagementData = {
    labels: ['Usuarios Diarios', 'Usuarios Semanales', 'Usuarios Mensuales'],
    datasets: [
      {
        label: 'Usuarios Activos',
        data: [
          data.metrics.userEngagement.dailyActiveUsers,
          data.metrics.userEngagement.weeklyActiveUsers,
          data.metrics.userEngagement.monthlyActiveUsers,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
    ],
  };

  // Game Sessions Over Time (mock data for demonstration)
  const sessionsOverTimeData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Sesiones Completadas',
        data: [12, 19, 15, 25, 22, 18, 20],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Sesiones Abandonadas',
        data: [3, 5, 4, 7, 6, 4, 5],
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Top Performers Chart
  const topPerformersData = {
    labels: data.metrics.gameStats.topPerformers.slice(0, 5).map(p => p.username),
    datasets: [
      {
        label: 'Experiencia',
        data: data.metrics.gameStats.topPerformers.slice(0, 5).map(p => p.experience),
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
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
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* User Level Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución por Niveles</h3>
        <div className="h-64">
          <Doughnut data={levelDistributionData} options={chartOptions} />
        </div>
      </div>

      {/* User Engagement */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Usuarios Activos</h3>
        <div className="h-64">
          <Bar data={engagementData} options={chartOptions} />
        </div>
      </div>

      {/* Sessions Over Time */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sesiones por Día</h3>
        <div className="h-64">
          <Line data={sessionsOverTimeData} options={chartOptions} />
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top 5 Jugadores</h3>
        <div className="h-64">
          <Bar data={topPerformersData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};