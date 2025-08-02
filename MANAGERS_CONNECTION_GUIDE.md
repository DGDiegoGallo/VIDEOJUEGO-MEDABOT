# Guía de Conexión de Managers - Videojuego Medabot

## Resumen del Problema

El problema principal era que aunque todos los managers estaban siendo inicializados correctamente en `MainScene.ts`, algunos no estaban teniendo efecto en el gameplay porque:

1. **No se estaban actualizando en el loop principal**
2. **No estaban conectados correctamente con los eventos del juego**
3. **Faltaban llamadas a métodos críticos en el `update()`**

## Solución Implementada

### 1. Estructura de Managers en MainScene

```typescript
// Managers principales
private player!: Player;
private enemyManager!: EnemyManager;
private bulletManager!: BulletManager;
private experienceManager!: ExperienceManager;
private visualEffects!: VisualEffects;
private worldManager!: WorldManager;
private gameEffectsManager!: GameEffectsManager;

// Managers especializados
private collisionManager!: CollisionManager;
private cameraManager!: CameraManager;
private timerManager!: TimerManager;
private minimapManager!: MinimapManager;
private uiManager!: UIManager;
```

### 2. Orden de Inicialización (CRÍTICO)

```typescript
private initializeManagers(): void {
  // 1. Managers básicos primero
  this.worldManager = new WorldManager(this);
  this.player = new Player(this, 400, 300);
  this.enemyManager = new EnemyManager(this);
  this.bulletManager = new BulletManager(this);
  this.experienceManager = new ExperienceManager(this);
  this.visualEffects = new VisualEffects(this);
  this.gameEffectsManager = new GameEffectsManager();
  
  // 2. Conectar dependencias
  this.player.setWorldManager(this.worldManager);
  
  // 3. Managers especializados (dependen de los básicos)
  this.cameraManager = new CameraManager(this, this.player);
  this.timerManager = new TimerManager(this);
  this.minimapManager = new MinimapManager(this, this.worldManager, this.enemyManager, this.player);
  this.uiManager = new UIManager(/* ... */);
  
  // 4. CollisionManager DEBE ir al final (depende de todos los demás)
  this.collisionManager = new CollisionManager(/* ... */);
}
```

### 3. Loop de Actualización Principal

```typescript
private updateManagers(): void {
  const playerPos = this.player.getPosition();
  
  // 1. Actualizar mundo procedural
  this.worldManager.updateWorld(playerPos.x, playerPos.y);
  
  // 2. Actualizar enemigos
  this.enemyManager.updateEnemies(playerPos.x, playerPos.y);
  
  // 3. Actualizar balas
  this.bulletManager.updateBullets();
  
  // 4. Actualizar diamantes (atracción magnética)
  this.experienceManager.updateDiamonds(playerPos.x, playerPos.y);
  
  // 5. Verificar colisiones (CRÍTICO: cada frame)
  this.collisionManager.checkAllCollisions();
  
  // 6. Limpiar objetos fuera de pantalla
  this.bulletManager.cleanupOffscreenBullets();
  this.enemyManager.cleanupOffscreenEnemies();
  this.experienceManager.cleanupOffscreenDiamonds();
  
  // 7. Actualizar cámara
  this.cameraManager.update();
  
  // 8. Actualizar minimapa
  const minimapData = this.minimapManager.update();
  
  // 9. Actualizar UI
  const uiData = this.uiManager.update();
  
  // 10. Emitir eventos
  this.events.emit('updateUI', { ...uiData, minimap: minimapData });
}
```

## Managers y sus Responsabilidades

### ✅ Managers que FUNCIONAN correctamente:

1. **WorldManager** - Mundo procedural, chunks, estructuras
2. **EnemyManager** - Spawn, movimiento y gestión de enemigos
3. **BulletManager** - Creación y movimiento de balas
4. **ExperienceManager** - Diamantes, experiencia, niveles
5. **VisualEffects** - Efectos visuales
6. **CameraManager** - Seguimiento de cámara
7. **TimerManager** - Timers del juego y disparo automático

### 🔧 Managers CORREGIDOS:

1. **CollisionManager** - Ahora se ejecuta cada frame
2. **MinimapManager** - Ahora se actualiza correctamente
3. **UIManager** - Ahora emite eventos de actualización

## Sistema de Eventos

### Eventos Principales:

```typescript
// En TimerManager
onGameTimeUpdate: (gameTime) => {
  this.enemyManager.updateGameTime(gameTime);
  this.uiManager.forceUpdate();
  this.events.emit('updateUI', this.uiManager.getData());
}

onShoot: () => {
  this.autoShoot(); // Disparo automático
}

// En CollisionManager
this.scene.events.emit('enemyKilled', { score: 10 });
this.scene.events.emit('levelUp');
this.scene.events.emit('gameOver');
```

### Eventos de UI:

```typescript
// En MainScene
this.events.emit('updateUI', {
  ...uiData,
  minimap: minimapData
});

// En GamePage
mainScene.events.on('updateUI', handleUIUpdate);
mainScene.events.on('gameOver', handleGameOver);
mainScene.events.on('levelUp', handleLevelUp);
```

## Debug y Logs

Se agregaron logs de debug para verificar el funcionamiento:

```typescript
// CollisionManager
console.log(`🔍 CollisionManager: ${enemies.length} enemigos, ${bullets.length} balas`);

// MinimapManager
console.log(`🗺️ MinimapManager: ${enemyInfo.length} enemigos detectados`);

// UIManager
console.log(`📊 UIManager: Vida ${uiData.health.current}/${uiData.health.max}`);

// TimerManager
console.log('🔫 TimerManager: Disparando automáticamente');

// BulletManager
console.log(`🎯 BulletManager: Disparando ${this.bulletsPerShot} bala(s)`);
```

## Flujo del Juego

1. **Inicialización**: Todos los managers se crean en orden correcto
2. **Spawn de enemigos**: EnemyManager crea enemigos automáticamente
3. **Disparo automático**: TimerManager dispara cada 500ms
4. **Colisiones**: CollisionManager verifica colisiones cada frame
5. **Experiencia**: ExperienceManager maneja diamantes y niveles
6. **UI**: UIManager actualiza la interfaz
7. **Minimapa**: MinimapManager actualiza información del radar

## Comandos para Probar

```bash
# Ejecutar el juego
npm run dev

# Verificar logs en consola del navegador:
# - 🔍 CollisionManager: verificar colisiones
# - 🗺️ MinimapManager: verificar minimapa
# - 📊 UIManager: verificar UI
# - 🔫 TimerManager: verificar disparo automático
# - 🎯 BulletManager: verificar creación de balas
```

## Notas Importantes

1. **CollisionManager debe ejecutarse cada frame** - Es crítico para el gameplay
2. **ExperienceManager.updateDiamonds()** - Maneja la atracción magnética
3. **TimerManager** - Controla el disparo automático y tiempo del juego
4. **Orden de inicialización** - Los managers dependientes deben ir después
5. **Eventos** - Conectan los managers con la UI de React

Con estas correcciones, todos los managers ahora tienen efecto en el gameplay y el juego funciona como un verdadero Vampire Survivors. 