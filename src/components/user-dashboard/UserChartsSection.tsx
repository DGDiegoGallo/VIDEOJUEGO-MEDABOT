import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { UserDashboardData } from '@/types/userStats';
import { 
  FaCrosshairs, 
  FaBox, 
  FaChartLine, 
  FaChartPie,
  FaInfoCircle 
} from 'react-icons/fa';

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

interface UserChartsSectionProps {
  data: UserDashboardData;
  isLoading?: boolean;
}

export const UserChartsSection: React.FC<UserChartsSectionProps> = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-gray-900 rounded-lg p-6 border border-gray-700 animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
            <div className="h-64 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // Configuración común para los gráficos
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#E5E7EB',
          padding: 20,
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#374151',
        borderWidth: 1,
      }
    }
  };

  // Gráfico de enemigos derrotados (Doughnut)
  const enemiesData = {
    labels: ['Zombies', 'Dashers', 'Tanques', 'Otros'],
    datasets: [
      {
        data: [
          data.stats.zombies_killed,
          data.stats.dashers_killed,
          data.stats.tanks_killed,
          Math.max(0, data.stats.enemies_defeated - data.stats.zombies_killed - data.stats.dashers_killed - data.stats.tanks_killed)
        ],
        backgroundColor: [
          '#10B981', // Verde
          '#F59E0B', // Amarillo
          '#EF4444', // Rojo
          '#8B5CF6'  // Morado
        ],
        borderColor: [
          '#065F46',
          '#92400E',
          '#991B1B',
          '#5B21B6'
        ],
        borderWidth: 2,
      },
    ],
  };

  // Gráfico de materiales (Bar)
  const materialsData = {
    labels: ['Acero', 'Celdas de Energía', 'Medicina', 'Comida'],
    datasets: [
      {
        label: 'Materiales',
        data: [
          data.materials.steel,
          data.materials.energy_cells,
          data.materials.medicine,
          data.materials.food
        ],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',  // Azul
          'rgba(16, 185, 129, 0.8)',  // Verde
          'rgba(239, 68, 68, 0.8)',   // Rojo
          'rgba(245, 158, 11, 0.8)'   // Amarillo
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  // Gráfico de progreso temporal (Line)
  const recentSessionsData = {
    labels: data.recent_sessions.slice().reverse().map((session, index) => `S${index + 1}`),
    datasets: [
      {
        label: 'Puntuación',
        data: data.recent_sessions.slice().reverse().map(session => session.score),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
      {
        label: 'Enemigos',
        data: data.recent_sessions.slice().reverse().map(session => session.enemies_killed),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const lineOptions = {
    ...commonOptions,
    scales: {
      x: {
        grid: {
          color: 'rgba(55, 65, 81, 0.3)',
        },
        ticks: {
          color: '#9CA3AF',
        }
      },
      y: {
        grid: {
          color: 'rgba(55, 65, 81, 0.3)',
        },
        ticks: {
          color: '#9CA3AF',
        }
      }
    }
  };

  const barOptions = {
    ...commonOptions,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9CA3AF',
        }
      },
      y: {
        grid: {
          color: 'rgba(55, 65, 81, 0.3)',
        },
        ticks: {
          color: '#9CA3AF',
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Gráfico de Enemigos Derrotados */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <FaCrosshairs className="mr-2 text-red-400" />
          Enemigos Derrotados
        </h3>
        <div className="h-64">
          <Doughnut data={enemiesData} options={commonOptions} />
        </div>
        <div className="mt-4 text-center">
          <span className="text-2xl font-bold text-white">
            {data.stats.enemies_defeated.toLocaleString()}
          </span>
          <p className="text-gray-400 text-sm">Total eliminados</p>
        </div>
      </div>

      {/* Gráfico de Materiales */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <FaBox className="mr-2 text-blue-400" />
          Materiales Recolectados
        </h3>
        <div className="h-64">
          <Bar data={materialsData} options={barOptions} />
        </div>
        <div className="mt-4 text-center">
          <span className="text-2xl font-bold text-white">
            {data.materials.total_materials.toLocaleString()}
          </span>
          <p className="text-gray-400 text-sm">Total de materiales</p>
        </div>
      </div>

      {/* Gráfico de Progreso Temporal */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 lg:col-span-2 xl:col-span-1">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <FaChartLine className="mr-2 text-green-400" />
          Progreso Reciente
        </h3>
        <div className="h-64">
          {data.recent_sessions.length > 0 ? (
            <Line data={recentSessionsData} options={lineOptions} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <FaInfoCircle className="text-4xl mb-2 mx-auto" />
                <p>No hay datos suficientes</p>
                <p className="text-sm">Juega más partidas para ver tu progreso</p>
              </div>
            </div>
          )}
        </div>
        {data.recent_sessions.length > 0 && (
          <div className="mt-4 text-center">
            <span className="text-2xl font-bold text-white">
              {data.recent_sessions.length}
            </span>
            <p className="text-gray-400 text-sm">Sesiones recientes</p>
          </div>
        )}
      </div>
    </div>
  );
}; 