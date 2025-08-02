import React from 'react';

interface LoadingScreenProps {
  isVisible: boolean;
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  isVisible, 
  message = "Generando mundo procedural..." 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-[100] flex items-center justify-center">
      <div className="text-center">
        {/* Logo/Título */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-2">
            MEDABOT
          </h1>
          <p className="text-gray-400 text-lg">SURVIVAL MODE</p>
        </div>

        {/* Spinner de carga */}
        <div className="mb-6">
          <div className="relative w-16 h-16 mx-auto">
            {/* Círculo exterior */}
            <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
            {/* Círculo animado */}
            <div className="absolute inset-0 border-4 border-transparent border-t-red-500 border-r-orange-500 rounded-full animate-spin"></div>
            {/* Círculo interior */}
            <div className="absolute inset-2 border-2 border-gray-600 rounded-full"></div>
            <div className="absolute inset-2 border-2 border-transparent border-b-yellow-500 border-l-red-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
        </div>

        {/* Mensaje de carga */}
        <div className="mb-4">
          <p className="text-white text-lg font-semibold mb-2">{message}</p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="text-gray-500 text-sm space-y-1">
          <p>🌍 Creando chunks procedurales</p>
          <p>🌊 Generando ríos y puentes</p>
          <p>🏗️ Colocando estructuras</p>
        </div>

        {/* Barra de progreso simulada */}
        <div className="mt-6 w-64 mx-auto">
          <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 h-full rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};