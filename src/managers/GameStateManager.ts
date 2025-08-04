import { Scene } from 'phaser';
import { Player } from './Player';
import { TimerManager } from './TimerManager';
import { ExperienceManager } from './ExperienceManager';
import { UIManager } from './UIManager';
import { SupplyBoxManager, GameMaterials } from './SupplyBoxManager';
import { DailyQuestManager } from './DailyQuestManager';
import { gameSessionService } from '../services/gameSessionService';

export interface GameOverData {
  score: number;
  gameTime: number;
  level: number;
  reason: 'death' | 'victory';
  survivalBonus: number;
  materialsCollected?: GameMaterials;
  materialsUpdated?: GameMaterials;
  bonusApplied?: GameMaterials;
}

export class GameStateManager {
  private scene: Scene;
  private player: Player;
  private timerManager: TimerManager;
  private experienceManager: ExperienceManager;
  private uiManager: UIManager;
  private supplyBoxManager: SupplyBoxManager;
  private dailyQuestManager: DailyQuestManager;
  private userId: string | number;
  private sessionId: string | null = null;
  
  private isGameOver: boolean = false;
  private isGameWon: boolean = false;

  constructor(
    scene: Scene,
    player: Player,
    timerManager: TimerManager,
    experienceManager: ExperienceManager,
    uiManager: UIManager,
    supplyBoxManager: SupplyBoxManager,
    dailyQuestManager: DailyQuestManager,
    userId: string | number,
    sessionId?: string
  ) {
    this.scene = scene;
    this.player = player;
    this.timerManager = timerManager;
    this.experienceManager = experienceManager;
    this.uiManager = uiManager;
    this.supplyBoxManager = supplyBoxManager;
    this.dailyQuestManager = dailyQuestManager;
    this.userId = userId;
    this.sessionId = sessionId || null;

    // Configurar teclas de debug
    this.setupDebugKeys();
  }

  /**
   * Configura teclas de debug para testing
   */
  private setupDebugKeys(): void {
    // Tecla Z para ganar automáticamente
    this.scene.input.keyboard!.on('keydown-Z', () => {
      if (!this.isGameOver && !this.isGameWon) {
        console.log('🏆 Debug: Ganando juego con tecla Z');
        this.gameWin();
      }
    });

    // Tecla X para perder automáticamente
    this.scene.input.keyboard!.on('keydown-X', () => {
      if (!this.isGameOver && !this.isGameWon) {
        console.log('💀 Debug: Perdiendo juego con tecla X');
        this.gameOver();
      }
    });
  }

  /**
   * Verifica si el jugador ha muerto
   */
  public checkPlayerDeath(): void {
    if (!this.player.isAlive() && !this.isGameOver && !this.isGameWon) {
      console.log('💀 GameStateManager: Jugador muerto detectado');
      this.gameOver();
    }
  }

  /**
   * Verifica si el jugador ha ganado (8 minutos de supervivencia)
   */
  public checkGameWin(): void {
    const gameTime = this.timerManager.getGameTime();
    if (gameTime >= 480 && !this.isGameOver && !this.isGameWon) { // 8 minutos = 480 segundos
      console.log('🏆 GameStateManager: Victoria por tiempo alcanzado');
      this.gameWin();
    }
  }

  /**
   * Maneja el game over
   */
  private async gameOver(): Promise<void> {
    if (this.isGameOver || this.isGameWon) {
      console.log('⚠️ GameStateManager: gameOver() llamado pero ya terminado:', { isGameOver: this.isGameOver, isGameWon: this.isGameWon });
      return;
    }

    console.log('💀 GameStateManager: Iniciando gameOver()');
    this.isGameOver = true;
    this.timerManager.stop();

    // Obtener materiales recolectados en esta sesión
    const materialsCollected = this.supplyBoxManager.getSessionMaterials();

    // Obtener food de misiones completadas
    const questReward = this.dailyQuestManager.getTotalReward();
    const materialsWithQuestFood = {
      ...materialsCollected,
      food: materialsCollected.food + questReward
    };

    const gameOverData: GameOverData = {
      score: this.getCurrentScore(),
      gameTime: this.timerManager.getGameTime(),
      level: this.experienceManager.getLevel(),
      reason: 'death',
      survivalBonus: 0,
      materialsCollected: materialsWithQuestFood
    };

    console.log('💀 Game Over - Datos:', gameOverData);
    console.log('🎯 Food de misiones completadas:', questReward);
    console.log('🎯 SessionId para actualización:', this.sessionId);

    // Actualizar materiales en Strapi (sin bonus, pero incluyendo food de misiones)
    if (this.sessionId) {
      try {
        console.log('📤 Enviando materiales a Strapi...');
        const result = await gameSessionService.updateSessionMaterials({
          sessionId: this.sessionId,
          materials: materialsWithQuestFood,
          isVictory: false
        });

        gameOverData.materialsUpdated = result.materialsUpdated;
        console.log('✅ Materiales actualizados en Strapi (derrota):', result);
        
        // Completar misiones y enviar al backend
        console.log('🔧 Completando misiones finales...');
        
        // Usar el DailyQuestManager para obtener las misiones completadas
        // Primero forzar una verificación final del progreso
        await this.dailyQuestManager.forceCheckProgress();
        
        // Obtener las misiones completadas directamente del manager
        const completedQuests = this.dailyQuestManager.getCompletedQuests();
        
        console.log('🎯 Misiones completadas encontradas:', completedQuests.length);
        console.log('🎯 Detalles de misiones completadas:', completedQuests);
        
        if (completedQuests.length > 0) {
          console.log('📤 Enviando misiones completadas a Strapi...');
          const questsResult = await gameSessionService.updateDailyQuestsCompleted({
            sessionId: this.sessionId,
            completedQuests: completedQuests
          });

          console.log('✅ Misiones diarias actualizadas en Strapi (derrota):', questsResult);
        }
        
        // Limpiar materiales de la sesión después de enviar a Strapi
        this.supplyBoxManager.clearSessionMaterials();
        console.log('🔄 Materiales de sesión limpiados después de derrota');
      } catch (error) {
        console.error('❌ Error actualizando datos en Strapi:', error);
      }
    } else {
      console.warn('⚠️ No hay sessionId, no se actualizarán datos en Strapi');
    }

    // Emitir evento con datos completos
    console.log('📡 Emitiendo evento gameOver...');
    this.scene.events.emit('gameOver', gameOverData);
    console.log('✅ Game over completado');
  }

  /**
   * Maneja la victoria del juego
   */
  private async gameWin(): Promise<void> {
    if (this.isGameOver || this.isGameWon) {
      console.log('⚠️ GameStateManager: gameWin() llamado pero ya terminado:', { isGameOver: this.isGameOver, isGameWon: this.isGameWon });
      return;
    }

    console.log('🏆 GameStateManager: Iniciando gameWin()');
    this.isGameWon = true;
    this.timerManager.stop();

    // Obtener materiales recolectados en esta sesión
    const materialsCollected = this.supplyBoxManager.getSessionMaterials();

    // Obtener food de misiones completadas
    const questReward = this.dailyQuestManager.getTotalReward();
    const materialsWithQuestFood = {
      ...materialsCollected,
      food: materialsCollected.food + questReward
    };

    const gameOverData: GameOverData = {
      score: this.getCurrentScore(),
      gameTime: this.timerManager.getGameTime(),
      level: this.experienceManager.getLevel(),
      reason: 'victory',
      survivalBonus: Math.floor(this.getCurrentScore() * 0.5),
      materialsCollected: materialsWithQuestFood
    };

    console.log('🏆 ¡Victoria! - Datos:', gameOverData);
    console.log('🎯 Food de misiones completadas:', questReward);
    console.log('🎯 SessionId para actualización:', this.sessionId);

    // Actualizar materiales en Strapi (con bonus de victoria, incluyendo food de misiones)
    if (this.sessionId) {
      try {
        console.log('📤 Enviando materiales a Strapi (victoria)...');
        const result = await gameSessionService.updateSessionMaterials({
          sessionId: this.sessionId,
          materials: materialsWithQuestFood,
          isVictory: true,
          victoryBonusPercentage: 0.25 // 25% de bonus por victoria
        });

        gameOverData.materialsUpdated = result.materialsUpdated;
        gameOverData.bonusApplied = result.bonusApplied;
        console.log('✅ Materiales actualizados en Strapi (victoria):', result);
        
        // Completar misiones y enviar al backend
        console.log('🔧 Completando misiones finales...');
        
        // Usar el DailyQuestManager para obtener las misiones completadas
        // Primero forzar una verificación final del progreso
        await this.dailyQuestManager.forceCheckProgress();
        
        // Obtener las misiones completadas directamente del manager
        const completedQuests = this.dailyQuestManager.getCompletedQuests();
        
        console.log('🎯 Misiones completadas encontradas:', completedQuests.length);
        console.log('🎯 Detalles de misiones completadas:', completedQuests);
        
        if (completedQuests.length > 0) {
          console.log('📤 Enviando misiones completadas a Strapi...');
          const questsResult = await gameSessionService.updateDailyQuestsCompleted({
            sessionId: this.sessionId,
            completedQuests: completedQuests
          });

          console.log('✅ Misiones diarias actualizadas en Strapi (victoria):', questsResult);
        }
        
        // Limpiar materiales de la sesión después de enviar a Strapi
        this.supplyBoxManager.clearSessionMaterials();
        console.log('🔄 Materiales de sesión limpiados después de victoria');
      } catch (error) {
        console.error('❌ Error actualizando datos en Strapi:', error);
      }
    } else {
      console.warn('⚠️ No hay sessionId, no se actualizarán datos en Strapi');
    }

    // Emitir evento con datos completos
    console.log('📡 Emitiendo evento gameOver (victoria)...');
    this.scene.events.emit('gameOver', gameOverData);
    console.log('✅ Game win completado');
  }

  /**
   * Obtiene el puntaje actual
   */
  private getCurrentScore(): number {
    // Obtener el score desde el UIManager
    const uiData = this.uiManager.getData();
    return uiData.score;
  }

  /**
   * Verifica si el juego está en estado de game over
   */
  public isGameOverState(): boolean {
    return this.isGameOver || this.isGameWon;
  }

  /**
   * Verifica si el juego ha sido ganado
   */
  public isGameWonState(): boolean {
    return this.isGameWon;
  }

  /**
   * Reinicia el estado del juego (para nueva partida)
   */
  public reset(): void {
    this.isGameOver = false;
    this.isGameWon = false;
    // Limpiar materiales de la sesión anterior
    this.supplyBoxManager.clearSessionMaterials();
    console.log('🔄 GameStateManager: Estado reiniciado');
  }

  /**
   * Establece el ID de la sesión
   */
  public setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
    console.log('🎮 GameStateManager: SessionId establecido:', sessionId);
  }

  /**
   * Destruye el manager
   */
  public destroy(): void {
    // Remover listeners de teclas
    this.scene.input.keyboard!.off('keydown-Z');
    this.scene.input.keyboard!.off('keydown-X');
    console.log('🗑️ GameStateManager destruido');
  }
} 