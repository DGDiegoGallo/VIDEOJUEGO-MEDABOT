import React from 'react';
import { StatCard } from '@/types/userStats';
import { 
  FaCrosshairs, 
  FaBullseye, 
  FaTrophy, 
  FaClock,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

// Mapeo de strings de iconos a componentes
const iconMap = {
  FaCrosshairs,
  FaBullseye,
  FaTrophy,
  FaClock
};

interface UserStatsCardProps {
  stat: StatCard;
  isLoading?: boolean;
}

export const UserStatsCard: React.FC<UserStatsCardProps> = ({ stat, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-700 rounded w-24"></div>
          <div className="h-6 w-6 bg-gray-700 rounded"></div>
        </div>
        <div className="h-8 bg-gray-700 rounded w-16 mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-32"></div>
      </div>
    );
  }

  // Obtener el componente de icono del mapeo
  const IconComponent = iconMap[stat.icon as keyof typeof iconMap];

  return (
    <div className={`bg-gradient-to-br ${stat.color} rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white/90">{stat.title}</h3>
        {IconComponent && <IconComponent className="text-2xl text-white/80" />}
      </div>
      
      <div className="mb-2">
        <div className="text-3xl font-bold text-white">
          {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
        </div>
      </div>
      
      {stat.subtitle && (
        <div className="text-sm text-white/70 mb-3">
          {stat.subtitle}
        </div>
      )}
      
      {stat.trend && (
        <div className="flex items-center">
          <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full ${
            stat.trend.isPositive 
              ? 'bg-green-500/20 text-green-300' 
              : 'bg-red-500/20 text-red-300'
          }`}>
            {stat.trend.isPositive ? (
              <FaArrowUp className="mr-1" />
            ) : (
              <FaArrowDown className="mr-1" />
            )}
            {stat.trend.value}
            {stat.title === 'Precisión' || stat.title === 'Victorias' ? '%' : ''}
          </span>
        </div>
      )}
    </div>
  );
};

interface UserStatsGridProps {
  stats: StatCard[];
  isLoading?: boolean;
}

export const UserStatsGrid: React.FC<UserStatsGridProps> = ({ stats, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <UserStatsCard 
            key={index} 
            stat={{
              title: '',
              value: 0,
              icon: 'FaClock',
              color: 'from-gray-600 to-gray-700'
            }} 
            isLoading={true} 
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <UserStatsCard key={index} stat={stat} />
      ))}
    </div>
  );
}; 