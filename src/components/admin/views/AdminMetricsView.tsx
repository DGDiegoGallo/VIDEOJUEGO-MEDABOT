import React from 'react';
import { AdminMetrics } from '../AdminMetrics';
import { AdminTest } from '../AdminTest';
import type { AdminDashboardData } from '@/types/admin';

interface AdminMetricsViewProps {
  data: AdminDashboardData | null;
}

export const AdminMetricsView: React.FC<AdminMetricsViewProps> = ({ data }) => {
  return (
    <div className="space-y-8">
      {/* Performance Metrics */}
      <AdminMetrics data={data?.metrics} />

      {/* Test Component */}
      <AdminTest />

      {/* Additional Metrics Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de Métricas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Engagement de Usuarios</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Usuarios Diarios:</span>
                <span className="text-sm font-medium text-gray-900">
                  {data?.metrics.userEngagement.dailyActiveUsers || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Usuarios Semanales:</span>
                <span className="text-sm font-medium text-gray-900">
                  {data?.metrics.userEngagement.weeklyActiveUsers || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Usuarios Mensuales:</span>
                <span className="text-sm font-medium text-gray-900">
                  {data?.metrics.userEngagement.monthlyActiveUsers || 0}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Estadísticas de Juego</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Juegos Totales:</span>
                <span className="text-sm font-medium text-gray-900">
                  {data?.metrics.gameStats.totalGamesPlayed || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Puntuación Promedio:</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round(data?.metrics.gameStats.averageScore || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tasa de Finalización:</span>
                <span className="text-sm font-medium text-gray-900">
                  {data?.metrics.gameStats.completionRate.toFixed(1) || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};