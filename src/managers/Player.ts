import { Scene } from 'phaser';
import { Position, PlayerConfig } from '../types/game';

/**
 * Clase que maneja toda la lógica relacionada con el jugador
 * 
 * Responsabilidades:
 * - Crear y gestionar el sprite del jugador
 * - Manejar la salud y daño
 * - Controlar el movimiento
 * - Aplicar efectos visuales de daño
 * 
 * @example
 * ```typescript
 * const player = new Player(scene, 400, 300);
 * player.takeDamage(20);
 * const position = player.getPosition();
 * ```
 */
export class Player {
  private sprite!: Phaser.GameObjects.Rectangle;
  private health: number;
  private maxHealth: number;
  private scene: Scene;
  private config: PlayerConfig;
  private shieldStrength: number = 0;
  private maxShieldStrength: number = 0;
  private worldManager?: any; // Referencia al WorldManager para wraparound

  /**
   * Constructor de la clase Player
   * @param scene - Escena de Phaser donde se creará el jugador
   * @param x - Posición X inicial del jugador
   * @param y - Posición Y inicial del jugador
   * @param config - Configuración opcional del jugador
   */
  constructor(
    scene: Scene, 
    x: number, 
    y: number, 
    config?: Partial<PlayerConfig>
  ) {
    this.scene = scene;
    
    // Configuración por defecto
    this.config = {
      size: 32,
      speed: 200,
      health: 100,
      maxHealth: 100,
      color: 0x00ff00,
      strokeColor: 0xffffff,
      ...config
    };

    this.health = this.config.health;
    this.maxHealth = this.config.maxHealth;
    
    this.createSprite(x, y);
  }

  /**
   * Establece la referencia al WorldManager para wraparound
   * @param worldManager - Instancia del WorldManager
   */
  setWorldManager(worldManager: any): void {
    this.worldManager = worldManager;
  }

  /**
   * Crea el sprite del jugador con física
   * @param x - Posición X
   * @param y - Posición Y
   */
  private createSprite(x: number, y: number): void {
    this.sprite = this.scene.add.rectangle(
      x, 
      y, 
      this.config.size, 
      this.config.size, 
      this.config.color
    );
    
    this.sprite.setStrokeStyle(2, this.config.strokeColor);
    this.sprite.setDepth(25); // Jugador por encima de balas y todo lo demás
    
    // Configurar física
    this.scene.physics.add.existing(this.sprite);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(false);
    body.setBounce(0);
    body.setDrag(0);
    // Nota: setCollideWorldBounds no está disponible en Rectangle, se maneja en la escena
  }

  /**
   * Obtiene el sprite del jugador
   * @returns El sprite de Phaser del jugador
   */
  getSprite(): Phaser.GameObjects.Rectangle {
    return this.sprite;
  }

  /**
   * Obtiene la salud actual del jugador
   * @returns Salud actual (0 - maxHealth)
   */
  getHealth(): number {
    return this.health;
  }

  /**
   * Obtiene la salud máxima del jugador
   * @returns Salud máxima
   */
  getMaxHealth(): number {
    return this.maxHealth;
  }

  /**
   * Obtiene el porcentaje de salud del jugador
   * @returns Porcentaje de salud (0 - 100)
   */
  getHealthPercentage(): number {
    return (this.health / this.maxHealth) * 100;
  }

  /**
   * Aplica daño al jugador
   * @param amount - Cantidad de daño a aplicar
   * @returns true si el jugador sobrevivió, false si murió
   */
  takeDamage(amount: number): boolean {
    // Primero absorber daño con el escudo
    if (this.shieldStrength > 0) {
      const absorbedDamage = Math.min(amount, this.shieldStrength);
      this.shieldStrength -= absorbedDamage;
      amount -= absorbedDamage;
      
      // Si el escudo se agotó, crear efecto visual
      if (this.shieldStrength <= 0) {
        this.createShieldBreakEffect();
      }
    }
    
    // Aplicar daño restante a la vida
    if (amount > 0) {
      this.health = Math.max(0, this.health - amount);
    }
    
    return this.health > 0;
  }

  /**
   * Crea un efecto visual cuando se rompe el escudo
   */
  private createShieldBreakEffect(): void {
    // Efecto de partículas de escudo roto
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const distance = 25;
      const particleX = this.sprite.x + Math.cos(angle) * distance;
      const particleY = this.sprite.y + Math.sin(angle) * distance;

      const particle = this.scene.add.circle(particleX, particleY, 3, 0x00ffff);

      this.scene.tweens.add({
        targets: particle,
        x: particleX + Math.cos(angle) * 40,
        y: particleY + Math.sin(angle) * 40,
        alpha: 0,
        scale: 0,
        duration: 600,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }

    // Efecto de sonido visual (flash azul)
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2,
      ease: 'Power2'
    });
  }

  /**
   * Establece la fuerza del escudo
   * @param strength - Fuerza del escudo
   */
  setShieldStrength(strength: number): void {
    this.maxShieldStrength = strength;
    this.shieldStrength = strength;
  }

  /**
   * Obtiene la fuerza actual del escudo
   * @returns Fuerza actual del escudo
   */
  getShieldStrength(): number {
    return this.shieldStrength;
  }

  /**
   * Obtiene la fuerza máxima del escudo
   * @returns Fuerza máxima del escudo
   */
  getMaxShieldStrength(): number {
    return this.maxShieldStrength;
  }

  /**
   * Obtiene el porcentaje de escudo restante
   * @returns Porcentaje de escudo (0 - 100)
   */
  getShieldPercentage(): number {
    if (this.maxShieldStrength === 0) return 0;
    return (this.shieldStrength / this.maxShieldStrength) * 100;
  }

  /**
   * Cura al jugador
   * @param amount - Cantidad de salud a restaurar
   */
  heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  /**
   * Restaura completamente la salud del jugador
   */
  healFull(): void {
    this.health = this.maxHealth;
  }

  /**
   * Verifica si el jugador está vivo
   * @returns true si el jugador tiene salud > 0
   */
  isAlive(): boolean {
    return this.health > 0;
  }

  /**
   * Obtiene la posición actual del jugador
   * @returns Objeto con coordenadas x, y
   */
  getPosition(): Position {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  /**
   * Maneja el input del teclado para mover al jugador
   * @param cursors - Teclas de dirección de Phaser
   */
  handleInput(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    let velocityX = 0;
    let velocityY = 0;

    // Movimiento horizontal
    if (cursors.left?.isDown) {
      velocityX = -this.config.speed;
    } else if (cursors.right?.isDown) {
      velocityX = this.config.speed;
    }

    // Movimiento vertical
    if (cursors.up?.isDown) {
      velocityY = -this.config.speed;
    } else if (cursors.down?.isDown) {
      velocityY = this.config.speed;
    }

    // Normalizar velocidad diagonal
    if (velocityX !== 0 && velocityY !== 0) {
      const normalizedSpeed = this.config.speed / Math.sqrt(2);
      velocityX = velocityX > 0 ? normalizedSpeed : -normalizedSpeed;
      velocityY = velocityY > 0 ? normalizedSpeed : -normalizedSpeed;
    }

    // Aplicar velocidad
    body.setVelocity(velocityX, velocityY);

    // Aplicar wraparound si tenemos WorldManager
    if (this.worldManager) {
      const newPosition = this.worldManager.applyWraparound(this.sprite.x, this.sprite.y);
      if (newPosition.x !== this.sprite.x || newPosition.y !== this.sprite.y) {
        this.sprite.setPosition(newPosition.x, newPosition.y);
      }
    }
  }

  /**
   * Mueve al jugador con velocidad específica
   * @param velocityX - Velocidad en el eje X
   * @param velocityY - Velocidad en el eje Y
   */
  move(velocityX: number, velocityY: number): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(velocityX, velocityY);
    
    // Aplicar wraparound si tenemos WorldManager
    if (this.worldManager) {
      const newPosition = this.worldManager.applyWraparound(this.sprite.x, this.sprite.y);
      if (newPosition.x !== this.sprite.x || newPosition.y !== this.sprite.y) {
        this.sprite.setPosition(newPosition.x, newPosition.y);
      }
    }
  }

  /**
   * Mueve al jugador hacia una posición específica
   * @param targetX - Posición X objetivo
   * @param targetY - Posición Y objetivo
   * @param speed - Velocidad de movimiento (opcional)
   */
  moveTowards(targetX: number, targetY: number, speed?: number): void {
    const currentSpeed = speed || this.config.speed;
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x, this.sprite.y,
      targetX, targetY
    );
    
    const velocityX = Math.cos(angle) * currentSpeed;
    const velocityY = Math.sin(angle) * currentSpeed;
    
    this.move(velocityX, velocityY);
  }

  /**
   * Detiene el movimiento del jugador
   */
  stop(): void {
    this.move(0, 0);
  }

  /**
   * Crea un efecto visual de daño (parpadeo y escala)
   */
  createDamageEffect(): void {
    // Efecto de parpadeo
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    // Efecto de escala
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
  }

  /**
   * Crea un efecto visual de curación
   */
  createHealEffect(): void {
    // Efecto de brillo verde
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 1.5,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });

    // Efecto de partículas de curación
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const distance = 20;
      const particleX = this.sprite.x + Math.cos(angle) * distance;
      const particleY = this.sprite.y + Math.sin(angle) * distance;

      const particle = this.scene.add.circle(particleX, particleY, 2, 0x00ff00);

      this.scene.tweens.add({
        targets: particle,
        y: particleY - 30,
        alpha: 0,
        scale: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  /**
   * Actualiza la configuración del jugador
   * @param newConfig - Nueva configuración
   */
  updateConfig(newConfig: Partial<PlayerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Actualizar sprite si cambió el tamaño
    if (newConfig.size) {
      this.sprite.setSize(this.config.size, this.config.size);
    }
    
    // Actualizar colores si cambiaron
    if (newConfig.color) {
      this.sprite.setFillStyle(this.config.color);
    }
    
    if (newConfig.strokeColor) {
      this.sprite.setStrokeStyle(2, this.config.strokeColor);
    }

    // Actualizar vida máxima si cambió
    if (newConfig.maxHealth) {
      const healthPercentage = this.getHealthPercentage();
      this.maxHealth = newConfig.maxHealth;
      this.health = Math.floor(this.maxHealth * (healthPercentage / 100));
    }
  }

  /**
   * Obtiene la configuración actual del jugador
   * @returns Configuración actual
   */
  getConfig(): PlayerConfig {
    return { ...this.config };
  }

  /**
   * Destruye el sprite del jugador
   */
  destroy(): void {
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
} 