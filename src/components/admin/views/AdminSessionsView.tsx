import React from 'react';
import { AdminGameSessionTable } from '../AdminGameSessionTable';
import { AdminFilters } from '../AdminFilters';
import type { AdminDashboardData } from '@/types/admin';

interface AdminSessionsViewProps {
  data: AdminDashboardData | null;
}

export const AdminSessionsView: React.FC<AdminSessionsViewProps> = ({ data }) => {
  const completedSessions = data?.gameSessions.filter(s => s.status === 'completed').length || 0;
  const activeSessions = data?.gameSessions.filter(s => s.status === 'active').length || 0;
  const abandonedSessions = data?.gameSessions.filter(s => s.status === 'abandoned').length || 0;

  return (
    <div className="space-y-8">
      {/* Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4V8a3 3 0 016 0v2M5 12h14l-1 7H6l-1-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sesiones</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data?.totalSessions || 0}
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
              <p className="text-sm font-medium text-gray-600">Completadas</p>
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
              <p className="text-sm font-medium text-gray-600">Activas</p>
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
              <p className="text-sm font-medium text-gray-600">Abandonadas</p>
              <p className="text-2xl font-semibold text-gray-900">{abandonedSessions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AdminFilters />

      {/* Sessions Table */}
      <AdminGameSessionTable />
    </div>
  );
};