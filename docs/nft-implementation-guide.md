# Guía de Implementación de NFTs - Medabot Game

## Resumen

Se ha implementado un sistema completo de NFTs que incluye:

1. **Colección de Usuario**: Visualización y gestión de NFTs propios
2. **Marketplace**: Compra y venta de NFTs entre usuarios
3. **Componentes Reutilizables**: Sistema modular y escalable
4. **Integración con Strapi v4**: API completa con filtros y paginación

## Estructura de Archivos

```
src/
├── components/nft/
│   ├── NFTCard.tsx              # Componente individual de NFT
│   ├── NFTGrid.tsx              # Grid de NFTs con loading states
│   ├── NFTModal.tsx             # Modal de detalles con acciones
│   ├── UserNFTCollection.tsx    # Vista de colección del usuario
│   ├── NFTMarketplace.tsx       # Vista del marketplace
│   └── index.ts                 # Exportaciones
├── hooks/
│   └── useNFTs.ts               # Hooks reutilizables para NFTs
├── stores/
│   └── nftStore.ts              # Estado global con Zustand
├── types/
│   └── nft.ts                   # Tipos TypeScript para NFTs
├── utils/
│   └── nftHelpers.ts            # Helpers y factory para NFTs
└── styles/
    └── nft.css                  # Estilos específicos para NFTs
```

## Características Implementadas

### 1. Colección de Usuario (`UserNFTCollection`)

- **Visualización**: Grid responsivo de NFTs del usuario
- **Filtros**: Por rareza y búsqueda por texto
- **Estadísticas**: Total de NFTs, en venta, legendarios, valor total
- **Acciones**: Listar/quitar de venta con modal de precio
- **Estados**: Loading, error, vacío con mensajes apropiados

### 2. Marketplace (`NFTMarketplace`)

- **Catálogo**: NFTs en venta de todos los usuarios
- **Filtros**: Rareza, búsqueda, ordenamiento (precio, fecha, rareza)
- **Paginación**: Carga incremental con botón "Cargar más"
- **Estadísticas**: Volumen, precio mínimo, cantidad por rareza
- **Compra**: Modal de detalles con botón de compra (pendiente implementar transacción)

### 3. Componentes Reutilizables

#### `NFTCard`
- Diseño adaptativo según rareza (colores, efectos)
- Iconos dinámicos usando React Icons
- Acciones contextuales (listar, quitar, comprar)
- Información completa (precio, fecha, atributos)

#### `NFTGrid`
- Grid responsivo (1-4 columnas según pantalla)
- Estados de carga con skeletons animados
- Mensajes personalizables para estado vacío
- Soporte para diferentes modos (usuario/marketplace)

#### `NFTModal`
- Vista detallada con toda la información
- Formulario de listado con validación
- Atributos organizados en grid
- Acciones contextuales según el modo

### 4. Integración con Strapi v4

#### Endpoints Utilizados
```typescript
// Obtener NFTs por usuario
GET /user-nfts?filters[user_wallet][documentId][$eq]={walletId}&populate=*

// Marketplace (NFTs en venta)
GET /user-nfts?filters[is_listed_for_sale][$eq]=True&populate=*&pagination[page]=1

// Filtrar por rareza
GET /user-nfts?filters[metadata][rarity][$eq]=legendary&populate=*

// Búsqueda por texto
GET /user-nfts?filters[metadata][name][$containsi]=search&populate=*

// Listar NFT para venta
PUT /user-nfts/{documentId}
```

#### Características de la API
- **DocumentID**: Uso correcto de documentId en lugar de id
- **Filtros**: Filtros anidados para metadata y relaciones
- **Paginación**: Soporte completo con meta información
- **Populate**: Carga de relaciones (user_wallet)
- **Ordenamiento**: Por fecha, precio, rareza

### 5. Estado Global (Zustand)

```typescript
interface NFTState {
  userNFTs: UserNFT[];           // NFTs del usuario
  marketplaceNFTs: UserNFT[];    // NFTs del marketplace
  selectedNFT: UserNFT | null;   // NFT seleccionado
  isLoading: boolean;            // Estado de carga usuario
  isMarketplaceLoading: boolean; // Estado de carga marketplace
  error: string | null;          // Errores
  // ... paginación y más
}
```

#### Acciones Disponibles
- `fetchUserNFTs(userId)`: Cargar NFTs del usuario
- `fetchMarketplaceNFTs(page)`: Cargar marketplace con paginación
- `listNFTForSale(documentId, price)`: Listar NFT
- `unlistNFT(documentId)`: Quitar de venta
- `searchNFTs(term)`: Búsqueda
- `filterByRarity(rarity)`: Filtrar por rareza
- `loadMoreMarketplace()`: Cargar más resultados

### 6. Hooks Personalizados

```typescript
// Hook para NFTs del usuario
const { nfts, isLoading, error, refetch } = useNFTs(userId);

// Hook para marketplace
const { nfts, isLoading, loadMore, hasMore } = useMarketplace();

// Hook para acciones
const { listForSale, unlist, select } = useNFTActions();
```

### 7. Tipos TypeScript

```typescript
interface UserNFT extends BaseNFTData {
  id: number;
  documentId: string;           // Strapi v4 documentId
  createdAt: string;
  updatedAt: string;
  user_wallet: {               // Relación poblada
    id: number;
    documentId: string;
    wallet_address: string;
  };
}

interface NFTMetadata {
  name: string;
  description: string;
  icon_name: string;           // React Icon name
  rarity: NFTRarity;
  attributes: NFTAttribute[];
  achievement_type?: string;   // Para NFTs de logros
  earned_date?: string;
}
```

## Uso en el Lobby

El componente `NFTView` en el lobby incluye:

1. **Navegación por pestañas**: Alternar entre colección y marketplace
2. **Integración completa**: Ambas vistas funcionan independientemente
3. **Diseño responsivo**: Se adapta al contenedor del lobby
4. **Scroll interno**: Manejo de contenido largo

```tsx
// En LobbyPage.tsx
<NFTView /> // Incluye ambas funcionalidades
```

## Estilos y Diseño

### Efectos Visuales por Rareza
- **Común**: Gris con sombra sutil
- **Raro**: Azul con glow medio
- **Épico**: Púrpura con glow fuerte
- **Legendario**: Dorado con glow intenso y animación

### Animaciones
- Hover effects en cards
- Loading skeletons
- Transiciones suaves
- Efectos de glow por rareza
- Animaciones de modal

### Responsividad
- **Mobile**: 1 columna
- **Tablet**: 2-3 columnas
- **Desktop**: 4 columnas
- **Filtros**: Stack vertical en mobile

## Próximas Mejoras

1. **Transacciones**: Implementar compra real con blockchain
2. **Favoritos**: Sistema de NFTs favoritos
3. **Historial**: Historial de transacciones
4. **Notificaciones**: Alertas de ventas/compras
5. **Ofertas**: Sistema de ofertas por NFTs
6. **Categorías**: Filtros por tipo de NFT (logros, items, etc.)
7. **Estadísticas**: Gráficos de precios y tendencias

## Comandos de Desarrollo

```bash
# Verificar tipos
npm run type-check

# Desarrollo
npm run dev

# Build
npm run build
```

## Notas Técnicas

- **Performance**: Lazy loading de imágenes y paginación
- **Error Handling**: Manejo robusto de errores de API
- **Accesibilidad**: Componentes accesibles con ARIA labels
- **SEO**: Meta tags apropiados para NFTs
- **Seguridad**: Validación de datos y sanitización
- **Testing**: Estructura preparada para tests unitarios

La implementación sigue las mejores prácticas de React, TypeScript y Strapi v4, proporcionando una base sólida y escalable para el sistema de NFTs del juego.