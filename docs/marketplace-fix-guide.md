# 🔧 Corrección del Marketplace - Survival Zombie

## 📋 **Problema Identificado**

El marketplace estaba intentando buscar NFTs en la base de datos de Strapi (`/api/nfts/`) cuando en realidad los NFTs de demostración están en un archivo JSON local (`marketplace-nft-data.json`). Esto causaba errores 404.

## 🔄 **Cambios Implementados**

### **1. Corrección del Servicio SimpleNFTService**

**Archivo**: `src/services/simpleNFTService.ts`

#### **Cambios Principales**:

1. **Importación de datos mock**:
   ```typescript
   import { mockMarketplaceNFTs } from '../utils/mockNFTData';
   ```

2. **Búsqueda híbrida inteligente**:
   ```typescript
   // Primero busca en la base de datos
   const nftResponse = await axios.get(`${this.baseURL}/nfts?filters[documentId][$eq]=${nftDocumentId}`);
   
   // Si no encuentra, busca en datos mock
   if (!nft) {
     nft = mockMarketplaceNFTs.find(mockNft => mockNft.documentId === nftDocumentId);
   }
   ```

3. **Estructura correcta de datos**:
   - **Campo**: `user_wallet` en lugar de `game_sessions`
   - **Endpoint**: `/user-nfts` en lugar de `/nfts`
   - **Relación**: NFT → User Wallet (manyToOne)

### **2. Sistema de Búsqueda Híbrida**

El servicio ahora implementa una estrategia de búsqueda en dos niveles:

#### **Nivel 1: Base de Datos**
- Busca NFTs reales listados para venta
- Filtra por `is_listed_for_sale = "True"`
- Incluye NFTs creados por usuarios

#### **Nivel 2: Datos Mock**
- Si no encuentra en la base de datos, busca en datos de demostración
- Garantiza que siempre haya NFTs disponibles para probar
- Funciona como fallback

### **3. Estructura de Datos Corregida**

Según el esquema de Strapi mostrado, la estructura correcta es:

```typescript
interface NFT {
  user_wallet: number;           // Relación manyToOne con User_Wallet
  token_id: string;              // Text
  contract_address: string;      // Text
  token_uri: string;             // Text
  metadata: JSON;                // JSON object
  network: string;               // Enumeration
  owner_address: string;         // Text
  is_listed_for_sale: string;    // Enumeration ("True"/"False")
  listing_price_eth: number;     // Number
  minted_at: string;             // Datetime
  last_transfer_at: string;      // Datetime
}
```

### **4. Flujo de Compra Mejorado**

1. **Búsqueda del NFT**: 
   - Primero en base de datos
   - Luego en datos mock (fallback)
2. **Obtención de wallet**: Del usuario desde `/user-wallets`
3. **Creación del NFT**: En `/user-nfts` con `user_wallet` ID
4. **Asignación de propietario**: `owner_address` = wallet del usuario

## 🎯 **NFTs de Demostración Disponibles**

Los NFTs disponibles están definidos en `src/utils/mockNFTData.ts`:

### **Medalla del Tirador Maestro** (ID: `triple_shot_medal_003`)
- **Precio**: 1.25 ETH
- **Rareza**: Legendario
- **Efecto**: Triple disparo simultáneo

### **Medalla de Vitalidad** (ID: `health_boost_medal_001`)
- **Precio**: 0.025 ETH
- **Rareza**: Común
- **Efecto**: +15% vida máxima

### **Medalla del Guerrero** (ID: `weapon_damage_medal_002`)
- **Precio**: 0.032 ETH
- **Rareza**: Común
- **Efecto**: +8% daño de armas

### **Medalla del Minero Experto** (ID: `mining_boost_medal_004`)
- **Precio**: 0.485 ETH
- **Rareza**: Épico
- **Efecto**: +100% eficiencia de minería

### **Medalla del Viento Veloz** (ID: `speed_boost_medal_005`)
- **Precio**: 0.195 ETH
- **Rareza**: Raro
- **Efecto**: +13% velocidad de movimiento

## 🔧 **Implementación Técnica**

### **Función addNFTToUserCollection**

```typescript
async addNFTToUserCollection(
  nftDocumentId: string,
  userId: number
): Promise<SimpleNFTPurchaseResult>
```

**Proceso**:
1. Busca NFT en base de datos por `documentId`
2. Si no encuentra, busca en `mockMarketplaceNFTs`
3. Obtiene wallet del usuario desde `/user-wallets`
4. Crea nuevo NFT en `/user-nfts` con:
   - `user_wallet`: ID de la wallet del usuario
   - `owner_address`: Dirección de la wallet del usuario
   - `token_id`: Único generado
   - `is_listed_for_sale`: "False"

### **Función getAvailableNFTs**

```typescript
async getAvailableNFTs(): Promise<any[]>
```

**Proceso**:
1. Obtiene NFTs de la base de datos (`is_listed_for_sale = "True"`)
2. Agrega NFTs de demostración
3. Marca cada NFT con su fuente (`source: 'database' | 'mock'`)
4. Retorna array combinado

## 🎨 **Compatibilidad Visual**

- ✅ Mantiene todos los estilos del modal original
- ✅ Información de balance (demo con "∞ USDT")
- ✅ Pasos de compra simplificados
- ✅ Notificaciones de éxito/error
- ✅ Indicador de fuente (Demo/Database)

## 📝 **Notas Importantes**

### **Estructura de Relaciones**
- **NFT** → **User_Wallet** (manyToOne)
- **User_Wallet** → **User** (manyToOne)
- **Game_Session** → **User** (manyToOne)

### **Endpoints Correctos**
- **Crear NFT**: `/api/user-nfts`
- **Obtener wallet**: `/api/user-wallets`
- **Obtener sesión**: `/api/game-sessions`
- **Buscar NFTs**: `/api/nfts?filters[is_listed_for_sale][$eq]=True`

### **Campos Requeridos**
- `user_wallet`: ID de la wallet (obligatorio)
- `token_id`: Identificador único
- `owner_address`: Dirección de la wallet del comprador
- `is_listed_for_sale`: "False" para NFTs comprados

## 🚀 **Funcionalidades Futuras**

### **Sistema de Venta de NFTs**
Con esta implementación, los usuarios podrán:
1. **Listar NFTs para venta**: Cambiar `is_listed_for_sale` a "True"
2. **Establecer precios**: Modificar `listing_price_eth`
3. **Vender a otros usuarios**: Proceso de compra/venta real

### **Integración Completa**
1. **Integración con Stripe**: Para pagos reales
2. **Verificación de balance**: Con USDT real
3. **Sistema de equipamiento**: Para usar NFTs en el juego
4. **Historial de transacciones**: Para seguimiento de compras

## 🔍 **Archivos Modificados**

1. **`src/services/simpleNFTService.ts`** - Sistema híbrido de búsqueda
2. **`src/utils/mockNFTData.ts`** - Datos de demostración
3. **`docs/marketplace-fix-guide.md`** - Esta documentación

## 🎯 **Ventajas del Sistema Híbrido**

- ✅ **Flexibilidad**: Funciona con y sin base de datos
- ✅ **Escalabilidad**: Fácil agregar más fuentes de datos
- ✅ **Robustez**: Fallback automático a datos mock
- ✅ **Desarrollo**: Permite probar sin datos reales
- ✅ **Producción**: Listo para NFTs reales de usuarios

---

*El marketplace ahora funciona con un sistema híbrido que combina NFTs reales de la base de datos con datos de demostración, preparado para el sistema de venta de NFTs.* 