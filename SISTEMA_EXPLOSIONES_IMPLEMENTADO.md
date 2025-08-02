# Sistema de Explosiones Reutilizable

## 🎯 Características Implementadas

### 1. **ExplosionManager - Sistema Central**
- ✅ **Sistema reutilizable** para cualquier tipo de explosión
- ✅ **Barriles explosivos** con gráficos placeholder
- ✅ **Colisiones nativas** con Phaser para barriles
- ✅ **Reacciones en cadena** entre barriles
- ✅ **Efectos visuales** completos con animaciones

### 2. **Barriles Explosivos**
```typescript
// Características de los barriles
- Salud: 3 HP
- Radio de explosión: 120px
- Daño de explosión: 50
- Gráfico: Rectángulo marrón con detalles visuales
- Símbolo de advertencia: 💥
```

### 3. **Sistema de Explosiones Configurable**
```typescript
interface ExplosionConfig {
  x: number;                    // Posición X
  y: number;                    // Posición Y  
  radius: number;               // Radio de explosión
  damage: number;               // Daño base
  damagePlayer: boolean;        // ¿Daña al jugador?
  damageEnemies: boolean;       // ¿Daña a enemigos?
  destroyStructures: boolean;   // ¿Destruye estructuras?
  source?: string;              // Fuente de la explosión
}
```

## 🔧 Métodos Públicos Disponibles

### Para Lanzagranadas:
```typescript
explosionManager.createGrenadeExplosion(x, y);
// Radio: 100px, Daño: 40, No daña al jugador
```

### Para Misiles:
```typescript
explosionManager.createMissileExplosion(x, y);
// Radio: 150px, Daño: 80, No daña al jugador
```

### Para Explosiones Personalizadas:
```typescript
explosionManager.createCustomExplosion(x, y, radius, damage, damagePlayer);
// Completamente configurable
```

## 🎮 Efectos de las Explosiones

### 1. **Daño al Jugador**
- ✅ **Daño basado en distancia** - más cerca = más daño
- ✅ **Efecto visual de daño** en el jugador
- ✅ **Game over** si la salud llega a 0
- ✅ **Texto de daño** flotante

### 2. **Daño a Enemigos**
- ✅ **Eliminación múltiple** de enemigos en el radio
- ✅ **Bonus de puntuación** por explosión (+15 por enemigo)
- ✅ **Texto de puntuación** flotante
- ✅ **Daño gradual** basado en distancia

### 3. **Destrucción de Estructuras**
- ✅ **Detección de estructuras** en el radio
- ✅ **Efectos visuales** de destrucción
- ✅ **Contador de estructuras** destruidas
- ✅ **Preparado para implementar** destrucción real

### 4. **Reacciones en Cadena**
- ✅ **Explosión automática** de barriles cercanos
- ✅ **Delay escalonado** para efecto visual
- ✅ **Detección de radio** entre explosiones
- ✅ **Prevención de bucles** infinitos

## 🎨 Efectos Visuales

### 1. **Animación de Explosión**
- ✅ **Círculo principal** naranja (radio completo)
- ✅ **Círculo interno** dorado (60% del radio)
- ✅ **Núcleo central** blanco (30% del radio)
- ✅ **Expansión y desvanecimiento** suave

### 2. **Partículas**
- ✅ **12 partículas** que se expanden radialmente
- ✅ **Colores naranjas** para realismo
- ✅ **Animación de dispersión** hacia el exterior
- ✅ **Desvanecimiento gradual**

### 3. **Efectos de Cámara**
- ✅ **Sacudida de cámara** (300ms, intensidad 0.02)
- ✅ **Sincronizado** con la explosión
- ✅ **No invasivo** pero perceptible

## 🔗 Integración Completa

### 1. **CollisionManager**
- ✅ **Colisiones bala-barril** detectadas automáticamente
- ✅ **Colisiones nativas** jugador/enemigos vs barriles
- ✅ **Estadísticas** incluyen conteo de barriles
- ✅ **Limpieza automática** de barriles fuera de pantalla

### 2. **MainScene**
- ✅ **Generación automática** de 5 barriles al inicio
- ✅ **Integración completa** con todos los managers
- ✅ **Eventos de balas** manejados correctamente
- ✅ **Limpieza en destrucción** de la escena

### 3. **Mundo Procedural**
- ✅ **Barriles respetan estructuras** - no aparecen muy cerca
- ✅ **Generación aleatoria** alrededor del jugador
- ✅ **Limpieza automática** cuando están lejos
- ✅ **Colisiones nativas** funcionando perfectamente

## 🚀 Uso del Sistema

### Para Barriles:
```typescript
// Los barriles se generan automáticamente
// Se pueden disparar para explotar
// Crean reacciones en cadena
```

### Para Lanzagranadas (futuro):
```typescript
// En el arma de lanzagranadas:
this.explosionManager.createGrenadeExplosion(targetX, targetY);
```

### Para Misiles (futuro):
```typescript
// En el arma de misiles:
this.explosionManager.createMissileExplosion(targetX, targetY);
```

## 🎯 Resultado Final

**Sistema de explosiones completamente funcional**:
- ✅ **Barriles explosivos** con gráficos placeholder
- ✅ **Colisiones nativas** sin stuttering
- ✅ **Explosiones reutilizables** para cualquier arma
- ✅ **Efectos visuales** impresionantes
- ✅ **Reacciones en cadena** espectaculares
- ✅ **Daño configurable** a jugador, enemigos y estructuras
- ✅ **Integración perfecta** con el mundo procedural

El sistema está listo para ser usado por lanzagranadas, misiles, o cualquier otra arma explosiva que quieras agregar al juego.