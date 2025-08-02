# 🎯 Sistema de Habilidades - Medabot Survival

## 📋 **Resumen del Sistema**

El sistema de habilidades permite a los jugadores mejorar sus capacidades cada vez que suben de nivel. Cada habilidad tiene crecimiento exponencial y múltiples niveles de mejora.

## ⚡ **Habilidades Disponibles**

### **1. Disparo Rápido (Rapid Fire)**
- **Icono**: ⚡ (Rayo)
- **Color**: Amarillo/Naranja
- **Niveles máximos**: 10
- **Efecto**: Reduce el tiempo entre disparos
- **Crecimiento**: -50ms por nivel (500ms → 100ms mínimo)
- **Beneficio**: Más DPS, mejor supervivencia

```typescript
// Configuración
RAPID_FIRE: {
  ID: 'rapidFire',
  NAME: 'Disparo Rápido',
  DESCRIPTION: 'Reduce el tiempo entre disparos',
  BASE_REDUCTION: 50, // ms reducidos por nivel
  MAX_LEVEL: 10,
  ICON: '⚡'
}
```

### **2. Campo Magnético (Magnetic Field)**
- **Icono**: 🧲 (Imán)
- **Color**: Azul/Cian
- **Niveles máximos**: 8
- **Efecto**: Aumenta el rango de atracción de experiencia
- **Crecimiento**: +30px por nivel (60px → 300px máximo)
- **Beneficio**: Recolección más fácil de EXP

```typescript
// Configuración
MAGNETIC_FIELD: {
  ID: 'magneticField',
  NAME: 'Campo Magnético',
  DESCRIPTION: 'Aumenta el rango de atracción de la experiencia',
  BASE_RANGE: 30, // píxeles adicionales por nivel
  MAX_LEVEL: 8,
  ICON: '🧲'
}
```

### **3. Disparo Múltiple (Multi Shot)**
- **Icono**: 🔫 (Pistola)
- **Color**: Rojo/Rosa
- **Niveles máximos**: 6
- **Efecto**: Dispara múltiples balas simultáneamente
- **Crecimiento**: +1 bala por nivel (1 → 7 balas máximo)
- **Beneficio**: Más daño por disparo, mejor cobertura

```typescript
// Configuración
MULTI_SHOT: {
  ID: 'multiShot',
  NAME: 'Disparo Múltiple',
  DESCRIPTION: 'Dispara múltiples balas simultáneamente',
  BASE_BULLETS: 1, // balas adicionales por nivel
  MAX_LEVEL: 6,
  ICON: '🔫'
}
```

## 🎮 **Mecánicas del Sistema**

### **Activación del Modal**
1. **Trigger**: Al subir de nivel (llenar barra de EXP)
2. **Pausa**: El juego se pausa automáticamente
3. **Selección obligatoria**: Debe elegir una habilidad para continuar
4. **Efectos visuales**: Explosión de nivel + flash de pantalla

### **Crecimiento Exponencial**
```typescript
// Experiencia requerida por nivel
maxExperience = Math.floor(100 * Math.pow(1.5, level - 1));

// Ejemplos:
// Nivel 1: 100 EXP
// Nivel 2: 150 EXP  
// Nivel 3: 225 EXP
// Nivel 4: 337 EXP
// Nivel 5: 506 EXP
```

### **Efectos Acumulativos**
- **Disparo Rápido**: Cada nivel reduce 50ms el intervalo
- **Campo Magnético**: Cada nivel suma 30px al rango
- **Disparo Múltiple**: Cada nivel suma 1 bala adicional

## 🎨 **Interfaz de Usuario**

### **Modal de Selección**
- **Diseño**: Glassmorphism con gradientes
- **Layout**: Grid de 3 columnas (1 por habilidad)
- **Información mostrada**:
  - Icono y nombre de la habilidad
  - Descripción del efecto
  - Nivel actual y siguiente
  - Barra de progreso
  - Efecto específico del próximo nivel
  - Badge "MAX" si está al máximo

### **HUD de Habilidades Activas**
- **Ubicación**: Parte inferior del HUD principal
- **Formato**: Grid de 3 columnas con iconos
- **Información**: Icono + nivel actual de cada habilidad
- **Colores**: Coinciden con los colores del modal

## 🔧 **Implementación Técnica**

### **Archivos Principales**
```
src/components/SkillSelectionModal.tsx  # Modal de selección
src/scenes/MainScene.ts                 # Lógica del juego
src/config/gameConfig.ts                # Configuración
src/pages/GamePage.tsx                  # Integración React-Phaser
src/components/GameUI.tsx               # HUD actualizado
```

### **Flujo de Datos**
```typescript
// 1. Subida de nivel en MainScene
levelUp() → emit('levelUp', { level, skills })

// 2. GamePage recibe el evento
mainScene.events.on('levelUp', showSkillModal)

// 3. Jugador selecciona habilidad
onSkillSelect(skillId) → mainScene.selectSkill(skillId)

// 4. MainScene aplica la mejora
selectSkill() → updateGameValues() → resume()
```

### **Variables Dinámicas**
```typescript
// En MainScene.ts
private currentShootInterval: number = 500;    // Afectado por rapidFire
private currentMagneticRange: number = 60;     // Afectado por magneticField  
private currentBulletsPerShot: number = 1;     // Afectado por multiShot
```

## 🎯 **Estrategias de Juego**

### **Early Game (Niveles 1-3)**
- **Prioridad**: Disparo Rápido para supervivencia básica
- **Alternativa**: Campo Magnético si hay muchos rombos

### **Mid Game (Niveles 4-7)**
- **Balanceado**: Mezclar Disparo Rápido y Disparo Múltiple
- **Recolección**: Campo Magnético para farming de EXP

### **Late Game (Niveles 8+)**
- **Maximizar**: Completar habilidades favoritas
- **Especialización**: Enfocarse en un estilo de juego

## 📊 **Balanceo y Progresión**

### **Curva de Poder**
- **Nivel 1-5**: Mejoras notables pero manejables
- **Nivel 6-10**: Poder significativo, juego más dinámico
- **Nivel 11+**: Jugador muy poderoso, supervivencia extendida

### **Límites de Habilidades**
- **Disparo Rápido**: Mínimo 100ms (10 disparos/segundo)
- **Campo Magnético**: Máximo 300px (casi toda la pantalla)
- **Disparo Múltiple**: Máximo 7 balas (balance vs rendimiento)

## 🚀 **Futuras Expansiones**

### **Nuevas Habilidades Potenciales**
- **Escudo Temporal**: Invulnerabilidad por segundos
- **Explosión de Área**: Balas que explotan
- **Regeneración**: Curación automática
- **Velocidad**: Movimiento más rápido
- **Críticos**: Probabilidad de daño doble

### **Mecánicas Avanzadas**
- **Sinergias**: Bonos por combinar habilidades
- **Evoluciones**: Habilidades que cambian al máximo nivel
- **Especializaciones**: Ramas de habilidades exclusivas

## 🐛 **Consideraciones Técnicas**

### **Rendimiento**
- **Disparo Múltiple**: Más objetos en pantalla
- **Disparo Rápido**: Más cálculos por segundo
- **Campo Magnético**: Más verificaciones de distancia

### **Balanceo**
- **Evitar**: Combinaciones que rompan el juego
- **Monitorear**: Tiempo de supervivencia promedio
- **Ajustar**: Valores según feedback de jugadores

---

**🎮 ¡El sistema de habilidades está completo y listo para crear experiencias de juego únicas!**