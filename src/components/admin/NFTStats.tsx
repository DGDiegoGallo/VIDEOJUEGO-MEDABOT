import React from 'react';
import type { GameAnalytics } from '@/types/admin';

interface NFTStatsProps {
  nftStats: GameAnalytics['nftStats'];
  onExplain: (type: string) => void;
}

export const NFTStats: React.FC<NFTStatsProps> = ({ nftStats, onExplain }) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const totalRarityItems = Object.values(nftStats.rarityDistribution).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Estadísticas de NFTs</h3>
          <p className="text-sm text-gray-600">Distribución y uso de elementos NFT</p>
        </div>
        <button
          onClick={() => onExplain('nfts')}
          className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
        >
          ?
        </button>
      </div>

      {/* Total NFTs */}
      <div className="mb-6">
        <div className="text-center p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
          <div className="text-3xl font-bold text-gray-900">{nftStats.totalNFTs}</div>
          <div className="text-sm text-gray-600">NFTs Totales Equipados</div>
        </div>
      </div>

      {/* Rarity Distribution */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Distribución por Rareza</h4>
        <div className="space-y-2">
          {Object.entries(nftStats.rarityDistribution).map(([rarity, count]) => {
            const percentage = totalRarityItems > 0 ? (count / totalRarityItems) * 100 : 0;
            return (
              <div key={rarity} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getRarityColor(rarity)}`}></div>
                  <span className="text-sm font-medium capitalize">{rarity}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getRarityColor(rarity)}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Most Popular NFTs */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">NFTs Más Populares</h4>
        <div className="space-y-2">
          {nftStats.mostPopularNFTs.map((nft, index) => (
            <div key={nft.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                <span className="text-sm font-medium text-gray-900 truncate max-w-32" title={nft.name}>
                  {nft.name}
                </span>
                <span className={`px-1 py-0.5 rounded text-xs font-medium text-white ${getRarityColor(nft.rarity)}`}>
                  {nft.rarity}
                </span>
              </div>
              <span className="text-sm text-gray-600">{nft.usageCount} usos</span>
            </div>
          ))}
        </div>
      </div>

      {nftStats.totalNFTs === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay NFTs equipados por los jugadores</p>
        </div>
      )}
    </div>
  );
};