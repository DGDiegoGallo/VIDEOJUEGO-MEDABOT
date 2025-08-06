export interface AdminDashboardData {
  users: AdminUserData[];
  gameSessions: AdminGameSessionData[];
  metrics: AdminMetricsData;
  totalUsers: number;
  totalSessions: number;
  activeUsers: number;
  analytics: GameAnalytics;
}

export interface AdminUserData {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  fechaNacimiento?: string | null;
  genero?: string | null;
  direccion?: string | null;
  documentoID?: string | null;
  nombre?: string | null;
  apellido?: string | null;
  rol?: string | null;
  // Calculated fields
  totalSessions: number;
  totalPlayTime: number;
  averageScore: number;
  totalEnemiesDefeated: number;
  totalMaterials: number;
  activityRating: number;
  level?: number;
  experience?: number;
}

export interface AdminGameSessionData {
  id: number;
  documentId: string;
  session_name: string;
  session_id?: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  userId?: string;
  status?: string;
  duration?: number;
  score?: number;
  experience?: number;
  users_permissions_user: {
    id: number;
    documentId: string;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    fechaNacimiento?: string | null;
    genero?: string | null;
    direccion?: string | null;
    documentoID?: string | null;
    nombre?: string | null;
    apellido?: string | null;
    rol?: string | null;
  };
  session_stats: {
    enemies_defeated: number;
    zombies_killed: number;
    dashers_killed: number;
    tanks_killed: number;
    total_damage_dealt: number;
    total_damage_received: number;
    shots_fired: number;
    shots_hit: number;
    accuracy_percentage: number;
    final_score: number;
    level_reached: number;
    duration_seconds: number;
    survival_time_total: number;
    supply_boxes_total: number;
    barrels_destroyed_total: number;
    bandages_used_total: number;
    levels_gained_total: number;
    games_played_total: number;
    victories_total: number;
    defeats_total: number;
    started_at: string;
    ended_at: string;
    game_state: string;
    last_game_score: number;
    last_game_level: number;
    last_game_survival_time: number;
  };
  materials: {
    steel: number;
    energy_cells: number;
    medicine: number;
    food: number;
  };
  guns: Array<{
    id: string;
    name: string;
    damage: number;
    fire_rate: number;
    ammo_capacity: number;
    type: string;
    rarity: string;
    is_default: boolean;
  }>;
  daily_quests_completed: {
    date: string;
    quests: Array<{
      id: string;
      title: string;
      description: string;
      type: string;
      target?: number;
      progress: number;
      reward: number;
      completed: boolean;
      completedAt: string;
    }>;
  };
  equipped_items: {
    nfts?: any[];
    weapons: string[];
    active_effects: any[];
    bandages: number;
  };
  user_nfts?: any[];
}

export interface AdminMetricsData {
  performance: PerformanceMetrics;
  userEngagement: UserEngagementMetrics;
  gameStats: GameStatsMetrics;
}

export interface PerformanceMetrics {
  name: string;
  value: number;
  page: string;
  device: 'desktop' | 'mobile';
  timestamp: string;
  report: {
    pageLoadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
    timeToInteractive: number;
  };
}

export interface UserEngagementMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  bounceRate: number;
  retentionRate: number;
}

export interface GameStatsMetrics {
  totalGamesPlayed: number;
  averageScore: number;
  completionRate: number;
  topPerformers: TopPerformer[];
  levelDistribution: LevelDistribution[];
}

export interface TopPerformer {
  userId: number;
  username: string;
  score: any;
  level: any;
  experience: any;
}

export interface LevelDistribution {
  level: number;
  userCount: number;
  percentage: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface GameAnalytics {
  totalMaterials: {
    steel: number;
    energy_cells: number;
    medicine: number;
    food: number;
  };
  combatStats: {
    totalEnemiesDefeated: number;
    zombiesKilled: number;
    dashersKilled: number;
    tanksKilled: number;
    totalShotsFired: number;
    totalShotsHit: number;
    averageAccuracy: number;
    totalDamageDealt: number;
    totalDamageReceived: number;
    barrelsDestroyed: number;
  };
  survivalStats: {
    totalSurvivalTime: number;
    averageSurvivalTime: number;
    totalSupplyBoxes: number;
    averageLevel: number;
    totalGamesPlayed: number;
    totalVictories: number;
    totalDefeats: number;
    winRate: number;
  };
  playerRankings: {
    userId: number;
    username: string;
    totalScore: number;
    averageScore: number;
    totalPlayTime: number;
    averageAccuracy: number;
    enemiesDefeated: number;
    dailyQuestsCompleted: number;
    activityScore: number;
    winRate: number;
    materialsCollected: number;
  }[];
  weaponStats: {
    weaponId: string;
    weaponName: string;
    usageCount: number;
    averageDamage: number;
    rarity: string;
  }[];

  questStats: {
    totalQuestsCompleted: number;
    questTypeDistribution: {
      [questType: string]: number;
    };
    averageQuestsPerPlayer: number;
  };
}

// Tipo para datos detallados de sesión de un jugador específico
export interface PlayerGameSessionDetail {
  id: number;
  documentId: string;
  sessionName: string;
  sessionId?: string | null;
  user: {
    id: number;
    username: string;
    email: string;
    createdAt: string;
  };
  sessionStats: {
    enemiesDefeated: number;
    zombiesKilled: number;
    dashersKilled: number;
    tanksKilled: number;
    totalDamageDealt: number;
    totalDamageReceived: number;
    shotsFired: number;
    shotsHit: number;
    accuracyPercentage: number;
    finalScore: number;
    levelReached: number;
    durationSeconds: number;
    survivalTimeTotal: number;
    supplyBoxesTotal: number;
    barrelsDestroyedTotal: number;
    bandagesUsedTotal: number;
    levelsGainedTotal: number;
    gamesPlayedTotal: number;
    victoriesTotal: number;
    defeatsTotal: number;
    startedAt: string;
    endedAt: string;
    gameState: string;
    lastGameScore: number;
    lastGameLevel: number;
    lastGameSurvivalTime: number;
  };
  materials: {
    steel: number;
    energyCells: number;
    medicine: number;
    food: number;
  };
  guns: Array<{
    id: string;
    name: string;
    damage: number;
    fire_rate: number;
    ammo_capacity: number;
    type: string;
    rarity: string;
    is_default: boolean;
  }>;
  dailyQuestsCompleted: {
    date: string;
    quests: Array<{
      id: string;
      title: string;
      description: string;
      type: string;
      target?: number;
      progress: number;
      reward: number;
      completed: boolean;
      completedAt: string;
    }>;
  };
  equippedItems: {
    nfts: any[];
    weapons: string[];
    activeEffects: any[];
    bandages: number;
  };
  userNfts: any[];
  createdAt: string;
  updatedAt: string;
}