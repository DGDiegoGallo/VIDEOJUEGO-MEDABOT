import { Scene } from 'phaser';
import { Player } from './Player';
import { EnemyManager } from './EnemyManager';
import { BulletManager } from './BulletManager';
import { ExperienceManager } from './ExperienceManager';
import { WorldManager } from './WorldManager';
import { VisualEffects } from './VisualEffects';
import { ExplosionManager } from './ExplosionManager';

export class CollisionManager {
  private scene: Scene;
  private player: Player;
  private enemyManager: EnemyManager;
  private bulletManager: BulletManager;
  private experienceManager: ExperienceManager;
  private worldManager: WorldManager;
  private visualEffects: VisualEffects;
  private explosionManager: ExplosionManager;

  // Sets para evitar colisiones múltiples
  private collidingEnemies: Set<Phaser.GameObjects.Rectangle> = new Set();
  private collidingBullets: Set<Phaser.GameObjects.Rectangle> = new Set();
  private collidingDiamonds: Set<Phaser.GameObjects.Polygon> = new Set();

  // Grupos de física para colisiones nativas
  private structureGroup?: Phaser.Physics.Arcade.StaticGroup;
  private riverGroup?: Phaser.Physics.Arcade.StaticGroup;
  private enemyGroup?: Phaser.Physics.Arcade.Group;

  constructor(
    scene: Scene,
    player: Player,
    enemyManager: EnemyManager,
    bulletManager: BulletManager,
    experienceManager: ExperienceManager,
    worldManager: WorldManager,
    visualEffects: VisualEffects,
    explosionManager: ExplosionManager
  ) {
    this.scene = scene;
    this.player = player;
    this.enemyManager = enemyManager;
    this.bulletManager = bulletManager;
    this.experienceManager = experienceManager;
    this.worldManager = worldManager;
    this.visualEffects = visualEffects;
    this.explosionManager = explosionManager;

    this.setupPhysicsGroups();
  }

  /**
   * Configura los grupos de física para colisiones nativas
   */
  private setupPhysicsGroups(): void {
    // Crear grupos estáticos para estructuras y ríos
    this.structureGroup = this.scene.physics.add.staticGroup();
    this.riverGroup = this.scene.physics.add.staticGroup();
    this.enemyGroup = this.scene.physics.add.group();

    // Configurar colisiones del jugador con obstáculos
    const playerSprite = this.player.getSprite();
    if (playerSprite) {
      // Jugador vs estructuras - COLISIÓN NATIVA
      this.scene.physics.add.collider(playerSprite, this.structureGroup, () => {
        // No hacer nada - Phaser maneja la colisión automáticamente
      });

      // Jugador vs ríos - COLISIÓN NATIVA  
      this.scene.physics.add.collider(playerSprite, this.riverGroup, () => {
        // No hacer nada - Phaser maneja la colisión automáticamente
      });
    }

    // Enemigos vs estructuras - COLISIÓN NATIVA
    this.scene.physics.add.collider(this.enemyGroup, this.structureGroup, () => {
      // No hacer nada - Phaser maneja la colisión automáticamente
    });

    // Enemigos vs ríos - COLISIÓN NATIVA
    this.scene.physics.add.collider(this.enemyGroup, this.riverGroup, () => {
      // No hacer nada - Phaser maneja la colisión automáticamente
    });

    // Configurar colisiones con barriles explosivos
    const barrelGroup = this.explosionManager.getBarrelGroup();
    if (barrelGroup && playerSprite) {
      // Jugador vs barriles - COLISIÓN NATIVA
      this.scene.physics.add.collider(playerSprite, barrelGroup, () => {
        // No hacer nada - Phaser maneja la colisión automáticamente
      });

      // Enemigos vs barriles - COLISIÓN NATIVA
      this.scene.physics.add.collider(this.enemyGroup, barrelGroup, () => {
        // No hacer nada - Phaser maneja la colisión automáticamente
      });
    }
  }

  /**
   * Actualiza los grupos de física con los obstáculos actuales
   */
  private updatePhysicsGroups(): void {
    if (!this.structureGroup || !this.riverGroup) return;

    // ARREGLADO: Limpiar grupos SIN destruir objetos visuales
    // clear(false, false) = no remover de escena, no destruir objetos
    this.structureGroup.clear(false, false);
    this.riverGroup.clear(false, false);

    // Agregar estructuras actuales
    const structures = this.worldManager.getPhysicsStructures();
    structures.forEach(structure => {
      // Verificar que el objeto aún existe antes de agregarlo
      if (structure && structure.scene && !structure.scene.sys.isDestroyed) {
        this.structureGroup!.add(structure);
      }
    });

    // Agregar ríos actuales
    const rivers = this.worldManager.getPhysicsRivers();
    rivers.forEach(river => {
      // Verificar que el objeto aún existe antes de agregarlo
      if (river && river.scene && !river.scene.sys.isDestroyed) {
        this.riverGroup!.add(river);
      }
    });

    // Actualizar enemigos en el grupo
    if (this.enemyGroup) {
      this.enemyGroup.clear(false, false);
      const enemies = this.enemyManager.getEnemies();
      enemies.forEach(enemy => {
        // Verificar que el enemigo aún existe antes de agregarlo
        if (enemy && enemy.scene && !enemy.scene.sys.isDestroyed) {
          this.enemyGroup!.add(enemy);
        }
      });
    }
  }

  // Contador para optimizar actualizaciones de grupos de física
  private updateCounter: number = 0;

  /**
   * Verifica todas las colisiones del juego
   */
  checkAllCollisions(): void {
    const playerPos = this.player.getPosition();
    const enemies = this.enemyManager.getEnemies();
    const bullets = this.bulletManager.getBullets();
    const diamonds = this.experienceManager.getDiamonds();

    // Incrementar contador
    this.updateCounter++;

    // ARREGLADO: Actualizar grupos de física menos frecuentemente pero de forma más estable
    if (this.updateCounter % 120 === 0) { // Cada 2 segundos aprox (120 frames)
      this.updatePhysicsGroups();
    }

    // Log de diagnóstico cada 5 segundos aprox
    if (this.updateCounter % 300 === 0) { // ~5 segundos
      const structures = this.worldManager.getPhysicsStructures();
      const rivers = this.worldManager.getPhysicsRivers();
      console.log(`🔍 Colisiones NATIVAS: ${structures.length} estructuras, ${rivers.length} ríos, jugador en (${Math.round(playerPos.x)}, ${Math.round(playerPos.y)})`);
    }

    // Resetear contador para evitar overflow
    if (this.updateCounter >= 600) { // Cada 10 segundos
      this.updateCounter = 0;
    }

    // Limpiar flags de colisión
    this.collidingEnemies.clear();
    this.collidingBullets.clear();
    this.collidingDiamonds.clear();

    // Solo verificar colisiones que no maneja Phaser automáticamente
    this.checkPlayerEnemyCollisions(playerPos, enemies);
    this.checkBulletEnemyCollisions(bullets, enemies);
    this.checkBulletStructureCollisions(bullets);
    this.checkPlayerDiamondCollisions(playerPos, diamonds);
    
    // Verificar colisiones con barriles explosivos
    this.explosionManager.checkBulletBarrelCollisions(bullets);
  }

  /**
   * Verifica colisiones entre jugador y enemigos
   */
  private checkPlayerEnemyCollisions(playerPos: { x: number; y: number }, enemies: Phaser.GameObjects.Rectangle[]): void {
    const playerRadius = 12; // Radio del jugador

    enemies.forEach(enemy => {
      if (!this.collidingEnemies.has(enemy)) {
        const distance = Phaser.Math.Distance.Between(playerPos.x, playerPos.y, enemy.x, enemy.y);
        const enemyRadius = enemy.width / 2 || 12;

        if (distance < (playerRadius + enemyRadius)) {
          this.collidingEnemies.add(enemy);
          this.handlePlayerEnemyCollision(enemy);
        }
      }
    });
  }

  /**
   * Verifica colisiones entre balas y enemigos
   */
  private checkBulletEnemyCollisions(bullets: Phaser.GameObjects.Rectangle[], enemies: Phaser.GameObjects.Rectangle[]): void {
    bullets.forEach(bullet => {
      if (!this.collidingBullets.has(bullet)) {
        enemies.forEach(enemy => {
          const distance = Phaser.Math.Distance.Between(bullet.x, bullet.y, enemy.x, enemy.y);
          const bulletRadius = bullet.width / 2 || 4;
          const enemyRadius = enemy.width / 2 || 12;

          if (distance < (bulletRadius + enemyRadius)) {
            this.collidingBullets.add(bullet);
            this.handleBulletEnemyCollision(bullet, enemy);
            return; // Salir del loop de enemigos
          }
        });
      }
    });
  }

  /**
   * Verifica colisiones entre balas y estructuras usando grupos de física
   */
  private checkBulletStructureCollisions(bullets: Phaser.GameObjects.Rectangle[]): void {
    if (!this.structureGroup) return;

    bullets.forEach(bullet => {
      if (!this.collidingBullets.has(bullet)) {
        // Verificar colisión con grupo de estructuras
        this.scene.physics.overlap(bullet, this.structureGroup, (bulletObj, structureObj) => {
          this.collidingBullets.add(bullet);
          this.handleBulletStructureCollision(bullet, structureObj as Phaser.GameObjects.GameObject);
        });

        // Verificar colisión con grupo de ríos
        if (this.riverGroup) {
          this.scene.physics.overlap(bullet, this.riverGroup, (bulletObj, riverObj) => {
            this.collidingBullets.add(bullet);
            this.handleBulletStructureCollision(bullet, riverObj as Phaser.GameObjects.GameObject);
          });
        }
      }
    });
  }

  /**
   * Verifica colisiones entre jugador y diamantes
   */
  private checkPlayerDiamondCollisions(playerPos: { x: number; y: number }, diamonds: Phaser.GameObjects.Polygon[]): void {
    const playerRadius = 12;

    diamonds.forEach(diamond => {
      if (!this.collidingDiamonds.has(diamond)) {
        const distance = Phaser.Math.Distance.Between(playerPos.x, playerPos.y, diamond.x, diamond.y);
        const diamondRadius = 8; // Radio aproximado del diamante

        if (distance < (playerRadius + diamondRadius)) {
          this.collidingDiamonds.add(diamond);
          this.handlePlayerDiamondCollision(diamond);
        }
      }
    });
  }

  /**
   * Maneja la colisión entre jugador y enemigo
   */
  private handlePlayerEnemyCollision(enemy: Phaser.GameObjects.Rectangle): void {
    this.player.takeDamage(20);
    this.enemyManager.removeEnemy(enemy);
    this.player.createDamageEffect();

    if (!this.player.isAlive()) {
      this.scene.events.emit('gameOver');
    }
  }

  /**
   * Maneja la colisión entre bala y enemigo
   */
  private handleBulletEnemyCollision(bullet: Phaser.GameObjects.Rectangle, enemy: Phaser.GameObjects.Rectangle): void {
    this.bulletManager.removeBullet(bullet);

    // Usar el nuevo sistema de daño (false = no es explosión)
    const enemyDied = this.enemyManager.damageEnemy(enemy, 1, false);

    if (enemyDied) {
      // Obtener el tipo de enemigo para crear el diamante apropiado
      const enemyType = enemy.getData('type') || 'zombie';
      
      // Enemigo eliminado - crear diamante con valor apropiado
      this.experienceManager.createDiamond(enemy.x, enemy.y, enemyType);
      
      // Calcular score basado en el tipo de enemigo
      let scoreValue = 10; // Default
      switch (enemyType) {
        case 'zombie':
        case 'fast_zombie':
          scoreValue = 10;
          break;
        case 'dasher':
          scoreValue = 50;
          break;
        case 'tank':
          scoreValue = 350;
          break;
      }
      
      this.scene.events.emit('enemyKilled', { score: scoreValue });

      this.visualEffects.createExplosionEffect(enemy.x, enemy.y);
      this.visualEffects.showScoreText(enemy.x, enemy.y, `+${scoreValue}`);
    } else {
      // Enemigo dañado pero no eliminado
      const enemyType = enemy.getData('type');
      const remainingHealth = enemy.getData('health');

      if (enemyType === 'dasher') {
        this.visualEffects.showScoreText(enemy.x, enemy.y, `HP: ${remainingHealth}`, '#8a2be2');
      } else if (enemyType === 'tank') {
        const hasShield = enemy.getData('hasShield');
        if (hasShield) {
          this.visualEffects.showScoreText(enemy.x, enemy.y, 'BLOCKED', '#00ffff');
        } else {
          this.visualEffects.showScoreText(enemy.x, enemy.y, `HP: ${remainingHealth}`, '#808080');
        }
      } else {
        this.visualEffects.showScoreText(enemy.x, enemy.y, 'HIT', '#ff6666');
      }
    }
  }

  /**
   * Maneja la colisión entre bala y estructura
   */
  private handleBulletStructureCollision(bullet: Phaser.GameObjects.Rectangle, _structure: Phaser.GameObjects.GameObject): void {
    this.bulletManager.removeBullet(bullet);
    this.visualEffects.createBulletHitEffect(bullet.x, bullet.y);
  }

  /**
   * Maneja la colisión entre jugador y diamante
   */
  private handlePlayerDiamondCollision(diamond: Phaser.GameObjects.Polygon): void {
    const playerPos = this.player.getPosition();
    const experienceValue = diamond.getData('experienceValue') || 10;
    const diamondColor = diamond.fillColor;
    
    this.visualEffects.createCollectionEffect(diamond.x, diamond.y, playerPos.x, playerPos.y);
    this.visualEffects.showScoreText(diamond.x, diamond.y, `+${experienceValue} EXP`, `#${diamondColor.toString(16).padStart(6, '0')}`);

    const leveledUp = this.experienceManager.collectDiamond(diamond);

    if (leveledUp) {
      this.scene.events.emit('levelUp');
    }
  }

  /**
   * Fuerza la actualización inmediata de los grupos de física
   * Útil cuando se generan nuevos chunks o se cambia de área
   */
  public forceUpdatePhysicsGroups(): void {
    this.updatePhysicsGroups();
    console.log('🔄 Grupos de física actualizados forzadamente');
  }

  /**
   * Obtiene estadísticas de los grupos de física para diagnóstico
   */
  public getPhysicsGroupsStats(): { structures: number; rivers: number; enemies: number; barrels: number } {
    return {
      structures: this.structureGroup?.children.size || 0,
      rivers: this.riverGroup?.children.size || 0,
      enemies: this.enemyGroup?.children.size || 0,
      barrels: this.explosionManager.getBarrels().length
    };
  }

  /**
   * Limpia todos los recursos del manager
   */
  destroy(): void {
    this.collidingEnemies.clear();
    this.collidingBullets.clear();
    this.collidingDiamonds.clear();

    // Limpiar grupos de física SIN destruir objetos visuales
    if (this.structureGroup) {
      this.structureGroup.clear(false, false);
      this.structureGroup.destroy(false);
    }
    if (this.riverGroup) {
      this.riverGroup.clear(false, false);
      this.riverGroup.destroy(false);
    }
    if (this.enemyGroup) {
      this.enemyGroup.clear(false, false);
      this.enemyGroup.destroy(false);
    }
  }
}