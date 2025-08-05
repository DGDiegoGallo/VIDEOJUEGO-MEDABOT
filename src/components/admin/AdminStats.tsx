import React from 'react';
import { FiUsers, FiPlay, FiUserCheck, FiTrendingUp } from 'react-icons/fi';
import type { AdminDashboardData } from '@/types/admin';

interface AdminStatsProps {
  data: AdminDashboardData | null;
}

export const AdminStats: React.FC<AdminStatsProps> = ({ data }) => {
  const stats = [
    {
      name: 'Total de Usuarios',
      value: data?.totalUsers || 0,
      icon: FiUsers,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Sesiones de Juego',
      value: data?.totalSessions || 0,
      icon: FiPlay,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Usuarios Activos',
      value: data?.activeUsers || 0,
      icon: FiUserCheck,
      color: 'bg-purple-500',
      change: '+5%',
      changeType: 'positive'
    },
    {
      name: 'Promedio de Experiencia',
      value: data?.users && data.users.length > 0 ? Math.round(data.users.reduce((sum, user) => sum + user.experience, 0) / data.users.length) : 0,
      icon: FiTrendingUp,
      color: 'bg-orange-500',
      change: '+15%',
      changeType: 'positive'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className={`ml-2 text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};