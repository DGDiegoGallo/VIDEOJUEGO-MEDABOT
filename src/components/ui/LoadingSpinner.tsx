import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      <span className="text-gray-400">Cargando...</span>
    </div>
  );
};