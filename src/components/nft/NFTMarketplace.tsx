import React, { useState, useEffect } from 'react';
import { FaFilter, FaSearch, FaShoppingCart, FaTimes } from 'react-icons/fa';
import { useMarketplace } from '@/hooks/useNFTs';
import { useNFTStore } from '@/stores/nftStore';
import { NFTGrid } from './NFTGrid';
import { NFTModal } from './NFTModal';
import { SimpleNFTPurchaseModal } from './SimpleNFTPurchaseModal';
import { PurchaseSuccessNotification } from '@/components/ui/PurchaseSuccessNotification';
import { MarketplaceParticles } from '@/components/effects/MarketplaceParticles';
import { getRarityFilterOptions, getSortOptions } from '@/utils/translations';
import type { UserNFT } from '@/types/nft';

export const NFTMarketplace: React.FC = () => {
  const { 
    nfts, 
    allNFTs,
    isLoading, 
    error, 
    refetch, 
    loadMore, 
    hasMore,
    searchNFTs,
    filterByRarity,
    sortNFTs,
    clearFilters,
    searchTerm,
    currentRarityFilter,
    currentSortBy
  } = useMarketplace();
  
  const { useMockData, loadMockMarketplace } = useNFTStore();
  const [selectedNFT, setSelectedNFT] = useState<UserNFT | null>(null);
  const [purchaseNFT, setPurchaseNFT] = useState<UserNFT | null>(null);
  const [purchasedNFT, setPurchasedNFT] = useState<UserNFT | null>(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [localFilterRarity, setLocalFilterRarity] = useState('all');
  const [localSortBy, setLocalSortBy] = useState('newest');

  // Sincronizar estado local con el store
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
    setLocalFilterRarity(currentRarityFilter);
    setLocalSortBy(currentSortBy);
  }, [searchTerm, currentRarityFilter, currentSortBy]);

  const handleSearch = async (term: string) => {
    setLocalSearchTerm(term);
    if (term.trim()) {
      await searchNFTs(term);
    } else {
      await refetch();
    }
  };

  const handleFilterRarity = async (rarity: string) => {
    setLocalFilterRarity(rarity);
    await filterByRarity(rarity);
  };

  const handleSortBy = (sortBy: string) => {
    setLocalSortBy(sortBy);
    sortNFTs(sortBy);
  };

  const handleClearFilters = () => {
    setLocalSearchTerm('');
    setLocalFilterRarity('all');
    setLocalSortBy('newest');
    clearFilters();
  };

  const handleSelectNFT = (nft: UserNFT) => {
    setSelectedNFT(nft);
  };

  const handleCloseModal = () => {
    setSelectedNFT(null);
  };

  const handleBuyNFT = async (nft: UserNFT) => {
    // Abrir modal de compra
    setPurchaseNFT(nft);
    setSelectedNFT(null); // Cerrar modal de detalles
  };

  const handlePurchaseSuccess = (nft: UserNFT) => {
    console.log('NFT comprado exitosamente:', nft);
    
    // Mostrar notificación de éxito
    setPurchasedNFT(nft);
    setShowSuccessNotification(true);
    
    // Recargar la lista de NFTs para reflejar los cambios
    refetch();
  };

  const handleClosePurchaseModal = () => {
    setPurchaseNFT(null);
  };

  const handleCloseSuccessNotification = () => {
    setShowSuccessNotification(false);
    setPurchasedNFT(null);
  };

  // Obtener opciones de filtro y ordenamiento
  const rarityOptions = getRarityFilterOptions('es');
  const sortOptions = getSortOptions('es');

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <h3 className="text-white text-xl font-semibold mb-2">Error al cargar el marketplace</h3>
        <p className="text-gray-400 text-center mb-4">{error}</p>
        <button
          onClick={refetch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      {/* Background Particles */}
      <MarketplaceParticles />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold text-white flex items-center">
              <FaShoppingCart className="mr-3" />
              Marketplace de NFTs
            </h2>
            {useMockData && (
              <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Datos Demo
              </span>
            )}
          </div>
          <p className="text-gray-400">
            Descubre y compra NFTs únicos de otros jugadores
          </p>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar NFTs..."
              value={localSearchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Rarity Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={localFilterRarity}
              onChange={(e) => handleFilterRarity(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none transition-all"
            >
              {rarityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={localSortBy}
              onChange={(e) => handleSortBy(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none transition-all"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={refetch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Actualizar
            </button>
            <button
              onClick={loadMockMarketplace}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Datos Demo
            </button>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(localSearchTerm || localFilterRarity !== 'all' || localSortBy !== 'newest') && (
          <div className="mb-4">
            <button
              onClick={handleClearFilters}
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <FaTimes />
              <span>Limpiar Filtros</span>
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg text-center border border-gray-600 shadow-lg hover:bg-gray-700/80 transition-all duration-300">
            <div className="text-2xl font-bold text-white">{nfts.length}</div>
            <div className="text-gray-400 text-sm">NFTs en Venta</div>
          </div>
          <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg text-center border border-gray-600 shadow-lg hover:bg-gray-700/80 transition-all duration-300">
            <div className="text-2xl font-bold text-green-400">
              {nfts.length > 0 ? Math.min(...nfts.map(nft => nft.listing_price_eth)).toFixed(3) : '0.000'}
            </div>
            <div className="text-gray-400 text-sm">Precio Mínimo (ETH)</div>
          </div>
          <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg text-center border border-gray-600 shadow-lg hover:bg-gray-700/80 transition-all duration-300">
            <div className="text-2xl font-bold text-yellow-400">
              {nfts.filter(nft => nft.metadata.rarity === 'legendary').length}
            </div>
            <div className="text-gray-400 text-sm">Legendarios</div>
          </div>
          <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg text-center border border-gray-600 shadow-lg hover:bg-gray-700/80 transition-all duration-300">
            <div className="text-2xl font-bold text-blue-400">
              {nfts.reduce((sum, nft) => sum + nft.listing_price_eth, 0).toFixed(3)}
            </div>
            <div className="text-gray-400 text-sm">Volumen Total (ETH)</div>
          </div>
        </div>

        {/* NFT Grid */}
        <NFTGrid
          nfts={nfts}
          isLoading={isLoading}
          showPrice={true}
          onSelect={handleSelectNFT}
          onBuy={handleBuyNFT}
          emptyMessage="No hay NFTs disponibles en el marketplace"
        />

        {/* Load More Button */}
        {hasMore && !isLoading && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
            >
              Cargar más NFTs
            </button>
          </div>
        )}
      </div>

      {/* NFT Details Modal */}
      <NFTModal
        nft={selectedNFT}
        isOpen={!!selectedNFT}
        onClose={handleCloseModal}
        onBuy={handleBuyNFT}
        showActions={false} // No show list/unlist actions in marketplace
      />

      {/* NFT Purchase Modal */}
      <SimpleNFTPurchaseModal
        nft={purchaseNFT}
        isOpen={!!purchaseNFT}
        onClose={handleClosePurchaseModal}
        onPurchaseSuccess={handlePurchaseSuccess}
      />

      {/* Success Notification */}
      {purchasedNFT && (
        <PurchaseSuccessNotification
          nft={purchasedNFT}
          isVisible={showSuccessNotification}
          onClose={handleCloseSuccessNotification}
        />
      )}
    </div>
  );
};