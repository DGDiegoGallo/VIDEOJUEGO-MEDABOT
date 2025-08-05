import React from 'react';
import { 
  FiHome, 
  FiUsers, 
  FiPlay, 
  FiActivity, 
  FiSettings,
  FiSearch,
  FiEye,
  FiEdit,
  FiTrash2,
  FiX,
  FiUser,
  FiMail,
  FiCalendar,
  FiTrendingUp,
  FiUserCheck,
  FiClock,
  FiZap,
  FiLogOut,
  FiRefreshCw,
  FiDownload,
  FiAlertTriangle
} from 'react-icons/fi';

export const AdminIconTest: React.FC = () => {
  const icons = [
    { name: 'FiHome', icon: FiHome },
    { name: 'FiUsers', icon: FiUsers },
    { name: 'FiPlay', icon: FiPlay },
    { name: 'FiActivity', icon: FiActivity },
    { name: 'FiSettings', icon: FiSettings },
    { name: 'FiSearch', icon: FiSearch },
    { name: 'FiEye', icon: FiEye },
    { name: 'FiEdit', icon: FiEdit },
    { name: 'FiTrash2', icon: FiTrash2 },
    { name: 'FiX', icon: FiX },
    { name: 'FiUser', icon: FiUser },
    { name: 'FiMail', icon: FiMail },
    { name: 'FiCalendar', icon: FiCalendar },
    { name: 'FiTrendingUp', icon: FiTrendingUp },
    { name: 'FiUserCheck', icon: FiUserCheck },
    { name: 'FiClock', icon: FiClock },
    { name: 'FiZap', icon: FiZap },
    { name: 'FiLogOut', icon: FiLogOut },
    { name: 'FiRefreshCw', icon: FiRefreshCw },
    { name: 'FiDownload', icon: FiDownload },
    { name: 'FiAlertTriangle', icon: FiAlertTriangle }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Test de Iconos</h3>
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {icons.map(({ name, icon: Icon }) => (
          <div key={name} className="flex flex-col items-center p-2 border rounded">
            <Icon className="h-6 w-6 text-gray-600 mb-1" />
            <span className="text-xs text-gray-500 text-center">{name}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-green-600">
        ✅ Todos los iconos se cargan correctamente
      </div>
    </div>
  );
};