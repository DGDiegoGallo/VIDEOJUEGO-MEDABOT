# Sistema de Escalado de Enemigos y Dasher

## 🎯 **Nuevas Características Implementadas**

### 1. **Escalado de Dificultad Dinámico**
- **Más enemigos por minuto**: El intervalo de spawn se reduce automáticamente
- **Configuración flexible**: Fácil ajuste de parámetros de escalado
- **Logs detallados**: Información en tiempo real del progreso

### 2. **Enemigo Dasher (Violeta)**
- **Apariencia**: Cuadrado violeta más grande que los zombies normales
- **Vida**: 3 puntos de vida (requiere 3 disparos para eliminar)
- **Velocidad**: Más rápido que los zombies normales
- **Habilidad especial**: Dash hacia el jugador
- **Desbloqueo**: Aparece después de 60 segundos de juego

## 📊 **Configuración del Sistema**

### Escalado de Dificultad
```typescript
difficultyScaling: {
  enabled: true,
  baseSpawnInterval: 2000,        // Intervalo inicial (2 segundos)
  minSpawnInterval: 500,          // Intervalo mínimo (0.5 segundos)
  spawnIntervalReduction: 150,    // Reduce 150ms por minuto
  dasherSpawnChance: 0.15,        // 15% de probabilidad de spawn
  dasherUnlockTime: 60,           // Desbloquea a los 60 segundos
}
```

### Configuración del Dasher
```typescript
dasherConfig = {
  color: 0x8a2be2,        // Violeta
  strokeColor: 0x4b0082,  // Violeta oscuro
  size: 28,               // Ligeramente más grande
  speed: 120,             // Más rápido
  damage: 30,             // Más daño
  health: 3,              // 3 puntos de vida
  dashCooldown: 3000,     // 3 segundos entre dashes
  dashSpeed: 300,         // Velocidad del dash
  dashDuration: 500,      // Duración del dash en ms
}
```

## 🎮 **Progresión de Dificultad**

### Minuto 1 (0-60 segundos)
- **Spawn**: Cada 2 segundos
- **Enemigos**: Solo zombies rojos
- **Dasher**: No disponible

### Minuto 2 (60-120 segundos)
- **Spawn**: Cada 1.85 segundos
- **Enemigos**: Zombies + 15% probabilidad de Dasher
- **Dasher**: Desbloqueado con dash

### Minuto 3 (120-180 segundos)
- **Spawn**: Cada 1.7 segundos
- **Enemigos**: Más zombies + más Dashers
- **Dificultad**: Aumenta significativamente

### Minuto 8+ (480+ segundos)
- **Spawn**: Cada 0.5 segundos (máximo)
- **Enemigos**: Horda masiva
- **Victoria**: Se alcanza automáticamente

## 💜 **Mecánicas del Dasher**

### Sistema de Dash
```typescript
// Condiciones para activar dash
if (!isDashing && 
    currentTime - lastDashTime > dashCooldown &&
    distanceToPlayer > 150 && 
    distanceToPlayer < 300) {
  performDash(enemy, playerX, playerY);
}
```

### Efectos Visuales
- **Estela violeta**: Durante el dash
- **Animación de spawn**: Parpadeo especial
- **Efecto de daño**: Escala al recibir daño
- **Desvanecimiento**: Estela que se desvanece

### Comportamiento Inteligente
1. **Movimiento normal**: Hacia el jugador
2. **Detección de distancia**: Entre 150-300 píxeles
3. **Dash automático**: Cada 3 segundos
4. **Velocidad aumentada**: Durante el dash
5. **Retorno a normal**: Después del dash

## 🔧 **Sistema de Daño Mejorado**

### Zombies Normales
- **Vida**: 1 punto
- **Eliminación**: 1 disparo
- **Efecto visual**: Parpadeo simple

### Dasher
- **Vida**: 3 puntos
- **Eliminación**: 3 disparos
- **Efecto visual**: Parpadeo + escala
- **Feedback**: Muestra vida restante

### Logs de Debug
```
💜 Dasher creado con dash y 3 de vida
💜 Dasher ejecutando dash hacia el jugador!
💜 Dasher dañado! Vida restante: 2/3
💜 Dasher dañado! Vida restante: 1/3
💀 Enemigo eliminado
```

## 📈 **Estadísticas en Tiempo Real**

### Método `getStats()`
```typescript
{
  totalEnemies: number,        // Total de enemigos activos
  dasherCount: number,         // Cantidad de Dashers
  zombieCount: number,         // Cantidad de zombies
  currentSpawnInterval: number, // Intervalo actual de spawn
  dasherUnlocked: boolean,     // Si el Dasher está desbloqueado
  gameTime: number             // Tiempo transcurrido
}
```

### Logs de Progreso
```
🕐 Tiempo: 90s (1:30)
🎯 Enemigos: 8 (6 zombies, 2 dashers)
⚡ Spawn cada: 1850ms
🎯 Dificultad aumentada: Spawn cada 1700ms (minuto 3)
💜 Dasher desbloqueado! Enemigo violeta con dash disponible
```

## 🎯 **Beneficios del Sistema**

### 1. **Progresión Natural**
- ✅ Dificultad aumenta gradualmente
- ✅ Nuevos enemigos se introducen orgánicamente
- ✅ Mantiene el juego interesante

### 2. **Variedad de Enemigos**
- ✅ Zombies básicos para principiantes
- ✅ Dashers para jugadores experimentados
- ✅ Diferentes estrategias requeridas

### 3. **Feedback Visual**
- ✅ Efectos distintivos para cada tipo
- ✅ Información clara de daño
- ✅ Logs detallados para debugging

### 4. **Escalabilidad**
- ✅ Fácil agregar nuevos tipos de enemigos
- ✅ Configuración flexible
- ✅ Sistema de probabilidades

## 🚀 **Próximas Mejoras Posibles**

### Nuevos Tipos de Enemigos
- **Tank**: Enemigo lento pero muy resistente
- **Bomber**: Explota al morir
- **Sniper**: Dispara proyectiles
- **Swarm**: Enemigos pequeños en grupo

### Mejoras del Sistema
- **Patrones de movimiento**: Más complejos
- **Habilidades especiales**: Únicas por tipo
- **Drops especiales**: Recompensas por tipo
- **Bosses**: Enemigos únicos en momentos específicos

¡El sistema de enemigos ahora es mucho más dinámico y desafiante! 🎮 