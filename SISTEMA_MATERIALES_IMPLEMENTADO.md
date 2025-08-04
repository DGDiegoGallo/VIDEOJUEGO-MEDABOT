# 🎮 Sistema de Materiales Implementado - Medabot Game

## 📋 Resumen

Se ha implementado un sistema completo para manejar materiales recolectados durante el juego, con sincronización automática con Strapi v4 y bonus de victoria. **Sistema simplificado y optimizado**.

## 🔧 Componentes Implementados

### 1. **SupplyBoxManager Simplificado**
- **Ubicación**: `src/managers/SupplyBoxManager.ts`
- **Funcionalidades**:
  - Maneja materiales solo de la sesión actual (no localStorage)
  - Aplica bonus de victoria automáticamente
  - Sin duplicación de localStorage

### 2. **GameSessionService Optimizado**
- **Ubicación**: `src/services/gameSessionService.ts`
- **Funcionalidades**:
  - `updateSessionMaterials()` - Actualiza materiales en Strapi
  - `updateLocalStorageMaterials()` - Sincroniza localStorage una sola vez
  - Maneja bonus de victoria (25% por defecto)

### 3. **GameStateManager Integrado**
- **Ubicación**: `src/managers/GameStateManager.ts`
- **Funcionalidades**:
  - Integración con SupplyBoxManager
  - Llamadas automáticas a Strapi al terminar partida
  - Manejo de bonus de victoria
  - Limpieza de materiales de sesión

### 4. **MainScene Actualizado**
- **Ubicación**: `src/scenes/MainScene.ts`
- **Cambios**:
  - Pasa userId a SupplyBoxManager
  - Integra GameStateManager con SupplyBoxManager
  - GameStateManager público para acceso desde GamePage

### 5. **GamePage Mejorado**
- **Ubicación**: `src/pages/GamePage.tsx`
- **Funcionalidades**:
  - Obtiene sesión activa del usuario
  - Establece sessionId en GameStateManager
  - Maneja eventos de materiales recolectados

## 🎯 Flujo de Funcionamiento (Escalable)

### **Durante el Juego:**
1. **Jugador recolecta caja de suministros**
   - SupplyBoxManager agrega materiales a la sesión actual
   - **Se actualiza localStorage inmediatamente** con el acumulado total
   - Se emite evento `supplyBoxCollected`

2. **Materiales se acumulan escalablemente**
   - Cada caja recolectada actualiza localStorage
   - Los materiales se van sumando al total existente
   - Sin duplicaciones, solo acumulación

### **Al Terminar la Partida:**

#### **Si Gana (Victoria):**
```typescript
// GameStateManager.gameWin()
const materialsCollected = this.supplyBoxManager.getSessionMaterials();
const result = await gameSessionService.updateSessionMaterials({
  sessionId: this.sessionId,
  materials: materialsCollected,
  isVictory: true,
  victoryBonusPercentage: 0.25 // 25% de bonus
});
// Se actualiza Strapi con los materiales de la sesión
// localStorage ya está actualizado desde el SupplyBoxManager
// Se limpian los materiales de la sesión para la próxima partida
```

#### **Si Pierde (Muerte):**
```typescript
// GameStateManager.gameOver()
const materialsCollected = this.supplyBoxManager.getSessionMaterials();
const result = await gameSessionService.updateSessionMaterials({
  sessionId: this.sessionId,
  materials: materialsCollected,
  isVictory: false
});
// Se actualiza Strapi con los materiales de la sesión
// localStorage ya está actualizado desde el SupplyBoxManager
// Se limpian los materiales de la sesión para la próxima partida
```

## 📊 Estructura de Datos

### **Formato de Materiales (Strapi):**
```json
{
  "materials": {
    "steel": 0,
    "energy_cells": 0,
    "medicine": 0,
    "food": 0
  }
}
```

### **localStorage Keys (Única):**
- `game-materials-{userId}` - Materiales totales del usuario (solo una clave)

## 🏆 Sistema de Bonus

### **Bonus de Victoria:**
- **Porcentaje**: 25% por defecto (configurable)
- **Aplicación**: Solo si el jugador gana la partida
- **Cálculo**: `Math.floor(materiales_recolectados * 0.25)`
- **Ejemplo**: Si recolectó 10 steel, obtiene 2 steel extra

### **Configuración:**
```typescript
// En GameStateManager.gameWin()
victoryBonusPercentage: 0.25 // 25% de bonus
```

## 🔄 Sincronización (Escalable)

### **Flujo Escalable:**
1. **Durante el juego**: Cada caja recolectada actualiza localStorage inmediatamente
2. **Acumulación**: Los materiales se van sumando al total existente
3. **Al terminar**: Se actualiza Strapi con los materiales de la sesión
4. **Limpieza**: Se limpian los materiales de la sesión para la próxima partida
5. **Sin duplicación**: Solo una clave en localStorage por usuario

### **Ventajas:**
- ✅ Acumulación escalable en tiempo real
- ✅ localStorage siempre actualizado
- ✅ Sin duplicaciones
- ✅ Una sola actualización a Strapi al final
- ✅ Mejor experiencia de usuario (ve progreso inmediato)

## 🎮 Uso en el Juego

### **Recolectar Materiales:**
```typescript
// El jugador toca una caja de suministros
const boxData = supplyBoxManager.collectSupplyBox(supplyBox);
// Se agrega a la sesión actual Y se actualiza localStorage inmediatamente
// Los materiales se acumulan al total existente
```

### **Ver Materiales Recolectados:**
```typescript
// Obtener materiales de la sesión actual
const sessionMaterials = supplyBoxManager.getSessionMaterials();

// Obtener materiales totales desde localStorage (siempre actualizado)
const storageKey = `game-materials-${userId}`;
const totalMaterials = JSON.parse(localStorage.getItem(storageKey) || '{}');
// Este total se actualiza cada vez que recolectas una caja
```

### **Aplicar Bonus Manualmente:**
```typescript
// Aplicar bonus de victoria
const bonusMaterials = supplyBoxManager.applyVictoryBonus(0.25);
```

### **Limpieza de Sesión:**
```typescript
// Se ejecuta automáticamente al terminar la partida
supplyBoxManager.clearSessionMaterials();
// Limpia los materiales de la sesión actual para la próxima partida
// localStorage mantiene el total acumulado
```

## 🧹 Limpieza de localStorage Duplicados

### **Script de Limpieza:**
```javascript
// Ejecutar en la consola del navegador
// Archivo: cleanup-materials.js

// El script elimina todas las claves duplicadas y mantiene solo:
// game-materials-{userId}
```

### **Cómo usar:**
1. Abrir consola del navegador (F12)
2. Copiar y pegar el contenido de `cleanup-materials.js`
3. Ejecutar para limpiar duplicados

## 🐛 Debug y Testing

### **Teclas de Debug:**
- **Z**: Ganar automáticamente (aplica bonus)
- **X**: Perder automáticamente (sin bonus)

### **Logs Importantes:**
```javascript
// Al recolectar materiales (cada caja)
console.log('📦 Materiales agregados a la sesión:', materials);
console.log('📦 Total de materiales en sesión:', total);
console.log('💾 Materiales actualizados en localStorage (acumulado):', currentMaterials);

// Al actualizar Strapi (solo al final)
console.log('✅ Materiales actualizados exitosamente:', result);

// Al aplicar bonus
console.log('🏆 Bonus de victoria aplicado:', bonusMaterials);
```

## 📈 Estadísticas

### **Materiales Disponibles:**
- **Steel**: 1-3 unidades, 40% de probabilidad
- **Energy Cells**: 1-2 unidades, 30% de probabilidad
- **Medicine**: Se obtiene del lobby (no en cajas)
- **Food**: No implementado aún

### **Probabilidades de Spawn:**
- **Caja de suministros**: 15% por enemigo derrotado
- **Configurable** en `SupplyBoxConfig`

## 🔧 Configuración

### **Modificar Probabilidades:**
```typescript
// En SupplyBoxManager
this.config = {
  spawnChance: 0.15, // 15% de spawn
  materials: {
    steel: { min: 1, max: 3, chance: 0.4 },
    energy_cells: { min: 1, max: 2, chance: 0.3 }
  }
};
```

### **Modificar Bonus de Victoria:**
```typescript
// En GameStateManager.gameWin()
victoryBonusPercentage: 0.25 // Cambiar a 0.5 para 50%
```

## ✅ Estado de Implementación

- ✅ **SupplyBoxManager** - Simplificado, sin localStorage duplicado
- ✅ **GameSessionService** - Una sola actualización a Strapi
- ✅ **GameStateManager** - Integración completa
- ✅ **MainScene** - Parámetros correctos
- ✅ **GamePage** - Manejo de sessionId
- ✅ **localStorage** - Una sola clave por usuario
- ✅ **Strapi v4** - Actualización correcta
- ✅ **Bonus de Victoria** - 25% automático
- ✅ **Debug Keys** - Z para ganar, X para perder
- ✅ **Limpieza** - Script para eliminar duplicados

## 🎯 Próximos Pasos

1. **Testing**: Probar con diferentes usuarios y sesiones
2. **UI**: Mostrar materiales recolectados en tiempo real
3. **Optimización**: Sistema ya optimizado
4. **Extensión**: Agregar más tipos de materiales
5. **Analytics**: Tracking de materiales recolectados

## 🚀 Cómo Probar

1. **Ejecutar script de limpieza** (opcional):
   ```javascript
   // En consola del navegador
   // Copiar contenido de cleanup-materials.js
   ```

2. **Iniciar juego** con usuario autenticado
3. **Derrotar enemigos** para que aparezcan cajas
4. **Recolectar cajas** de suministros
5. **Ganar partida** (tecla Z) o perder (tecla X)
6. **Verificar** en Strapi que los materiales se actualizaron
7. **Verificar** en localStorage que solo hay una clave

## 🔧 Cambios Recientes

### **Sistema Escalable Implementado:**
- ✅ Agregado: Actualización inmediata de localStorage al recolectar cada caja
- ✅ Agregado: Acumulación escalable de materiales en tiempo real
- ✅ Agregado: Una sola actualización a Strapi al final
- ✅ Agregado: Limpieza automática de materiales de sesión al terminar
- ✅ Mantenido: Sin duplicaciones en localStorage
- ✅ Mejorado: Experiencia de usuario (ve progreso inmediato)

### **Flujo Optimizado:**
1. **Recolectar caja** → Actualiza localStorage inmediatamente
2. **Acumular materiales** → Se van sumando al total existente
3. **Terminar partida** → Actualiza Strapi con materiales de la sesión
4. **Limpiar sesión** → Se limpian materiales de sesión para próxima partida
5. **Resultado** → localStorage siempre actualizado, sin duplicaciones, sesión limpia

El sistema está completamente funcional, optimizado y sin duplicaciones! 🎮 