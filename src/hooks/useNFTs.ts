import { useEffect } from 'react';
import { useNFTStore } from '@/stores/nftStore';

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

export const useNFTActions = () => {
  const { listNFTForSale, unlistNFT, selectNFT, clearSelectedNFT, clearError } = useNFTStore();

  return {
    listForSale: listNFTForSale,
    unlist: unlistNFT,
    select: selectNFT,
    clearSelected: clearSelectedNFT,
    clearError
  };
};