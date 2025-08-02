# Guía de Medallas NFT - Datos Demo

## Resumen de las 5 Medallas Creadas

Se han creado 5 medallas NFT con diferentes rarezas, precios y efectos de juego para demostrar el marketplace:

### 1. 🔴 Medalla de Vitalidad (Común)
- **Precio**: 0.025 ETH
- **Efecto**: +15% Vida máxima
- **Categoría**: Defensiva
- **Descripción**: Una medalla mística que fortalece la resistencia del portador
- **Icono**: FaHeart (corazón)

### 2. ⚔️ Medalla del Guerrero (Común)
- **Precio**: 0.032 ETH
- **Efecto**: +8% Daño de armas
- **Categoría**: Ofensiva
- **Descripción**: Forjada en los campos de batalla más intensos
- **Icono**: FaSword (espada)

### 3. 🎯 Medalla del Tirador Maestro (Legendaria)
- **Precio**: 1.250 ETH
- **Efecto**: x3 Proyectiles múltiples
- **Categoría**: Ofensiva
- **Descripción**: Permite disparar 3 proyectiles simultáneamente
- **Icono**: FaBullseye (diana)

### 4. 💎 Medalla del Minero Experto (Épica)
- **Precio**: 0.485 ETH
- **Efecto**: +100% Eficiencia de minería
- **Categoría**: Utilidad
- **Descripción**: Duplica la cantidad de minerales obtenidos
- **Icono**: FaGem (gema)

### 5. ⚡ Medalla del Viento Veloz (Rara)
- **Precio**: 0.195 ETH
- **Efecto**: +13% Velocidad de movimiento
- **Categoría**: Movilidad
- **Descripción**: Otorga mayor velocidad para esquivar y posicionarse
- **Icono**: FaBolt (rayo)

## Distribución por Rareza

- **Común (2)**: Vitalidad, Guerrero
- **Rara (1)**: Viento Veloz
- **Épica (1)**: Minero Experto
- **Legendaria (1)**: Tirador Maestro

## Rangos de Precios

- **Común**: 0.025 - 0.032 ETH
- **Rara**: 0.195 ETH
- **Épica**: 0.485 ETH
- **Legendaria**: 1.250 ETH

## Efectos de Juego Planificados

### Defensivos
- **Vitalidad**: Aumenta HP máximo del jugador

### Ofensivos
- **Guerrero**: Multiplica el daño base de todas las armas
- **Tirador Maestro**: Dispara múltiples proyectiles por cada ataque

### Utilidad
- **Minero Experto**: Duplica recursos obtenidos al minar

### Movilidad
- **Viento Veloz**: Aumenta velocidad de movimiento del personaje

## Estructura de Datos

Cada medalla incluye:

```typescript
interface GameEffect {
  type: string;           // Tipo de efecto
  value: number;          // Valor numérico del efecto
  unit: string;           // Unidad (percentage, count, etc.)
}

interface MedalNFT {
  metadata: {
    name: string;
    description: string;
    icon_name: string;    // React Icon component
    rarity: NFTRarity;
    game_effect: GameEffect;
    attributes: NFTAttribute[];
  };
  // ... otros campos estándar de NFT
}
```

## Uso en el Marketplace

### Cargar Datos Demo
1. Ir al Marketplace de NFTs
2. Hacer clic en "Datos Demo"
3. Se cargarán las 5 medallas automáticamente

### Funcionalidades Disponibles
- **Visualización**: Ver todas las medallas con sus efectos
- **Filtros**: Por rareza (común, rara, épica, legendaria)
- **Búsqueda**: Por nombre o descripción
- **Ordenamiento**: Por precio, fecha, rareza
- **Modal de detalles**: Ver información completa
- **Simulación de compra**: Botón de compra (sin transacción real)

## Implementación Futura

### Mecánicas de Juego
- Sistema de inventario para medallas equipadas
- Aplicación de efectos en tiempo real durante el juego
- Combinación de efectos múltiples
- Sistema de durabilidad o usos limitados

### Marketplace Avanzado
- Transacciones reales con blockchain
- Sistema de ofertas y subastas
- Historial de precios y tendencias
- Notificaciones de ventas

### Nuevas Medallas
- Medallas de elementos (fuego, hielo, eléctrico)
- Medallas de habilidades especiales
- Medallas de resistencias
- Medallas de crafting y construcción

## Archivos Relacionados

- `docs/marketplace-nft-data.json` - Datos JSON completos
- `src/utils/mockNFTData.ts` - Utilidades para datos mock
- `src/stores/nftStore.ts` - Store con soporte para datos demo
- `src/components/nft/NFTMarketplace.tsx` - Componente con botón demo

## Comandos de Desarrollo

```bash
# Ejecutar en modo desarrollo
npm run dev

# Verificar tipos
npm run type-check

# Navegar al marketplace
# http://localhost:3000 -> Lobby -> NFTs -> Marketplace -> "Datos Demo"
```

Esta implementación proporciona una base sólida para el sistema de medallas NFT del juego, con datos realistas y una estructura escalable para futuras expansiones.