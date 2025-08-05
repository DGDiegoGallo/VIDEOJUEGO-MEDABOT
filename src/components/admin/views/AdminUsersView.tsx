import React from 'react';
import { AdminUserTable } from '../AdminUserTable';
import { AdminFilters } from '../AdminFilters';
import type { AdminDashboardData } from '@/types/admin';

interface AdminUsersViewProps {
  data: AdminDashboardData | null;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({ data }) => {
  return (
    <div className="space-y-8">
      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Usuarios</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data?.totalUsers || 0}
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
              <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data?.activeUsers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-lg p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nuevos Hoy</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data?.users.filter(user => {
                  const today = new Date().toDateString();
                  return new Date(user.createdAt).toDateString() === today;
                }).length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AdminFilters />

      {/* Users Table */}
      <AdminUserTable />
    </div>
  );
};