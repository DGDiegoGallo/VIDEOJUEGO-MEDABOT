import React from 'react';
import { UserProgressData, UserWeaponsData } from '@/types/userStats';
import { 
  FaRocket, 
  FaStar, 
  FaClipboardList, 
  FaTrophy, 
  FaCrosshairs,
  FaBullseye,
  FaDotCircle,
  FaClock,
  FaGamepad,
  FaFire,
  FaMedal,
  FaCrown
} from 'react-icons/fa';

interface UserProgressSectionProps {
  progress: UserProgressData;
  weapons: UserWeaponsData;
  isLoading?: boolean;
}

export const UserProgressSection: React.FC<UserProgressSectionProps> = ({ 
  progress, 
  weapons, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, index) => (
          <div key={index} className="bg-gray-900 rounded-lg p-6 border border-gray-700 animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 bg-gray-700 rounded w-24"></div>
                  <div className="h-4 bg-gray-700 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Función para crear barras de progreso
  const ProgressBar = ({ 
    label, 
    current, 
    max, 
    color = 'bg-blue-500',
    icon: IconComponent
  }: {
    label: string;
    current: number;
    max: number;
    color?: string;
    icon: React.ComponentType<{ className?: string }>;
  }) => {
    const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
    
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300 flex items-center">
            <IconComponent className="mr-2 text-blue-400" />
            {label}
          </span>
          <span className="text-sm text-gray-400">
            {current.toLocaleString()}/{max.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`${color} h-2 rounded-full transition-all duration-300 relative overflow-hidden`}
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {percentage.toFixed(1)}% completado
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Panel de Progreso General */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <FaRocket className="mr-2 text-blue-400" />
          Progreso del Jugador
        </h3>
        
        <div className="space-y-6">
          {/* Nivel y Experiencia */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-white flex items-center">
                <FaStar className="mr-2 text-yellow-400" />
                Nivel {progress.current_level}
              </h4>
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                {progress.levels_gained} subidas
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((progress.total_experience % 1000) / 10, 100)}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-400 mt-2">
              {progress.total_experience.toLocaleString()} EXP total
            </div>
          </div>

          {/* Misiones Diarias */}
          <ProgressBar
            label="Misiones Diarias"
            current={progress.daily_quests_completed}
            max={Math.max(progress.total_daily_quests, progress.daily_quests_completed)}
            color="bg-green-500"
            icon={FaClipboardList}
          />

          {/* Logros */}
          <ProgressBar
            label="Logros Desbloqueados"
            current={progress.achievements_unlocked}
            max={progress.total_achievements}
            color="bg-yellow-500"
            icon={FaTrophy}
          />

          {/* Estadísticas de Tiempo */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center bg-gray-800 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-400">
                {Math.floor(progress.total_playtime_minutes / 60)}h
              </div>
              <div className="text-xs text-gray-400">Tiempo total</div>
            </div>
            <div className="text-center bg-gray-800 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-400">
                {progress.sessions_today}
              </div>
              <div className="text-xs text-gray-400">Hoy jugadas</div>
            </div>
            <div className="text-center bg-gray-800 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-400">
                {progress.streak_days}
              </div>
              <div className="text-xs text-gray-400">Días seguidos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de Armas */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <FaBullseye className="mr-2 text-orange-400" />
          Arsenal de Combate
        </h3>
        
        <div className="space-y-6">
          {/* Estadísticas de Armas */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {weapons.weapons_unlocked}
                </div>
                <div className="text-sm text-gray-400">Desbloqueadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">
                  {weapons.total_weapons}
                </div>
                <div className="text-sm text-gray-400">Total</div>
              </div>
            </div>
            
            <ProgressBar
              label="Colección de Armas"
              current={weapons.weapons_unlocked}
              max={weapons.total_weapons}
              color="bg-orange-500"
              icon={FaDotCircle}
            />
          </div>

          {/* Arma Favorita */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
              <FaCrown className="mr-2 text-yellow-400" />
              Arma Favorita
            </h4>
            <div className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
              <div>
                <div className="font-semibold text-white">
                  {weapons.favorite_weapon}
                </div>
                <div className="text-sm text-gray-400">
                  Más utilizada
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-orange-400">
                  {weapons.weapons.length > 0 ? weapons.weapons[0]?.usage_count || 0 : 0}
                </div>
                <div className="text-xs text-gray-400">usos</div>
              </div>
            </div>
          </div>

          {/* Top 3 Armas */}
          {weapons.weapons.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                <FaMedal className="mr-2 text-yellow-400" />
                Top Armas
              </h4>
              <div className="space-y-2">
                {weapons.weapons.slice(0, 3).map((weapon, index) => (
                  <div key={weapon.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">
                        {index === 0 ? <FaMedal className="text-yellow-400" /> : 
                         index === 1 ? <FaMedal className="text-gray-300" /> : 
                         <FaMedal className="text-orange-400" />}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-white">{weapon.name}</div>
                        <div className="text-xs text-gray-400 capitalize">{weapon.rarity}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-orange-400">
                        {weapon.usage_count} usos
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 