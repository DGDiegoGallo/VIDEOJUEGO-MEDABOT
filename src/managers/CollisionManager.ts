import { Scene } from 'phaser';
import { Player } from './Player';
import { EnemyManager } from './EnemyManager';
import { BulletManager } from './BulletManager';
import { ExperienceManager } from './ExperienceManager';
import { WorldManager } from './WorldManager';
import { VisualEffects } from './VisualEffects';
import { ExplosionManager } from './ExplosionManager';
import { SupplyBoxManager } from './SupplyBoxManager';
import { Structure, StructureType } from './StructureManager';

export class CollisionManager {
  private scene: Scene;
  private player: Player;
  private enemyManager: EnemyManager;
  private bulletManager: BulletManager;
  private experienceManager: ExperienceManager;
  private worldManager: WorldManager;
  private visualEffects: VisualEffects;
  private explosionManager: ExplosionManager;
  private supplyBoxManager: SupplyBoxManager | null = null;

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
    explosionManager: ExplosionManager,
    supplyBoxManager?: SupplyBoxManager
  ) {
    this.scene = scene;
    this.player = player;
    this.enemyManager = enemyManager;
    this.bulletManager = bulletManager;
    this.experienceManager = experienceManager;
    this.worldManager = worldManager;
    this.visualEffects = visualEffects;
    this.explosionManager = explosionManager;
    this.supplyBoxManager = supplyBoxManager || null;

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

    // Agregar estructuras actuales usando StructureManager - USANDO SPRITES DE COLISIÓN CORRECTOS
    const structures = this.worldManager.getPhysicsStructures();
    structures.forEach(structure => {
      // Verificar que la estructura aún existe antes de agregarla
      // Y que NO sea un barril explosivo (los barriles se manejan por separado)
      if (structure && structure.scene && structure.active && structure.getType() !== StructureType.EXPLOSIVE_BARREL) {
        // Usar el sprite de colisión específico si existe, sino usar la estructura completa
        const collisionSprite = structure.getCollisionSprite();
        const physicsObject = collisionSprite || structure;
        
        // Solo agregar si no está ya en el grupo (evitar duplicados)
        if (!this.structureGroup!.contains(physicsObject)) {
          this.structureGroup!.add(physicsObject);
        }
      }
    });

    // Agregar ríos actuales
    const rivers = this.worldManager.getPhysicsRivers();
    rivers.forEach(river => {
      // Verificar que el objeto aún existe antes de agregarlo
      if (river && river.scene && (river as any).active !== false) {
        this.riverGroup!.add(river);
      }
    });

    // Actualizar enemigos en el grupo
    if (this.enemyGroup) {
      this.enemyGroup.clear(false, false);
      const enemies = this.enemyManager.getEnemies();
      enemies.forEach(enemy => {
        // Verificar que el enemigo aún existe antes de agregarlo
        if (enemy && enemy.scene && (enemy as any).active !== false) {
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
      const structureManager = this.worldManager.getStructureManager();
      const stats = structureManager.getStats();
      console.log(`🔍 Colisiones NATIVAS: ${structures.length} estructuras (${JSON.stringify(stats.byType)}), ${rivers.length} ríos, jugador en (${Math.round(playerPos.x)}, ${Math.round(playerPos.y)})`);
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
    
    // CRÍTICO: Verificar colisiones con barriles explosivos ANTES que estructuras normales
    // para evitar procesamiento doble
    if (bullets.length > 0) {
      this.explosionManager.checkBulletBarrelCollisions(bullets);
    }
    
    // Verificar colisiones con estructuras normales (excluyendo barriles)
    this.checkBulletStructureCollisions(bullets);
    this.checkPlayerDiamondCollisions(playerPos, diamonds);
    
    // Verificar colisiones con cajas de suministros
    this.checkPlayerSupplyBoxCollisions(playerPos);
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
        this.scene.physics.overlap(bullet, this.structureGroup, (_, structureObj) => {
          this.collidingBullets.add(bullet);
          
          // Obtener la estructura original (puede ser el objeto directo o a través de parentStructure)
          const structure = (structureObj as any).parentStructure || structureObj as Structure;
          this.handleBulletStructureCollision(bullet, structure);
        });

        // Verificar colisión con grupo de ríos
        if (this.riverGroup) {
          this.scene.physics.overlap(bullet, this.riverGroup, (_, riverObj) => {
            this.collidingBullets.add(bullet);
            this.handleBulletRiverCollision(bullet, riverObj as Phaser.GameObjects.GameObject);
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
      // No emitir evento gameOver aquí - MainScene se encarga de esto
      console.log('💀 Jugador muerto - CollisionManager detectó muerte');
    }
  }

  /**
   * Maneja la colisión entre bala y enemigo
   */
  private handleBulletEnemyCollision(bullet: Phaser.GameObjects.Rectangle, enemy: Phaser.GameObjects.Rectangle): void {
    this.bulletManager.removeBullet(bullet);

    // Obtener información del enemigo ANTES de dañarlo
    const enemyType = enemy.getData('type') || 'zombie';
    const enemyX = enemy.x;
    const enemyY = enemy.y;

    // Usar el nuevo sistema de daño (false = no es explosión)
    const enemyDied = this.enemyManager.damageEnemy(enemy, 1, false);

    if (enemyDied) {
      // Solo notificar al ExperienceManager - él se encarga de todo
      this.experienceManager.onEnemyKilled(enemyX, enemyY, enemyType);
      
      // Calcular score basado en el tipo de enemigo para el sistema de puntuación
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
    } else {
      // Enemigo dañado pero no eliminado - solo efectos visuales
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
   * Maneja la colisión entre bala y estructura - ARREGLADO PARA EXCLUIR BARRILES
   */
  private handleBulletStructureCollision(bullet: Phaser.GameObjects.Rectangle, structure: Structure): void {
    // VERIFICACIÓN CRÍTICA: Si es un barril explosivo, no procesarlo aquí
    if (structure.getType() === StructureType.EXPLOSIVE_BARREL) {
      console.log(`⚠️ Barril explosivo detectado en colisión de estructura - ignorando (debe ser manejado por ExplosionManager)`);
      return;
    }

    this.bulletManager.removeBullet(bullet);
    this.visualEffects.createBulletHitEffect(bullet.x, bullet.y);

    console.log(`🎯 Bala golpea estructura ${structure.getType()} en (${Math.round(structure.x)}, ${Math.round(structure.y)})`);

    // Si la estructura es destructible, aplicar daño
    if (structure.isDestructible) {
      const wasDestroyed = structure.takeDamage(1);
      
      if (wasDestroyed) {
        // Remover estructura del WorldManager
        const structureManager = this.worldManager.getStructureManager();
        structureManager.removeStructure(structure);
        
        // Crear efecto de destrucción
        this.visualEffects.showScoreText(structure.x, structure.y, 'DESTROYED', '#ff6666');
      }
    }
  }

  /**
   * Maneja la colisión entre bala y río
   */
  private handleBulletRiverCollision(bullet: Phaser.GameObjects.Rectangle, _river: Phaser.GameObjects.GameObject): void {
    this.bulletManager.removeBullet(bullet);
    this.visualEffects.createBulletHitEffect(bullet.x, bullet.y);
  }

  /**
   * Maneja la colisión entre jugador y diamante
   */
  private handlePlayerDiamondCollision(diamond: Phaser.GameObjects.Polygon): void {
    const leveledUp = this.experienceManager.collectDiamond(diamond);

    if (leveledUp) {
      this.scene.events.emit('levelUp');
    }
  }

  /**
   * Verifica colisiones entre el jugador y las cajas de suministros
   * @param playerPos - Posición del jugador
   */
  private checkPlayerSupplyBoxCollisions(playerPos: { x: number; y: number }): void {
    if (!this.supplyBoxManager) return;

    const supplyBoxes = this.supplyBoxManager.getSupplyBoxes();
    const playerRadius = 12; // Radio del jugador

    supplyBoxes.forEach(supplyBox => {
      const distance = Phaser.Math.Distance.Between(playerPos.x, playerPos.y, supplyBox.x, supplyBox.y);
      const boxRadius = supplyBox.width / 2 || 16;

      if (distance < (playerRadius + boxRadius)) {
        // Recolectar la caja de suministros
        const boxData = this.supplyBoxManager!.collectSupplyBox(supplyBox);
        if (boxData) {
          console.log('📦 Jugador recolectó caja de suministros:', boxData.materials);
          // Emitir evento para mostrar modal SOLO cuando se recolecta
          this.scene.events.emit('supplyBoxCollected', boxData);
        }
      }
    });
  }

  /**
   * Fuerza la actualización inmediata de los grupos de física
   * Útil cuando se generan nuevos chunks o se cambia de área
   */
  public forceUpdatePhysicsGroups(): void {
    // SISTEMA SIMPLIFICADO: Los grupos de física son estáticos
    // No necesitan actualizaciones dinámicas
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