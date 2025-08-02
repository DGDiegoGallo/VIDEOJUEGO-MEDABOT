import { Scene } from 'phaser';
import { Player } from './Player';
import { EnemyManager } from './EnemyManager';
import { WorldManager } from './WorldManager';
import { VisualEffects } from './VisualEffects';

/**
 * Configuración de una explosión
 */
interface ExplosionConfig {
  x: number;
  y: number;
  radius: number;
  damage: number;
  damagePlayer: boolean;
  damageEnemies: boolean;
  destroyStructures: boolean;
  source?: 'barrel' | 'grenade' | 'missile' | 'other';
}

/**
 * Representa un barril explosivo
 */
interface ExplosiveBarrel {
  sprite: Phaser.GameObjects.Rectangle;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  exploded: boolean;
}

/**
 * Manager para manejar explosiones y barriles explosivos
 * 
 * Responsabilidades:
 * - Crear y manejar barriles explosivos
 * - Sistema de explosiones reutilizable
 * - Daño a jugador, enemigos y estructuras
 * - Efectos visuales de explosiones
 * - Reacciones en cadena de explosiones
 */
export class ExplosionManager {
  private scene: Scene;
  private player: Player;
  private enemyManager: EnemyManager;
  private worldManager: WorldManager;
  private visualEffects: VisualEffects;

  // Barriles explosivos
  private barrels: ExplosiveBarrel[] = [];
  private barrelGroup?: Phaser.Physics.Arcade.StaticGroup;

  // Configuración
  private readonly BARREL_HEALTH = 3;
  private readonly BARREL_EXPLOSION_RADIUS = 120;
  private readonly BARREL_EXPLOSION_DAMAGE = 50;

  constructor(
    scene: Scene,
    player: Player,
    enemyManager: EnemyManager,
    worldManager: WorldManager,
    visualEffects: VisualEffects
  ) {
    this.scene = scene;
    this.player = player;
    this.enemyManager = enemyManager;
    this.worldManager = worldManager;
    this.visualEffects = visualEffects;

    this.setupBarrelGroup();
  }

  /**
   * Configura el grupo de física para barriles
   */
  private setupBarrelGroup(): void {
    this.barrelGroup = this.scene.physics.add.staticGroup();
    console.log('💥 ExplosionManager: Grupo de barriles configurado');
  }

  /**
   * Crea un barril explosivo en una posición específica
   */
  createBarrel(x: number, y: number): ExplosiveBarrel {
    // Crear sprite del barril (placeholder rojo con detalles)
    const barrelSprite = this.scene.add.rectangle(x, y, 32, 40, 0x8b4513);
    barrelSprite.setStrokeStyle(2, 0x654321);
    barrelSprite.setDepth(-50); // Por encima de estructuras pero debajo del jugador

    // Agregar detalles visuales del barril
    const topRing = this.scene.add.rectangle(x, y - 12, 32, 4, 0x654321);
    const bottomRing = this.scene.add.rectangle(x, y + 12, 32, 4, 0x654321);
    const warningSymbol = this.scene.add.text(x, y, '💥', {
      fontSize: '16px',
      color: '#ff0000'
    }).setOrigin(0.5);

    topRing.setDepth(-49);
    bottomRing.setDepth(-49);
    warningSymbol.setDepth(-48);

    // Agregar física al barril
    this.scene.physics.add.existing(barrelSprite, true); // static body
    this.barrelGroup?.add(barrelSprite);

    // Crear objeto barril
    const barrel: ExplosiveBarrel = {
      sprite: barrelSprite,
      x: x,
      y: y,
      health: this.BARREL_HEALTH,
      maxHealth: this.BARREL_HEALTH,
      exploded: false
    };

    // Almacenar referencias en el sprite para limpieza
    barrelSprite.setData('topRing', topRing);
    barrelSprite.setData('bottomRing', bottomRing);
    barrelSprite.setData('warningSymbol', warningSymbol);
    barrelSprite.setData('barrelData', barrel);

    this.barrels.push(barrel);

    console.log(`🛢️ Barril creado en (${x}, ${y}) con ${this.BARREL_HEALTH} HP`);
    return barrel;
  }

  /**
   * Genera barriles explosivos aleatoriamente en el mundo
   */
  generateRandomBarrels(centerX: number, centerY: number, count: number = 3): void {
    const spawnRadius = 400;

    for (let i = 0; i < count; i++) {
      // Generar posición aleatoria alrededor del centro
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * spawnRadius;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      // Verificar que no esté muy cerca de estructuras
      const structures = this.worldManager.getPhysicsStructures();
      let tooClose = false;

      for (const structure of structures) {
        const structDistance = Phaser.Math.Distance.Between(x, y, structure.x || 0, structure.y || 0);
        if (structDistance < 60) {
          tooClose = true;
          break;
        }
      }

      if (!tooClose) {
        this.createBarrel(x, y);
      }
    }
  }

  /**
   * Daña un barril específico
   */
  damageBarrel(barrel: ExplosiveBarrel, damage: number): boolean {
    if (barrel.exploded) return false;

    barrel.health -= damage;

    // Efecto visual de daño
    this.visualEffects.showScoreText(barrel.x, barrel.y, `-${damage}`, '#ff6666');

    // Cambiar color del barril según la salud
    const healthPercent = barrel.health / barrel.maxHealth;
    if (healthPercent > 0.6) {
      barrel.sprite.setFillStyle(0x8b4513); // Marrón normal
    } else if (healthPercent > 0.3) {
      barrel.sprite.setFillStyle(0xa0522d); // Marrón más claro (dañado)
    } else {
      barrel.sprite.setFillStyle(0xcd853f); // Marrón claro (muy dañado)
    }

    // Explotar si la salud llega a 0
    if (barrel.health <= 0) {
      this.explodeBarrel(barrel);
      return true;
    }

    return false;
  }

  /**
   * Hace explotar un barril específico
   */
  private explodeBarrel(barrel: ExplosiveBarrel): void {
    if (barrel.exploded) return;

    barrel.exploded = true;

    console.log(`💥 Barril explotando en (${barrel.x}, ${barrel.y})`);

    // Crear explosión
    this.createExplosion({
      x: barrel.x,
      y: barrel.y,
      radius: this.BARREL_EXPLOSION_RADIUS,
      damage: this.BARREL_EXPLOSION_DAMAGE,
      damagePlayer: true,
      damageEnemies: true,
      destroyStructures: true,
      source: 'barrel'
    });

    // Remover barril del array
    const index = this.barrels.indexOf(barrel);
    if (index > -1) {
      this.barrels.splice(index, 1);
    }

    // Limpiar sprites
    const topRing = barrel.sprite.getData('topRing');
    const bottomRing = barrel.sprite.getData('bottomRing');
    const warningSymbol = barrel.sprite.getData('warningSymbol');

    if (topRing) topRing.destroy();
    if (bottomRing) bottomRing.destroy();
    if (warningSymbol) warningSymbol.destroy();

    // Remover del grupo de física
    this.barrelGroup?.remove(barrel.sprite);
    barrel.sprite.destroy();
  }

  /**
   * Crea una explosión con configuración específica (SISTEMA REUTILIZABLE)
   */
  createExplosion(config: ExplosionConfig): void {
    const { x, y, radius, damage, damagePlayer, damageEnemies, destroyStructures, source } = config;

    console.log(`💥 Explosión ${source || 'desconocida'} en (${x}, ${y}) - Radio: ${radius}, Daño: ${damage}`);

    // Efecto visual de explosión
    this.createExplosionVisualEffect(x, y, radius);

    // Daño al jugador
    if (damagePlayer) {
      const playerPos = this.player.getPosition();
      const playerDistance = Phaser.Math.Distance.Between(x, y, playerPos.x, playerPos.y);

      if (playerDistance <= radius) {
        // Calcular daño basado en distancia
        const distancePercent = 1 - (playerDistance / radius);
        const actualDamage = Math.floor(damage * distancePercent);

        if (actualDamage > 0) {
          this.player.takeDamage(actualDamage);
          this.player.createDamageEffect();
          this.visualEffects.showScoreText(playerPos.x, playerPos.y, `-${actualDamage} HP`, '#ff0000');

          console.log(`💥 Jugador recibe ${actualDamage} de daño por explosión`);

          if (!this.player.isAlive()) {
            this.scene.events.emit('gameOver');
          }
        }
      }
    }

    // Daño a enemigos
    if (damageEnemies) {
      const enemies = this.enemyManager.getEnemies();
      let enemiesKilled = 0;

      enemies.forEach(enemy => {
        const enemyDistance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);

        if (enemyDistance <= radius) {
          // Calcular daño basado en distancia
          const distancePercent = 1 - (enemyDistance / radius);
          const actualDamage = Math.floor(damage * distancePercent);

          if (actualDamage > 0) {
            const enemyDied = this.enemyManager.damageEnemy(enemy, actualDamage, true); // true = es explosión

            if (enemyDied) {
              enemiesKilled++;
              this.scene.events.emit('enemyKilled', { score: 15 }); // Bonus por explosión
            } else {
              // Mostrar mensaje específico para tanques con escudo roto
              const enemyType = enemy.getData('type');
              if (enemyType === 'tank' && !enemy.getData('hasShield')) {
                this.visualEffects.showScoreText(enemy.x, enemy.y, 'SHIELD BROKEN!', '#00ffff');
              } else {
                this.visualEffects.showScoreText(enemy.x, enemy.y, `-${actualDamage}`, '#ff6666');
              }
            }
          }
        }
      });

      if (enemiesKilled > 0) {
        console.log(`💥 Explosión eliminó ${enemiesKilled} enemigos`);
        this.visualEffects.showScoreText(x, y, `+${enemiesKilled * 15}`, '#ffff00');
      }
    }

    // Destruir estructuras
    if (destroyStructures) {
      this.destroyStructuresInRadius(x, y, radius);
    }

    // Reacción en cadena con otros barriles
    this.triggerChainReaction(x, y, radius);
  }

  /**
   * Crea el efecto visual de la explosión
   */
  private createExplosionVisualEffect(x: number, y: number, radius: number): void {
    // Círculo de explosión principal
    const explosionCircle = this.scene.add.circle(x, y, radius, 0xff4500, 0.7);
    explosionCircle.setDepth(100); // Por encima de todo

    // Círculo interno más brillante
    const innerCircle = this.scene.add.circle(x, y, radius * 0.6, 0xffd700, 0.9);
    innerCircle.setDepth(101);

    // Círculo central
    const coreCircle = this.scene.add.circle(x, y, radius * 0.3, 0xffffff, 1);
    coreCircle.setDepth(102);

    // Animación de expansión y desvanecimiento
    this.scene.tweens.add({
      targets: [explosionCircle, innerCircle, coreCircle],
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        explosionCircle.destroy();
        innerCircle.destroy();
        coreCircle.destroy();
      }
    });

    // Partículas de explosión
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const particleX = x + Math.cos(angle) * 20;
      const particleY = y + Math.sin(angle) * 20;

      const particle = this.scene.add.rectangle(particleX, particleY, 8, 8, 0xff6600);
      particle.setDepth(103);

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * radius * 0.8,
        y: y + Math.sin(angle) * radius * 0.8,
        alpha: 0,
        duration: 400,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }

    // Efecto de sacudida de cámara
    this.scene.cameras.main.shake(300, 0.02);
  }

  /**
   * Destruye estructuras dentro del radio de explosión
   */
  private destroyStructuresInRadius(x: number, y: number, radius: number): void {
    const structures = this.worldManager.getPhysicsStructures();
    let structuresDestroyed = 0;

    structures.forEach(structure => {
      const structDistance = Phaser.Math.Distance.Between(x, y, structure.x || 0, structure.y || 0);

      if (structDistance <= radius) {
        // Efecto visual de destrucción
        this.visualEffects.createExplosionEffect(structure.x || 0, structure.y || 0);

        // Remover estructura (esto requerirá modificar WorldManager)
        // Por ahora solo crear efecto visual
        structuresDestroyed++;

        console.log(`💥 Estructura destruida en (${structure.x}, ${structure.y})`);
      }
    });

    if (structuresDestroyed > 0) {
      console.log(`💥 Explosión destruyó ${structuresDestroyed} estructuras`);
      this.visualEffects.showScoreText(x, y, `${structuresDestroyed} estructuras`, '#ff8800');
    }
  }

  /**
   * Activa reacción en cadena con otros barriles
   */
  private triggerChainReaction(x: number, y: number, radius: number): void {
    const barrelsToExplode: ExplosiveBarrel[] = [];

    this.barrels.forEach(barrel => {
      if (!barrel.exploded) {
        const distance = Phaser.Math.Distance.Between(x, y, barrel.x, barrel.y);

        if (distance <= radius) {
          barrelsToExplode.push(barrel);
        }
      }
    });

    // Explotar barriles con un pequeño delay para efecto visual
    barrelsToExplode.forEach((barrel, index) => {
      this.scene.time.delayedCall(index * 100, () => {
        this.explodeBarrel(barrel);
      });
    });

    if (barrelsToExplode.length > 0) {
      console.log(`🔥 Reacción en cadena: ${barrelsToExplode.length} barriles adicionales`);
    }
  }

  /**
   * Verifica colisiones de balas con barriles
   */
  checkBulletBarrelCollisions(bullets: Phaser.GameObjects.Rectangle[]): void {
    bullets.forEach(bullet => {
      this.barrels.forEach(barrel => {
        if (!barrel.exploded) {
          const distance = Phaser.Math.Distance.Between(bullet.x, bullet.y, barrel.x, barrel.y);
          const bulletRadius = bullet.width / 2 || 4;
          const barrelRadius = 20; // Radio aproximado del barril

          if (distance < (bulletRadius + barrelRadius)) {
            // Remover bala
            this.scene.events.emit('bulletHitBarrel', bullet);

            // Dañar barril
            this.damageBarrel(barrel, 1);
          }
        }
      });
    });
  }

  /**
   * Obtiene todos los barriles activos
   */
  getBarrels(): ExplosiveBarrel[] {
    return this.barrels.filter(barrel => !barrel.exploded);
  }

  /**
   * Obtiene el grupo de física de barriles
   */
  getBarrelGroup(): Phaser.Physics.Arcade.StaticGroup | undefined {
    return this.barrelGroup;
  }

  /**
   * Limpia barriles fuera de pantalla
   */
  cleanupOffscreenBarrels(playerX: number, playerY: number, maxDistance: number = 1200): void {
    const barrelsToRemove: ExplosiveBarrel[] = [];

    this.barrels.forEach(barrel => {
      const distance = Phaser.Math.Distance.Between(playerX, playerY, barrel.x, barrel.y);

      if (distance > maxDistance) {
        barrelsToRemove.push(barrel);
      }
    });

    barrelsToRemove.forEach(barrel => {
      const index = this.barrels.indexOf(barrel);
      if (index > -1) {
        this.barrels.splice(index, 1);
      }

      // Limpiar sprites
      const topRing = barrel.sprite.getData('topRing');
      const bottomRing = barrel.sprite.getData('bottomRing');
      const warningSymbol = barrel.sprite.getData('warningSymbol');

      if (topRing) topRing.destroy();
      if (bottomRing) bottomRing.destroy();
      if (warningSymbol) warningSymbol.destroy();

      this.barrelGroup?.remove(barrel.sprite);
      barrel.sprite.destroy();
    });

    if (barrelsToRemove.length > 0) {
      console.log(`🗑️ Limpiados ${barrelsToRemove.length} barriles fuera de pantalla`);
    }
  }

  /**
   * Crea una explosión de granada (método público para lanzagranadas)
   */
  public createGrenadeExplosion(x: number, y: number): void {
    this.createExplosion({
      x: x,
      y: y,
      radius: 100,
      damage: 40,
      damagePlayer: false, // Las granadas del jugador no lo dañan
      damageEnemies: true,
      destroyStructures: true,
      source: 'grenade'
    });
  }

  /**
   * Crea una explosión de misil (método público para armas pesadas)
   */
  public createMissileExplosion(x: number, y: number): void {
    this.createExplosion({
      x: x,
      y: y,
      radius: 150,
      damage: 80,
      damagePlayer: false, // Los misiles del jugador no lo dañan
      damageEnemies: true,
      destroyStructures: true,
      source: 'missile'
    });
  }

  /**
   * Crea una explosión personalizada (método público genérico)
   */
  public createCustomExplosion(x: number, y: number, radius: number, damage: number, damagePlayer: boolean = false): void {
    this.createExplosion({
      x: x,
      y: y,
      radius: radius,
      damage: damage,
      damagePlayer: damagePlayer,
      damageEnemies: true,
      destroyStructures: true,
      source: 'other'
    });
  }

  /**
   * Destruye el manager y limpia recursos
   */
  destroy(): void {
    // Limpiar todos los barriles
    this.barrels.forEach(barrel => {
      const topRing = barrel.sprite.getData('topRing');
      const bottomRing = barrel.sprite.getData('bottomRing');
      const warningSymbol = barrel.sprite.getData('warningSymbol');

      if (topRing) topRing.destroy();
      if (bottomRing) bottomRing.destroy();
      if (warningSymbol) warningSymbol.destroy();

      barrel.sprite.destroy();
    });

    this.barrels.clear();

    // Limpiar grupo de física
    if (this.barrelGroup) {
      this.barrelGroup.clear(false, false);
      this.barrelGroup.destroy(false);
    }

    console.log('💥 ExplosionManager destruido');
  }
}