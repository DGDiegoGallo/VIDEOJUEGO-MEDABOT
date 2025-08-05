import React from 'react';
import { FiUsers, FiPlay, FiBarChart } from 'react-icons/fi';

interface AdminEmptyStateProps {
  type: 'users' | 'sessions' | 'metrics';
  title?: string;
  description?: string;
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({ 
  type, 
  title, 
  description 
}) => {
  const getConfig = () => {
    switch (type) {
      case 'users':
        return {
          icon: FiUsers,
          defaultTitle: 'No hay usuarios registrados',
          defaultDescription: 'Cuando los usuarios se registren, aparecerán aquí.',
          color: 'text-blue-500',
          bgColor: 'bg-blue-100'
        };
      case 'sessions':
        return {
          icon: FiPlay,
          defaultTitle: 'No hay sesiones de juego',
          defaultDescription: 'Las sesiones de juego aparecerán aquí cuando los usuarios jueguen.',
          color: 'text-green-500',
          bgColor: 'bg-green-100'
        };
      case 'metrics':
        return {
          icon: FiBarChart,
          defaultTitle: 'No hay métricas disponibles',
          defaultDescription: 'Las métricas de rendimiento se mostrarán aquí.',
          color: 'text-purple-500',
          bgColor: 'bg-purple-100'
        };
      default:
        return {
          icon: FiUsers,
          defaultTitle: 'No hay datos',
          defaultDescription: 'Los datos aparecerán aquí cuando estén disponibles.',
          color: 'text-gray-500',
          bgColor: 'bg-gray-100'
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
      <div className={`${config.bgColor} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
        <Icon className={`h-8 w-8 ${config.color}`} />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title || config.defaultTitle}
      </h3>
      <p className="text-gray-500 max-w-md mx-auto">
        {description || config.defaultDescription}
      </p>
      
      {/* Sample data indicator */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          💡 <strong>Datos de muestra:</strong> Este dashboard funciona mejor con más datos. 
          A medida que los usuarios interactúen con la aplicación, verás más información aquí.
        </p>
      </div>
    </div>
  );
};