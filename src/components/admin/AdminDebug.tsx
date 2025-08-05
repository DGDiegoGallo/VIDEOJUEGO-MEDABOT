import React from 'react';
import { useAdminStore } from '@/stores/adminStore';

export const AdminDebug: React.FC = () => {
  const { dashboardData } = useAdminStore();

  if (!dashboardData) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Debug - No Data</h3>
        <p className="text-gray-600">No dashboard data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Debug Information</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-700">Users ({dashboardData.users.length})</h4>
          <div className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
            <pre>{JSON.stringify(dashboardData.users, null, 2)}</pre>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700">Sessions ({dashboardData.gameSessions.length})</h4>
          <div className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
            <pre>{JSON.stringify(dashboardData.gameSessions, null, 2)}</pre>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700">Stats</h4>
          <div className="bg-gray-100 p-3 rounded text-xs">
            <p>Total Users: {dashboardData.totalUsers}</p>
            <p>Total Sessions: {dashboardData.totalSessions}</p>
            <p>Active Users: {dashboardData.activeUsers}</p>
          </div>
        </div>
      </div>
    </div>
  );
};