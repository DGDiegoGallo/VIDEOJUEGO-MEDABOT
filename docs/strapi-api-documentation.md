# Documentación de API Strapi v4 - Medabot Game

## Configuración Base

```typescript
// src/config/api.ts
export const API_CONFIG = {
  STRAPI_URL: "http://localhost:1337",
  BLOCKCHAIN_NETWORK: "sepolia",
  NFT_CONTRACT_ADDRESS: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/local",
      REGISTER: "/auth/local/register",
      ME: "/users/me",
    },
    WALLET: {
      USER_WALLETS: "/user-wallets",
      USER_NFTS: "/user-nfts",
    },
  },
};
```

## Rutas de API Strapi v4

### Autenticación

#### Login

```http
POST http://localhost:1337/api/auth/local
Content-Type: application/json

{
  "identifier": "email@example.com",
  "password": "password123"
}
```

#### Registro

```http
POST http://localhost:1337/api/auth/local/register
Content-Type: application/json

{
  "username": "usuario",
  "email": "email@example.com",
  "password": "password123"
}
```

### Wallets (user-wallets)

#### Crear Wallet

```http
POST http://localhost:1337/api/user-wallets
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "data": {
    "users_permissions_user": 1,
    "wallet_address": "0x...",
    "usdt_balance": 0,
    "pin_hash": "hash...",
    "encrypted_data": {
      "private_key": "0x...",
      "mnemonic": "words...",
      "public_key": "0x..."
    },
    "transaction_history": [],
    "is_active": true
  }
}
```

#### Obtener Wallet por DocumentID

```http
GET http://localhost:1337/api/user-wallets/{documentId}?populate=*
```

#### Obtener Wallets con Filtros

```http
GET http://localhost:1337/api/user-wallets?filters[users_permissions_user][id][$eq]=1&populate=*
```

### NFTs (user-nfts)

#### Crear NFT

```http
POST http://localhost:1337/api/user-nfts
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "data": {
    "user_wallet": 71,
    "token_id": "REG_1234567890_1234",
    "contract_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "token_uri": "http://localhost:1337/api/nft-metadata/token_id",
    "metadata": {
      "name": "NFT Name",
      "description": "NFT Description",
      "icon_name": "FaTrophy",
      "achievement_type": "registration_achievement",
      "rarity": "common",
      "attributes": [
        {
          "trait_type": "Achievement Type",
          "value": "Registration Pioneer"
        }
      ]
    },
    "network": "ethereum-goerli",
    "owner_address": "0x...",
    "is_listed_for_sale": "False",
    "listing_price_eth": 0,
    "minted_at": "2025-07-29T21:50:39.828Z",
    "last_transfer_at": "2025-07-29T21:50:39.828Z"
  }
}
```

#### Obtener NFT por DocumentID

```http
GET http://localhost:1337/api/user-nfts/{documentId}?populate=*
```

#### Obtener NFTs por Wallet

```http
GET http://localhost:1337/api/user-nfts?filters[user_wallet][id][$eq]=71&populate=*
```

#### Obtener NFTs en Venta (para Marketplace)

```http
GET http://localhost:1337/api/user-nfts?filters[is_listed_for_sale][$eq]=True&populate=*
```

#### Obtener NFTs por Rareza

```http
GET http://localhost:1337/api/user-nfts?filters[metadata][rarity][$eq]=legendary&populate=*
```

## Enumeraciones de Strapi

### Network Types

```typescript
type NetworkType =
  | "ethereum-mainnet"
  | "ethereum-goerli"
  | "polygon-mainnet"
  | "polygon-mumbai"
  | "binance-smart-chain"
  | "bnb-testnet"
  | "arbitrum-one"
  | "arbitrum-goerli"
  | "optimism-mainnet"
  | "optimism-goerli"
  | "avalanche-c"
  | "fantom-mainnet"
  | "base-mainnet"
  | "base-goerli"
  | "zkSync-era"
  | "linea-mainnet"
  | "scroll-mainnet"
  | "aurora-mainnet"
  | "solana-mainnet"
  | "solana-devnet";
```

### Listing Status

```typescript
type ListingStatus = "True" | "False";
```

### NFT Rarity

```typescript
type NFTRarity = "common" | "rare" | "epic" | "legendary";
```

## Patrones de Consulta Comunes

### Paginación

```http
GET http://localhost:1337/api/user-nfts?pagination[page]=1&pagination[pageSize]=10&populate=*
```

### Ordenamiento

```http
GET http://localhost:1337/api/user-nfts?sort[0]=createdAt:desc&populate=*
```

### Filtros Múltiples

```http
GET http://localhost:1337/api/user-nfts?filters[is_listed_for_sale][$eq]=True&filters[listing_price_eth][$lte]=1.0&populate=*
```

### Búsqueda por Texto

```http
GET http://localhost:1337/api/user-nfts?filters[metadata][name][$containsi]=medabot&populate=*
```

## Estructura de Respuestas

### Respuesta Individual

```json
{
  "data": {
    "id": 8,
    "documentId": "eaqrilhamj3tf48ae7l255ao",
    "createdAt": "2025-07-29T21:50:40.155Z",
    "updatedAt": "2025-07-29T21:50:40.155Z",
    "publishedAt": "2025-07-29T21:50:40.171Z",
    "attributes": {
      // ... campos del modelo
    }
  },
  "meta": {}
}
```

### Respuesta de Colección

```json
{
  "data": [
    {
      "id": 8,
      "documentId": "eaqrilhamj3tf48ae7l255ao",
      "attributes": {
        // ... campos del modelo
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

## Notas Importantes

1. **DocumentID vs ID**: Usar `documentId` para consultas específicas en Strapi v4
2. **Populate**: Siempre usar `?populate=*` para obtener relaciones
3. **Autenticación**: Incluir `Authorization: Bearer JWT_TOKEN` para endpoints protegidos
4. **Enumeraciones**: Usar valores exactos de las enumeraciones de Strapi
5. **Relaciones**: Los IDs numéricos se usan para establecer relaciones entre colecciones
