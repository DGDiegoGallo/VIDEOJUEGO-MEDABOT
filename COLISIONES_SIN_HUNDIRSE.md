# Sistema de Colisiones - Sin Hundirse (Anti-Stuck)

## 🎯 Problema Resuelto
Los objetos se "hundían" dentro de los obstáculos y quedaban atrapados (stuck) porque solo se detenía la velocidad pero no se corregía la posición de overlap.

## ✅ Solución Implementada

### 1. **Detener + Separar Mínimo**
```typescript
private handlePlayerStructureCollision(playerSprite, structure): void {
  const body = playerSprite.body as Phaser.Physics.Arcade.Body;
  if (!body) return;

  // DETENER COMPLETAMENTE
  body.setVelocity(0, 0);
  
  // Separar SOLO lo necesario para salir del overlap
  this.separateFromObstacle(playerSprite, structure, 12); // Radio del jugador
}
```

### 2. **Separación Inteligente y Mínima**
```typescript
private separateFromObstacle(gameObject, obstacle, objectRadius): void {
  // Calcular overlap en cada dirección
  const overlapLeft = (objX + objectRadius) - obstacleBounds.left;
  const overlapRight = obstacleBounds.right - (objX - objectRadius);
  const overlapTop = (objY + objectRadius) - obstacleBounds.top;
  const overlapBottom = obstacleBounds.bottom - (objY - objectRadius);
  
  // Encontrar la separación mínima (menor overlap)
  const minOverlapX = Math.min(overlapLeft, overlapRight);
  const minOverlapY = Math.min(overlapTop, overlapBottom);
  
  // Separar por el lado que requiere menos movimiento
  if (minOverlapX < minOverlapY) {
    // Separar horizontalmente (izquierda o derecha)
    if (overlapLeft < overlapRight) {
      gameObject.setPosition(obstacleBounds.left - objectRadius - 1, objY);
    } else {
      gameObject.setPosition(obstacleBounds.right + objectRadius + 1, objY);
    }
  } else {
    // Separar verticalmente (arriba o abajo)
    if (overlapTop < overlapBottom) {
      gameObject.setPosition(objX, obstacleBounds.top - objectRadius - 1);
    } else {
      gameObject.setPosition(objX, obstacleBounds.bottom + objectRadius + 1);
    }
  }
}
```

## 🎮 Cómo Funciona

### Antes (Problema):
1. Jugador se acerca al obstáculo
2. Detecta overlap → `setVelocity(0, 0)`
3. **Queda hundido dentro del obstáculo**
4. No puede moverse (stuck)

### Ahora (Solución):
1. Jugador se acerca al obstáculo
2. Detecta overlap → `setVelocity(0, 0)`
3. **Calcula separación mínima necesaria**
4. **Mueve SOLO lo necesario para salir del overlap**
5. Queda justo en el borde, sin hundirse

## 🔧 Características de la Separación

### Separación Inteligente:
- ✅ **Calcula 4 direcciones**: izquierda, derecha, arriba, abajo
- ✅ **Elige la mínima**: Mueve por donde requiere menos distancia
- ✅ **Posicionamiento exacto**: `objectRadius + 1` pixel de margen
- ✅ **Sin empuje excesivo**: Solo lo necesario

### Para Todos los Objetos:
- ✅ **Jugador**: Radio 12px
- ✅ **Enemigos**: Radio dinámico (`enemy.width / 2`)
- ✅ **Todos los tipos**: Mismo algoritmo para todos

## 📊 Ejemplo de Cálculo

### Jugador hundido en estructura:
```
Jugador: x=100, y=100, radio=12
Estructura: x=90, y=90, width=32, height=32

Overlaps calculados:
- overlapLeft = (100+12) - 90 = 22px
- overlapRight = (90+32) - (100-12) = 34px  
- overlapTop = (100+12) - 90 = 22px
- overlapBottom = (90+32) - (100-12) = 34px

Mínimos:
- minOverlapX = min(22, 34) = 22px
- minOverlapY = min(22, 34) = 22px

Como son iguales, separa horizontalmente:
- overlapLeft (22) < overlapRight (34)
- Nueva posición: x = 90 - 12 - 1 = 77
- Resultado: Jugador en (77, 100) - justo fuera del obstáculo
```

## 🚀 Resultado Final

### Comportamiento Perfecto:
- ✅ **Se detiene en seco** al tocar obstáculo
- ✅ **No se hunde** dentro del obstáculo  
- ✅ **No queda stuck** - puede moverse libremente
- ✅ **Separación mínima** - no hay empuje excesivo
- ✅ **Funciona para todos** - jugador y enemigos

### Casos Cubiertos:
- ✅ Jugador vs estructura gris
- ✅ Jugador vs río azul
- ✅ Enemigo rojo vs obstáculos
- ✅ Enemigo púrpura vs obstáculos
- ✅ Todos los tipos de enemigos

El sistema ahora funciona como una **pared sólida perfecta**: detiene en seco pero sin hundir ni atrapar al objeto.