# 🧟 SURVIVAL ZOMBIE - Videojuego Medabot

Un videojuego de supervivencia zombie estilo Vampire Survivors desarrollado con React, TypeScript, Phaser.js y Tailwind CSS.

## 🎮 **Características del Juego**

- **Disparo automático** hacia el enemigo más cercano
- **Sistema de supervivencia** con salud y puntuación
- **Enemigos zombies** que aparecen desde los bordes
- **Efectos visuales** con partículas y animaciones
- **Interfaz moderna** con instrucciones y estadísticas
- **Sistema de logros** y rangos
- **Responsive design** que se adapta a cualquier pantalla

## 📁 **Estructura del Proyecto**

### **📂 Directorio Principal**
```
VIDEOJUEGO-MEDABOT/
├── src/
│   ├── components/          # Componentes React
│   ├── pages/              # Páginas principales
│   ├── scenes/             # Escenas de Phaser
│   ├── stores/             # Estado global (Zustand)
│   ├── types/              # Tipos TypeScript
│   ├── config/             # Configuraciones
│   ├── services/           # Servicios API
│   ├── utils/              # Utilidades
│   └── styles/             # Estilos CSS
├── package.json
├── vite.config.ts
└── README.md
```

### **🎯 Archivos Principales**

#### **📄 Páginas (src/pages/)**
- **`LandingPage.tsx`** - Página principal con información del juego
- **`LoginPage.tsx`** - Sistema de autenticación
- **`GamePage.tsx`** - Contenedor principal del juego

#### **🎮 Componentes del Juego (src/components/)**
- **`GameUI.tsx`** - Interfaz de usuario del juego (HUD, menús)
- **`GameInstructions.tsx`** - Instrucciones del juego
- **`GameStats.tsx`** - Estadísticas y pantalla de game over
- **`Navbar.tsx`** - Navegación principal
- **`AnimatedBackground.tsx`** - Fondo animado
- **`LoginForm.tsx`** - Formulario de login

#### **⚡ Escenas de Phaser (src/scenes/)**
- **`MainScene.ts`** - Escena principal del gameplay
  - Sistema de movimiento del jugador
  - Spawn de enemigos
  - Disparo automático
  - Colisiones y física
  - Efectos visuales
  - UI del juego

#### **⚙️ Configuración (src/config/)**
- **`gameConfig.ts`** - Configuraciones del juego
  - Parámetros del jugador
  - Configuración de enemigos
  - Sistema de puntuación
  - Efectos visuales

#### **🏪 Estado Global (src/stores/)**
- **`authStore.ts`** - Estado de autenticación
- **`gameStore.ts`** - Datos del juego
- **`blockchainStore.ts`** - Integración blockchain

#### **📝 Tipos TypeScript (src/types/)**
- **`api.ts`** - Tipos para API
- **`game.ts`** - Tipos del juego
- **`user.ts`** - Tipos de usuario
- **`blockchain.ts`** - Tipos blockchain

## 🚀 **Cómo Ejecutar el Proyecto**

### **1. Instalación**
```bash
npm install
```

### **2. Ejecutar en Desarrollo**
```bash
npm run dev
```

### **3. URLs Disponibles**
```
http://localhost:3000/       ← Landing page
http://localhost:3000/game   ← Juego directo
http://localhost:3000/login  ← Login
http://localhost:3000/play   ← Juego con auth
```

## 🎮 **Lógica del Gameplay**

### **Sistema de Juego (MainScene.ts)**
```typescript
// Componentes principales
- player: Rectángulo verde (jugador)
- enemies: Array de rectángulos rojos (zombies)
- bullets: Array de rectángulos amarillos (balas)

// Mecánicas principales
- handlePlayerMovement(): Movimiento con flechas
- autoShoot(): Disparo automático cada 500ms
- spawnEnemy(): Spawn de enemigos cada 2s
- handleCollisions(): Colisiones jugador-enemigo y bala-enemigo
```

### **Flujo del Juego**
1. **Inicio:** Instrucciones → Click "Comenzar"
2. **Gameplay:** Movimiento + disparo automático
3. **Objetivo:** Sobrevivir y eliminar zombies
4. **Final:** Estadísticas + reinicio

### **Sistema de Puntuación**
- **+10 puntos** por zombie eliminado
- **-20 salud** por contacto con enemigo
- **Game Over** cuando salud llega a 0

## 🔧 **Tecnologías Utilizadas**

### **Frontend**
- **React 19** - Framework principal
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **React Router** - Navegación

### **Game Engine**
- **Phaser.js 3.70** - Motor del juego
- **Física Arcade** - Colisiones y movimiento

### **Estado y Datos**
- **Zustand** - Estado global
- **Axios** - Peticiones HTTP
- **Ethers.js** - Blockchain

### **Herramientas**
- **Vite** - Build tool
- **PostCSS** - Procesamiento CSS
- **Animate.css** - Animaciones

## 🎯 **Funcionalidades Implementadas**

### ✅ **Completadas**
- [x] Sistema de movimiento del jugador
- [x] Disparo automático
- [x] Spawn de enemigos
- [x] Sistema de colisiones
- [x] UI del juego (salud, puntuación, tiempo)
- [x] Efectos visuales
- [x] Pantalla de game over
- [x] Instrucciones del juego
- [x] Navegación con React Router
- [x] Landing page
- [x] Sistema de logros

### 🚧 **Pendientes (Para Futuro Desarrollo)**
- [ ] Sistema de power-ups
- [ ] Diferentes tipos de enemigos
- [ ] Múltiples armas
- [ ] Sistema de niveles
- [ ] Guardado de progreso
- [ ] Integración con backend
- [ ] Sistema de blockchain/NFTs
- [ ] Modo multijugador
- [ ] Sonidos y música
- [ ] Más efectos visuales

## 🔄 **Cómo Continuar el Desarrollo**

### **1. Para Agregar Nuevas Características**
```typescript
// En MainScene.ts
- Agregar nuevas propiedades privadas
- Implementar lógica en métodos existentes
- Crear nuevos métodos para funcionalidades
- Actualizar el sistema de colisiones
```

### **2. Para Modificar la UI**
```typescript
// En GameUI.tsx o crear nuevos componentes
- Agregar elementos visuales
- Conectar con estado del juego
- Implementar nuevas interacciones
```

### **3. Para Agregar Nuevas Escenas**
```typescript
// Crear nueva escena en src/scenes/
- Extender la clase Scene
- Implementar métodos create() y update()
- Agregar a la configuración en GamePage.tsx
```

### **4. Para Modificar Configuraciones**
```typescript
// En src/config/gameConfig.ts
- Ajustar parámetros del juego
- Agregar nuevas configuraciones
- Modificar valores de dificultad
```

## 🐛 **Solución de Problemas Comunes**

### **Error de Partículas Phaser**
```typescript
// ❌ Obsoleto
this.add.particles('particle').createEmitter()

// ✅ Solución actual
this.tweens.add({ targets: object, ... })
```

### **Error de TypeScript con scale.width**
```typescript
// ❌ Problemático
this.scale.width

// ✅ Solución
const gameWidth = this.scale.width || 800
```

### **Error de React Router**
```typescript
// ✅ Uso correcto
import { useNavigate } from 'react-router-dom'
const navigate = useNavigate()
navigate('/game')
```

## 📚 **Recursos Útiles**

### **Documentación**
- [Phaser.js Docs](https://photonstorm.github.io/phaser3-docs/)
- [React Router Docs](https://reactrouter.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)

### **Archivos Importantes para Modificar**
- **`src/scenes/MainScene.ts`** - Lógica principal del juego
- **`src/components/GameUI.tsx`** - Interfaz del juego
- **`src/config/gameConfig.ts`** - Configuraciones
- **`src/pages/GamePage.tsx`** - Contenedor del juego

## 🎯 **Próximos Pasos Sugeridos**

1. **Agregar power-ups** (velocidad, daño, etc.)
2. **Implementar diferentes tipos de enemigos**
3. **Crear sistema de niveles**
4. **Agregar sonidos y música**
5. **Integrar con backend para guardar progreso**
6. **Implementar sistema de blockchain/NFTs**

---

**🎮 ¡El juego está listo para jugar en `http://localhost:3000/game`!** 