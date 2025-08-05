import { Scene } from 'phaser';
import { Player } from './Player';
import { EnemyManager } from './EnemyManager';
import { ExperienceManager } from './ExperienceManager';
import { SupplyBoxManager } from './SupplyBoxManager';
import { ExplosionManager } from './ExplosionManager';
import { dailyQuestService } from '../services/dailyQuestService';

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  target: number;
  progress: number;
  reward: number; // Cantidad de food
  completed: boolean;
  completedAt?: string;
}

export enum QuestType {
  KILL_ENEMIES = 'kill_enemies',
  KILL_ZOMBIES = 'kill_zombies',
  KILL_DASHERS = 'kill_dashers',
  KILL_TANKS = 'kill_tanks',
  REACH_LEVEL = 'reach_level',
  SURVIVE_TIME = 'survive_time',
  COLLECT_SUPPLY_BOXES = 'collect_supply_boxes',
  DESTROY_BARRELS = 'destroy_barrels',
  USE_BANDAGES = 'use_bandages',
  GAIN_LEVELS = 'gain_levels',
  // Misiones permanentes de armas
  GET_IMPROVED_MACHINEGUN = 'get_improved_machinegun',
  GET_GRENADE_LAUNCHER = 'get_grenade_launcher',
  GET_LASER_RIFLE = 'get_laser_rifle'
}

export interface QuestProgress {
  // Estadísticas básicas existentes
  enemiesKilled: number;
  zombiesKilled: number;
  dashersKilled: number;
  tanksKilled: number;
  currentLevel: number;
  survivalTime: number;
  supplyBoxesCollected: number;
  barrelsDestroyed: number;
  bandagesUsed: number;
  levelsGained: number;
  
  // Progreso de misiones permanentes
  hasImprovedMachinegun: boolean;
  hasGrenadeLauncher: boolean;
  hasLaserRifle: boolean;
  
  // Nuevos campos para coincidir con session_stats de Strapi
  totalDamageDealt: number;
  totalDamageReceived: number;
  shotsFired: number;
  shotsHit: number;
  accuracyPercentage: number;
  finalScore: number;
  gamesPlayedTotal: number;
  victoriesTotal: number;
  defeatsTotal: number;
}

export class DailyQuestManager {
  private scene: Scene;
  private player: Player;
  private enemyManager: EnemyManager;
  private experienceManager: ExperienceManager;
  private supplyBoxManager: SupplyBoxManager;
  private explosionManager: ExplosionManager;
  private userId: string | number;
  private sessionDocumentId: string | null = null;

  private dailyQuests: DailyQuest[] = [];
  private permanentQuests: DailyQuest[] = [];
  private questProgress: QuestProgress = {
    enemiesKilled: 0,
    zombiesKilled: 0,
    dashersKilled: 0,
    tanksKilled: 0,
    currentLevel: 1,
    survivalTime: 0,
    supplyBoxesCollected: 0,
    barrelsDestroyed: 0,
    bandagesUsed: 0,
    levelsGained: 0,
    hasImprovedMachinegun: false,
    hasGrenadeLauncher: false,
    hasLaserRifle: false,
    totalDamageDealt: 0,
    totalDamageReceived: 0,
    shotsFired: 0,
    shotsHit: 0,
    accuracyPercentage: 0,
    finalScore: 0,
    gamesPlayedTotal: 0,
    victoriesTotal: 0,
    defeatsTotal: 0
  };

  private lastQuestCheck: number = 0;
  private questCheckInterval: number = 500; // Verificar cada 500ms en lugar de 1000ms

  constructor(
    scene: Scene,
    player: Player,
    enemyManager: EnemyManager,
    experienceManager: ExperienceManager,
    supplyBoxManager: SupplyBoxManager,
    explosionManager: ExplosionManager,
    userId: string | number
  ) {
    this.scene = scene;
    this.player = player;
    this.enemyManager = enemyManager;
    this.experienceManager = experienceManager;
    this.supplyBoxManager = supplyBoxManager;
    this.explosionManager = explosionManager;
    this.userId = userId;

    this.initializeQuests();
    this.initializePermanentQuests();
    this.setupEventListeners();
  }

  /**
   * Inicializa las misiones diarias
   */
  private initializeQuests(): void {
    const storedQuests = this.getStoredQuests();
    
    console.log('🎯 DailyQuestManager: Intentando cargar misiones para userId:', this.userId);
    console.log('🎯 DailyQuestManager: Misiones almacenadas:', storedQuests);
    
    // Cargar misiones si existen para este usuario
    if (storedQuests.quests.length > 0 && storedQuests.userId === this.userId) {
      this.dailyQuests = storedQuests.quests;
      console.log('📋 Misiones cargadas desde localStorage:', this.dailyQuests);
    } else {
      console.log('🎯 No se encontraron misiones en localStorage, generando nuevas...');
      this.generateDailyQuests();
    }

    // Cargar progreso guardado
    this.loadQuestProgress();
    console.log('🎯 DailyQuestManager: Progreso cargado:', this.questProgress);
  }

  /**
   * Genera 3 misiones diarias aleatorias
   */
  public generateDailyQuests(): void {
    const questTemplates = [
      {
        type: QuestType.KILL_ENEMIES,
        titles: ['Exterminador', 'Cazador de Enemigos', 'Guerrero Implacable'],
        descriptions: ['Elimina {target} enemigos', 'Derrota {target} enemigos', 'Acaba con {target} enemigos'],
        targets: [1, 1, 1, 1], // Muy fácil para testing
        rewards: [1, 2, 3]
      },
      {
        type: QuestType.KILL_ZOMBIES,
        titles: ['Cazador de Zombies', 'Exterminador de No-Muertos', 'Guardián de la Vida'],
        descriptions: ['Elimina {target} zombies', 'Derrota {target} zombies', 'Acaba con {target} zombies'],
        targets: [1, 1, 1, 1], // Muy fácil para testing
        rewards: [1, 2, 3]
      },
      {
        type: QuestType.KILL_DASHERS,
        titles: ['Cazador de Velocistas', 'Detector de Dashers', 'Perseguidor Implacable'],
        descriptions: ['Elimina {target} dashers', 'Derrota {target} dashers', 'Acaba con {target} dashers'],
        targets: [1, 1, 1, 1], // Muy fácil para testing
        rewards: [2, 3, 4]
      },
      {
        type: QuestType.KILL_TANKS,
        titles: ['Destructor de Tanques', 'Cazador de Blindados', 'Guerrero Anti-Tanque'],
        descriptions: ['Elimina {target} tanques', 'Derrota {target} tanques', 'Acaba con {target} tanques'],
        targets: [1, 1, 1, 1], // Muy fácil para testing
        rewards: [2, 3, 4]
      },
      {
        type: QuestType.REACH_LEVEL,
        titles: ['Ascenso de Poder', 'Maestro de Habilidades', 'Evolución Constante'],
        descriptions: ['Alcanza el nivel {target}', 'Llega al nivel {target}', 'Sube al nivel {target}'],
        targets: [1, 1, 1, 1], // Muy fácil para testing
        rewards: [2, 3, 4]
      },
      {
        type: QuestType.SURVIVE_TIME,
        titles: ['Superviviente', 'Resistente', 'Guardián del Tiempo'],
        descriptions: ['Sobrevive {target} segundos', 'Mantente vivo {target} segundos', 'Resiste {target} segundos'],
        targets: [5, 5, 5, 5], // Muy fácil para testing (5 segundos)
        rewards: [1, 2, 3]
      },
      {
        type: QuestType.COLLECT_SUPPLY_BOXES,
        titles: ['Recolector', 'Buscador de Suministros', 'Proveedor'],
        descriptions: ['Recolecta {target} cajas de suministros', 'Encuentra {target} cajas', 'Obtén {target} suministros'],
        targets: [1, 1, 1, 1], // Muy fácil para testing
        rewards: [1, 2, 3]
      },
      {
        type: QuestType.DESTROY_BARRELS,
        titles: ['Demoledor', 'Destructor de Barriles', 'Explosivo'],
        descriptions: ['Destruye {target} barriles', 'Explota {target} barriles', 'Acaba con {target} barriles'],
        targets: [1, 1, 1, 1], // Muy fácil para testing
        rewards: [1, 2, 3]
      },
      {
        type: QuestType.USE_BANDAGES,
        titles: ['Sanador', 'Médico de Campo', 'Curador'],
        descriptions: ['Usa {target} vendajes', 'Aplica {target} vendajes', 'Utiliza {target} vendajes'],
        targets: [1, 1, 1, 1], // Muy fácil para testing
        rewards: [1, 2, 3]
      },
      {
        type: QuestType.GAIN_LEVELS,
        titles: ['Ascenso Rápido', 'Evolución Constante', 'Maestro de Poder'],
        descriptions: ['Sube {target} niveles', 'Alcanza {target} niveles más', 'Gana {target} niveles'],
        targets: [1, 1, 1, 1], // Muy fácil para testing
        rewards: [2, 3, 4]
      }
    ];

    // Seleccionar 3 misiones aleatorias
    const selectedTemplates = this.shuffleArray([...questTemplates]).slice(0, 3);
    
    this.dailyQuests = selectedTemplates.map((template, index) => {
      const titleIndex = Math.floor(Math.random() * template.titles.length);
      const descIndex = Math.floor(Math.random() * template.descriptions.length);
      const targetIndex = Math.floor(Math.random() * template.targets.length);
      const rewardIndex = Math.floor(Math.random() * template.rewards.length);

      return {
        id: `quest_${index + 1}`,
        title: template.titles[titleIndex],
        description: template.descriptions[descIndex].replace('{target}', template.targets[targetIndex].toString()),
        type: template.type,
        target: template.targets[targetIndex],
        progress: 0,
        reward: template.rewards[rewardIndex],
        completed: false
      };
    });

    // Guardar las nuevas misiones
    this.saveQuests();
  }

  /**
   * Inicializa las misiones permanentes
   */
  private initializePermanentQuests(): void {
    this.permanentQuests = [
      {
        id: 'permanent_1',
        title: 'Ametralladora Mejorada',
        description: 'Consigue la Ametralladora Mejorada',
        type: QuestType.GET_IMPROVED_MACHINEGUN,
        target: 1,
        progress: 0,
        reward: 5, // 5 alimentos
        completed: false
      },
      {
        id: 'permanent_2',
        title: 'Lanzagranadas',
        description: 'Consigue el Lanzagranadas',
        type: QuestType.GET_GRENADE_LAUNCHER,
        target: 1,
        progress: 0,
        reward: 8, // 8 alimentos
        completed: false
      },
      {
        id: 'permanent_3',
        title: 'Rifle Láser',
        description: 'Consigue el Rifle Láser',
        type: QuestType.GET_LASER_RIFLE,
        target: 1,
        progress: 0,
        reward: 10, // 10 alimentos
        completed: false
      }
    ];
  }

  /**
   * Configura los listeners de eventos para actualizar progreso
   */
  private setupEventListeners(): void {
    // Enemigo eliminado
    this.scene.events.on('enemyKilled', (data: { enemyType: string }) => {
      this.questProgress.enemiesKilled++;
      
      switch (data.enemyType) {
        case 'zombie':
          this.questProgress.zombiesKilled++;
          break;
        case 'dasher':
          this.questProgress.dashersKilled++;
          break;
        case 'tank':
          this.questProgress.tanksKilled++;
          break;
      }
      
      // Actualizar progreso en localStorage inmediatamente
      this.saveQuestProgress();
    });

    // Caja de suministros recolectada
    this.scene.events.on('supplyBoxCollected', () => {
      this.questProgress.supplyBoxesCollected++;
      this.saveQuestProgress();
    });

    // Barril destruido
    this.scene.events.on('barrelDestroyed', () => {
      this.questProgress.barrelsDestroyed++;
      this.saveQuestProgress();
    });

    // Vendaje usado
    this.scene.events.on('bandageUsed', () => {
      this.questProgress.bandagesUsed++;
      this.saveQuestProgress();
    });

    // Nivel ganado
    this.scene.events.on('levelUp', () => {
      this.questProgress.currentLevel = this.experienceManager.getLevel();
      this.questProgress.levelsGained++;
      this.saveQuestProgress();
    });

    // NUEVOS EVENTOS PARA COMPLETAR ESTADÍSTICAS
    
    // Disparo realizado - emitir desde MainScene autoShoot
    this.scene.events.on('bulletFired', (data?: { bulletsCount?: number }) => {
      const bulletCount = data?.bulletsCount || 1;
      this.questProgress.shotsFired += bulletCount;
      this.updateAccuracy();
      this.saveQuestProgress();
      console.log(`🔫 Disparos registrados: +${bulletCount} (Total: ${this.questProgress.shotsFired})`);
    });

    // Bala impacta enemigo - emitir desde CollisionManager
    this.scene.events.on('bulletHit', (data?: { damage?: number }) => {
      this.questProgress.shotsHit++;
      if (data?.damage) {
        this.questProgress.totalDamageDealt += data.damage;
      }
      this.updateAccuracy();
      this.saveQuestProgress();
      console.log(`🎯 Impacto registrado: ${this.questProgress.shotsHit}/${this.questProgress.shotsFired} (${this.questProgress.accuracyPercentage.toFixed(1)}%)`);
    });

    // Jugador recibe daño - emitir desde Player/CollisionManager
    this.scene.events.on('playerDamaged', (data: { damage: number }) => {
      this.questProgress.totalDamageReceived += data.damage;
      this.saveQuestProgress();
      console.log(`💔 Daño recibido: +${data.damage} (Total: ${this.questProgress.totalDamageReceived})`);
    });

    // Actualización de score - emitir desde MainScene/UIManager
    this.scene.events.on('scoreUpdate', (data: { score: number }) => {
      this.questProgress.finalScore = data.score;
      // No guardar en cada actualización de score para evitar spam
    });

    // Victoria del juego
    this.scene.events.on('gameWin', () => {
      this.questProgress.victoriesTotal++;
      this.questProgress.gamesPlayedTotal++;
      this.saveQuestProgress();
      console.log(`🏆 Victoria registrada: ${this.questProgress.victoriesTotal} victorias de ${this.questProgress.gamesPlayedTotal} juegos`);
    });

    // Derrota del juego
    this.scene.events.on('gameOver', () => {
      this.questProgress.defeatsTotal++;
      this.questProgress.gamesPlayedTotal++;
      this.saveQuestProgress();
      console.log(`💀 Derrota registrada: ${this.questProgress.defeatsTotal} derrotas de ${this.questProgress.gamesPlayedTotal} juegos`);
    });
  }

  /**
   * Actualiza el porcentaje de precisión
   */
  private updateAccuracy(): void {
    if (this.questProgress.shotsFired > 0) {
      this.questProgress.accuracyPercentage = (this.questProgress.shotsHit / this.questProgress.shotsFired) * 100;
    } else {
      this.questProgress.accuracyPercentage = 0;
    }
  }

  /**
   * Actualiza el progreso de las misiones
   */
  public async update(): Promise<void> {
    const currentTime = Date.now();
    
    // Verificar progreso cada segundo
    if (currentTime - this.lastQuestCheck >= this.questCheckInterval) {
      this.lastQuestCheck = currentTime;
      
      // Actualizar tiempo de supervivencia
      this.questProgress.survivalTime = this.scene.time.now / 1000; // Convertir a segundos
      
      // Actualizar nivel actual
      this.questProgress.currentLevel = this.experienceManager.getLevel();
      
      // Actualizar score final (obtenido desde UIManager)
      const uiData = (this.scene as any).uiManager?.getData();
      if (uiData?.score !== undefined) {
        this.questProgress.finalScore = uiData.score;
      }
      
      // Verificar progreso de misiones diarias
      await this.checkQuestProgress();
      
      // Verificar progreso de misiones permanentes
      this.checkPermanentQuestProgress();
      
      // Guardar progreso
      this.saveQuestProgress();
    }
  }

  /**
   * Verifica el progreso de todas las misiones
   */
  public async checkQuestProgress(): Promise<void> {
    let hasNewCompletion = false;

    console.log('🎯 DailyQuestManager: Verificando progreso de misiones...');
    console.log('🎯 DailyQuestManager: Misiones diarias:', this.dailyQuests);
    console.log('🎯 DailyQuestManager: Progreso actual:', this.questProgress);

    for (const quest of this.dailyQuests) {
      if (quest.completed) {
        console.log(`🎯 Misión ya completada: ${quest.title}`);
        continue;
      }

      let currentProgress = 0;

      switch (quest.type) {
        case QuestType.KILL_ENEMIES:
          currentProgress = this.questProgress.enemiesKilled;
          break;
        case QuestType.KILL_ZOMBIES:
          currentProgress = this.questProgress.zombiesKilled;
          break;
        case QuestType.KILL_DASHERS:
          currentProgress = this.questProgress.dashersKilled;
          break;
        case QuestType.KILL_TANKS:
          currentProgress = this.questProgress.tanksKilled;
          break;
        case QuestType.REACH_LEVEL:
          currentProgress = this.questProgress.currentLevel;
          break;
        case QuestType.SURVIVE_TIME:
          currentProgress = Math.floor(this.questProgress.survivalTime);
          break;
        case QuestType.COLLECT_SUPPLY_BOXES:
          currentProgress = this.questProgress.supplyBoxesCollected;
          break;
        case QuestType.DESTROY_BARRELS:
          currentProgress = this.questProgress.barrelsDestroyed;
          break;
        case QuestType.USE_BANDAGES:
          currentProgress = this.questProgress.bandagesUsed;
          break;
        case QuestType.GAIN_LEVELS:
          currentProgress = this.questProgress.levelsGained;
          break;
      }

      // ACTUALIZAR EL PROGRESO EN LA MISIÓN EN TIEMPO REAL
      quest.progress = currentProgress;

      console.log(`🎯 Misión: ${quest.title} (${quest.type}) - Progreso: ${quest.progress}/${quest.target} - Completada: ${quest.completed}`);

      // Verificar si se completó
      if (quest.progress >= quest.target && !quest.completed) {
        quest.completed = true;
        quest.completedAt = new Date().toISOString();
        hasNewCompletion = true;

        console.log(`🎯 Misión completada: ${quest.title} - Recompensa: ${quest.reward} alimentos`);
        
        // Emitir evento de misión completada
        this.scene.events.emit('questCompleted', {
          quest,
          reward: quest.reward
        });

        // Procesar recompensa con el servicio
        await dailyQuestService.processQuestReward({
          userId: this.userId,
          questId: quest.id,
          questTitle: quest.title,
          reward: quest.reward,
          completedAt: quest.completedAt!,
          sessionId: this.sessionDocumentId || undefined
        });
      }
    }

    // GUARDAR LAS MISIONES CON EL PROGRESO ACTUALIZADO
    if (hasNewCompletion || this.dailyQuests.length > 0) {
      this.saveQuests();
      this.checkAllQuestsCompleted();
    }
  }

  /**
   * Verifica el progreso de las misiones permanentes
   */
  public checkPermanentQuestProgress(): void {
    for (const quest of this.permanentQuests) {
      if (quest.completed) continue;

      let currentProgress = 0;

      switch (quest.type) {
        case QuestType.GET_IMPROVED_MACHINEGUN:
          currentProgress = this.questProgress.hasImprovedMachinegun ? 1 : 0;
          break;
        case QuestType.GET_GRENADE_LAUNCHER:
          currentProgress = this.questProgress.hasGrenadeLauncher ? 1 : 0;
          break;
        case QuestType.GET_LASER_RIFLE:
          currentProgress = this.questProgress.hasLaserRifle ? 1 : 0;
          break;
      }

      quest.progress = currentProgress;

      // Verificar si se completó
      if (quest.progress >= quest.target && !quest.completed) {
        quest.completed = true;
        quest.completedAt = new Date().toISOString();

        console.log(`🏆 Misión permanente completada: ${quest.title} - Recompensa: ${quest.reward} alimentos`);
        
        // Emitir evento de misión completada
        this.scene.events.emit('questCompleted', {
          quest,
          reward: quest.reward
        });

        // Procesar recompensa con el servicio
        dailyQuestService.processQuestReward({
          userId: this.userId,
          questId: quest.id,
          questTitle: quest.title,
          reward: quest.reward,
          completedAt: quest.completedAt!,
          sessionId: this.sessionDocumentId || undefined
        });
      }
    }
  }

  /**
   * Verifica si todas las misiones están completadas
   */
  private checkAllQuestsCompleted(): void {
    const allCompleted = this.dailyQuests.every(quest => quest.completed);
    
    if (allCompleted) {
      const totalReward = this.dailyQuests.reduce((sum, quest) => sum + quest.reward, 0);
      const bonusReward = 10; // Bonus por completar las 3 misiones
      
              console.log(`🏆 ¡Todas las misiones diarias completadas! Recompensa total: ${totalReward + bonusReward} alimentos`);
      
      // Emitir evento de todas las misiones completadas
      this.scene.events.emit('allQuestsCompleted', {
        totalReward: totalReward + bonusReward,
        quests: this.dailyQuests
      });
    }
  }

  /**
   * Obtiene las misiones diarias actuales
   */
  public getDailyQuests(): DailyQuest[] {
    return [...this.dailyQuests];
  }

  /**
   * Obtiene las misiones permanentes
   */
  public getPermanentQuests(): DailyQuest[] {
    return [...this.permanentQuests];
  }

  /**
   * Obtiene todas las misiones (diarias + permanentes)
   */
  public getAllQuests(): DailyQuest[] {
    return [...this.dailyQuests, ...this.permanentQuests];
  }

  /**
   * Obtiene el progreso actual
   */
  public getQuestProgress(): QuestProgress {
    return { ...this.questProgress };
  }

  /**
   * Verifica y corrige las misiones si es necesario
   */
  public verifyAndFixQuests(): void {
    console.log('🔧 Verificando y corrigiendo misiones...');
    
    // Verificar si las misiones tienen el tipo correcto
    this.dailyQuests.forEach((quest, index) => {
      if (!quest.type || typeof quest.type !== 'string') {
        console.warn(`⚠️ Misión ${index} sin tipo válido:`, quest);
        
        // Intentar inferir el tipo basado en el título
        if (quest.title.includes('tanque') || quest.title.includes('Tank') || quest.title.includes('Blindado')) {
          quest.type = QuestType.KILL_TANKS;
          console.log(`🔧 Corregido tipo de misión ${index} a KILL_TANKS`);
        } else if (quest.title.includes('zombie') || quest.title.includes('Zombie') || quest.title.includes('No-Muerto')) {
          quest.type = QuestType.KILL_ZOMBIES;
          console.log(`🔧 Corregido tipo de misión ${index} a KILL_ZOMBIES`);
        } else if (quest.title.includes('dasher') || quest.title.includes('Dasher') || quest.title.includes('Detector')) {
          quest.type = QuestType.KILL_DASHERS;
          console.log(`🔧 Corregido tipo de misión ${index} a KILL_DASHERS`);
        } else if (quest.title.includes('enemigo') || quest.title.includes('Exterminador') || quest.title.includes('Cazador')) {
          quest.type = QuestType.KILL_ENEMIES;
          console.log(`🔧 Corregido tipo de misión ${index} a KILL_ENEMIES`);
        } else if (quest.title.includes('nivel') || quest.title.includes('Maestro') || quest.title.includes('Ascenso')) {
          quest.type = QuestType.REACH_LEVEL;
          console.log(`🔧 Corregido tipo de misión ${index} a REACH_LEVEL`);
        } else if (quest.title.includes('Sobrevive') || quest.title.includes('Superviviente') || quest.title.includes('Resistente')) {
          quest.type = QuestType.SURVIVE_TIME;
          console.log(`🔧 Corregido tipo de misión ${index} a SURVIVE_TIME`);
        } else if (quest.title.includes('vendaje') || quest.title.includes('Sanador') || quest.title.includes('Médico')) {
          quest.type = QuestType.USE_BANDAGES;
          console.log(`🔧 Corregido tipo de misión ${index} a USE_BANDAGES`);
        } else if (quest.title.includes('barril') || quest.title.includes('Demoledor') || quest.title.includes('Explosivo')) {
          quest.type = QuestType.DESTROY_BARRELS;
          console.log(`🔧 Corregido tipo de misión ${index} a DESTROY_BARRELS`);
        } else if (quest.title.includes('suministro') || quest.title.includes('Recolector') || quest.title.includes('Buscador')) {
          quest.type = QuestType.COLLECT_SUPPLY_BOXES;
          console.log(`🔧 Corregido tipo de misión ${index} a COLLECT_SUPPLY_BOXES`);
        } else {
          quest.type = QuestType.KILL_ENEMIES; // Default
          console.log(`🔧 Asignado tipo por defecto KILL_ENEMIES a misión ${index}`);
        }
      }
    });
    
    // Guardar las correcciones
    this.saveQuests();
    console.log('🔧 Misiones verificadas y corregidas');
  }

  /**
   * Método de debug para verificar el estado de las misiones
   */
  public debugQuests(): void {
    console.log('🔍 DEBUG: Estado actual de las misiones');
    console.log('🔍 DEBUG: UserId:', this.userId);
    console.log('🔍 DEBUG: DocumentId:', this.sessionDocumentId);
    console.log('🔍 DEBUG: Misiones diarias cargadas:', this.dailyQuests);
    console.log('🔍 DEBUG: Progreso actual:', this.questProgress);
    
    // Verificar cada misión individualmente
    this.dailyQuests.forEach((quest, index) => {
      console.log(`🔍 DEBUG: Misión ${index + 1}:`, {
        id: quest.id,
        title: quest.title,
        type: quest.type,
        target: quest.target,
        progress: quest.progress,
        completed: quest.completed,
        completedAt: quest.completedAt
      });
    });
    
    // Verificar misiones completadas
    const completedQuests = this.getCompletedQuests();
    console.log('🔍 DEBUG: Misiones completadas:', completedQuests);
    
    // Verificar localStorage
    const storedQuests = this.getStoredQuests();
    console.log('🔍 DEBUG: Misiones en localStorage:', storedQuests);
  }

  /**
   * Fuerza la actualización inmediata del progreso de todas las misiones
   */
  public forceUpdateProgress(): void {
    console.log('🔄 Forzando actualización inmediata del progreso...');
    
    for (const quest of this.dailyQuests) {
      if (quest.completed) continue;
      
      let currentProgress = 0;
      
      switch (quest.type) {
        case QuestType.KILL_ENEMIES:
          currentProgress = this.questProgress.enemiesKilled;
          break;
        case QuestType.KILL_ZOMBIES:
          currentProgress = this.questProgress.zombiesKilled;
          break;
        case QuestType.KILL_DASHERS:
          currentProgress = this.questProgress.dashersKilled;
          break;
        case QuestType.KILL_TANKS:
          currentProgress = this.questProgress.tanksKilled;
          break;
        case QuestType.REACH_LEVEL:
          currentProgress = this.questProgress.currentLevel;
          break;
        case QuestType.SURVIVE_TIME:
          currentProgress = Math.floor(this.questProgress.survivalTime);
          break;
        case QuestType.COLLECT_SUPPLY_BOXES:
          currentProgress = this.questProgress.supplyBoxesCollected;
          break;
        case QuestType.DESTROY_BARRELS:
          currentProgress = this.questProgress.barrelsDestroyed;
          break;
        case QuestType.USE_BANDAGES:
          currentProgress = this.questProgress.bandagesUsed;
          break;
        case QuestType.GAIN_LEVELS:
          currentProgress = this.questProgress.levelsGained;
          break;
      }
      
      quest.progress = currentProgress;
      console.log(`🔄 Actualizado progreso: ${quest.title} - ${quest.progress}/${quest.target}`);
    }
    
    // Guardar inmediatamente
    this.saveQuests();
    console.log('🔄 Progreso actualizado y guardado');
  }

  /**
   * Recarga las misiones desde localStorage
   */
  public reloadQuestsFromStorage(): void {
    console.log('🔄 Recargando misiones desde localStorage...');
    this.initializeQuests();
    console.log('🔄 Misiones recargadas:', this.dailyQuests);
  }

  /**
   * Fuerza la completación de misiones basado en el progreso actual
   */
  public forceCompleteQuests(): void {
    console.log('🔧 Forzando completación de misiones basado en progreso actual...');
    console.log('🔧 Misiones disponibles:', this.dailyQuests.length);
    console.log('🔧 Progreso actual:', this.questProgress);
    
    let completedCount = 0;
    
    for (const quest of this.dailyQuests) {
      if (quest.completed) {
        console.log(`🔧 Misión ya completada: ${quest.title}`);
        continue;
      }
      
      let currentProgress = 0;
      
      // Obtener progreso actual basado en el tipo de misión
      switch (quest.type) {
        case QuestType.KILL_ENEMIES:
          currentProgress = this.questProgress.enemiesKilled;
          break;
        case QuestType.KILL_ZOMBIES:
          currentProgress = this.questProgress.zombiesKilled;
          break;
        case QuestType.KILL_DASHERS:
          currentProgress = this.questProgress.dashersKilled;
          break;
        case QuestType.KILL_TANKS:
          currentProgress = this.questProgress.tanksKilled;
          break;
        case QuestType.REACH_LEVEL:
          currentProgress = this.questProgress.currentLevel;
          break;
        case QuestType.SURVIVE_TIME:
          currentProgress = Math.floor(this.questProgress.survivalTime);
          break;
        case QuestType.COLLECT_SUPPLY_BOXES:
          currentProgress = this.questProgress.supplyBoxesCollected;
          break;
        case QuestType.DESTROY_BARRELS:
          currentProgress = this.questProgress.barrelsDestroyed;
          break;
        case QuestType.USE_BANDAGES:
          currentProgress = this.questProgress.bandagesUsed;
          break;
        case QuestType.GAIN_LEVELS:
          currentProgress = this.questProgress.levelsGained;
          break;
      }
      
      quest.progress = currentProgress;
      
      console.log(`🔧 Verificando misión: ${quest.title} (${quest.type}) - Progreso: ${quest.progress}/${quest.target}`);
      
      // Marcar como completada si el progreso es suficiente
      if (quest.progress >= quest.target && !quest.completed) {
        quest.completed = true;
        quest.completedAt = new Date().toISOString();
        completedCount++;
        
        console.log(`🔧 Misión completada: ${quest.title} - Progreso: ${quest.progress}/${quest.target}`);
      }
    }
    
    if (completedCount > 0) {
      this.saveQuests();
      console.log(`🔧 Se completaron ${completedCount} misiones`);
    } else {
      console.log('🔧 No se encontraron misiones para completar');
    }
  }

  /**
   * Fuerza la verificación de progreso de misiones (para debug)
   */
  public async forceCheckProgress(): Promise<void> {
    console.log('🔧 Forzando verificación de progreso...');
    
    // Verificar si hay misiones, si no las hay, generarlas
    this.forceGenerateQuests();
    
    // Verificar y corregir misiones primero
    this.verifyAndFixQuests();
    
    // Forzar verificación de progreso de misiones diarias
    await this.checkQuestProgress();
    
    // Forzar verificación de progreso de misiones permanentes
    this.checkPermanentQuestProgress();
    
    // Guardar misiones después de la verificación
    this.saveQuests();
    
    console.log('🔧 Verificación forzada completada');
    console.log('🔧 Misiones completadas después de verificación:', this.getCompletedQuests().length);
  }

  /**
   * Obtiene las misiones completadas
   */
  public getCompletedQuests(): DailyQuest[] {
    return this.dailyQuests.filter(quest => quest.completed);
  }

  /**
   * Obtiene las misiones pendientes
   */
  public getPendingQuests(): DailyQuest[] {
    return this.dailyQuests.filter(quest => !quest.completed);
  }

  /**
   * Verifica si todas las misiones están completadas
   */
  public areAllQuestsCompleted(): boolean {
    return this.dailyQuests.every(quest => quest.completed);
  }

  /**
   * Rerollea las misiones diarias (genera nuevas)
   */
  public rerollDailyQuests(): void {
    this.generateDailyQuests();
    console.log('🎲 Misiones diarias rerolleadas');
  }

  /**
   * Fuerza la generación de misiones si no existen
   */
  public forceGenerateQuests(): void {
    if (this.dailyQuests.length === 0) {
      console.log('🎯 Forzando generación de misiones...');
      this.generateDailyQuests();
    } else {
      console.log('🎯 Ya existen misiones, no es necesario generar nuevas');
    }
  }

  /**
   * Obtiene la recompensa total de las misiones completadas
   */
  public getTotalReward(): number {
    const questRewards = this.dailyQuests
      .filter(quest => quest.completed)
      .reduce((sum, quest) => sum + quest.reward, 0);
    
    const bonusReward = this.areAllQuestsCompleted() ? 10 : 0;
    
    return questRewards + bonusReward;
  }

  /**
   * Guarda las misiones en localStorage
   */
  private saveQuests(): void {
    const questData = {
      date: new Date().toDateString(),
      userId: this.userId,
      quests: this.dailyQuests
    };
    
    localStorage.setItem(`dailyQuests_${this.userId}`, JSON.stringify(questData));
  }

  /**
   * Obtiene las misiones guardadas en localStorage
   */
  private getStoredQuests(): { date: string; userId: string | number; quests: DailyQuest[] } {
    const storageKey = `dailyQuests_${this.userId}`;
    console.log('🎯 DailyQuestManager: Buscando misiones con key:', storageKey);
    
    const stored = localStorage.getItem(storageKey);
    console.log('🎯 DailyQuestManager: Datos raw de localStorage:', stored);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('🎯 DailyQuestManager: Datos parseados:', parsed);
        return parsed;
      } catch (error) {
        console.warn('Error parsing stored quests:', error);
      }
    }
    
    console.log('🎯 DailyQuestManager: No se encontraron misiones, retornando objeto vacío');
    return { date: '', userId: this.userId, quests: [] };
  }

  /**
   * Guarda el progreso en localStorage
   */
  private saveQuestProgress(): void {
    localStorage.setItem(`questProgress_${this.userId}`, JSON.stringify(this.questProgress));
  }

  /**
   * Carga el progreso desde localStorage
   */
  private loadQuestProgress(): void {
    const stored = localStorage.getItem(`questProgress_${this.userId}`);
    if (stored) {
      try {
        this.questProgress = JSON.parse(stored);
      } catch (error) {
        console.warn('Error parsing stored quest progress:', error);
      }
    }
  }

  /**
   * Establece el ID de la sesión (documentId)
   */
  public setSessionId(sessionDocumentId: string): void {
    console.log('🔧 DailyQuestManager.setSessionId(): ANTES - sessionDocumentId:', this.sessionDocumentId);
    this.sessionDocumentId = sessionDocumentId;
    console.log('🔧 DailyQuestManager.setSessionId(): DESPUÉS - sessionDocumentId:', this.sessionDocumentId);
    console.log('🎯 DailyQuestManager: DocumentId establecido:', sessionDocumentId);
  }

  /**
   * Limpia el progreso de la sesión actual
   */
  public clearSessionProgress(): void {
    this.questProgress = {
      enemiesKilled: 0,
      zombiesKilled: 0,
      dashersKilled: 0,
      tanksKilled: 0,
      currentLevel: 1,
      survivalTime: 0,
      supplyBoxesCollected: 0,
      barrelsDestroyed: 0,
      bandagesUsed: 0,
      levelsGained: 0,
      hasImprovedMachinegun: false,
      hasGrenadeLauncher: false,
      hasLaserRifle: false,
      totalDamageDealt: 0,
      totalDamageReceived: 0,
      shotsFired: 0,
      shotsHit: 0,
      accuracyPercentage: 0,
      finalScore: 0,
      gamesPlayedTotal: 0,
      victoriesTotal: 0,
      defeatsTotal: 0
    };
  }

  /**
   * Mezcla un array aleatoriamente
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Destruye el manager y limpia recursos
   */
  public destroy(): void {
    // Remover event listeners
    this.scene.events.off('enemyKilled');
    this.scene.events.off('supplyBoxCollected');
    this.scene.events.off('barrelDestroyed');
    this.scene.events.off('bandageUsed');
    this.scene.events.off('diamondCollected');
    this.scene.events.off('levelUp');
    
    console.log('🗑️ DailyQuestManager destruido');
  }

  /**
   * Función de debug para mostrar el estado actual de las estadísticas
   */
  public debugQuestProgress(): void {
    console.log('🔍 === DEBUG: Estado Actual de QuestProgress ===');
    console.log('📊 Estadísticas básicas:');
    console.log(`  • Enemigos eliminados: ${this.questProgress.enemiesKilled}`);
    console.log(`  • Zombies eliminados: ${this.questProgress.zombiesKilled}`);
    console.log(`  • Dashers eliminados: ${this.questProgress.dashersKilled}`);
    console.log(`  • Tanques eliminados: ${this.questProgress.tanksKilled}`);
    console.log(`  • Nivel actual: ${this.questProgress.currentLevel}`);
    console.log(`  • Tiempo de supervivencia: ${this.questProgress.survivalTime.toFixed(2)}s`);
    console.log(`  • Cajas recolectadas: ${this.questProgress.supplyBoxesCollected}`);
    console.log(`  • Barriles destruidos: ${this.questProgress.barrelsDestroyed}`);
    console.log(`  • Vendajes usados: ${this.questProgress.bandagesUsed}`);
    console.log(`  • Niveles ganados: ${this.questProgress.levelsGained}`);
    
    console.log('🎯 Estadísticas de combate:');
    console.log(`  • Disparos realizados: ${this.questProgress.shotsFired}`);
    console.log(`  • Disparos que dieron: ${this.questProgress.shotsHit}`);
    console.log(`  • Precisión: ${this.questProgress.accuracyPercentage.toFixed(1)}%`);
    console.log(`  • Daño total causado: ${this.questProgress.totalDamageDealt}`);
    console.log(`  • Daño total recibido: ${this.questProgress.totalDamageReceived}`);
    console.log(`  • Score final: ${this.questProgress.finalScore}`);
    
    console.log('🏆 Estadísticas generales:');
    console.log(`  • Juegos jugados: ${this.questProgress.gamesPlayedTotal}`);
    console.log(`  • Victorias: ${this.questProgress.victoriesTotal}`);
    console.log(`  • Derrotas: ${this.questProgress.defeatsTotal}`);
    
    console.log('🔧 Armas especiales:');
    console.log(`  • Ametralladora mejorada: ${this.questProgress.hasImprovedMachinegun ? '✅' : '❌'}`);
    console.log(`  • Lanzagranadas: ${this.questProgress.hasGrenadeLauncher ? '✅' : '❌'}`);
    console.log(`  • Rifle láser: ${this.questProgress.hasLaserRifle ? '✅' : '❌'}`);
    
    console.log('💾 Datos en localStorage:');
    const stored = localStorage.getItem(`questProgress_${this.userId}`);
    if (stored) {
      try {
        const parsedData = JSON.parse(stored);
        console.log('  • Datos guardados:', parsedData);
      } catch (error) {
        console.log('  • Error parsing localStorage:', error);
      }
    } else {
      console.log('  • No hay datos en localStorage');
    }
    
    console.log('🔍 === FIN DEBUG ===');
  }

  /**
   * Obtiene un resumen compacto de las estadísticas para logging
   */
  public getStatsResumen(): string {
    return `Stats: ${this.questProgress.enemiesKilled}E/${this.questProgress.shotsFired}S/${this.questProgress.shotsHit}H/${this.questProgress.accuracyPercentage.toFixed(1)}%A/${this.questProgress.finalScore}P`;
  }

  /**
   * Fuerza el guardado inmediato de las estadísticas
   */
  public forceSaveProgress(): void {
    this.saveQuestProgress();
    console.log('💾 Progreso guardado forzadamente:', this.getStatsResumen());
  }
} 