import React from 'react';
import { AdminMetrics } from '../AdminMetrics';
import { AdminTest } from '../AdminTest';
import { AdminMetricsCharts } from '../AdminMetricsCharts';
import { WebVitalsExplanation } from '../WebVitalsExplanation';
import { useAdminStore } from '@/stores/adminStore';
import type { AdminDashboardData } from '@/types/admin';

interface AdminMetricsViewProps {
  data: AdminDashboardData | null;
}

export const AdminMetricsView: React.FC<AdminMetricsViewProps> = ({ data }) => {
  const { collectAndSaveMetrics, clearMetrics } = useAdminStore();

  const handleClearMetrics = async () => {
    if (window.confirm('¿Estás seguro de que deseas limpiar las métricas antiguas? Esta acción no se puede deshacer.')) {
      try {
        await clearMetrics();
        alert('Métricas limpiadas correctamente');
      } catch (error) {
        alert('Error al limpiar las métricas');
        console.error(error);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header con acciones */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Métricas de Rendimiento</h2>
          <p className="text-gray-600">Análisis detallado del rendimiento web y engagement de usuarios</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={collectAndSaveMetrics}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar Métricas
          </button>
          <button
            onClick={handleClearMetrics}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Limpiar Métricas
          </button>
        </div>
      </div>

      {/* Performance Metrics Cards */}
      <AdminMetrics data={data?.metrics} />

      {/* Charts Section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Gráficos de Análisis</h3>
        <AdminMetricsCharts data={data?.metrics} />
      </div>

      {/* Web Vitals Explanation */}
      <WebVitalsExplanation />

      {/* Test Component */}
      <AdminTest />

      {/* Additional Metrics Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen Detallado de Métricas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Engagement de Usuarios</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Usuarios Diarios:</span>
                <span className="text-sm font-medium text-gray-900">
                  {data?.metrics?.userEngagement.dailyActiveUsers || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Usuarios Semanales:</span>
                <span className="text-sm font-medium text-gray-900">
                  {data?.metrics?.userEngagement.weeklyActiveUsers || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Usuarios Mensuales:</span>
                <span className="text-sm font-medium text-gray-900">
                  {data?.metrics?.userEngagement.monthlyActiveUsers || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Duración Promedio:</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round(data?.metrics?.userEngagement.averageSessionDuration || 0)} min
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
                  {data?.metrics?.gameStats.totalGamesPlayed || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Puntuación Promedio:</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round(data?.metrics?.gameStats.averageScore || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tasa de Finalización:</span>
                <span className="text-sm font-medium text-gray-900">
                  {data?.metrics?.gameStats.completionRate?.toFixed(1) || 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tasa de Retención:</span>
                <span className="text-sm font-medium text-gray-900">
                  {data?.metrics?.userEngagement.retentionRate?.toFixed(1) || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};