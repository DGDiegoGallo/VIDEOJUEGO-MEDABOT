# Patrones de Reutilización de Código - Medabot Game

## Estructura de Archivos para Reutilización

```
src/
├── utils/
│   ├── api.ts                    # Cliente API centralizado
│   ├── nftHelpers.ts            # Utilidades para NFTs
│   ├── walletHelpers.ts         # Utilidades para Wallets
│   └── strapiHelpers.ts         # Utilidades generales de Strapi
├── types/
│   ├── api.ts                   # Tipos de API y respuestas
│   ├── nft.ts                   # Tipos específicos de NFTs
│   └── wallet.ts                # Tipos específicos de Wallets
├── stores/
│   ├── nftStore.ts              # Estado global de NFTs
│   ├── walletStore.ts           # Estado global de Wallets
│   └── marketplaceStore.ts      # Estado del marketplace
└── components/
    ├── nft/
    │   ├── NFTCard.tsx          # Componente reutilizable de NFT
    │   ├── NFTGrid.tsx          # Grid de NFTs
    │   └── NFTModal.tsx         # Modal de detalles de NFT
    └── wallet/
        ├── WalletInfo.tsx       # Información de wallet
        └── TransactionHistory.tsx
```

## 1. Cliente API Reutilizable

### Patrón Base del Cliente API
```typescript
// src/utils/api.ts
class ApiClient {
  private client: AxiosInstance;

  // Método genérico para CRUD
  async get<T>(endpoint: string, params?: any): Promise<StrapiResponse<T>> {
    const response = await this.client.get<StrapiResponse<T>>(endpoint, { params });
    return response.data;
  }

  async create<T>(endpoint: string, data: any): Promise<StrapiResponse<StrapiEntity<T>>> {
    const response = await this.client.post<StrapiResponse<StrapiEntity<T>>>(endpoint, { data });
    return response.data;
  }

  async update<T>(endpoint: string, id: string | number, data: any): Promise<StrapiResponse<StrapiEntity<T>>> {
    const response = await this.client.put<StrapiResponse<StrapiEntity<T>>>(`${endpoint}/${id}`, { data });
    return response.data;
  }
}
```

### Métodos Específicos Reutilizables
```typescript
// src/utils/nftHelpers.ts
export class NFTApiHelper {
  
  // Crear NFT genérico
  static async createNFT(nftData: BaseNFTData, walletId: string | number): Promise<any> {
    console.log('🎨 Creating NFT for wallet:', walletId);
    
    const payload = {
      data: {
        user_wallet: typeof walletId === 'string' ? parseInt(walletId, 10) : walletId,
        ...nftData,
      },
    };

    return await apiClient.create(API_CONFIG.ENDPOINTS.WALLET.USER_NFTS, payload.data);
  }

  // Obtener NFTs por wallet
  static async getNFTsByWallet(walletId: string | number): Promise<any> {
    return await apiClient.get(
      `${API_CONFIG.ENDPOINTS.WALLET.USER_NFTS}?filters[user_wallet][id][$eq]=${walletId}&populate=*`
    );
  }

  // Obtener NFTs en venta (para marketplace)
  static async getMarketplaceNFTs(page = 1, pageSize = 12): Promise<any> {
    return await apiClient.get(
      `${API_CONFIG.ENDPOINTS.WALLET.USER_NFTS}?filters[is_listed_for_sale][$eq]=True&populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort[0]=createdAt:desc`
    );
  }

  // Listar NFT para venta
  static async listNFTForSale(nftDocumentId: string, priceEth: number): Promise<any> {
    return await apiClient.update(API_CONFIG.ENDPOINTS.WALLET.USER_NFTS, nftDocumentId, {
      is_listed_for_sale: 'True',
      listing_price_eth: priceEth
    });
  }

  // Quitar NFT de venta
  static async unlistNFT(nftDocumentId: string): Promise<any> {
    return await apiClient.update(API_CONFIG.ENDPOINTS.WALLET.USER_NFTS, nftDocumentId, {
      is_listed_for_sale: 'False',
      listing_price_eth: 0
    });
  }
}
```

## 2. Tipos Reutilizables

### Tipos Base para NFTs
```typescript
// src/types/nft.ts
export interface BaseNFTData {
  token_id: string;
  contract_address: string;
  token_uri: string;
  metadata: NFTMetadata;
  network: NetworkType;
  owner_address: string;
  is_listed_for_sale: ListingStatus;
  listing_price_eth: number;
  minted_at: string;
  last_transfer_at: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  icon_name: string;
  rarity: NFTRarity;
  attributes: NFTAttribute[];
  [key: string]: any; // Para metadatos específicos
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

// Tipos específicos que extienden el base
export interface AchievementNFT extends BaseNFTData {
  metadata: NFTMetadata & {
    achievement_type: string;
    earned_date: string;
  };
}

export interface GameItemNFT extends BaseNFTData {
  metadata: NFTMetadata & {
    item_type: 'weapon' | 'armor' | 'accessory';
    stats: {
      attack?: number;
      defense?: number;
      speed?: number;
    };
  };
}
```

## 3. Generadores de NFT Reutilizables

### Factory Pattern para NFTs
```typescript
// src/utils/nftFactory.ts
export class NFTFactory {
  
  // Generar NFT de logro
  static createAchievementNFT(
    walletAddress: string,
    username: string,
    achievementType: string,
    iconName: string,
    rarity: NFTRarity = 'common'
  ): AchievementNFT {
    const tokenId = `${achievementType.toUpperCase()}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const currentTimestamp = new Date().toISOString();

    return {
      token_id: tokenId,
      contract_address: API_CONFIG.NFT_CONTRACT_ADDRESS,
      token_uri: `${API_CONFIG.STRAPI_URL}/api/nft-metadata/${tokenId}`,
      metadata: {
        name: this.getAchievementName(achievementType),
        description: this.getAchievementDescription(achievementType, username),
        icon_name: iconName,
        rarity,
        achievement_type: achievementType,
        earned_date: new Date().toLocaleDateString('es-ES'),
        attributes: [
          { trait_type: 'Achievement Type', value: this.getAchievementName(achievementType) },
          { trait_type: 'Rarity', value: rarity },
          { trait_type: 'Earned Date', value: new Date().toLocaleDateString('es-ES') },
          { trait_type: 'Player', value: username }
        ]
      },
      network: this.mapNetwork(API_CONFIG.BLOCKCHAIN_NETWORK),
      owner_address: walletAddress,
      is_listed_for_sale: 'False',
      listing_price_eth: 0,
      minted_at: currentTimestamp,
      last_transfer_at: currentTimestamp
    };
  }

  // Generar NFT de item de juego
  static createGameItemNFT(
    walletAddress: string,
    itemType: 'weapon' | 'armor' | 'accessory',
    stats: any,
    rarity: NFTRarity = 'common'
  ): GameItemNFT {
    // Implementación similar...
  }

  private static getAchievementName(type: string): string {
    const names = {
      'registration_achievement': 'Medabot Pioneer',
      'first_battle': 'First Battle',
      'level_10': 'Level 10 Master',
      'tournament_winner': 'Tournament Champion'
    };
    return names[type] || 'Achievement';
  }

  private static getAchievementDescription(type: string, username: string): string {
    const descriptions = {
      'registration_achievement': `¡Bienvenido al mundo de Medabot, ${username}! Este NFT conmemora tu registro como pionero en nuestra plataforma de juegos.`,
      'first_battle': `${username} ha completado su primera batalla en Medabot!`,
      'level_10': `${username} ha alcanzado el nivel 10 en Medabot!`
    };
    return descriptions[type] || `Logro desbloqueado por ${username}`;
  }
}
```

## 4. Store Reutilizable para NFTs

### Zustand Store Pattern
```typescript
// src/stores/nftStore.ts
interface NFTState {
  userNFTs: any[];
  marketplaceNFTs: any[];
  selectedNFT: any | null;
  isLoading: boolean;
  error: string | null;
}

interface NFTActions {
  fetchUserNFTs: (walletId: string) => Promise<void>;
  fetchMarketplaceNFTs: (page?: number) => Promise<void>;
  listNFTForSale: (nftId: string, price: number) => Promise<void>;
  unlistNFT: (nftId: string) => Promise<void>;
  selectNFT: (nft: any) => void;
  clearError: () => void;
}

export const useNFTStore = create<NFTState & NFTActions>()(
  immer((set, get) => ({
    // State
    userNFTs: [],
    marketplaceNFTs: [],
    selectedNFT: null,
    isLoading: false,
    error: null,

    // Actions
    fetchUserNFTs: async (walletId: string) => {
      set((state) => { state.isLoading = true; state.error = null; });
      
      try {
        const response = await NFTApiHelper.getNFTsByWallet(walletId);
        set((state) => {
          state.userNFTs = response.data;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Error fetching NFTs';
          state.isLoading = false;
        });
      }
    },

    fetchMarketplaceNFTs: async (page = 1) => {
      set((state) => { state.isLoading = true; state.error = null; });
      
      try {
        const response = await NFTApiHelper.getMarketplaceNFTs(page);
        set((state) => {
          state.marketplaceNFTs = response.data;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Error fetching marketplace NFTs';
          state.isLoading = false;
        });
      }
    },

    listNFTForSale: async (nftId: string, price: number) => {
      try {
        await NFTApiHelper.listNFTForSale(nftId, price);
        // Refresh user NFTs
        const { fetchUserNFTs } = get();
        // fetchUserNFTs(currentWalletId); // Necesitarías el wallet ID actual
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Error listing NFT';
        });
      }
    },

    // ... más acciones
  }))
);
```

## 5. Componentes Reutilizables

### Componente NFT Card
```typescript
// src/components/nft/NFTCard.tsx
interface NFTCardProps {
  nft: any;
  showPrice?: boolean;
  showActions?: boolean;
  onSelect?: (nft: any) => void;
  onList?: (nft: any) => void;
  onUnlist?: (nft: any) => void;
  onBuy?: (nft: any) => void;
}

export const NFTCard: React.FC<NFTCardProps> = ({
  nft,
  showPrice = false,
  showActions = false,
  onSelect,
  onList,
  onUnlist,
  onBuy
}) => {
  const IconComponent = getReactIcon(nft.metadata.icon_name);
  
  return (
    <div className="nft-card" onClick={() => onSelect?.(nft)}>
      <div className="nft-icon">
        <IconComponent size={64} />
      </div>
      <h3>{nft.metadata.name}</h3>
      <p className={`rarity ${nft.metadata.rarity}`}>
        {nft.metadata.rarity}
      </p>
      
      {showPrice && nft.is_listed_for_sale === 'True' && (
        <div className="price">
          {nft.listing_price_eth} ETH
        </div>
      )}
      
      {showActions && (
        <div className="actions">
          {nft.is_listed_for_sale === 'False' ? (
            <button onClick={(e) => { e.stopPropagation(); onList?.(nft); }}>
              Listar para Venta
            </button>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); onUnlist?.(nft); }}>
              Quitar de Venta
            </button>
          )}
        </div>
      )}
    </div>
  );
};
```

## 6. Hooks Reutilizables

### Custom Hook para NFTs
```typescript
// src/hooks/useNFTs.ts
export const useNFTs = (walletId?: string) => {
  const { userNFTs, isLoading, error, fetchUserNFTs } = useNFTStore();

  useEffect(() => {
    if (walletId) {
      fetchUserNFTs(walletId);
    }
  }, [walletId, fetchUserNFTs]);

  return {
    nfts: userNFTs,
    isLoading,
    error,
    refetch: () => walletId && fetchUserNFTs(walletId)
  };
};

// Hook para marketplace
export const useMarketplace = () => {
  const { marketplaceNFTs, isLoading, error, fetchMarketplaceNFTs } = useNFTStore();

  useEffect(() => {
    fetchMarketplaceNFTs();
  }, [fetchMarketplaceNFTs]);

  return {
    nfts: marketplaceNFTs,
    isLoading,
    error,
    refetch: fetchMarketplaceNFTs
  };
};
```

## Beneficios de esta Estructura

1. **Reutilización**: Componentes y utilidades reutilizables
2. **Mantenibilidad**: Código organizado y fácil de mantener
3. **Escalabilidad**: Fácil agregar nuevos tipos de NFTs
4. **Consistencia**: Patrones consistentes en toda la aplicación
5. **Testing**: Funciones puras fáciles de testear
6. **TypeScript**: Tipado fuerte para mejor DX