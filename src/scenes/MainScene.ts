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
import { GameStateManager } from '../managers/GameStateManager';
import { StructureType } from '../managers/StructureManager';
import { SupplyBoxManager } from '../managers/SupplyBoxManager';
import { BandageManager } from '../managers/BandageManager';
import { DailyQuestManager } from '../managers/DailyQuestManager';
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
  public gameStateManager!: GameStateManager;
  private supplyBoxManager!: SupplyBoxManager;
  private bandageManager!: BandageManager;
  public dailyQuestManager!: DailyQuestManager;

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

  preload() {
    // Cargar imágenes de chunks para el WorldManager
    // En Vite, los assets en public/ se sirven directamente desde la raíz
    this.load.image('chunk1', 'assets/chunk1.png');
    this.load.image('chunk2', 'assets/chunk2.png');
    this.load.image('chunk3', 'assets/chunk3.png');
    this.load.image('chunk4', 'assets/chunk4.png');
    
    console.log('🖼️ Cargando imágenes de chunks...');
  }

  /**
   * Pausa el juego por el menú
   */
  public pauseGame(): void {
    console.log('🎮 MainScene.pauseGame() llamado');
    this.isPausedByMenu = true;
    this.timerManager.pause();
    
    // Pausar la escena de Phaser completamente
    this.scene.pause();
    
    console.log('🎮 Juego pausado por menú - isPausedByMenu:', this.isPausedByMenu);
  }

  /**
   * Reanuda el juego después del menú
   */
  public resumeGame(): void {
    console.log('🎮 MainScene.resumeGame() llamado');
    this.isPausedByMenu = false;
    this.timerManager.resume();
    
    // Reanudar la escena de Phaser
    this.scene.resume();
    
    console.log('🎮 Juego reanudado - isPausedByMenu:', this.isPausedByMenu);
  }

  create() {
    // Inicializar managers
    this.initializeManagers();

    // Configurar input
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    // Tecla especial para crear explosiones de prueba (solo para testing)
    this.input.keyboard!.on('keydown-SPACE', () => {
      if (!this.isGameOver && !this.isLevelingUp && !this.isPausedByMenu) {
        const playerPos = this.player.getPosition();
        console.log('🧪 Creando explosión de prueba con ESPACIO');
        this.explosionManager.createTestExplosion(playerPos.x + 50, playerPos.y);
      }
    });

    // Tecla B para usar vendaje rápidamente
    this.input.keyboard!.on('keydown-B', () => {
      if (!this.isGameOver && !this.isLevelingUp && !this.isPausedByMenu) {
        console.log('🩹 Usando vendaje con tecla B');
        this.useBandage();
      }
    });

    // Tecla V para debug - agregar 99 vendajes
    this.input.keyboard!.on('keydown-V', () => {
      if (!this.isGameOver && !this.isLevelingUp && !this.isPausedByMenu) {
        console.log('🩹 DEBUG: Agregando 99 vendajes');
        this.bandageManager.addMedicine(99);
        console.log(`🩹 Vendajes disponibles: ${this.bandageManager.getMedicineInventory()}`);
      }
    });

    // Configurar eventos
    this.setupEvents();

    // Inicializar sistemas
    this.initializeSystems();

    // Cargar efectos de NFT del usuario
    this.loadUserNFTEffects();

    console.log('🎮 MainScene inicializada con todos los managers');
    
    // Mostrar controles de debug disponibles
    console.log('🎮 === CONTROLES DE DEBUG DISPONIBLES ===');
    console.log('🎮 ESPACIO: Crear explosión de prueba');
    console.log('🎮 B: Usar vendaje rápidamente');
    console.log('🎮 V: Agregar 99 vendajes (debug)');
    console.log('🎮 Z: Ganar partida (debug)');
    console.log('🎮 X: Perder partida (debug)');
    console.log('🎮 ======================================');
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

    // Obtener userId para los managers
    const userId = this.getUserId() || 'default';

    // Inicializar SupplyBoxManager con userId
    this.supplyBoxManager = new SupplyBoxManager(this, userId);

    // Inicializar BandageManager
    this.bandageManager = new BandageManager(this, this.player);

    // Inicializar DailyQuestManager
    this.dailyQuestManager = new DailyQuestManager(
      this,
      this.player,
      this.enemyManager,
      this.experienceManager,
      this.supplyBoxManager,
      this.explosionManager,
      userId
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
      this.explosionManager,
      this.supplyBoxManager
    );

    // Inicializar GameStateManager - debe ir después de TimerManager y ExperienceManager
    this.gameStateManager = new GameStateManager(
      this,
      this.player,
      this.timerManager,
      this.experienceManager,
      this.uiManager,
      this.supplyBoxManager,
      this.dailyQuestManager,
      userId
    );

    // Conectar EnemyManager con SupplyBoxManager
    this.enemyManager.setSupplyBoxManager(this.supplyBoxManager);
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
      }
      // GameStateManager se encarga de onGameOver y onGameWin
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
    this.generateExplosiveBarrels(playerPos.x, playerPos.y, 8); // Aumentado de 5 a 8 barriles

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
    // Verificar estado del juego usando GameStateManager
    if (this.gameStateManager.isGameOverState() || this.isLevelingUp || this.isPausedByMenu) {
      // Debug: mostrar por qué se está pausando (solo ocasionalmente para no spam)
      if (Math.random() < 0.001) { // Solo 0.1% de las veces
        console.log('🎮 Update pausado:', {
          isGameOver: this.gameStateManager.isGameOverState(),
          isGameWon: this.gameStateManager.isGameWonState(),
          isLevelingUp: this.isLevelingUp,
          isPausedByMenu: this.isPausedByMenu
        });
      }
      return;
    }

    // Verificar condiciones de game over/win
    this.gameStateManager.checkPlayerDeath();
    this.gameStateManager.checkGameWin();

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
    this.supplyBoxManager.cleanupOffscreenBoxes(playerPos.x, playerPos.y);
    this.dailyQuestManager.update().catch(error => {
      console.error('❌ Error actualizando misiones diarias:', error);
    });

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
    if (this.gameStateManager.isGameOverState() || this.isLevelingUp || this.isPausedByMenu) return;

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

    // GameStateManager se encarga del evento gameOver

    // Evento para manejar balas que golpean barriles
    this.events.on('bulletHitBarrel', (bullet: Phaser.GameObjects.Rectangle) => {
      this.bulletManager.removeBullet(bullet);
    });

    // Eventos para misiones diarias
    this.events.on('questCompleted', (data: { quest: any; reward: number }) => {
      console.log(`🎯 Misión completada: ${data.quest.title} - Recompensa: ${data.reward} food`);
      // Aquí se puede agregar lógica adicional como efectos visuales, sonidos, etc.
    });

    this.events.on('allQuestsCompleted', (data: { totalReward: number; quests: any[] }) => {
              console.log(`🏆 ¡Todas las misiones diarias completadas! Recompensa total: ${data.totalReward} alimentos`);
      // Aquí se puede agregar lógica adicional para el bonus
    });

    // Evento para manejar medicina recolectada (deshabilitado - se obtiene del lobby)
    // this.events.on('medicineCollected', (data: { amount: number; total: number }) => {
    //   console.log(`🩹 Medicina recolectada: +${data.amount} (Total: ${data.total})`);
    //   this.bandageManager.addMedicine(data.amount);
    // });
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
        40,  // Radio mínimo de separación (reducido de 80 a 40)
        150, // Radio máximo de búsqueda (reducido de 300 a 150)
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
    
    // Pausar la escena de Phaser durante level up
    this.scene.pause();

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
   * Usa un vendaje para curar al jugador
   */
  public useBandage(): boolean {
    return this.bandageManager.useBandage();
  }

  /**
   * Obtiene las estadísticas del sistema de vendajes
   */
  public getBandageStats() {
    return this.bandageManager.getStats();
  }

  /**
   * Inicializa el inventario de medicina desde los datos de la sesión
   */
  public initializeBandageInventory(medicineAmount: number): void {
    this.bandageManager.initializeMedicineInventory(medicineAmount);
  }

  /**
   * Obtiene el inventario de medicina actual
   */
  public getMedicineInventory(): number {
    return this.bandageManager.getMedicineInventory();
  }

  /**
   * Obtiene las misiones diarias actuales
   */
  public getDailyQuests(): any[] {
    return this.dailyQuestManager.getDailyQuests();
  }

  /**
   * Obtiene el progreso de las misiones diarias
   */
  public getQuestProgress(): any {
    return this.dailyQuestManager.getQuestProgress();
  }

  /**
   * Obtiene las misiones completadas
   */
  public getCompletedQuests(): any[] {
    return this.dailyQuestManager.getCompletedQuests();
  }

  /**
   * Verifica si todas las misiones están completadas
   */
  public areAllQuestsCompleted(): boolean {
    return this.dailyQuestManager.areAllQuestsCompleted();
  }

  /**
   * Obtiene la recompensa total de las misiones
   */
  public getTotalQuestReward(): number {
    return this.dailyQuestManager.getTotalReward();
  }

  public getPermanentQuests(): any[] {
    return this.dailyQuestManager.getPermanentQuests();
  }

  public getAllQuests(): any[] {
    return this.dailyQuestManager.getAllQuests();
  }

  public rerollDailyQuests(): void {
    this.dailyQuestManager.rerollDailyQuests();
  }

  /**
   * Establece el ID de la sesión para las misiones diarias
   */
  public setQuestSessionId(sessionId: string): void {
    this.dailyQuestManager.setSessionId(sessionId);
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
    this.gameStateManager.destroy();
    this.supplyBoxManager.destroy();
    this.bandageManager.destroy();
    this.dailyQuestManager.destroy();

    console.log('🗑️ MainScene destruida');
  }
}