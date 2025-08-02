export const GAME_CONFIG = {
  // Configuración del jugador
  PLAYER: {
    SIZE: 32,
    SPEED: 200,
    HEALTH: 100,
    COLOR: 0x00ff00,
    STROKE_COLOR: 0xffffff
  },

  // Configuración de enemigos
  ENEMY: {
    SIZE: 24,
    SPEED: {
      MIN: 100,
      MAX: 150
    },
    SPAWN_INTERVAL: 2000,
    COLOR: 0xff0000,
    STROKE_COLOR: 0x8b0000,
    DAMAGE: 20
  },

  // Configuración de balas
  BULLET: {
    SIZE: 8,
    SPEED: 400,
    LIFESPAN: 2000,
    COLOR: 0xffff00,
    STROKE_COLOR: 0xffffff
  },

  // Configuración de disparo
  SHOOTING: {
    INTERVAL: 500,
    AUTO_AIM: true
  },

  // Configuración de puntuación
  SCORING: {
    ENEMY_KILL: 10,
    BONUS_MULTIPLIER: 1.5
  },

  // Configuración de experiencia
  EXPERIENCE: {
    PER_ENEMY: 1,
    LEVEL_BASE: 100,
    LEVEL_MULTIPLIER: 1.5,
    DIAMOND_SIZE: 12,
    DIAMOND_COLOR: 0x00ffff,
    DIAMOND_GLOW: 0xffffff,
    COLLECTION_DISTANCE: 60,
    MAGNETIC_RANGE: 60
  },

  // Configuración de habilidades
  SKILLS: {
    RAPID_FIRE: {
      ID: 'rapidFire',
      NAME: 'Disparo Rápido',
      DESCRIPTION: 'Reduce el tiempo entre disparos',
      BASE_REDUCTION: 50, // ms reducidos por nivel
      MAX_LEVEL: 10,
      ICON: '⚡'
    },
    MAGNETIC_FIELD: {
      ID: 'magneticField',
      NAME: 'Campo Magnético',
      DESCRIPTION: 'Aumenta el rango de atracción de la experiencia',
      BASE_RANGE: 30, // píxeles adicionales por nivel
      MAX_LEVEL: 8,
      ICON: '🧲'
    },
    MULTI_SHOT: {
      ID: 'multiShot',
      NAME: 'Disparo Múltiple',
      DESCRIPTION: 'Dispara múltiples balas simultáneamente',
      BASE_BULLETS: 1, // balas adicionales por nivel
      MAX_LEVEL: 6,
      ICON: '🔫'
    }
  },

  // Configuración de UI
  UI: {
    HEALTH_BAR_WIDTH: 200,
    HEALTH_BAR_HEIGHT: 8,
    TEXT_COLORS: {
      HEALTH: '#00ff00',
      SCORE: '#ffff00',
      TIME: '#ffffff',
      GAME_OVER: '#ff0000'
    }
  },

  // Configuración de efectos visuales
  EFFECTS: {
    DAMAGE_FLASH_DURATION: 100,
    EXPLOSION_PARTICLES: 15,
    BULLET_TRAIL_ALPHA: 0.7
  },

  // Configuración del mundo procedural
  WORLD: {
    CHUNK_SIZE: 800,
    RENDER_DISTANCE: 3,
    RIVER_WIDTH: 60,
    BRIDGE_WIDTH: 100,
    STRUCTURE_DENSITY: 0.4,
    TERRAIN_COLORS: {
      BASE: 0x2d5016,
      VARIATION_RANGE: 40
    },
    RIVER_COLOR: 0x4a90e2,
    BRIDGE_COLOR: 0x8b4513,
    STRUCTURE_COLORS: {
      CUBE: 0x7f8c8d,
      TOWER: 0x95a5a6,
      WALL: 0x8e44ad,
      PLATFORM: 0xf39c12
    }
  },

  // Configuración de colores del juego
  COLORS: {
    BACKGROUND: '#1a1a2e',
    PLAYER: '#00ff00',
    ENEMY: '#ff0000',
    BULLET: '#ffff00',
    UI_BACKGROUND: 'rgba(0, 0, 0, 0.5)'
  }
};

export const GAME_STATES = {
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameOver',
  MENU: 'menu'
} as const;

export type GameState = typeof GAME_STATES[keyof typeof GAME_STATES];

// Performance optimization settings
export const PERFORMANCE_CONFIG = {
  UI_UPDATE_INTERVAL: 50, // Update UI every 50ms for better real-time feedback
  DIAMOND_LIFETIME: 30000, // 30 seconds
  ENEMY_SPAWN_INTERVAL: 2000, // 2 seconds
  BULLET_LIFETIME: 5000, // 5 seconds
  EFFECT_DURATION: 1000, // 1 second for visual effects
  COLLISION_CHECK_INTERVAL: 16, // Check collisions every 16ms (60 FPS)
  MAX_GAME_TIME: 480, // 8 minutes in seconds (8 * 60)
};

// Game viewport configuration (16:9 aspect ratio)
export const VIEWPORT_CONFIG = {
  BASE_WIDTH: 1280,
  BASE_HEIGHT: 720,
  ASPECT_RATIO: 16 / 9,
  MIN_WIDTH: 640,
  MIN_HEIGHT: 360,
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1080,
};

// UI update thresholds to prevent unnecessary re-renders
export const UI_UPDATE_THRESHOLDS = {
  HEALTH_CHANGE: 1, // Update health bar only if change >= 1
  SCORE_CHANGE: 10, // Update score only if change >= 10
  EXPERIENCE_CHANGE: 1, // Update experience only if change >= 1
  TIME_CHANGE: 1, // Update time only if change >= 1 second
}; 