import { useEffect, useCallback } from 'react';
import { useNFTStore } from '@/stores/nftStore';
import { useGameSessionData } from './useGameSessionData';

export const useNFTs = (userId?: string | number) => {
  const { userNFTs, isLoading, error, fetchUserNFTs } = useNFTStore();

  useEffect(() => {
    if (userId) {
      fetchUserNFTs(userId);
    }
  }, [userId, fetchUserNFTs]);

  return {
    nfts: userNFTs,
    isLoading,
    error,
    refetch: () => userId && fetchUserNFTs(userId)
  };
};

export const useMarketplace = () => {
  const { 
    filteredNFTs,
    marketplaceNFTs,
    isMarketplaceLoading, 
    error, 
    fetchMarketplaceNFTs,
    loadMoreMarketplace,
    marketplacePage,
    marketplaceTotalPages,
    searchNFTs,
    filterByRarity,
    sortNFTs,
    clearFilters,
    searchTerm,
    currentRarityFilter,
    currentSortBy
  } = useNFTStore();

  useEffect(() => {
    fetchMarketplaceNFTs(1);
  }, [fetchMarketplaceNFTs]);

  return {
    nfts: filteredNFTs,
    allNFTs: marketplaceNFTs,
    isLoading: isMarketplaceLoading,
    error,
    refetch: () => fetchMarketplaceNFTs(1),
    loadMore: loadMoreMarketplace,
    hasMore: marketplacePage < marketplaceTotalPages,
    searchNFTs,
    filterByRarity,
    sortNFTs,
    clearFilters,
    searchTerm,
    currentRarityFilter,
    currentSortBy
  };
};

export const useNFTActions = (userId?: number) => {
  const { 
    listNFTForSale, 
    unlistNFT, 
    selectNFT, 
    clearSelectedNFT, 
    clearError,
    fetchUserNFTs,
    fetchMarketplaceNFTs
  } = useNFTStore();

  const { refreshData } = useGameSessionData(userId || 0);

  const listNFTWithRefresh = useCallback(async (nftDocumentId: string, price: number) => {
    try {
      console.log('🔄 Hook: Listando NFT con refresh:', nftDocumentId, price);
      await listNFTForSale(nftDocumentId, price);
      // Recargar datos del juego para actualizar materiales, etc.
      if (userId) {
        refreshData();
      }
    } catch (error) {
      console.error('Error listing NFT with refresh:', error);
      throw error;
    }
  }, [listNFTForSale, refreshData, userId]);

  const unlistNFTWithRefresh = useCallback(async (nftDocumentId: string) => {
    try {
      console.log('🔄 Hook: Quitando NFT con refresh:', nftDocumentId);
      await unlistNFT(nftDocumentId);
      // Recargar datos del juego para actualizar materiales, etc.
      if (userId) {
        refreshData();
      }
    } catch (error) {
      console.error('Error unlisting NFT with refresh:', error);
      throw error;
    }
  }, [unlistNFT, refreshData, userId]);

  return {
    listForSale: listNFTWithRefresh,
    unlist: unlistNFTWithRefresh,
    select: selectNFT,
    clearSelected: clearSelectedNFT,
    clearError,
    fetchUserNFTs,
    fetchMarketplaceNFTs
  };
};