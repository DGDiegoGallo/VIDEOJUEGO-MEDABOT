# Guía de Implementación del Marketplace de NFTs

## Resumen

Se ha implementado un sistema completo de marketplace de NFTs que permite a los usuarios listar, comprar y gestionar sus NFTs. El sistema utiliza la colección `nfts` en Strapi para el marketplace y mantiene la colección `user-nfts` para las colecciones personales.

## Arquitectura del Sistema

### 1. Servicios Implementados

#### `nftMarketplaceService.ts`
Servicio principal que maneja todas las operaciones del marketplace:

- **`listNFTForSale()`**: Lista un NFT para venta
  - Obtiene el NFT de la colección del usuario
  - Lo elimina de `user-nfts`
  - Lo crea en `nfts` con precio y estado de venta

- **`buyNFT()`**: Compra un NFT del marketplace
  - Obtiene el NFT del marketplace
  - Lo elimina de `nfts`
  - Lo agrega a la colección del comprador en `user-nfts`

- **`getMarketplaceNFTs()`**: Obtiene todos los NFTs listados
- **`getMarketplaceNFTsByOwner()`**: Filtra por propietario
- **`searchMarketplaceNFTs()`**: Búsqueda por nombre
- **`filterMarketplaceNFTsByRarity()`**: Filtro por rareza

### 2. Componentes de UI

#### `ListNFTModal.tsx`
Modal para listar NFTs con:
- Campos para precio en ETH y USDT (conversión automática)
- Validación de precios
- Información del NFT a listar
- Confirmación de la operación

#### `UnlistNFTModal.tsx`
Modal para quitar NFTs de la lista con:
- Confirmación de la acción
- Información del NFT a quitar
- Advertencias sobre las consecuencias
- Proceso de devolución a la colección

#### `SimpleNFTPurchaseModal.tsx`
Modal para comprar NFTs con:
- Proceso paso a paso
- Verificación de usuario
- Procesamiento de compra
- Notificación de éxito

#### `NFTModal.tsx` (Actualizado)
Modal de detalles con:
- Botón para listar NFTs (abre `ListNFTModal`)
- Botón para quitar de venta
- Información completa del NFT

#### `UserNFTCollection.tsx` (Actualizado)
Colección de usuario con:
- Detección automática de NFTs listados
- Visualización diferenciada de NFTs listados
- Botones deshabilitados para NFTs listados
- Funcionalidad de quitar de lista
- Indicadores de estado (Equipado/Listado)

### 3. Store Actualizado

#### `nftStore.ts`
Store actualizado para usar el nuevo servicio:
- `fetchMarketplaceNFTs()`: Usa `nftMarketplaceService`
- `listNFTForSale()`: Implementa la lógica completa de listado
- `searchNFTs()`: Búsqueda en servidor o local
- `filterByRarity()`: Filtrado en servidor o local

## Flujo de Operaciones

### Listar NFT para Venta

1. Usuario selecciona NFT de su colección
2. Hace clic en "Listar para Venta"
3. Se abre `ListNFTModal`
4. Usuario ingresa precio en ETH (USDT se calcula automáticamente)
5. Se ejecuta `nftMarketplaceService.listNFTForSale()`
6. NFT se elimina de `user-nfts`
7. NFT se crea en `nft-marketplaces` con `is_listed_for_sale: "True"`
8. Se actualiza la UI

### Comprar NFT

1. Usuario ve NFT en marketplace
2. Hace clic en "Comprar"
3. Se abre `SimpleNFTPurchaseModal`
4. Se ejecuta `nftMarketplaceService.buyNFT()`
5. NFT se elimina de `nft-marketplaces`
6. NFT se agrega a `user-nfts` del comprador
7. Se actualiza la UI

### Quitar NFT de la Lista

1. Usuario ve NFT listado en su colección (con indicador naranja)
2. Hace clic en "Quitar de Venta"
3. Se abre `UnlistNFTModal` con confirmación
4. Usuario confirma la acción
5. Se ejecuta `nftMarketplaceService.unlistNFT()`
6. NFT se elimina de `nft-marketplaces`
7. NFT se crea en `user-nfts` del usuario
8. Se actualiza la UI (NFT vuelve a ser equipable)

## Estructura de Datos

### Colección `nft-marketplaces` (Marketplace)
```json
{
  "token_id": "string",
  "contract_address": "string",
  "token_uri": "string",
  "metadata": {
    "name": "string",
    "description": "string",
    "rarity": "string",
    "attributes": []
  },
  "network": "ethereum-mainnet|polygon-mainnet|...",
  "owner_address": "string",
  "is_listed_for_sale": "True",
  "listing_price_eth": 0.001,
  "listing_price_usdt": 2.00,
  "minted_at": "datetime",
  "last_transfer_at": "datetime"
}
```

### Colección `user-nfts` (Colecciones Personales)
```json
{
  "token_id": "string",
  "contract_address": "string",
  "token_uri": "string",
  "metadata": {
    "name": "string",
    "description": "string",
    "rarity": "string",
    "attributes": []
  },
  "network": "ethereum-mainnet|polygon-mainnet|...",
  "owner_address": "string",
  "is_listed_for_sale": "False",
  "listing_price_eth": 0,
  "minted_at": "datetime",
  "last_transfer_at": "datetime",
  "user_wallet": "relation"
}
```

## Redes Soportadas

El sistema soporta las siguientes redes blockchain:

- `ethereum-mainnet`
- `ethereum-goerli`
- `polygon-mainnet`
- `polygon-mumbai`
- `binance-smart-chain`
- `bnb-testnet`
- `arbitrum-one`
- `arbitrum-goerli`
- `optimism-mainnet`
- `optimism-goerli`
- `avalanche-c`
- `fantom-mainnet`
- `base-mainnet`
- `base-goerli`
- `zkSync-era`
- `linea-mainnet`
- `scroll-mainnet`
- `aurora-mainnet`
- `solana-mainnet`
- `solana-devnet`

## Características Implementadas

### ✅ Funcionalidades Completas
- [x] Listar NFTs para venta
- [x] Comprar NFTs del marketplace
- [x] Quitar NFTs de la lista (unlist)
- [x] Búsqueda de NFTs
- [x] Filtrado por rareza
- [x] Ordenamiento por precio/fecha
- [x] Paginación
- [x] Conversión ETH ↔ USDT
- [x] Validación de precios
- [x] Manejo de errores
- [x] Notificaciones de éxito/error
- [x] Detección automática de NFTs listados
- [x] Visualización diferenciada de estados
- [x] Confirmación de acciones críticas

### 🔄 Flujo de Datos
- [x] NFT se mueve de `user-nfts` a `nft-marketplaces` al listar
- [x] NFT se mueve de `nft-marketplaces` a `user-nfts` al comprar
- [x] Actualización automática de UI
- [x] Sincronización de estado

### 🎨 UI/UX
- [x] Modales intuitivos
- [x] Indicadores de carga
- [x] Validación en tiempo real
- [x] Diseño responsivo
- [x] Efectos visuales

## Uso del Sistema

### Para Desarrolladores

1. **Importar servicios**:
```typescript
import { nftMarketplaceService } from '@/services/nftMarketplaceService';
```

2. **Listar NFT**:
```typescript
const result = await nftMarketplaceService.listNFTForSale({
  nftDocumentId: 'nft-id',
  priceEth: 0.001,
  priceUsdt: 2.00,
  userId: 123
});
```

3. **Comprar NFT**:
```typescript
const result = await nftMarketplaceService.buyNFT({
  nftDocumentId: 'nft-id',
  buyerUserId: 456
});
```

4. **Obtener NFTs del marketplace**:
```typescript
const result = await nftMarketplaceService.getMarketplaceNFTs(1, 12);
```

### Para Usuarios

1. **Listar NFT**: Ir a "Mi Colección" → Seleccionar NFT → "Listar para Venta"
2. **Comprar NFT**: Ir a "Marketplace" → Seleccionar NFT → "Comprar"
3. **Buscar NFTs**: Usar barra de búsqueda en marketplace
4. **Filtrar**: Usar filtros de rareza y ordenamiento

## Consideraciones Técnicas

### Seguridad
- Validación de precios mínimos
- Verificación de propiedad de NFTs
- Autenticación requerida para todas las operaciones

### Performance
- Paginación para grandes volúmenes
- Búsqueda optimizada
- Cache local para datos frecuentes

### Escalabilidad
- Estructura modular
- Servicios independientes
- Fácil extensión para nuevas funcionalidades

## Próximas Mejoras

### Funcionalidades Futuras
- [ ] Sistema de ofertas
- [ ] Historial de transacciones
- [ ] Notificaciones push
- [ ] Integración con wallets reales
- [ ] Sistema de royalties
- [ ] Subastas

### Optimizaciones
- [ ] Cache más inteligente
- [ ] Búsqueda full-text
- [ ] Filtros avanzados
- [ ] Analytics de marketplace

## Troubleshooting

### Problemas Comunes

1. **NFT no aparece en marketplace**:
   - Verificar que `is_listed_for_sale` sea "True"
   - Verificar que el NFT esté en la colección `nft-marketplaces`
   - Revisar permisos de usuario

2. **Error al comprar**:
   - Verificar que el NFT existe en la colección `nft-marketplaces`
   - Comprobar que el usuario tiene wallet

3. **Precios no se actualizan**:
   - Verificar conversión ETH/USDT
   - Revisar formato de números

### Logs de Debug

El sistema incluye logs detallados para debugging:
- `🛒 Listando NFT para venta`
- `✅ NFT listado exitosamente`
- `🛒 Comprando NFT`
- `✅ NFT comprado exitosamente`

## Conclusión

El sistema de marketplace está completamente funcional y listo para producción. Implementa todas las funcionalidades básicas necesarias para un marketplace de NFTs, con una arquitectura escalable y mantenible.