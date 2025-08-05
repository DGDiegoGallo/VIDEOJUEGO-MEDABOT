import React from 'react';
import { FiX, FiAlertTriangle } from 'react-icons/fi';
import type { AdminUserData } from '@/types/admin';

interface AdminDeleteUserModalProps {
  user: AdminUserData | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string) => void;
  isLoading: boolean;
}

export const AdminDeleteUserModal: React.FC<AdminDeleteUserModalProps> = ({ 
  user, 
  isOpen, 
  onClose, 
  onConfirm,
  isLoading 
}) => {
  if (!isOpen || !user) return null;

  const handleConfirm = () => {
    onConfirm(user.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FiAlertTriangle className="h-6 w-6 text-red-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Eliminar Usuario</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              ¿Estás seguro de que deseas eliminar al usuario <strong>{user.username}</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Esta acción no se puede deshacer y eliminará permanentemente:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Todos los datos del usuario</li>
              <li>Sus sesiones de juego ({user.totalSessions} sesiones)</li>
              <li>Su progreso y estadísticas</li>
              <li>Cualquier contenido asociado</li>
            </ul>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-2">
              <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-white">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.username}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Nombre:</span>
                <span className="ml-1 text-gray-900">
                  {user.nombre && user.apellido 
                    ? `${user.nombre} ${user.apellido}` 
                    : 'No disponible'
                  }
                </span>
              </div>
              <div>
                <span className="text-gray-500">Sesiones:</span>
                <span className="ml-1 text-gray-900">{user.totalSessions}</span>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm font-medium">
              ⚠️ Esta acción es irreversible
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                'Eliminar Usuario'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};