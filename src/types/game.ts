

// ============================================================================
// INTERFACES PRINCIPALES DEL JUEGO
// ============================================================================

/**
 * Estadísticas del juego que se envían a la UI de React
 */
export interface GameStats {
  health: number;
  maxHealth: number;
  score: number;
  time: number;
  experience: number;
  maxExperience: number;
  level: number;
  skills: SkillLevels;
}

/**
 * Niveles de las habilidades del jugador
 */
export interface SkillLevels {
  rapidFire: number;      // Nivel de disparo rápido (0-10)
  magneticField: number;  // Nivel de campo magnético (0-8)
  multiShot: number;      // Nivel de disparo múltiple (0-6)
}

/**
 * Opción de habilidad disponible para el jugador
 */
export interface SkillOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  currentLevel: number;
  maxLevel: number;
  effect: string;
}

/**
 * Datos finales del juego para la pantalla de game over
 */
export interface GameOverData {
  score: number;
  time: number;
  level: number;
}

/**
 * Datos para el evento de subida de nivel
 */
export interface LevelUpData {
  level: number;
  skills: SkillOption[];
}

// ============================================================================
// INTERFACES DE POSICIÓN Y MOVIMIENTO
// ============================================================================

/**
 * Posición 2D en el juego
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Velocidad 2D en el juego
 */
export interface Velocity {
  x: number;
  y: number;
}

// ============================================================================
// INTERFACES DE CONFIGURACIÓN
// ============================================================================

/**
 * Configuración del jugador
 */
export interface PlayerConfig {
  size: number;
  speed: number;
  health: number;
  maxHealth: number;
  color: number;
  strokeColor: number;
}

/**
 * Configuración de enemigos
 */
export interface EnemyConfig {
  size: number;
  spawnInterval: number;
  color: number;
  strokeColor: number;
  damage: number;
  speed: number;
  speedVariation: number;
  // Configuración de escalado de dificultad
  difficultyScaling?: {
    enabled: boolean;
    baseSpawnInterval: number;
    minSpawnInterval: number;
    spawnIntervalReduction: number; // Reducción por minuto
    dasherSpawnChance: number; // Probabilidad de spawn del dasher (0-1)
    dasherUnlockTime: number; // Tiempo en segundos para desbloquear el dasher
  };
}

/**
 * Configuración de balas
 */
export interface BulletConfig {
  size: number;
  speed: number;
  color: number;
  strokeColor: number;
  lifetime: number;
  damage?: number;
  bulletsPerShot?: number;
  fireRate?: number;
}

/**
 * Configuración de diamantes de experiencia
 */
export interface ExperienceConfig {
  size: number;
  color: number;
  strokeColor: number;
  magneticRange: number;
  lifetime: number;
  rotationSpeed: number;
  experienceMultiplier?: number;
}

// ============================================================================
// INTERFACES DE EVENTOS
// ============================================================================

/**
 * Evento de colisión entre jugador y enemigo
 */
export interface PlayerEnemyCollisionEvent {
  player: Phaser.GameObjects.Rectangle;
  enemy: Phaser.GameObjects.Rectangle;
  damage: number;
}

/**
 * Evento de colisión entre bala y enemigo
 */
export interface BulletEnemyCollisionEvent {
  bullet: Phaser.GameObjects.Rectangle;
  enemy: Phaser.GameObjects.Rectangle;
  score: number;
}

/**
 * Evento de recolección de experiencia
 */
export interface ExperienceCollectionEvent {
  diamond: Phaser.GameObjects.Polygon;
  experience: number;
  leveledUp: boolean;
}

// ============================================================================
// TIPOS DE ENUMERACIÓN
// ============================================================================

/**
 * Tipos de enemigos disponibles
 */
export enum EnemyType {
  ZOMBIE = 'zombie',
  FAST_ZOMBIE = 'fast_zombie',
  TANK_ZOMBIE = 'tank_zombie',
  DASHER = 'dasher',  // Nuevo enemigo con dash
  TANK = 'tank'       // Enemigo tanque con escudo
}

/**
 * Tipos de efectos visuales
 */
export enum EffectType {
  EXPLOSION = 'explosion',
  COLLECTION = 'collection',
  LEVEL_UP = 'level_up',
  DAMAGE = 'damage',
  BULLET_TRAIL = 'bullet_trail'
}

/**
 * Estados del juego
 */
export enum GameState {
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game_over',
  LEVELING_UP = 'leveling_up'
}

// ============================================================================
// INTERFACES PARA EL SISTEMA DE LOGROS Y MISIONES
// ============================================================================

/**
 * Desafío o reto del juego
 */
export interface Challenge {
  id: string;
  name: string;
  description: string;
  objectives: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  requirements: string[];
  rewards: Reward[];
  estimatedTime: number;
  isActive: boolean;
}

/**
 * Misión del juego
 */
export interface Mission {
  id: string;
  name: string;
  description: string;
  objectives: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  requirements: string[];
  duration: number;
  rewards: Reward[];
  type: 'story' | 'side' | 'daily' | 'weekly';
  status: 'available' | 'in_progress' | 'completed' | 'locked';
}

/**
 * Recompensa del juego
 */
export interface Reward {
  type: 'experience' | 'achievement' | 'nft' | 'item';
  value: number | string;
  data?: any;
}

/**
 * Sesión de juego
 */
export interface GameSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  activitiesCompleted: string[];
  experienceGained: number;
  achievementsUnlocked: string[];
}

/**
 * Métricas de rendimiento del jugador
 */
export interface PerformanceMetrics {
  accuracy: number;
  speed: number;
  consistency: number;
  improvement: number;
  focusTime: number;
}