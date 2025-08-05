import React from 'react';
import { AdminService } from '@/services/adminService';
import { GameAnalyticsCharts } from '../GameAnalyticsCharts';
import { GameAnalyticsStats } from '../GameAnalyticsStats';
import { PlayerRankings } from '../PlayerRankings';
import type { AdminDashboardData } from '@/types/admin';

interface AdminGameAnalyticsViewProps {
  data: AdminDashboardData | null;
}

export const AdminGameAnalyticsView: React.FC<AdminGameAnalyticsViewProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando análisis de juego...</p>
        </div>
      </div>
    );
  }

  const gameAnalytics = AdminService.calculateGameAnalytics(data.gameSessions, data.users);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Análisis de Juego</h2>
        <p className="text-gray-600">
          Estadísticas detalladas del rendimiento de los jugadores y actividad en el juego
        </p>
      </div>

      {/* Game Statistics Overview */}
      <GameAnalyticsStats analytics={gameAnalytics} />

      {/* Charts */}
      <GameAnalyticsCharts analytics={gameAnalytics} />

      {/* Player Rankings */}
      <PlayerRankings rankings={gameAnalytics.playerRankings} />
    </div>
  );
};