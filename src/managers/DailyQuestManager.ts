import { Scene } from 'phaser';
import { ExperienceManager } from './ExperienceManager';
import { dailyQuestService } from '../services/dailyQuestService';

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  type: 'destroy_barrels' | 'kill_enemies' | 'kill_zombies' | 'kill_dashers' | 'kill_tanks' | 'use_bandages' | 'collect_boxes' | 'survive_time' | 'get_improved_machinegun' | 'get_grenade_launcher' | 'get_laser_rifle' | 'reach_level' | 'gain_levels';
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  completedAt?: string;
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

export interface StoredQuests {
  userId: string;
  date: string;
  quests: DailyQuest[];
}

export class DailyQuestManager {
  private scene: Scene;
  private experienceManager: ExperienceManager;
  private userId: string;
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
  private questCheckInterval: number = 2000; // Verificar cada 2 segundos

  constructor(
    scene: Scene,
    experienceManager: ExperienceManager,
    userId: string
  ) {
    this.scene = scene;
    this.experienceManager = experienceManager;
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
    console.log('🎯 Progreso de misiones cargado:', this.questProgress);
  }

  /**
   * Genera 3 misiones diarias aleatorias
   */
  private generateDailyQuests(): void {
    const questTemplates = [
      { id: 'quest_1', title: 'Demoledor', description: 'Explota 1 barriles', type: 'destroy_barrels', target: 1, reward: 1 },
      { id: 'quest_2', title: 'Cazador de Enemigos', description: 'Elimina 10 enemigos', type: 'kill_enemies', target: 10, reward: 2 },
      { id: 'quest_3', title: 'Exterminio de Zombies', description: 'Elimina 5 zombies', type: 'kill_zombies', target: 5, reward: 1 },
      { id: 'quest_4', title: 'Cazador de Dashers', description: 'Elimina 3 dashers', type: 'kill_dashers', target: 3, reward: 2 },
      { id: 'quest_5', title: 'Guerrero Anti-Tanque', description: 'Elimina 2 tanques', type: 'kill_tanks', target: 2, reward: 3 },
      { id: 'quest_6', title: 'Curador', description: 'Usa 1 vendajes', type: 'use_bandages', target: 1, reward: 1 },
      { id: 'quest_7', title: 'Recolector', description: 'Recolecta 3 cajas de suministros', type: 'collect_boxes', target: 3, reward: 2 },
      { id: 'quest_8', title: 'Superviviente', description: 'Sobrevive por 120 segundos', type: 'survive_time', target: 120, reward: 3 }
    ];

    // Seleccionar 3 misiones aleatorias
    const shuffled = [...questTemplates].sort(() => 0.5 - Math.random());
    this.dailyQuests = shuffled.slice(0, 3).map(template => ({
      ...template,
      progress: 0,
      completed: false
    } as DailyQuest));

    this.saveQuests();
    console.log('🎯 Nuevas misiones diarias generadas:', this.dailyQuests);
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
        type: 'get_improved_machinegun',
        target: 1,
        progress: 0,
        reward: 5, // 5 alimentos
        completed: false
      },
      {
        id: 'permanent_2',
        title: 'Lanzagranadas',
        description: 'Consigue el Lanzagranadas',
        type: 'get_grenade_launcher',
        target: 1,
        progress: 0,
        reward: 8, // 8 alimentos
        completed: false
      },
      {
        id: 'permanent_3',
        title: 'Rifle Láser',
        description: 'Consigue el Rifle Láser',
        type: 'get_laser_rifle',
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
      
      this.saveQuestProgress();
    });

    // Caja de suministros recolectada
    this.scene.events.on('supplyBoxCollected', () => {
      this.questProgress.supplyBoxesCollected++;
      this.saveQuestProgress();
    });

    // Barril destruido
    this.scene.events.on('barrelExplosion', () => {
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
      this.questProgress.levelsGained++;
      this.saveQuestProgress();
    });

    // Disparo realizado
    this.scene.events.on('bulletFired', (data: { bulletsCount: number }) => {
      const bulletCount = data.bulletsCount || 1;
      this.questProgress.shotsFired += bulletCount;
      this.updateAccuracy();
      this.saveQuestProgress();
    });

    // Impacto exitoso
    this.scene.events.on('bulletHit', (data: { damage: number }) => {
      this.questProgress.shotsHit++;
      this.questProgress.totalDamageDealt += data.damage || 1;
      this.updateAccuracy();
      this.saveQuestProgress();
    });

    // Daño recibido por el jugador
    this.scene.events.on('playerDamaged', (data: { damage: number }) => {
      this.questProgress.totalDamageReceived += data.damage || 1;
      this.saveQuestProgress();
    });

    // Actualización de score
    this.scene.events.on('scoreUpdate', (data: { score: number }) => {
      this.questProgress.finalScore = data.score || 0;
      this.saveQuestProgress();
    });

    // Victoria en el juego
    this.scene.events.on('gameWin', () => {
      this.questProgress.victoriesTotal++;
      this.questProgress.gamesPlayedTotal++;
      this.saveQuestProgress();
    });

    // Derrota en el juego
    this.scene.events.on('gameOver', () => {
      this.questProgress.defeatsTotal++;
      this.questProgress.gamesPlayedTotal++;
      this.saveQuestProgress();
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
   * Actualiza el progreso de las misiones usando los datos del localStorage
   */
  public async update(): Promise<void> {
    const currentTime = Date.now();
    
    // Verificar progreso cada 2 segundos
    if (currentTime - this.lastQuestCheck >= this.questCheckInterval) {
      this.lastQuestCheck = currentTime;
      
      // Actualizar tiempo de supervivencia
      this.questProgress.survivalTime = this.scene.time.now / 1000;
      
      // Actualizar nivel actual
      this.questProgress.currentLevel = this.experienceManager.getLevel();
      
      // Actualizar score final (obtenido desde UIManager)
      const uiData = (this.scene as any).uiManager?.getData();
      if (uiData?.score !== undefined) {
        this.questProgress.finalScore = uiData.score;
      }

      // Verificar progreso de misiones usando los datos actualizados
      this.checkQuestProgress();
      
      // Guardar progreso actualizado
      this.saveQuestProgress();
    }
  }

  /**
   * Verifica el progreso de las misiones y las marca como completadas
   */
  private checkQuestProgress(): void {
    let questsCompleted = false;

    this.dailyQuests.forEach(quest => {
      if (quest.completed) return;

      let currentProgress = 0;

      // Usar los datos del questProgress para verificar el progreso
      switch (quest.type) {
        case 'destroy_barrels':
          currentProgress = this.questProgress.barrelsDestroyed;
          break;
        case 'kill_enemies':
          currentProgress = this.questProgress.enemiesKilled;
          break;
        case 'kill_zombies':
          currentProgress = this.questProgress.zombiesKilled;
          break;
        case 'kill_dashers':
          currentProgress = this.questProgress.dashersKilled;
          break;
        case 'kill_tanks':
          currentProgress = this.questProgress.tanksKilled;
          break;
        case 'use_bandages':
          currentProgress = this.questProgress.bandagesUsed;
          break;
        case 'collect_boxes':
          currentProgress = this.questProgress.supplyBoxesCollected;
          break;
        case 'survive_time':
          currentProgress = Math.floor(this.questProgress.survivalTime);
          break;
        case 'get_improved_machinegun':
          currentProgress = this.questProgress.hasImprovedMachinegun ? 1 : 0;
          break;
        case 'get_grenade_launcher':
          currentProgress = this.questProgress.hasGrenadeLauncher ? 1 : 0;
          break;
        case 'get_laser_rifle':
          currentProgress = this.questProgress.hasLaserRifle ? 1 : 0;
          break;
        case 'reach_level':
          currentProgress = this.questProgress.currentLevel;
          break;
        case 'gain_levels':
          currentProgress = this.questProgress.levelsGained;
          break;
      }

      // Actualizar progreso
      quest.progress = Math.min(currentProgress, quest.target);

      // Verificar si se completó la misión
      if (quest.progress >= quest.target && !quest.completed) {
        quest.completed = true;
        quest.completedAt = new Date().toISOString();
        questsCompleted = true;
        
        console.log(`✅ Misión completada: ${quest.title} (${quest.progress}/${quest.target})`);
        
        // Emitir evento de misión completada
        this.scene.events.emit('questCompleted', {
          quest: quest,
          reward: quest.reward
        });
      }
    });

    if (questsCompleted) {
      this.saveQuests();
    }
  }

  /**
   * Obtiene las misiones almacenadas en localStorage
   */
  private getStoredQuests(): StoredQuests {
    try {
      const stored = localStorage.getItem(`dailyQuests_${this.userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('❌ Error al cargar misiones desde localStorage:', error);
    }
    
    return {
      userId: this.userId,
      date: new Date().toISOString().split('T')[0],
      quests: []
    };
  }

  /**
   * Guarda las misiones en localStorage
   */
  private saveQuests(): void {
    try {
      const questData: StoredQuests = {
        userId: this.userId,
        date: new Date().toISOString().split('T')[0],
        quests: this.dailyQuests
      };
      
      localStorage.setItem(`dailyQuests_${this.userId}`, JSON.stringify(questData));
      console.log('💾 Misiones guardadas en localStorage');
    } catch (error) {
      console.error('❌ Error al guardar misiones en localStorage:', error);
    }
  }

  /**
   * Carga el progreso desde localStorage
   */
  private loadQuestProgress(): void {
    try {
      const stored = localStorage.getItem(`questProgress_${this.userId}`);
      if (stored) {
        const parsedProgress = JSON.parse(stored);
        this.questProgress = { ...this.getDefaultProgress(), ...parsedProgress };
        console.log('📊 Progreso cargado desde localStorage:', this.questProgress);
      }
    } catch (error) {
      console.error('❌ Error al cargar progreso desde localStorage:', error);
      this.questProgress = this.getDefaultProgress();
    }
  }

  /**
   * Guarda el progreso en localStorage
   */
  public saveQuestProgress(): void {
    try {
      localStorage.setItem(`questProgress_${this.userId}`, JSON.stringify(this.questProgress));
    } catch (error) {
      console.error('❌ Error al guardar progreso en localStorage:', error);
    }
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
    console.log(`  • Impactos exitosos: ${this.questProgress.shotsHit}`);
    console.log(`  • Precisión: ${this.questProgress.accuracyPercentage.toFixed(1)}%`);
    console.log(`  • Daño causado: ${this.questProgress.totalDamageDealt}`);
    console.log(`  • Daño recibido: ${this.questProgress.totalDamageReceived}`);

    console.log('🏆 Estadísticas de juego:');
    console.log(`  • Score final: ${this.questProgress.finalScore}`);
    console.log(`  • Juegos jugados: ${this.questProgress.gamesPlayedTotal}`);
    console.log(`  • Victorias: ${this.questProgress.victoriesTotal}`);
    console.log(`  • Derrotas: ${this.questProgress.defeatsTotal}`);

    console.log('📋 Estado de Daily Quests:');
    this.dailyQuests.forEach((quest, index) => {
      const status = quest.completed ? '✅ COMPLETADA' : '⏳ En progreso';
      console.log(`  ${index + 1}. ${quest.title}: ${quest.progress}/${quest.target} ${status}`);
    });
  }

  // Getters públicos
  public getDailyQuests(): DailyQuest[] {
    return this.dailyQuests;
  }

  public getQuestProgress(): QuestProgress {
    return this.questProgress;
  }

  public getCompletedQuestsCount(): number {
    return this.dailyQuests.filter(q => q.completed).length;
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
          quest.type = 'kill_tanks';
          console.log(`🔧 Corregido tipo de misión ${index} a kill_tanks`);
        } else if (quest.title.includes('zombie') || quest.title.includes('Zombie') || quest.title.includes('No-Muerto')) {
          quest.type = 'kill_zombies';
          console.log(`🔧 Corregido tipo de misión ${index} a kill_zombies`);
        } else if (quest.title.includes('dasher') || quest.title.includes('Dasher') || quest.title.includes('Detector')) {
          quest.type = 'kill_dashers';
          console.log(`🔧 Corregido tipo de misión ${index} a kill_dashers`);
        } else if (quest.title.includes('enemigo') || quest.title.includes('Exterminador') || quest.title.includes('Cazador')) {
          quest.type = 'kill_enemies';
          console.log(`🔧 Corregido tipo de misión ${index} a kill_enemies`);
        } else if (quest.title.includes('nivel') || quest.title.includes('Maestro') || quest.title.includes('Ascenso')) {
          quest.type = 'reach_level';
          console.log(`🔧 Corregido tipo de misión ${index} a reach_level`);
        } else if (quest.title.includes('Sobrevive') || quest.title.includes('Superviviente') || quest.title.includes('Resistente')) {
          quest.type = 'survive_time';
          console.log(`🔧 Corregido tipo de misión ${index} a survive_time`);
        } else if (quest.title.includes('vendaje') || quest.title.includes('Sanador') || quest.title.includes('Médico')) {
          quest.type = 'use_bandages';
          console.log(`🔧 Corregido tipo de misión ${index} a use_bandages`);
        } else if (quest.title.includes('barril') || quest.title.includes('Demoledor') || quest.title.includes('Explosivo')) {
          quest.type = 'destroy_barrels';
          console.log(`🔧 Corregido tipo de misión ${index} a destroy_barrels`);
        } else if (quest.title.includes('suministro') || quest.title.includes('Recolector') || quest.title.includes('Buscador')) {
          quest.type = 'collect_boxes';
          console.log(`🔧 Corregido tipo de misión ${index} a collect_boxes`);
        } else {
          quest.type = 'kill_enemies'; // Default
          console.log(`🔧 Asignado tipo por defecto kill_enemies a misión ${index}`);
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
        case 'kill_enemies':
          currentProgress = this.questProgress.enemiesKilled;
          break;
        case 'kill_zombies':
          currentProgress = this.questProgress.zombiesKilled;
          break;
        case 'kill_dashers':
          currentProgress = this.questProgress.dashersKilled;
          break;
        case 'kill_tanks':
          currentProgress = this.questProgress.tanksKilled;
          break;
        case 'reach_level':
          currentProgress = this.questProgress.currentLevel;
          break;
        case 'survive_time':
          currentProgress = Math.floor(this.questProgress.survivalTime);
          break;
        case 'collect_boxes':
          currentProgress = this.questProgress.supplyBoxesCollected;
          break;
        case 'destroy_barrels':
          currentProgress = this.questProgress.barrelsDestroyed;
          break;
        case 'use_bandages':
          currentProgress = this.questProgress.bandagesUsed;
          break;
        case 'gain_levels':
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
        case 'kill_enemies':
          currentProgress = this.questProgress.enemiesKilled;
          break;
        case 'kill_zombies':
          currentProgress = this.questProgress.zombiesKilled;
          break;
        case 'kill_dashers':
          currentProgress = this.questProgress.dashersKilled;
          break;
        case 'kill_tanks':
          currentProgress = this.questProgress.tanksKilled;
          break;
        case 'reach_level':
          currentProgress = this.questProgress.currentLevel;
          break;
        case 'survive_time':
          currentProgress = Math.floor(this.questProgress.survivalTime);
          break;
        case 'collect_boxes':
          currentProgress = this.questProgress.supplyBoxesCollected;
          break;
        case 'destroy_barrels':
          currentProgress = this.questProgress.barrelsDestroyed;
          break;
        case 'use_bandages':
          currentProgress = this.questProgress.bandagesUsed;
          break;
        case 'gain_levels':
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
   * Destruye el manager y limpia recursos
   */
  public destroy(): void {
    // Remover event listeners
    this.scene.events.off('enemyKilled');
    this.scene.events.off('supplyBoxCollected');
    this.scene.events.off('barrelExplosion');
    this.scene.events.off('bandageUsed');
    this.scene.events.off('diamondCollected');
    this.scene.events.off('levelUp');
    
    console.log('🗑️ DailyQuestManager destruido');
  }

  /**
   * Verifica el progreso de las misiones permanentes
   */
  public checkPermanentQuestProgress(): void {
    for (const quest of this.permanentQuests) {
      if (quest.completed) continue;

      let currentProgress = 0;

      switch (quest.type) {
        case 'get_improved_machinegun':
          currentProgress = this.questProgress.hasImprovedMachinegun ? 1 : 0;
          break;
        case 'get_grenade_launcher':
          currentProgress = this.questProgress.hasGrenadeLauncher ? 1 : 0;
          break;
        case 'get_laser_rifle':
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
   * Valores por defecto para el progreso
   */
  private getDefaultProgress(): QuestProgress {
    return {
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
} 