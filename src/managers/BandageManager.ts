import { Scene } from 'phaser';
import { Player } from './Player';

export interface BandageConfig {
  healAmount: number;
  healDuration: number; // Duración total de la curación gradual
  healInterval: number; // Intervalo entre cada tick de curación
  medicineCost: number; // Cantidad de medicina que cuesta cada vendaje
  cooldown: number; // Tiempo de cooldown entre usos
  visualEffects: {
    healColor: number;
    particleCount: number;
    duration: number;
  };
}

export class BandageManager {
  private scene: Scene;
  private player: Player;
  private config: BandageConfig;
  private isHealing: boolean = false;
  private lastUseTime: number = 0;
  private medicineInventory: number = 0;
  private healTimer: Phaser.Time.TimerEvent | null = null;
  private healProgress: number = 0;
  private totalHealAmount: number = 0;

  constructor(scene: Scene, player: Player, config?: Partial<BandageConfig>) {
    this.scene = scene;
    this.player = player;

    // Configuración por defecto
    this.config = {
      healAmount: 30, // Cura 30 puntos de vida
      healDuration: 3000, // 3 segundos de curación gradual
      healInterval: 100, // Cada 100ms cura un poco
      medicineCost: 1, // Cuesta 1 medicina
      cooldown: 5000, // 5 segundos de cooldown
      visualEffects: {
        healColor: 0x00ff00,
        particleCount: 12,
        duration: 1500
      },
      ...config
    };
  }

  /**
   * Inicializa el inventario de medicina desde los datos de la sesión
   * @param medicineAmount - Cantidad de medicina disponible
   */
  initializeMedicineInventory(medicineAmount: number): void {
    this.medicineInventory = medicineAmount;
    console.log(`🩹 Inventario de medicina inicializado: ${medicineAmount}`);
  }

  /**
   * Intenta usar un vendaje para curar al jugador
   * @returns true si se pudo usar, false si no
   */
  useBandage(): boolean {
    const currentTime = Date.now();

    // Verificar cooldown
    if (currentTime - this.lastUseTime < this.config.cooldown) {
      console.log('🩹 Vendaje en cooldown');
      return false;
    }

    // Verificar si ya está curando
    if (this.isHealing) {
      console.log('🩹 Ya está curando');
      return false;
    }

    // Verificar si tiene medicina suficiente
    if (this.medicineInventory < this.config.medicineCost) {
      console.log('🩹 No hay suficiente medicina');
      return false;
    }

    // Verificar si necesita curación
    if (this.player.getHealth() >= this.player.getMaxHealth()) {
      console.log('🩹 Salud completa, no necesita vendaje');
      return false;
    }

    // Iniciar curación gradual
    this.startGradualHealing();
    return true;
  }

  /**
   * Inicia la curación gradual
   */
  private startGradualHealing(): void {
    this.isHealing = true;
    this.lastUseTime = Date.now();
    this.healProgress = 0;

    // Consumir medicina inmediatamente
    this.medicineInventory -= this.config.medicineCost;

    // Calcular cuánto se puede curar
    const currentHealth = this.player.getHealth();
    const maxHealth = this.player.getMaxHealth();
    this.totalHealAmount = Math.min(this.config.healAmount, maxHealth - currentHealth);

    console.log(`🩹 Iniciando curación gradual: +${this.totalHealAmount} HP en ${this.config.healDuration}ms`);

    // Emitir evento para la UI
    this.scene.events.emit('bandageStarted', {
      healAmount: this.totalHealAmount,
      duration: this.config.healDuration,
      medicineRemaining: this.medicineInventory
    });

    // Emitir evento para misiones diarias
    this.scene.events.emit('bandageUsed', {
      healAmount: this.totalHealAmount,
      medicineRemaining: this.medicineInventory
    });

    // Crear timer para curación gradual
    this.healTimer = this.scene.time.addEvent({
      delay: this.config.healInterval,
      callback: this.healTick,
      callbackScope: this,
      loop: true
    });
  }

  /**
   * Tick de curación gradual
   */
  private healTick(): void {
    if (!this.isHealing) return;

    // Calcular progreso
    this.healProgress += this.config.healInterval;
    const progressRatio = this.healProgress / this.config.healDuration;

    if (progressRatio >= 1) {
      // Curación completada
      this.completeHealing();
    } else {
      // Calcular cuánto curar en este tick
      const healThisTick = Math.floor((this.totalHealAmount * this.config.healInterval) / this.config.healDuration);
      if (healThisTick > 0) {
        this.player.heal(healThisTick);
        
        // Emitir evento de progreso
        this.scene.events.emit('bandageProgress', {
          progress: progressRatio,
          healedThisTick: healThisTick,
          totalHealed: Math.floor(this.totalHealAmount * progressRatio)
        });
      }
    }
  }

  /**
   * Completa la curación
   */
  private completeHealing(): void {
    if (this.healTimer) {
      this.healTimer.destroy();
      this.healTimer = null;
    }

    this.isHealing = false;
    this.healProgress = 0;

    console.log(`🩹 Curación completada! Total curado: ${this.totalHealAmount} HP. Medicina restante: ${this.medicineInventory}`);

    // Emitir evento de finalización
    this.scene.events.emit('bandageCompleted', {
      totalHealed: this.totalHealAmount,
      medicineRemaining: this.medicineInventory
    });
  }

  /**
   * Obtiene la cantidad de medicina disponible
   */
  getMedicineInventory(): number {
    return this.medicineInventory;
  }

  /**
   * Agrega medicina al inventario (solo para testing)
   */
  addMedicine(amount: number): void {
    this.medicineInventory += amount;
    console.log(`🩹 Medicina agregada: +${amount}. Total: ${this.medicineInventory}`);
  }

  /**
   * Verifica si puede usar un vendaje
   */
  canUseBandage(): boolean {
    const currentTime = Date.now();
    const hasCooldown = currentTime - this.lastUseTime < this.config.cooldown;
    const hasMedicine = this.medicineInventory >= this.config.medicineCost;
    const needsHealing = this.player.getHealth() < this.player.getMaxHealth();
    const notHealing = !this.isHealing;

    return !hasCooldown && hasMedicine && needsHealing && notHealing;
  }

  /**
   * Obtiene el tiempo restante del cooldown
   */
  getCooldownRemaining(): number {
    const currentTime = Date.now();
    const timeSinceLastUse = currentTime - this.lastUseTime;
    return Math.max(0, this.config.cooldown - timeSinceLastUse);
  }

  /**
   * Obtiene el progreso de la curación actual (0-1)
   */
  getHealProgress(): number {
    if (!this.isHealing) return 0;
    return this.healProgress / this.config.healDuration;
  }

  /**
   * Obtiene la configuración actual
   */
  getConfig(): BandageConfig {
    return { ...this.config };
  }

  /**
   * Actualiza la configuración
   */
  updateConfig(newConfig: Partial<BandageConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Obtiene estadísticas del sistema de vendajes
   */
  getStats(): {
    medicineInventory: number;
    canUse: boolean;
    cooldownRemaining: number;
    healProgress: number;
    isHealing: boolean;
    totalHealAmount: number;
  } {
    return {
      medicineInventory: this.medicineInventory,
      canUse: this.canUseBandage(),
      cooldownRemaining: this.getCooldownRemaining(),
      healProgress: this.getHealProgress(),
      isHealing: this.isHealing,
      totalHealAmount: this.totalHealAmount
    };
  }

  /**
   * Detiene la curación actual (útil para game over, etc.)
   */
  stopHealing(): void {
    if (this.isHealing) {
      this.completeHealing();
    }
  }

  /**
   * Destruye el manager y limpia recursos
   */
  destroy(): void {
    this.stopHealing();
    this.isHealing = false;
  }
} 