import { Scene } from 'phaser';
import { Player } from './Player';
import { TimerManager } from './TimerManager';
import { ExperienceManager } from './ExperienceManager';
import { UIManager } from './UIManager';

export interface GameOverData {
  score: number;
  gameTime: number;
  level: number;
  reason: 'death' | 'victory';
  survivalBonus: number;
}

export class GameStateManager {
  private scene: Scene;
  private player: Player;
  private timerManager: TimerManager;
  private experienceManager: ExperienceManager;
  private uiManager: UIManager;
  
  private isGameOver: boolean = false;
  private isGameWon: boolean = false;

  constructor(
    scene: Scene,
    player: Player,
    timerManager: TimerManager,
    experienceManager: ExperienceManager,
    uiManager: UIManager
  ) {
    this.scene = scene;
    this.player = player;
    this.timerManager = timerManager;
    this.experienceManager = experienceManager;
    this.uiManager = uiManager;

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
  private gameOver(): void {
    if (this.isGameOver || this.isGameWon) return;

    this.isGameOver = true;
    this.timerManager.stop();

    const gameOverData: GameOverData = {
      score: this.getCurrentScore(),
      gameTime: this.timerManager.getGameTime(),
      level: this.experienceManager.getLevel(),
      reason: 'death',
      survivalBonus: 0
    };

    console.log('💀 Game Over - Datos:', gameOverData);

    // Emitir evento con datos completos
    this.scene.events.emit('gameOver', gameOverData);
  }

  /**
   * Maneja la victoria del juego
   */
  private gameWin(): void {
    if (this.isGameOver || this.isGameWon) return;

    this.isGameWon = true;
    this.timerManager.stop();

    const gameOverData: GameOverData = {
      score: this.getCurrentScore(),
      gameTime: this.timerManager.getGameTime(),
      level: this.experienceManager.getLevel(),
      reason: 'victory',
      survivalBonus: Math.floor(this.getCurrentScore() * 0.5)
    };

    console.log('🏆 ¡Victoria! - Datos:', gameOverData);

    // Emitir evento con datos completos
    this.scene.events.emit('gameOver', gameOverData);
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
    console.log('🔄 GameStateManager: Estado reiniciado');
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