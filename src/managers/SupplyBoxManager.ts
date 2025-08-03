import { Scene } from 'phaser';
import { Position } from '../types/game';

export interface SupplyBoxConfig {
  spawnChance: number; // Probabilidad de que aparezca una caja (0-1)
  materials: {
    steel: { min: number; max: number; chance: number };
    energy_cells: { min: number; max: number; chance: number };
    medicine: { min: number; max: number; chance: number };
    // food: { min: number; max: number; chance: number }; // No incluido por ahora
  };
  visualEffects: {
    glowColor: number;
    pulseDuration: number;
    rotationSpeed: number;
  };
}

export interface SupplyBoxData {
  id: string;
  x: number;
  y: number;
  materials: {
    steel?: number;
    energy_cells?: number;
    medicine?: number;
  };
  isCollected: boolean;
}

export class SupplyBoxManager {
  private scene: Scene;
  private supplyBoxes: Phaser.GameObjects.Rectangle[] = [];
  private config: SupplyBoxConfig;
  private collectedMaterials: Map<string, number> = new Map();

  constructor(scene: Scene, config?: Partial<SupplyBoxConfig>) {
    this.scene = scene;

    // Configuración por defecto
    this.config = {
      spawnChance: 0.15, // 15% de probabilidad de spawn (alto para testing)
      materials: {
        steel: { min: 1, max: 3, chance: 0.4 },
        energy_cells: { min: 1, max: 2, chance: 0.3 },
        medicine: { min: 1, max: 1, chance: 0.2 },
      },
      visualEffects: {
        glowColor: 0x00ff00,
        pulseDuration: 1000,
        rotationSpeed: 0.02
      },
      ...config
    };

    // Cargar materiales guardados en localStorage
    this.loadCollectedMaterials();
  }

  /**
   * Intenta crear una caja de suministros en la posición donde murió el enemigo
   * @param x - Posición X donde murió el enemigo
   * @param y - Posición Y donde murió el enemigo
   * @param enemyType - Tipo de enemigo que murió
   * @returns true si se creó una caja, false si no
   */
  tryCreateSupplyBox(x: number, y: number, enemyType: string): boolean {
    // Verificar probabilidad de spawn
    if (Math.random() > this.config.spawnChance) {
      return false;
    }

    // Generar materiales aleatorios
    const materials = this.generateRandomMaterials();

    // Si no hay materiales, no crear caja
    if (Object.keys(materials).length === 0) {
      return false;
    }

    // Crear la caja visual
    const supplyBox = this.createSupplyBoxVisual(x, y, materials);

    // Guardar datos de la caja
    const boxData: SupplyBoxData = {
      id: `supply_${Date.now()}_${Math.random()}`,
      x,
      y,
      materials,
      isCollected: false
    };

    supplyBox.setData('boxData', boxData);

    // Agregar a la lista
    this.supplyBoxes.push(supplyBox);

    console.log(`📦 Caja de suministros creada en (${x}, ${y}) con materiales:`, materials);

    // NO emitir evento aquí - se emitirá cuando se recolecte
    // this.scene.events.emit('supplyBoxCreated', boxData);

    return true;
  }

  /**
   * Genera materiales aleatorios basados en las probabilidades configuradas
   * @returns Objeto con los materiales generados
   */
  private generateRandomMaterials(): { [key: string]: number } {
    const materials: { [key: string]: number } = {};

    Object.entries(this.config.materials).forEach(([materialType, config]) => {
      if (Math.random() < config.chance) {
        const amount = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
        materials[materialType] = amount;
      }
    });

    return materials;
  }

  /**
   * Crea la representación visual de la caja de suministros
   * @param x - Posición X
   * @param y - Posición Y
   * @param materials - Materiales contenidos
   * @returns El sprite de la caja
   */
  private createSupplyBoxVisual(x: number, y: number, materials: { [key: string]: number }): Phaser.GameObjects.Rectangle {
    // Crear caja principal (placeholder - rectángulo verde brillante)
    const supplyBox = this.scene.add.rectangle(x, y, 32, 32, 0x00ff00);
    supplyBox.setStrokeStyle(3, 0x00cc00);
    supplyBox.setDepth(10); // Por encima de todo

    // Agregar física para colisiones
    this.scene.physics.add.existing(supplyBox);
    const body = supplyBox.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);

    // Efecto de brillo pulsante
    this.createPulseEffect(supplyBox);

    // Efecto de rotación lenta
    this.createRotationEffect(supplyBox);

    // Efecto de partículas doradas
    this.createParticleEffect(x, y);

    // Efecto de anillo expandiéndose
    this.createExpandingRingEffect(x, y);

    return supplyBox;
  }

  /**
   * Crea efecto de pulsación en la caja
   * @param supplyBox - Sprite de la caja
   */
  private createPulseEffect(supplyBox: Phaser.GameObjects.Rectangle): void {
    this.scene.tweens.add({
      targets: supplyBox,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: this.config.visualEffects.pulseDuration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Crea efecto de rotación lenta
   * @param supplyBox - Sprite de la caja
   */
  private createRotationEffect(supplyBox: Phaser.GameObjects.Rectangle): void {
    this.scene.tweens.add({
      targets: supplyBox,
      angle: 360,
      duration: 3000,
      repeat: -1,
      ease: 'Linear'
    });
  }

  /**
   * Crea efecto de partículas doradas
   * @param x - Posición X
   * @param y - Posición Y
   */
  private createParticleEffect(x: number, y: number): void {
    // Crear múltiples partículas doradas que se dispersan
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const particle = this.scene.add.circle(
        x + Math.cos(angle) * 5,
        y + Math.sin(angle) * 5,
        3,
        0xffd700
      );
      particle.setDepth(11);

      // Animación de dispersión
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 30,
        y: y + Math.sin(angle) * 30,
        alpha: 0,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  /**
   * Crea efecto de anillo expandiéndose
   * @param x - Posición X
   * @param y - Posición Y
   */
  private createExpandingRingEffect(x: number, y: number): void {
    const ring = this.scene.add.circle(x, y, 5, 0x00ff00);
    ring.setStrokeStyle(2, 0x00cc00);
    ring.setFillStyle(0x00ff00, 0.3);
    ring.setDepth(9);

    this.scene.tweens.add({
      targets: ring,
      radius: 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        ring.destroy();
      }
    });
  }

  /**
   * Recolecta una caja de suministros
   * @param supplyBox - Sprite de la caja
   * @returns Datos de la caja recolectada o null si ya fue recolectada
   */
  collectSupplyBox(supplyBox: Phaser.GameObjects.Rectangle): SupplyBoxData | null {
    const boxData = supplyBox.getData('boxData') as SupplyBoxData;
    
    if (!boxData || boxData.isCollected) {
      return null;
    }

    // Marcar como recolectada
    boxData.isCollected = true;

    // Agregar materiales al inventario local
    this.addMaterialsToInventory(boxData.materials);

    // Efecto de recolección
    this.createCollectionEffect(supplyBox.x, supplyBox.y);

    // Remover de la lista y destruir
    const index = this.supplyBoxes.indexOf(supplyBox);
    if (index > -1) {
      this.supplyBoxes.splice(index, 1);
    }
    supplyBox.destroy();

    console.log(`📦 Caja recolectada! Materiales obtenidos:`, boxData.materials);

    return boxData;
  }

  /**
   * Crea efecto visual de recolección
   * @param x - Posición X
   * @param y - Posición Y
   */
  private createCollectionEffect(x: number, y: number): void {
    // Efecto de flash blanco
    const flash = this.scene.add.circle(x, y, 40, 0xffffff);
    flash.setDepth(12);

    this.scene.tweens.add({
      targets: flash,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        flash.destroy();
      }
    });

    // Efecto de partículas hacia arriba
    for (let i = 0; i < 6; i++) {
      const particle = this.scene.add.circle(
        x + (Math.random() - 0.5) * 20,
        y + (Math.random() - 0.5) * 20,
        4,
        0x00ff00
      );
      particle.setDepth(12);

      this.scene.tweens.add({
        targets: particle,
        y: y - 60,
        alpha: 0,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 800,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  /**
   * Agrega materiales al inventario local
   * @param materials - Materiales a agregar
   */
  private addMaterialsToInventory(materials: { [key: string]: number }): void {
    Object.entries(materials).forEach(([materialType, amount]) => {
      const currentAmount = this.collectedMaterials.get(materialType) || 0;
      this.collectedMaterials.set(materialType, currentAmount + amount);
    });

    // Guardar en localStorage
    this.saveCollectedMaterials();
  }

  /**
   * Guarda los materiales recolectados en localStorage
   */
  private saveCollectedMaterials(): void {
    try {
      const materialsData = Object.fromEntries(this.collectedMaterials);
      localStorage.setItem('collectedMaterials', JSON.stringify(materialsData));
      console.log('💾 Materiales guardados en localStorage:', materialsData);
    } catch (error) {
      console.error('❌ Error guardando materiales en localStorage:', error);
    }
  }

  /**
   * Carga los materiales recolectados desde localStorage
   */
  private loadCollectedMaterials(): void {
    try {
      const materialsData = localStorage.getItem('collectedMaterials');
      if (materialsData) {
        const materials = JSON.parse(materialsData);
        Object.entries(materials).forEach(([materialType, amount]) => {
          this.collectedMaterials.set(materialType, amount as number);
        });
        console.log('📦 Materiales cargados desde localStorage:', materials);
      }
    } catch (error) {
      console.error('❌ Error cargando materiales desde localStorage:', error);
    }
  }

  /**
   * Obtiene todas las cajas de suministros activas
   * @returns Array de sprites de cajas
   */
  getSupplyBoxes(): Phaser.GameObjects.Rectangle[] {
    return this.supplyBoxes.filter(box => box.active);
  }

  /**
   * Obtiene la cantidad de cajas activas
   * @returns Número de cajas activas
   */
  getSupplyBoxCount(): number {
    return this.getSupplyBoxes().length;
  }

  /**
   * Obtiene los materiales recolectados
   * @returns Mapa de materiales recolectados
   */
  getCollectedMaterials(): Map<string, number> {
    return new Map(this.collectedMaterials);
  }

  /**
   * Obtiene estadísticas de las cajas de suministros
   * @returns Estadísticas
   */
  getStats(): {
    totalBoxesCreated: number;
    activeBoxes: number;
    totalMaterialsCollected: { [key: string]: number };
    spawnChance: number;
  } {
    const totalMaterials: { [key: string]: number } = {};
    this.collectedMaterials.forEach((amount, materialType) => {
      totalMaterials[materialType] = amount;
    });

    return {
      totalBoxesCreated: this.collectedMaterials.size > 0 ? 
        Object.values(totalMaterials).reduce((sum, amount) => sum + amount, 0) : 0,
      activeBoxes: this.getSupplyBoxCount(),
      totalMaterialsCollected: totalMaterials,
      spawnChance: this.config.spawnChance
    };
  }

  /**
   * Actualiza la configuración
   * @param newConfig - Nueva configuración
   */
  updateConfig(newConfig: Partial<SupplyBoxConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Obtiene la configuración actual
   * @returns Configuración actual
   */
  getConfig(): SupplyBoxConfig {
    return { ...this.config };
  }

  /**
   * Limpia las cajas fuera de pantalla
   * @param playerX - Posición X del jugador
   * @param playerY - Posición Y del jugador
   * @param maxDistance - Distancia máxima para considerar fuera de pantalla
   */
  cleanupOffscreenBoxes(playerX: number, playerY: number, maxDistance: number = 800): void {
    this.supplyBoxes = this.supplyBoxes.filter(box => {
      if (!box.active) return false;

      const distance = Phaser.Math.Distance.Between(
        playerX, playerY,
        box.x, box.y
      );

      if (distance > maxDistance) {
        box.destroy();
        return false;
      }

      return true;
    });
  }

  /**
   * Destruye todas las cajas y limpia la memoria
   */
  destroy(): void {
    this.supplyBoxes.forEach(box => {
      if (box.active) {
        box.destroy();
      }
    });
    this.supplyBoxes = [];
  }
} 