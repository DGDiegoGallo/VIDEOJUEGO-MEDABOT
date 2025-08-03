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
      renderDistance: 2, // Volver a 2 para mejor funcionalidad
      riverWidth: 60,
      bridgeWidth: 100,
      structureDensity: 0.2, // Mantener reducido para rendimiento
      terrainSeed: Math.random() * 1000,
      worldSize: 12, // Volver a mundo más grande pero controlado
      autoGenerateChunks: 12, // Generar chunks iniciales
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
   * Genera los chunks iniciales en un patrón 3x3 (optimizado)
   */
  private generateInitialChunks(): void {
    const chunksPerRow = 3;
    const chunksPerCol = 3;
    const startX = -1; // Empezar desde -1 para centrar (3 chunks: -1, 0, 1)
    const startY = -1;

    for (let x = startX; x < startX + chunksPerRow; x++) {
      for (let y = startY; y < startY + chunksPerCol; y++) {
        this.generateChunk(x, y);
        this.activeChunks.add(`${x}_${y}`);
      }
    }

    console.log(`🌍 Mundo inicial generado: ${chunksPerRow}x${chunksPerCol} chunks (${this.chunks.size} total)`);
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

      // Generar chunks necesarios y limpiar distantes (mundo dinámico optimizado)
      this.generateNearbyChunksIfNeeded(currentChunk.x, currentChunk.y);
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
   * Genera chunks cercanos al jugador si es necesario (optimizado y funcional)
   */
  private generateNearbyChunksIfNeeded(centerX: number, centerY: number): void {
    const distance = this.config.renderDistance;

    // NO limpiar chunks activos - mantener todos los chunks generados como activos
    // Solo agregar nuevos chunks al conjunto de activos

    // Generar chunks dentro del rango de renderizado
    for (let x = centerX - distance; x <= centerX + distance; x++) {
      for (let y = centerY - distance; y <= centerY + distance; y++) {
        const chunkId = `${x}_${y}`;

        // Generar chunk si no existe
        if (!this.chunks.has(chunkId)) {
          this.generateChunk(x, y);
          console.log(`🗺️ Nuevo chunk generado: ${chunkId} en (${x * this.config.chunkSize}, ${y * this.config.chunkSize})`);
        }

        // Activar chunk (mantener todos los chunks como activos para colisiones)
        this.activeChunks.add(chunkId);

        // Hacer visible el chunk
        const chunk = this.chunks.get(chunkId);
        if (chunk) {
          if (chunk.terrain) chunk.terrain.setVisible(true);
          if (chunk.rivers) chunk.rivers.setVisible(true);
          if (chunk.bridges) chunk.bridges.setVisible(true);
          if (chunk.structures) chunk.structures.setVisible(true);
        }
      }
    }

    // Solo ocultar visualmente chunks muy distantes (pero mantener física activa)
    const hideDistance = distance + 2; // Ocultar solo chunks muy lejanos
    this.chunks.forEach((chunk, chunkId) => {
      const chunkDistance = Math.max(
        Math.abs(chunk.x - centerX),
        Math.abs(chunk.y - centerY)
      );

      if (chunkDistance > hideDistance) {
        // Solo ocultar visualmente, NO desactivar física
        if (chunk.terrain) chunk.terrain.setVisible(false);
        if (chunk.bridges) chunk.bridges.setVisible(false);
        // NO ocultar ríos y estructuras - necesarios para colisiones
      }
    });
  }

  /**
   * Genera un chunk específico
   */
  private generateChunk(chunkX: number, chunkY: number): void {
    const chunkId = `${chunkX}_${chunkY}`;
    const worldX = chunkX * this.config.chunkSize;
    const worldY = chunkY * this.config.chunkSize;

    console.log(`🔧 Generando chunk ${chunkId} en posición (${worldX}, ${worldY})`);

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

    // Log de diagnóstico
    const riverCount = chunk.rivers.children.entries.length;
    const structureCount = chunk.structures.children.entries.length;
    console.log(`✅ Chunk ${chunkId} generado: ${riverCount} ríos, ${structureCount} estructuras`);

    console.log(`🗺️ Chunk generado: ${chunkId} en (${worldX}, ${worldY})`);
  }

  /**
   * Genera el terreno base del chunk (optimizado)
   */
  private generateTerrain(chunk: WorldChunk, worldX: number, worldY: number): void {
    const size = this.config.chunkSize;

    // Reducir tiles de 4x4 a 2x2 para mejor rendimiento
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const tileX = worldX + (i * size / 2);
        const tileY = worldY + (j * size / 2);
        const tileSize = size / 2;

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

        // Reducir grosor del borde para mejor rendimiento
        terrainTile.setStrokeStyle(1, 0x1a3d0a, 0.2);
        terrainTile.setDepth(-90); // Fondo del terreno
        chunk.terrain.add(terrainTile);
      }
    }
  }

  /**
   * Genera ríos usando ruido Perlin (optimizado)
   */
  private generateRivers(chunk: WorldChunk, worldX: number, worldY: number): void {
    const size = this.config.chunkSize;
    const riverWidth = this.config.riverWidth;

    // Generar río horizontal si el ruido lo indica (probabilidad aún más reducida)
    const horizontalRiverNoise = this.noise2D(worldX * 0.005, worldY * 0.005);
    if (horizontalRiverNoise > 0.75) { // Aumentado de 0.6 a 0.75 para menos ríos
      const riverY = worldY + size * 0.5; // Centrado en el chunk para mejor alineación

      // Crear río continuo con menos segmentos (mejor rendimiento)
      for (let x = worldX; x < worldX + size; x += 40) { // Aumentado de 20 a 40
        const riverSegment = this.scene.add.rectangle(
          x + 20,
          riverY,
          40, // Aumentado de 20 a 40
          riverWidth,
          0x4a90e2
        );

        riverSegment.setStrokeStyle(1, 0x2980b9); // Reducido grosor de borde
        riverSegment.setDepth(-80); // Ríos por encima del terreno pero debajo del jugador

        // Agregar física para que sea un obstáculo sólido
        this.scene.physics.add.existing(riverSegment, true); // true = static body

        chunk.rivers.add(riverSegment);
      }

      // Marcar que este chunk tiene río horizontal
      (chunk as any).hasHorizontalRiver = true;
      (chunk as any).horizontalRiverY = riverY;
    }

    // Generar río vertical si el ruido lo indica (probabilidad aún más reducida)
    const verticalRiverNoise = this.noise2D(worldX * 0.003, worldY * 0.007);
    if (verticalRiverNoise > 0.8) { // Aumentado de 0.7 a 0.8 para menos ríos
      const riverX = worldX + size * 0.5; // Centrado en el chunk para mejor alineación

      // Crear río continuo con menos segmentos (mejor rendimiento)
      for (let y = worldY; y < worldY + size; y += 40) { // Aumentado de 20 a 40
        const riverSegment = this.scene.add.rectangle(
          riverX,
          y + 20,
          riverWidth,
          40, // Aumentado de 20 a 40
          0x4a90e2
        );

        riverSegment.setStrokeStyle(1, 0x2980b9); // Reducido grosor de borde
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
   * Genera estructuras procedurales (arreglado para generar estructuras)
   */
  private generateStructures(chunk: WorldChunk, worldX: number, worldY: number): void {
    const size = this.config.chunkSize;
    const density = this.config.structureDensity;

    // ARREGLADO: Garantizar que se generen estructuras
    const baseStructures = 2; // Mínimo 2 estructuras por chunk
    const extraStructures = Math.floor(Math.random() * density * 6); // 0-1.2 extra
    const structureCount = baseStructures + extraStructures;

    console.log(`🏗️ Generando ${structureCount} estructuras en chunk (${worldX}, ${worldY})`);

    for (let i = 0; i < structureCount; i++) {
      const structX = worldX + Math.random() * size;
      const structY = worldY + Math.random() * size;

      // Simplificar verificación de ríos - solo evitar si está MUY cerca
      const isNearRiver = this.isNearRiver(structX, structY, chunk);
      if (isNearRiver && Math.random() > 0.5) continue; // 50% probabilidad de evitar ríos

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
    const roof = this.scene.add.triangle(x, y - height / 2 - 8, 0, 16, roofWidth / 2, 0, -roofWidth / 2, 0, 0xe74c3c);
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
    const support1 = this.scene.add.rectangle(x - width / 3, y + 15, 8, 20, 0xd68910);
    const support2 = this.scene.add.rectangle(x + width / 3, y + 15, 8, 20, 0xd68910);

    support1.setDepth(-60); // Misma profundidad que la plataforma
    support2.setDepth(-60); // Misma profundidad que la plataforma

    this.scene.physics.add.existing(support1, true);
    this.scene.physics.add.existing(support2, true);

    chunk.structures.add(platform);
    chunk.structures.add(support1);
    chunk.structures.add(support2);
  }

  /**
   * Limpia chunks distantes para optimizar memoria (optimizado)
   */
  private cleanupDistantChunks(centerX: number, centerY: number): void {
    const maxDistance = this.config.renderDistance + 2; // Un poco más de margen
    const chunksToRemove: string[] = [];

    // Solo limpiar si tenemos demasiados chunks
    if (this.chunks.size > 25) { // Límite de chunks en memoria
      this.chunks.forEach((chunk, chunkId) => {
        const distance = Math.max(
          Math.abs(chunk.x - centerX),
          Math.abs(chunk.y - centerY)
        );

        if (distance > maxDistance) {
          chunksToRemove.push(chunkId);
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
          this.activeChunks.delete(chunkId);
        }
      });

      if (chunksToRemove.length > 0) {
        console.log(`🗑️ Limpiados ${chunksToRemove.length} chunks distantes (total: ${this.chunks.size})`);
      }
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
   * Obtiene todas las estructuras con física de TODOS los chunks generados (NO incluye ríos ni puentes)
   */
  getPhysicsStructures(): Phaser.GameObjects.GameObject[] {
    const structures: Phaser.GameObjects.GameObject[] = [];
    let totalChunks = 0;
    let chunksWithStructures = 0;

    // Usar TODOS los chunks generados, no solo los activos
    this.chunks.forEach((chunk, chunkId) => {
      if (chunk && chunk.generated) {
        totalChunks++;
        let chunkStructures = 0;
        
        // Agregar estructuras con física (cubos, torres, muros, plataformas)
        chunk.structures.children.entries.forEach(structure => {
          const gameObject = structure as Phaser.GameObjects.GameObject;
          if (gameObject.body) { // Solo estructuras con física
            structures.push(gameObject);
            chunkStructures++;
          }
        });

        if (chunkStructures > 0) {
          chunksWithStructures++;
        }

        // NO agregar ríos aquí - los ríos solo son obstáculos para el jugador
        // NO agregar puentes aquí - los puentes son completamente atravesables
      }
    });

    // Log cada 60 frames (1 segundo aprox)
    if (Math.random() < 0.016) { // ~1/60
      console.log(`🏗️ Estructuras físicas: ${structures.length} total, ${chunksWithStructures}/${totalChunks} chunks con estructuras`);
    }

    return structures;
  }

  /**
   * Obtiene todos los ríos con física de TODOS los chunks generados (solo para colisiones del jugador)
   */
  getPhysicsRivers(): Phaser.GameObjects.GameObject[] {
    const rivers: Phaser.GameObjects.GameObject[] = [];
    let totalChunks = 0;
    let chunksWithRivers = 0;

    // Usar TODOS los chunks generados, no solo los activos
    this.chunks.forEach((chunk, chunkId) => {
      if (chunk && chunk.generated) {
        totalChunks++;
        let chunkRivers = 0;
        
        // Agregar ríos con física (obstáculos sólidos solo para el jugador)
        chunk.rivers.children.entries.forEach(river => {
          const gameObject = river as Phaser.GameObjects.GameObject;
          if (gameObject.body) { // Solo ríos con física
            rivers.push(gameObject);
            chunkRivers++;
          }
        });

        if (chunkRivers > 0) {
          chunksWithRivers++;
        }
      }
    });

    // Log cada 60 frames (1 segundo aprox)
    if (Math.random() < 0.016) { // ~1/60
      console.log(`🌊 Ríos físicos: ${rivers.length} total, ${chunksWithRivers}/${totalChunks} chunks con ríos`);
    }

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
   * Aplica wraparound al mundo (DESACTIVADO para mundo dinámico infinito)
   * @param x - Posición X del jugador
   * @param y - Posición Y del jugador
   * @returns Nueva posición sin wraparound (mundo infinito)
   */
  applyWraparound(x: number, y: number): { x: number; y: number } {
    // DESACTIVADO: Permitir mundo infinito dinámico
    // El wraparound estaba limitando el mundo y causando teletransporte
    
    // Mundo infinito sin límites - log desactivado para mejor rendimiento
    
    // Devolver la posición original sin modificar
    return { x, y };
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

  /**
   * Método de diagnóstico para verificar el estado del mundo
   */
  diagnoseWorld(playerX: number, playerY: number): void {
    const currentChunk = this.getChunkCoordinates(playerX, playerY);
    const chunkId = `${currentChunk.x}_${currentChunk.y}`;
    const chunk = this.chunks.get(chunkId);
    
    console.log(`🔍 DIAGNÓSTICO MUNDO:`);
    console.log(`  Jugador en: (${Math.round(playerX)}, ${Math.round(playerY)})`);
    console.log(`  Chunk actual: ${chunkId}`);
    console.log(`  Chunk existe: ${chunk ? 'SÍ' : 'NO'}`);
    
    if (chunk) {
      const rivers = chunk.rivers.children.entries.length;
      const structures = chunk.structures.children.entries.length;
      const riversWithPhysics = chunk.rivers.children.entries.filter(r => (r as any).body).length;
      const structuresWithPhysics = chunk.structures.children.entries.filter(s => (s as any).body).length;
      
      console.log(`  Ríos: ${rivers} total, ${riversWithPhysics} con física`);
      console.log(`  Estructuras: ${structures} total, ${structuresWithPhysics} con física`);
    }
    
    console.log(`  Total chunks: ${this.chunks.size}`);
    console.log(`  Chunks activos: ${this.activeChunks.size}`);
    
    const allStructures = this.getPhysicsStructures();
    const allRivers = this.getPhysicsRivers();
    console.log(`  Estructuras físicas globales: ${allStructures.length}`);
    console.log(`  Ríos físicos globales: ${allRivers.length}`);
  }

  /**
   * Verifica si una posición está dentro de los límites del mundo
   */
  isWithinWorldBounds(x: number, y: number): boolean {
    const halfWorldSize = (this.config.worldSize * this.config.chunkSize) / 2;
    return x >= -halfWorldSize && x <= halfWorldSize &&
      y >= -halfWorldSize && y <= halfWorldSize;
  }



  /**
   * Precarga un chunk específico (versión pública para LoadingManager)
   */
  preloadChunk(chunkX: number, chunkY: number): void {
    const chunkId = `${chunkX}_${chunkY}`;
    if (!this.chunks.has(chunkId) && this.isWithinWorldBounds(chunkX * this.config.chunkSize, chunkY * this.config.chunkSize)) {
      this.generateChunk(chunkX, chunkY);
    }
  }

  /**
   * Recrea los grupos de un chunk si están corruptos
   */
  recreateChunkGroups(chunk: WorldChunk): void {
    if (!chunk.terrain || chunk.terrain.scene === null) {
      chunk.terrain = this.scene.add.group();
    }
    if (!chunk.rivers || chunk.rivers.scene === null) {
      chunk.rivers = this.scene.add.group();
    }
    if (!chunk.bridges || chunk.bridges.scene === null) {
      chunk.bridges = this.scene.add.group();
    }
    if (!chunk.structures || chunk.structures.scene === null) {
      chunk.structures = this.scene.add.group();
    }
  }
}