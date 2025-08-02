import { NFTApiHelper } from '@/utils/nftHelpers';
import type { UserNFT, NFTRarity } from '@/types/nft';
import type { 
  GameEffect, 
  GameEffectType, 
  EquippedNFT
} from '@/types/gameEffects';
import { RARITY_MULTIPLIERS, EFFECT_CONFIG } from '@/types/gameEffects';
import { apiClient } from '@/utils/api';
import { API_CONFIG } from '@/config/api';

export class GameNFTService {
  private static instance: GameNFTService;
  private equippedNFTs: Map<string, EquippedNFT> = new Map();
  private userNFTs: UserNFT[] = [];

  static getInstance(): GameNFTService {
    if (!GameNFTService.instance) {
      GameNFTService.instance = new GameNFTService();
    }
    return GameNFTService.instance;
  }

  /**
   * Carga los NFTs del usuario para efectos del juego
   * @param userId - ID del usuario
   */
  async loadUserNFTs(userId: string | number): Promise<void> {
    try {
      console.log('🎮 Loading NFTs for user:', userId);
      
      // Cargar NFTs del wallet del usuario
      const walletResponse = await NFTApiHelper.getNFTsByUserId(userId);
      const walletNFTs = walletResponse.data || [];
      console.log('🎮 Wallet NFTs loaded:', walletNFTs.length);
      
      // Cargar NFTs equipados desde la sesión del juego
      const sessionNFTs = await this.loadEquippedNFTsFromSession(userId);
      console.log('🎮 Session NFTs loaded:', sessionNFTs.length);
      
      // Combinar ambos arrays
      this.userNFTs = [...walletNFTs, ...sessionNFTs];
      console.log('🎮 Total NFTs:', this.userNFTs.length);
      
      // Auto-equipar NFTs que no están en venta
      this.autoEquipNFTs();
      console.log('🎮 Auto-equipped NFTs:', this.equippedNFTs.size);
    } catch (error) {
      console.error('Error loading user NFTs:', error);
      this.userNFTs = [];
    }
  }

  /**
   * Carga NFTs equipados desde la sesión del juego
   * @param userId - ID del usuario
   * @returns Promise con los NFTs de la sesión
   */
  private async loadEquippedNFTsFromSession(userId: string | number): Promise<UserNFT[]> {
    try {
      const sessionResponse = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.GAME.SESSIONS}?filters[users_permissions_user][id][$eq]=${userId}&populate=*`
      );
      
      const sessionData = sessionResponse.data as any[];
      if (!sessionData || sessionData.length === 0) {
        return [];
      }
      
      const session = sessionData[0];
      if (!session || !session.equipped_items?.nfts) {
        return [];
      }
      
      const equippedNFTs = session.equipped_items.nfts;
      return equippedNFTs.map((equippedNFT: any) => ({
        id: equippedNFT.id || `session_${equippedNFT.documentId}`,
        documentId: equippedNFT.documentId,
        tokenId: equippedNFT.tokenId || equippedNFT.documentId,
        contractAddress: equippedNFT.contractAddress || 'session_contract',
        metadata: {
          name: equippedNFT.name || 'Session NFT',
          description: equippedNFT.description || 'NFT equipado en sesión',
          image: equippedNFT.image || '',
          rarity: equippedNFT.rarity || 'common',
          game_effect: this.getGameEffectFromNFT(equippedNFT)
        },
        is_listed_for_sale: 'False',
        listing_price_eth: 0
      }));
    } catch (error) {
      console.error('Error loading session NFTs:', error);
      return [];
    }
  }

  /**
   * Genera el game_effect desde los atributos del NFT
   * @param nft - NFT de la sesión
   * @returns Objeto game_effect
   */
  private getGameEffectFromNFT(nft: any): any {
    if (nft.achievement_type === 'power_enhancement') {
      const attributes = nft.attributes || [];
      const effectTypeAttr = attributes.find((attr: any) => attr.trait_type === 'Effect Type');
      const powerLevelAttr = attributes.find((attr: any) => attr.trait_type === 'Power Level');
      
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

  /**
   * Mapea el tipo de efecto desde el atributo
   */
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

  /**
   * Obtiene el valor del efecto basado en el nivel de poder y rareza
   */
  private getEffectValueFromPowerLevel(powerLevel: string, rarity: string): number {
    if (!powerLevel) return 10; // Valor por defecto
    
    // Extraer valor numérico del power level
    const match = powerLevel.match(/(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    
    // Valores por defecto basados en rareza
    const defaultValues: Record<string, number> = {
      'common': 10,
      'rare': 15,
      'epic': 20,
      'legendary': 30
    };
    
    return defaultValues[rarity] || 10;
  }

  /**
   * Obtiene la unidad del efecto basado en el tipo
   */
  private getUnitFromEffectType(effectType: GameEffectType): string {
    const units: Record<GameEffectType, string> = {
      'multiple_projectiles': 'count',
      'health_boost': 'percentage',
      'weapon_damage_boost': 'percentage',
      'movement_speed': 'percentage',
      'mining_efficiency': 'percentage',
      'fire_rate': 'percentage',
      'critical_chance': 'percentage',
      'shield_strength': 'points',
      'bullet_speed': 'percentage',
      'bullet_lifetime': 'percentage',
      'magnetic_range': 'percentage',
      'experience_boost': 'percentage'
    };
    
    return units[effectType] || 'percentage';
  }

  /**
   * Auto-equipa NFTs que no están en venta y tienen efectos de juego
   */
  private autoEquipNFTs(): void {
    const availableNFTs = this.userNFTs.filter(nft => 
      nft.is_listed_for_sale === 'False' && 
      this.hasGameEffect(nft)
    );
    
    console.log('🎮 Available NFTs for auto-equip:', availableNFTs.length);

    availableNFTs.forEach(nft => {
      const success = this.equipNFT(nft);
      if (success) {
        console.log('🎮 Auto-equipped NFT:', nft.metadata.name);
      }
    });
  }

  /**
   * Verifica si un NFT tiene efectos de juego
   */
  private hasGameEffect(nft: UserNFT): boolean {
    const hasEffect = !!(nft.metadata as any).game_effect?.type;
    if (!hasEffect) {
      console.log('🎮 NFT without game effect:', nft.metadata.name, nft.metadata);
    }
    return hasEffect;
  }

  /**
   * Equipa un NFT para aplicar sus efectos
   */
  equipNFT(nft: UserNFT): boolean {
    try {
      const effects = this.extractGameEffects(nft);
      if (effects.length === 0) {
        console.warn(`⚠️ NFT ${nft.metadata.name} has no game effects`);
        return false;
      }

      const equippedNFT: EquippedNFT = {
        nft,
        effects,
        equippedAt: Date.now()
      };

      this.equippedNFTs.set(nft.documentId, equippedNFT);
      return true;
    } catch (error) {
      console.error(`❌ Error equipping NFT ${nft.metadata.name}:`, error);
      return false;
    }
  }

  /**
   * Desequipa un NFT
   */
  unequipNFT(nftDocumentId: string): boolean {
    const removed = this.equippedNFTs.delete(nftDocumentId);
    return removed;
  }

  /**
   * Extrae los efectos de juego de un NFT
   */
  private extractGameEffects(nft: UserNFT): GameEffect[] {
    const effects: GameEffect[] = [];
    const metadata = nft.metadata as any;

    // Verificar si tiene game_effect en metadata
    if (metadata.game_effect) {
      const gameEffect = metadata.game_effect;
      const effectType = gameEffect.type as GameEffectType;
      
      // Calcular valor basado en rareza
      const calculatedValue = this.calculateEffectValue(
        effectType,
        gameEffect.value,
        nft.metadata.rarity
      );

      const effect: GameEffect = {
        type: effectType,
        value: calculatedValue,
        unit: gameEffect.unit || 'percentage',
        category: this.getEffectCategory(effectType),
        stackable: EFFECT_CONFIG[effectType]?.stackable ?? true,
        maxStacks: this.getMaxStacks(effectType),
        duration: gameEffect.duration || 0, // 0 = permanente
        cooldown: gameEffect.cooldown || 0
      };

      effects.push(effect);
    }

    // También verificar atributos por si hay efectos adicionales
    if (metadata.attributes) {
      metadata.attributes.forEach((attr: any) => {
        const additionalEffect = this.parseAttributeEffect(attr, nft.metadata.rarity);
        if (additionalEffect) {
          effects.push(additionalEffect);
        }
      });
    }

    return effects;
  }

  /**
   * Calcula el valor del efecto basado en la rareza
   */
  private calculateEffectValue(
    effectType: GameEffectType, 
    baseValue: number, 
    rarity: NFTRarity
  ): number {
    const config = EFFECT_CONFIG[effectType];
    if (!config) return baseValue;

    const rarityMultiplier = RARITY_MULTIPLIERS[rarity] || 1.0;
    const scaledValue = baseValue * rarityMultiplier * config.scalingFactor;
    
    return Math.min(scaledValue, config.maxValue);
  }

  /**
   * Obtiene la categoría del efecto
   */
  private getEffectCategory(effectType: GameEffectType): import('@/types/gameEffects').EffectCategory {
    const config = EFFECT_CONFIG[effectType];
    return config?.category || 'utility';
  }

  /**
   * Obtiene el máximo de stacks para un efecto
   */
  private getMaxStacks(effectType: GameEffectType): number {
    switch (effectType) {
      case 'multiple_projectiles':
        return 1; // Solo uno activo
      case 'health_boost':
      case 'weapon_damage_boost':
        return 5; // Máximo 5 stacks
      default:
        return 3; // Por defecto 3 stacks
    }
  }

  /**
   * Parsea efectos adicionales de los atributos
   */
  private parseAttributeEffect(attribute: any, rarity: NFTRarity): GameEffect | null {
    // Lógica para parsear efectos de atributos específicos
    // Por ejemplo, si un atributo dice "Critical Chance: 5%"
    const traitType = attribute.trait_type?.toLowerCase();
    const value = attribute.value;

    if (traitType?.includes('critical') && typeof value === 'string' && value.includes('%')) {
      const numValue = parseFloat(value.replace('%', ''));
      return {
        type: 'critical_chance',
        value: this.calculateEffectValue('critical_chance' as GameEffectType, numValue, rarity),
        unit: 'percentage',
        category: 'offensive',
        stackable: true,
        maxStacks: 3
      };
    }

    return null;
  }

  /**
   * Obtiene todos los efectos activos de los NFTs equipados
   */
  getActiveEffects(): GameEffect[] {
    const allEffects: GameEffect[] = [];
    
    this.equippedNFTs.forEach(equippedNFT => {
      allEffects.push(...equippedNFT.effects);
    });

    return allEffects;
  }

  /**
   * Obtiene efectos agrupados por tipo
   */
  getEffectsByType(): Map<GameEffectType, GameEffect[]> {
    const effectsByType = new Map<GameEffectType, GameEffect[]>();
    
    this.getActiveEffects().forEach(effect => {
      if (!effectsByType.has(effect.type)) {
        effectsByType.set(effect.type, []);
      }
      effectsByType.get(effect.type)!.push(effect);
    });

    return effectsByType;
  }

  /**
   * Calcula el valor total de un tipo de efecto
   */
  getTotalEffectValue(effectType: GameEffectType): number {
    const effects = this.getEffectsByType().get(effectType) || [];
    
    if (effects.length === 0) return 0;

    // Si no es stackable, tomar el mayor valor
    if (!effects[0].stackable) {
      return Math.max(...effects.map(e => e.value));
    }

    // Si es stackable, sumar valores respetando maxStacks
    const maxStacks = effects[0].maxStacks || 999;
    const totalStacks = Math.min(effects.length, maxStacks);
    
    return effects
      .slice(0, totalStacks)
      .reduce((total, effect) => total + effect.value, 0);
  }

  /**
   * Obtiene información de NFTs equipados
   */
  getEquippedNFTs(): EquippedNFT[] {
    return Array.from(this.equippedNFTs.values());
  }

  /**
   * Obtiene estadísticas de efectos para mostrar en UI
   */
  getEffectStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    Object.values(EFFECT_CONFIG).forEach(config => {
      const effectType = Object.keys(EFFECT_CONFIG).find(
        key => EFFECT_CONFIG[key] === config
      ) as GameEffectType;
      
      if (effectType) {
        stats[effectType] = this.getTotalEffectValue(effectType);
      }
    });

    return stats;
  }

  /**
   * Limpia todos los NFTs equipados
   */
  clearEquippedNFTs(): void {
    this.equippedNFTs.clear();
  }

  /**
   * Recarga los NFTs del usuario
   */
  async reloadUserNFTs(userId: string | number): Promise<void> {
    this.clearEquippedNFTs();
    await this.loadUserNFTs(userId);
  }
}