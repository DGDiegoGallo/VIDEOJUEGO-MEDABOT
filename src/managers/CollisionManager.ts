import { Scene } from 'phaser';
import { Player } from './Player';
import { EnemyManager } from './EnemyManager';
import { BulletManager } from './BulletManager';
import { ExperienceManager } from './ExperienceManager';
import { WorldManager } from './WorldManager';
import { VisualEffects } from './VisualEffects';

export class CollisionManager {
  private scene: Scene;
  private player: Player;
  private enemyManager: EnemyManager;
  private bulletManager: BulletManager;
  private experienceManager: ExperienceManager;
  private worldManager: WorldManager;
  private visualEffects: VisualEffects;

  // Sets para evitar colisiones múltiples
  private collidingEnemies: Set<Phaser.GameObjects.Rectangle> = new Set();
  private collidingBullets: Set<Phaser.GameObjects.Rectangle> = new Set();
  private collidingDiamonds: Set<Phaser.GameObjects.Polygon> = new Set();

  constructor(
    scene: Scene,
    player: Player,
    enemyManager: EnemyManager,
    bulletManager: BulletManager,
    experienceManager: ExperienceManager,
    worldManager: WorldManager,
    visualEffects: VisualEffects
  ) {
    this.scene = scene;
    this.player = player;
    this.enemyManager = enemyManager;
    this.bulletManager = bulletManager;
    this.experienceManager = experienceManager;
    this.worldManager = worldManager;
    this.visualEffects = visualEffects;
  }

  /**
   * Verifica todas las colisiones del juego
   */
  checkAllCollisions(): void {
    const playerPos = this.player.getPosition();
    const enemies = this.enemyManager.getEnemies();
    const bullets = this.bulletManager.getBullets();
    const diamonds = this.experienceManager.getDiamonds();
    const structures = this.worldManager.getPhysicsStructures();
    const rivers = this.worldManager.getPhysicsRivers();

    // Limpiar flags de colisión
    this.collidingEnemies.clear();
    this.collidingBullets.clear();
    this.collidingDiamonds.clear();

    // Verificar colisiones usando detección manual
    this.checkPlayerEnemyCollisions(playerPos, enemies);
    this.checkPlayerStructureCollisions(playerPos, structures);
    this.checkPlayerRiverCollisions(playerPos, rivers);
    this.checkBulletEnemyCollisions(bullets, enemies);
    this.checkBulletStructureCollisions(bullets, structures);
    this.checkPlayerDiamondCollisions(playerPos, diamonds);
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
   * Verifica colisiones entre jugador y estructuras
   */
  private checkPlayerStructureCollisions(playerPos: { x: number; y: number }, structures: Phaser.GameObjects.GameObject[]): void {
    const playerRadius = 12;
    
    structures.forEach(structure => {
      // Usar getBounds() si está disponible, sino usar posición y tamaño
      let structureBounds: Phaser.Geom.Rectangle;
      
      if ('getBounds' in structure && typeof structure.getBounds === 'function') {
        structureBounds = structure.getBounds();
      } else {
        // Fallback: crear bounds basado en posición y tamaño
        structureBounds = new Phaser.Geom.Rectangle(
          (structure as any).x || 0,
          (structure as any).y || 0,
          (structure as any).width || 32,
          (structure as any).height || 32
        );
      }
      
      const playerBounds = new Phaser.Geom.Rectangle(
        playerPos.x - playerRadius,
        playerPos.y - playerRadius,
        playerRadius * 2,
        playerRadius * 2
      );
      
      if (Phaser.Geom.Rectangle.Overlaps(playerBounds, structureBounds)) {
        this.handlePlayerStructureCollision(structure);
      }
    });
  }

  /**
   * Verifica colisiones entre jugador y ríos
   */
  private checkPlayerRiverCollisions(playerPos: { x: number; y: number }, rivers: Phaser.GameObjects.GameObject[]): void {
    const playerRadius = 12;
    
    rivers.forEach(river => {
      // Usar getBounds() si está disponible, sino usar posición y tamaño
      let riverBounds: Phaser.Geom.Rectangle;
      
      if ('getBounds' in river && typeof river.getBounds === 'function') {
        riverBounds = river.getBounds();
      } else {
        // Fallback: crear bounds basado en posición y tamaño
        riverBounds = new Phaser.Geom.Rectangle(
          (river as any).x || 0,
          (river as any).y || 0,
          (river as any).width || 32,
          (river as any).height || 32
        );
      }
      
      const playerBounds = new Phaser.Geom.Rectangle(
        playerPos.x - playerRadius,
        playerPos.y - playerRadius,
        playerRadius * 2,
        playerRadius * 2
      );
      
      if (Phaser.Geom.Rectangle.Overlaps(playerBounds, riverBounds)) {
        this.handlePlayerRiverCollision(river);
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
   * Verifica colisiones entre balas y estructuras
   */
  private checkBulletStructureCollisions(bullets: Phaser.GameObjects.Rectangle[], structures: Phaser.GameObjects.GameObject[]): void {
    bullets.forEach(bullet => {
      if (!this.collidingBullets.has(bullet)) {
        structures.forEach(structure => {
          // Usar getBounds() si está disponible, sino usar posición y tamaño
          let structureBounds: Phaser.Geom.Rectangle;
          
          if ('getBounds' in structure && typeof structure.getBounds === 'function') {
            structureBounds = structure.getBounds();
          } else {
            // Fallback: crear bounds basado en posición y tamaño
            structureBounds = new Phaser.Geom.Rectangle(
              (structure as any).x || 0,
              (structure as any).y || 0,
              (structure as any).width || 32,
              (structure as any).height || 32
            );
          }
          
          const bulletBounds = new Phaser.Geom.Rectangle(
            bullet.x - 4,
            bullet.y - 4,
            8,
            8
          );
          
          if (Phaser.Geom.Rectangle.Overlaps(bulletBounds, structureBounds)) {
            this.collidingBullets.add(bullet);
            this.handleBulletStructureCollision(bullet, structure);
            return; // Salir del loop de estructuras
          }
        });
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
   * Maneja la colisión entre jugador y estructura
   */
  private handlePlayerStructureCollision(_structure: Phaser.GameObjects.GameObject): void {
    // El jugador se detiene al tocar una estructura
    // La física de Phaser maneja automáticamente la colisión
  }

  /**
   * Maneja la colisión entre jugador y río
   */
  private handlePlayerRiverCollision(_river: Phaser.GameObjects.GameObject): void {
    // El jugador se detiene al tocar un río
    // La física de Phaser maneja automáticamente la colisión
  }

  /**
   * Maneja la colisión entre bala y enemigo
   */
  private handleBulletEnemyCollision(bullet: Phaser.GameObjects.Rectangle, enemy: Phaser.GameObjects.Rectangle): void {
    this.bulletManager.removeBullet(bullet);
    
    // Usar el nuevo sistema de daño
    const enemyDied = this.enemyManager.damageEnemy(enemy, 1);
    
    if (enemyDied) {
      // Enemigo eliminado
      this.experienceManager.createDiamond(enemy.x, enemy.y);
      this.scene.events.emit('enemyKilled', { score: 10 });

      this.visualEffects.createExplosionEffect(enemy.x, enemy.y);
      this.visualEffects.showScoreText(enemy.x, enemy.y, '+10');
    } else {
      // Enemigo dañado pero no eliminado
      const enemyType = enemy.getData('type');
      const remainingHealth = enemy.getData('health');
      
      if (enemyType === 'dasher') {
        this.visualEffects.showScoreText(enemy.x, enemy.y, `-${remainingHealth}`, '#8a2be2');
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
    this.visualEffects.createCollectionEffect(diamond.x, diamond.y, playerPos.x, playerPos.y);
    this.visualEffects.showScoreText(diamond.x, diamond.y, '+10 EXP', '#00ffff');

    const leveledUp = this.experienceManager.collectDiamond(diamond);

    if (leveledUp) {
      this.scene.events.emit('levelUp');
    }
  }

  /**
   * Limpia todos los recursos del manager
   */
  destroy(): void {
    this.collidingEnemies.clear();
    this.collidingBullets.clear();
    this.collidingDiamonds.clear();
  }
} 