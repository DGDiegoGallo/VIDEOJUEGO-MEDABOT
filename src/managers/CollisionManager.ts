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

    // Log de diagnóstico cada 2 segundos aprox
    if (Math.random() < 0.008) { // ~1/120
      console.log(`🔍 Colisiones: ${structures.length} estructuras, ${rivers.length} ríos, jugador en (${Math.round(playerPos.x)}, ${Math.round(playerPos.y)})`);
    }

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

    // Verificar colisiones de enemigos con estructuras y ríos
    this.checkEnemyStructureCollisions(enemies, structures);
    this.checkEnemyRiverCollisions(enemies, rivers);
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
   * Verifica colisiones entre jugador y estructuras - PARED SÓLIDA
   */
  private checkPlayerStructureCollisions(playerPos: { x: number; y: number }, structures: Phaser.GameObjects.GameObject[]): void {
    const playerRadius = 12;
    const playerSprite = this.player.getSprite();
    if (!playerSprite) return;

    let isColliding = false;

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
        isColliding = true;
        this.handlePlayerStructureCollision(playerSprite, structure);
      }
    });

    // Si no está colisionando con ninguna estructura, permitir movimiento normal
    if (!isColliding) {
      // El jugador puede moverse libremente
    }
  }

  /**
   * Verifica colisiones entre jugador y ríos - PARED SÓLIDA
   */
  private checkPlayerRiverCollisions(playerPos: { x: number; y: number }, rivers: Phaser.GameObjects.GameObject[]): void {
    const playerRadius = 12;
    const playerSprite = this.player.getSprite();
    if (!playerSprite) return;

    let isColliding = false;

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
        isColliding = true;
        this.handlePlayerRiverCollision(playerSprite, river);
      }
    });

    // Si no está colisionando con ningún río, permitir movimiento normal
    if (!isColliding) {
      // El jugador puede moverse libremente
    }
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
   * Verifica colisiones entre enemigos y estructuras
   */
  private checkEnemyStructureCollisions(enemies: Phaser.GameObjects.Rectangle[], structures: Phaser.GameObjects.GameObject[]): void {
    enemies.forEach(enemy => {
      let isColliding = false;

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

        const enemyRadius = enemy.width / 2 || 12;
        const enemyBounds = new Phaser.Geom.Rectangle(
          enemy.x - enemyRadius,
          enemy.y - enemyRadius,
          enemyRadius * 2,
          enemyRadius * 2
        );

        if (Phaser.Geom.Rectangle.Overlaps(enemyBounds, structureBounds)) {
          isColliding = true;
          this.handleEnemyStructureCollision(enemy, structure);
        }
      });
    });
  }

  /**
   * Verifica colisiones entre enemigos y ríos
   */
  private checkEnemyRiverCollisions(enemies: Phaser.GameObjects.Rectangle[], rivers: Phaser.GameObjects.GameObject[]): void {
    enemies.forEach(enemy => {
      let isColliding = false;

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

        const enemyRadius = enemy.width / 2 || 12;
        const enemyBounds = new Phaser.Geom.Rectangle(
          enemy.x - enemyRadius,
          enemy.y - enemyRadius,
          enemyRadius * 2,
          enemyRadius * 2
        );

        if (Phaser.Geom.Rectangle.Overlaps(enemyBounds, riverBounds)) {
          isColliding = true;
          this.handleEnemyRiverCollision(enemy, river);
        }
      });
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
   * Maneja la colisión entre jugador y estructura - DETENER + SEPARAR MÍNIMO
   */
  private handlePlayerStructureCollision(playerSprite: Phaser.GameObjects.Rectangle, structure: Phaser.GameObjects.GameObject): void {
    const body = playerSprite.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    // DETENER COMPLETAMENTE
    body.setVelocity(0, 0);

    // Separar SOLO lo necesario para salir del overlap
    this.separateFromObstacle(playerSprite, structure, 12); // Radio del jugador
  }

  /**
   * Maneja la colisión entre jugador y río - DETENER + SEPARAR MÍNIMO
   */
  private handlePlayerRiverCollision(playerSprite: Phaser.GameObjects.Rectangle, river: Phaser.GameObjects.GameObject): void {
    const body = playerSprite.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    // DETENER COMPLETAMENTE
    body.setVelocity(0, 0);

    // Separar SOLO lo necesario para salir del overlap
    this.separateFromObstacle(playerSprite, river, 12); // Radio del jugador
  }

  /**
   * Maneja la colisión entre enemigo y estructura - DETENER + SEPARAR MÍNIMO
   */
  private handleEnemyStructureCollision(enemy: Phaser.GameObjects.Rectangle, structure: Phaser.GameObjects.GameObject): void {
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    // DETENER COMPLETAMENTE
    body.setVelocity(0, 0);

    // Separar SOLO lo necesario para salir del overlap
    const enemyRadius = enemy.width / 2 || 12;
    this.separateFromObstacle(enemy, structure, enemyRadius);
  }

  /**
   * Maneja la colisión entre enemigo y río - DETENER + SEPARAR MÍNIMO
   */
  private handleEnemyRiverCollision(enemy: Phaser.GameObjects.Rectangle, river: Phaser.GameObjects.GameObject): void {
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    // DETENER COMPLETAMENTE
    body.setVelocity(0, 0);

    // Separar SOLO lo necesario para salir del overlap
    const enemyRadius = enemy.width / 2 || 12;
    this.separateFromObstacle(enemy, river, enemyRadius);
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
        this.visualEffects.showScoreText(enemy.x, enemy.y, `HP: ${remainingHealth}`, '#8a2be2');
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
    this.visualEffects.createCollectionEffect(diamond.x, diamond.y, playerPos.x, playerPos.y);
    this.visualEffects.showScoreText(diamond.x, diamond.y, '+10 EXP', '#00ffff');

    const leveledUp = this.experienceManager.collectDiamond(diamond);

    if (leveledUp) {
      this.scene.events.emit('levelUp');
    }
  }

  /**
   * Separa un objeto del obstáculo SOLO lo necesario para evitar overlap
   * @param gameObject - Objeto a separar
   * @param obstacle - Obstáculo del cual separar
   * @param objectRadius - Radio del objeto
   */
  private separateFromObstacle(
    gameObject: Phaser.GameObjects.Rectangle,
    obstacle: Phaser.GameObjects.GameObject,
    objectRadius: number
  ): void {
    // Obtener bounds del obstáculo
    let obstacleBounds: Phaser.Geom.Rectangle;

    if ('getBounds' in obstacle && typeof obstacle.getBounds === 'function') {
      obstacleBounds = obstacle.getBounds();
    } else {
      obstacleBounds = new Phaser.Geom.Rectangle(
        (obstacle as any).x || 0,
        (obstacle as any).y || 0,
        (obstacle as any).width || 32,
        (obstacle as any).height || 32
      );
    }

    // Calcular la distancia mínima necesaria para separar
    const objX = gameObject.x;
    const objY = gameObject.y;
    const obsX = obstacleBounds.x + obstacleBounds.width / 2;
    const obsY = obstacleBounds.y + obstacleBounds.height / 2;

    // Calcular overlap en cada dirección
    const overlapLeft = (objX + objectRadius) - obstacleBounds.left;
    const overlapRight = obstacleBounds.right - (objX - objectRadius);
    const overlapTop = (objY + objectRadius) - obstacleBounds.top;
    const overlapBottom = obstacleBounds.bottom - (objY - objectRadius);

    // Encontrar la separación mínima (menor overlap)
    const minOverlapX = Math.min(overlapLeft, overlapRight);
    const minOverlapY = Math.min(overlapTop, overlapBottom);

    if (minOverlapX < minOverlapY) {
      // Separar horizontalmente
      if (overlapLeft < overlapRight) {
        // Mover hacia la izquierda
        gameObject.setPosition(obstacleBounds.left - objectRadius - 1, objY);
      } else {
        // Mover hacia la derecha
        gameObject.setPosition(obstacleBounds.right + objectRadius + 1, objY);
      }
    } else {
      // Separar verticalmente
      if (overlapTop < overlapBottom) {
        // Mover hacia arriba
        gameObject.setPosition(objX, obstacleBounds.top - objectRadius - 1);
      } else {
        // Mover hacia abajo
        gameObject.setPosition(objX, obstacleBounds.bottom + objectRadius + 1);
      }
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