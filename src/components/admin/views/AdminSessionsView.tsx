import React, { useState } from 'react';
// import { AdminGameSessionTable } from '../AdminGameSessionTable';
// import { AdminFilters } from '../AdminFilters';
import { PlayerGameSessionDetailComponent } from '../PlayerGameSessionDetail';
import { AdminService } from '@/services/adminService';
import type { AdminDashboardData, PlayerGameSessionDetail } from '@/types/admin';

interface AdminSessionsViewProps {
  data: AdminDashboardData | null;
}

export const AdminSessionsView: React.FC<AdminSessionsViewProps> = ({ data }) => {
  const [selectedPlayerData, setSelectedPlayerData] = useState<PlayerGameSessionDetail | null>(null);
  const [loadingPlayerId, setLoadingPlayerId] = useState<number | null>(null);

  const handleViewPlayerDetails = async (userId: number) => {
    try {
      setLoadingPlayerId(userId);
      const playerData = await AdminService.getPlayerGameSession(userId);
      if (playerData) {
        setSelectedPlayerData(playerData);
      } else {
        alert('No se encontraron datos de juego para este usuario');
      }
    } catch (error) {
      console.error('Error loading player data:', error);
      alert('Error al cargar los datos del jugador');
    } finally {
      setLoadingPlayerId(null);
    }
  };

  const completedSessions = data?.gameSessions.filter(s => s.session_stats?.game_state === 'victory').length || 0;
  const activeSessions = data?.gameSessions.filter(s => s.session_stats?.game_state === 'active').length || 0;
  const defeatedSessions = data?.gameSessions.filter(s => s.session_stats?.game_state === 'defeat').length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Datos de Juego por Jugador</h2>
        <p className="text-gray-600">
          Información detallada de las sesiones de juego de cada usuario. 
          Haz clic en "Ver detalle" para ver estadísticas completas.
        </p>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Jugadores</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data?.users.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Victorias</p>
              <p className="text-2xl font-semibold text-gray-900">{completedSessions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-yellow-500 rounded-lg p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sesiones Activas</p>
              <p className="text-2xl font-semibold text-gray-900">{activeSessions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-red-500 rounded-lg p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Derrotas</p>
              <p className="text-2xl font-semibold text-gray-900">{defeatedSessions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Jugadores y sus Datos de Juego</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puntuación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nivel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enemigos Derrotados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precisión
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.gameSessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {session.users_permissions_user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {session.users_permissions_user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.users_permissions_user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {session.session_stats?.final_score || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {session.session_stats?.level_reached || 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      session.session_stats?.game_state === 'victory' 
                        ? 'bg-green-100 text-green-800'
                        : session.session_stats?.game_state === 'defeat'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {session.session_stats?.game_state === 'victory' ? 'Victoria' :
                       session.session_stats?.game_state === 'defeat' ? 'Derrota' : 'Activa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.session_stats?.enemies_defeated || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(session.session_stats?.accuracy_percentage || 0).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewPlayerDetails(session.users_permissions_user.id)}
                      disabled={loadingPlayerId === session.users_permissions_user.id}
                      className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {loadingPlayerId === session.users_permissions_user.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Cargando...
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Ver detalle
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Player Detail Modal */}
      {selectedPlayerData && (
        <PlayerGameSessionDetailComponent
          playerData={selectedPlayerData}
          onClose={() => setSelectedPlayerData(null)}
        />
      )}
    </div>
  );
};