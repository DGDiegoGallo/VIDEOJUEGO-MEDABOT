import React, { memo } from 'react';
import { FaBolt, FaHeart, FaStar, FaClock, FaMap, FaCube } from 'react-icons/fa';
import { GiDeathSkull } from 'react-icons/gi';
import { Minimap } from './Minimap';

interface GameUIProps {
  health: number;
  maxHealth: number;
  score: number;
  time: number;
  experience: number;
  maxExperience: number;
  level: number;
  skills?: {
    rapidFire: number;
    magneticField: number;
    multiShot: number;
  };
  world?: {
    playerX: number;
    playerY: number;
    activeChunks: number;
    totalChunks: number;
    structures: number;
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
  onMenuToggle: () => void;
  minimapData?: {
    playerChunk: { x: number; y: number };
    worldSize: number;
    activeChunks: string[];
    playerPosition: { x: number; y: number };
    enemies?: Array<{
      id: string;
      x: number;
      y: number;
      type: string;
      distance: number;
    }>;
  };
}

export const GameUI: React.FC<GameUIProps> = memo(({
  health = 100,
  maxHealth = 100,
  score = 0,
  time = 0,
  experience = 0,
  maxExperience = 100,
  level = 1,
  skills = { rapidFire: 0, magneticField: 0, multiShot: 0 },
  world,
  equipment,
  onMenuToggle,
  minimapData
}) => {
  const healthPercentage = (health / maxHealth) * 100;
  const expPercentage = (experience / maxExperience) * 100;





  const formatTimeRemaining = (seconds: number) => {
    const maxTime = 8 * 60; // 8 minutes in seconds
    const remaining = Math.max(0, maxTime - seconds);
    const minutes = Math.floor(remaining / 60);
    const remainingSeconds = Math.floor(remaining % 60);
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (seconds: number) => {
    const maxTime = 8 * 60; // 8 minutes in seconds
    const remaining = maxTime - seconds;
    
    if (remaining <= 60) return 'text-red-400'; // Last minute - red
    if (remaining <= 120) return 'text-orange-400'; // Last 2 minutes - orange
    if (remaining <= 180) return 'text-yellow-400'; // Last 3 minutes - yellow
    return 'text-blue-400'; // Normal - blue
  };

  return (
    <>
      {/* Main HUD - Estilo Landing Page */}
      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-50">
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-700/50 shadow-2xl">
          {/* Header con logo y modo */}
          <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
            <div className="flex items-center space-x-1 md:space-x-2">
              <GiDeathSkull className="text-red-500 text-xl md:text-2xl animate-pulse" />
              <div>
                <h3 className="text-white font-bold text-sm md:text-lg bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  MEDABOT
                </h3>
                <p className="text-xs text-gray-400 hidden md:block">SURVIVAL MODE</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <FaBolt className="text-yellow-500 text-xs md:text-sm animate-pulse" />
              <span className="text-yellow-400 text-xs font-semibold">NIVEL {level}</span>
            </div>
          </div>

          {/* Barra de Vida con Animación */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <FaHeart className="text-red-500 text-sm" />
                <span className="text-white text-sm font-semibold">VIDA</span>
              </div>
              <span className="text-white text-sm font-bold">{health}/{maxHealth}</span>
            </div>
            <div className={`relative w-32 md:w-48 h-2 md:h-3 bg-gray-700 rounded-full overflow-hidden border border-gray-600 ${healthPercentage < 30 ? 'animate-health-pulse' : ''}`}>
              {/* Fondo de la barra */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-900 to-red-800"></div>
              
              {/* Barra de vida principal */}
              <div 
                className={`absolute top-0 left-0 h-full transition-all duration-300 ease-out ${
                  healthPercentage > 60 
                    ? 'bg-gradient-to-r from-green-500 to-green-400' 
                    : healthPercentage > 30 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-400' 
                    : 'bg-gradient-to-r from-red-500 to-red-400'
                }`}
                style={{ width: `${healthPercentage}%` }}
              ></div>
              
              {/* Efecto de brillo animado */}
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
                style={{ width: `${healthPercentage}%` }}
              ></div>
              
              {/* Brillo que se mueve */}
              <div className="absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shine"></div>
            </div>
          </div>

          {/* Barra de Experiencia */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <FaStar className="text-yellow-500 text-sm" />
                <span className="text-white text-sm font-semibold">EXP</span>
              </div>
              <span className="text-white text-sm font-bold">{experience}/{maxExperience}</span>
            </div>
            <div className="relative w-32 md:w-48 h-1.5 md:h-2 bg-gray-700 rounded-full overflow-hidden border border-gray-600 animate-exp-glow">
              {/* Fondo de la barra */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900"></div>
              
              {/* Barra de experiencia principal */}
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
                style={{ width: `${expPercentage}%` }}
              ></div>
              
              {/* Efecto de brillo en la barra de exp */}
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"
                style={{ width: `${expPercentage}%` }}
              ></div>
              
              {/* Brillo que se mueve en la barra de exp */}
              <div className="absolute top-0 left-0 h-full w-6 bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent animate-shine"></div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 rounded-lg p-2 border border-yellow-700/30">
              <div className="flex items-center space-x-2">
                <FaStar className="text-yellow-500 text-sm" />
                <div>
                  <p className="text-yellow-400 text-xs font-semibold">PUNTOS</p>
                  <p className="text-white text-sm font-bold">{score.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-lg p-2 border border-blue-700/30">
              <div className="flex items-center space-x-2">
                <FaClock className={`${getTimeColor(time)} text-sm`} />
                <div>
                  <p className={`${getTimeColor(time)} text-xs font-semibold`}>RESTANTE</p>
                  <p className="text-white text-sm font-bold">{formatTimeRemaining(time)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Skills */}
          {(skills.rapidFire > 0 || skills.magneticField > 0 || skills.multiShot > 0) && (
            <div className="mt-3 pt-3 border-t border-gray-700/50">
              <p className="text-gray-400 text-xs mb-2 font-semibold">HABILIDADES ACTIVAS</p>
              <div className="grid grid-cols-3 gap-2">
                {skills.rapidFire > 0 && (
                  <div className="bg-yellow-900/30 rounded px-2 py-1 border border-yellow-700/30">
                    <div className="text-center">
                      <FaBolt className="text-yellow-400 text-xs mx-auto mb-1" />
                      <span className="text-yellow-400 text-xs font-bold">{skills.rapidFire}</span>
                    </div>
                  </div>
                )}
                {skills.magneticField > 0 && (
                  <div className="bg-blue-900/30 rounded px-2 py-1 border border-blue-700/30">
                    <div className="text-center">
                      <div className="text-blue-400 text-xs mx-auto mb-1">🧲</div>
                      <span className="text-blue-400 text-xs font-bold">{skills.magneticField}</span>
                    </div>
                  </div>
                )}
                {skills.multiShot > 0 && (
                  <div className="bg-red-900/30 rounded px-2 py-1 border border-red-700/30">
                    <div className="text-center">
                      <div className="text-red-400 text-xs mx-auto mb-1">🔫</div>
                      <span className="text-red-400 text-xs font-bold">{skills.multiShot}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Equipment Effects */}
          {equipment?.items && equipment.items.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-700/50">
              <p className="text-gray-400 text-xs mb-2 font-semibold">EQUIPAMIENTO ACTIVO</p>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {equipment.items.slice(0, 3).map((item, index) => (
                  <div key={index} className={`
                    rounded px-2 py-1 border text-xs
                    ${item.rarity === 'legendary' ? 'bg-purple-900/30 border-purple-700/30' :
                      item.rarity === 'epic' ? 'bg-orange-900/30 border-orange-700/30' :
                      item.rarity === 'rare' ? 'bg-blue-900/30 border-blue-700/30' :
                      'bg-gray-900/30 border-gray-700/30'}
                  `}>
                    <div className="flex items-center justify-between">
                      <span className={`
                        font-semibold truncate
                        ${item.rarity === 'legendary' ? 'text-purple-400' :
                          item.rarity === 'epic' ? 'text-orange-400' :
                          item.rarity === 'rare' ? 'text-blue-400' :
                          'text-gray-400'}
                      `}>
                        {item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name}
                      </span>
                      <span className="text-white font-bold">
                        {item.effects[0]?.value || 0}
                      </span>
                    </div>
                  </div>
                ))}
                {equipment.items.length > 3 && (
                  <div className="text-center text-gray-500 text-xs">
                    +{equipment.items.length - 3} más...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* World Info */}
          {world && (
            <div className="mt-3 pt-3 border-t border-gray-700/50">
              <p className="text-gray-400 text-xs mb-2 font-semibold">MUNDO PROCEDURAL</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-purple-900/30 rounded px-2 py-1 border border-purple-700/30">
                  <div className="flex items-center space-x-1">
                    <FaMap className="text-purple-400" />
                    <span className="text-purple-400">Pos:</span>
                  </div>
                  <span className="text-white font-mono text-xs">
                    {Math.round(world.playerX)}, {Math.round(world.playerY)}
                  </span>
                </div>
                <div className="bg-green-900/30 rounded px-2 py-1 border border-green-700/30">
                  <div className="flex items-center space-x-1">
                    <FaCube className="text-green-400" />
                    <span className="text-green-400">Chunks:</span>
                  </div>
                  <span className="text-white font-mono text-xs">
                    {world.activeChunks}/{world.totalChunks}
                  </span>
                </div>
              </div>
              {world.structures > 0 && (
                <div className="mt-2 bg-orange-900/30 rounded px-2 py-1 border border-orange-700/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <div className="text-orange-400 text-xs">🏗️</div>
                      <span className="text-orange-400 text-xs">Estructuras:</span>
                    </div>
                    <span className="text-white font-mono text-xs">{world.structures}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tips */}
          <div className="mt-3 pt-3 border-t border-gray-700/50">
            <div className="text-gray-400 text-xs space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Explora el mundo infinito</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Cruza ríos por los puentes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>Las balas rebotan en estructuras</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Button */}
      <div className="absolute top-2 right-2 md:top-4 md:right-4 z-50">
        <button
          onClick={onMenuToggle}
          className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm hover:from-gray-700/90 hover:to-gray-800/90 rounded-lg p-3 transition-all duration-200 border border-gray-700/50 shadow-lg"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Minimap */}
      {minimapData && (
        <Minimap
          playerChunk={minimapData.playerChunk}
          worldSize={minimapData.worldSize}
          activeChunks={minimapData.activeChunks}
          playerPosition={minimapData.playerPosition}
          enemies={minimapData.enemies}
        />
      )}
    </>
  );
});