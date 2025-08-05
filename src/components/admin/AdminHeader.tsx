import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiRefreshCw, FiDownload } from 'react-icons/fi';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAuthStore } from '@/stores/authStore';
import { useAdminStore } from '@/stores/adminStore';

export const AdminHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { logout } = useAuthStore();
  const { exportToPDF, collectAndSaveMetrics } = useAdminStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex items-center space-x-4">
      {/* User Info */}
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-sm font-medium text-white">
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </span>
        </div>
        <div className="text-sm">
          <p className="font-medium text-gray-900">{user?.username}</p>
          <p className="text-gray-500">Administrador</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={collectAndSaveMetrics}
          className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
          title="Actualizar métricas de rendimiento"
        >
          <FiRefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Actualizar Métricas</span>
        </button>
        
        <button
          onClick={exportToPDF}
          className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          title="Exportar dashboard a PDF"
        >
          <FiDownload className="h-4 w-4" />
          <span className="hidden sm:inline">Exportar PDF</span>
        </button>
        
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
          title="Cerrar sesión"
        >
          <FiLogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </div>
  );
};