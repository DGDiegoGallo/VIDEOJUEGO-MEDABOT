import { Scene } from 'phaser';

export interface TimerConfig {
  gameTimeSeconds: number;
  currentShootInterval: number;
  isGameOver: boolean;
  isLevelingUp: boolean;
  isPausedByMenu: boolean;
}

export class TimerManager {
  private scene: Scene;
  private gameTimer: Phaser.Time.TimerEvent | null = null;
  private shootingTimer: Phaser.Time.TimerEvent | null = null;
  private gameTimeSeconds: number = 0;
  private currentShootInterval: number = 500;
  private gameOverState: boolean = false;
  private isLevelingUp: boolean = false;
  private isPausedByMenu: boolean = false;

  // Callbacks
  private onGameTimeUpdate?: (gameTime: number) => void;
  private onShoot?: () => void;
  private onGameOver?: () => void;
  private onGameWin?: () => void;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Configura los callbacks del timer
   */
  setCallbacks(callbacks: {
    onGameTimeUpdate?: (gameTime: number) => void;
    onShoot?: () => void;
    onGameOver?: () => void;
    onGameWin?: () => void;
  }): void {
    this.onGameTimeUpdate = callbacks.onGameTimeUpdate;
    this.onShoot = callbacks.onShoot;
    this.onGameOver = callbacks.onGameOver;
    this.onGameWin = callbacks.onGameWin;
  }

  /**
   * Crea el timer principal del juego (1 segundo = 1 segundo real)
   */
  createGameTimer(): void {
    if (this.gameTimer) {
      this.gameTimer.destroy();
    }

    this.gameTimer = this.scene.time.addEvent({
      delay: 1000, // 1 segundo exacto
      callback: () => {
        if (!this.gameOverState && !this.isLevelingUp && !this.isPausedByMenu) {
          this.gameTimeSeconds++;

          // Llamar callback si existe
          if (this.onGameTimeUpdate) {
            this.onGameTimeUpdate(this.gameTimeSeconds);
          }

          // Verificar victoria a los 8 minutos (480 segundos)
          if (this.gameTimeSeconds >= 480) {
            this.triggerGameWin();
          }
        }
      },
      callbackScope: this,
      loop: true
    });

    console.log('⏰ Timer del juego creado');
  }

  /**
   * Crea el timer de disparo automático
   */
  createShootingTimer(): void {
    if (this.shootingTimer) {
      this.shootingTimer.destroy();
    }

    this.shootingTimer = this.scene.time.addEvent({
      delay: this.currentShootInterval,
      callback: () => {
        if (!this.gameOverState && !this.isLevelingUp && !this.isPausedByMenu) {
          if (this.onShoot) {
            this.onShoot();
          }
        }
      },
      callbackScope: this,
      loop: true
    });
  }

  /**
   * Actualiza el intervalo de disparo
   * @param newInterval - Nuevo intervalo en milisegundos
   */
  updateShootInterval(newInterval: number): void {
    this.currentShootInterval = newInterval;
    
    if (this.shootingTimer) {
      this.shootingTimer.destroy();
      this.createShootingTimer();
    }
  }

  /**
   * Pausa todos los timers
   */
  pause(): void {
    this.isPausedByMenu = true;
    console.log('⏸️ Timers pausados');
  }

  /**
   * Reanuda todos los timers
   */
  resume(): void {
    this.isPausedByMenu = false;
    console.log('▶️ Timers reanudados');
  }

  /**
   * Pausa por subida de nivel
   */
  pauseForLevelUp(): void {
    this.isLevelingUp = true;
    console.log('📈 Timers pausados por subida de nivel');
  }

  /**
   * Reanuda después de subida de nivel
   */
  resumeAfterLevelUp(): void {
    this.isLevelingUp = false;
    console.log('📈 Timers reanudados después de subida de nivel');
  }

  /**
   * Detiene todos los timers (game over)
   */
  stop(): void {
    this.gameOverState = true;
    console.log('⏹️ Timers detenidos');
  }

  /**
   * Reinicia todos los timers
   */
  restart(): void {
    this.gameTimeSeconds = 0;
    this.gameOverState = false;
    this.isLevelingUp = false;
    this.isPausedByMenu = false;
    
    this.createGameTimer();
    this.createShootingTimer();
    
    console.log('🔄 Timers reiniciados');
  }

  /**
   * Obtiene el tiempo actual del juego en segundos
   */
  getGameTime(): number {
    return this.gameTimeSeconds;
  }

  /**
   * Obtiene el tiempo restante hasta la victoria (8 minutos = 480 segundos)
   */
  getRemainingTime(): number {
    return Math.max(0, 480 - this.gameTimeSeconds);
  }

  /**
   * Obtiene el intervalo de disparo actual
   */
  getShootInterval(): number {
    return this.currentShootInterval;
  }

  /**
   * Obtiene el estado actual de los timers
   */
  getState(): TimerConfig {
    return {
      gameTimeSeconds: this.gameTimeSeconds,
      currentShootInterval: this.currentShootInterval,
      isGameOver: this.gameOverState,
      isLevelingUp: this.isLevelingUp,
      isPausedByMenu: this.isPausedByMenu
    };
  }

  /**
   * Verifica si el juego está pausado
   */
  isPaused(): boolean {
    return this.gameOverState || this.isLevelingUp || this.isPausedByMenu;
  }

  /**
   * Verifica si el juego ha terminado
   */
  isGameOver(): boolean {
    return this.gameOverState;
  }

  /**
   * Dispara el evento de game over
   */
  private triggerGameOver(): void {
    this.gameOverState = true;
    if (this.onGameOver) {
      this.onGameOver();
    }
  }

  /**
   * Dispara el evento de game win
   */
  private triggerGameWin(): void {
    if (this.onGameWin) {
      this.onGameWin();
    }
  }

  /**
   * Destruye todos los timers y limpia recursos
   */
  destroy(): void {
    if (this.gameTimer) {
      this.gameTimer.destroy();
      this.gameTimer = null;
    }
    
    if (this.shootingTimer) {
      this.shootingTimer.destroy();
      this.shootingTimer = null;
    }

    console.log('🗑️ Timers destruidos');
  }
} 