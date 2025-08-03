import { Scene } from 'phaser';
import { Player } from '../managers/Player';
import { EnemyManager } from '../managers/EnemyManager';
import { BulletManager } from '../managers/BulletManager';
import { ExperienceManager } from '../managers/ExperienceManager';
import { VisualEffects } from '../managers/VisualEffects';
import { WorldManager } from '../managers/WorldManager';
import { GameEffectsManager } from '../managers/GameEffectsManager';
import { CollisionManager } from '../managers/CollisionManager';
import { CameraManager } from '../managers/CameraManager';
import { TimerManager } from '../managers/TimerManager';
import { MinimapManager } from '../managers/MinimapManager';
import { UIManager } from '../managers/UIManager';
import { ExplosionManager } from '../managers/ExplosionManager';
import { StructureType } from '../managers/StructureManager';
import { SkillLevels, SkillOption, EnemyType } from '../types/game';

export class MainScene extends Scene {
  // Managers
  private player!: Player;
  private enemyManager!: EnemyManager;
  private bulletManager!: BulletManager;
  private experienceManager!: ExperienceManager;
  private visualEffects!: VisualEffects;
  private worldManager!: WorldManager;
  private gameEffectsManager!: GameEffectsManager;
  private collisionManager!: CollisionManager;
  private cameraManager!: CameraManager;
  private timerManager!: TimerManager;
  private minimapManager!: MinimapManager;
  private uiManager!: UIManager;
  private explosionManager!: ExplosionManager;

  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  // Game state
  private score: number = 0;
  private isGameOver: boolean = false;
  private isLevelingUp: boolean = false;
  private isPausedByMenu: boolean = false;

  // Skills system
  private skills: SkillLevels = {
    rapidFire: 0,
    magneticField: 0,
    multiShot: 0
  };

  constructor() {
    super({ key: 'MainScene' });
  }

  /**
   * Pausa el juego por el menú
   */
  public pauseGame(): void {
    this.isPausedByMenu = true;
    this.timerManager.pause();
    console.log('🎮 Juego pausado por menú');
  }

  /**
   * Reanuda el juego después del menú
   */
  public resumeGame(): void {
    this.isPausedByMenu = false;
    this.timerManager.resume();
    console.log('🎮 Juego reanudado');
  }

  create() {
    // Inicializar managers
    this.initializeManagers();

    // Configurar input
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Configurar eventos
    this.setupEvents();

    // Inicializar sistemas
    this.initializeSystems();

    // Cargar efectos de NFT del usuario
    this.loadUserNFTEffects();

    console.log('🎮 MainScene inicializada con todos los managers');
  }

  /**
   * Inicializa todos los managers
   */
  private initializeManagers(): void {
    this.worldManager = new WorldManager(this);
    this.player = new Player(this, 400, 300);
    this.enemyManager = new EnemyManager(this);
    this.bulletManager = new BulletManager(this);
    this.experienceManager = new ExperienceManager(this);
    this.visualEffects = new VisualEffects(this);
    this.gameEffectsManager = new GameEffectsManager();

    // Conectar Player con WorldManager para wraparound
    this.player.setWorldManager(this.worldManager);
    
    // Conectar EnemyManager con WorldManager para verificación de espacios libres
    this.enemyManager.setWorldManager(this.worldManager);

    // Inicializar managers especializados
    this.cameraManager = new CameraManager(this, this.player);
    this.timerManager = new TimerManager(this);
    this.minimapManager = new MinimapManager(this, this.worldManager, this.enemyManager, this.player);
    this.uiManager = new UIManager(
      this,
      this.player,
      this.experienceManager,
      this.enemyManager,
      this.timerManager,
      this.minimapManager,
      this.gameEffectsManager
    );

    // Inicializar ExplosionManager
    this.explosionManager = new ExplosionManager(
      this,
      this.player,
      this.enemyManager,
      this.worldManager,
      this.visualEffects
    );

    // Inicializar CollisionManager - CRÍTICO: debe ir después de todos los managers
    this.collisionManager = new CollisionManager(
      this,
      this.player,
      this.enemyManager,
      this.bulletManager,
      this.experienceManager,
      this.worldManager,
      this.visualEffects,
      this.explosionManager
    );
  }

  /**
   * Inicializa los sistemas del juego
   */
  private initializeSystems(): void {
    // Inicializar cámara
    this.cameraManager.startFollowing();

    // Inicializar timers
    this.timerManager.setCallbacks({
      onGameTimeUpdate: (gameTime) => {
        this.enemyManager.updateGameTime(gameTime);
        this.uiManager.forceUpdate();

        // Emitir evento de actualización de UI con formato correcto
        const uiData = this.uiManager.getData();
        const playerPos = this.player.getPosition();
        const minimapData = this.minimapManager.getData();

        const gameStats = {
          health: uiData.health.current,
          maxHealth: uiData.health.max,
          score: uiData.score,
          time: uiData.gameTime,
          experience: uiData.experience.current,
          maxExperience: uiData.experience.max,
          level: uiData.level,
          skills: uiData.skills,
          world: {
            playerX: playerPos.x,
            playerY: playerPos.y,
            activeChunks: minimapData.activeChunks.length,
            totalChunks: minimapData.worldSize,
            structures: 0
          },
          minimapData: minimapData,
          equipment: uiData.equipment
        };

        this.events.emit('updateUI', gameStats);
      },
      onShoot: () => {
        this.autoShoot();
      },
      onGameOver: () => {
        this.gameOver();
      },
      onGameWin: () => {
        this.gameWin();
      }
    });
    this.timerManager.createGameTimer();
    this.timerManager.createShootingTimer();

    // Inicializar spawn de enemigos con spawn múltiple
    this.enemyManager.startAutoSpawn(() => {
      const playerPos = this.player.getPosition();
      this.enemyManager.spawnMultipleEnemies(playerPos.x, playerPos.y);
    });

    // Inicializar GameEffectsManager
    this.gameEffectsManager.initialize(this.player, this.bulletManager, this.experienceManager);

    // Generar barriles explosivos iniciales usando StructureManager
    const playerPos = this.player.getPosition();
    this.generateExplosiveBarrels(playerPos.x, playerPos.y, 5);

    // Generar tanques de prueba en la primera zona
    console.log('🛡️ Generando tanques de prueba...');
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const distance = 200 + i * 50; // Diferentes distancias
      const tankX = playerPos.x + Math.cos(angle) * distance;
      const tankY = playerPos.y + Math.sin(angle) * distance;

      this.enemyManager.createEnemy(tankX, tankY, EnemyType.TANK);
      console.log(`🛡️ Tank creado en (${Math.round(tankX)}, ${Math.round(tankY)})`);
    }
  }

  update(_delta: number) {
    if (this.isGameOver || this.isLevelingUp || this.isPausedByMenu) return;

    // Manejar input del jugador
    this.player.handleInput(this.cursors);

    // Actualizar managers
    this.updateManagers();
  }

  // Contador para optimizar actualizaciones menos críticas
  private updateCounter: number = 0;

  // Seguimiento del chunk anterior para detectar cambios
  private lastChunkX: number = 0;
  private lastChunkY: number = 0;

  /**
   * Actualiza todos los managers - SISTEMA SIMPLIFICADO
   */
  private updateManagers(): void {
    const playerPos = this.player.getPosition();

    // Actualizaciones críticas (cada frame)
    this.bulletManager.updateBullets();
    this.collisionManager.checkAllCollisions();
    this.cameraManager.update();
    this.enemyManager.updateEnemies(playerPos.x, playerPos.y);
    this.experienceManager.updateDiamonds(playerPos.x, playerPos.y);

    // Incrementar contador
    this.updateCounter++;

    // Actualizaciones de limpieza (cada 5 frames) - SOLO BALAS
    if (this.updateCounter % 5 === 0) {
      this.bulletManager.cleanupOffscreenBullets(this.worldManager); // Solo balas se limpian
      this.enemyManager.cleanupOffscreenEnemies(); // Solo limpia inactivos
      this.experienceManager.cleanupOffscreenDiamonds(); // Solo limpia inactivos
      this.explosionManager.cleanupOffscreenBarrels(playerPos.x, playerPos.y);
    }

    // Actualizaciones de UI (cada 6 frames)
    if (this.updateCounter % 6 === 0) {
      const minimapData = this.minimapManager.update();
      const uiData = this.uiManager.update();

      // Transformar datos del UIManager al formato que espera GamePage
      const gameStats = {
        health: uiData.health.current,
        maxHealth: uiData.health.max,
        score: uiData.score,
        time: uiData.gameTime,
        experience: uiData.experience.current,
        maxExperience: uiData.experience.max,
        level: uiData.level,
        skills: uiData.skills,
        world: {
          playerX: playerPos.x,
          playerY: playerPos.y,
          activeChunks: minimapData.activeChunks.length,
          totalChunks: minimapData.worldSize,
          structures: this.worldManager.getStructureManager().getStats().total
        },
        minimapData: minimapData,
        equipment: uiData.equipment
      };

      // Emitir eventos de actualización
      this.events.emit('updateUI', gameStats);
    }

    // Debug de barriles cada 10 segundos (600 frames)
    if (this.updateCounter % 600 === 0) {
      const barrelStats = this.explosionManager.getBarrelStats();
      if (barrelStats.total > 0) {
        console.log(`🛢️ Barriles: ${barrelStats.healthy}/${barrelStats.active}/${barrelStats.total} (healthy/active/total)`);
        if (barrelStats.healthy > 0) {
          console.log(`🛢️ Posiciones: ${barrelStats.positions.slice(0, 3).map(p => `(${p.x},${p.y}:${p.health}HP)`).join(', ')}${barrelStats.positions.length > 3 ? '...' : ''}`);
        }
      }
    }

    // Resetear contador para evitar overflow
    if (this.updateCounter >= 60) {
      this.updateCounter = 0;
    }
  }

  /**
   * Dispara automáticamente hacia el enemigo más cercano
   */
  private autoShoot(): void {
    if (this.isGameOver || this.isLevelingUp || this.isPausedByMenu) return;

    const enemies = this.enemyManager.getEnemies();
    const playerPos = this.player.getPosition();

    if (enemies.length === 0) return;

    const closestEnemy = this.enemyManager.getClosestEnemy(playerPos.x, playerPos.y);

    if (closestEnemy) {
      this.bulletManager.shootAtEnemy(playerPos.x, playerPos.y, closestEnemy.x, closestEnemy.y);
    }
  }

  /**
   * Configura los eventos del juego
   */
  private setupEvents(): void {
    this.events.on('enemyKilled', (data: { score: number }) => {
      this.score += data.score;
      this.uiManager.addScore(data.score);

      // No re-emitir el evento para evitar bucle infinito
      // this.events.emit('enemyKilled', data);
    });

    this.events.on('levelUp', () => {
      this.levelUp();
    });

    this.events.on('gameOver', () => {
      this.gameOver();
    });

    // Evento para manejar balas que golpean barriles
    this.events.on('bulletHitBarrel', (bullet: Phaser.GameObjects.Rectangle) => {
      this.bulletManager.removeBullet(bullet);
    });
  }

  /**
   * Genera barriles explosivos usando el StructureManager con verificación de espacios libres
   */
  private generateExplosiveBarrels(centerX: number, centerY: number, count: number): void {
    let successfulBarrels = 0;
    const maxAttempts = count * 3; // Más intentos para encontrar posiciones libres

    for (let attempt = 0; attempt < maxAttempts && successfulBarrels < count; attempt++) {
      // Buscar posición libre usando WorldManager
      const freePosition = this.worldManager.findFreePositionForSpawn(
        centerX, 
        centerY, 
        80,  // Radio mínimo de separación
        300, // Radio máximo de búsqueda
        15,  // Intentos máximos
        true // Incluir ríos en verificación
      );

      if (freePosition) {
        this.worldManager.createStructureAt(freePosition.x, freePosition.y, StructureType.EXPLOSIVE_BARREL, {
          hasPhysics: true,
          isDestructible: true,
          health: 1
        });
        successfulBarrels++;
      }
    }

    if (successfulBarrels < count) {
      console.log(`⚠️ Solo se pudieron generar ${successfulBarrels}/${count} barriles explosivos debido a falta de espacio`);
    } else {
      console.log(`💥 Generados ${successfulBarrels} barriles explosivos usando StructureManager con verificación de espacios`);
    }
  }

  /**
   * Carga los efectos de NFTs del usuario autenticado
   */
  private async loadUserNFTEffects(): Promise<void> {
    try {
      if (this.gameEffectsManager) {
        console.log('🎮 Loading user NFT effects...');
        
        // Obtener el ID del usuario desde el contexto global o localStorage
        const userId = this.getUserId();
        if (userId) {
          await this.gameEffectsManager.loadUserEffects(userId);
          console.log('✅ User NFT effects loaded successfully');
        } else {
          console.warn('⚠️ No user ID found, skipping NFT effects');
        }
      }
    } catch (error) {
      console.error('❌ Error loading user NFT effects:', error);
    }
  }

  /**
   * Obtiene el ID del usuario desde el contexto global
   */
  private getUserId(): string | number | null {
    // Intentar obtener desde window.user (si existe)
    if (typeof window !== 'undefined' && (window as any).user?.id) {
      return (window as any).user.id;
    }
    
    // Intentar obtener desde localStorage
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id;
      }
    } catch (error) {
      console.warn('⚠️ Error parsing user data from localStorage:', error);
    }
    
    // Valor por defecto para testing (usuario 78 según los logs)
    return 78;
  }

  /**
   * Maneja la subida de nivel
   */
  private levelUp(): void {
    if (this.isLevelingUp) return;

    this.isLevelingUp = true;
    this.timerManager.pauseForLevelUp();

    // Crear efecto visual de subida de nivel
    const playerPos = this.player.getPosition();
    this.visualEffects.createLevelUpEffect(playerPos.x, playerPos.y);

    // Emitir evento para mostrar modal de habilidades
    this.events.emit('levelUpModal', {
      level: this.experienceManager.getLevel(),
      skills: this.getAvailableSkills(),
      currentSkills: this.skills
    });
  }

  /**
   * Obtiene las habilidades disponibles para subir de nivel
   */
  private getAvailableSkills(): SkillOption[] {
    const availableSkills: SkillOption[] = [];

    // Disparo Rápido
    if (this.skills.rapidFire < 3) {
      availableSkills.push({
        id: 'rapidFire',
        name: 'Disparo Rápido',
        description: `Reduce el intervalo de disparo en ${(this.skills.rapidFire + 1) * 50}ms`,
        icon: '⚡',
        currentLevel: this.skills.rapidFire,
        maxLevel: 3,
        effect: 'fireRate'
      });
    }

    // Campo Magnético
    if (this.skills.magneticField < 3) {
      availableSkills.push({
        id: 'magneticField',
        name: 'Campo Magnético',
        description: `Aumenta el rango de atracción de diamantes en ${(this.skills.magneticField + 1) * 20}px`,
        icon: '🧲',
        currentLevel: this.skills.magneticField,
        maxLevel: 3,
        effect: 'magneticRange'
      });
    }

    // Disparo Múltiple
    if (this.skills.multiShot < 3) {
      availableSkills.push({
        id: 'multiShot',
        name: 'Disparo Múltiple',
        description: `Dispara ${(this.skills.multiShot + 1) + 1} balas simultáneamente`,
        icon: '🎯',
        currentLevel: this.skills.multiShot,
        maxLevel: 3,
        effect: 'projectileCount'
      });
    }

    return availableSkills;
  }

  /**
   * Selecciona una habilidad para subir de nivel
   * @param skillId - ID de la habilidad seleccionada
   */
  public selectSkill(skillId: string): void {
    if (this.skills[skillId as keyof SkillLevels] !== undefined) {
      this.skills[skillId as keyof SkillLevels]++;

      // Actualizar efectos del juego
      this.gameEffectsManager.updateGameSkills(this.skills);

      // El intervalo de disparo se actualiza automáticamente via GameEffectsManager
      // No necesitamos actualizar manualmente aquí

      // El número de balas se actualiza automáticamente via GameEffectsManager
      // No necesitamos actualizar manualmente aquí

      console.log(`🎯 Habilidad ${skillId} mejorada a nivel ${this.skills[skillId as keyof SkillLevels]}`);
    }

    // Reanudar el juego
    this.isLevelingUp = false;
    this.timerManager.resumeAfterLevelUp();
    this.scene.resume();
  }

  /**
   * Destruye la escena y limpia recursos
   */
  destroy() {
    // Destruir managers
    this.player.destroy();
    this.enemyManager.destroy();
    this.bulletManager.destroy();
    this.experienceManager.destroy();
    this.visualEffects.destroy();
    this.worldManager.destroy();
    this.gameEffectsManager.destroy();
    this.collisionManager.destroy();
    this.cameraManager.destroy();
    this.timerManager.destroy();
    this.minimapManager.destroy();
    this.uiManager.destroy();
    this.explosionManager.destroy();

    console.log('🗑️ MainScene destruida');
  }

  /**
   * Maneja el game over
   */
  private gameOver(): void {
    if (this.isGameOver) return;

    this.isGameOver = true;
    this.timerManager.stop();

    console.log('💀 Game Over - Puntaje final:', this.score);

    // Emitir evento de game over
    this.events.emit('gameOver', {
      score: this.score,
      gameTime: this.timerManager.getGameTime(),
      level: this.experienceManager.getLevel()
    });
  }

  /**
   * Maneja la victoria del juego
   */
  private gameWin(): void {
    console.log('🏆 ¡Victoria! - Puntaje final:', this.score);

    // Emitir evento de victoria
    this.events.emit('gameWin', {
      score: this.score,
      gameTime: this.timerManager.getGameTime(),
      level: this.experienceManager.getLevel()
    });
  }
}