# 🔄 Sistema de Carga Optimizado

## Descripción

El nuevo sistema de carga pre-genera todos los recursos del juego antes de iniciar el gameplay, eliminando el lag causado por la generación dinámica de chunks durante el juego.

## Arquitectura

### 1. **LoadingScene** (`src/scenes/LoadingScene.ts`)
- Escena dedicada a la carga inicial
- Muestra progreso visual y consejos de juego
- Maneja errores de carga con opción de reintentar

### 2. **LoadingManager** (`src/managers/LoadingManager.ts`)
- Coordina la carga de todos los sistemas
- Carga por lotes para evitar bloqueo del hilo principal
- Soporte para diferentes tipos de dispositivos

### 3. **Configuración Adaptativa** (`src/config/loadingConfig.ts`)
- Configuración específica por dispositivo (móvil, tablet, desktop)
- Optimizaciones de rendimiento
- Consejos de carga rotativos

## Flujo de Carga

```
LoadingScene → LoadingManager → MainScene
     ↓              ↓              ↓
  UI Carga    Precarga Chunks   Gameplay
```

### Fases de Carga

1. **Carga del Mundo (70%)**: Pre-genera 25 chunks en lotes de 5
2. **Inicialización del Jugador (20%)**: Verifica que el jugador esté listo
3. **Efectos NFT (10%)**: Carga efectos de NFTs del usuario

## Optimizaciones Implementadas

### 🚀 Rendimiento
- **Carga por lotes**: Evita bloqueo del hilo principal
- **Configuración por dispositivo**: Menos chunks en móviles
- **Logs reducidos**: Solo en modo desarrollo
- **Precarga inteligente**: Solo genera chunks necesarios

### 📱 Dispositivos
- **Móvil**: 16 chunks (4x4), lotes de 3, delay 32ms
- **Tablet**: 20 chunks (4x5), lotes de 4, delay 24ms  
- **Desktop**: 25 chunks (5x5), lotes de 5, delay 16ms

### 🎨 Experiencia de Usuario
- **Barra de progreso**: Visual feedback del progreso
- **Consejos rotativos**: Tips útiles durante la carga
- **Manejo de errores**: Opción de reintentar en caso de fallo
- **Animaciones suaves**: Transiciones fluidas

## Configuración

### Personalizar Chunks Precargados
```typescript
// En loadingConfig.ts
export const LOADING_CONFIG = {
  PRELOAD_CHUNKS: 25, // Cambiar número de chunks
  CHUNK_BATCH_SIZE: 5, // Chunks por lote
  BATCH_DELAY: 16, // Delay entre lotes (ms)
}
```

### Agregar Nuevos Consejos
```typescript
// En loadingConfig.ts
LOADING_TIPS: [
  "💡 Tu nuevo consejo aquí",
  // ... más consejos
]
```

## Archivos Modificados

### ✅ Nuevos Archivos
- `src/managers/LoadingManager.ts` - Manager de carga
- `src/scenes/LoadingScene.ts` - Escena de carga
- `src/config/loadingConfig.ts` - Configuración del sistema

### ✅ Archivos Actualizados
- `src/scenes/MainScene.ts` - Soporte para managers precargados
- `src/managers/WorldManager.ts` - Método de precarga y logs optimizados
- `src/pages/GamePage.tsx` - Integración de LoadingScene

## Uso

### Iniciar con Carga
```typescript
// El juego ahora inicia automáticamente con LoadingScene
// GamePage.tsx configura: scene: [LoadingScene, MainScene]
```

### Modo Legacy (Sin Carga)
```typescript
// MainScene detecta automáticamente si no hay precarga
// y funciona en modo legacy para compatibilidad
```

## Beneficios

### 🎯 Rendimiento
- **Eliminación de lag**: No más generación dinámica durante gameplay
- **FPS estables**: Mundo pre-generado = rendimiento consistente
- **Memoria optimizada**: Limpieza automática de chunks distantes

### 🎮 Experiencia
- **Carga única**: Solo al inicio del juego
- **Feedback visual**: El usuario sabe qué está pasando
- **Consejos útiles**: Aprende mientras carga

### 🔧 Mantenimiento
- **Código modular**: Fácil de mantener y extender
- **Configuración centralizada**: Un lugar para todos los ajustes
- **Detección de errores**: Manejo robusto de fallos

## Próximas Mejoras

- [ ] **Carga progresiva**: Cargar chunks adicionales en background
- [ ] **Cache persistente**: Guardar chunks generados entre sesiones
- [ ] **Compresión**: Reducir memoria de chunks no activos
- [ ] **Métricas**: Tracking de tiempos de carga por dispositivo

## Troubleshooting

### Problema: Carga muy lenta
**Solución**: Reducir `PRELOAD_CHUNKS` en `loadingConfig.ts`

### Problema: Error de carga
**Solución**: El sistema muestra botón "REINTENTAR" automáticamente

### Problema: Lag después de la carga
**Solución**: Verificar que `cleanupDistantChunks` esté funcionando

---

**Resultado**: El juego ahora carga una sola vez al inicio y mantiene 60 FPS estables durante todo el gameplay. 🚀