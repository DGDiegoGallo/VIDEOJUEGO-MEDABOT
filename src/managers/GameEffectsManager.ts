
import { GameNFTService } from '@/services/gameNFTService';
import type { 
  PlayerStats, 
  GameEffect, 
  GameEffectType,
  ActiveGameEffect 
} from '@/types/gameEffects';
import type { SkillLevels } from '@/types/game';
import type { Player } from './Player';
import type { BulletManager } from './BulletManager';
import type { ExperienceManager } from './ExperienceManager';
import { WeaponConfig, getWeaponConfig } from '@/config/weaponConfig';

export class GameEffectsManager {
  private nftService: GameNFTService;
  private activeEffects: Map<string, ActiveGameEffect> = new Map();
  private baseStats: PlayerStats;
  private currentStats: PlayerStats;
  private player: Player | null = null;
  private bulletManager: BulletManager | null = null;
  private experienceManager: ExperienceManager | null = null;
  
  // Sistema de habilidades del juego
  private gameSkills: SkillLevels = {
    rapidFire: 0,
    magneticField: 0,
    multiShot: 0
  };

  // Arma equipada
  private equippedWeapon: WeaponConfig;

  constructor() {
    this.nftService = GameNFTService.getInstance();
    
    // Inicializar con pistola por defecto
    this.equippedWeapon = getWeaponConfig('pistol_default');
    
    // Configurar estadísticas base
    this.baseStats = {
      baseHealth: 100,
      baseDamage: 10,
      baseSpeed: 200,
      projectileCount: 1,
      baseFireRate: 500,
      baseMagneticRange: 100,
      baseExperienceMultiplier: 1,
      criticalChance: 0,
      baseBulletSpeed: 400,
      baseBulletLifetime: 2000,
      shieldStrength: 0,
      
      // Estadísticas actuales (se calculan dinámicamente)
      currentHealth: 100,
      maxHealth: 100,
      damage: 10,
      speed: 200,
      fireRate: 500,
      magneticRange: 100,
      experienceMultiplier: 1,
      bulletSpeed: 400,
      bulletLifetime: 2000
    };
    
    this.currentStats = { ...this.baseStats };
  }

  /**
   * Inicializa el manager con los componentes del juego
   */
  initialize(
    player: Player, 
    bulletManager: BulletManager, 
    experienceManager: ExperienceManager
  ): void {
    this.player = player;
    this.bulletManager = bulletManager;
    this.experienceManager = experienceManager;
  }

  /**
   * Actualiza las habilidades del juego
   * @param skills - Nuevas habilidades del juego
   */
  updateGameSkills(skills: SkillLevels): void {
    this.gameSkills = { ...skills };
    
    // Recalcular efectos combinados
    this.applyAllEffects();
  }

  /**
   * Cambia el arma equipada y aplica sus efectos
   * @param weaponId - ID del arma a equipar
   */
  setEquippedWeapon(weaponId: string): void {
    this.equippedWeapon = getWeaponConfig(weaponId);
    console.log(`🔫 Arma equipada en GameEffectsManager: ${this.equippedWeapon.name}`);
    
    // Recalcular efectos combinados
    this.applyAllEffects();
  }

  /**
   * Obtiene el arma actualmente equipada
   */
  getEquippedWeapon(): WeaponConfig {
    return this.equippedWeapon;
  }

  /**
   * Obtiene las habilidades actuales del juego
   */
  getGameSkills(): SkillLevels {
    return { ...this.gameSkills };
  }

  /**
   * Calcula el valor combinado de un efecto (NFT + habilidades)
   * @param effectType - Tipo de efecto
   * @returns Valor combinado
   */
  private getCombinedEffectValue(effectType: GameEffectType): number {
    // Obtener valor de NFT
    const nftValue = this.nftService.getTotalEffectValue(effectType);
    
    // Obtener valor de habilidades
    const skillValue = this.getSkillEffectValue(effectType);
    
    // Combinar valores
    return this.combineEffectValues(effectType, nftValue, skillValue);
  }

  /**
   * Obtiene el valor de efecto de las habilidades del juego
   * @param effectType - Tipo de efecto
   * @returns Valor de la habilidad
   */
  private getSkillEffectValue(effectType: GameEffectType): number {
    switch (effectType) {
      case 'fire_rate':
        return this.gameSkills.rapidFire * 50; // 50ms reducción por nivel
      case 'magnetic_range':
        return this.gameSkills.magneticField * 20; // 20 unidades por nivel
      case 'multiple_projectiles':
        return this.gameSkills.multiShot; // 1 proyectil adicional por nivel
      default:
        return 0;
    }
  }

  /**
   * Combina valores de efectos de NFT y habilidades
   * @param effectType - Tipo de efecto
   * @param nftValue - Valor del NFT
   * @param skillValue - Valor de las habilidades
   * @returns Valor combinado
   */
  private combineEffectValues(effectType: GameEffectType, nftValue: number, skillValue: number): number {
    let combinedValue: number;
    
    // Para la mayoría de efectos, sumar valores
    // Para algunos efectos específicos, usar multiplicadores
    switch (effectType) {
      case 'experience_boost':
        combinedValue = nftValue * (1 + skillValue * 0.1); // Multiplicador de experiencia
        break;
      case 'critical_chance':
        combinedValue = Math.min(100, nftValue + skillValue); // Probabilidad crítica (máx 100%)
        break;
      default:
        combinedValue = nftValue + skillValue; // Suma simple para otros efectos
        break;
    }
    
    // Log para debugging
    if (nftValue > 0 || skillValue > 0) {
      console.log(`🔄 Combining ${effectType}: NFT(${nftValue}) + Skill(${skillValue}) = ${combinedValue}`);
    }
    
    return combinedValue;
  }

  /**
   * Muestra una notificación de los efectos de NFT aplicados
   */
  private showNFTEffectsNotification(): void {
    const equippedNFTs = this.nftService.getEquippedNFTs();
    
    if (equippedNFTs.length === 0) {
      return;
    }

    console.log('✨ NFT Effects Applied:');
    equippedNFTs.forEach(equipped => {
      const nft = equipped.nft;
      console.log(`🎖️ ${nft.metadata.name} (${nft.metadata.rarity})`);
      
      equipped.effects.forEach(effect => {
        const valueStr = effect.unit === 'percentage' ? `+${effect.value}%` : 
                        effect.unit === 'count' ? `x${effect.value}` : 
                        `+${effect.value}`;
        console.log(`   └─ ${effect.type}: ${valueStr}`);
      });
    });

    // Mostrar resumen de stats finales
    const summary = this.getEffectsSummary();
    console.log('📊 Final Stats:', summary.stats);
  }

  /**
   * Carga y aplica efectos de NFTs del usuario
   */
  async loadUserEffects(userId: string | number): Promise<void> {
    try {
      console.log('🎮 Loading user NFT effects...');
      await this.nftService.loadUserNFTs(userId);
      this.applyAllEffects();
      console.log('✅ User NFT effects loaded and applied');
      
      // Mostrar notificación de efectos aplicados
      this.showNFTEffectsNotification();
    } catch (error) {
      console.error('❌ Error loading user effects:', error);
    }
  }

  /**
   * Aplica todos los efectos (NFT + habilidades)
   */
  private applyAllEffects(): void {
    // Resetear stats a valores base
    this.currentStats = { ...this.baseStats };
    
    // Obtener efectos por tipo
    const effectsByType = this.nftService.getEffectsByType();
    
    // Aplicar cada tipo de efecto con valores combinados
    effectsByType.forEach((effects, effectType) => {
      this.applyEffectType(effectType, effects);
    });
    
    // Aplicar efectos de habilidades que no tienen NFT
    this.applySkillOnlyEffects();

    // Aplicar cambios a los managers del juego
    this.updateGameManagers();
  }

  /**
   * Aplica efectos que solo vienen de habilidades (sin NFT)
   * Solo aplica habilidades que NO tienen efectos NFT correspondientes
   */
  private applySkillOnlyEffects(): void {
    const effectsByType = this.nftService.getEffectsByType();
    
    // Fire rate (rapidFire) - Solo aplicar si no hay NFT con fire_rate
    if (this.gameSkills.rapidFire > 0 && !effectsByType.has('fire_rate')) {
      const fireRateReduction = this.gameSkills.rapidFire * 50;
      this.currentStats.fireRate = Math.max(100, this.baseStats.baseFireRate - fireRateReduction);
    }
    
    // Magnetic range (magneticField) - Solo aplicar si no hay NFT con magnetic_range
    if (this.gameSkills.magneticField > 0 && !effectsByType.has('magnetic_range')) {
      const magneticBoost = this.gameSkills.magneticField * 20;
      this.currentStats.magneticRange = this.baseStats.baseMagneticRange + magneticBoost;
    }
    
    // Multiple projectiles (multiShot) - Solo aplicar si no hay NFT con multiple_projectiles
    if (this.gameSkills.multiShot > 0 && !effectsByType.has('multiple_projectiles')) {
      const projectileBonus = this.gameSkills.multiShot;
      this.currentStats.projectileCount = Math.max(1, this.currentStats.projectileCount + projectileBonus);
    }
  }

  /**
   * Aplica un tipo específico de efecto con valores combinados
   */
  private applyEffectType(effectType: GameEffectType, _effects: GameEffect[]): void {
    const combinedValue = this.getCombinedEffectValue(effectType);
    
    if (combinedValue === 0) return;

    switch (effectType) {
      case 'health_boost':
        this.applyHealthBoost(combinedValue);
        break;
      case 'weapon_damage_boost':
        this.applyDamageBoost(combinedValue);
        break;
      case 'multiple_projectiles':
        this.applyMultipleProjectiles(combinedValue);
        break;
      case 'movement_speed':
        this.applySpeedBoost(combinedValue);
        break;
      case 'mining_efficiency':
        this.applyMiningBoost(combinedValue);
        break;
      case 'experience_boost':
        this.applyExperienceBoost(combinedValue);
        break;
      case 'magnetic_range':
        this.applyMagneticRangeBoost(combinedValue);
        break;
      case 'fire_rate':
        this.applyFireRateBoost(combinedValue);
        break;
      case 'critical_chance':
        this.applyCriticalChance(combinedValue);
        break;
      case 'shield_strength':
        this.applyShieldStrength(combinedValue);
        break;
      case 'bullet_speed':
        this.applyBulletSpeedBoost(combinedValue);
        break;
      case 'bullet_lifetime':
        this.applyBulletLifetimeBoost(combinedValue);
        break;
    }
  }

  /**
   * Aplica boost de vida
   */
  private applyHealthBoost(percentage: number): void {
    const healthIncrease = Math.floor(this.baseStats.baseHealth * (percentage / 100));
    this.currentStats.maxHealth = this.baseStats.baseHealth + healthIncrease;
    
    // Si el jugador está vivo, ajustar su vida actual proporcionalmente
    if (this.player && this.player.isAlive()) {
      const currentHealthPercentage = this.player.getHealthPercentage();
      const newCurrentHealth = Math.floor(this.currentStats.maxHealth * (currentHealthPercentage / 100));
      this.currentStats.currentHealth = newCurrentHealth;
    }
  }

  /**
   * Aplica boost de daño
   */
  private applyDamageBoost(percentage: number): void {
    const damageIncrease = this.baseStats.baseDamage * (percentage / 100);
    this.currentStats.damage = this.baseStats.baseDamage + damageIncrease;
  }

  /**
   * Aplica múltiples proyectiles (NFT + habilidades)
   */
  private applyMultipleProjectiles(count: number): void {
    const previousCount = this.currentStats.projectileCount;
    this.currentStats.projectileCount = Math.max(1, Math.floor(count));
    console.log(`🎯 Multiple projectiles: ${previousCount} → ${this.currentStats.projectileCount} (from combined value: ${count})`);
  }

  /**
   * Aplica boost de velocidad
   */
  private applySpeedBoost(percentage: number): void {
    const speedIncrease = this.baseStats.baseSpeed * (percentage / 100);
    this.currentStats.speed = this.baseStats.baseSpeed + speedIncrease;
  }

  /**
   * Aplica boost de eficiencia de minería
   * @param _percentage - Porcentaje de boost (no usado actualmente)
   */
  private applyMiningBoost(_percentage: number): void {
    // Implementación futura para efectos de minería
    // Por ahora, este efecto no se aplica a stats específicos
  }

  /**
   * Aplica boost de experiencia
   */
  private applyExperienceBoost(percentage: number): void {
    this.currentStats.experienceMultiplier = this.baseStats.baseExperienceMultiplier + (percentage / 100);
  }

  /**
   * Aplica boost de rango magnético (NFT + habilidades)
   */
  private applyMagneticRangeBoost(boost: number): void {
    this.currentStats.magneticRange = this.baseStats.baseMagneticRange + boost;
  }

  /**
   * Aplica boost de velocidad de disparo (NFT + habilidades)
   */
  private applyFireRateBoost(reduction: number): void {
    this.currentStats.fireRate = Math.max(100, this.baseStats.baseFireRate - reduction);
  }

  /**
   * Aplica probabilidad crítica
   */
  private applyCriticalChance(percentage: number): void {
    this.currentStats.criticalChance = Math.min(100, percentage);
  }

  /**
   * Aplica fuerza de escudo
   */
  private applyShieldStrength(value: number): void {
    this.currentStats.shieldStrength = value;
  }

  /**
   * Aplica boost de velocidad de balas
   */
  private applyBulletSpeedBoost(percentage: number): void {
    const speedIncrease = this.baseStats.baseBulletSpeed * (percentage / 100);
    this.currentStats.bulletSpeed = this.baseStats.baseBulletSpeed + speedIncrease;
  }

  /**
   * Aplica boost de tiempo de vida de balas
   */
  private applyBulletLifetimeBoost(percentage: number): void {
    const lifetimeIncrease = this.baseStats.baseBulletLifetime * (percentage / 100);
    this.currentStats.bulletLifetime = this.baseStats.baseBulletLifetime + lifetimeIncrease;
  }

  /**
   * Actualiza los managers del juego con las nuevas estadísticas
   */
  private updateGameManagers(): void {
    // Actualizar configuración del jugador
    if (this.player) {
      this.player.updateConfig({
        maxHealth: this.currentStats.maxHealth,
        speed: this.currentStats.speed
      });
      
      // Aplicar escudo si existe
      if (this.currentStats.shieldStrength > 0) {
        this.player.setShieldStrength(this.currentStats.shieldStrength);
      }
    }

    // Actualizar configuración de balas
    if (this.bulletManager) {
      // PRIMERO: Configurar el arma base
      this.bulletManager.setWeapon(this.equippedWeapon.id);
      
      // SEGUNDO: Aplicar modificadores de NFTs/habilidades por encima del arma base
      const weaponBulletsPerShot = this.equippedWeapon.effects.bulletsPerShot || 1;
      const combinedBulletsPerShot = Math.max(weaponBulletsPerShot, this.currentStats.projectileCount);
      
      // Aplicar los efectos combinados por encima de la configuración del arma
      this.bulletManager.updateConfig({
        bulletsPerShot: combinedBulletsPerShot,
        speed: this.currentStats.bulletSpeed,
        lifetime: this.currentStats.bulletLifetime
      });
    }

    // Actualizar configuración de experiencia
    if (this.experienceManager) {
      this.experienceManager.updateConfig({
        magneticRange: this.currentStats.magneticRange,
        experienceMultiplier: this.currentStats.experienceMultiplier
      } as any);
    }
  }

  /**
   * Obtiene las estadísticas actuales del jugador
   */
  getCurrentStats(): PlayerStats {
    return { ...this.currentStats };
  }

  /**
   * Obtiene un resumen de efectos activos
   */
  getEffectsSummary(): Record<string, any> {
    const equippedNFTs = this.nftService.getEquippedNFTs();
    const effectStats = this.nftService.getEffectStats();
    
    return {
      equippedNFTs: equippedNFTs.length,
      nftNames: equippedNFTs.map(e => e.nft.metadata.name),
      effects: effectStats,
      stats: {
        maxHealth: this.currentStats.maxHealth,
        damage: this.currentStats.damage,
        speed: this.currentStats.speed,
        projectileCount: this.currentStats.projectileCount,
        fireRate: this.currentStats.fireRate,
        magneticRange: this.currentStats.magneticRange,
        experienceMultiplier: this.currentStats.experienceMultiplier,
        criticalChance: this.currentStats.criticalChance,
        bulletSpeed: this.currentStats.bulletSpeed,
        bulletLifetime: this.currentStats.bulletLifetime,
        shieldStrength: this.currentStats.shieldStrength
      }
    };
  }

  /**
   * Recalcula efectos (útil cuando se equipan/desequipan NFTs)
   */
  recalculateEffects(): void {
    this.applyAllEffects();
  }

  /**
   * Recarga los efectos de NFT del usuario (útil después de comprar/vender NFTs)
   */
  async reloadUserEffects(userId: string | number): Promise<void> {
    try {
      // Limpiar efectos actuales
      this.clearAllEffects();
      
      // Recargar NFTs del usuario
      await this.nftService.reloadUserNFTs(userId);
      
      // Aplicar nuevos efectos
      this.applyAllEffects();
      
      // Mostrar notificación
      this.showNFTEffectsNotification();
    } catch (error) {
      console.error('❌ Error reloading user effects:', error);
    }
  }

  /**
   * Obtiene información detallada de los NFTs equipados para debugging
   */
  getEquippedNFTsInfo(): Array<{
    name: string;
    type: string;
    rarity: string;
    effects: Array<{
      type: string;
      value: number;
      unit: string;
    }>;
  }> {
    const equippedNFTs = this.nftService.getEquippedNFTs();
    
    return equippedNFTs.map(equipped => ({
      name: equipped.nft.metadata.name,
      type: equipped.nft.metadata.type || 'nft',
      rarity: equipped.nft.metadata.rarity,
      effects: equipped.effects.map(effect => ({
        type: effect.type,
        value: effect.value,
        unit: effect.unit
      }))
    }));
  }

  /**
   * Obtiene información para mostrar en la UI
   */
  getUIEffectsInfo(): Array<{
    name: string;
    value: string;
    category: string;
    rarity: string;
  }> {
    const equippedNFTs = this.nftService.getEquippedNFTs();
    const effectsInfo: Array<{
      name: string;
      value: string;
      category: string;
      rarity: string;
    }> = [];

    equippedNFTs.forEach(equipped => {
      equipped.effects.forEach(effect => {
        let valueStr = '';
        switch (effect.unit) {
          case 'percentage':
            valueStr = `+${effect.value}%`;
            break;
          case 'count':
            valueStr = `x${effect.value}`;
            break;
          case 'multiplier':
            valueStr = `${effect.value}x`;
            break;
          default:
            valueStr = `+${effect.value}`;
        }

        effectsInfo.push({
          name: equipped.nft.metadata.name,
          value: valueStr,
          category: effect.category,
          rarity: equipped.nft.metadata.rarity
        });
      });
    });

    return effectsInfo;
  }

  /**
   * Limpia todos los efectos
   */
  clearAllEffects(): void {
    this.activeEffects.clear();
    this.currentStats = { ...this.baseStats };
    this.nftService.clearEquippedNFTs();
  }

  /**
   * Destruye el manager
   */
  destroy(): void {
    this.clearAllEffects();
    this.player = null;
    this.bulletManager = null;
    this.experienceManager = null;
  }
}