import React from 'react';
import { FiClock, FiZap, FiActivity, FiTrendingUp } from 'react-icons/fi';
import type { AdminMetricsData } from '@/types/admin';

interface AdminMetricsProps {
  data: AdminMetricsData | undefined;
}

export const AdminMetrics: React.FC<AdminMetricsProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Métricas de Rendimiento</h3>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const performanceMetrics = [
    {
      name: 'Tiempo de Carga',
      value: `${(data.performance.report.pageLoadTime / 1000).toFixed(2)}s`,
      icon: FiClock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Tiempo promedio de carga de página'
    },
    {
      name: 'First Contentful Paint',
      value: `${(data.performance.report.firstContentfulPaint / 1000).toFixed(2)}s`,
      icon: FiZap,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Tiempo hasta el primer contenido visible'
    },
    {
      name: 'Largest Contentful Paint',
      value: `${(data.performance.report.largestContentfulPaint / 1000).toFixed(2)}s`,
      icon: FiActivity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Tiempo hasta el contenido principal'
    },
    {
      name: 'Cumulative Layout Shift',
      value: data.performance.report.cumulativeLayoutShift.toFixed(3),
      icon: FiTrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Estabilidad visual de la página'
    }
  ];

  const engagementMetrics = [
    {
      name: 'Duración Promedio de Sesión',
      value: `${Math.round(data.userEngagement.averageSessionDuration)} min`,
      description: 'Tiempo promedio que los usuarios pasan en el juego'
    },
    {
      name: 'Tasa de Rebote',
      value: `${data.userEngagement.bounceRate.toFixed(1)}%`,
      description: 'Porcentaje de usuarios que abandonan rápidamente'
    },
    {
      name: 'Tasa de Retención',
      value: `${data.userEngagement.retentionRate.toFixed(1)}%`,
      description: 'Porcentaje de usuarios que regresan semanalmente'
    },
    {
      name: 'Tasa de Finalización',
      value: `${data.gameStats.completionRate.toFixed(1)}%`,
      description: 'Porcentaje de sesiones completadas exitosamente'
    }
  ];

  return (
    <div className="space-y-8 mb-8">
      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Métricas de Rendimiento Web</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {performanceMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className={`${metric.bgColor} rounded-lg p-2 mr-3`}>
                    <Icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                    <p className="text-xl font-semibold text-gray-900">{metric.value}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Métricas de Engagement</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {engagementMetrics.map((metric) => (
            <div key={metric.name} className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">{metric.name}</p>
              <p className="text-2xl font-semibold text-gray-900 mb-2">{metric.value}</p>
              <p className="text-xs text-gray-500">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Context */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contexto de Métricas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Página</p>
            <p className="text-lg font-semibold text-gray-900">{data.performance.page}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Dispositivo</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">{data.performance.device}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Puntuación General</p>
            <p className="text-lg font-semibold text-gray-900">{data.performance.value}ms</p>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Última actualización: {new Date(data.performance.timestamp).toLocaleString()}
      </div>
    </div>
  );
};