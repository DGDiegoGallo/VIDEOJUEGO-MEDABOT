import { Scene } from 'phaser';
import { BulletConfig } from '../types/game';

/**
 * Clase que maneja toda la lógica relacionada con las balas
 * 
 * Responsabilidades:
 * - Crear y gestionar balas
 * - Controlar el disparo hacia enemigos
 * - Manejar el movimiento de balas
 * - Gestionar la eliminación de balas
 * - Aplicar efectos visuales a las balas
 * 
 * @example
 * ```typescript
 * const bulletManager = new BulletManager(scene);
 * bulletManager.shootAtEnemy(playerX, playerY, enemyX, enemyY);
 * bulletManager.updateBullets();
 * ```
 */
export class BulletManager {
  private bullets: Phaser.GameObjects.Rectangle[] = [];
  private scene: Scene;
  private config: BulletConfig;
  private bulletsPerShot: number = 1;

  /**
   * Constructor de la clase BulletManager
   * @param scene - Escena de Phaser donde se crearán las balas
   * @param config - Configuración opcional de las balas
   */
  constructor(scene: Scene, config?: Partial<BulletConfig>) {
    this.scene = scene;

    // Configuración por defecto
    this.config = {
      size: 8,
      speed: 400,
      color: 0xffff00,
      strokeColor: 0xffffff,
      lifetime: 2000,
      ...config
    };
  }

  /**
   * Dispara balas hacia un enemigo desde la posición del jugador
   * @param playerX - Posición X del jugador
   * @param playerY - Posición Y del jugador
   * @param enemyX - Posición X del enemigo
   * @param enemyY - Posición Y del enemigo
   */
  shootAtEnemy(playerX: number, playerY: number, enemyX: number, enemyY: number): void {
    const baseAngle = Phaser.Math.Angle.Between(playerX, playerY, enemyX, enemyY);

    console.log(`🔫 Shooting ${this.bulletsPerShot} bullets at enemy`);

    // Disparar múltiples balas según el nivel de multiShot
    for (let i = 0; i < this.bulletsPerShot; i++) {
      let angle = baseAngle;

      // Si hay múltiples balas, distribuirlas en un arco
      if (this.bulletsPerShot > 1) {
        const spreadAngle = Math.PI / 6; // 30 grados de dispersión total
        const angleStep = spreadAngle / (this.bulletsPerShot - 1);
        angle = baseAngle - spreadAngle / 2 + (angleStep * i);
      }

      this.createBullet(playerX, playerY, angle);
    }
  }

  /**
   * Dispara balas en una dirección específica
   * @param startX - Posición X de inicio
   * @param startY - Posición Y de inicio
   * @param angle - Ángulo de disparo en radianes
   */
  shootInDirection(startX: number, startY: number, angle: number): void {
    for (let i = 0; i < this.bulletsPerShot; i++) {
      let bulletAngle = angle;

      if (this.bulletsPerShot > 1) {
        const spreadAngle = Math.PI / 6;
        const angleStep = spreadAngle / (this.bulletsPerShot - 1);
        bulletAngle = angle - spreadAngle / 2 + (angleStep * i);
      }

      this.createBullet(startX, startY, bulletAngle);
    }
  }

  /**
   * Crea una bala individual
   * @param x - Posición X de la bala
   * @param y - Posición Y de la bala
   * @param angle - Ángulo de movimiento en radianes
   * @returns El sprite de la bala creada
   */
  private createBullet(x: number, y: number, angle: number): Phaser.GameObjects.Rectangle {
    const bullet = this.scene.add.rectangle(x, y, this.config.size, this.config.size, this.config.color);
    bullet.setStrokeStyle(1, this.config.strokeColor);
    bullet.setDepth(20); // Balas por encima de todo excepto UI y jugador
    this.scene.physics.add.existing(bullet);
    this.bullets.push(bullet);

    // Configurar movimiento
    const body = bullet.body as Phaser.Physics.Arcade.Body;
    const velocityX = Math.cos(angle) * this.config.speed;
    const velocityY = Math.sin(angle) * this.config.speed;
    body.setVelocity(velocityX, velocityY);

    // Aplicar efectos visuales
    this.createBulletTrail(bullet);

    // Auto-destruir después del tiempo de vida
    this.scene.time.delayedCall(this.config.lifetime, () => {
      if (bullet.active) {
        this.removeBullet(bullet);
      }
    });

    return bullet;
  }

  /**
   * Crea un efecto de estela para la bala
   * @param bullet - Sprite de la bala
   */
  private createBulletTrail(bullet: Phaser.GameObjects.Rectangle): void {
    this.scene.tweens.add({
      targets: bullet,
      alpha: 0.7,
      duration: this.config.lifetime,
      ease: 'Linear'
    });
  }

  /**
   * Actualiza todas las balas (movimiento, límites de pantalla, etc.)
   */
  updateBullets(): void {
    // En un mundo infinito, no eliminamos balas por límites de pantalla
    // Solo eliminamos balas inactivas
    this.bullets = this.bullets.filter(bullet => {
      if (!bullet.active) {
        return false;
      }
      return true;
    });
  }

  /**
   * Obtiene todas las balas activas
   * @returns Array de sprites de balas
   */
  getBullets(): Phaser.GameObjects.Rectangle[] {
    return this.bullets.filter(bullet => bullet.active);
  }

  /**
   * Elimina una bala específica
   * @param bullet - Sprite de la bala a eliminar
   */
  removeBullet(bullet: Phaser.GameObjects.Rectangle): void {
    const index = this.bullets.indexOf(bullet);
    if (index > -1) {
      this.bullets.splice(index, 1);
    }
    bullet.destroy();
  }

  /**
   * Elimina todas las balas
   */
  clearAllBullets(): void {
    this.bullets.forEach(bullet => {
      if (bullet.active) {
        bullet.destroy();
      }
    });
    this.bullets = [];
  }

  /**
   * Obtiene la cantidad de balas activas
   * @returns Número de balas activas
   */
  getBulletCount(): number {
    return this.getBullets().length;
  }

  /**
   * Establece el número de balas por disparo
   * @param count - Número de balas por disparo
   */
  setBulletsPerShot(count: number): void {
    const previousCount = this.bulletsPerShot;
    this.bulletsPerShot = Math.max(1, count);
    console.log(`🔫 BulletManager setBulletsPerShot: ${previousCount} → ${this.bulletsPerShot} (requested: ${count})`);
  }

  /**
   * Obtiene el número actual de balas por disparo
   * @returns Número de balas por disparo
   */
  getBulletsPerShot(): number {
    return this.bulletsPerShot;
  }

  /**
   * Actualiza la configuración de las balas
   * @param newConfig - Nueva configuración
   */
  updateConfig(newConfig: Partial<BulletConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Actualizar número de balas por disparo
    if (newConfig.bulletsPerShot !== undefined) {
      this.setBulletsPerShot(newConfig.bulletsPerShot);
    }

    // Si cambió la velocidad, actualizar balas existentes
    if (newConfig.speed && this.bullets.length > 0) {
      this.bullets.forEach(bullet => {
        if (bullet.active) {
          const body = bullet.body as Phaser.Physics.Arcade.Body;
          const currentVelocity = body.velocity;
          const currentSpeed = Math.sqrt(currentVelocity.x * currentVelocity.x + currentVelocity.y * currentVelocity.y);

          if (currentSpeed > 0) {
            const newSpeed = newConfig.speed!;
            const velocityX = (currentVelocity.x / currentSpeed) * newSpeed;
            const velocityY = (currentVelocity.y / currentSpeed) * newSpeed;
            body.setVelocity(velocityX, velocityY);
          }
        }
      });
    }

    // Si cambió el tiempo de vida, actualizar balas existentes
    if (newConfig.lifetime && this.bullets.length > 0) {
      // Las balas existentes mantienen su tiempo de vida original
      // Solo las nuevas balas usarán el nuevo tiempo de vida
    }
  }

  /**
   * Obtiene la configuración actual de las balas
   * @returns Configuración actual
   */
  getConfig(): BulletConfig {
    return { ...this.config };
  }

  /**
   * Crea un efecto de explosión de bala
   * @param x - Posición X de la explosión
   * @param y - Posición Y de la explosión
   */
  createBulletExplosion(x: number, y: number): void {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const distance = 15;
      const particleX = x + Math.cos(angle) * distance;
      const particleY = y + Math.sin(angle) * distance;

      const particle = this.scene.add.circle(particleX, particleY, 2, this.config.color);

      this.scene.tweens.add({
        targets: particle,
        x: particleX + Math.cos(angle) * 30,
        y: particleY + Math.sin(angle) * 30,
        alpha: 0,
        scale: 0,
        duration: 400,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  /**
   * Verifica si hay balas fuera de los límites de la pantalla
   * @param _margin - Margen adicional para considerar "fuera de pantalla" (no usado en mundo infinito)
   */
  cleanupOffscreenBullets(_margin: number = 50): void {
    // En mundo infinito, solo limpiamos balas muy distantes del jugador
    // para evitar problemas de memoria
    const camera = this.scene.cameras.main;
    const cameraX = camera.scrollX;
    const cameraY = camera.scrollY;
    const maxDistance = 1000; // Distancia máxima permitida

    this.bullets.forEach((bullet, index) => {
      if (!bullet.active) {
        this.bullets.splice(index, 1);
        return;
      }

      const distance = Phaser.Math.Distance.Between(bullet.x, bullet.y, cameraX, cameraY);
      if (distance > maxDistance) {
        this.removeBullet(bullet);
      }
    });
  }

  /**
   * Destruye todas las balas y limpia la memoria
   */
  destroy(): void {
    this.clearAllBullets();
  }
} 