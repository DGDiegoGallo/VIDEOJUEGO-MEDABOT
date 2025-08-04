# Solución: Relaciones en el Proceso de Registro

## Problema Identificado

Durante el proceso de registro, se crean múltiples entidades (wallet, NFT, sesión del juego) pero las relaciones entre ellas no se establecen correctamente:

1. **Wallet** → Se crea correctamente y se relaciona con el usuario
2. **NFT** → Se crea pero no se relaciona correctamente con la wallet
3. **Sesión del Juego** → Se crea y se relaciona con el usuario y el NFT, pero el NFT no tiene la relación correcta con la wallet

## Solución Implementada

### 1. Modificaciones en `src/stores/authStore.ts`

**Cambios realizados:**
- Agregado tracking del `createdWalletResponse` para poder actualizar la wallet después
- Agregado tracking del `createdNFTId` para usar en las actualizaciones
- **Nueva funcionalidad:** Actualización de la wallet para incluir la relación con el NFT
- Mejorado el manejo de errores y logging

**Código agregado:**
```typescript
// Update wallet to include the NFT relationship
if (createdNFTId && createdWalletResponse?.data?.id) {
  try {
    console.log('🔄 Updating wallet to include NFT relationship');
    await apiClient.update('/user-wallets', createdWalletResponse.data.id, {
      user_nfts: [parseInt(createdNFTId, 10)]
    });
    console.log('✅ Wallet updated with NFT relationship');
  } catch (updateErr) {
    console.error('❌ Error updating wallet with NFT relationship:', updateErr);
  }
}
```

### 2. Modificaciones en `src/utils/api.ts`

**Cambios realizados:**
- Mejorado el logging en `createRegistrationAchievementNFT`
- Agregado logging del endpoint de la API
- Agregado logging de la estructura completa de la respuesta
- Mejorado el manejo de errores con detalles de HTTP status

### 3. Modificaciones en `src/utils/initialGameSession.ts`

**Cambios realizados:**
- Modificado `createInitialGameSession` para incluir la relación `user_nfts` en el payload principal
- **Nueva funcionalidad:** Actualización del NFT para incluir la relación con la sesión del juego
- Removido `user_nfts` de `createInitialGameSessionData` para evitar duplicación
- Mejorado el logging y manejo de errores

**Código agregado:**
```typescript
// Update the NFT to include the game session relationship
if (sessionResponse.data?.id) {
  try {
    console.log('🔄 Updating NFT to include game session relationship');
    await apiClient.update('/user-nfts', nftId, {
      game_sessions: [sessionResponse.data.id]
    });
    console.log('✅ NFT updated with game session relationship');
  } catch (updateErr) {
    console.error('❌ Error updating NFT with game session relationship:', updateErr);
  }
}
```

## Flujo Corregido

1. **Usuario se registra** → Se crea el usuario en Strapi
2. **Se crea la wallet** → Se relaciona con el usuario (`users_permissions_user`)
3. **Se crea el NFT** → Se relaciona con la wallet (`user_wallet`)
4. **Se actualiza la wallet** → Se agrega la relación con el NFT (`user_nfts`)
5. **Se crea la sesión del juego** → Se relaciona con el usuario y el NFT
6. **Se actualiza el NFT** → Se agrega la relación con la sesión del juego (`game_sessions`)

## Archivos de Prueba Creados

### `test-relationships.js`
Script con funciones para verificar las relaciones:
- `checkRelationships(userId)` - Verifica todas las relaciones de un usuario
- `checkNFT(nftId)` - Verifica un NFT específico
- `checkWallet(walletId)` - Verifica una wallet específica

### `test-relationships.html`
Interfaz web para ejecutar las pruebas de relaciones con controles visuales.

## Cómo Probar la Solución

### 1. Probar el Registro
1. Registra un nuevo usuario
2. Verifica en la consola del navegador que aparezcan los logs de creación
3. Confirma que no hay errores en las relaciones

### 2. Verificar las Relaciones
1. Abre `test-relationships.html` en el navegador
2. Usa el ID del usuario recién creado (ej: 80)
3. Ejecuta `checkRelationships(80)` para verificar todas las relaciones
4. Verifica que:
   - La wallet tenga NFTs relacionados
   - Los NFTs tengan wallet relacionada
   - Los NFTs tengan sesiones del juego relacionadas
   - Las sesiones del juego tengan NFTs relacionados

### 3. Verificar APIs Directamente
```bash
# Verificar wallet con NFTs
curl "http://localhost:1337/api/user-wallets?filters[users_permissions_user]=80&populate=*"

# Verificar NFT con wallet y sesiones
curl "http://localhost:1337/api/user-nfts/16?populate=*"

# Verificar sesiones con NFTs
curl "http://localhost:1337/api/game-sessions?filters[users_permissions_user]=80&populate=*"
```

## Resultados Esperados

Después de la corrección, deberías ver:

1. **Wallet API Response:**
```json
{
  "user_nfts": [
    {
      "id": 16,
      "token_id": "REG_...",
      "user_wallet": 80
    }
  ]
}
```

2. **NFT API Response:**
```json
{
  "user_wallet": {
    "id": 80,
    "wallet_address": "0x..."
  },
  "game_sessions": [
    {
      "id": 13,
      "session_name": "Sesión Inicial - Usuario"
    }
  ]
}
```

3. **Game Session API Response:**
```json
{
  "user_nfts": [
    {
      "id": 16,
      "token_id": "REG_..."
    }
  ]
}
```

## Notas Importantes

- Las actualizaciones de relaciones se realizan de forma asíncrona y no bloquean el registro
- Si alguna actualización falla, el registro continúa pero se registra el error
- Todos los logs están disponibles en la consola del navegador para debugging
- Las relaciones se establecen bidireccionalmente para consistencia de datos 