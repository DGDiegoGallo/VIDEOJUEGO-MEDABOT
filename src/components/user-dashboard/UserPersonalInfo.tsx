import React from 'react';
import { UserPersonalData } from '@/types/userStats';
import { 
  FaUser, 
  FaEnvelope, 
  FaTag, 
  FaBirthdayCake, 
  FaVenusMars, 
  FaIdCard, 
  FaHome, 
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaCrown
} from 'react-icons/fa';

interface UserPersonalInfoProps {
  user: UserPersonalData;
  isLoading?: boolean;
}

export const UserPersonalInfo: React.FC<UserPersonalInfoProps> = ({ user, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-48 mb-6"></div>
        <div className="space-y-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="h-4 bg-gray-700 rounded w-24"></div>
              <div className="h-4 bg-gray-700 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatValue = (value: string | null | number | boolean): string => {
    if (value === null || value === undefined) {
      return 'No disponible';
    }
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }
    if (typeof value === 'string' && value.trim() === '') {
      return 'No disponible';
    }
    return String(value);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'No disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'No disponible';
    }
  };

  const getFullName = (): string => {
    const nombre = user.nombre?.trim();
    const apellido = user.apellido?.trim();
    
    if (nombre && apellido) {
      return `${nombre} ${apellido}`;
    } else if (nombre) {
      return nombre;
    } else if (apellido) {
      return apellido;
    }
    
    return user.username;
  };

  const InfoRow = ({ 
    label, 
    value, 
    icon: IconComponent 
  }: { 
    label: string; 
    value: string; 
    icon: React.ComponentType<{ className?: string }>;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
      <div className="flex items-center">
        <IconComponent className="text-blue-400 mr-3 text-lg" />
        <span className="text-gray-300 font-medium">{label}</span>
      </div>
      <span className={`text-right ${value === 'No disponible' ? 'text-gray-500 italic' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
      {/* Header del perfil */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <FaUser className="mr-2 text-blue-400" />
          Información Personal
        </h3>
        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
          user.confirmed 
            ? 'bg-green-500/20 text-green-300' 
            : 'bg-red-500/20 text-red-300'
        }`}>
          {user.confirmed ? (
            <>
              <FaCheckCircle className="mr-1" />
              Verificado
            </>
          ) : (
            <>
              <FaTimesCircle className="mr-1" />
              Sin verificar
            </>
          )}
        </div>
      </div>

      {/* Avatar y nombre principal */}
      <div className="flex items-center mb-6 p-4 bg-gray-800 rounded-lg">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mr-4">
          {getFullName().charAt(0).toUpperCase()}
        </div>
        <div>
          <h4 className="text-xl font-bold text-white">{getFullName()}</h4>
          <p className="text-gray-400">@{user.username}</p>
          <p className="text-sm text-gray-500">
            Miembro desde {formatDate(user.createdAt)}
          </p>
        </div>
      </div>

      {/* Información detallada */}
      <div className="space-y-0">
        <InfoRow
          label="Correo Electrónico"
          value={user.email}
          icon={FaEnvelope}
        />
        
        <InfoRow
          label="Nombre Completo"
          value={user.nombre || user.apellido ? `${formatValue(user.nombre)} ${formatValue(user.apellido)}`.trim() : 'No disponible'}
          icon={FaTag}
        />
        
        <InfoRow
          label="Fecha de Nacimiento"
          value={formatDate(user.fechaNacimiento)}
          icon={FaBirthdayCake}
        />
        
        <InfoRow
          label="Género"
          value={formatValue(user.genero)}
          icon={FaVenusMars}
        />
        
        <InfoRow
          label="Documento ID"
          value={formatValue(user.documentoID)}
          icon={FaIdCard}
        />
        
        <InfoRow
          label="Dirección"
          value={formatValue(user.direccion)}
          icon={FaHome}
        />
        
        <InfoRow
          label="Rol"
          value={formatValue(user.rol)}
          icon={FaCrown}
        />
      </div>

      {/* Estadísticas básicas de cuenta */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">#{user.id}</div>
            <div className="text-xs text-gray-400">ID de Usuario</div>
          </div>
          <div className="text-center bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">
              {user.confirmed ? <FaCheckCircle /> : <FaTimesCircle />}
            </div>
            <div className="text-xs text-gray-400">Estado</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 