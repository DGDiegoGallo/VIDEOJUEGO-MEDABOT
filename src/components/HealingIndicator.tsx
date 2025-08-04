import React from 'react';
import { FaHeart, FaBandAid } from 'react-icons/fa';

interface HealingIndicatorProps {
  isHealing: boolean;
  healProgress: number;
  totalHealAmount: number;
}

export const HealingIndicator: React.FC<HealingIndicatorProps> = ({
  isHealing,
  healProgress,
  totalHealAmount
}) => {
  if (!isHealing) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-green-600/90 backdrop-blur-sm rounded-lg p-3 border border-green-500/50 shadow-lg">
        <div className="flex items-center space-x-3">
          {/* Ícono de curación */}
          <div className="relative">
            <FaHeart className="text-green-200 text-xl animate-pulse" />
            <FaBandAid className="absolute -top-1 -right-1 text-green-300 text-xs" />
          </div>
          
          {/* Información de curación */}
          <div className="text-white">
            <div className="text-sm font-semibold">Curando</div>
            <div className="text-xs text-green-200">
              +{totalHealAmount} HP
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="w-16 h-2 bg-green-800/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-400 transition-all duration-100 ease-linear"
              style={{ width: `${healProgress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 