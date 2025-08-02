import type { UserNFT } from './nft';

// Tipos de efectos que pueden aplicar los NFTs
export type GameEffectType = 
  | 'health_boost'           // Aumenta vida máxima
  | 'weapon_damage_boost'    // Aumenta daño de armas
  | 'multiple_projectiles'   // Múltiples proyectiles
  | 'mining_efficiency'      // Eficiencia de minería
  | 'movement_speed'         // Velocidad de movimiento
  | 'experience_boost'       // Bonus de experiencia
  | 'magnetic_range'         // Rango magnético
  | 'fire_rate'             // Velocidad de disparo
  | 'shield_strength'       // Fuerza del escudo
  | 'critical_chance'       // Probabilidad crítica
  | 'bullet_speed'          // Velocidad de las balas
  | 'bullet_lifetime';      // Duración de las balas

// Unidades de medida para los efectos
export type EffectUnit = 'percentage' | 'count' | 'multiplier' | 'seconds' | 'pixels' | 'points';

// Categorías de efectos para organización
export type EffectCategory = 'offensive' | 'defensive' | 'utility' | 'mobility' | 'special';

// Interfaz base para un efecto de juego
export interface GameEffect {
  type: GameEffectType;
  value: number;
  unit: EffectUnit;
  category: EffectCategory;
  stackable: boolean;        // Si se puede acumular con otros efectos del mismo tipo
  maxStacks?: number;        // Máximo número de stacks
  duration?: number;         // Duración en segundos (0 = permanente)
  cooldown?: number;         // Tiempo de recarga en segundos
}

// Interfaz para efectos activos en el juego
export interface ActiveGameEffect extends GameEffect {
  id: string;               // ID único del efecto
  sourceNFT: string;        // documentId del NFT que otorga el efecto
  appliedAt: number;        // Timestamp cuando se aplicó
  expiresAt?: number;       // Timestamp cuando expira (si tiene duración)
  currentStacks: number;    // Stacks actuales
}

// Configuración de stats del jugador modificados por efectos
export interface PlayerStats {
  // Stats base
  baseHealth: number;
  baseDamage: number;
  baseSpeed: number;
  baseFireRate: number;
  baseMagneticRange: number;
  baseExperienceMultiplier: number;
  baseBulletSpeed: number;
  baseBulletLifetime: number;
  
  // Stats modificados (calculados)
  currentHealth: number;
  maxHealth: number;
  damage: number;
  speed: number;
  fireRate: number;
  magneticRange: number;
  experienceMultiplier: number;
  projectileCount: number;
  criticalChance: number;
  shieldStrength: number;
  bulletSpeed: number;
  bulletLifetime: number;
}

// Interfaz para NFTs equipados
export interface EquippedNFT {
  nft: UserNFT;
  effects: GameEffect[];
  equippedAt: number;
  slot?: string;            // Slot de equipamiento (opcional)
}

// Configuración de efectos por tipo de NFT
export interface NFTEffectConfig {
  [effectType: string]: {
    baseValue: number;
    scalingFactor: number;    // Factor de escalado por rareza
    maxValue: number;         // Valor máximo posible
    stackable: boolean;
    category: EffectCategory;
  };
}

// Multiplicadores por rareza
export const RARITY_MULTIPLIERS = {
  common: 1.0,
  rare: 1.5,
  epic: 2.0,
  legendary: 3.0
} as const;

// Configuración base de efectos
export const EFFECT_CONFIG: NFTEffectConfig = {
  health_boost: {
    baseValue: 10,
    scalingFactor: 1.5,
    maxValue: 100,
    stackable: true,
    category: 'defensive'
  },
  weapon_damage_boost: {
    baseValue: 5,
    scalingFactor: 1.3,
    maxValue: 50,
    stackable: true,
    category: 'offensive'
  },
  multiple_projectiles: {
    baseValue: 1,
    scalingFactor: 1.0,
    maxValue: 5,
    stackable: false,
    category: 'offensive'
  },
  mining_efficiency: {
    baseValue: 25,
    scalingFactor: 1.8,
    maxValue: 200,
    stackable: true,
    category: 'utility'
  },
  movement_speed: {
    baseValue: 8,
    scalingFactor: 1.2,
    maxValue: 40,
    stackable: true,
    category: 'mobility'
  },
  experience_boost: {
    baseValue: 10,
    scalingFactor: 1.4,
    maxValue: 75,
    stackable: true,
    category: 'utility'
  },
  magnetic_range: {
    baseValue: 20,
    scalingFactor: 1.6,
    maxValue: 150,
    stackable: true,
    category: 'utility'
  },
  fire_rate: {
    baseValue: 10,
    scalingFactor: 1.3,
    maxValue: 60,
    stackable: true,
    category: 'offensive'
  },
  critical_chance: {
    baseValue: 5,
    scalingFactor: 1.2,
    maxValue: 25,
    stackable: true,
    category: 'offensive'
  },
  shield_strength: {
    baseValue: 15,
    scalingFactor: 1.8,
    maxValue: 100,
    stackable: true,
    category: 'defensive'
  },
  bullet_speed: {
    baseValue: 15,
    scalingFactor: 1.4,
    maxValue: 80,
    stackable: true,
    category: 'offensive'
  },
  bullet_lifetime: {
    baseValue: 20,
    scalingFactor: 1.3,
    maxValue: 100,
    stackable: true,
    category: 'offensive'
  }
};