import React from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import type { AdminMetricsData } from '@/types/admin';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AdminMetricsChartsProps {
  data: AdminMetricsData | undefined;
}

export const AdminMetricsCharts: React.FC<AdminMetricsChartsProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Datos para gráfico de Web Vitals
  const webVitalsData = {
    labels: ['FCP', 'LCP', 'CLS', 'Tiempo de Carga'],
    datasets: [
      {
        label: 'Métricas Web (segundos)',
        data: [
          data.performance.report.firstContentfulPaint / 1000,
          data.performance.report.largestContentfulPaint / 1000,
          data.performance.report.cumulativeLayoutShift * 10, // Escalado para visualización
          data.performance.report.pageLoadTime / 1000
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2
      }
    ]
  };

  // Datos para gráfico de engagement
  const engagementData = {
    labels: ['Usuarios Diarios', 'Usuarios Semanales', 'Usuarios Mensuales'],
    datasets: [
      {
        label: 'Usuarios Activos',
        data: [
          data.userEngagement.dailyActiveUsers,
          data.userEngagement.weeklyActiveUsers,
          data.userEngagement.monthlyActiveUsers
        ],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Datos para gráfico de estadísticas de juego
  const gameStatsData = {
    labels: ['Juegos Totales', 'Puntuación Promedio', 'Tasa Finalización (%)'],
    datasets: [
      {
        label: 'Estadísticas de Juego',
        data: [
          data.gameStats.totalGamesPlayed,
          Math.round(data.gameStats.averageScore),
          data.gameStats.completionRate
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(249, 115, 22, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(168, 85, 247)',
          'rgb(249, 115, 22)'
        ],
        borderWidth: 2
      }
    ]
  };

  // Datos para gráfico de retención
  const retentionData = {
    labels: ['Tasa de Rebote', 'Tasa de Retención'],
    datasets: [
      {
        data: [data.userEngagement.bounceRate, data.userEngagement.retentionRate],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(34, 197, 94)'
        ],
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Web Vitals Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Métricas Web Vitals</h3>
        <div className="h-64">
          <Bar data={webVitalsData} options={chartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tendencia de Usuarios Activos</h3>
          <div className="h-64">
            <Line data={engagementData} options={chartOptions} />
          </div>
        </div>

        {/* Game Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas de Juego</h3>
          <div className="h-64">
            <Bar data={gameStatsData} options={chartOptions} />
          </div>
        </div>

        {/* Retention Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Análisis de Retención</h3>
          <div className="h-64 flex justify-center">
            <div className="w-64">
              <Doughnut data={retentionData} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};