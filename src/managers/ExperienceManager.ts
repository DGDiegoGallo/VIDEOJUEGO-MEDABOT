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
   * @param enemyType - Tipo de enemigo que murió (opcional)
   * @returns El sprite del diamante creado
   */
  createDiamond(x: number, y: number, enemyType?: string): Phaser.GameObjects.Polygon {
    // Determinar valor de experiencia y color basado en el tipo de enemigo
    const diamondInfo = this.getDiamondInfoByEnemyType(enemyType);
    
    const diamond = this.scene.add.polygon(x, y, [
      0, -diamondInfo.size / 2,   // Top
      diamondInfo.size / 2, 0,    // Right
      0, diamondInfo.size / 2,    // Bottom
      -diamondInfo.size / 2, 0    // Left
    ], diamondInfo.color);

    diamond.setStrokeStyle(2, diamondInfo.strokeColor);
    diamond.setDepth(6); // Diamantes por encima de enemigos pero debajo de balas
    this.scene.physics.add.existing(diamond);
    
    // Guardar el valor de experiencia en el diamante
    diamond.setData('experienceValue', diamondInfo.experienceValue);
    diamond.setData('enemyType', enemyType || 'zombie');
    
    this.diamonds.push(diamond);

    // Efectos visuales del diamante
    this.createDiamondEffects(diamond, diamondInfo);

    // Auto-destruir después del tiempo de vida
    this.scene.time.delayedCall(this.config.lifetime, () => {
      if (diamond.active) {
        this.removeDiamond(diamond);
      }
    });

    return diamond;
  }

  /**
   * Obtiene la información del diamante basada en el tipo de enemigo
   * @param enemyType - Tipo de enemigo que murió
   * @returns Información del diamante (color, tamaño, experiencia)
   */
  private getDiamondInfoByEnemyType(enemyType?: string): {
    color: number;
    strokeColor: number;
    size: number;
    experienceValue: number;
  } {
    switch (enemyType) {
      case 'zombie':
      case 'fast_zombie':
        return {
          color: 0xff4444,      // Rojo (como el enemigo)
          strokeColor: 0xffffff, // Blanco
          size: 12,
          experienceValue: 10
        };
      
      case 'dasher':
        return {
          color: 0x8a2be2,      // Violeta (como el enemigo)
          strokeColor: 0x4b0082, // Violeta oscuro
          size: 16,
          experienceValue: 25
        };
      
      case 'tank':
        return {
          color: 0xffd700,      // Dorado (premium)
          strokeColor: 0xff8c00, // Naranja dorado
          size: 20,
          experienceValue: 60
        };
      
      default:
        return {
          color: 0xff4444,      // Rojo por defecto
          strokeColor: 0xffffff, // Blanco
          size: 12,
          experienceValue: 10
        };
    }
  }

  /**
   * Crea efectos visuales para el diamante
   * @param diamond - Sprite del diamante
   * @param diamondInfo - Información del diamante para efectos específicos
   */
  private createDiamondEffects(diamond: Phaser.GameObjects.Polygon, diamondInfo?: any): void {
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
    // Usar un bucle hacia atrás para evitar problemas al eliminar elementos
    for (let i = this.diamonds.length - 1; i >= 0; i--) {
      const diamond = this.diamonds[i];
      
      if (!diamond || !diamond.active) {
        this.diamonds.splice(i, 1);
        continue;
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
        
        if (body) {
          body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
          );
        }
      } else {
        // Detener el movimiento si está fuera del rango magnético
        const body = diamond.body as Phaser.Physics.Arcade.Body;
        if (body) {
          body.setVelocity(0, 0);
        }
      }
    }
  }

  /**
   * Recolecta un diamante de experiencia
   * @param diamond - Sprite del diamante
   * @returns true si el jugador subió de nivel
   */
  collectDiamond(diamond: Phaser.GameObjects.Polygon): boolean {
    // Obtener el valor de experiencia del diamante
    const experienceValue = diamond.getData('experienceValue') || 1;
    const enemyType = diamond.getData('enemyType') || 'zombie';
    
    // Eliminar el diamante
    this.removeDiamond(diamond);
    
    // Aumentar experiencia según el valor del diamante
    this.experience += experienceValue;
    
    console.log(`💎 Experiencia recolectada: +${experienceValue} (${enemyType}) - Total: ${this.experience}/${this.maxExperience}`);
    
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
   * Verifica si hay diamantes fuera de los límites de la cámara (ARREGLADO para mundo dinámico)
   * @param margin - Margen adicional para considerar "fuera de cámara"
   */
  cleanupOffscreenDiamonds(margin: number = 200): void {
    // ARREGLADO: Usar coordenadas de cámara en lugar de coordenadas de pantalla
    const camera = this.scene.cameras.main;
    const cameraX = camera.scrollX;
    const cameraY = camera.scrollY;
    const gameWidth = this.scene.scale.width || 800;
    const gameHeight = this.scene.scale.height || 600;
    
    // Límites basados en la posición de la cámara
    const leftBound = cameraX - margin;
    const rightBound = cameraX + gameWidth + margin;
    const topBound = cameraY - margin;
    const bottomBound = cameraY + gameHeight + margin;
    
    let removedCount = 0;

    // Usar bucle hacia atrás para evitar problemas al eliminar elementos
    for (let i = this.diamonds.length - 1; i >= 0; i--) {
      const diamond = this.diamonds[i];
      
      if (!diamond || !diamond.active) {
        this.diamonds.splice(i, 1);
        removedCount++;
        continue;
      }

      // Verificar si está fuera de los límites de la cámara (no de la pantalla absoluta)
      if (diamond.x < leftBound || diamond.x > rightBound ||
          diamond.y < topBound || diamond.y > bottomBound) {
        console.log(`💎 Diamante eliminado por estar fuera de cámara: (${Math.round(diamond.x)}, ${Math.round(diamond.y)}) vs cámara (${Math.round(cameraX)}, ${Math.round(cameraY)})`);
        this.removeDiamond(diamond);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`💎 Limpiados ${removedCount} diamantes fuera de cámara`);
    }
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

  /**
   * Obtiene información de estadísticas de diamantes
   * @returns Información de estadísticas
   */
  getStats(): {
    totalDiamonds: number;
    diamondsByType: { [key: string]: number };
    totalExperienceValue: number;
    averageExperienceValue: number;
  } {
    const diamondsByType: { [key: string]: number } = {};
    let totalExperienceValue = 0;

    this.diamonds.forEach(diamond => {
      if (diamond.active) {
        const enemyType = diamond.getData('enemyType') || 'zombie';
        const experienceValue = diamond.getData('experienceValue') || 1;
        
        diamondsByType[enemyType] = (diamondsByType[enemyType] || 0) + 1;
        totalExperienceValue += experienceValue;
      }
    });

    return {
      totalDiamonds: this.diamonds.length,
      diamondsByType,
      totalExperienceValue,
      averageExperienceValue: this.diamonds.length > 0 ? totalExperienceValue / this.diamonds.length : 0
    };
  }

  /**
   * Obtiene información de diamantes para el radar/minimap
   * @param playerX - Posición X del jugador
   * @param playerY - Posición Y del jugador
   * @returns Array con información de diamantes para el radar
   */
  getRadarInfo(playerX: number, playerY: number): Array<{
    id: string;
    x: number;
    y: number;
    type: string;
    experienceValue: number;
    distance: number;
  }> {
    return this.diamonds.map(diamond => {
      const distance = Phaser.Math.Distance.Between(
        diamond.x, diamond.y,
        playerX, playerY
      );
      
      return {
        id: diamond.name || `diamond_${diamond.x}_${diamond.y}`,
        x: diamond.x,
        y: diamond.y,
        type: diamond.getData('enemyType') || 'zombie',
        experienceValue: diamond.getData('experienceValue') || 1,
        distance
      };
    });
  }

  /**
   * Obtiene diamantes cercanos a una posición específica
   * @param playerX - Posición X del jugador
   * @param playerY - Posición Y del jugador
   * @param range - Rango de detección en píxeles
   * @returns Array de diamantes dentro del rango
   */
  getNearbyDiamonds(playerX: number, playerY: number, range: number): Phaser.GameObjects.Polygon[] {
    return this.diamonds.filter(diamond => {
      if (!diamond.active) return false;
      const distance = Phaser.Math.Distance.Between(playerX, playerY, diamond.x, diamond.y);
      return distance <= range;
    });
  }

  /**
   * Método de diagnóstico para verificar el estado de los diamantes
   */
  diagnoseDiamonds(playerX: number, playerY: number): void {
    const stats = this.getStats();
    const nearbyDiamonds = this.getNearbyDiamonds(playerX, playerY, this.magneticRange);
    
    console.log(`💎 DIAGNÓSTICO DIAMANTES:`);
    console.log(`  Total diamantes: ${stats.totalDiamonds}`);
    console.log(`  Por tipo:`, stats.diamondsByType);
    console.log(`  Valor total experiencia: ${stats.totalExperienceValue}`);
    console.log(`  Diamantes en rango magnético: ${nearbyDiamonds.length}`);
    console.log(`  Experiencia actual: ${this.experience}/${this.maxExperience} (Nivel ${this.level})`);
  }
} 