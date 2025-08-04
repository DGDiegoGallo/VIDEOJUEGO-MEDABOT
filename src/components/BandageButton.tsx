import React, { useState, useEffect } from 'react';
import { FaBandAid, FaHeart, FaClock } from 'react-icons/fa';

interface BandageButtonProps {
  medicineInventory: number;
  canUse: boolean;
  cooldownRemaining: number;
  useProgress: number;
  isUsing: boolean;
  onUseBandage: () => void;
}

export const BandageButton: React.FC<BandageButtonProps> = ({
  medicineInventory,
  canUse,
  cooldownRemaining,
  useProgress,
  isUsing,
  onUseBandage
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Detectar cuando se presiona la tecla B
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'b' && canUse && !isUsing) {
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 150);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUse, isUsing]);

  const formatTime = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  const getButtonClass = () => {
    let baseClass = '';
    
    if (isUsing) {
      baseClass = 'bg-green-600 hover:bg-green-700 border-green-500';
    } else if (canUse) {
      baseClass = 'bg-red-600 hover:bg-red-700 border-red-500';
    } else {
      baseClass = 'bg-gray-600 border-gray-500 cursor-not-allowed';
    }

    // Agregar clase de animación si está presionado
    if (isPressed) {
      baseClass += ' scale-95 shadow-inner';
    }

    return baseClass;
  };

  const getIconClass = () => {
    if (isUsing) {
      return 'text-green-200 animate-pulse';
    }
    if (canUse) {
      return 'text-red-200';
    }
    return 'text-gray-400';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botón principal */}
      <div className="relative">
        <button
                      className={`
              ${getButtonClass()}
              w-16 h-16 rounded-full border-2 shadow-lg
              flex items-center justify-center
              transition-all duration-150 transform hover:scale-110
              focus:outline-none focus:ring-4 focus:ring-red-500/50
              ${!canUse && !isUsing ? 'opacity-50' : 'opacity-100'}
            `}
          onClick={() => {
            // Animación de feedback
            setIsPressed(true);
            setTimeout(() => setIsPressed(false), 150);
            onUseBandage();
          }}
          disabled={!canUse && !isUsing}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {/* Icono principal */}
          <FaBandAid className={`text-2xl ${getIconClass()}`} />

          {/* Indicador de tecla rápida */}
          <div className={`absolute -bottom-1 -left-1 bg-yellow-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-yellow-400 shadow-lg transition-all duration-150 ${isPressed ? 'scale-110 bg-yellow-500 shadow-yellow-300 shadow-lg' : ''}`}>
            B
          </div>

          {/* Indicador de progreso de uso */}
          {isUsing && (
            <div className="absolute inset-0 rounded-full border-4 border-transparent">
              <div
                className="absolute inset-0 rounded-full border-4 border-green-400"
                style={{
                  clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
                  transform: `rotate(${useProgress * 360}deg)`,
                  transition: 'transform 0.1s linear'
                }}
              />
            </div>
          )}

          {/* Indicador de cooldown */}
          {!isUsing && cooldownRemaining > 0 && (
            <div className="absolute inset-0 rounded-full border-4 border-transparent">
              <div
                className="absolute inset-0 rounded-full border-4 border-gray-400"
                style={{
                  clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
                  transform: `rotate(${(1 - cooldownRemaining / 5000) * 360}deg)`,
                  transition: 'transform 0.1s linear'
                }}
              />
            </div>
          )}

          {/* Contador de medicina */}
          <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-gray-800">
            {medicineInventory}
          </div>
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900/95 border border-gray-700 rounded-lg p-3 shadow-xl backdrop-blur-sm">
            <div className="text-white">
              <div className="flex items-center space-x-2 mb-2">
                <FaBandAid className="text-red-400" />
                <span className="font-bold text-red-400">Vendaje</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Medicina disponible:</span>
                  <span className="text-blue-400 font-semibold">{medicineInventory}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Costo por uso:</span>
                  <span className="text-red-400 font-semibold">1 medicina</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Curación:</span>
                  <span className="text-green-400 font-semibold">+30 HP</span>
                </div>

                {isUsing && (
                  <div className="flex items-center space-x-2 text-green-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                    <span>Usando vendaje...</span>
                  </div>
                )}

                {!isUsing && cooldownRemaining > 0 && (
                  <div className="flex items-center space-x-2 text-yellow-400">
                    <FaClock className="text-sm" />
                    <span>Cooldown: {formatTime(cooldownRemaining)}</span>
                  </div>
                )}

                {!canUse && !isUsing && cooldownRemaining === 0 && medicineInventory === 0 && (
                  <div className="text-red-400 text-xs">
                    ¡Necesitas medicina para usar vendajes!
                  </div>
                )}

                {!canUse && !isUsing && cooldownRemaining === 0 && medicineInventory > 0 && (
                  <div className="text-green-400 text-xs">
                    ¡Salud completa!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notificación de uso */}
      {isUsing && (
        <div className="absolute -top-16 right-0 bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center space-x-2">
            <FaHeart className="text-green-200" />
            <span className="text-sm font-semibold">Usando vendaje...</span>
          </div>
        </div>
      )}
    </div>
  );
}; 