import { useState, useEffect, useCallback } from 'react';
import { GameNFTService } from '@/services/gameNFTService';
import type { UserNFT } from '@/types/nft';
import type { GameEffect, GameEffectType } from '@/types/gameEffects';

// Tipos para el sistema de equipamiento
export interface EquipmentItem {
  id: string;
  type: 'nft' | 'weapon' | 'item';
  name: string;
  rarity: string;
  effects: GameEffect[];
  equippedAt: number;
  slot?: string; // Para futuras expansiones (weapon, armor, etc.)
}

export interface EquipmentStats {
  // Stats base del jugador
  baseHealth: number;
  baseDamage: number;
  baseSpeed: number;
  baseFireRate: number;
  baseProjectileCount: number;
  
  // Stats modificados por equipamiento
  currentHealth: number;
  maxHealth: number;
  damage: number;
  speed: number;
  fireRate: number;
  projectileCount: number;
  
  // Stats adicionales
  criticalChance: number;
  shieldStrength: number;
  bulletSpeed: number;
  bulletLifetime: number;
  magneticRange: number;
  experienceMultiplier: number;
}

export interface EquipmentEffects {
  items: EquipmentItem[];
  stats: EquipmentStats;
  effectsByType: Map<GameEffectType, GameEffect[]>;
  totalEffects: number;
}

export const useEquipment = (userId?: string | number) => {
  const [equipment, setEquipment] = useState<EquipmentEffects>({
    items: [],
    stats: {
      baseHealth: 100,
      baseDamage: 10,
      baseSpeed: 200,
      baseFireRate: 500,
      baseProjectileCount: 1,
      currentHealth: 100,
      maxHealth: 100,
      damage: 10,
      speed: 200,
      fireRate: 500,
      projectileCount: 1,
      criticalChance: 0,
      shieldStrength: 0,
      bulletSpeed: 400,
      bulletLifetime: 2000,
      magneticRange: 100,
      experienceMultiplier: 1.0
    },
    effectsByType: new Map(),
    totalEffects: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Cargar equipamiento del usuario
  const loadEquipment = useCallback(async () => {
    if (!userId || hasLoaded) return;

    setIsLoading(true);
    setError(null);

    try {
      const nftService = GameNFTService.getInstance();
      await nftService.loadUserNFTs(userId);
      
      // Convertir NFTs a formato de equipamiento
      const equippedNFTs = nftService.getEquippedNFTs();
      const equipmentItems: EquipmentItem[] = equippedNFTs.map(equippedNFT => ({
        id: equippedNFT.nft.documentId,
        type: 'nft',
        name: equippedNFT.nft.metadata.name,
        rarity: equippedNFT.nft.metadata.rarity,
        effects: equippedNFT.effects,
        equippedAt: equippedNFT.equippedAt
      }));

      // Calcular estadísticas combinadas
      const stats = calculateCombinedStats(equipmentItems);
      
      // Agrupar efectos por tipo
      const effectsByType = new Map<GameEffectType, GameEffect[]>();
      equipmentItems.forEach(item => {
        item.effects.forEach(effect => {
          if (!effectsByType.has(effect.type)) {
            effectsByType.set(effect.type, []);
          }
          effectsByType.get(effect.type)!.push(effect);
        });
      });

      setEquipment({
        items: equipmentItems,
        stats,
        effectsByType,
        totalEffects: equipmentItems.reduce((total, item) => total + item.effects.length, 0)
      });

      setHasLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading equipment');
    } finally {
      setIsLoading(false);
    }
  }, [userId, hasLoaded]);

  // Recargar equipamiento (útil después de comprar/vender items)
  const reloadEquipment = useCallback(async () => {
    setHasLoaded(false);
    await loadEquipment();
  }, [loadEquipment]);

  // Obtener valor total de un efecto específico
  const getEffectValue = useCallback((effectType: GameEffectType): number => {
    const effects = equipment.effectsByType.get(effectType) || [];
    return effects.reduce((total, effect) => total + effect.value, 0);
  }, [equipment.effectsByType]);

  // Verificar si tiene un tipo específico de equipamiento
  const hasEquipmentType = useCallback((type: string): boolean => {
    return equipment.items.some(item => item.type === type);
  }, [equipment.items]);

  // Obtener items por tipo
  const getItemsByType = useCallback((type: string): EquipmentItem[] => {
    return equipment.items.filter(item => item.type === type);
  }, [equipment.items]);

  return {
    equipment,
    isLoading,
    error,
    hasLoaded,
    loadEquipment,
    reloadEquipment,
    getEffectValue,
    hasEquipmentType,
    getItemsByType
  };
};

// Función para calcular estadísticas combinadas
function calculateCombinedStats(items: EquipmentItem[]): EquipmentStats {
  const baseStats = {
    baseHealth: 100,
    baseDamage: 10,
    baseSpeed: 200,
    baseFireRate: 500,
    baseProjectileCount: 1,
    bulletSpeed: 400,
    bulletLifetime: 2000,
    magneticRange: 100,
    experienceMultiplier: 1.0
  };

  // Agrupar efectos por tipo
  const effectsByType = new Map<GameEffectType, GameEffect[]>();
  items.forEach(item => {
    item.effects.forEach(effect => {
      if (!effectsByType.has(effect.type)) {
        effectsByType.set(effect.type, []);
      }
      effectsByType.get(effect.type)!.push(effect);
    });
  });

  // Calcular valores finales
  const stats: EquipmentStats = {
    ...baseStats,
    currentHealth: baseStats.baseHealth,
    maxHealth: baseStats.baseHealth,
    damage: baseStats.baseDamage,
    speed: baseStats.baseSpeed,
    fireRate: baseStats.baseFireRate,
    projectileCount: baseStats.baseProjectileCount,
    criticalChance: 0,
    shieldStrength: 0,
    bulletSpeed: baseStats.bulletSpeed,
    bulletLifetime: baseStats.bulletLifetime,
    magneticRange: baseStats.magneticRange,
    experienceMultiplier: baseStats.experienceMultiplier
  };

  // Aplicar efectos
  effectsByType.forEach((effects, effectType) => {
    const totalValue = effects.reduce((sum, effect) => sum + effect.value, 0);
    
    switch (effectType) {
      case 'health_boost':
        stats.maxHealth = baseStats.baseHealth + (baseStats.baseHealth * totalValue / 100);
        stats.currentHealth = stats.maxHealth; // Reset health when max health changes
        break;
      case 'weapon_damage_boost':
        stats.damage = baseStats.baseDamage + (baseStats.baseDamage * totalValue / 100);
        break;
      case 'movement_speed':
        stats.speed = baseStats.baseSpeed + (baseStats.baseSpeed * totalValue / 100);
        break;
      case 'fire_rate':
        stats.fireRate = Math.max(100, baseStats.baseFireRate - (baseStats.baseFireRate * totalValue / 100));
        break;
      case 'multiple_projectiles':
        // Para múltiples proyectiles, tomar el valor más alto (no stackeable)
        stats.projectileCount = Math.max(1, Math.floor(Math.max(...effects.map(e => e.value))));
        break;
      case 'critical_chance':
        stats.criticalChance = Math.min(100, totalValue);
        break;
      case 'shield_strength':
        stats.shieldStrength = totalValue;
        break;
      case 'bullet_speed':
        stats.bulletSpeed = baseStats.bulletSpeed + (baseStats.bulletSpeed * totalValue / 100);
        break;
      case 'bullet_lifetime':
        stats.bulletLifetime = baseStats.bulletLifetime + (baseStats.bulletLifetime * totalValue / 100);
        break;
      case 'magnetic_range':
        stats.magneticRange = baseStats.magneticRange + (baseStats.magneticRange * totalValue / 100);
        break;
      case 'experience_boost':
        stats.experienceMultiplier = baseStats.experienceMultiplier + (totalValue / 100);
        break;
    }
  });

  return stats;
} 