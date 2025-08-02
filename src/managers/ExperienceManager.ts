import { Scene } from 'phaser';
import { ExperienceConfig } from '../types/game';

/**
 * Clase que maneja toda la lógica relacionada con la experiencia y diamantes
 * 
 * Responsabilidades:
 * - Crear y gestionar diamantes de experiencia
 * - Manejar la recolección de experiencia
 * - Controlar el sistema de niveles
 * - Aplicar efectos de atracción magnética
 * - Gestionar la progresión del jugador
 * 
 * @example
 * ```typescript
 * const expManager = new ExperienceManager(scene);
 * expManager.createDiamond(x, y);
 * const leveledUp = expManager.collectDiamond(diamond);
 * ```
 */
export class ExperienceManager {
  private diamonds: Phaser.GameObjects.Polygon[] = [];
  private scene: Scene;
  private config: ExperienceConfig;
  private experience: number = 0;
  private maxExperience: number = 100;
  private level: number = 1;
  private magneticRange: number = 60;

  /**
   * Constructor de la clase ExperienceManager
   * @param scene - Escena de Phaser donde se crearán los diamantes
   * @param config - Configuración opcional de la experiencia
   */
  constructor(scene: Scene, config?: Partial<ExperienceConfig>) {
    this.scene = scene;
    
    // Configuración por defecto
    this.config = {
      size: 12,
      color: 0x00ffff,
      strokeColor: 0xffffff,
      magneticRange: 60,
      lifetime: 30000,
      rotationSpeed: 2000,
      ...config
    };

    this.magneticRange = this.config.magneticRange;
  }

  /**
   * Crea un diamante de experiencia en una posición específica
   * @param x - Posición X del diamante
   * @param y - Posición Y del diamante
   * @returns El sprite del diamante creado
   */
  createDiamond(x: number, y: number): Phaser.GameObjects.Polygon {
    const diamond = this.scene.add.polygon(x, y, [
      0, -this.config.size / 2,   // Top
      this.config.size / 2, 0,    // Right
      0, this.config.size / 2,    // Bottom
      -this.config.size / 2, 0    // Left
    ], this.config.color);

    diamond.setStrokeStyle(2, this.config.strokeColor);
    diamond.setDepth(6); // Diamantes por encima de enemigos pero debajo de balas
    this.scene.physics.add.existing(diamond);
    this.diamonds.push(diamond);

    // Efectos visuales del diamante
    this.createDiamondEffects(diamond);

    // Auto-destruir después del tiempo de vida
    this.scene.time.delayedCall(this.config.lifetime, () => {
      if (diamond.active) {
        this.removeDiamond(diamond);
      }
    });

    return diamond;
  }

  /**
   * Crea efectos visuales para el diamante
   * @param diamond - Sprite del diamante
   */
  private createDiamondEffects(diamond: Phaser.GameObjects.Polygon): void {
    // Efecto de spawn
    diamond.setScale(0);
    this.scene.tweens.add({
      targets: diamond,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    // Efecto de rotación constante
    this.scene.tweens.add({
      targets: diamond,
      rotation: Math.PI * 2,
      duration: this.config.rotationSpeed,
      repeat: -1,
      ease: 'Linear'
    });

    // Efecto de pulsación
    this.scene.tweens.add({
      targets: diamond,
      alpha: 0.7,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Actualiza el movimiento de todos los diamantes (atracción magnética)
   * @param playerX - Posición X del jugador
   * @param playerY - Posición Y del jugador
   */
  updateDiamonds(playerX: number, playerY: number): void {
    this.diamonds.forEach((diamond, index) => {
      if (!diamond.active) {
        this.diamonds.splice(index, 1);
        return;
      }

      // Atracción magnética hacia el jugador cuando está cerca
      const distance = Phaser.Math.Distance.Between(
        diamond.x, diamond.y,
        playerX, playerY
      );

      if (distance < this.magneticRange) {
        const angle = Phaser.Math.Angle.Between(
          diamond.x, diamond.y,
          playerX, playerY
        );
        const speed = 200;
        const body = diamond.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed
        );
      }
    });
  }

  /**
   * Recolecta un diamante de experiencia
   * @param diamond - Sprite del diamante
   * @returns true si el jugador subió de nivel
   */
  collectDiamond(diamond: Phaser.GameObjects.Polygon): boolean {
    // Eliminar el diamante
    this.removeDiamond(diamond);
    
    // Aumentar experiencia
    this.experience += 10;
    
    // Verificar si subió de nivel
    if (this.experience >= this.maxExperience) {
      this.levelUp();
      return true;
    }
    
    return false;
  }

  /**
   * Verifica si el jugador debe subir de nivel
   * @returns true si subió de nivel, false en caso contrario
   */
  private checkLevelUp(): boolean {
    if (this.experience >= this.maxExperience) {
      this.levelUp();
      return true;
    }
    return false;
  }

  /**
   * Sube de nivel al jugador
   */
  private levelUp(): void {
    this.level++;
    this.experience = 0;
    this.maxExperience = Math.floor(100 * Math.pow(1.5, this.level - 1));
    
    // Ya no emitimos evento aquí - MainScene manejará la subida de nivel
    // cuando collectDiamond retorne true
  }

  /**
   * Obtiene todos los diamantes activos
   * @returns Array de sprites de diamantes
   */
  getDiamonds(): Phaser.GameObjects.Polygon[] {
    return this.diamonds.filter(diamond => diamond.active);
  }

  /**
   * Elimina un diamante específico
   * @param diamond - Sprite del diamante a eliminar
   */
  removeDiamond(diamond: Phaser.GameObjects.Polygon): void {
    const index = this.diamonds.indexOf(diamond);
    if (index > -1) {
      this.diamonds.splice(index, 1);
    }
    diamond.destroy();
  }

  /**
   * Elimina todos los diamantes
   */
  clearAllDiamonds(): void {
    this.diamonds.forEach(diamond => {
      if (diamond.active) {
        diamond.destroy();
      }
    });
    this.diamonds = [];
  }

  /**
   * Obtiene la cantidad de diamantes activos
   * @returns Número de diamantes activos
   */
  getDiamondCount(): number {
    return this.getDiamonds().length;
  }

  /**
   * Obtiene la experiencia actual
   * @returns Experiencia actual
   */
  getExperience(): number {
    return this.experience;
  }

  /**
   * Obtiene la experiencia máxima para el nivel actual
   * @returns Experiencia máxima
   */
  getMaxExperience(): number {
    return this.maxExperience;
  }

  /**
   * Obtiene el nivel actual
   * @returns Nivel actual
   */
  getLevel(): number {
    return this.level;
  }

  /**
   * Obtiene el porcentaje de experiencia actual
   * @returns Porcentaje de experiencia (0 - 100)
   */
  getExperiencePercentage(): number {
    return (this.experience / this.maxExperience) * 100;
  }

  /**
   * Establece el rango de atracción magnética
   * @param range - Nuevo rango en píxeles
   */
  setMagneticRange(range: number): void {
    this.magneticRange = range;
  }

  /**
   * Obtiene el rango de atracción magnética actual
   * @returns Rango actual en píxeles
   */
  getMagneticRange(): number {
    return this.magneticRange;
  }

  /**
   * Agrega experiencia directamente
   * @param amount - Cantidad de experiencia a agregar
   * @returns true si el jugador subió de nivel, false en caso contrario
   */
  addExperience(amount: number): boolean {
    this.experience += amount;
    return this.checkLevelUp();
  }

  /**
   * Establece la experiencia actual
   * @param experience - Nueva cantidad de experiencia
   */
  setExperience(experience: number): void {
    this.experience = Math.max(0, Math.min(experience, this.maxExperience));
  }

  /**
   * Establece el nivel actual
   * @param level - Nuevo nivel
   */
  setLevel(level: number): void {
    this.level = Math.max(1, level);
    this.maxExperience = Math.floor(100 * Math.pow(1.5, this.level - 1));
    this.experience = Math.min(this.experience, this.maxExperience);
  }

  /**
   * Actualiza la configuración de la experiencia
   * @param newConfig - Nueva configuración
   */
  updateConfig(newConfig: Partial<ExperienceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.magneticRange) {
      this.magneticRange = newConfig.magneticRange;
    }
  }

  /**
   * Obtiene la configuración actual de la experiencia
   * @returns Configuración actual
   */
  getConfig(): ExperienceConfig {
    return { ...this.config };
  }

  /**
   * Obtiene información completa del progreso
   * @returns Objeto con información del progreso
   */
  getProgressInfo(): {
    level: number;
    experience: number;
    maxExperience: number;
    percentage: number;
    nextLevelAt: number;
  } {
    return {
      level: this.level,
      experience: this.experience,
      maxExperience: this.maxExperience,
      percentage: this.getExperiencePercentage(),
      nextLevelAt: this.maxExperience
    };
  }

  /**
   * Verifica si hay diamantes fuera de los límites de la pantalla
   * @param margin - Margen adicional para considerar "fuera de pantalla"
   */
  cleanupOffscreenDiamonds(margin: number = 100): void {
    const gameWidth = this.scene.scale.width || 800;
    const gameHeight = this.scene.scale.height || 600;

    this.diamonds.forEach((diamond, index) => {
      if (!diamond.active) {
        this.diamonds.splice(index, 1);
        return;
      }

      if (diamond.x < -margin || diamond.x > gameWidth + margin ||
          diamond.y < -margin || diamond.y > gameHeight + margin) {
        this.removeDiamond(diamond);
      }
    });
  }

  /**
   * Destruye todos los diamantes y limpia la memoria
   */
  destroy(): void {
    this.clearAllDiamonds();
  }

  /**
   * Obtiene la experiencia actual del jugador
   * @returns Cantidad de experiencia actual
   */
  getXP(): number {
    return this.experience;
  }

  /**
   * Obtiene la experiencia máxima necesaria para el nivel actual
   * @returns Cantidad de experiencia máxima
   */
  getMaxXP(): number {
    return this.maxExperience;
  }
} 