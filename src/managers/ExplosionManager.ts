import { Scene } from 'phaser';
import { Player } from './Player';
import { EnemyManager } from './EnemyManager';
import { WorldManager } from './WorldManager';
import { VisualEffects } from './VisualEffects';
import { Structure, StructureType } from './StructureManager';

/**
 * Configuración de una explosión
 */
interface ExplosionConfig {
  x: number;
  y: number;
  radius: number;
  damage: number;
  damagePlayer: boolean;
  damageEnemies: boolean;
  destroyStructures: boolean;
  source?: 'barrel' | 'grenade' | 'missile' | 'other';
}

// ExplosiveBarrel interface eliminada - ahora se usa Structure con StructureType.EXPLOSIVE_BARREL

/**
 * Manager para manejar explosiones y barriles explosivos
 * 
 * Responsabilidades:
 * - Crear y manejar barriles explosivos
 * - Sistema de explosiones reutilizable
 * - Daño a jugador, enemigos y estructuras
 * - Efectos visuales de explosiones
 * - Reacciones en cadena de explosiones
 */
export class ExplosionManager {
  private scene: Scene;
  private player: Player;
  private enemyManager: EnemyManager;
  private worldManager: WorldManager;
  private visualEffects: VisualEffects;

  // Los barriles explosivos ahora se manejan via StructureManager
  // No necesitamos arrays separados

  // Configuración
  private readonly BARREL_HEALTH = 3;
  private readonly BARREL_EXPLOSION_RADIUS = 120;
  private readonly BARREL_EXPLOSION_DAMAGE = 50;

  constructor(
    scene: Scene,
    player: Player,
    enemyManager: EnemyManager,
    worldManager: WorldManager,
    visualEffects: VisualEffects
  ) {
    this.scene = scene;
    this.player = player;
    this.enemyManager = enemyManager;
    this.worldManager = worldManager;
    this.visualEffects = visualEffects;

    console.log('💥 ExplosionManager: Inicializado con StructureManager');
  }

  /**
   * Crea un barril explosivo usando StructureManager
   */
  createBarrel(x: number, y: number): Structure {
    const structureManager = this.worldManager.getStructureManager();
    const barrel = structureManager.createStructure({
      type: StructureType.EXPLOSIVE_BARREL,
      x: x,
      y: y,
      hasPhysics: true,
      isDestructible: true,
      health: this.BARREL_HEALTH
    });

    console.log(`🛢️ Barril creado en (${x}, ${y}) con ${this.BARREL_HEALTH} HP usando StructureManager`);
    return barrel;
  }

  /**
   * Genera barriles explosivos aleatoriamente en el mundo usando StructureManager
   */
  generateRandomBarrels(centerX: number, centerY: number, count: number = 3): void {
    const spawnRadius = 400;

    for (let i = 0; i < count; i++) {
      // Generar posición aleatoria alrededor del centro
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * spawnRadius;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      // Verificar que no esté muy cerca de otras estructuras
      const structuresInArea = this.worldManager.getStructuresInArea(x, y, 60);
      
      if (structuresInArea.length === 0) {
        this.createBarrel(x, y);
      }
    }
  }

  /**
   * Daña un barril específico (ahora usa Structure) - SISTEMA DE CADENA MEJORADO
   */
  damageBarrel(barrel: Structure, damage: number): boolean {
    // Verificaciones de seguridad más estrictas
    if (!barrel || !barrel.scene || !barrel.active || !barrel.isDestructible || barrel.health <= 0) {
      console.log(`⚠️ Barril inválido para daño: active=${barrel?.active}, health=${barrel?.health}, destructible=${barrel?.isDestructible}`);
      return false;
    }

    const previousHealth = barrel.health;
    console.log(`🔥 Dañando barril en (${Math.round(barrel.x)}, ${Math.round(barrel.y)}) - HP: ${previousHealth}/${barrel.maxHealth} (daño: ${damage})`);

    const wasDestroyed = barrel.takeDamage(damage);

    // Efectos visuales mejorados de daño (solo si el barril aún existe)
    if (barrel.active && barrel.scene) {
      this.createBarrelDamageEffect(barrel, damage);
    }

    // Explotar inmediatamente si fue destruido
    if (wasDestroyed && barrel.active && barrel.scene) {
      console.log(`💥 BARRIL DESTRUIDO: ${previousHealth} → 0 HP - iniciando explosión que puede activar más barriles`);
      this.explodeBarrel(barrel);
      return true;
    } else if (!wasDestroyed) {
      console.log(`🔥 Barril dañado: ${previousHealth} → ${barrel.health} HP - aún no explota`);
    }

    return wasDestroyed;
  }

  /**
   * Crea efectos visuales cuando un barril recibe daño - MEJORADO Y ROBUSTO
   */
  private createBarrelDamageEffect(barrel: Structure, damage: number): void {
    // Verificar que el barril aún existe
    if (!barrel || !barrel.active) return;

    // Texto de daño
    this.visualEffects.showScoreText(barrel.x, barrel.y - 15, `-${damage} HP`, '#ff6666');

    // Chispas al recibir daño
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 15 + Math.random() * 10;
      const sparkX = barrel.x + Math.cos(angle) * distance;
      const sparkY = barrel.y + Math.sin(angle) * distance;

      const spark = this.scene.add.rectangle(sparkX, sparkY, 2, 2, 0xffaa00);
      spark.setDepth(50);

      this.scene.tweens.add({
        targets: spark,
        x: sparkX + Math.cos(angle) * 20,
        y: sparkY + Math.sin(angle) * 20,
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          if (spark && spark.scene) {
            spark.destroy();
          }
        }
      });
    }

    // Efecto de humo si está muy dañado
    const healthPercent = barrel.health / barrel.maxHealth;
    if (healthPercent <= 0.5) {
      const smoke = this.scene.add.circle(barrel.x, barrel.y - 10, 3, 0x666666, 0.6);
      smoke.setDepth(49);

      this.scene.tweens.add({
        targets: smoke,
        y: smoke.y - 20,
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 1000,
        ease: 'Power1',
        onComplete: () => {
          if (smoke && smoke.scene) {
            smoke.destroy();
          }
        }
      });
    }

    // Parpadeo de advertencia si está crítico
    if (healthPercent <= 0.33 && barrel.active) {
      this.scene.tweens.add({
        targets: barrel,
        alpha: 0.5,
        duration: 100,
        yoyo: true,
        repeat: 3,
        ease: 'Power2',
        onComplete: () => {
          if (barrel && barrel.active) {
            barrel.setAlpha(1); // Restaurar alpha
          }
        }
      });
    }

    console.log(`🔥 Barril dañado: ${barrel.health}/${barrel.maxHealth} HP restante`);
  }

  /**
   * Hace explotar un barril específico (ahora usa Structure) - COMPLETAMENTE ARREGLADO
   */
  private explodeBarrel(barrel: Structure): void {
    // Verificar que el barril aún existe
    if (!barrel || !barrel.scene || !barrel.active) {
      console.log(`⚠️ Intento de explotar barril inválido`);
      return;
    }

    console.log(`💥 Barril explotando en (${Math.round(barrel.x)}, ${Math.round(barrel.y)})`);

    // Guardar posición antes de que el barril sea destruido
    const explosionX = barrel.x;
    const explosionY = barrel.y;

    // Emitir evento para misiones diarias
    this.scene.events.emit('barrelDestroyed', {
      position: { x: barrel.x, y: barrel.y },
      source: 'explosion'
    });

    // Remover barril inmediatamente del StructureManager
    const structureManager = this.worldManager.getStructureManager();
    structureManager.removeStructure(barrel);

    // Crear explosión inmediatamente
    this.createExplosion({
      x: explosionX,
      y: explosionY,
      radius: this.BARREL_EXPLOSION_RADIUS,
      damage: this.BARREL_EXPLOSION_DAMAGE,
      damagePlayer: true,
      damageEnemies: true,
      destroyStructures: true,
      source: 'barrel'
    });
  }

  /**
   * Crea una explosión con configuración específica (SISTEMA REUTILIZABLE)
   */
  createExplosion(config: ExplosionConfig): void {
    const { x, y, radius, damage, damagePlayer, damageEnemies, destroyStructures, source } = config;

    console.log(`💥 EXPLOSIÓN ${source || 'desconocida'} en (${Math.round(x)}, ${Math.round(y)}) - Radio: ${radius}, Daño: ${damage}`);

    // Verificar coordenadas válidas
    if (!isFinite(x) || !isFinite(y) || !isFinite(radius) || radius <= 0) {
      console.error(`❌ Coordenadas de explosión inválidas: (${x}, ${y}) radio: ${radius}`);
      return;
    }

    // Efecto visual de explosión
    this.createExplosionVisualEffect(x, y, radius);

    // Daño al jugador
    if (damagePlayer) {
      const playerPos = this.player.getPosition();
      const playerDistance = Phaser.Math.Distance.Between(x, y, playerPos.x, playerPos.y);

      if (playerDistance <= radius) {
        // Calcular daño basado en distancia
        const distancePercent = 1 - (playerDistance / radius);
        const actualDamage = Math.floor(damage * distancePercent);

        if (actualDamage > 0) {
          this.player.takeDamage(actualDamage);
          this.player.createDamageEffect();
          this.visualEffects.showScoreText(playerPos.x, playerPos.y, `-${actualDamage} HP`, '#ff0000');

          console.log(`💥 Jugador recibe ${actualDamage} de daño por explosión`);

          if (!this.player.isAlive()) {
            // No emitir evento gameOver aquí - MainScene se encarga de esto
            console.log('💀 Jugador muerto por explosión - ExplosionManager detectó muerte');
          }
        }
      }
    }

    // Daño a enemigos
    if (damageEnemies) {
      const enemies = this.enemyManager.getEnemies();
      let enemiesKilled = 0;

      enemies.forEach(enemy => {
        const enemyDistance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);

        if (enemyDistance <= radius) {
          // Calcular daño basado en distancia
          const distancePercent = 1 - (enemyDistance / radius);
          const actualDamage = Math.floor(damage * distancePercent);

          if (actualDamage > 0) {
            const enemyDied = this.enemyManager.damageEnemy(enemy, actualDamage, true); // true = es explosión

            if (enemyDied) {
              enemiesKilled++;
              this.scene.events.emit('enemyKilled', { score: 15 }); // Bonus por explosión
            } else {
              // Mostrar mensaje específico para tanques con escudo roto
              const enemyType = enemy.getData('type');
              if (enemyType === 'tank' && !enemy.getData('hasShield')) {
                this.visualEffects.showScoreText(enemy.x, enemy.y, 'SHIELD BROKEN!', '#00ffff');
              } else {
                this.visualEffects.showScoreText(enemy.x, enemy.y, `-${actualDamage}`, '#ff6666');
              }
            }
          }
        }
      });

      if (enemiesKilled > 0) {
        console.log(`💥 Explosión eliminó ${enemiesKilled} enemigos`);
        this.visualEffects.showScoreText(x, y, `+${enemiesKilled * 15}`, '#ffff00');
      }
    }

    // Destruir estructuras
    if (destroyStructures) {
      this.destroyStructuresInRadius(x, y, radius);
    }

    // CRÍTICO: Reacción en cadena con otros barriles - SIEMPRE se ejecuta
    // Esto permite que granadas, misiles y otras explosiones activen barriles
    this.triggerChainReaction(x, y, radius);
    
    console.log(`🔗 Verificando reacción en cadena desde explosión ${source || 'desconocida'} en radio ${radius}px`);
  }

  /**
   * Crea el efecto visual de la explosión - MEJORADO Y MÁS ROBUSTO
   */
  private createExplosionVisualEffect(x: number, y: number, radius: number): void {
    console.log(`🎆 Creando explosión mejorada en (${x}, ${y}) con radio ${radius}`);

    // Verificar que las coordenadas son válidas
    if (!isFinite(x) || !isFinite(y) || !isFinite(radius) || radius <= 0) {
      console.warn(`⚠️ Coordenadas de explosión inválidas: (${x}, ${y}) radio: ${radius}`);
      return;
    }

    // === ONDAS DE CHOQUE MÚLTIPLES ===
    for (let wave = 0; wave < 3; wave++) {
      const waveDelay = wave * 50;
      const waveRadius = radius * (0.8 + wave * 0.3);
      
      this.scene.time.delayedCall(waveDelay, () => {
        const shockWave = this.scene.add.circle(x, y, 5, 0xffffff, 0.8 - wave * 0.2);
        shockWave.setDepth(105 + wave);
        shockWave.setStrokeStyle(3, 0xff4500, 0.9);

        this.scene.tweens.add({
          targets: shockWave,
          radius: waveRadius,
          alpha: 0,
          duration: 400 + wave * 100,
          ease: 'Power2',
          onComplete: () => shockWave.destroy()
        });
      });
    }

    // === EXPLOSIÓN PRINCIPAL MULTICAPA ===
    // Círculo exterior (humo y fuego)
    const outerExplosion = this.scene.add.circle(x, y, radius * 0.3, 0x8b0000, 0.6);
    outerExplosion.setDepth(100);

    // Círculo medio (llamas naranjas)
    const middleExplosion = this.scene.add.circle(x, y, radius * 0.5, 0xff4500, 0.8);
    middleExplosion.setDepth(101);

    // Círculo interno (llamas amarillas)
    const innerExplosion = this.scene.add.circle(x, y, radius * 0.7, 0xffd700, 0.9);
    innerExplosion.setDepth(102);

    // Núcleo blanco brillante
    const coreExplosion = this.scene.add.circle(x, y, radius * 0.2, 0xffffff, 1);
    coreExplosion.setDepth(103);

    // Animación de expansión escalonada
    this.scene.tweens.add({
      targets: outerExplosion,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 800,
      ease: 'Power3',
      onComplete: () => outerExplosion.destroy()
    });

    this.scene.tweens.add({
      targets: middleExplosion,
      scaleX: 2.0,
      scaleY: 2.0,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => middleExplosion.destroy()
    });

    this.scene.tweens.add({
      targets: innerExplosion,
      scaleX: 1.8,
      scaleY: 1.8,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => innerExplosion.destroy()
    });

    this.scene.tweens.add({
      targets: coreExplosion,
      scaleX: 3.0,
      scaleY: 3.0,
      alpha: 0,
      duration: 300,
      ease: 'Power1',
      onComplete: () => coreExplosion.destroy()
    });

    // === PARTÍCULAS DE FUEGO MEJORADAS ===
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const baseDistance = 15 + Math.random() * 10;
      const particleX = x + Math.cos(angle) * baseDistance;
      const particleY = y + Math.sin(angle) * baseDistance;

      // Partículas grandes (fragmentos)
      const fragment = this.scene.add.rectangle(
        particleX, particleY, 
        4 + Math.random() * 6, 
        4 + Math.random() * 6, 
        Math.random() > 0.5 ? 0xff6600 : 0xff4500
      );
      fragment.setDepth(104);
      fragment.setRotation(Math.random() * Math.PI * 2);

      const finalDistance = radius * (0.7 + Math.random() * 0.4);
      const finalX = x + Math.cos(angle) * finalDistance;
      const finalY = y + Math.sin(angle) * finalDistance;

      this.scene.tweens.add({
        targets: fragment,
        x: finalX,
        y: finalY,
        rotation: fragment.rotation + (Math.random() - 0.5) * Math.PI * 4,
        scaleX: 0.1,
        scaleY: 0.1,
        alpha: 0,
        duration: 500 + Math.random() * 300,
        ease: 'Power2',
        onComplete: () => fragment.destroy()
      });
    }

    // === PARTÍCULAS DE CHISPAS ===
    for (let i = 0; i < 16; i++) {
      const sparkAngle = Math.random() * Math.PI * 2;
      const sparkDistance = 20 + Math.random() * 30;
      const sparkX = x + Math.cos(sparkAngle) * sparkDistance;
      const sparkY = y + Math.sin(sparkAngle) * sparkDistance;

      const spark = this.scene.add.rectangle(sparkX, sparkY, 2, 2, 0xffff00);
      spark.setDepth(106);

      const sparkFinalX = x + Math.cos(sparkAngle) * (radius * 1.2);
      const sparkFinalY = y + Math.sin(sparkAngle) * (radius * 1.2);

      this.scene.tweens.add({
        targets: spark,
        x: sparkFinalX,
        y: sparkFinalY,
        alpha: 0,
        duration: 300 + Math.random() * 200,
        ease: 'Power1',
        onComplete: () => spark.destroy()
      });
    }

    // === EFECTO DE FLASH INICIAL ===
    const flash = this.scene.add.circle(x, y, radius * 1.5, 0xffffff, 0.9);
    flash.setDepth(107);
    
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 100,
      ease: 'Power3',
      onComplete: () => flash.destroy()
    });

    // === SACUDIDA DE CÁMARA MEJORADA ===
    const shakeIntensity = Math.min(0.05, radius / 1000); // Intensidad basada en el radio
    const shakeDuration = Math.min(600, radius * 3); // Duración basada en el radio
    
    this.scene.cameras.main.shake(shakeDuration, shakeIntensity);
    
    // Efecto de zoom out/in sutil
    const originalZoom = this.scene.cameras.main.zoom;
    this.scene.tweens.add({
      targets: this.scene.cameras.main,
      zoom: originalZoom * 0.98,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });

    console.log(`💥 Explosión visual completa con ${24} fragmentos, ${16} chispas y sacudida de ${shakeDuration}ms`);
  }

  /**
   * Destruye estructuras en un radio específico, manejando barriles correctamente
   */
  private destroyStructuresInRadius(x: number, y: number, radius: number): void {
    const structureManager = this.worldManager.getStructureManager();
    
    // Obtener todas las estructuras en el área
    const allStructuresInArea = structureManager.getStructuresInArea(x, y, radius);
    
    // Separar barriles de otras estructuras
    const barrelsInArea = allStructuresInArea.filter(structure => 
      structure.getType() === StructureType.EXPLOSIVE_BARREL && 
      structure.active && 
      structure.health > 0
    );
    
    const otherStructures = allStructuresInArea.filter(structure => 
      structure.getType() !== StructureType.EXPLOSIVE_BARREL && 
      structure.active && 
      structure.health > 0
    );
    
    console.log(`🔍 DEBUG: Estructuras en radio ${radius}px - Barriles: ${barrelsInArea.length}, Otras: ${otherStructures.length}`);
    
    // Destruir estructuras que NO son barriles
    otherStructures.forEach(structure => {
      const wasDestroyed = structure.takeDamage(999);
      if (wasDestroyed) {
        this.visualEffects.createExplosionEffect(structure.x, structure.y);
        console.log(`💥 Estructura no-barril destruida en (${Math.round(structure.x)}, ${Math.round(structure.y)})`);
      }
    });
    
    // Manejar barriles con reacción en cadena
    if (barrelsInArea.length > 0) {
      console.log(`🔥 ${barrelsInArea.length} barriles detectados para reacción en cadena`);
      
      barrelsInArea.forEach((barrel, index) => {
        const delay = index * 60 + Math.random() * 30; // 60-90ms entre daños
        
        this.scene.time.delayedCall(delay, () => {
          if (barrel.active && barrel.scene && barrel.health > 0) {
            console.log(`🔥 Aplicando daño por explosión a barril en (${Math.round(barrel.x)}, ${Math.round(barrel.y)}) - HP: ${barrel.health}/${barrel.maxHealth}`);
            
            // Usar el sistema de daño que maneja la explosión automáticamente
            const wasDestroyed = this.damageBarrel(barrel, 1);
            
            if (wasDestroyed) {
              console.log(`💥 Barril destruido por reacción en cadena - nueva explosión iniciada`);
            } else {
              console.log(`🔥 Barril dañado pero no destruido - HP restante: ${barrel.health}`);
            }
          }
        });
      });
      
      // Efecto visual de propagación de la reacción en cadena
      this.createChainReactionEffect(x, y, barrelsInArea);
    }
    
    const totalDestroyed = otherStructures.length;
    if (totalDestroyed > 0) {
      console.log(`💥 Explosión destruyó ${totalDestroyed} estructuras no-barriles`);
      this.visualEffects.showScoreText(x, y, `${totalDestroyed} estructuras`, '#ff8800');
    }
  }

  /**
   * Activa reacción en cadena con otros barriles usando DAÑO - ARREGLADO COMPLETAMENTE
   */
  private triggerChainReaction(x: number, y: number, radius: number): void {
    const structureManager = this.worldManager.getStructureManager();
    
    // Debug: obtener todas las estructuras en el área
    const allStructuresInArea = structureManager.getStructuresInArea(x, y, radius);
    console.log(`🔍 DEBUG: Todas las estructuras en radio ${radius}px desde (${Math.round(x)}, ${Math.round(y)}):`, allStructuresInArea.length);
    
    // Debug: mostrar tipos de estructuras encontradas
    allStructuresInArea.forEach((structure, index) => {
      console.log(`🔍 DEBUG: Estructura ${index + 1}: tipo=${structure.getType()}, pos=(${Math.round(structure.x)}, ${Math.round(structure.y)}), health=${structure.health}, active=${structure.active}`);
    });
    
    // Obtener solo barriles explosivos
    const barrelsInArea = allStructuresInArea.filter(structure => {
      const isBarrel = structure.getType() === StructureType.EXPLOSIVE_BARREL;
      const isActive = structure.active && structure.scene;
      const hasHealth = structure.health > 0;
      
      console.log(`🔍 DEBUG: Barril candidato: tipo=${structure.getType()}, esBarril=${isBarrel}, activo=${isActive}, salud=${structure.health}, cumpleFiltros=${isBarrel && isActive && hasHealth}`);
      
      return isBarrel && isActive && hasHealth;
    });

    console.log(`🔍 DEBUG: Barriles filtrados encontrados: ${barrelsInArea.length}`);

    if (barrelsInArea.length > 0) {
      console.log(`🔥 REACCIÓN EN CADENA: ${barrelsInArea.length} barriles detectados en radio ${radius}px desde (${Math.round(x)}, ${Math.round(y)})`);
      
      // DAÑAR barriles en lugar de explotarlos directamente
      // Esto permite que el sistema de daño determine si explotan o no
      barrelsInArea.forEach((barrel, index) => {
        const delay = index * 60 + Math.random() * 30; // 60-90ms entre daños
        
        console.log(`💥 Programando DAÑO a barril ${index + 1}/${barrelsInArea.length} en (${Math.round(barrel.x)}, ${Math.round(barrel.y)}) con delay ${Math.round(delay)}ms`);
        
        this.scene.time.delayedCall(delay, () => {
          // Verificar que el barril aún existe antes de dañarlo
          if (barrel.active && barrel.scene && barrel.health > 0) {
            console.log(`🔥 Aplicando daño por explosión a barril en (${Math.round(barrel.x)}, ${Math.round(barrel.y)}) - HP: ${barrel.health}/${barrel.maxHealth}`);
            
            // USAR EL SISTEMA DE DAÑO - esto automáticamente explota si llega a 0 HP
            const wasDestroyed = this.damageBarrel(barrel, 1);
            
            if (wasDestroyed) {
              console.log(`💥 Barril destruido por reacción en cadena - nueva explosión iniciada`);
            } else {
              console.log(`🔥 Barril dañado pero no destruido - HP restante: ${barrel.health}`);
            }
          } else {
            console.log(`⚠️ Barril ya destruido, cancelando daño en cadena`);
          }
        });
      });

      // Efecto visual de propagación de la reacción en cadena
      this.createChainReactionEffect(x, y, barrelsInArea);
    } else {
      console.log(`❌ Sin barriles en radio de explosión de ${radius}px`);
      
      // Debug adicional: verificar si hay barriles en el mundo
      const allBarrels = structureManager.getStructuresByType(StructureType.EXPLOSIVE_BARREL);
      console.log(`🔍 DEBUG: Total de barriles en el mundo: ${allBarrels.length}`);
      
      allBarrels.forEach((barrel, index) => {
        const distance = Phaser.Math.Distance.Between(x, y, barrel.x, barrel.y);
        console.log(`🔍 DEBUG: Barril ${index + 1}: pos=(${Math.round(barrel.x)}, ${Math.round(barrel.y)}), distancia=${Math.round(distance)}, radio=${radius}, enRadio=${distance <= radius}, health=${barrel.health}, active=${barrel.active}`);
      });
    }
  }

  /**
   * Crea efectos visuales para la reacción en cadena - NUEVO
   */
  private createChainReactionEffect(originX: number, originY: number, barrels: Structure[]): void {
    barrels.forEach((barrel, index) => {
      const delay = index * 60; // Ligeramente antes que la explosión
      
      this.scene.time.delayedCall(delay, () => {
        if (barrel.active && barrel.scene) {
          // Línea de energía desde el origen hasta el barril
          const energyLine = this.scene.add.line(
            0, 0,
            originX, originY,
            barrel.x, barrel.y,
            0xff6600, 0.8
          );
          energyLine.setLineWidth(3);
          energyLine.setDepth(110);

          // Animación de la línea de energía
          this.scene.tweens.add({
            targets: energyLine,
            alpha: 0,
            duration: 200,
            ease: 'Power2',
            onComplete: () => energyLine.destroy()
          });

          // Efecto de chispas viajando hacia el barril
          for (let i = 0; i < 3; i++) {
            const spark = this.scene.add.circle(originX, originY, 2, 0xffff00);
            spark.setDepth(111);

            this.scene.tweens.add({
              targets: spark,
              x: barrel.x + (Math.random() - 0.5) * 10,
              y: barrel.y + (Math.random() - 0.5) * 10,
              alpha: 0,
              duration: 150 + i * 20,
              ease: 'Power1',
              onComplete: () => spark.destroy()
            });
          }

          // Efecto de advertencia en el barril
          const warningCircle = this.scene.add.circle(barrel.x, barrel.y, 15, 0xff0000, 0);
          warningCircle.setStrokeStyle(2, 0xff0000, 0.8);
          warningCircle.setDepth(109);

          this.scene.tweens.add({
            targets: warningCircle,
            radius: 25,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => warningCircle.destroy()
          });
        }
      });
    });
  }

  /**
   * Verifica colisiones de balas con barriles usando StructureManager - ARREGLADO
   */
  checkBulletBarrelCollisions(bullets: Phaser.GameObjects.Rectangle[]): void {
    const structureManager = this.worldManager.getStructureManager();
    const barrels = structureManager.getStructuresByType(StructureType.EXPLOSIVE_BARREL)
      .filter(barrel => barrel.active && barrel.health > 0); // Verificar que esté activo

    bullets.forEach(bullet => {
      // Verificar que la bala aún existe y está activa
      if (!bullet.active || !bullet.scene) return;

      barrels.forEach(barrel => {
        // Verificar que el barril aún existe y está activo
        if (!barrel.active || !barrel.scene) return;

        const distance = Phaser.Math.Distance.Between(bullet.x, bullet.y, barrel.x, barrel.y);
        const bulletRadius = (bullet.width / 2) || 4;
        const barrelRadius = (barrel.width / 2) || 12; // Usar el ancho real del barril

        if (distance < (bulletRadius + barrelRadius)) {
          console.log(`💥 Colisión detectada: bala en (${Math.round(bullet.x)}, ${Math.round(bullet.y)}) vs barril en (${Math.round(barrel.x)}, ${Math.round(barrel.y)}) - distancia: ${Math.round(distance)}`);
          
          // Remover bala inmediatamente
          this.scene.events.emit('bulletHitBarrel', bullet);

          // Dañar barril con verificación adicional
          if (barrel.active && barrel.health > 0) {
            this.damageBarrel(barrel, 1);
          }
          
          return; // Salir del loop de barriles para esta bala
        }
      });
    });
  }

  /**
   * Obtiene todos los barriles activos usando StructureManager
   */
  getBarrels(): Structure[] {
    const structureManager = this.worldManager.getStructureManager();
    return structureManager.getStructuresByType(StructureType.EXPLOSIVE_BARREL)
      .filter(barrel => barrel.health > 0);
  }

  /**
   * Obtiene el grupo de física de barriles desde StructureManager
   */
  getBarrelGroup(): Phaser.Physics.Arcade.StaticGroup {
    const structureManager = this.worldManager.getStructureManager();
    return structureManager.getPhysicsGroup();
  }

  /**
   * Limpia barriles fuera de pantalla usando StructureManager
   */
  cleanupOffscreenBarrels(playerX: number, playerY: number, maxDistance: number = 1200): void {
    const structureManager = this.worldManager.getStructureManager();
    const barrels = structureManager.getStructuresByType(StructureType.EXPLOSIVE_BARREL);
    const barrelsToRemove: Structure[] = [];

    barrels.forEach(barrel => {
      const distance = Phaser.Math.Distance.Between(playerX, playerY, barrel.x, barrel.y);

      if (distance > maxDistance) {
        barrelsToRemove.push(barrel);
      }
    });

    barrelsToRemove.forEach(barrel => {
      structureManager.removeStructure(barrel);
    });

    if (barrelsToRemove.length > 0) {
      console.log(`🗑️ Limpiados ${barrelsToRemove.length} barriles fuera de pantalla`);
    }
  }

  /**
   * Crea una explosión de granada (método público para lanzagranadas) - MEJORADO
   */
  public createGrenadeExplosion(x: number, y: number): void {
    console.log(`🎯 Creando explosión de granada en (${Math.round(x)}, ${Math.round(y)}) - puede activar barriles`);
    
    this.createExplosion({
      x: x,
      y: y,
      radius: 100,
      damage: 40,
      damagePlayer: false, // Las granadas del jugador no lo dañan
      damageEnemies: true,
      destroyStructures: true,
      source: 'grenade'
    });
  }

  /**
   * Crea una explosión de misil (método público para armas pesadas) - MEJORADO
   */
  public createMissileExplosion(x: number, y: number): void {
    console.log(`🚀 Creando explosión de misil en (${Math.round(x)}, ${Math.round(y)}) - puede activar barriles`);
    
    this.createExplosion({
      x: x,
      y: y,
      radius: 150,
      damage: 80,
      damagePlayer: false, // Los misiles del jugador no lo dañan
      damageEnemies: true,
      destroyStructures: true,
      source: 'missile'
    });
  }

  /**
   * Crea una explosión personalizada (método público genérico) - MEJORADO
   */
  public createCustomExplosion(x: number, y: number, radius: number, damage: number, damagePlayer: boolean = false): void {
    console.log(`💥 Creando explosión personalizada en (${Math.round(x)}, ${Math.round(y)}) - Radio: ${radius}, puede activar barriles`);
    
    this.createExplosion({
      x: x,
      y: y,
      radius: radius,
      damage: damage,
      damagePlayer: damagePlayer,
      damageEnemies: true,
      destroyStructures: true,
      source: 'other'
    });
  }

  /**
   * Crea una explosión de prueba para testing - NUEVO
   */
  public createTestExplosion(x: number, y: number): void {
    console.log(`🧪 Creando explosión de prueba en (${Math.round(x)}, ${Math.round(y)}) - debe activar barriles cercanos`);
    
    this.createExplosion({
      x: x,
      y: y,
      radius: 120,
      damage: 50,
      damagePlayer: false,
      damageEnemies: true,
      destroyStructures: true,
      source: 'other'
    });
  }

  /**
   * Obtiene estadísticas de barriles para debugging
   */
  public getBarrelStats(): { total: number; active: number; healthy: number; positions: Array<{x: number, y: number, health: number}> } {
    const structureManager = this.worldManager.getStructureManager();
    const allBarrels = structureManager.getStructuresByType(StructureType.EXPLOSIVE_BARREL);
    const activeBarrels = allBarrels.filter(barrel => barrel.active && barrel.scene);
    const healthyBarrels = activeBarrels.filter(barrel => barrel.health > 0);

    return {
      total: allBarrels.length,
      active: activeBarrels.length,
      healthy: healthyBarrels.length,
      positions: healthyBarrels.map(barrel => ({
        x: Math.round(barrel.x),
        y: Math.round(barrel.y),
        health: barrel.health
      }))
    };
  }

  /**
   * Destruye el manager y limpia recursos
   */
  destroy(): void {
    // Los barriles ahora se limpian automáticamente via StructureManager
    // No necesitamos limpiar manualmente
    console.log('💥 ExplosionManager destruido (barriles manejados por StructureManager)');
  }
}