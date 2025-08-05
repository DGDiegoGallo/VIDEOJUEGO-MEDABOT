import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { userStatsService } from '@/services/userStatsService';
import { UserDashboardData } from '@/types/userStats';
import { UserStatsGrid } from '@/components/user-dashboard/UserStatsCard';
import { UserChartsSection } from '@/components/user-dashboard/UserChartsSection';
import { UserProgressSection } from '@/components/user-dashboard/UserProgressSection';
import { UserPersonalInfo } from '@/components/user-dashboard/UserPersonalInfo';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  FaChartBar, 
  FaChartLine, 
  FaRocket, 
  FaUser,
  FaRedo,
  FaTrophy,
  FaClock,
  FaGamepad,
  FaExclamationTriangle,
  FaChartPie
} from 'react-icons/fa';

export const ProfileView: React.FC = () => {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'progress' | 'personal'>('overview');

  // Cargar datos del dashboard
  const loadDashboardData = async () => {
    if (!user?.id) {
      setError('Usuario no autenticado');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const data = await userStatsService.getUserDashboardData(parseInt(user.id));
      setDashboardData(data);
      setLastUpdated(new Date());
      
      console.log('📊 Dashboard data loaded successfully:', data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Error al cargar las estadísticas del usuario');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  // Función para refrescar datos
  const handleRefresh = () => {
    loadDashboardData();
  };

  // Componente de pestañas
  const TabButton = ({ 
    id, 
    label, 
    icon: IconComponent, 
    isActive, 
    onClick 
  }: {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
      }`}
    >
      <IconComponent className="mr-2" />
      {label}
    </button>
  );

  // Estado de carga
  if (isLoading) {
    return (
      <div className="w-full bg-gray-800/70 rounded-lg p-8 backdrop-blur-md min-h-[600px]">
        <div className="flex flex-col items-center justify-center py-20">
          <LoadingSpinner />
          <p className="text-white mt-4 text-lg">Cargando tu perfil...</p>
          <p className="text-gray-400 text-sm">Procesando estadísticas de juego</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="w-full bg-gray-800/70 rounded-lg p-8 backdrop-blur-md">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-8 text-center max-w-md">
            <FaExclamationTriangle className="text-6xl mb-4 text-red-400 mx-auto" />
            <h3 className="text-xl font-bold text-red-400 mb-2">Error al cargar perfil</h3>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white font-medium transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No hay datos
  if (!dashboardData) {
    return (
      <div className="w-full bg-gray-800/70 rounded-lg p-8 backdrop-blur-md">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-gray-700 border border-gray-600 rounded-lg p-8 text-center max-w-md">
            <FaChartPie className="text-6xl mb-4 text-gray-400 mx-auto" />
            <h3 className="text-xl font-bold text-white mb-2">Sin datos disponibles</h3>
            <p className="text-gray-400 mb-6">
              Juega algunas partidas para generar estadísticas
            </p>
            <button
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white font-medium transition-colors"
            >
              Refrescar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Generar tarjetas de estadísticas
  const statCards = userStatsService.generateStatCards(dashboardData);

  return (
    <div className="w-full bg-gray-800/70 rounded-lg backdrop-blur-md overflow-hidden">
      {/* Header del perfil */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar y info básica */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-2xl font-bold text-white backdrop-blur-sm">
              {user?.username?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user?.username}</h2>
              <p className="text-blue-100">{user?.email}</p>
              <p className="text-blue-200 text-sm">
                Miembro desde {new Date(user?.createdAt ?? '').toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Stats rápidas */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">
                {dashboardData.stats.total_sessions}
              </div>
              <div className="text-xs text-blue-100">Partidas</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">
                {dashboardData.progress.current_level}
              </div>
              <div className="text-xs text-blue-100">Nivel</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">
                {dashboardData.stats.win_rate.toFixed(0)}%
              </div>
              <div className="text-xs text-blue-100">Victorias</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">
                {Math.floor(dashboardData.progress.total_playtime_minutes / 60)}h
              </div>
              <div className="text-xs text-blue-100">Jugado</div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="flex justify-between items-center mt-6">
          {/* Pestañas de navegación */}
          <div className="flex gap-2">
            <TabButton
              id="overview"
              label="Resumen"
              icon={FaChartBar}
              isActive={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            />
            <TabButton
              id="charts"
              label="Gráficos"
              icon={FaChartLine}
              isActive={activeTab === 'charts'}
              onClick={() => setActiveTab('charts')}
            />
            <TabButton
              id="progress"
              label="Progreso"
              icon={FaRocket}
              isActive={activeTab === 'progress'}
              onClick={() => setActiveTab('progress')}
            />
            <TabButton
              id="personal"
              label="Perfil"
              icon={FaUser}
              isActive={activeTab === 'personal'}
              onClick={() => setActiveTab('personal')}
            />
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <div className="text-sm text-blue-100">
                Actualizado: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-colors flex items-center backdrop-blur-sm"
            >
              <FaRedo className="mr-1" />
              Refrescar
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Tarjetas de estadísticas principales */}
            <section>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <FaChartBar className="mr-2 text-blue-400" />
                Estadísticas Principales
              </h3>
              <UserStatsGrid stats={statCards} isLoading={isLoading} />
            </section>

            {/* Sesiones recientes */}
            {dashboardData.recent_sessions.length > 0 && (
              <section>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <FaClock className="mr-2 text-green-400" />
                  Últimas Partidas
                </h3>
                <div className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800/70">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Fecha
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Resultado
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Puntuación
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Enemigos
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {dashboardData.recent_sessions.slice(0, 5).map((session, index) => (
                          <tr key={index} className="hover:bg-gray-800/30 transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-300">
                              {session.date}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                session.result === 'victory' 
                                  ? 'bg-green-900/40 text-green-300 border border-green-700' 
                                  : 'bg-red-900/40 text-red-300 border border-red-700'
                              }`}>
                                {session.result === 'victory' ? (
                                  <>
                                    <FaTrophy className="mr-1" />
                                    Victoria
                                  </>
                                ) : (
                                  <>
                                    <FaGamepad className="mr-1" />
                                    Derrota
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-white font-medium">
                              {session.score.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-300">
                              {session.enemies_killed}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === 'charts' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <FaChartLine className="mr-2 text-purple-400" />
              Análisis Detallado
            </h3>
            <UserChartsSection data={dashboardData} isLoading={isLoading} />
          </div>
        )}

        {activeTab === 'progress' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <FaRocket className="mr-2 text-blue-400" />
              Progreso y Arsenal
            </h3>
            <UserProgressSection 
              progress={dashboardData.progress} 
              weapons={dashboardData.weapons}
              isLoading={isLoading} 
            />
          </div>
        )}

        {activeTab === 'personal' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <FaUser className="mr-2 text-green-400" />
              Información Personal
            </h3>
            <UserPersonalInfo 
              user={dashboardData.user} 
              isLoading={isLoading} 
            />
          </div>
        )}
      </div>
    </div>
  );
};
