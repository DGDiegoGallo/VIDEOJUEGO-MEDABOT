import React, { useState } from 'react';
import { FaCog, FaPlay, FaSignOutAlt, FaTasks, FaTimes, FaBolt, FaMagic, FaCrosshairs } from 'react-icons/fa';
import { GiDeathSkull } from 'react-icons/gi';

interface GameMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  playerStats: {
    level: number;
    enemiesKilled: number;
    skills: {
      rapidFire: number;
      magneticField: number;
      multiShot: number;
    };
  };
  equipment?: {
    items: Array<{
      name: string;
      type: string;
      rarity: string;
      effects: Array<{
        type: string;
        value: number;
        unit: string;
      }>;
    }>;
    stats: {
      maxHealth: number;
      damage: number;
      speed: number;
      fireRate: number;
      projectileCount: number;
      criticalChance: number;
      shieldStrength: number;
      bulletSpeed: number;
      bulletLifetime: number;
      magneticRange: number;
      experienceMultiplier: number;
    };
  };
}

interface DailyMission {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: string;
  completed: boolean;
}

export const GameMenu: React.FC<GameMenuProps> = ({
  isOpen,
  onClose,
  onLogout,
  playerStats
}) => {
  const [activeTab, setActiveTab] = useState<'main' | 'missions' | 'stats'>('main');

  // Mock data para misiones diarias
  const dailyMissions: DailyMission[] = [
    {
      id: '1',
      title: 'Exterminador',
      description: 'Elimina 50 enemigos',
      progress: Math.min(playerStats.enemiesKilled, 50),
      target: 50,
      reward: '500 XP',
      completed: playerStats.enemiesKilled >= 50
    },
    {
      id: '2',
      title: 'Superviviente',
      description: 'Sobrevive 3 minutos',
      progress: 0, // Placeholder
      target: 180,
      reward: '300 XP',
      completed: false
    },
    {
      id: '3',
      title: 'Maestro de Habilidades',
      description: 'Alcanza nivel 5',
      progress: Math.min(playerStats.level, 5),
      target: 5,
      reward: '1000 XP',
      completed: playerStats.level >= 5
    }
  ];

  if (!isOpen) return null;

  const renderMainMenu = () => (
    <div className="space-y-4">
      <button
        onClick={onClose}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-lg game-menu-button flex items-center justify-center space-x-2 shadow-lg"
      >
        <FaPlay className="text-lg" />
        <span>Reanudar Juego</span>
      </button>

      <button
        onClick={() => setActiveTab('missions')}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg game-menu-button flex items-center justify-center space-x-2 shadow-lg"
      >
        <FaTasks className="text-lg" />
        <span>Misiones Diarias</span>
      </button>

      <button
        onClick={() => setActiveTab('stats')}
        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-4 rounded-lg game-menu-button flex items-center justify-center space-x-2 shadow-lg"
      >
        <FaCog className="text-lg" />
        <span>Estadísticas</span>
      </button>

      <div className="border-t border-gray-600 pt-4">
        <button
          onClick={onLogout}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-4 rounded-lg game-menu-button flex items-center justify-center space-x-2 shadow-lg"
        >
          <FaSignOutAlt className="text-lg" />
          <span>Salir al Menú Principal</span>
        </button>
      </div>
    </div>
  );

  const renderMissions = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <FaTasks className="text-blue-400" />
          <span>Misiones Diarias</span>
        </h3>
        <button
          onClick={() => setActiveTab('main')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <FaTimes className="text-lg" />
        </button>
      </div>

      <div className="space-y-3">
        {dailyMissions.map((mission) => (
          <div
            key={mission.id}
            className={`bg-gradient-to-r p-4 rounded-lg border transition-all duration-200 ${
              mission.completed
                ? 'from-green-900/50 to-green-800/50 border-green-600/50'
                : 'from-gray-800/50 to-gray-900/50 border-gray-600/50 hover:border-gray-500/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-semibold">{mission.title}</h4>
              {mission.completed && (
                <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                  ✓ Completada
                </div>
              )}
            </div>
            
            <p className="text-gray-300 text-sm mb-3">{mission.description}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Progreso</span>
                <span className="text-white font-semibold">
                  {mission.progress}/{mission.target}
                </span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    mission.completed
                      ? 'bg-gradient-to-r from-green-500 to-green-400'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500'
                  }`}
                  style={{ width: `${(mission.progress / mission.target) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-yellow-400 text-sm font-semibold">
                  Recompensa: {mission.reward}
                </span>
                <span className="text-gray-400 text-xs">
                  {Math.round((mission.progress / mission.target) * 100)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <FaCog className="text-purple-400" />
          <span>Estadísticas del Jugador</span>
        </h3>
        <button
          onClick={() => setActiveTab('main')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <FaTimes className="text-lg" />
        </button>
      </div>

      {/* Estadísticas Generales */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg p-4 border border-gray-600/50">
        <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
          <GiDeathSkull className="text-red-400" />
          <span>Estadísticas Generales</span>
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 animate-count-up">{playerStats.level}</div>
            <div className="text-gray-400 text-sm">Nivel Actual</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400 animate-count-up">{playerStats.enemiesKilled}</div>
            <div className="text-gray-400 text-sm">Enemigos Eliminados</div>
          </div>
        </div>
      </div>

      {/* Habilidades Activas */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg p-4 border border-gray-600/50">
        <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
          <FaMagic className="text-blue-400" />
          <span>Habilidades Activas</span>
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaBolt className="text-yellow-400" />
              <span className="text-white">Disparo Rápido</span>
            </div>
            <div className="bg-yellow-900/30 px-3 py-1 rounded-full border border-yellow-700/30 skill-level-indicator">
              <span className="text-yellow-400 font-bold">Nivel {playerStats.skills.rapidFire}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-blue-400">🧲</div>
              <span className="text-white">Campo Magnético</span>
            </div>
            <div className="bg-blue-900/30 px-3 py-1 rounded-full border border-blue-700/30 skill-level-indicator">
              <span className="text-blue-400 font-bold">Nivel {playerStats.skills.magneticField}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaCrosshairs className="text-red-400" />
              <span className="text-white">Disparo Múltiple</span>
            </div>
            <div className="bg-red-900/30 px-3 py-1 rounded-full border border-red-700/30 skill-level-indicator">
              <span className="text-red-400 font-bold">Nivel {playerStats.skills.multiShot}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Armas (Placeholder) */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg p-4 border border-gray-600/50">
        <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
          <FaCrosshairs className="text-orange-400" />
          <span>Arsenal</span>
        </h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🔫</span>
              </div>
              <div>
                <div className="text-white font-medium">Blaster Básico</div>
                <div className="text-gray-400 text-xs">Arma principal</div>
              </div>
            </div>
            <div className="bg-green-900/30 px-2 py-1 rounded border border-green-700/30">
              <span className="text-green-400 text-xs">Equipado</span>
            </div>
          </div>
          
          <div className="text-center py-4">
            <div className="text-gray-500 text-sm">Más armas próximamente...</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-menu-fade-in">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto animate-menu-slide-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Menú del Juego
          </h2>
          {activeTab === 'main' && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          )}
        </div>

        {/* Content */}
        {activeTab === 'main' && renderMainMenu()}
        {activeTab === 'missions' && renderMissions()}
        {activeTab === 'stats' && renderStats()}
      </div>
    </div>
  );
};