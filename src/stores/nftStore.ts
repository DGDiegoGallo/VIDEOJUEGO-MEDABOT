import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { NFTApiHelper } from '@/utils/nftHelpers';
import { nftMarketplaceService } from '@/services/nftMarketplaceService';
import { getMockMarketplaceData, simulateApiDelay } from '@/utils/mockNFTData';
import { normalizeRarity } from '@/utils/translations';
import type { UserNFT } from '@/types/nft';

interface NFTState {
  userNFTs: UserNFT[];
  marketplaceNFTs: UserNFT[];
  filteredNFTs: UserNFT[];
  selectedNFT: UserNFT | null;
  isLoading: boolean;
  isMarketplaceLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  marketplacePage: number;
  marketplaceTotalPages: number;
  useMockData: boolean;
  searchTerm: string;
  currentRarityFilter: string;
  currentSortBy: string;
}

interface NFTActions {
  fetchUserNFTs: (userId: string | number) => Promise<void>;
  fetchMarketplaceNFTs: (page?: number) => Promise<void>;
  listNFTForSale: (nftDocumentId: string, price: number) => Promise<void>;
  unlistNFT: (nftDocumentId: string) => Promise<void>;
  selectNFT: (nft: UserNFT) => void;
  clearSelectedNFT: () => void;
  clearError: () => void;
  searchNFTs: (searchTerm: string) => Promise<void>;
  filterByRarity: (rarity: string) => Promise<void>;
  sortNFTs: (sortBy: string) => void;
  clearFilters: () => void;
  loadMoreMarketplace: () => Promise<void>;
  toggleMockData: () => void;
  loadMockMarketplace: () => Promise<void>;
  applyFilters: () => void;
}

export const useNFTStore = create<NFTState & NFTActions>()(
  immer((set, get) => ({
    // State
    userNFTs: [],
    marketplaceNFTs: [],
    filteredNFTs: [],
    selectedNFT: null,
    isLoading: false,
    isMarketplaceLoading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    marketplacePage: 1,
    marketplaceTotalPages: 1,
    useMockData: false,
    searchTerm: '',
    currentRarityFilter: 'all',
    currentSortBy: 'newest',

    // Actions
    fetchUserNFTs: async (userId: string | number) => {
      set((state) => { 
        state.isLoading = true; 
        state.error = null; 
      });
      
      try {
        const response = await NFTApiHelper.getNFTsByUserId(userId);
        set((state) => {
          state.userNFTs = response.data || [];
          state.isLoading = false;
        });
      } catch (error) {
        console.error('Error fetching user NFTs:', error);
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Error fetching NFTs';
          state.isLoading = false;
          state.userNFTs = [];
        });
      }
    },

    fetchMarketplaceNFTs: async (page = 1) => {
      const { useMockData } = get();
      
      set((state) => { 
        state.isMarketplaceLoading = true; 
        state.error = null; 
      });
      
      try {
        let response;
        
        if (useMockData) {
          // Simular delay de API
          await simulateApiDelay(800);
          response = getMockMarketplaceData();
        } else {
          // Usar el nuevo servicio del marketplace
          const result = await nftMarketplaceService.getMarketplaceNFTs(page, 12);
          if (!result.success) {
            throw new Error(result.error || 'Error obteniendo NFTs del marketplace');
          }
          response = result.data;
        }
        
        set((state) => {
          if (page === 1) {
            state.marketplaceNFTs = response.nfts || [];
            state.filteredNFTs = response.nfts || [];
          } else {
            state.marketplaceNFTs.push(...(response.nfts || []));
            // Re-aplicar filtros a los nuevos datos
            get().applyFilters();
          }
          state.marketplacePage = page;
          state.marketplaceTotalPages = response.pagination?.pageCount || 1;
          state.isMarketplaceLoading = false;
        });
      } catch (error) {
        console.error('Error fetching marketplace NFTs:', error);
        
        // Si falla la API real, intentar con datos mock
        if (!useMockData) {
          console.log('API failed, falling back to mock data');
          set((state) => { state.useMockData = true; });
          await get().fetchMarketplaceNFTs(page);
          return;
        }
        
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Error fetching marketplace NFTs';
          state.isMarketplaceLoading = false;
        });
      }
    },

    listNFTForSale: async (nftDocumentId: string, price: number) => {
      try {
        // Obtener el ID del usuario del token de autenticación
        const token = localStorage.getItem('auth-token');
        if (!token) {
          throw new Error('Usuario no autenticado');
        }

        // Decodificar el token para obtener el userId
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const userId = tokenPayload.id;

        console.log('🔄 Iniciando proceso de list para NFT:', nftDocumentId, 'Usuario:', userId);

        const result = await nftMarketplaceService.listNFTForSale({
          nftDocumentId,
          priceEth: price,
          priceUsdt: price * 2000, // Conversión aproximada ETH a USDT
          userId
        });

        if (!result.success) {
          throw new Error(result.error || 'Error al listar NFT');
        }

        console.log('✅ List exitoso, actualizando estado local');

        // Update local state - remover el NFT de la colección del usuario
        set((state) => {
          state.userNFTs = state.userNFTs.filter(nft => nft.documentId !== nftDocumentId);
          console.log('🗑️ NFT removido de userNFTs');
        });

        // Refresh marketplace y recargar NFTs listados
        console.log('🔄 Recargando datos...');
        const { fetchMarketplaceNFTs } = get();
        await fetchMarketplaceNFTs(1);
        
        console.log('✅ Datos recargados exitosamente');
      } catch (error) {
        console.error('Error listing NFT:', error);
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Error listing NFT';
        });
      }
    },

    unlistNFT: async (nftDocumentId: string) => {
      try {
        // Obtener el ID del usuario del token de autenticación
        const token = localStorage.getItem('auth-token');
        if (!token) {
          throw new Error('Usuario no autenticado');
        }

        // Decodificar el token para obtener el userId
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const userId = tokenPayload.id;

        console.log('🔄 Iniciando proceso de unlist para NFT:', nftDocumentId, 'Usuario:', userId);

        const result = await nftMarketplaceService.unlistNFT({
          nftDocumentId,
          userId
        });

        if (!result.success) {
          throw new Error(result.error || 'Error al quitar NFT de la lista');
        }

        console.log('✅ Unlist exitoso, actualizando estado local');

        // Update local state - agregar el NFT de vuelta a la colección del usuario
        set((state) => {
          // Agregar el NFT de vuelta a la colección del usuario
          if (result.data) {
            state.userNFTs.push(result.data);
            console.log('📝 NFT agregado a userNFTs:', result.data.metadata?.name);
          }
          
          // Remove from marketplace
          state.marketplaceNFTs = state.marketplaceNFTs.filter(nft => nft.documentId !== nftDocumentId);
          state.filteredNFTs = state.filteredNFTs.filter(nft => nft.documentId !== nftDocumentId);
          console.log('🗑️ NFT removido de marketplaceNFTs y filteredNFTs');
        });

        // Refresh marketplace y user NFTs
        console.log('🔄 Recargando datos...');
        const { fetchMarketplaceNFTs, fetchUserNFTs } = get();
        await Promise.all([
          fetchMarketplaceNFTs(1),
          fetchUserNFTs(userId)
        ]);
        
        console.log('✅ Datos recargados exitosamente');
      } catch (error) {
        console.error('Error unlisting NFT:', error);
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Error unlisting NFT';
        });
      }
    },

    selectNFT: (nft: UserNFT) => {
      set((state) => {
        state.selectedNFT = nft;
      });
    },

    clearSelectedNFT: () => {
      set((state) => {
        state.selectedNFT = null;
      });
    },

    clearError: () => {
      set((state) => {
        state.error = null;
      });
    },

    searchNFTs: async (searchTerm: string) => {
      set((state) => { 
        state.isMarketplaceLoading = true; 
        state.error = null;
        state.searchTerm = searchTerm;
      });
      
      try {
        if (searchTerm.trim()) {
          // Usar el servicio del marketplace para búsqueda
          const { useMockData } = get();
          
          if (useMockData) {
            // Búsqueda local en los datos existentes
            const { marketplaceNFTs } = get();
            const filtered = marketplaceNFTs.filter(nft => 
              nft.metadata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              nft.metadata.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
              nft.metadata.achievement_type?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            set((state) => {
              state.filteredNFTs = filtered;
              state.isMarketplaceLoading = false;
            });
          } else {
            // Búsqueda en el servidor
            const result = await nftMarketplaceService.searchMarketplaceNFTs(searchTerm, 1, 12);
            if (result.success) {
              set((state) => {
                state.marketplaceNFTs = result.data.nfts || [];
                state.filteredNFTs = result.data.nfts || [];
                state.isMarketplaceLoading = false;
              });
            } else {
              throw new Error(result.error || 'Error en la búsqueda');
            }
          }
        } else {
          // Si no hay término de búsqueda, mostrar todos
          get().applyFilters();
        }
      } catch (error) {
        console.error('Error searching NFTs:', error);
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Error searching NFTs';
          state.isMarketplaceLoading = false;
        });
      }
    },

    filterByRarity: async (rarity: string) => {
      set((state) => { 
        state.isMarketplaceLoading = true; 
        state.error = null;
        state.currentRarityFilter = rarity;
      });
      
      try {
        if (rarity === 'all') {
          // Mostrar todos los NFTs
          get().applyFilters();
        } else {
          // Usar el servicio del marketplace para filtrado
          const { useMockData } = get();
          
          if (useMockData) {
            // Filtrar por rareza localmente
            const { marketplaceNFTs } = get();
            const normalizedRarity = normalizeRarity(rarity);
            const filtered = marketplaceNFTs.filter(nft => 
              normalizeRarity(nft.metadata.rarity) === normalizedRarity
            );
            
            set((state) => {
              state.filteredNFTs = filtered;
              state.isMarketplaceLoading = false;
            });
          } else {
            // Filtrar en el servidor
            const result = await nftMarketplaceService.filterMarketplaceNFTsByRarity(rarity, 1, 12);
            if (result.success) {
              set((state) => {
                state.marketplaceNFTs = result.data.nfts || [];
                state.filteredNFTs = result.data.nfts || [];
                state.isMarketplaceLoading = false;
              });
            } else {
              throw new Error(result.error || 'Error en el filtrado');
            }
          }
        }
      } catch (error) {
        console.error('Error filtering NFTs by rarity:', error);
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Error filtering NFTs';
          state.isMarketplaceLoading = false;
        });
      }
    },

    sortNFTs: (sortBy: string) => {
      set((state) => {
        state.currentSortBy = sortBy;
        state.isMarketplaceLoading = true;
      });

      const { filteredNFTs } = get();
      let sorted = [...filteredNFTs];

      switch (sortBy) {
        case 'price-low':
          sorted.sort((a, b) => a.listing_price_eth - b.listing_price_eth);
          break;
        case 'price-high':
          sorted.sort((a, b) => b.listing_price_eth - a.listing_price_eth);
          break;
        case 'rarity':
          const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
          sorted.sort((a, b) => {
            const aRarity = normalizeRarity(a.metadata.rarity);
            const bRarity = normalizeRarity(b.metadata.rarity);
            return (rarityOrder[bRarity as keyof typeof rarityOrder] || 0) - 
                   (rarityOrder[aRarity as keyof typeof rarityOrder] || 0);
          });
          break;
        case 'newest':
        default:
          sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }

      set((state) => {
        state.filteredNFTs = sorted;
        state.isMarketplaceLoading = false;
      });
    },

    clearFilters: () => {
      set((state) => {
        state.searchTerm = '';
        state.currentRarityFilter = 'all';
        state.currentSortBy = 'newest';
        state.filteredNFTs = state.marketplaceNFTs;
      });
    },

    applyFilters: () => {
      const { marketplaceNFTs, searchTerm, currentRarityFilter } = get();
      let filtered = [...marketplaceNFTs];

      // Aplicar búsqueda
      if (searchTerm.trim()) {
        filtered = filtered.filter(nft => 
          nft.metadata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nft.metadata.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nft.metadata.achievement_type?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Aplicar filtro de rareza
      if (currentRarityFilter !== 'all') {
        const normalizedRarity = normalizeRarity(currentRarityFilter);
        filtered = filtered.filter(nft => 
          normalizeRarity(nft.metadata.rarity) === normalizedRarity
        );
      }

      set((state) => {
        state.filteredNFTs = filtered;
        state.isMarketplaceLoading = false;
      });
    },

    loadMoreMarketplace: async () => {
      const { marketplacePage, marketplaceTotalPages, fetchMarketplaceNFTs } = get();
      if (marketplacePage < marketplaceTotalPages) {
        await fetchMarketplaceNFTs(marketplacePage + 1);
      }
    },

    toggleMockData: () => {
      set((state) => {
        state.useMockData = !state.useMockData;
        state.marketplaceNFTs = [];
        state.filteredNFTs = [];
        state.error = null;
      });
    },

    loadMockMarketplace: async () => {
      set((state) => { 
        state.isMarketplaceLoading = true; 
        state.error = null;
        state.useMockData = true;
      });
      
      try {
        await simulateApiDelay(500);
        const response = getMockMarketplaceData();
        
        set((state) => {
          state.marketplaceNFTs = response.data;
          state.filteredNFTs = response.data;
          state.marketplacePage = 1;
          state.marketplaceTotalPages = 1;
          state.isMarketplaceLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error = 'Error loading mock data';
          state.isMarketplaceLoading = false;
        });
      }
    },
  }))
);