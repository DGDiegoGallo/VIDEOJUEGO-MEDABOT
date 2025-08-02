# Guía de Implementación del Marketplace de NFTs

## Preparación para el Marketplace

### 1. Estructura de Archivos Sugerida
```
src/
├── pages/
│   └── MarketplacePage.tsx
├── components/
│   ├── marketplace/
│   │   ├── MarketplaceGrid.tsx
│   │   ├── NFTMarketCard.tsx
│   │   ├── FilterSidebar.tsx
│   │   ├── SearchBar.tsx
│   │   └── PurchaseModal.tsx
│   └── nft/
│       ├── NFTCard.tsx (ya existe, reutilizable)
│       └── NFTDetailsModal.tsx
├── stores/
│   └── marketplaceStore.ts
└── utils/
    └── marketplaceHelpers.ts
```

### 2. Endpoints Necesarios para el Marketplace

#### Obtener NFTs en Venta
```http
GET http://localhost:1337/api/user-nfts?filters[is_listed_for_sale][$eq]=True&populate=*&sort[0]=createdAt:desc
```

#### Filtrar por Precio
```http
GET http://localhost:1337/api/user-nfts?filters[is_listed_for_sale][$eq]=True&filters[listing_price_eth][$lte]=1.0&populate=*
```

#### Filtrar por Rareza
```http
GET http://localhost:1337/api/user-nfts?filters[is_listed_for_sale][$eq]=True&filters[metadata][rarity][$eq]=legendary&populate=*
```

#### Buscar por Nombre
```http
GET http://localhost:1337/api/user-nfts?filters[is_listed_for_sale][$eq]=True&filters[metadata][name][$containsi]=medabot&populate=*
```

### 3. Funciones Reutilizables Preparadas

#### NFTApiHelper (ya implementado)
```typescript
// Estas funciones ya están listas para usar:
NFTApiHelper.getMarketplaceNFTs(page, pageSize)
NFTApiHelper.listNFTForSale(nftDocumentId, priceEth)
NFTApiHelper.unlistNFT(nftDocumentId)
NFTApiHelper.getNFTsByWallet(walletId)
```

#### Nuevas Funciones Necesarias
```typescript
// src/utils/marketplaceHelpers.ts
export class MarketplaceHelper {
  
  // Comprar NFT (transferir propiedad)
  static async purchaseNFT(nftDocumentId: string, buyerWalletId: number, buyerAddress: string): Promise<any> {
    return await apiClient.update(API_CONFIG.ENDPOINTS.WALLET.USER_NFTS, nftDocumentId, {
      user_wallet: buyerWalletId,
      owner_address: buyerAddress,
      is_listed_for_sale: 'False',
      listing_price_eth: 0,
      last_transfer_at: new Date().toISOString()
    });
  }

  // Filtros avanzados
  static async getFilteredNFTs(filters: MarketplaceFilters): Promise<any> {
    let query = `${API_CONFIG.ENDPOINTS.WALLET.USER_NFTS}?filters[is_listed_for_sale][$eq]=True&populate=*`;
    
    if (filters.minPrice) query += `&filters[listing_price_eth][$gte]=${filters.minPrice}`;
    if (filters.maxPrice) query += `&filters[listing_price_eth][$lte]=${filters.maxPrice}`;
    if (filters.rarity) query += `&filters[metadata][rarity][$eq]=${filters.rarity}`;
    if (filters.search) query += `&filters[metadata][name][$containsi]=${filters.search}`;
    if (filters.sortBy) query += `&sort[0]=${filters.sortBy}`;
    
    return await apiClient.get(query);
  }
}

interface MarketplaceFilters {
  minPrice?: number;
  maxPrice?: number;
  rarity?: NFTRarity;
  search?: string;
  sortBy?: 'createdAt:desc' | 'listing_price_eth:asc' | 'listing_price_eth:desc';
}
```

### 4. Store del Marketplace (preparado)
```typescript
// El patrón ya está definido en useNFTStore
// Solo necesitas usar las funciones existentes:
const { marketplaceNFTs, fetchMarketplaceNFTs, listNFTForSale, unlistNFT } = useNFTStore();
```

### 5. Componentes Base Listos

#### NFTCard (ya existe y es reutilizable)
```typescript
// Ya implementado en el patrón de reutilización
// Solo necesitas pasarle las props correctas:
<NFTCard 
  nft={nft}
  showPrice={true}
  showActions={false}
  onSelect={handleSelectNFT}
  onBuy={handleBuyNFT}
/>
```

## Implementación Rápida del Marketplace

### Paso 1: Crear MarketplaceStore
```typescript
// src/stores/marketplaceStore.ts
interface MarketplaceState {
  nfts: any[];
  filters: MarketplaceFilters;
  isLoading: boolean;
  selectedNFT: any | null;
}

interface MarketplaceActions {
  fetchMarketplaceNFTs: () => Promise<void>;
  applyFilters: (filters: MarketplaceFilters) => Promise<void>;
  purchaseNFT: (nftId: string, buyerWalletId: number, buyerAddress: string) => Promise<void>;
}

export const useMarketplaceStore = create<MarketplaceState & MarketplaceActions>()(
  immer((set) => ({
    nfts: [],
    filters: {},
    isLoading: false,
    selectedNFT: null,

    fetchMarketplaceNFTs: async () => {
      set((state) => { state.isLoading = true; });
      try {
        const response = await NFTApiHelper.getMarketplaceNFTs();
        set((state) => {
          state.nfts = response.data;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => { state.isLoading = false; });
      }
    },

    applyFilters: async (filters: MarketplaceFilters) => {
      set((state) => { 
        state.filters = filters;
        state.isLoading = true; 
      });
      try {
        const response = await MarketplaceHelper.getFilteredNFTs(filters);
        set((state) => {
          state.nfts = response.data;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => { state.isLoading = false; });
      }
    },

    purchaseNFT: async (nftId: string, buyerWalletId: number, buyerAddress: string) => {
      try {
        await MarketplaceHelper.purchaseNFT(nftId, buyerWalletId, buyerAddress);
        // Refresh marketplace
        const { fetchMarketplaceNFTs } = get();
        await fetchMarketplaceNFTs();
      } catch (error) {
        throw error;
      }
    }
  }))
);
```

### Paso 2: Página del Marketplace
```typescript
// src/pages/MarketplacePage.tsx
export const MarketplacePage: React.FC = () => {
  const { nfts, isLoading, fetchMarketplaceNFTs, applyFilters } = useMarketplaceStore();
  const [filters, setFilters] = useState<MarketplaceFilters>({});

  useEffect(() => {
    fetchMarketplaceNFTs();
  }, []);

  return (
    <div className="marketplace-page">
      <h1>Marketplace de NFTs</h1>
      
      <div className="marketplace-content">
        <FilterSidebar 
          filters={filters}
          onFiltersChange={(newFilters) => {
            setFilters(newFilters);
            applyFilters(newFilters);
          }}
        />
        
        <div className="nft-grid">
          {isLoading ? (
            <div>Cargando...</div>
          ) : (
            nfts.map((nft) => (
              <NFTCard
                key={nft.documentId}
                nft={nft}
                showPrice={true}
                onSelect={handleSelectNFT}
                onBuy={handleBuyNFT}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
```

## Funcionalidades Listas para Implementar

### ✅ Ya Implementadas
1. **Crear NFTs** - ✅ Función `createRegistrationAchievementNFT`
2. **Listar NFTs para venta** - ✅ Función `listNFTForSale`
3. **Quitar NFTs de venta** - ✅ Función `unlistNFT`
4. **Obtener NFTs del marketplace** - ✅ Función `getMarketplaceNFTs`
5. **Componente NFTCard reutilizable** - ✅ Patrón definido
6. **Tipos TypeScript** - ✅ Todos los tipos necesarios
7. **Cliente API** - ✅ Métodos CRUD genéricos

### 🔄 Por Implementar (Rápido)
1. **Comprar NFTs** - Solo necesitas `MarketplaceHelper.purchaseNFT`
2. **Filtros avanzados** - Solo necesitas `MarketplaceHelper.getFilteredNFTs`
3. **Componentes UI** - Usar patrones ya definidos
4. **Store del marketplace** - Usar patrón de `useNFTStore`

## Estimación de Tiempo

Con toda la base ya implementada:
- **Marketplace básico**: 2-3 horas
- **Filtros y búsqueda**: 1-2 horas  
- **Compra de NFTs**: 1-2 horas
- **UI/UX pulido**: 2-3 horas

**Total estimado**: 6-10 horas para un marketplace completo

## Próximos Pasos Recomendados

1. Implementar `MarketplaceHelper` con las funciones de filtrado
2. Crear `useMarketplaceStore` usando el patrón existente
3. Crear componentes UI básicos reutilizando `NFTCard`
4. Implementar la funcionalidad de compra
5. Agregar filtros y búsqueda avanzada

¿Te parece bien este plan? ¿Por dónde quieres empezar?