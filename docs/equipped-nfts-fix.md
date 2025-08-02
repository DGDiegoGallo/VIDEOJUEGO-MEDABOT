# Solución al Problema de NFTs Equipados

## Problema Identificado

El usuario tenía un NFT equipado en `equipped_items.nfts` de su sesión, pero el sistema solo estaba buscando NFTs en `user_nfts` del wallet. Esto causaba que los NFTs equipados no se detectaran.

### Datos del Usuario
```json
{
  "equipped_items": {
    "nfts": [
      {
        "id": "oj2m74umy4f0uls31ccf3ynn",
        "name": "Medalla del Tirador Maestro",
        "rarity": "legendary",
        "achievement_type": "power_enhancement",
        "attributes": [
          {
            "trait_type": "Effect Type",
            "value": "Multiple Projectiles"
          },
          {
            "trait_type": "Power Level", 
            "value": "x3 Projectiles"
          }
        ]
      }
    ]
  }
}
```

## Solución Implementada

### 1. Carga Dual de NFTs

El `GameNFTService` ahora carga NFTs de dos fuentes:

```typescript
async loadUserNFTs(userId: string | number): Promise<void> {
  // 1. NFTs del wallet del usuario
  const nftResponse = await NFTApiHelper.getNFTsByUserId(userId);
  const walletNFTs = nftResponse.data || [];
  
  // 2. NFTs equipados desde la sesión del usuario
  const sessionNFTs = await this.loadEquippedNFTsFromSession(userId);
  
  // 3. Combinar ambos arrays
  this.userNFTs = [...walletNFTs, ...sessionNFTs];
}
```

### 2. Conversión de NFTs Equipados

Los NFTs equipados se convierten al formato `UserNFT`:

```typescript
private async loadEquippedNFTsFromSession(userId: string | number): Promise<UserNFT[]> {
  // Obtener sesión del usuario
  const sessionResponse = await apiClient.get(
    `${API_CONFIG.ENDPOINTS.GAME.SESSIONS}?filters[users_permissions_user][id][$eq]=${userId}&populate=*`
  );
  
  const session = sessionResponse.data[0];
  const equippedNFTs = session.equipped_items?.nfts || [];
  
  // Convertir al formato UserNFT
  return equippedNFTs.map((equippedNFT: any) => ({
    id: equippedNFT.id,
    documentId: equippedNFT.id,
    metadata: {
      name: equippedNFT.name,
      rarity: equippedNFT.rarity,
      attributes: equippedNFT.attributes,
      // Generar game_effect automáticamente
      game_effect: this.getGameEffectFromNFT(equippedNFT)
    },
    is_listed_for_sale: 'False'
  }));
}
```

### 3. Generación Automática de Efectos

Los NFTs equipados no tienen `game_effect` en su metadata, por lo que se genera automáticamente:

```typescript
private getGameEffectFromNFT(nft: any): any {
  if (nft.achievement_type === 'power_enhancement') {
    const attributes = nft.attributes || [];
    
    // Buscar tipo de efecto en atributos
    const effectTypeAttr = attributes.find((attr: any) => 
      attr.trait_type === 'Effect Type'
    );
    const powerLevelAttr = attributes.find((attr: any) => 
      attr.trait_type === 'Power Level'
    );
    
    if (effectTypeAttr) {
      const effectType = this.mapEffectTypeFromAttribute(effectTypeAttr.value);
      const value = this.getEffectValueFromPowerLevel(powerLevelAttr?.value, nft.rarity);
      
      return {
        type: effectType,
        value: value,
        unit: this.getUnitFromEffectType(effectType)
      };
    }
  }
  
  return null;
}
```

### 4. Mapeo de Tipos de Efectos

```typescript
private mapEffectTypeFromAttribute(effectTypeValue: string): GameEffectType {
  const mapping: Record<string, GameEffectType> = {
    'Multiple Projectiles': 'multiple_projectiles',
    'Health Boost': 'health_boost',
    'Weapon Damage': 'weapon_damage_boost',
    'Movement Speed': 'movement_speed',
    'Fire Rate': 'fire_rate',
    'Critical Chance': 'critical_chance',
    'Shield Strength': 'shield_strength',
    'Bullet Speed': 'bullet_speed',
    'Bullet Lifetime': 'bullet_lifetime',
    'Magnetic Range': 'magnetic_range',
    'Experience Boost': 'experience_boost'
  };
  
  return mapping[effectTypeValue] || 'health_boost';
}
```

### 5. Cálculo de Valores

```typescript
private getEffectValueFromPowerLevel(powerLevel: string, rarity: string): number {
  // Extraer valor numérico (ej: "x3 Projectiles" → 3)
  const match = powerLevel.match(/(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  // Valores por defecto por rareza
  const defaultValues: Record<string, number> = {
    'common': 10,
    'rare': 15,
    'epic': 20,
    'legendary': 30
  };
  
  return defaultValues[rarity] || 10;
}
```

## Resultado Esperado

Para el NFT "Medalla del Tirador Maestro":

### Entrada
```json
{
  "name": "Medalla del Tirador Maestro",
  "rarity": "legendary",
  "attributes": [
    {
      "trait_type": "Effect Type",
      "value": "Multiple Projectiles"
    },
    {
      "trait_type": "Power Level",
      "value": "x3 Projectiles"
    }
  ]
}
```

### Salida Generada
```json
{
  "game_effect": {
    "type": "multiple_projectiles",
    "value": 3,
    "unit": "count"
  }
}
```

### Efecto Aplicado
- **Disparo múltiple**: 3 proyectiles simultáneos
- **Rareza legendaria**: Multiplicador x3.0
- **Resultado final**: 3 proyectiles por disparo

## Beneficios de la Solución

### 1. **Compatibilidad Completa**
- ✅ NFTs del wallet
- ✅ NFTs equipados en sesión
- ✅ Generación automática de efectos

### 2. **Escalabilidad**
- ✅ Fácil agregar nuevos tipos de efectos
- ✅ Mapeo automático de atributos
- ✅ Valores por defecto por rareza

### 3. **Robustez**
- ✅ Manejo de errores
- ✅ Valores por defecto
- ✅ Logging detallado

## Logs Esperados

```
🎮 Loading user NFTs for game effects...
🎮 Loading equipped NFTs from session...
✅ Loaded 1 wallet NFTs, 1 session NFTs, equipped 1
✅ Equipped NFT: Medalla del Tirador Maestro with 1 effects
🎮 Equipment loaded: 1 items, 100 max health, 3 projectiles
```

El sistema ahora detecta correctamente los NFTs equipados y aplica sus efectos al juego. 🚀 