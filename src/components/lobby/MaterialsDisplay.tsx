import React from 'react';
import { 
  FaBolt, 
  FaCube, 
  FaCoins, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaHeart,
  FaAppleAlt
} from 'react-icons/fa';
import { GiSteelClaws } from 'react-icons/gi';

interface MaterialsDisplayProps {
  materials: {
    steel: number;
    energy_cells: number;
    medicine: number;
    food: number;
  };
  showTitle?: boolean;
  compact?: boolean;
}

export const MaterialsDisplay: React.FC<MaterialsDisplayProps> = ({ 
  materials, 
  showTitle = true,
  compact = false 
}) => {
  const { steel, energy_cells, medicine, food } = materials;

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getEnergyCellsStatus = () => {
    if (energy_cells >= 20) return 'excellent';
    if (energy_cells >= 10) return 'good';
    if (energy_cells >= 5) return 'fair';
    return 'low';
  };

  const getMedicineStatus = () => {
    if (medicine >= 10) return 'excellent';
    if (medicine >= 5) return 'good';
    if (medicine >= 2) return 'fair';
    return 'low';
  };

  const getFoodStatus = () => {
    if (food >= 15) return 'excellent';
    if (food >= 8) return 'good';
    if (food >= 4) return 'fair';
    return 'low';
  };

  const energyStatus = getEnergyCellsStatus();
  const medicineStatus = getMedicineStatus();
  const foodStatus = getFoodStatus();

  if (compact) {
    return (
      <div className="flex items-center space-x-3">
        {/* Steel */}
        <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-lg px-3 py-2 border border-blue-600/30">
          <GiSteelClaws className="text-blue-400 text-lg" />
          <div>
            <div className="text-blue-300 text-xs font-semibold">ACERO</div>
            <div className="text-blue-100 font-bold">{formatNumber(steel)}</div>
          </div>
        </div>

        {/* Energy Cells */}
        <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-900/50 to-orange-900/50 rounded-lg px-3 py-2 border border-yellow-600/30">
          <FaBolt className="text-yellow-400 text-lg" />
          <div>
            <div className="text-yellow-300 text-xs font-semibold">ENERGÍA</div>
            <div className="text-yellow-100 font-bold">{formatNumber(energy_cells)}</div>
          </div>
        </div>

        {/* Medicine */}
        <div className="flex items-center space-x-2 bg-gradient-to-r from-red-900/50 to-pink-900/50 rounded-lg px-3 py-2 border border-red-600/30">
          <FaHeart className="text-red-400 text-lg" />
          <div>
            <div className="text-red-300 text-xs font-semibold">MEDICINA</div>
            <div className="text-red-100 font-bold">{formatNumber(medicine)}</div>
          </div>
        </div>

        {/* Food */}
        <div className="flex items-center space-x-2 bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-lg px-3 py-2 border border-green-600/30">
          <FaAppleAlt className="text-green-400 text-lg" />
          <div>
            <div className="text-green-300 text-xs font-semibold">COMIDA</div>
            <div className="text-green-100 font-bold">{formatNumber(food)}</div>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Steel */}
        <div className="bg-gradient-to-br from-blue-800/60 to-cyan-800/60 border border-blue-600/50 rounded-xl p-4 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <GiSteelClaws className="text-4xl text-blue-400" />
              <div>
                <h4 className="text-lg font-bold text-blue-200">Acero</h4>
                <p className="text-blue-300 text-sm">Material de construcción</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-100 mb-2">
              {formatNumber(steel)}
            </div>
            <div className="text-blue-400 text-sm">
              Para mejoras y reparaciones
            </div>
          </div>
        </div>

        {/* Energy Cells */}
        <div className="bg-gradient-to-br from-yellow-800/60 to-orange-800/60 border border-yellow-600/50 rounded-xl p-4 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <FaBolt className="text-4xl text-yellow-400" />
              <div>
                <h4 className="text-lg font-bold text-yellow-200">Células de Energía</h4>
                <p className="text-yellow-300 text-sm">Combustible vital</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-100 mb-2">
              {formatNumber(energy_cells)}
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
        </div>

        {/* Medicine */}
        <div className="bg-gradient-to-br from-red-800/60 to-pink-800/60 border border-red-600/50 rounded-xl p-4 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <FaHeart className="text-4xl text-red-400" />
              <div>
                <h4 className="text-lg font-bold text-red-200">Medicina</h4>
                <p className="text-red-300 text-sm">Curación y recuperación</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-red-100 mb-2">
              {formatNumber(medicine)}
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center justify-center space-x-2">
              {medicineStatus === 'excellent' && (
                <div className="flex items-center text-green-400">
                  <FaCheckCircle className="mr-1" />
                  <span className="text-sm font-semibold">Excelente</span>
                </div>
              )}
              {medicineStatus === 'good' && (
                <div className="flex items-center text-blue-400">
                  <FaCheckCircle className="mr-1" />
                  <span className="text-sm font-semibold">Bueno</span>
                </div>
              )}
              {medicineStatus === 'fair' && (
                <div className="flex items-center text-yellow-400">
                  <FaExclamationTriangle className="mr-1" />
                  <span className="text-sm font-semibold">Regular</span>
                </div>
              )}
              {medicineStatus === 'low' && (
                <div className="flex items-center text-red-400">
                  <FaExclamationTriangle className="mr-1" />
                  <span className="text-sm font-semibold">Bajo</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Food */}
        <div className="bg-gradient-to-br from-green-800/60 to-emerald-800/60 border border-green-600/50 rounded-xl p-4 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <FaAppleAlt className="text-4xl text-green-400" />
              <div>
                <h4 className="text-lg font-bold text-green-200">Comida</h4>
                <p className="text-green-300 text-sm">Sustento vital</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-100 mb-2">
              {formatNumber(food)}
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center justify-center space-x-2">
              {foodStatus === 'excellent' && (
                <div className="flex items-center text-green-400">
                  <FaCheckCircle className="mr-1" />
                  <span className="text-sm font-semibold">Excelente</span>
                </div>
              )}
              {foodStatus === 'good' && (
                <div className="flex items-center text-blue-400">
                  <FaCheckCircle className="mr-1" />
                  <span className="text-sm font-semibold">Bueno</span>
                </div>
              )}
              {foodStatus === 'fair' && (
                <div className="flex items-center text-yellow-400">
                  <FaExclamationTriangle className="mr-1" />
                  <span className="text-sm font-semibold">Regular</span>
                </div>
              )}
              {foodStatus === 'low' && (
                <div className="flex items-center text-red-400">
                  <FaExclamationTriangle className="mr-1" />
                  <span className="text-sm font-semibold">Bajo</span>
                </div>
              )}
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
            {formatNumber(steel + energy_cells + medicine + food)}
          </div>
        </div>
        
        {/* Recomendaciones basadas en materiales bajos */}
        {(energy_cells < 5 || medicine < 2 || food < 4) && (
          <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <FaExclamationTriangle className="text-yellow-400" />
              <span className="text-yellow-200 text-sm font-semibold">
                ¡Necesitas más suministros! Busca cajas de suministros en el juego.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 