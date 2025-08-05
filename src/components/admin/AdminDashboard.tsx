import React, { useEffect, useState } from 'react';
import { useAdminStore } from '@/stores/adminStore';
import { AdminLoading } from './AdminLoading';
import { AdminHeader } from './AdminHeader';
import { AdminTabs, AdminTabType } from './AdminTabs';
import { AdminGameAnalyticsView } from './views/AdminGameAnalyticsView';
import { AdminUsersView } from './views/AdminUsersView';
import { AdminSessionsView } from './views/AdminSessionsView';
import { AdminMetricsView } from './views/AdminMetricsView';
import { AdminSettingsView } from './views/AdminSettingsView';

export const AdminDashboard: React.FC = () => {
  const { 
    dashboardData, 
    isLoading, 
    error, 
    loadDashboardData, 
    clearError,
    collectAndSaveMetrics
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<AdminTabType>('game-analytics');

  useEffect(() => {
    loadDashboardData();
    collectAndSaveMetrics();
  }, [loadDashboardData, collectAndSaveMetrics]);

  if (isLoading) {
    return <AdminLoading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-600 text-center">
            <h2 className="text-xl font-bold mb-4">Error</h2>
            <p className="mb-4">{error}</p>
            <button
              onClick={() => {
                clearError();
                loadDashboardData();
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard de Administración</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestión y análisis de usuarios y sesiones de juego
              </p>
            </div>
            <AdminHeader />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs Navigation */}
        <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        {activeTab === 'game-analytics' && <AdminGameAnalyticsView data={dashboardData} />}
        {activeTab === 'users' && <AdminUsersView data={dashboardData} />}
        {activeTab === 'sessions' && <AdminSessionsView data={dashboardData} />}
        {activeTab === 'metrics' && <AdminMetricsView data={dashboardData} />}
        {activeTab === 'settings' && <AdminSettingsView />}
      </div>
    </div>
  );
};