import { Scene } from 'phaser';
import { Player } from './Player';

export class CameraManager {
  private player: Player;
  private camera: Phaser.Cameras.Scene2D.Camera;
  private isFollowing: boolean = false;
  private followOffset: { x: number; y: number } = { x: 0, y: 0 };

  constructor(scene: Scene, player: Player) {
    this.player = player;
    this.camera = scene.cameras.main;
  }

  /**
   * Inicia el seguimiento de la cámara al jugador
   * @param offsetX - Offset horizontal de la cámara respecto al jugador
   * @param offsetY - Offset vertical de la cámara respecto al jugador
   */
  startFollowing(offsetX: number = 0, offsetY: number = 0): void {
    this.followOffset = { x: offsetX, y: offsetY };
    this.isFollowing = true;
    
    // Configurar la cámara para seguir al jugador
    this.camera.startFollow(this.player.getSprite(), true);
    this.camera.setFollowOffset(this.followOffset.x, this.followOffset.y);
    
    console.log('📷 Cámara siguiendo al jugador');
  }

  /**
   * Detiene el seguimiento de la cámara
   */
  stopFollowing(): void {
    this.isFollowing = false;
    this.camera.stopFollow();
    console.log('📷 Cámara detenida');
  }

  /**
   * Actualiza la posición de la cámara (llamar en update)
   */
  update(): void {
    if (!this.isFollowing) return;

    // La cámara se actualiza automáticamente con startFollow
    // Pero podemos agregar lógica adicional aquí si es necesario
  }

  /**
   * Mueve la cámara a una posición específica
   * @param x - Posición X
   * @param y - Posición Y
   * @param duration - Duración de la transición en ms
   */
  moveTo(x: number, y: number, duration: number = 1000): void {
    this.camera.pan(x, y, duration, 'Power2');
  }

  /**
   * Hace zoom en la cámara
   * @param zoom - Factor de zoom (1 = normal, 2 = doble zoom, 0.5 = mitad)
   * @param duration - Duración de la transición en ms
   */
  setZoom(zoom: number, duration: number = 500): void {
    this.camera.zoomTo(zoom, duration, 'Power2');
  }

  /**
   * Resetea el zoom de la cámara
   * @param duration - Duración de la transición en ms
   */
  resetZoom(duration: number = 500): void {
    this.camera.zoomTo(1, duration, 'Power2');
  }

  /**
   * Aplica un shake a la cámara
   * @param intensity - Intensidad del shake
   * @param duration - Duración del shake en ms
   */
  shake(intensity: number = 0.05, duration: number = 250): void {
    this.camera.shake(duration, intensity);
  }

  /**
   * Aplica un flash a la cámara
   * @param color - Color del flash
   * @param duration - Duración del flash en ms
   */
  flash(color: number = 0xffffff, duration: number = 200): void {
    this.camera.flash(duration, color);
  }

  /**
   * Aplica un fade a la cámara
   * @param color - Color del fade
   * @param duration - Duración del fade en ms
   */
  fade(color: number = 0x000000, duration: number = 500): void {
    this.camera.fade(duration, color);
  }

  /**
   * Obtiene la posición actual de la cámara
   */
  getPosition(): { x: number; y: number } {
    return {
      x: this.camera.scrollX,
      y: this.camera.scrollY
    };
  }

  /**
   * Obtiene el zoom actual de la cámara
   */
  getZoom(): number {
    return this.camera.zoom;
  }

  /**
   * Verifica si la cámara está siguiendo al jugador
   */
  isFollowingPlayer(): boolean {
    return this.isFollowing;
  }

  /**
   * Configura los límites del mundo para la cámara
   * @param worldBounds - Límites del mundo { x, y, width, height }
   */
  setWorldBounds(worldBounds: { x: number; y: number; width: number; height: number }): void {
    this.camera.setBounds(worldBounds.x, worldBounds.y, worldBounds.width, worldBounds.height);
  }

  /**
   * Elimina los límites del mundo de la cámara
   */
  removeWorldBounds(): void {
    this.camera.setBounds(0, 0, 0, 0);
  }

  /**
   * Destruye el manager de cámara
   */
  destroy(): void {
    this.stopFollowing();
  }
} 