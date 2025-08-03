import { Scene } from 'phaser';
import { StructureManager, StructureType, Structure } from './StructureManager';

/**
 * Configuración del mundo estático simplificado
 */
interface WorldConfig {
  chunkSize: number;
  riverWidth: number;
  bridgeWidth: number;
  structureDensity: number;
  terrainSeed: number;
  worldSize: number; // Tamaño del mundo (NxN chunks)
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

// StructureType ahora se importa desde StructureManager

/**
 * Manager para el mundo estático simplificado
 * 
 * Responsabilidades:
 * - Generar TODOS los chunks al inicio
 * - Crear ríos con ruido Perlin
 * - Colocar puentes automáticamente
 * - Generar estructuras procedurales
 * - Mantener todo permanente durante la partida
 */
export class WorldManager {
  private scene: Scene;
  private config: WorldConfig;
  private chunks: Map<string, WorldChunk> = new Map();
  private worldBounds: { minX: number; maxX: number; minY: number; maxY: number };
  private activeChunks: Set<string> = new Set();
  private lastPlayerChunk: { x: number; y: number } = { x: 0, y: 0 };

  // Grupos principales para organización
  private worldContainer!: Phaser.GameObjects.Container;
  private structureManager!: StructureManager;
  private allRivers: Phaser.GameObjects.GameObject[] = [];

  constructor(scene: Scene, config?: Partial<WorldConfig>) {
    this.scene = scene;
    this.config = {
      chunkSize: 800,
      riverWidth: 60,
      bridgeWidth: 100,
      structureDensity: 0.3, // Aumentar densidad ya que no hay problemas de rendimiento
      terrainSeed: Math.random() * 1000,
      worldSize: 8, // Mundo 8x8 = 64 chunks total
      ...config
    };

    // Calcular límites del mundo
    const halfWorld = (this.config.worldSize * this.config.chunkSize) / 2;
    this.worldBounds = {
      minX: -halfWorld,
      maxX: halfWorld,
      minY: -halfWorld,
      maxY: halfWorld
    };

    this.initializeWorld();
  }

  /**
   * Inicializa el sistema de mundo - GENERA TODO AL INICIO
   */
  private initializeWorld(): void {
    // Crear contenedor principal del mundo con profundidad baja (fondo)
    this.worldContainer = this.scene.add.container(0, 0);
    this.worldContainer.setDepth(-100); // Muy atrás, detrás de todo

    // Inicializar StructureManager
    this.structureManager = new StructureManager(this.scene);

    // Generar TODOS los chunks del mundo de una vez
    this.generateAllChunks();

    // Marcar todos los chunks como activos
    this.chunks.forEach((chunk, chunkId) => {
      this.activeChunks.add(chunkId);
    });

    const structureStats = this.structureManager.getStats();
    console.log(`🌍 WorldManager: Mundo completo generado - ${this.chunks.size} chunks permanentes`);
    console.log(`🏗️ Estructuras totales: ${structureStats.total} (${structureStats.withPhysics} con física)`);
    console.log(`🌊 Ríos totales: ${this.allRivers.length}`);
    console.log(`📏 Límites del mundo: (${this.worldBounds.minX}, ${this.worldBounds.minY}) a (${this.worldBounds.maxX}, ${this.worldBounds.maxY})`);
  }

  /**
   * Genera TODOS los chunks del mundo de una vez - SISTEMA SIMPLIFICADO
   */
  private generateAllChunks(): void {
    const worldSize = this.config.worldSize;
    const startX = -Math.floor(worldSize / 2);
    const startY = -Math.floor(worldSize / 2);

    console.log(`🔧 Generando mundo completo ${worldSize}x${worldSize}...`);

    for (let x = startX; x < startX + worldSize; x++) {
      for (let y = startY; y < startY + worldSize; y++) {
        this.generateChunk(x, y);
      }
    }

    console.log(`✅ Mundo completo generado: ${worldSize}x${worldSize} chunks (${this.chunks.size} total)`);
  }

  /**
   * NO HACE NADA - El mundo es estático y permanente
   * @param _playerX - Posición X del jugador (no usado)
   * @param _playerY - Posición Y del jugador (no usado)
   */
  updateWorld(_playerX: number, _playerY: number): void {
    // SISTEMA SIMPLIFICADO: No hay updates dinámicos
    // Todo el mundo ya está generado y es permanente
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
   * ELIMINADO - Ya no se necesita generación dinámica
   */

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

    // Agregar ríos a la lista global para colisiones
    // Las estructuras ahora se manejan via StructureManager
    chunk.rivers.children.entries.forEach(river => {
      if ((river as any).body) {
        this.allRivers.push(river as Phaser.GameObjects.GameObject);
      }
    });
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
   * Genera estructuras procedurales usando StructureManager con verificación de espacios libres
   */
  private generateStructures(chunk: WorldChunk, worldX: number, worldY: number): void {
    const size = this.config.chunkSize;
    const density = this.config.structureDensity;

    // ARREGLADO: Garantizar que se generen estructuras
    const baseStructures = 2; // Mínimo 2 estructuras por chunk
    const extraStructures = Math.floor(Math.random() * density * 6); // 0-1.2 extra
    const structureCount = baseStructures + extraStructures;

    console.log(`🏗️ Generando ${structureCount} estructuras en chunk (${worldX}, ${worldY})`);

    let successfulStructures = 0;
    const maxAttempts = structureCount * 3; // Más intentos para encontrar posiciones libres

    for (let attempt = 0; attempt < maxAttempts && successfulStructures < structureCount; attempt++) {
      // Generar posición aleatoria dentro del chunk
      const centerX = worldX + size * 0.5;
      const centerY = worldY + size * 0.5;
      const maxDistance = size * 0.4; // Mantener estructuras dentro del 80% del chunk
      
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * maxDistance;
      const structX = centerX + Math.cos(angle) * distance;
      const structY = centerY + Math.sin(angle) * distance;

      // Verificar que no esté cerca de ríos
      const isNearRiver = this.isNearRiver(structX, structY, chunk);
      if (isNearRiver) continue;

      // Verificar que no esté muy cerca de otras estructuras
      const minSeparation = 60; // Distancia mínima entre estructuras
      if (!this.structureManager.isPositionFree(structX, structY, minSeparation)) {
        continue;
      }

      // Crear la estructura
      const structureType = this.getRandomStructureType();
      this.createStructureViaManager(chunk, structX, structY, structureType);
      successfulStructures++;
    }

    if (successfulStructures < structureCount) {
      console.log(`⚠️ Solo se pudieron generar ${successfulStructures}/${structureCount} estructuras en chunk (${worldX}, ${worldY}) debido a falta de espacio`);
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
   * Crea una estructura usando el StructureManager
   */
  private createStructureViaManager(chunk: WorldChunk, x: number, y: number, type: StructureType): void {
    const structure = this.structureManager.createStructure({
      type,
      x,
      y,
      hasPhysics: true,
      isDestructible: type === StructureType.EXPLOSIVE_BARREL
    });

    // Agregar referencia al chunk para organización (opcional)
    chunk.structures.add(structure);
  }

  // Métodos de creación de estructuras eliminados - ahora se usa StructureManager

  /**
   * ELIMINADO - No hay limpieza de chunks en el sistema simplificado
   */

  /**
   * Función de ruido 2D simplificada (implementación básica)
   */
  private noise2D(x: number, y: number): number {
    // Implementación simple de ruido basada en seno
    const seed = this.config.terrainSeed;
    return (Math.sin(x * seed) * Math.cos(y * seed) + 1) / 2;
  }

  /**
   * Obtiene todas las estructuras con física - SISTEMA SIMPLIFICADO
   */
  getPhysicsStructures(): Structure[] {
    return this.structureManager.getPhysicsStructures();
  }

  /**
   * Obtiene todos los ríos con física - SISTEMA SIMPLIFICADO
   */
  getPhysicsRivers(): Phaser.GameObjects.GameObject[] {
    return this.allRivers;
  }

  /**
   * Obtiene todos los puentes (para verificación - NO tienen física) - SISTEMA SIMPLIFICADO
   */
  getPhysicsBridges(): Phaser.GameObjects.GameObject[] {
    const bridges: Phaser.GameObjects.GameObject[] = [];

    this.chunks.forEach((chunk) => {
      if (chunk && chunk.generated) {
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
   * Obtiene todos los chunks (todos están activos en el sistema simplificado)
   */
  getActiveChunks(): string[] {
    return Array.from(this.chunks.keys());
  }

  /**
   * Obtiene un chunk específico por ID
   */
  getChunk(chunkId: string): WorldChunk | undefined {
    return this.chunks.get(chunkId);
  }

  /**
   * Obtiene información del mundo actual - SISTEMA SIMPLIFICADO
   */
  getWorldInfo(): { activeChunks: number; totalChunks: number; structures: number } {
    const structureStats = this.structureManager.getStats();
    return {
      activeChunks: this.chunks.size, // Todos los chunks están activos
      totalChunks: this.chunks.size,
      structures: structureStats.total
    };
  }

  /**
   * Destruye el WorldManager y limpia la memoria
   */
  destroy(): void {
    // Destruir StructureManager primero
    if (this.structureManager) {
      this.structureManager.destroy();
    }

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
   * Verifica si una posición está dentro de los límites del mundo
   * @param x - Posición X
   * @param y - Posición Y
   * @returns true si está dentro de los límites
   */
  isWithinBounds(x: number, y: number): boolean {
    return x >= this.worldBounds.minX && x <= this.worldBounds.maxX &&
           y >= this.worldBounds.minY && y <= this.worldBounds.maxY;
  }

  /**
   * Obtiene los límites del mundo
   */
  getWorldBounds(): { minX: number; maxX: number; minY: number; maxY: number } {
    return { ...this.worldBounds };
  }

  /**
   * Obtiene información del mundo para el mini mapa - SISTEMA SIMPLIFICADO
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
      activeChunks: Array.from(this.activeChunks || []),
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
    const structureStats = this.structureManager.getStats();
    console.log(`  Estructuras físicas globales: ${allStructures.length}`);
    console.log(`  Estadísticas estructuras:`, structureStats);
    console.log(`  Ríos físicos globales: ${allRivers.length}`);
  }

  /**
   * Obtiene el StructureManager para acceso directo
   */
  public getStructureManager(): StructureManager {
    return this.structureManager;
  }

  /**
   * Crea una estructura específica en una posición
   */
  public createStructureAt(x: number, y: number, type: StructureType, config?: Partial<{ hasPhysics: boolean; isDestructible: boolean; health: number }>): Structure {
    return this.structureManager.createStructure({
      type,
      x,
      y,
      hasPhysics: config?.hasPhysics ?? true,
      isDestructible: config?.isDestructible ?? false,
      health: config?.health ?? 1
    });
  }

  /**
   * Obtiene estructuras en un área específica
   */
  public getStructuresInArea(x: number, y: number, radius: number): Structure[] {
    return this.structureManager.getStructuresInArea(x, y, radius);
  }

  /**
   * Verifica si una posición está libre de obstáculos (estructuras y ríos)
   * @param x - Posición X a verificar
   * @param y - Posición Y a verificar
   * @param radius - Radio de verificación
   * @param includeRivers - Si incluir ríos en la verificación
   * @returns true si la posición está libre
   */
  public isPositionFreeOfObstacles(x: number, y: number, radius: number, includeRivers: boolean = true): boolean {
    // Verificar estructuras
    if (!this.structureManager.isPositionFree(x, y, radius)) {
      return false;
    }

    // Verificar ríos si se solicita
    if (includeRivers) {
      for (const river of this.allRivers) {
        const riverSprite = river as Phaser.GameObjects.Rectangle;
        const distance = Phaser.Math.Distance.Between(x, y, riverSprite.x, riverSprite.y);
        
        // Considerar el tamaño del río para la verificación
        const riverRadius = Math.max(riverSprite.width, riverSprite.height) / 2;
        if (distance < (radius + riverRadius)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Encuentra una posición libre de obstáculos cerca de una ubicación objetivo
   * @param targetX - Posición X objetivo
   * @param targetY - Posición Y objetivo
   * @param minRadius - Radio mínimo de separación
   * @param maxRadius - Radio máximo de búsqueda
   * @param maxAttempts - Número máximo de intentos
   * @param includeRivers - Si incluir ríos en la verificación
   * @returns Posición libre o null si no se encuentra
   */
  public findFreePositionForSpawn(
    targetX: number, 
    targetY: number, 
    minRadius: number = 50, 
    maxRadius: number = 200, 
    maxAttempts: number = 30,
    includeRivers: boolean = true
  ): { x: number; y: number } | null {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Generar posición aleatoria en un anillo alrededor del objetivo
      const angle = Math.random() * Math.PI * 2;
      const distance = minRadius + Math.random() * (maxRadius - minRadius);
      
      const x = targetX + Math.cos(angle) * distance;
      const y = targetY + Math.sin(angle) * distance;
      
      // Verificar límites del mundo
      if (!this.isWithinBounds(x, y)) {
        continue;
      }
      
      // Verificar si la posición está libre de obstáculos
      if (this.isPositionFreeOfObstacles(x, y, minRadius, includeRivers)) {
        return { x, y };
      }
    }
    
    return null; // No se encontró posición libre
  }
}