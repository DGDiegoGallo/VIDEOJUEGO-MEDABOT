import { Scene } from 'phaser';

/**
 * Configuración del mundo procedural
 */
interface WorldConfig {
  chunkSize: number;
  renderDistance: number;
  riverWidth: number;
  bridgeWidth: number;
  structureDensity: number;
  terrainSeed: number;
  worldSize: number; // Tamaño del mundo para wraparound
  autoGenerateChunks: number; // Número de chunks a generar automáticamente
}

/**
 * Representa un chunk del mundo
 */
interface WorldChunk {
  x: number;
  y: number;
  id: string;
  terrain: Phaser.GameObjects.Group;
  rivers: Phaser.GameObjects.Group;
  bridges: Phaser.GameObjects.Group;
  structures: Phaser.GameObjects.Group;
  generated: boolean;
  hasHorizontalRiver?: boolean;
  horizontalRiverY?: number;
  hasVerticalRiver?: boolean;
  verticalRiverX?: number;
}

/**
 * Tipos de estructuras que pueden aparecer
 */
enum StructureType {
  CUBE = 'cube',
  TOWER = 'tower',
  WALL = 'wall',
  PLATFORM = 'platform'
}

/**
 * Manager para la generación procedural del mundo
 * 
 * Responsabilidades:
 * - Generar chunks del mundo dinámicamente
 * - Crear ríos con ruido Perlin
 * - Colocar puentes automáticamente
 * - Generar estructuras procedurales
 * - Optimizar renderizado por distancia
 */
export class WorldManager {
  private scene: Scene;
  private config: WorldConfig;
  private chunks: Map<string, WorldChunk> = new Map();
  private activeChunks: Set<string> = new Set();
  private lastPlayerChunk: { x: number; y: number } = { x: 0, y: 0 };

  // Grupos principales para organización
  private worldContainer!: Phaser.GameObjects.Container;

  constructor(scene: Scene, config?: Partial<WorldConfig>) {
    this.scene = scene;
    this.config = {
      chunkSize: 800,
      renderDistance: 2,
      riverWidth: 60,
      bridgeWidth: 100,
      structureDensity: 0.3,
      terrainSeed: Math.random() * 1000,
      worldSize: 12, // 12 chunks para el mundo
      autoGenerateChunks: 12, // Generar 12 chunks automáticamente
      ...config
    };

    this.initializeWorld();
  }

  /**
   * Inicializa el sistema de mundo
   */
  private initializeWorld(): void {
    // Crear contenedor principal del mundo con profundidad baja (fondo)
    this.worldContainer = this.scene.add.container(0, 0);
    this.worldContainer.setDepth(-100); // Muy atrás, detrás de todo

    // Generar 12 chunks automáticamente en un patrón 4x3
    this.generateInitialChunks();

    console.log('🌍 WorldManager: Sistema de mundo inicializado con 12 chunks automáticos');
  }

  /**
   * Genera los chunks iniciales en un patrón 4x3
   */
  private generateInitialChunks(): void {
    const chunksPerRow = 4;
    const chunksPerCol = 3;
    const startX = -1; // Empezar desde -1 para centrar
    const startY = -1;

    for (let x = startX; x < startX + chunksPerRow; x++) {
      for (let y = startY; y < startY + chunksPerCol; y++) {
        this.generateChunk(x, y);
        this.activeChunks.add(`${x}_${y}`);
      }
    }
  }

  /**
   * Actualiza el mundo basado en la posición del jugador
   * @param playerX - Posición X del jugador
   * @param playerY - Posición Y del jugador
   */
  updateWorld(playerX: number, playerY: number): void {
    const currentChunk = this.getChunkCoordinates(playerX, playerY);
    
    // Solo actualizar si el jugador cambió de chunk
    if (currentChunk.x !== this.lastPlayerChunk.x || currentChunk.y !== this.lastPlayerChunk.y) {
      this.lastPlayerChunk = currentChunk;
      
      // Generar chunks silenciosamente sin mostrar animación de carga
      this.generateNearbyChunks(currentChunk.x, currentChunk.y);
      this.cleanupDistantChunks(currentChunk.x, currentChunk.y);
    }
  }

  /**
   * Obtiene las coordenadas del chunk para una posición específica
   */
  private getChunkCoordinates(x: number, y: number): { x: number; y: number } {
    const chunkX = Math.floor(x / this.config.chunkSize);
    const chunkY = Math.floor(y / this.config.chunkSize);
    return { x: chunkX, y: chunkY };
  }

  /**
   * Genera chunks cercanos al jugador
   */
  private generateNearbyChunks(centerX: number, centerY: number): void {
    const distance = this.config.renderDistance;
    
    for (let x = centerX - distance; x <= centerX + distance; x++) {
      for (let y = centerY - distance; y <= centerY + distance; y++) {
        const chunkId = `${x}_${y}`;
        
        if (!this.chunks.has(chunkId)) {
          this.generateChunk(x, y);
        }
        
        this.activeChunks.add(chunkId);
      }
    }
  }

  /**
   * Genera un chunk específico
   */
  private generateChunk(chunkX: number, chunkY: number): void {
    const chunkId = `${chunkX}_${chunkY}`;
    const worldX = chunkX * this.config.chunkSize;
    const worldY = chunkY * this.config.chunkSize;

    const chunk: WorldChunk = {
      x: chunkX,
      y: chunkY,
      id: chunkId,
      terrain: this.scene.add.group(),
      rivers: this.scene.add.group(),
      bridges: this.scene.add.group(),
      structures: this.scene.add.group(),
      generated: false
    };

    // Generar contenido del chunk
    this.generateTerrain(chunk, worldX, worldY);
    this.generateRivers(chunk, worldX, worldY);
    this.generateBridges(chunk, worldX, worldY);
    this.generateStructures(chunk, worldX, worldY);

    chunk.generated = true;
    this.chunks.set(chunkId, chunk);

    console.log(`🗺️ Chunk generado: ${chunkId} en (${worldX}, ${worldY})`);
  }

  /**
   * Genera el terreno base del chunk
   */
  private generateTerrain(chunk: WorldChunk, worldX: number, worldY: number): void {
    const size = this.config.chunkSize;
    
    // Crear fondo del terreno con variaciones
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const tileX = worldX + (i * size / 4);
        const tileY = worldY + (j * size / 4);
        const tileSize = size / 4;
        
        // Usar ruido para variar el color del terreno
        const noise = this.noise2D(tileX * 0.01, tileY * 0.01);
        const baseColor = 0x2d5016; // Verde oscuro base
        const variation = Math.floor(noise * 40);
        const terrainColor = baseColor + (variation << 8); // Variar el componente verde
        
        const terrainTile = this.scene.add.rectangle(
          tileX + tileSize / 2,
          tileY + tileSize / 2,
          tileSize,
          tileSize,
          terrainColor
        );
        
        terrainTile.setStrokeStyle(1, 0x1a3d0a, 0.3);
        terrainTile.setDepth(-90); // Fondo del terreno
        chunk.terrain.add(terrainTile);
      }
    }
  }

  /**
   * Genera ríos usando ruido Perlin
   */
  private generateRivers(chunk: WorldChunk, worldX: number, worldY: number): void {
    const size = this.config.chunkSize;
    const riverWidth = this.config.riverWidth;
    
    // Generar río horizontal si el ruido lo indica (reducida probabilidad)
    const horizontalRiverNoise = this.noise2D(worldX * 0.005, worldY * 0.005);
    if (horizontalRiverNoise > 0.6) { // Aumentado de 0.3 a 0.6 para menos ríos
      const riverY = worldY + size * 0.5; // Centrado en el chunk para mejor alineación
      
      // Crear río continuo
      for (let x = worldX; x < worldX + size; x += 20) {
        const riverSegment = this.scene.add.rectangle(
          x + 10,
          riverY,
          20,
          riverWidth,
          0x4a90e2
        );
        
        riverSegment.setStrokeStyle(2, 0x2980b9);
        riverSegment.setDepth(-80); // Ríos por encima del terreno pero debajo del jugador
        
        // Agregar física para que sea un obstáculo sólido
        this.scene.physics.add.existing(riverSegment, true); // true = static body
        
        chunk.rivers.add(riverSegment);
      }
      
      // Marcar que este chunk tiene río horizontal
      (chunk as any).hasHorizontalRiver = true;
      (chunk as any).horizontalRiverY = riverY;
    }
    
    // Generar río vertical si el ruido lo indica (reducida probabilidad)
    const verticalRiverNoise = this.noise2D(worldX * 0.003, worldY * 0.007);
    if (verticalRiverNoise > 0.7) { // Aumentado de 0.4 a 0.7 para menos ríos
      const riverX = worldX + size * 0.5; // Centrado en el chunk para mejor alineación
      
      // Crear río continuo
      for (let y = worldY; y < worldY + size; y += 20) {
        const riverSegment = this.scene.add.rectangle(
          riverX,
          y + 10,
          riverWidth,
          20,
          0x4a90e2
        );
        
        riverSegment.setStrokeStyle(2, 0x2980b9);
        riverSegment.setDepth(-80); // Ríos por encima del terreno pero debajo del jugador
        
        // Agregar física para que sea un obstáculo sólido
        this.scene.physics.add.existing(riverSegment, true); // true = static body
        
        chunk.rivers.add(riverSegment);
      }
      
      // Marcar que este chunk tiene río vertical
      (chunk as any).hasVerticalRiver = true;
      (chunk as any).verticalRiverX = riverX;
    }
  }

  /**
   * Genera puentes sobre los ríos
   */
  private generateBridges(chunk: WorldChunk, worldX: number, worldY: number): void {
    const size = this.config.chunkSize;
    
    // Verificar si hay río horizontal y crear puente
    if ((chunk as any).hasHorizontalRiver && Math.random() > 0.3) { // 70% probabilidad de puente
      const riverY = (chunk as any).horizontalRiverY;
      const bridgeX = worldX + size * 0.5; // Centro del chunk
      
      // Crear 2 bloques de puente simples SIN colisiones
      const bridge1 = this.scene.add.rectangle(
        bridgeX - 30, // Primer bloque
        riverY,
        60, // Ancho del bloque
        this.config.riverWidth + 10, // Un poco más ancho que el río
        0x8b4513
      );
      bridge1.setStrokeStyle(2, 0x654321);
      bridge1.setDepth(-65); // Por encima de ríos
      // NO agregar física - permitir que el jugador y balas atraviesen
      chunk.bridges.add(bridge1);
      
      const bridge2 = this.scene.add.rectangle(
        bridgeX + 30, // Segundo bloque
        riverY,
        60, // Ancho del bloque
        this.config.riverWidth + 10, // Un poco más ancho que el río
        0x8b4513
      );
      bridge2.setStrokeStyle(2, 0x654321);
      bridge2.setDepth(-65); // Por encima de ríos
      // NO agregar física - permitir que el jugador y balas atraviesen
      chunk.bridges.add(bridge2);
      
      console.log(`🌉 Puente horizontal creado en chunk (${chunk.x}, ${chunk.y}) en Y=${riverY} - SIN colisiones`);
    }
    
    // Verificar si hay río vertical y crear puente
    if ((chunk as any).hasVerticalRiver && Math.random() > 0.3) { // 70% probabilidad de puente
      const riverX = (chunk as any).verticalRiverX;
      const bridgeY = worldY + size * 0.5; // Centro del chunk
      
      // Crear 2 bloques de puente simples SIN colisiones
      const bridge1 = this.scene.add.rectangle(
        riverX,
        bridgeY - 30, // Primer bloque
        this.config.riverWidth + 10, // Un poco más ancho que el río
        60, // Alto del bloque
        0x8b4513
      );
      bridge1.setStrokeStyle(2, 0x654321);
      bridge1.setDepth(-65); // Por encima de ríos
      // NO agregar física - permitir que el jugador y balas atraviesen
      chunk.bridges.add(bridge1);
      
      const bridge2 = this.scene.add.rectangle(
        riverX,
        bridgeY + 30, // Segundo bloque
        this.config.riverWidth + 10, // Un poco más ancho que el río
        60, // Alto del bloque
        0x8b4513
      );
      bridge2.setStrokeStyle(2, 0x654321);
      bridge2.setDepth(-65); // Por encima de ríos
      // NO agregar física - permitir que el jugador y balas atraviesen
      chunk.bridges.add(bridge2);
      
      console.log(`🌉 Puente vertical creado en chunk (${chunk.x}, ${chunk.y}) en X=${riverX} - SIN colisiones`);
    }
  }

  /**
   * Genera estructuras procedurales
   */
  private generateStructures(chunk: WorldChunk, worldX: number, worldY: number): void {
    const size = this.config.chunkSize;
    const density = this.config.structureDensity;
    
    // Determinar número de estructuras basado en densidad
    const structureCount = Math.floor(Math.random() * density * 8);
    
    for (let i = 0; i < structureCount; i++) {
      const structX = worldX + Math.random() * size;
      const structY = worldY + Math.random() * size;
      
      // Evitar colocar estructuras sobre ríos
      const isNearRiver = this.isNearRiver(structX, structY, chunk);
      if (isNearRiver) continue;
      
      const structureType = this.getRandomStructureType();
      this.createStructure(chunk, structX, structY, structureType);
    }
  }

  /**
   * Verifica si una posición está cerca de un río
   */
  private isNearRiver(x: number, y: number, chunk: WorldChunk): boolean {
    const minDistance = 80;
    
    for (const river of chunk.rivers.children.entries) {
      const riverSprite = river as Phaser.GameObjects.Rectangle;
      const distance = Phaser.Math.Distance.Between(x, y, riverSprite.x, riverSprite.y);
      if (distance < minDistance) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Obtiene un tipo de estructura aleatoria
   */
  private getRandomStructureType(): StructureType {
    const types = Object.values(StructureType);
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Crea una estructura específica
   */
  private createStructure(chunk: WorldChunk, x: number, y: number, type: StructureType): void {
    switch (type) {
      case StructureType.CUBE:
        this.createCubeStructure(chunk, x, y);
        break;
      case StructureType.TOWER:
        this.createTowerStructure(chunk, x, y);
        break;
      case StructureType.WALL:
        this.createWallStructure(chunk, x, y);
        break;
      case StructureType.PLATFORM:
        this.createPlatformStructure(chunk, x, y);
        break;
    }
  }

  /**
   * Crea una estructura tipo cubo
   */
  private createCubeStructure(chunk: WorldChunk, x: number, y: number): void {
    const size = 30 + Math.random() * 40;
    const color = 0x7f8c8d;
    
    const cube = this.scene.add.rectangle(x, y, size, size, color);
    cube.setStrokeStyle(2, 0x34495e);
    cube.setDepth(-60); // Estructuras por encima de puentes pero debajo del jugador
    
    // Agregar física para colisiones
    this.scene.physics.add.existing(cube, true); // true = static body
    
    // Agregar sombra
    const shadow = this.scene.add.rectangle(x + 3, y + 3, size, size, 0x2c3e50, 0.3);
    shadow.setDepth(-65); // Sombra más atrás que la estructura
    
    chunk.structures.add(shadow);
    chunk.structures.add(cube);
  }

  /**
   * Crea una estructura tipo torre
   */
  private createTowerStructure(chunk: WorldChunk, x: number, y: number): void {
    const width = 25 + Math.random() * 15;
    const height = 60 + Math.random() * 40;
    const color = 0x95a5a6;
    
    const tower = this.scene.add.rectangle(x, y, width, height, color);
    tower.setStrokeStyle(2, 0x7f8c8d);
    tower.setDepth(-60); // Estructuras por encima de puentes pero debajo del jugador
    
    // Agregar física para colisiones
    this.scene.physics.add.existing(tower, true); // true = static body
    
    // Agregar techo
    const roofWidth = width + 10;
    const roof = this.scene.add.triangle(x, y - height/2 - 8, 0, 16, roofWidth/2, 0, -roofWidth/2, 0, 0xe74c3c);
    roof.setDepth(-60); // Misma profundidad que la torre
    this.scene.physics.add.existing(roof, true);
    
    chunk.structures.add(tower);
    chunk.structures.add(roof);
  }

  /**
   * Crea una estructura tipo muro
   */
  private createWallStructure(chunk: WorldChunk, x: number, y: number): void {
    const length = 80 + Math.random() * 60;
    const height = 20 + Math.random() * 20;
    const isHorizontal = Math.random() > 0.5;
    
    const wall = this.scene.add.rectangle(
      x, y,
      isHorizontal ? length : height,
      isHorizontal ? height : length,
      0x8e44ad
    );
    
    wall.setStrokeStyle(2, 0x6c3483);
    wall.setDepth(-60); // Estructuras por encima de puentes pero debajo del jugador
    
    // Agregar física para colisiones
    this.scene.physics.add.existing(wall, true); // true = static body
    
    chunk.structures.add(wall);
  }

  /**
   * Crea una estructura tipo plataforma
   */
  private createPlatformStructure(chunk: WorldChunk, x: number, y: number): void {
    const width = 50 + Math.random() * 30;
    const height = 15;
    const color = 0xf39c12;
    
    const platform = this.scene.add.rectangle(x, y, width, height, color);
    platform.setStrokeStyle(2, 0xe67e22);
    platform.setDepth(-60); // Estructuras por encima de puentes pero debajo del jugador
    
    // Agregar física para colisiones
    this.scene.physics.add.existing(platform, true); // true = static body
    
    // Agregar soportes
    const support1 = this.scene.add.rectangle(x - width/3, y + 15, 8, 20, 0xd68910);
    const support2 = this.scene.add.rectangle(x + width/3, y + 15, 8, 20, 0xd68910);
    
    support1.setDepth(-60); // Misma profundidad que la plataforma
    support2.setDepth(-60); // Misma profundidad que la plataforma
    
    this.scene.physics.add.existing(support1, true);
    this.scene.physics.add.existing(support2, true);
    
    chunk.structures.add(platform);
    chunk.structures.add(support1);
    chunk.structures.add(support2);
  }

  /**
   * Limpia chunks distantes para optimizar memoria
   */
  private cleanupDistantChunks(centerX: number, centerY: number): void {
    const maxDistance = this.config.renderDistance + 1;
    const chunksToRemove: string[] = [];
    
    this.chunks.forEach((chunk, chunkId) => {
      const distance = Math.max(
        Math.abs(chunk.x - centerX),
        Math.abs(chunk.y - centerY)
      );
      
      if (distance > maxDistance) {
        chunksToRemove.push(chunkId);
        this.activeChunks.delete(chunkId);
      }
    });
    
    // Remover chunks distantes
    chunksToRemove.forEach(chunkId => {
      const chunk = this.chunks.get(chunkId);
      if (chunk) {
        chunk.terrain.destroy(true);
        chunk.rivers.destroy(true);
        chunk.bridges.destroy(true);
        chunk.structures.destroy(true);
        this.chunks.delete(chunkId);
      }
    });
    
    if (chunksToRemove.length > 0) {
      console.log(`🗑️ Limpiados ${chunksToRemove.length} chunks distantes`);
    }
  }

  /**
   * Función de ruido 2D simplificada (implementación básica)
   */
  private noise2D(x: number, y: number): number {
    // Implementación simple de ruido basada en seno
    const seed = this.config.terrainSeed;
    return (Math.sin(x * seed) * Math.cos(y * seed) + 1) / 2;
  }

  /**
   * Obtiene todas las estructuras con física de los chunks activos (NO incluye ríos ni puentes)
   */
  getPhysicsStructures(): Phaser.GameObjects.GameObject[] {
    const structures: Phaser.GameObjects.GameObject[] = [];
    
    this.activeChunks.forEach(chunkId => {
      const chunk = this.chunks.get(chunkId);
      if (chunk) {
        // Agregar estructuras con física (cubos, torres, muros, plataformas)
        chunk.structures.children.entries.forEach(structure => {
          const gameObject = structure as Phaser.GameObjects.GameObject;
          if (gameObject.body) { // Solo estructuras con física
            structures.push(gameObject);
          }
        });
        
        // NO agregar ríos aquí - los ríos solo son obstáculos para el jugador
        // NO agregar puentes aquí - los puentes son completamente atravesables
      }
    });
    
    return structures;
  }

  /**
   * Obtiene todos los ríos con física (solo para colisiones del jugador)
   */
  getPhysicsRivers(): Phaser.GameObjects.GameObject[] {
    const rivers: Phaser.GameObjects.GameObject[] = [];
    
    this.activeChunks.forEach(chunkId => {
      const chunk = this.chunks.get(chunkId);
      if (chunk) {
        // Agregar ríos con física (obstáculos sólidos solo para el jugador)
        chunk.rivers.children.entries.forEach(river => {
          const gameObject = river as Phaser.GameObjects.GameObject;
          if (gameObject.body) { // Solo ríos con física
            rivers.push(gameObject);
          }
        });
      }
    });
    
    return rivers;
  }

  /**
   * Obtiene todos los puentes (para verificación - NO tienen física)
   */
  getPhysicsBridges(): Phaser.GameObjects.GameObject[] {
    const bridges: Phaser.GameObjects.GameObject[] = [];
    
    this.activeChunks.forEach(chunkId => {
      const chunk = this.chunks.get(chunkId);
      if (chunk) {
        // Agregar puentes (NO tienen física - son completamente atravesables)
        chunk.bridges.children.entries.forEach(bridge => {
          const gameObject = bridge as Phaser.GameObjects.GameObject;
          bridges.push(gameObject);
        });
      }
    });
    
    return bridges;
  }

  /**
   * Obtiene los IDs de los chunks activos
   */
  getActiveChunks(): string[] {
    return Array.from(this.activeChunks);
  }

  /**
   * Obtiene un chunk específico por ID
   */
  getChunk(chunkId: string): WorldChunk | undefined {
    return this.chunks.get(chunkId);
  }

  /**
   * Obtiene información del mundo actual
   */
  getWorldInfo(): { activeChunks: number; totalChunks: number; structures: number } {
    return {
      activeChunks: this.activeChunks.size,
      totalChunks: this.chunks.size,
      structures: this.getPhysicsStructures().length
    };
  }

  /**
   * Destruye el WorldManager y limpia la memoria
   */
  destroy(): void {
    this.chunks.forEach(chunk => {
      chunk.terrain.destroy(true);
      chunk.rivers.destroy(true);
      chunk.bridges.destroy(true);
      chunk.structures.destroy(true);
    });
    
    this.chunks.clear();
    this.activeChunks.clear();
    
    if (this.worldContainer) {
      this.worldContainer.destroy();
    }
    
    console.log('🌍 WorldManager: Destruido correctamente');
  }

  /**
   * Aplica wraparound al mundo (como Pacman)
   * @param x - Posición X del jugador
   * @param y - Posición Y del jugador
   * @returns Nueva posición con wraparound aplicado
   */
  applyWraparound(x: number, y: number): { x: number; y: number } {
    const worldWidth = this.config.worldSize * this.config.chunkSize;
    const worldHeight = this.config.worldSize * this.config.chunkSize;
    
    let newX = x;
    let newY = y;
    
    // Wraparound horizontal
    if (x < -worldWidth / 2) {
      newX = worldWidth / 2;
    } else if (x > worldWidth / 2) {
      newX = -worldWidth / 2;
    }
    
    // Wraparound vertical
    if (y < -worldHeight / 2) {
      newY = worldHeight / 2;
    } else if (y > worldHeight / 2) {
      newY = -worldHeight / 2;
    }
    
    return { x: newX, y: newY };
  }

  /**
   * Obtiene información del mundo para el mini mapa
   */
  getMinimapInfo(): {
    playerChunk: { x: number; y: number };
    worldSize: number;
    activeChunks: string[];
    playerPosition: { x: number; y: number };
  } {
    return {
      playerChunk: this.lastPlayerChunk,
      worldSize: this.config.worldSize,
      activeChunks: Array.from(this.activeChunks),
      playerPosition: {
        x: this.lastPlayerChunk.x,
        y: this.lastPlayerChunk.y
      }
    };
  }
}