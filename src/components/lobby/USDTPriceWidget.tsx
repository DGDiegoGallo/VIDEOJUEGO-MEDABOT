import React, { useState, useEffect } from 'react';
import { FaChartLine, FaArrowUp, FaArrowDown, FaDollarSign, FaInfoCircle } from 'react-icons/fa';

interface PriceData {
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
}

export const USDTPriceWidget: React.FC = () => {
  const [priceData, setPriceData] = useState<PriceData>({
    price: 1.0000,
    change24h: 0.02,
    volume24h: 45000000000,
    marketCap: 95000000000,
    high24h: 1.0025,
    low24h: 0.9975
  });

  const [isPositive, setIsPositive] = useState(true);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);

  // Simular datos de precio en tiempo real
  useEffect(() => {
    const generatePriceData = () => {
      const basePrice = 1.0000;
      const variation = (Math.random() - 0.5) * 0.01; // ±0.5%
      const newPrice = Math.max(0.9950, Math.min(1.0050, basePrice + variation));
      
      const change24h = (Math.random() - 0.5) * 0.04; // ±2%
      const isPositiveChange = change24h > 0;
      
      setPriceData(prev => ({
        price: newPrice,
        change24h: change24h,
        volume24h: prev.volume24h + (Math.random() - 0.5) * 1000000000,
        marketCap: prev.marketCap + (Math.random() - 0.5) * 100000000,
        high24h: Math.max(prev.high24h, newPrice),
        low24h: Math.min(prev.low24h, newPrice)
      }));

      setIsPositive(isPositiveChange);
      
      // Actualizar historial de precios para el gráfico
      setPriceHistory(prev => {
        const newHistory = [...prev, newPrice];
        return newHistory.slice(-20); // Mantener solo los últimos 20 puntos
      });
    };

    // Actualizar cada 3 segundos
    const interval = setInterval(generatePriceData, 3000);
    generatePriceData(); // Generar datos iniciales

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number, decimals: number = 2): string => {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(decimals) + 'B';
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(decimals) + 'M';
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(decimals) + 'K';
    }
    return num.toFixed(decimals);
  };

  const formatPrice = (price: number): string => {
    return price.toFixed(4);
  };

  return (
    <div className="price-widget rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <FaDollarSign className="text-green-400 text-xl" />
          <div>
            <h3 className="text-white font-bold text-lg">USDT/USD</h3>
            <p className="text-gray-400 text-sm">Tether USD</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <FaChartLine className="text-blue-400" />
          <span className="text-gray-400 text-sm">En tiempo real</span>
        </div>
      </div>

      {/* Precio Principal */}
      <div className="mb-6">
        <div className="flex items-baseline space-x-3">
          <span className="text-3xl font-bold text-white">
            ${formatPrice(priceData.price)}
          </span>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded text-sm font-semibold ${
            isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {isPositive ? <FaArrowUp /> : <FaArrowDown />}
            <span>{Math.abs(priceData.change24h).toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* Gráfico Simple */}
      <div className="mb-6">
        <div className="h-20 bg-gray-900 rounded-lg p-2 relative overflow-hidden">
          {priceHistory.length > 1 && (
            <svg className="w-full h-full" viewBox={`0 0 ${priceHistory.length * 10} 100`}>
              <polyline
                fill="none"
                stroke={isPositive ? "#10B981" : "#EF4444"}
                strokeWidth="2"
                points={priceHistory.map((price, index) => 
                  `${index * 10},${100 - ((price - 0.995) * 20000)}`
                ).join(' ')}
              />
            </svg>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-800/20 to-transparent"></div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Volumen 24h</span>
            <FaInfoCircle className="text-gray-500 text-xs" />
          </div>
          <span className="text-white font-semibold">
            ${formatNumber(priceData.volume24h)}
          </span>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Cap. de Mercado</span>
            <FaInfoCircle className="text-gray-500 text-xs" />
          </div>
          <span className="text-white font-semibold">
            ${formatNumber(priceData.marketCap)}
          </span>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Máximo 24h</span>
            <FaArrowUp className="text-green-400 text-xs" />
          </div>
          <span className="text-green-400 font-semibold">
            ${formatPrice(priceData.high24h)}
          </span>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Mínimo 24h</span>
            <FaArrowDown className="text-red-400 text-xs" />
          </div>
          <span className="text-red-400 font-semibold">
            ${formatPrice(priceData.low24h)}
          </span>
        </div>
      </div>

      {/* Información Adicional */}
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <div className="flex items-start space-x-2">
          <FaInfoCircle className="text-blue-400 mt-1 flex-shrink-0" />
          <div className="text-sm">
            <div className="text-blue-400 font-semibold mb-1">Sobre USDT</div>
            <div className="text-gray-300">
              Tether (USDT) es una stablecoin respaldada 1:1 por reservas de USD. 
              Ideal para trading y transferencias rápidas entre exchanges.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 