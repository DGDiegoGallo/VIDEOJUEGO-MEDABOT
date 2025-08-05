import React from 'react';
import { FiX, FiUser, FiMail, FiCalendar, FiTrendingUp, FiPlay } from 'react-icons/fi';
import type { AdminUserData } from '@/types/admin';

interface AdminUserModalProps {
  user: AdminUserData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminUserModal: React.FC<AdminUserModalProps> = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Detalles del Usuario</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Avatar and Basic Info */}
          <div className="flex items-center mb-6">
            <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center mr-4">
              <span className="text-xl font-medium text-white">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{user.username}</h3>
              <p className="text-gray-600">
                {user.nombre && user.apellido 
                  ? `${user.nombre} ${user.apellido}` 
                  : 'No disponible'
                }
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <FiTrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Nivel</p>
              <p className="text-xl font-semibold text-gray-900">{user.level}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <FiPlay className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Experiencia</p>
              <p className="text-xl font-semibold text-gray-900">{user.experience}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <FiUser className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Sesiones</p>
              <p className="text-xl font-semibold text-gray-900">{user.totalSessions}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <FiCalendar className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Tiempo Total</p>
              <p className="text-xl font-semibold text-gray-900">{Math.round(user.totalPlayTime)}h</p>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="space-y-4">
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Información Personal</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <FiMail className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm text-gray-900 ml-2">{user.email}</span>
                </div>
                <div className="flex items-center">
                  <FiUser className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">ID:</span>
                  <span className="text-sm text-gray-900 ml-2">{user.id}</span>
                </div>
                <div className="flex items-center">
                  <FiUser className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Documento ID:</span>
                  <span className="text-sm text-gray-900 ml-2">{user.documentoID || 'No disponible'}</span>
                </div>
                <div className="flex items-center">
                  <FiCalendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Fecha de Nacimiento:</span>
                  <span className="text-sm text-gray-900 ml-2">
                    {user.fechaNacimiento 
                      ? new Date(user.fechaNacimiento).toLocaleDateString()
                      : 'No disponible'
                    }
                  </span>
                </div>
                <div className="flex items-center">
                  <FiCalendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Registro:</span>
                  <span className="text-sm text-gray-900 ml-2">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <FiCalendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Última actividad:</span>
                  <span className="text-sm text-gray-900 ml-2">
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : 'Nunca'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Resumen de Actividad</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{user.totalSessions}</p>
                    <p className="text-sm text-gray-600">Sesiones Totales</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{user.level}</p>
                    <p className="text-sm text-gray-600">Nivel Actual</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{user.experience}</p>
                    <p className="text-sm text-gray-600">Puntos de Experiencia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};