# 🛠️ Guía de Desarrollo - Survival Zombie

## 📋 **Información Técnica Detallada**

### **🎯 Estado Actual del Proyecto**

**✅ COMPLETADO:**
- Sistema de juego funcional con Phaser.js
- Disparo automático estilo Vampire Survivors
- Spawn de enemigos desde bordes
- Sistema de colisiones y física
- UI completa con React + Tailwind
- Navegación con React Router
- Efectos visuales optimizados
- Sistema de puntuación y salud

**🚧 EN DESARROLLO:**
- Integración con backend
- Sistema de blockchain/NFTs
- Guardado de progreso

### **📁 Estructura de Archivos Detallada**

```
src/
├── components/
│   ├── GameUI.tsx              # HUD del juego, menús, controles
│   ├── GameInstructions.tsx    # Pantalla de instrucciones
│   ├── GameStats.tsx           # Estadísticas y game over
│   ├── Navbar.tsx              # Navegación principal
│   ├── AnimatedBackground.tsx  # Fondo animado
│   └── LoginForm.tsx           # Formulario de autenticación
├── pages/
│   ├── LandingPage.tsx         # Página principal
│   ├── LoginPage.tsx           # Página de login
│   └── GamePage.tsx            # Contenedor del juego
├── scenes/
│   └── MainScene.ts            # Lógica principal del gameplay
├── stores/
│   ├── authStore.ts            # Estado de autenticación
│   ├── gameStore.ts            # Datos del juego
│   └── blockchainStore.ts      # Estado blockchain
├── config/
│   └── gameConfig.ts           # Configuraciones del juego
├── types/
│   ├── api.ts                  # Tipos API
│   ├── game.ts                 # Tipos del juego
│   ├── user.ts                 # Tipos usuario
│   └── blockchain.ts           # Tipos blockchain
└── styles/
    └── main.css                # Estilos globales
```

### **🎮 Lógica del Gameplay (MainScene.ts)**

#### **Propiedades Principales:**
```typescript
private player!: Phaser.GameObjects.Rectangle;        // Jugador (verde)
private enemies: Phaser.GameObjects.Rectangle[] = []; // Enemigos (rojos)
private bullets: Phaser.GameObjects.Rectangle[] = []; // Balas (amarillas)
private playerHealth: number = 100;                   // Salud del jugador
private score: number = 0;                            // Puntuación
private gameTime: number = 0;                         // Tiempo de juego
```

#### **Métodos Principales:**
```typescript
create()                    // Inicialización del juego
update()                    // Loop principal del juego
handlePlayerMovement()      // Movimiento con flechas
autoShoot()                // Disparo automático
spawnEnemy()               // Crear enemigos
handleCollisions()         // Manejar colisiones
updateUI()                 // Actualizar interfaz
```

#### **Sistema de Eventos:**
```typescript
// Disparo automático cada 500ms
this.time.addEvent({
  delay: 500,
  callback: this.autoShoot,
  loop: true
});

// Spawn de enemigos cada 2s
this.time.addEvent({
  delay: 2000,
  callback: this.spawnEnemy,
  loop: true
});
```

### **🔧 Configuraciones del Juego (gameConfig.ts)**

```typescript
export const GAME_CONFIG = {
  PLAYER: {
    SIZE: 32,
    SPEED: 200,
    HEALTH: 100,
    COLOR: 0x00ff00
  },
  ENEMY: {
    SIZE: 24,
    SPAWN_INTERVAL: 2000,
    COLOR: 0xff0000,
    DAMAGE: 20
  },
  BULLET: {
    SIZE: 8,
    SPEED: 400,
    COLOR: 0xffff00
  },
  SHOOTING: {
    INTERVAL: 500,
    AUTO_AIM: true
  }
};
```

### **🎯 Cómo Agregar Nuevas Funcionalidades**

#### **1. Agregar Power-ups:**
```typescript
// En MainScene.ts
private powerUps: Phaser.GameObjects.Rectangle[] = [];

// Crear power-up
const powerUp = this.add.rectangle(x, y, 16, 16, 0x00ffff);
this.physics.add.existing(powerUp);
this.powerUps.push(powerUp);

// Agregar colisión
this.physics.add.overlap(
  this.player,
  this.powerUps,
  this.handlePowerUpCollision,
  undefined,
  this
);
```

#### **2. Agregar Diferentes Tipos de Enemigos:**
```typescript
// En MainScene.ts
private enemyTypes = {
  ZOMBIE: { color: 0xff0000, speed: 100, health: 1 },
  FAST_ZOMBIE: { color: 0xff6600, speed: 150, health: 1 },
  TANK_ZOMBIE: { color: 0x8b0000, speed: 50, health: 3 }
};

// Crear enemigo con tipo
const enemyType = this.getRandomEnemyType();
const enemy = this.add.rectangle(x, y, 24, 24, enemyType.color);
```

#### **3. Agregar Sistema de Niveles:**
```typescript
// En MainScene.ts
private currentLevel: number = 1;
private levelConfig = {
  1: { enemySpawnRate: 2000, enemySpeed: 100 },
  2: { enemySpawnRate: 1500, enemySpeed: 120 },
  3: { enemySpawnRate: 1000, enemySpeed: 140 }
};

// Actualizar configuración por nivel
this.updateLevelConfig();
```

#### **4. Agregar Sonidos:**
```typescript
// En MainScene.ts
create() {
  // Cargar sonidos
  this.load.audio('shoot', 'assets/sounds/shoot.mp3');
  this.load.audio('explosion', 'assets/sounds/explosion.mp3');
  this.load.audio('damage', 'assets/sounds/damage.mp3');
}

// Reproducir sonido
this.sound.play('shoot');
```

### **🎨 Modificar la UI**

#### **Agregar Nuevos Elementos al HUD:**
```typescript
// En GameUI.tsx
const [powerUpCount, setPowerUpCount] = useState(0);
const [level, setLevel] = useState(1);

// En el JSX
<div className="bg-black/50 rounded-lg px-4 py-2">
  <span className="text-purple-400">Power-ups: {powerUpCount}</span>
</div>
```

#### **Crear Nuevos Componentes:**
```typescript
// src/components/PowerUpDisplay.tsx
export const PowerUpDisplay: React.FC<{ powerUps: PowerUp[] }> = ({ powerUps }) => {
  return (
    <div className="absolute bottom-4 left-4 z-50">
      {/* UI de power-ups */}
    </div>
  );
};
```

### **🔗 Integración con Backend**

#### **Estructura de API:**
```typescript
// src/services/gameService.ts
export const gameService = {
  saveGameData: async (gameData: GameData) => {
    return await api.post('/game/save', gameData);
  },
  
  loadGameData: async (userId: string) => {
    return await api.get(`/game/load/${userId}`);
  },
  
  getLeaderboard: async () => {
    return await api.get('/game/leaderboard');
  }
};
```

#### **Conectar con el Juego:**
```typescript
// En MainScene.ts
private async saveGameData() {
  const gameData = {
    score: this.score,
    time: this.gameTime,
    level: this.currentLevel,
    enemiesKilled: this.enemiesKilled
  };
  
  await gameService.saveGameData(gameData);
}
```

### **⚡ Optimizaciones de Rendimiento**

#### **Pool de Objetos:**
```typescript
// En MainScene.ts
private bulletPool: Phaser.GameObjects.Rectangle[] = [];
private enemyPool: Phaser.GameObjects.Rectangle[] = [];

private getBulletFromPool(): Phaser.GameObjects.Rectangle {
  return this.bulletPool.pop() || this.createNewBullet();
}

private returnBulletToPool(bullet: Phaser.GameObjects.Rectangle) {
  bullet.setActive(false);
  bullet.setVisible(false);
  this.bulletPool.push(bullet);
}
```

#### **Culling de Objetos:**
```typescript
// En MainScene.ts
private updateObjectVisibility() {
  const camera = this.cameras.main;
  
  this.enemies.forEach(enemy => {
    const isVisible = camera.worldView.contains(enemy.x, enemy.y);
    enemy.setVisible(isVisible);
  });
}
```

### **🐛 Debugging y Testing**

#### **Modo Debug:**
```typescript
// En MainScene.ts
create() {
  // Activar debug de física
  this.physics.world.drawDebug = true;
  
  // Mostrar FPS
  this.add.text(16, 16, '', { fontSize: '18px', color: '#ffffff' })
    .setScrollFactor(0)
    .setDepth(1000);
}
```

#### **Logs de Desarrollo:**
```typescript
// En MainScene.ts
private debugLog(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Game Debug] ${message}`, data);
  }
}
```

### **📊 Métricas y Analytics**

#### **Tracking de Eventos:**
```typescript
// En MainScene.ts
private trackEvent(eventName: string, data?: any) {
  // Enviar a analytics
  analytics.track(eventName, {
    score: this.score,
    time: this.gameTime,
    level: this.currentLevel,
    ...data
  });
}
```

### **🎯 Próximos Pasos Técnicos**

1. **Implementar sistema de power-ups**
2. **Agregar diferentes tipos de enemigos**
3. **Crear sistema de niveles progresivos**
4. **Integrar sistema de sonidos**
5. **Implementar guardado de progreso**
6. **Agregar sistema de logros**
7. **Optimizar rendimiento para móviles**
8. **Implementar modo multijugador**

---

**💡 Consejo:** Siempre prueba los cambios en desarrollo antes de implementar en producción. Usa el modo debug de Phaser para visualizar colisiones y física. 