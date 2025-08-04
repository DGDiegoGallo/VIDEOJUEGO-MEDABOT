import React, { useState, useEffect } from 'react';
import { FaChartLine, FaArrowUp, FaArrowDown, FaDollarSign, FaClock, FaSync } from 'react-icons/fa';

interface TradingStats {
  totalVolume: number;
  totalTrades: number;
  averageTradeSize: number;
  successRate: number;
  profitLoss: number;
  activeUsers: number;
  marketTrend: 'bullish' | 'bearish' | 'neutral';
}

export const TradingStats: React.FC = () => {
  const [stats, setStats] = useState<TradingStats>({
    totalVolume: 1250000,
    totalTrades: 8472,
    averageTradeSize: 147.5,
    successRate: 94.2,
    profitLoss: 2.8,
    activeUsers: 1234,
    marketTrend: 'bullish'
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatNumber = (num: number, decimals: number = 0): string => {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(decimals) + 'B';
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(decimals) + 'M';
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(decimals) + 'K';
    }
    return num.toFixed(decimals);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish':
        return <FaArrowUp className="text-green-400" />;
      case 'bearish':
        return <FaArrowDown className="text-red-400" />;
      default:
        return <FaChartLine className="text-blue-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish':
        return 'text-green-400';
      case 'bearish':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  if (isLoading) {
    return (
      <div className="price-widget rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-700 rounded w-5/6"></div>
            <div className="h-3 bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="price-widget rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FaChartLine className="text-blue-400 text-xl" />
          <div>
            <h3 className="text-white font-bold text-lg">Estadísticas de Trading</h3>
            <p className="text-gray-400 text-sm">Últimas 24 horas</p>
          </div>
        </div>
        <div className={`flex items-center space-x-2 ${getTrendColor(stats.marketTrend)}`}>
          {getTrendIcon(stats.marketTrend)}
          <span className="text-sm font-semibold capitalize">{stats.marketTrend}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <FaDollarSign className="text-green-400" />
            <span className="text-gray-400 text-sm">Volumen Total</span>
          </div>
          <div className="text-white font-bold text-lg">
            ${formatNumber(stats.totalVolume)}
          </div>
          <div className="text-green-400 text-xs">
            +{Math.random() * 5 + 2}% vs ayer
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <FaSync className="text-blue-400" />
            <span className="text-gray-400 text-sm">Total Trades</span>
          </div>
          <div className="text-white font-bold text-lg">
            {formatNumber(stats.totalTrades)}
          </div>
          <div className="text-blue-400 text-xs">
            +{Math.floor(Math.random() * 100 + 50)} hoy
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <FaChartLine className="text-purple-400" />
            <span className="text-gray-400 text-sm">Tamaño Promedio</span>
          </div>
          <div className="text-white font-bold text-lg">
            ${stats.averageTradeSize}
          </div>
          <div className="text-purple-400 text-xs">
            {Math.random() > 0.5 ? '+' : '-'}{Math.random() * 10 + 5}% vs ayer
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <FaArrowUp className="text-yellow-400" />
            <span className="text-gray-400 text-sm">Tasa de Éxito</span>
          </div>
          <div className="text-white font-bold text-lg">
            {stats.successRate}%
          </div>
          <div className="text-yellow-400 text-xs">
            +{Math.random() * 2 + 0.5}% vs ayer
          </div>
        </div>
      </div>

      {/* Gráfico de actividad */}
      <div className="mb-6">
        <h4 className="text-white font-semibold mb-3">Actividad de Trading</h4>
        <div className="h-20 bg-gray-900 rounded-lg p-2 relative overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 100 40">
            {/* Generar datos aleatorios para el gráfico */}
            {Array.from({ length: 20 }, (_, i) => {
              const x = i * 5;
              const y = 20 + Math.sin(i * 0.5) * 10 + (Math.random() - 0.5) * 5;
              return `${x},${y}`;
            }).join(' ')}
            <polyline
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              points={Array.from({ length: 20 }, (_, i) => {
                const x = i * 5;
                const y = 20 + Math.sin(i * 0.5) * 10 + (Math.random() - 0.5) * 5;
                return `${x},${y}`;
              }).join(' ')}
            />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-800/20 to-transparent"></div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FaClock className="text-blue-400 mt-1 flex-shrink-0" />
          <div className="text-sm">
            <div className="text-blue-400 font-semibold mb-1">Mercado Activo</div>
            <div className="text-gray-300">
              {stats.activeUsers} usuarios activos en las últimas 24 horas. 
              El mercado muestra una tendencia {stats.marketTrend} con un P&L de {stats.profitLoss}%.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 