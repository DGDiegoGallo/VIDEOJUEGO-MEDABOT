import { Scene } from 'phaser';
import { Position, EnemyConfig, EnemyType } from '../types/game';

/**
 * Clase que maneja toda la lógica relacionada con los enemigos
 * 
 * Responsabilidades:
 * - Crear y gestionar enemigos
 * - Controlar el spawn de enemigos con escalado de dificultad
 * - Manejar el movimiento de enemigos hacia el jugador
 * - Gestionar enemigos especiales (Dasher con dash)
 * - Gestionar la eliminación de enemigos
 * 
 * @example
 * ```typescript
 * const enemyManager = new EnemyManager(scene);
 * enemyManager.spawnEnemy(playerX, playerY);
 * enemyManager.updateEnemies(playerX, playerY);
 * ```
 */
export class EnemyManager {
  private enemies: Phaser.GameObjects.Rectangle[] = [];
  private scene: Scene;
  private config: EnemyConfig;
  private spawnTimer: Phaser.Time.TimerEvent | null = null;
  
  // Sistema de escalado de dificultad
  private gameTimeSeconds: number = 0;
  private currentSpawnInterval: number = 2000;
  private dasherUnlocked: boolean = false;
  private spawnCallback: (() => void) | null = null; // Guardar el callback
  
  // Control de logs del radar
  private lastRadarLogTime: number = 0;
  private lastEnemyCount: number = 0; // Agregar esta línea
  
  // Configuración específica del Dasher
  private dasherConfig = {
    color: 0x8a2be2, // Violeta
    strokeColor: 0x4b0082, // Violeta oscuro
    size: 28, // Ligeramente más grande
    speed: 120, // Más rápido
    damage: 30, // Más daño
    health: 3, // Más vida (requiere 3 disparos)
    dashCooldown: 3000, // 3 segundos entre dashes
    dashSpeed: 300, // Velocidad del dash
    dashDuration: 500, // Duración del dash en ms
  };

  /**
   * Constructor de la clase EnemyManager
   * @param scene - Escena de Phaser donde se crearán los enemigos
   * @param config - Configuración opcional de los enemigos
   */
  constructor(scene: Scene, config?: Partial<EnemyConfig>) {
    this.scene = scene;
    
    // Configuración por defecto
    this.config = {
      size: 24,
      spawnInterval: 3000, // Aumentar de 2000 a 3000ms
      color: 0xff0000,
      strokeColor: 0x8b0000,
      damage: 20,
      speed: 100,
      speedVariation: 50,
      difficultyScaling: {
        enabled: true,
        baseSpawnInterval: 3000, // Aumentar de 2000 a 3000ms
        minSpawnInterval: 200, // Más agresivo: mínimo 200ms
        spawnIntervalReduction: 750, // x5 más agresivo: reduce 750ms por minuto
        dasherSpawnChance: 0.15, // 15% de probabilidad
        dasherUnlockTime: 30, // Desbloquea más rápido: 30 segundos
      },
      ...config
    };
    
    this.currentSpawnInterval = this.config.spawnInterval;
  }

  /**
   * Actualiza el tiempo del juego para el escalado de dificultad
   * @param gameTimeSeconds - Tiempo transcurrido en segundos
   */
  updateGameTime(gameTimeSeconds: number): void {
    this.gameTimeSeconds = gameTimeSeconds;
    this.updateDifficultyScaling();
  }

  /**
   * Actualiza el escalado de dificultad basado en el tiempo
   */
  private updateDifficultyScaling(): void {
    if (!this.config.difficultyScaling?.enabled) return;

    const { baseSpawnInterval, minSpawnInterval, spawnIntervalReduction, dasherUnlockTime } = this.config.difficultyScaling;
    
    // Calcular nuevo intervalo de spawn
    const minutesPassed = Math.floor(this.gameTimeSeconds / 60);
    const newSpawnInterval = Math.max(
      minSpawnInterval,
      baseSpawnInterval - (minutesPassed * spawnIntervalReduction)
    );
    
    if (newSpawnInterval !== this.currentSpawnInterval) {
      this.currentSpawnInterval = newSpawnInterval;
      
      // Reiniciar el timer con el nuevo intervalo
      if (this.spawnTimer) {
        this.restartSpawnTimer();
      }
    }
    
    // Desbloquear Dasher después del tiempo especificado
    if (!this.dasherUnlocked && this.gameTimeSeconds >= dasherUnlockTime) {
      this.dasherUnlocked = true;
    }
  }

  /**
   * Reinicia el timer de spawn con el intervalo actual
   */
  private restartSpawnTimer(): void {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
    }
    
    // Solo crear el timer si hay un callback guardado
    if (this.spawnCallback) {
      this.spawnTimer = this.scene.time.addEvent({
        delay: this.currentSpawnInterval,
        callback: this.spawnCallback,
        loop: true
      });
    }
  }

  /**
   * Crea un enemigo en una posición específica
   * @param x - Posición X del enemigo
   * @param y - Posición Y del enemigo
   * @param type - Tipo de enemigo (opcional)
   * @returns El sprite del enemigo creado
   */
  createEnemy(x: number, y: number, type: EnemyType = EnemyType.ZOMBIE): Phaser.GameObjects.Rectangle {
    const enemy = this.scene.add.rectangle(x, y, this.config.size, this.config.size, this.config.color);
    enemy.setStrokeStyle(2, this.config.strokeColor);
    enemy.setDepth(5); // Enemigos por encima del terreno pero debajo de balas
    
    // Configurar física
    this.scene.physics.add.existing(enemy);
    
    // Configurar propiedades específicas del tipo
    if (type === EnemyType.DASHER) {
      this.configureDasher(enemy);
    } else {
      this.configureZombie(enemy);
    }
    
    // Agregar a la lista de enemigos
    this.enemies.push(enemy);
    
    // Crear efecto de spawn
    this.createSpawnEffect(enemy);
    
    return enemy;
  }

  /**
   * Crea un enemigo en los bordes de la pantalla que se mueve hacia el jugador
   * @param playerX - Posición X del jugador
   * @param playerY - Posición Y del jugador
   * @param type - Tipo de enemigo (opcional)
   * @returns El sprite del enemigo creado
   */
  spawnEnemy(playerX: number, playerY: number, type?: EnemyType): Phaser.GameObjects.Rectangle {
    // Decidir tipo de enemigo si no se especifica
    let enemyType = type;
    if (!enemyType) {
      enemyType = this.selectRandomEnemyType();
    }
    
    const spawnPosition = this.getRandomSpawnPosition(playerX, playerY);
    const enemy = this.createEnemy(spawnPosition.x, spawnPosition.y, enemyType);

    // Configurar movimiento hacia el jugador
    this.moveEnemyTowardsPlayer(enemy, playerX, playerY);

    return enemy;
  }

  /**
   * Selecciona aleatoriamente el tipo de enemigo basado en probabilidades
   * @returns Tipo de enemigo seleccionado
   */
  private selectRandomEnemyType(): EnemyType {
    if (!this.dasherUnlocked || !this.config.difficultyScaling) {
      return EnemyType.ZOMBIE;
    }
    
    const random = Math.random();
    if (random < this.config.difficultyScaling.dasherSpawnChance) {
      return EnemyType.DASHER;
    }
    
    return EnemyType.ZOMBIE;
  }

  /**
   * Obtiene una posición aleatoria en los bordes de la pantalla relativa al jugador
   * @param playerX - Posición X del jugador
   * @param playerY - Posición Y del jugador
   * @returns Posición de spawn
   */
  private getRandomSpawnPosition(playerX: number, playerY: number): Position {
    const spawnDistance = 400; // Distancia desde el jugador para hacer spawn
    const margin = 50;

    const side = Math.floor(Math.random() * 4);
    let x: number, y: number;

    switch (side) {
      case 0: // Top
        x = playerX + (Math.random() - 0.5) * spawnDistance * 2;
        y = playerY - spawnDistance - margin;
        break;
      case 1: // Right
        x = playerX + spawnDistance + margin;
        y = playerY + (Math.random() - 0.5) * spawnDistance * 2;
        break;
      case 2: // Bottom
        x = playerX + (Math.random() - 0.5) * spawnDistance * 2;
        y = playerY + spawnDistance + margin;
        break;
      case 3: // Left
        x = playerX - spawnDistance - margin;
        y = playerY + (Math.random() - 0.5) * spawnDistance * 2;
        break;
      default:
        x = playerX;
        y = playerY;
    }

    return { x, y };
  }

  /**
   * Mueve un enemigo hacia el jugador
   * @param enemy - Sprite del enemigo
   * @param playerX - Posición X del jugador
   * @param playerY - Posición Y del jugador
   */
  private moveEnemyTowardsPlayer(enemy: Phaser.GameObjects.Rectangle, playerX: number, playerY: number): void {
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    const enemyType = enemy.getData('type');
    
    if (enemyType === 'dasher') {
      this.moveDasherTowardsPlayer(enemy, playerX, playerY);
    } else {
      // Movimiento normal
      const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, playerX, playerY);
      const speed = this.config.speed + Math.random() * this.config.speedVariation;
      
      body.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );
    }
  }

  /**
   * Mueve un Dasher hacia el jugador con capacidad de dash
   * @param enemy - Sprite del enemigo Dasher
   * @param playerX - Posición X del jugador
   * @param playerY - Posición Y del jugador
   */
  private moveDasherTowardsPlayer(enemy: Phaser.GameObjects.Rectangle, playerX: number, playerY: number): void {
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    const currentTime = this.scene.time.now;
    const lastDashTime = (enemy as any).lastDashTime || 0;
    const isDashing = (enemy as any).isDashing || false;
    
    // Verificar si puede hacer dash
    if (!isDashing && currentTime - lastDashTime > this.dasherConfig.dashCooldown) {
      const distanceToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, playerX, playerY);
      
      // Dash si está a cierta distancia del jugador
      if (distanceToPlayer > 150 && distanceToPlayer < 300) {
        this.performDash(enemy, playerX, playerY);
        return;
      }
    }
    
    // Movimiento normal del Dasher
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, playerX, playerY);
    const speed = this.dasherConfig.speed + Math.random() * this.config.speedVariation;
    
    body.setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    );
  }

  /**
   * Realiza un dash hacia el jugador
   * @param enemy - Sprite del enemigo Dasher
   * @param playerX - Posición X del jugador
   * @param playerY - Posición Y del jugador
   */
  private performDash(enemy: Phaser.GameObjects.Rectangle, playerX: number, playerY: number): void {
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, playerX, playerY);
    
    // Configurar dash
    (enemy as any).isDashing = true;
    (enemy as any).lastDashTime = this.scene.time.now;
    
    // Aplicar velocidad de dash
    body.setVelocity(
      Math.cos(angle) * this.dasherConfig.dashSpeed,
      Math.sin(angle) * this.dasherConfig.dashSpeed
    );
    
    // Efecto visual de dash
    this.createDashEffect(enemy);
    
    // Terminar dash después de la duración
    this.scene.time.delayedCall(this.dasherConfig.dashDuration, () => {
      (enemy as any).isDashing = false;
    });
  }

  /**
   * Crea un efecto visual de dash
   * @param enemy - Sprite del enemigo Dasher
   */
  private createDashEffect(enemy: Phaser.GameObjects.Rectangle): void {
    // Efecto de estela violeta
    const trail = this.scene.add.rectangle(
      enemy.x, enemy.y, 
      this.dasherConfig.size, this.dasherConfig.size, 
      0x8a2be2
    );
    trail.setAlpha(0.6);
    trail.setDepth(4);
    
    // Animación de desvanecimiento
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: this.dasherConfig.dashDuration,
      ease: 'Power2',
      onComplete: () => {
        trail.destroy();
      }
    });
  }

  /**
   * Crea un efecto visual de spawn para el enemigo
   * @param enemy - Sprite del enemigo
   */
  private createSpawnEffect(enemy: Phaser.GameObjects.Rectangle): void {
    const enemyType = (enemy as any).enemyType;
    
    enemy.setScale(0);
    this.scene.tweens.add({
      targets: enemy,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // Efecto adicional para Dasher
    if (enemyType === EnemyType.DASHER) {
      this.scene.tweens.add({
        targets: enemy,
        alpha: 0.7,
        duration: 200,
        yoyo: true,
        repeat: 2,
        ease: 'Power2'
      });
    }
  }

  /**
   * Actualiza el movimiento de todos los enemigos hacia el jugador
   * @param playerX - Posición X del jugador
   * @param playerY - Posición Y del jugador
   */
  updateEnemies(playerX: number, playerY: number): void {
    this.enemies.forEach((enemy, index) => {
      if (!enemy.active) {
        this.enemies.splice(index, 1);
        return;
      }

      this.moveEnemyTowardsPlayer(enemy, playerX, playerY);
    });
  }

  /**
   * Daña a un enemigo específico
   * @param enemy - Sprite del enemigo
   * @param damage - Cantidad de daño a aplicar
   * @returns true si el enemigo murió, false si sobrevivió
   */
  damageEnemy(enemy: Phaser.GameObjects.Rectangle, damage: number = 1): boolean {
    const currentHealth = enemy.getData('health') || 1;
    
    enemy.setData('health', Math.max(0, currentHealth - damage));
    
    // Efecto visual de daño
    this.createDamageEffect(enemy);
    
    if (enemy.getData('health') <= 0) {
      this.removeEnemy(enemy);
      return true;
    }
    
    return false;
  }

  /**
   * Crea un efecto visual de daño
   * @param enemy - Sprite del enemigo
   */
  private createDamageEffect(enemy: Phaser.GameObjects.Rectangle): void {
    const enemyType = enemy.getData('type');
    
    // Efecto de parpadeo
    this.scene.tweens.add({
      targets: enemy,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 1
    });
    
    // Efecto de escala para Dasher
    if (enemyType === 'dasher') {
      this.scene.tweens.add({
        targets: enemy,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      });
    }
  }

  /**
   * Obtiene todos los enemigos activos
   * @returns Array de sprites de enemigos
   */
  getEnemies(): Phaser.GameObjects.Rectangle[] {
    return this.enemies.filter(enemy => enemy.active);
  }

  /**
   * Obtiene el enemigo más cercano al jugador
   * @param playerX - Posición X del jugador
   * @param playerY - Posición Y del jugador
   * @returns El enemigo más cercano o null si no hay enemigos
   */
  getClosestEnemy(playerX: number, playerY: number): Phaser.GameObjects.Rectangle | null {
    const activeEnemies = this.getEnemies();
    if (activeEnemies.length === 0) return null;

    let closestEnemy: Phaser.GameObjects.Rectangle | null = null;
    let closestDistance = Infinity;

    activeEnemies.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        playerX, playerY,
        enemy.x, enemy.y
      );
      if (distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    });

    return closestEnemy;
  }

  /**
   * Elimina un enemigo específico
   * @param enemy - Sprite del enemigo a eliminar
   */
  removeEnemy(enemy: Phaser.GameObjects.Rectangle): void {
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      this.enemies.splice(index, 1);
    }
    enemy.destroy();
  }

  /**
   * Elimina todos los enemigos
   */
  clearAllEnemies(): void {
    this.enemies.forEach(enemy => {
      if (enemy.active) {
        enemy.destroy();
      }
    });
    this.enemies = [];
  }

  /**
   * Obtiene la cantidad de enemigos activos
   * @returns Número de enemigos activos
   */
  getEnemyCount(): number {
    const count = this.enemies.length;
    this.lastEnemyCount = count;
    return count;
  }

  /**
   * Obtiene el intervalo de spawn actual
   * @returns Intervalo de spawn en milisegundos
   */
  getSpawnInterval(): number {
    return this.currentSpawnInterval;
  }

  /**
   * Actualiza la configuración de los enemigos
   * @param newConfig - Nueva configuración
   */
  updateConfig(newConfig: Partial<EnemyConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Actualizar intervalo de spawn si cambió
    if (newConfig.spawnInterval) {
      this.currentSpawnInterval = newConfig.spawnInterval;
      if (this.spawnTimer) {
        this.restartSpawnTimer();
      }
    }
  }

  /**
   * Obtiene la configuración actual de los enemigos
   * @returns Configuración actual
   */
  getConfig(): EnemyConfig {
    return { ...this.config };
  }

  /**
   * Inicia el spawn automático de enemigos
   * @param callback - Función a ejecutar cuando se debe spawnear un enemigo
   */
  startAutoSpawn(callback: () => void): void {
    this.stopAutoSpawn();
    
    // Guardar el callback para usarlo en restartSpawnTimer
    this.spawnCallback = callback;
    
    this.spawnTimer = this.scene.time.addEvent({
      delay: this.currentSpawnInterval,
      callback: callback,
      loop: true
    });
  }

  /**
   * Detiene el spawn automático de enemigos
   */
  stopAutoSpawn(): void {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
      this.spawnTimer = null;
    }
    this.spawnCallback = null; // Limpiar el callback
  }

  /**
   * Verifica si hay enemigos fuera de los límites de la pantalla
   * @param margin - Margen adicional para considerar "fuera de pantalla"
   */
  cleanupOffscreenEnemies(margin: number = 100): void {
    const gameWidth = this.scene.scale.width || 800;
    const gameHeight = this.scene.scale.height || 600;
    let removedCount = 0;

    this.enemies.forEach((enemy, index) => {
      if (!enemy.active) {
        this.enemies.splice(index, 1);
        removedCount++;
        return;
      }

      if (enemy.x < -margin || enemy.x > gameWidth + margin ||
          enemy.y < -margin || enemy.y > gameHeight + margin) {
        this.removeEnemy(enemy);
        removedCount++;
      }
    });
  }

  /**
   * Obtiene información de estadísticas de enemigos
   * @returns Información de estadísticas
   */
  getStats(): {
    totalEnemies: number;
    dasherCount: number;
    zombieCount: number;
    currentSpawnInterval: number;
    dasherUnlocked: boolean;
    gameTime: number;
  } {
    const enemies = this.getEnemies();
    const dasherCount = enemies.filter(e => (e as any).enemyType === EnemyType.DASHER).length;
    const zombieCount = enemies.filter(e => (e as any).enemyType === EnemyType.ZOMBIE).length;
    
    return {
      totalEnemies: enemies.length,
      dasherCount,
      zombieCount,
      currentSpawnInterval: this.currentSpawnInterval,
      dasherUnlocked: this.dasherUnlocked,
      gameTime: this.gameTimeSeconds
    };
  }

  /**
   * Obtiene información de enemigos para el radar
   * @param playerX - Posición X del jugador
   * @param playerY - Posición Y del jugador
   * @returns Array con información de enemigos para el radar
   */
  getRadarInfo(playerX: number, playerY: number): Array<{
    id: string;
    x: number;
    y: number;
    type: string;
    distance: number;
  }> {
    const radarInfo = this.enemies.map(enemy => {
      const distance = Phaser.Math.Distance.Between(
        enemy.x, enemy.y,
        playerX, playerY
      );
      
      // Determinar el tipo de enemigo basado en sus propiedades
      let type = 'zombie';
      if (enemy.getData('type') === 'dasher') {
        type = 'dasher';
      }
      
      return {
        id: enemy.name || `enemy_${enemy.x}_${enemy.y}`,
        x: enemy.x,
        y: enemy.y,
        type,
        distance
      };
    });

    return radarInfo;
  }

  /**
   * Obtiene enemigos cercanos a una posición específica
   * @param playerX - Posición X del jugador
   * @param playerY - Posición Y del jugador
   * @param range - Rango de detección en píxeles
   * @returns Array de enemigos dentro del rango
   */
  getNearbyEnemies(playerX: number, playerY: number, range: number): Phaser.GameObjects.Rectangle[] {
    return this.enemies.filter(enemy => {
      const distance = Phaser.Math.Distance.Between(playerX, playerY, enemy.x, enemy.y);
      return distance <= range;
    });
  }

  /**
   * Destruye todos los enemigos y limpia la memoria
   */
  destroy(): void {
    this.stopAutoSpawn();
    this.clearAllEnemies();
  }

  /**
   * Configura un enemigo Dasher con sus propiedades específicas
   * @param enemy - Sprite del enemigo
   */
  private configureDasher(enemy: Phaser.GameObjects.Rectangle): void {
    // Configurar propiedades específicas del Dasher
    enemy.setData('type', 'dasher');
    enemy.setData('health', this.dasherConfig.health);
    enemy.setData('speed', this.dasherConfig.speed);
    enemy.setData('dashCooldown', this.dasherConfig.dashCooldown);
    enemy.setData('lastDashTime', 0);
    enemy.setData('isDashing', false);
    
    // Configurar color y tamaño
    enemy.setFillStyle(this.dasherConfig.color);
    enemy.setSize(this.dasherConfig.size, this.dasherConfig.size);
    
    // Configurar física
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(false);
    body.setBounce(0.1);
    
  }

  /**
   * Configura un enemigo Zombie con sus propiedades específicas
   * @param enemy - Sprite del enemigo
   */
  private configureZombie(enemy: Phaser.GameObjects.Rectangle): void {
    // Configurar propiedades específicas del Zombie
    enemy.setData('type', 'zombie');
    enemy.setData('health', 1); // Los zombies tienen 1 de vida por defecto
    enemy.setData('speed', this.config.speed);
    
    // Configurar color y tamaño
    enemy.setFillStyle(this.config.color);
    enemy.setSize(this.config.size, this.config.size);
    
    // Configurar física
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(false);
    body.setBounce(0.05);
    
  }
} 