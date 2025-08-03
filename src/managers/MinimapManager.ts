import { Scene } from 'phaser';
import { WorldManager } from './WorldManager';
import { EnemyManager } from './EnemyManager';
import { Player } from './Player';

export interface MinimapData {
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
}

export class MinimapManager {
  private scene: Scene;
  private worldManager: WorldManager;
  private enemyManager: EnemyManager;
  private player: Player;
  private lastUpdateTime: number = 0;
  private updateInterval: number = 1000; // Actualizar cada 1000ms (era 500ms)

  constructor(scene: Scene, worldManager: WorldManager, enemyManager: EnemyManager, player: Player) {
    this.scene = scene;
    this.worldManager = worldManager;
    this.enemyManager = enemyManager;
    this.player = player;
  }

  /**
   * Actualiza la información del minimapa
   * @returns Datos del minimapa
   */
  update(): MinimapData {
    const currentTime = Date.now();
    
    // Solo actualizar si ha pasado el tiempo suficiente
    if (currentTime - this.lastUpdateTime < this.updateInterval) {
      return this.getLastData();
    }

    this.lastUpdateTime = currentTime;
    
    const playerPos = this.player.getPosition();
    const worldInfo = this.worldManager.getMinimapInfo();
    const enemyInfo = this.enemyManager.getRadarInfo(playerPos.x, playerPos.y);

    // Debug: verificar que el minimapa se esté actualizando
    console.log(`🗺️ MinimapManager: ${enemyInfo.length} enemigos detectados, chunk: ${worldInfo.playerChunk.x},${worldInfo.playerChunk.y}`);

    const minimapData: MinimapData = {
      playerChunk: worldInfo.playerChunk,
      worldSize: worldInfo.worldSize,
      activeChunks: worldInfo.activeChunks,
      playerPosition: worldInfo.playerPosition,
      enemies: enemyInfo
    };

    // Emitir evento con los datos del minimapa
    this.scene.events.emit('minimapUpdate', minimapData);

    return minimapData;
  }

  /**
   * Obtiene los datos del minimapa sin actualizar
   */
  getData(): MinimapData {
    const playerPos = this.player.getPosition();
    const worldInfo = this.worldManager.getMinimapInfo();
    const enemyInfo = this.enemyManager.getRadarInfo(playerPos.x, playerPos.y);

    return {
      playerChunk: worldInfo.playerChunk,
      worldSize: worldInfo.worldSize,
      activeChunks: worldInfo.activeChunks,
      playerPosition: worldInfo.playerPosition,
      enemies: enemyInfo
    };
  }

  /**
   * Obtiene los datos del minimapa para el radar
   */
  getRadarData(): {
    total: number;
    nearby: number;
    positions: Array<{ x: number; y: number }>;
  } {
    const playerPos = this.player.getPosition();
    const enemies = this.enemyManager.getEnemies();
    const nearbyEnemies = this.enemyManager.getNearbyEnemies(playerPos.x, playerPos.y, 400);

    return {
      total: enemies.length,
      nearby: nearbyEnemies.length,
      positions: enemies.map(enemy => ({ x: enemy.x, y: enemy.y }))
    };
  }

  /**
   * Obtiene información de enemigos cercanos
   * @param range - Rango de detección en píxeles
   */
  getNearbyEnemies(range: number = 400): Array<{
    id: string;
    x: number;
    y: number;
    type: string;
    distance: number;
  }> {
    const playerPos = this.player.getPosition();
    return this.enemyManager.getRadarInfo(playerPos.x, playerPos.y)
      .filter(enemy => enemy.distance <= range);
  }

  /**
   * Obtiene el enemigo más cercano
   */
  getClosestEnemy(): {
    id: string;
    x: number;
    y: number;
    type: string;
    distance: number;
  } | null {
    const enemies = this.enemyManager.getRadarInfo(this.player.getPosition().x, this.player.getPosition().y);
    
    if (enemies.length === 0) return null;

    return enemies.reduce((closest, current) => 
      current.distance < closest.distance ? current : closest
    );
  }

  /**
   * Obtiene información del chunk actual del jugador
   */
  getPlayerChunkInfo(): {
    chunkX: number;
    chunkY: number;
    chunkId: string;
    worldX: number;
    worldY: number;
  } {
    const playerPos = this.player.getPosition();
    const chunkSize = 800; // Tamaño del chunk
    
    const chunkX = Math.floor(playerPos.x / chunkSize);
    const chunkY = Math.floor(playerPos.y / chunkSize);
    const chunkId = `${chunkX}_${chunkY}`;
    
    return {
      chunkX,
      chunkY,
      chunkId,
      worldX: chunkX * chunkSize,
      worldY: chunkY * chunkSize
    };
  }

  /**
   * Obtiene información de los chunks activos
   */
  getActiveChunksInfo(): Array<{
    id: string;
    x: number;
    y: number;
    distance: number;
  }> {
    const playerChunk = this.getPlayerChunkInfo();
    const activeChunks = this.worldManager.getActiveChunks();
    
    return activeChunks.map(chunkId => {
      const [x, y] = chunkId.split('_').map(Number);
      const distance = Math.sqrt(
        Math.pow(x - playerChunk.chunkX, 2) + 
        Math.pow(y - playerChunk.chunkY, 2)
      );
      
      return {
        id: chunkId,
        x,
        y,
        distance
      };
    }).sort((a, b) => a.distance - b.distance);
  }

  /**
   * Configura el intervalo de actualización del minimapa
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
   * Fuerza una actualización inmediata del minimapa
   */
  forceUpdate(): MinimapData {
    this.lastUpdateTime = 0; // Resetear el tiempo para forzar actualización
    return this.update();
  }

  /**
   * Obtiene los últimos datos del minimapa (sin actualizar)
   */
  private getLastData(): MinimapData {
    // En una implementación real, aquí guardaríamos los últimos datos
    // Por ahora, simplemente obtenemos los datos actuales
    return this.getData();
  }

  /**
   * Destruye el manager del minimapa
   */
  destroy(): void {
    // Limpiar eventos si es necesario
    this.scene.events.off('minimapUpdate');
  }
} 