import React from 'react';
import { 
  FaGem, 
  FaBolt, 
  FaCube, 
  FaCoins, 
  FaExclamationTriangle,
  FaCheckCircle 
} from 'react-icons/fa';
import { GiIronCross, GiSteelClaws } from 'react-icons/gi';

interface MaterialsDisplayProps {
  materials: {
    iron: number;
    steel: number;
    energy_crystals: number;
  };
  showTitle?: boolean;
  compact?: boolean;
}

export const MaterialsDisplay: React.FC<MaterialsDisplayProps> = ({ 
  materials, 
  showTitle = true,
  compact = false 
}) => {
  const { iron, steel, energy_crystals } = materials;

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getEnergyCrystalStatus = () => {
    if (energy_crystals >= 1000) return 'excellent';
    if (energy_crystals >= 500) return 'good';
    if (energy_crystals >= 100) return 'fair';
    return 'low';
  };

  const energyStatus = getEnergyCrystalStatus();

  if (compact) {
    return (
      <div className="flex items-center space-x-3">
        {/* Energy Crystals - Moneda Gratuita */}
        <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg px-3 py-2 border border-purple-500/30">
          <FaGem className="text-purple-400 text-lg animate-pulse" />
          <div>
            <div className="text-purple-300 text-xs font-semibold">CRISTALES</div>
            <div className="text-purple-100 font-bold">{formatNumber(energy_crystals)}</div>
          </div>
        </div>

        {/* Iron */}
        <div className="flex items-center space-x-2 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg px-3 py-2 border border-gray-600/30">
          <GiIronCross className="text-gray-400 text-lg" />
          <div>
            <div className="text-gray-300 text-xs font-semibold">HIERRO</div>
            <div className="text-gray-100 font-bold">{formatNumber(iron)}</div>
          </div>
        </div>

        {/* Steel */}
        <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-lg px-3 py-2 border border-blue-600/30">
          <GiSteelClaws className="text-blue-400 text-lg" />
          <div>
            <div className="text-blue-300 text-xs font-semibold">ACERO</div>
            <div className="text-blue-100 font-bold">{formatNumber(steel)}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
      {showTitle && (
        <h3 className="text-2xl font-bold text-white flex items-center mb-6">
          <FaCube className="mr-3 text-blue-400" />
          Materiales del Combatiente
        </h3>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Energy Crystals - Moneda Gratuita (Destacada) */}
        <div className="relative bg-gradient-to-br from-purple-900/60 to-pink-900/60 border-2 border-purple-500/50 rounded-xl p-4 transform hover:scale-105 transition-all duration-300">
          {/* Badge de "GRATUITO" */}
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            GRATUITO
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <FaGem className="text-4xl text-purple-400 animate-pulse" />
                <FaBolt className="text-lg text-yellow-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-purple-200">Cristales de Energía</h4>
                <p className="text-purple-300 text-sm">Moneda del juego</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-100 mb-2">
              {formatNumber(energy_crystals)}
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center justify-center space-x-2">
              {energyStatus === 'excellent' && (
                <div className="flex items-center text-green-400">
                  <FaCheckCircle className="mr-1" />
                  <span className="text-sm font-semibold">Excelente</span>
                </div>
              )}
              {energyStatus === 'good' && (
                <div className="flex items-center text-blue-400">
                  <FaCheckCircle className="mr-1" />
                  <span className="text-sm font-semibold">Bueno</span>
                </div>
              )}
              {energyStatus === 'fair' && (
                <div className="flex items-center text-yellow-400">
                  <FaExclamationTriangle className="mr-1" />
                  <span className="text-sm font-semibold">Regular</span>
                </div>
              )}
              {energyStatus === 'low' && (
                <div className="flex items-center text-red-400">
                  <FaExclamationTriangle className="mr-1" />
                  <span className="text-sm font-semibold">Bajo</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Tooltip info */}
          <div className="mt-3 p-2 bg-purple-800/30 rounded-lg">
            <p className="text-purple-200 text-xs">
              Gana cristales jugando y completando misiones
            </p>
          </div>
        </div>

        {/* Iron */}
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 border border-gray-600/50 rounded-xl p-4 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <GiIronCross className="text-4xl text-gray-400" />
              <div>
                <h4 className="text-lg font-bold text-gray-200">Hierro</h4>
                <p className="text-gray-300 text-sm">Material básico</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-100 mb-2">
              {formatNumber(iron)}
            </div>
            <div className="text-gray-400 text-sm">
              Para fabricación
            </div>
          </div>
        </div>

        {/* Steel */}
        <div className="bg-gradient-to-br from-blue-800/60 to-cyan-800/60 border border-blue-600/50 rounded-xl p-4 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <GiSteelClaws className="text-4xl text-blue-400" />
              <div>
                <h4 className="text-lg font-bold text-blue-200">Acero</h4>
                <p className="text-blue-300 text-sm">Material avanzado</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-100 mb-2">
              {formatNumber(steel)}
            </div>
            <div className="text-blue-400 text-sm">
              Para mejoras
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de materiales */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FaCoins className="text-yellow-400" />
            <span className="text-gray-300 font-semibold">Total de Materiales:</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatNumber(iron + steel + energy_crystals)}
          </div>
        </div>
        
        {/* Recomendación basada en energy_crystals */}
        {energy_crystals < 100 && (
          <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <FaExclamationTriangle className="text-yellow-400" />
              <span className="text-yellow-200 text-sm font-semibold">
                ¡Juega más para ganar cristales de energía!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 