import React from 'react';
import { FiHome, FiUsers, FiPlay, FiActivity, FiSettings } from 'react-icons/fi';

export type AdminTabType = 'game-analytics' | 'users' | 'sessions' | 'metrics' | 'settings';

interface AdminTabsProps {
  activeTab: AdminTabType;
  onTabChange: (tab: AdminTabType) => void;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'game-analytics' as AdminTabType,
      name: 'Análisis de Juego',
      icon: FiHome,
      description: 'Estadísticas detalladas del juego'
    },
    {
      id: 'users' as AdminTabType,
      name: 'Usuarios',
      icon: FiUsers,
      description: 'Gestión de usuarios'
    },
    {
      id: 'sessions' as AdminTabType,
      name: 'Sesiones',
      icon: FiPlay,
      description: 'Sesiones de juego'
    },
    {
      id: 'metrics' as AdminTabType,
      name: 'Métricas',
      icon: FiActivity,
      description: 'Rendimiento y análisis'
    },
    {
      id: 'settings' as AdminTabType,
      name: 'Configuración',
      icon: FiSettings,
      description: 'Configuración del sistema'
    }
  ];

  return (
    <div className="border-b border-gray-200 mb-8">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className={`mr-2 h-5 w-5 ${
                isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};