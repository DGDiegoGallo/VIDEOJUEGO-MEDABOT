# Guía de Transferencias de USDT

## Funcionalidad Implementada

La plataforma ahora incluye un sistema completo de transferencias de USDT similar a Binance, que permite a los usuarios transferir fondos entre sí de forma segura y eficiente.

## Características Principales

### 1. Búsqueda de Destinatarios
- **Por Wallet ID**: Los usuarios pueden buscar destinatarios usando su ID de wallet
- **Por Dirección**: También se puede buscar usando la dirección completa de la wallet
- **Verificación automática**: El sistema verifica si el destinatario existe en la plataforma

### 2. Redes Soportadas
El sistema soporta 3 redes principales de USDT:

| Red | Nombre | Comisión | Mínimo | Confirmaciones |
|-----|--------|----------|---------|----------------|
| BSC | BNB Smart Chain (BEP20) | 1.0 USDT | 0.01 USDT | 15 |
| ETH | Ethereum (ERC20) | 5.0 USDT | 10.0 USDT | 12 |
| TRX | TRON (TRC20) | 0.1 USDT | 0.01 USDT | 19 |

### 3. Tipos de Transferencia
- **Transferencia interna**: Entre usuarios de la plataforma (instantánea)
- **Transferencia externa**: A direcciones externas (requiere confirmación en blockchain)

## Cómo Usar

### Paso 1: Acceder a la Wallet
1. Ir a `/crypto-wallet` en la plataforma
2. Ingresar el PIN de seguridad para desbloquear la wallet
3. Hacer clic en la pestaña "Transferir"

### Paso 2: Buscar Destinatario
1. Seleccionar el modo de búsqueda:
   - **Wallet ID**: Para buscar por ID de wallet
   - **Dirección**: Para buscar por dirección completa
2. Ingresar el ID o dirección del destinatario
3. Hacer clic en el botón de búsqueda
4. Verificar que el destinatario sea correcto

### Paso 3: Configurar Transferencia
1. Seleccionar la red de transferencia (BSC, ETH, TRX)
2. Ingresar el monto a transferir
3. Revisar el resumen de costos:
   - Monto a transferir
   - Comisión de red
   - Total a pagar
   - Balance restante

### Paso 4: Confirmar y Procesar
1. Hacer clic en "Transferir"
2. Esperar a que se procese la transacción
3. Recibir confirmación de éxito

## Implementación Técnica

### Arquitectura
- **Frontend**: React con TypeScript
- **Backend**: Strapi v4 (sin modificaciones)
- **Base de datos**: Según configuración de Strapi

### Rutas Utilizadas (Strapi v4 estándar)
- `GET /api/user-wallets?filters[wallet_address][$eq]={walletId}&populate=*` - Buscar por wallet ID
- `GET /api/user-wallets?filters[wallet_address][$eq]={address}&populate=*` - Buscar por dirección
- `PUT /api/user-wallets/{documentId}` - Actualizar wallet con mapeo completo

### Servicios Frontend
- `userWalletService.findUserByWalletId(walletId)` - Buscar usuario por wallet ID
- `userWalletService.findUserByWalletAddress(address)` - Buscar usuario por dirección
- `userWalletService.processTransfer(amount, toAddress, networkId, recipientUserId)` - Procesar transferencia

## Flujo de Transferencia

### 1. Búsqueda de Destinatario
```typescript
// Buscar por wallet ID
const user = await userWalletService.findUserByWalletId(walletId);

// Buscar por dirección
const user = await userWalletService.findUserByWalletAddress(address);
```

### 2. Procesamiento de Transferencia
```typescript
const result = await userWalletService.processTransfer(
  amount,
  toAddress,
  networkId,
  recipientUserId
);
```

### 3. Actualización de Wallets
- **Remitente**: Se resta el monto + comisión
- **Destinatario**: Se aumenta el monto (sin comisión)
- **Mapeo completo**: Se preservan todos los campos existentes

## Seguridad

### Validaciones Implementadas
- Verificación de balance suficiente
- Validación de formato de dirección
- Prevención de auto-transferencia
- Verificación de montos mínimos
- Autenticación JWT requerida

### Protecciones
- PIN de seguridad para acceder a la wallet
- Límite de intentos de PIN
- Validación de red y comisiones
- Historial completo de transacciones

## Mapeo Completo de Datos

Para evitar reemplazos accidentales en Strapi, se mapean completamente todos los campos:

```typescript
const updateData = {
  data: {
    users_permissions_user: typeof wallet.users_permissions_user === 'object' 
      ? wallet.users_permissions_user.id 
      : wallet.users_permissions_user,
    wallet_address: wallet.wallet_address,
    pin_hash: wallet.pin_hash,
    encrypted_data: wallet.encrypted_data,
    is_active: wallet.is_active,
    usdt_balance: newBalance,
    transaction_history: updatedHistory
  }
};
```

## Ventajas de Usar Rutas Normales de Strapi

### ✅ Ventajas
- **Sin modificaciones en backend**: Mantiene la integridad del sistema
- **Compatibilidad**: Funciona con cualquier versión de Strapi v4+
- **Mantenimiento**: Más fácil de mantener y actualizar
- **Escalabilidad**: Aprovecha todas las características nativas de Strapi

### ✅ Funcionalidades Utilizadas
- **Filtros**: `filters[wallet_address][$eq]={value}`
- **Populate**: `populate=*` para obtener relaciones
- **PUT con documentID**: Para actualizaciones seguras
- **Mapeo completo**: Previene reemplazos accidentales

## Historial de Transacciones

Cada transferencia se registra con:
- ID único de transacción
- Tipo (compra/transferencia)
- Monto (negativo para remitente, positivo para destinatario)
- Direcciones de origen y destino
- Fecha y hora
- Estado de la transacción
- Hash de transacción
- Comisión aplicada
- Red utilizada

## Estructura de Datos

### UserWallet (Colección Strapi)
```json
{
  "id": "number",
  "documentId": "string",
  "wallet_address": "string",
  "usdt_balance": "decimal",
  "pin_hash": "string",
  "encrypted_data": {
    "private_key": "string",
    "mnemonic": "string",
    "public_key": "string"
  },
  "transaction_history": "json",
  "is_active": "boolean",
  "users_permissions_user": "relation(oneToOne)"
}
```

### WalletTransaction
```typescript
interface WalletTransaction {
  id: string;
  type: 'buy' | 'transfer';
  amount: number;
  from: string;
  to: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  network: 'BSC' | 'ETH' | 'TRX';
  tx_hash?: string;
  fee?: number;
  dollar_amount?: number;
}
```

## Archivos Modificados

### Frontend
- `src/components/crypto/TransferCryptoModal.tsx` - Modal completamente rediseñado
- `src/services/userWallet.service.ts` - Métodos de transferencia con rutas normales
- `src/views/company/CryptoWalletPage.tsx` - Cambio de "Retirar" a "Transferir"

### Backend
- **Ninguno** - Se utilizan las rutas normales de Strapi v4

## Pruebas

### Escenarios de Prueba
1. **Transferencia interna exitosa**:
   - Buscar usuario por wallet ID
   - Configurar transferencia
   - Verificar actualización de balances

2. **Transferencia externa**:
   - Buscar dirección no registrada
   - Procesar como transferencia externa
   - Verificar solo se actualiza remitente

3. **Validaciones**:
   - Balance insuficiente
   - Dirección inválida
   - Auto-transferencia
   - Montos mínimos

### Comandos de Prueba
```bash
# Ejecutar frontend
npm run dev

# Ejecutar backend Strapi
npm run develop
```

## Troubleshooting

### Problemas Comunes
- **Usuario no encontrado**: Verificar que el wallet ID/dirección sea correcto
- **Balance insuficiente**: Verificar que el balance cubra monto + comisión
- **Error de populate**: Verificar que la relación users_permissions_user esté configurada
- **Error de mapeo**: Verificar que todos los campos se mapeen correctamente

### Logs y Debugging
```typescript
// Verificar búsqueda de usuario
console.log('Searching for user:', walletId);

// Verificar datos de transferencia
console.log('Transfer data:', { amount, toAddress, networkId });

// Verificar mapeo de datos
console.log('Update data:', updateData);
```

---

*Esta implementación utiliza únicamente las rutas normales de Strapi v4, manteniendo la integridad del backend y aprovechando todas las características nativas del framework.* 