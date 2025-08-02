# Guía para Agregar Nuevos Efectos de NFT

## Pasos para Agregar un Nuevo Efecto

### 1. Agregar el Tipo de Efecto

En `src/types/gameEffects.ts`, agregar el nuevo tipo al enum:

```typescript
export type GameEffectType =
  | "health_boost"
  | "weapon_damage_boost"
  // ... otros efectos existentes
  | "new_effect_type"; // ← Agregar aquí
```

### 2. Configurar el Efecto

En `src/types/gameEffects.ts`, agregar la configuración:

```typescript
export const EFFECT_CONFIG: NFTEffectConfig = {
  // ... configuraciones existentes
  new_effect_type: {
    baseValue: 10, // Valor base del efecto
    scalingFactor: 1.2, // Factor de escalado por rareza
    maxValue: 50, // Valor máximo posible
    stackable: true, // Si se puede acumular
    category: "utility", // Categoría del efecto
  },
};
```

### 3. Implementar la Lógica del Efecto

En `src/managers/GameEffectsManager.ts`, agregar el caso en `applyEffectType`:

```typescript
switch (effectType) {
  // ... casos existentes
  case "new_effect_type":
    this.applyNewEffect(totalValue);
    break;
}
```

Y crear el método de aplicación:

```typescript
/**
 * Aplica el nuevo efecto
 */
private applyNewEffect(value: number): void {
  // Implementar la lógica específica del efecto
  this.currentStats.newProperty = this.baseStats.baseNewProperty + value;
  console.log(`🆕 New effect: +${value}`);
}
```

### 4. Actualizar las Estadísticas Base

En `src/types/gameEffects.ts`, agregar las nuevas propiedades a `PlayerStats`:

```typescript
export interface PlayerStats {
  // ... propiedades existentes
  baseNewProperty: number; // Valor base
  newProperty: number; // Valor calculado
}
```

### 5. Inicializar en el Constructor

En `src/managers/GameEffectsManager.ts`, inicializar los valores base:

```typescript
this.baseStats = {
  // ... valores existentes
  baseNewProperty: 100,
  newProperty: 100,
};
```

### 6. Aplicar a los Managers del Juego

En `updateGameManagers()`, aplicar el efecto a los managers correspondientes:

```typescript
private updateGameManagers(): void {
  // ... actualizaciones existentes

  // Aplicar nuevo efecto a manager específico
  if (this.someManager) {
    this.someManager.updateConfig({
      newProperty: this.currentStats.newProperty
    } as any);
  }
}
```

## Ejemplo Completo: Efecto de Velocidad de Regeneración

### 1. Agregar el Tipo

```typescript
export type GameEffectType = "health_boost" | "regeneration_rate"; // ← Nuevo efecto
```

### 2. Configurar

```typescript
export const EFFECT_CONFIG: NFTEffectConfig = {
  regeneration_rate: {
    baseValue: 5,
    scalingFactor: 1.3,
    maxValue: 25,
    stackable: true,
    category: "defensive",
  },
};
```

### 3. Implementar

```typescript
case 'regeneration_rate':
  this.applyRegenerationRate(totalValue);
  break;

private applyRegenerationRate(rate: number): void {
  this.currentStats.regenerationRate = this.baseStats.baseRegenerationRate + rate;
  console.log(`💚 Regeneration rate: +${rate}/sec`);
}
```

### 4. Actualizar Stats

```typescript
export interface PlayerStats {
  baseRegenerationRate: number;
  regenerationRate: number;
}
```

### 5. Inicializar

```typescript
this.baseStats = {
  baseRegenerationRate: 0,
  regenerationRate: 0,
};
```

### 6. Aplicar al Player

```typescript
if (this.player) {
  this.player.updateConfig({
    regenerationRate: this.currentStats.regenerationRate,
  } as any);
}
```

## Efectos Avanzados

### Efectos Condicionales

```typescript
private applyConditionalEffect(value: number): void {
  // Solo aplicar si se cumple una condición
  if (this.currentStats.health < this.currentStats.maxHealth * 0.5) {
    this.currentStats.damage += value;
    console.log(`⚡ Conditional damage boost: +${value} (low health)`);
  }
}
```

### Efectos con Cooldown

```typescript
private applyTimedEffect(value: number, duration: number): void {
  // Aplicar efecto temporal
  this.currentStats.damage += value;

  // Programar remoción del efecto
  setTimeout(() => {
    this.currentStats.damage -= value;
    this.updateGameManagers();
    console.log(`⏰ Timed effect expired: -${value} damage`);
  }, duration * 1000);
}
```

### Efectos de Sinergia

```typescript
private applySynergyEffect(effectType: GameEffectType, value: number): void {
  let finalValue = value;

  // Verificar sinergias con otros efectos activos
  const activeEffects = this.nftService.getEffectsByType();

  if (effectType === 'weapon_damage_boost' && activeEffects.has('fire_rate')) {
    finalValue *= 1.2; // +20% si también tiene fire_rate
    console.log(`🔗 Synergy bonus applied: ${value} → ${finalValue}`);
  }

  this.currentStats.damage += finalValue;
}
```

## Mejores Prácticas

### 1. Nomenclatura Consistente

- Usar snake_case para tipos de efectos
- Prefijos claros: `boost_`, `rate_`, `chance_`
- Nombres descriptivos: `critical_chance` vs `crit`

### 2. Valores Balanceados

- Efectos base moderados (5-15%)
- Multiplicadores de rareza razonables (1.0-3.0)
- Límites máximos para evitar overpowering

### 3. Logging Consistente

- Usar emojis para identificar tipos de efectos
- Mostrar valores antes y después
- Incluir información de rareza y stacking

### 4. Testing

```typescript
// Ejemplo de test para nuevo efecto
describe("New Effect", () => {
  it("should apply correctly", () => {
    const manager = new GameEffectsManager();
    manager.applyNewEffect(10);
    expect(manager.getCurrentStats().newProperty).toBe(110);
  });
});
```

### 5. Documentación

- Actualizar `nft-game-mechanics-guide.md`
- Agregar ejemplos de NFTs con el nuevo efecto
- Documentar interacciones con otros efectos

## Checklist para Nuevos Efectos

- [ ] Agregar tipo a `GameEffectType`
- [ ] Configurar en `EFFECT_CONFIG`
- [ ] Implementar lógica en `applyEffectType`
- [ ] Actualizar `PlayerStats` interface
- [ ] Inicializar valores base
- [ ] Aplicar a managers correspondientes
- [ ] Agregar logging apropiado
- [ ] Crear tests unitarios
- [ ] Actualizar documentación
- [ ] Probar con NFTs de diferentes rarezas
- [ ] Verificar stacking si aplica
- [ ] Validar balance del juego
