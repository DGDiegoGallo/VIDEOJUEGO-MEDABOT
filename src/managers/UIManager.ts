import { Scene } from 'phaser';
import { Player } from './Player';
import { ExperienceManager } from './ExperienceManager';
import { EnemyManager } from './EnemyManager';
import { TimerManager } from './TimerManager';
import { MinimapManager } from './MinimapManager';
import { GameEffectsManager } from './GameEffectsManager';

export interface UIData {
  health: { current: number; max: number };
  experience: { current: number; max: number };
  level: number;
  score: number;
  gameTime: number;
  remainingTime: number;
  enemyCount: number;
  equipment: Array<{
    name: string;
    type: string;
    rarity: string;
    effects: Array<{
      type: string;
      value: number;
      unit: string;
    }>;
  }>;
  skills: {
    rapidFire: number;
    magneticField: number;
    multiShot: number;
  };
  minimap: {
    playerChunk: { x: number; y: number };
    worldSize: number;
    activeChunks: string[];
    playerPosition: { x: number; y: number };
    enemies: Array<{
      id: string;
      x: number;
      y: number;
      type: string;
      distance: number;
    }>;
  };
}

export class UIManager {
  private scene: Scene;
  private player: Player;
  private experienceManager: ExperienceManager;
  private enemyManager: EnemyManager;
  private timerManager: TimerManager;
  private minimapManager: MinimapManager;
  private gameEffectsManager: GameEffectsManager;
  
  private lastUpdateTime: number = 0;
  private updateInterval: number = 200; // Actualizar cada 200ms (era 100ms)
  private score: number = 0;

  constructor(
    scene: Scene,
    player: Player,
    experienceManager: ExperienceManager,
    enemyManager: EnemyManager,
    timerManager: TimerManager,
    minimapManager: MinimapManager,
    gameEffectsManager: GameEffectsManager
  ) {
    this.scene = scene;
    this.player = player;
    this.experienceManager = experienceManager;
    this.enemyManager = enemyManager;
    this.timerManager = timerManager;
    this.minimapManager = minimapManager;
    this.gameEffectsManager = gameEffectsManager;
  }

  /**
   * Actualiza la UI del juego
   */
  update(): UIData {
    const currentTime = Date.now();
    
    // Solo actualizar si ha pasado el tiempo suficiente
    if (currentTime - this.lastUpdateTime < this.updateInterval) {
      return this.getLastData();
    }

    this.lastUpdateTime = currentTime;

    const uiData: UIData = {
      health: {
        current: this.player.getHealth(),
        max: this.player.getMaxHealth()
      },
      experience: {
        current: this.experienceManager.getXP(),
        max: this.experienceManager.getMaxXP()
      },
      level: this.experienceManager.getLevel(),
      score: this.score,
      gameTime: this.timerManager.getGameTime(),
      remainingTime: this.timerManager.getRemainingTime(),
      enemyCount: this.enemyManager.getEnemyCount(),
      equipment: this.gameEffectsManager.getEquippedNFTsInfo(),
      skills: this.gameEffectsManager.getGameSkills(),
      minimap: this.minimapManager.getData()
    };

    // Emitir evento con los datos de la UI
    this.scene.events.emit('uiUpdate', uiData);

    return uiData;
  }

  /**
   * Obtiene los datos de la UI sin actualizar
   */
  getData(): UIData {
    return {
      health: {
        current: this.player.getHealth(),
        max: this.player.getMaxHealth()
      },
      experience: {
        current: this.experienceManager.getXP(),
        max: this.experienceManager.getMaxXP()
      },
      level: this.experienceManager.getLevel(),
      score: this.score,
      gameTime: this.timerManager.getGameTime(),
      remainingTime: this.timerManager.getRemainingTime(),
      enemyCount: this.enemyManager.getEnemyCount(),
      equipment: this.gameEffectsManager.getEquippedNFTsInfo(),
      skills: this.gameEffectsManager.getGameSkills(),
      minimap: this.minimapManager.getData()
    };
  }

  /**
   * Actualiza el puntaje
   * @param points - Puntos a agregar
   */
  addScore(points: number): void {
    this.score += points;
    this.scene.events.emit('scoreUpdate', this.score);
  }

  /**
   * Establece el puntaje
   * @param score - Nuevo puntaje
   */
  setScore(score: number): void {
    this.score = score;
    this.scene.events.emit('scoreUpdate', this.score);
  }

  /**
   * Obtiene el puntaje actual
   */
  getScore(): number {
    return this.score;
  }

  /**
   * Obtiene información de salud
   */
  getHealthInfo(): { current: number; max: number; percentage: number } {
    const current = this.player.getHealth();
    const max = this.player.getMaxHealth();
    const percentage = max > 0 ? (current / max) * 100 : 0;
    
    return { current, max, percentage };
  }

  /**
   * Obtiene información de experiencia
   */
  getExperienceInfo(): { current: number; max: number; percentage: number; level: number } {
    const current = this.experienceManager.getXP();
    const max = this.experienceManager.getMaxXP();
    const percentage = max > 0 ? (current / max) * 100 : 0;
    const level = this.experienceManager.getLevel();
    
    return { current, max, percentage, level };
  }

  /**
   * Obtiene información del tiempo de juego
   */
  getTimeInfo(): { gameTime: number; remainingTime: number; formattedGameTime: string; formattedRemainingTime: string } {
    const gameTime = this.timerManager.getGameTime();
    const remainingTime = this.timerManager.getRemainingTime();
    
    return {
      gameTime,
      remainingTime,
      formattedGameTime: this.formatTime(gameTime),
      formattedRemainingTime: this.formatTime(remainingTime)
    };
  }

  /**
   * Obtiene información de enemigos
   */
  getEnemyInfo(): { total: number; nearby: number; closestDistance: number } {
    const total = this.enemyManager.getEnemyCount();
    const playerPos = this.player.getPosition();
    const nearby = this.enemyManager.getNearbyEnemies(playerPos.x, playerPos.y, 400).length;
    const closestEnemy = this.enemyManager.getClosestEnemy(playerPos.x, playerPos.y);
    const closestDistance = closestEnemy ? 
      Phaser.Math.Distance.Between(playerPos.x, playerPos.y, closestEnemy.x, closestEnemy.y) : 0;
    
    return { total, nearby, closestDistance };
  }

  /**
   * Obtiene información de equipamiento
   */
  getEquipmentInfo(): {
    items: Array<{
      name: string;
      type: string;
      rarity: string;
      effects: Array<{
        type: string;
        value: number;
        unit: string;
      }>;
    }>;
    stats: any;
  } {
    return {
      items: this.gameEffectsManager.getEquippedNFTsInfo(),
      stats: this.gameEffectsManager.getCurrentStats()
    };
  }

  /**
   * Obtiene información de habilidades
   */
  getSkillsInfo(): {
    rapidFire: number;
    magneticField: number;
    multiShot: number;
    totalPoints: number;
  } {
    const skills = this.gameEffectsManager.getGameSkills();
    const totalPoints = skills.rapidFire + skills.magneticField + skills.multiShot;
    
    return {
      ...skills,
      totalPoints
    };
  }

  /**
   * Formatea el tiempo en formato MM:SS
   * @param seconds - Segundos a formatear
   */
  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Configura el intervalo de actualización de la UI
   * @param interval - Intervalo en milisegundos
   */
  setUpdateInterval(interval: number): void {
    this.updateInterval = interval;
  }

  /**
   * Obtiene el intervalo de actualización actual
   */
  getUpdateInterval(): number {
    return this.updateInterval;
  }

  /**
   * Fuerza una actualización inmediata de la UI
   */
  forceUpdate(): UIData {
    this.lastUpdateTime = 0; // Resetear el tiempo para forzar actualización
    return this.update();
  }

  /**
   * Obtiene los últimos datos de la UI (sin actualizar)
   */
  private getLastData(): UIData {
    // En una implementación real, aquí guardaríamos los últimos datos
    // Por ahora, simplemente obtenemos los datos actuales
    return this.getData();
  }

  /**
   * Destruye el manager de UI
   */
  destroy(): void {
    // Limpiar eventos si es necesario
    this.scene.events.off('uiUpdate');
    this.scene.events.off('scoreUpdate');
  }
}