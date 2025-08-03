import React from 'react';

interface SupplyBoxModalProps {
  isOpen: boolean;
  materials: {
    steel?: number;
    energy_cells?: number;
    medicine?: number;
  };
  onClose: () => void;
}

export const SupplyBoxModal: React.FC<SupplyBoxModalProps> = ({
  isOpen,
  materials,
  onClose
}) => {
  if (!isOpen) return null;

  // Estado para controlar las animaciones
  const [isAnimating, setIsAnimating] = React.useState(false);

  // Efecto para manejar la animación de entrada
  React.useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const materialIcons: { [key: string]: string } = {
    steel: '🔧',
    energy_cells: '⚡',
    medicine: '💊'
  };

  const materialNames: { [key: string]: string } = {
    steel: 'Acero',
    energy_cells: 'Células de Energía',
    medicine: 'Medicina'
  };

  const materialColors: { [key: string]: string } = {
    steel: 'text-gray-300',
    energy_cells: 'text-yellow-400',
    medicine: 'text-green-400'
  };

  const handleClose = () => {
    setIsAnimating(false);
    // Pequeño delay para permitir la animación de salida
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
      isAnimating 
        ? 'bg-black/80 backdrop-blur-sm' 
        : 'bg-black/0 backdrop-blur-none'
    }`}>
      <div className={`bg-gray-900/95 border border-green-500/50 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl transition-all duration-300 transform ${
        isAnimating 
          ? 'scale-100 opacity-100 translate-y-0' 
          : 'scale-95 opacity-0 translate-y-4'
      }`}>
        {/* Header */}
        <div className={`text-center mb-6 transition-all duration-500 delay-100 ${
          isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className={`text-6xl mb-2 transition-all duration-700 delay-200 ${
            isAnimating ? 'scale-100 rotate-0' : 'scale-75 rotate-12'
          } ${isAnimating ? 'animate-pulse' : ''}`}>📦</div>
          <h2 className={`text-2xl font-bold text-green-400 mb-2 transition-all duration-500 delay-300 ${
            isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            ¡Caja de Suministros!
          </h2>
          <p className={`text-gray-300 text-sm transition-all duration-500 delay-400 ${
            isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            Has encontrado valiosos materiales
          </p>
        </div>

        {/* Materials List */}
        <div className="space-y-3 mb-6">
          {Object.entries(materials).map(([materialType, amount], index) => (
            <div
              key={materialType}
              className={`flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 transition-all duration-500 ${
                isAnimating 
                  ? 'opacity-100 translate-x-0 scale-100' 
                  : 'opacity-0 translate-x-4 scale-95'
              }`}
              style={{ 
                transitionDelay: `${500 + (index * 100)}ms` 
              }}
            >
                              <div className="flex items-center space-x-3">
                  <span className={`text-2xl transition-all duration-300 ${
                    isAnimating ? 'animate-bounce' : ''
                  }`} style={{ animationDelay: `${600 + (index * 100)}ms` }}>
                    {materialIcons[materialType]}
                  </span>
                <div>
                  <div className={`font-semibold ${materialColors[materialType]}`}>
                    {materialNames[materialType]}
                  </div>
                  <div className="text-xs text-gray-400">
                    Material valioso
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-400">
                  +{amount}
                </div>
                <div className="text-xs text-gray-400">
                  unidades
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Summary */}
        <div className={`bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6 transition-all duration-700 ${
          isAnimating 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
        }`}
        style={{ transitionDelay: '800ms' }}
        >
          <div className="text-center">
            <div className={`text-green-400 font-semibold mb-1 transition-all duration-500 ${
              isAnimating ? 'opacity-100' : 'opacity-0'
            }`} style={{ transitionDelay: '900ms' }}>
              Total Obtenido
            </div>
            <div className={`text-2xl font-bold text-green-300 transition-all duration-500 ${
              isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`} style={{ transitionDelay: '1000ms' }}>
              {Object.values(materials).reduce((sum, amount) => sum + amount, 0)} materiales
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
            isAnimating 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-4 scale-95'
          }`}
          style={{ transitionDelay: '1100ms' }}
        >
          ¡Excelente!
        </button>

        {/* Decorative Elements */}
        <div className={`absolute top-2 right-2 text-green-500/30 text-xs transition-all duration-700 ${
          isAnimating ? 'opacity-100 rotate-0' : 'opacity-0 rotate-12'
        }`} style={{ transitionDelay: '1200ms' }}>
          ★ RARE ★
        </div>
        <div className={`absolute bottom-2 left-2 text-green-500/30 text-xs transition-all duration-700 ${
          isAnimating ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-12'
        }`} style={{ transitionDelay: '1300ms' }}>
          SUPPLY BOX
        </div>
      </div>
    </div>
  );
}; 