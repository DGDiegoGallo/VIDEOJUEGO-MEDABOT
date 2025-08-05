import React from 'react';
import { AdminStats } from '../AdminStats';
import { AdminCharts } from '../AdminCharts';
import type { AdminDashboardData } from '@/types/admin';

interface AdminOverviewViewProps {
  data: AdminDashboardData | null;
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({ data }) => {
  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <AdminStats data={data} />

      {/* Charts */}
      <AdminCharts data={data} />

      {/* Quick Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen Rápido</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {data?.totalUsers || 0}
            </p>
            <p className="text-sm text-gray-600">Usuarios Totales</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {data?.totalSessions || 0}
            </p>
            <p className="text-sm text-gray-600">Sesiones Totales</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {data?.activeUsers || 0}
            </p>
            <p className="text-sm text-gray-600">Usuarios Activos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {data?.metrics.gameStats.completionRate.toFixed(1) || 0}%
            </p>
            <p className="text-sm text-gray-600">Tasa de Finalización</p>
          </div>
        </div>
      </div>
    </div>
  );
};