# Ejemplos de Uso del Sistema de NFTs

## 🎮 Cómo Funciona en el Juego

### Escenario 1: Jugador Nuevo Sin NFTs
```
Jugador inicia el juego
├── No tiene NFTs equipados
├── Juega con estadísticas base:
│   ├── Vida: 100 HP
│   ├── Daño: 10 por disparo
│   ├── Velocidad: 200 px/s
│   └── 1 proyectil por disparo
└── Puede comprar NFTs en el marketplace
```

### Escenario 2: Jugador con NFT Común
```
Jugador compra "Medalla de Vitalidad" (común)
├── NFT se equipa automáticamente al iniciar juego
├── Efecto aplicado: +15% vida máxima
├── Estadísticas finales:
│   ├── Vida: 115 HP (100 + 15%)
│   ├── Daño: 10 por disparo (sin cambio)
│   ├── Velocidad: 200 px/s (sin cambio)
│   └── 1 proyectil por disparo (sin cambio)
└── UI muestra: "Medalla de Vitalidad +15%"
```

### Escenario 3: Jugador con NFT Legendario
```
Jugador compra "Medalla del Tirador Maestro" (legendario)
├── NFT se equipa automáticamente
├── Efecto aplicado: 3 proyectiles simultáneos
├── Estadísticas finales:
│   ├── Vida: 100 HP (sin cambio)
│   ├── Daño: 10 por disparo × 3 = 30 daño efectivo
│   ├── Velocidad: 200 px/s (sin cambio)
│   └── 3 proyectiles por disparo
└── UI muestra: "Medalla del Tirador Maestro x3"
```

### Escenario 4: Jugador con Múltiples NFTs
```
Jugador tiene 3 NFTs equipados:
├── "Medalla de Vitalidad" (común): +15% vida
├── "Medalla del Guerrero" (común): +8% daño
└── "Medalla del Viento Veloz" (raro): +13% velocidad × 1.5 = +19.5%

Estadísticas finales:
├── Vida: 115 HP (100 + 15%)
├── Daño: 10.8 por disparo (10 + 8%)
├── Velocidad: 239 px/s (200 + 19.5%)
└── 1 proyectil por disparo

UI muestra:
├── "Medalla de Vitalidad +15%"
├── "Medalla del Guerrero +8%"
└── "Medalla del Viento Veloz +19.5%"
```

## 📊 Ejemplos de Cálculos de Rareza

### NFT con Efecto Base de +10% Vida

| Rareza | Multiplicador | Efecto Final | Vida Total |
|--------|---------------|--------------|------------|
| Común | 1.0x | +10% | 110 HP |
| Raro | 1.5x | +15% | 115 HP |
| Épico | 2.0x | +20% | 120 HP |
| Legendario | 3.0x | +30% | 130 HP |

### NFT con Efecto Base de +5% Daño

| Rareza | Multiplicador | Efecto Final | Daño Total |
|--------|---------------|--------------|------------|
| Común | 1.0x | +5% | 10.5 |
| Raro | 1.5x | +7.5% | 10.75 |
| Épico | 2.0x | +10% | 11.0 |
| Legendario | 3.0x | +15% | 11.5 |

## 🔄 Flujo de Compra y Equipamiento

### 1. Compra en Marketplace
```javascript
// Usuario compra NFT en el marketplace
// NFT se marca como is_listed_for_sale: "False"
// NFT se asocia al wallet del usuario
```

### 2. Inicio de Juego
```javascript
// Al iniciar MainScene
MainScene.loadUserNFTEffects()
    ↓
GameEffectsManager.loadUserEffects(userId)
    ↓
GameNFTService.loadUserNFTs(userId)
    ↓
// Filtrar NFTs no en venta
const availableNFTs = userNFTs.filter(nft => 
  nft.is_listed_for_sale === 'False'
)
    ↓
// Auto-equipar NFTs con efectos
availableNFTs.forEach(nft => {
  if (hasGameEffect(nft)) {
    equipNFT(nft)
  }
})
```

### 3. Aplicación de Efectos
```javascript
// Para cada NFT equipado
nft.metadata.game_effect = {
  type: "health_boost",
  value: 15,
  unit: "percentage"
}
    ↓
// Aplicar multiplicador de rareza
const finalValue = 15 * rarityMultipliers[nft.metadata.rarity]
// Común: 15 × 1.0 = 15%
// Raro: 15 × 1.5 = 22.5%
// Épico: 15 × 2.0 = 30%
// Legendario: 15 × 3.0 = 45%
    ↓
// Aplicar a estadísticas del jugador
player.maxHealth = baseHealth + (baseHealth * finalValue / 100)
```

### 4. Actualización de UI
```javascript
// UI se actualiza automáticamente cada frame
const nftEffects = gameEffectsManager.getUIEffectsInfo()
// Resultado: [
//   {
//     name: "Medalla de Vitalidad",
//     value: "+22.5%",
//     category: "defensive", 
//     rarity: "rare"
//   }
// ]
```

## 🎯 Casos de Uso Específicos

### Caso 1: Jugador Estratégico (Enfoque Defensivo)
```
NFTs Equipados:
├── Medalla de Vitalidad (raro): +22.5% vida
├── Medalla del Escudo (épico): +40 puntos de escudo
└── Medalla de Regeneración (común): +2 HP/seg

Resultado:
├── Vida máxima: 122.5 HP
├── Escudo: 40 puntos
├── Regeneración: 2 HP/seg
└── Estilo: Tanque resistente
```

### Caso 2: Jugador Agresivo (Enfoque Ofensivo)
```
NFTs Equipados:
├── Medalla del Guerrero (legendario): +45% daño
├── Medalla de Fuego Rápido (raro): +22.5% velocidad disparo
└── Medalla Crítica (épico): +20% probabilidad crítica

Resultado:
├── Daño: 14.5 por disparo
├── Velocidad de disparo: +22.5%
├── Probabilidad crítica: 20%
└── Estilo: DPS alto
```

### Caso 3: Jugador Equilibrado (Enfoque Híbrido)
```
NFTs Equipados:
├── Medalla de Vitalidad (común): +15% vida
├── Medalla del Guerrero (común): +8% daño
├── Medalla del Viento (raro): +19.5% velocidad
└── Medalla Magnética (común): +15% rango experiencia

Resultado:
├── Vida: 115 HP
├── Daño: 10.8 por disparo
├── Velocidad: 239 px/s
├── Rango magnético: +15%
└── Estilo: Versátil
```

## 🛒 Estrategias de Compra

### Para Principiantes
1. **Prioridad**: NFTs de vida (supervivencia)
2. **Presupuesto**: NFTs comunes y raros
3. **Recomendación**: "Medalla de Vitalidad" (común)

### Para Jugadores Intermedios
1. **Prioridad**: Combinación vida + daño
2. **Presupuesto**: NFTs raros y épicos
3. **Recomendación**: Set de NFTs complementarios

### Para Jugadores Avanzados
1. **Prioridad**: NFTs legendarios especializados
2. **Presupuesto**: Sin límite
3. **Recomendación**: "Medalla del Tirador Maestro" (legendario)

## 📈 Progresión del Jugador

### Nivel 1: Sin NFTs
```
Stats Base: 100 HP, 10 DMG, 200 SPD
Supervivencia: ~2 minutos
Puntuación promedio: 500 puntos
```

### Nivel 2: 1-2 NFTs Comunes
```
Stats: 115 HP, 10.8 DMG, 200 SPD
Supervivencia: ~3-4 minutos
Puntuación promedio: 1,200 puntos
```

### Nivel 3: 3-4 NFTs Mixtos
```
Stats: 125 HP, 12 DMG, 230 SPD
Supervivencia: ~5-6 minutos
Puntuación promedio: 2,500 puntos
```

### Nivel 4: NFTs Legendarios
```
Stats: 130 HP, 15 DMG, 3 proyectiles
Supervivencia: ~7-8 minutos (victoria)
Puntuación promedio: 5,000+ puntos
```

## 🎮 Comandos de Debug para Jugadores

### En Consola del Navegador (F12)
```javascript
// Ver efectos activos
gameDebug.showNFTEffects()

// Recargar efectos (después de comprar NFTs)
gameDebug.reloadNFTEffects()

// Ejecutar tests del sistema
testNFTEffects()
testNFTStacking()
```

### Información Mostrada
```javascript
// Ejemplo de salida de gameDebug.showNFTEffects()
{
  equippedNFTs: 3,
  nftNames: [
    "Medalla de Vitalidad",
    "Medalla del Guerrero", 
    "Medalla del Viento Veloz"
  ],
  effects: {
    health_boost: 15,
    weapon_damage_boost: 8,
    movement_speed: 19.5
  },
  stats: {
    maxHealth: 115,
    damage: 10.8,
    speed: 239,
    projectileCount: 1
  }
}
```

## 🏆 Logros y Metas

### Coleccionista
- **Meta**: Poseer 10+ NFTs diferentes
- **Recompensa**: Título especial en perfil

### Estratega
- **Meta**: Completar el juego con solo NFTs comunes
- **Recompensa**: NFT exclusivo de logro

### Leyenda
- **Meta**: Completar el juego con NFT legendario
- **Recompensa**: Multiplicador de puntuación permanente

## 🔮 Futuras Expansiones

### Sets de NFTs
```javascript
// Ejemplo: Set "Guerrero Ancestral"
{
  nfts: ["Espada Ancestral", "Armadura Ancestral", "Casco Ancestral"],
  setBonus: {
    2: { damage_boost: 10 },  // 2 NFTs del set: +10% daño
    3: { damage_boost: 25 }   // 3 NFTs del set: +25% daño total
  }
}
```

### NFTs Evolutivos
```javascript
// NFT que mejora con el uso
{
  metadata: {
    name: "Medalla Creciente",
    evolution: {
      kills_required: 100,
      current_kills: 45,
      next_level: {
        health_boost: 25  // Mejora de 15% a 25%
      }
    }
  }
}
```

Este sistema proporciona una experiencia de juego rica y escalable donde los NFTs tienen un impacto real y medible en el gameplay. 🚀