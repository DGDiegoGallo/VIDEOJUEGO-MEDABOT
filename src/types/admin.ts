export interface AdminDashboardData {
  users: AdminUserData[];
  gameSessions: AdminGameSessionData[];
  metrics: AdminMetricsData;
  totalUsers: number;
  totalSessions: number;
  activeUsers: number;
}

export interface AdminUserData {
  id: string;
  documentId?: string;
  username: string;
  email: string;
  nombre?: string | null;
  apellido?: string | null;
  fechaNacimiento?: string | null;
  documentoID?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string | null;
  totalSessions: number;
  totalPlayTime: number;
  level: number;
  experience: number;
}

export interface AdminGameSessionData {
  id: string;
  documentId?: string;
  userId: string;
  username: string;
  startTime: string;
  endTime?: string | null;
  duration: number;
  score: number;
  level: number;
  experience: number;
  status: 'active' | 'completed' | 'abandoned';
  createdAt: string;
  updatedAt: string;
  // Game statistics
  gameStats: {
    enemies_defeated: number;
    total_damage_dealt: number;
    total_damage_received: number;
    shots_fired: number;
    shots_hit: number;
    accuracy_percentage: number;
    final_score: number;
    level_reached: number;
    duration_seconds: number;
    supply_boxes_total: number;
  };
  materials: {
    steel: number;
    energy_cells: number;
    medicine: number;
    food: number;
  };
  dailyQuestsCompleted: number;
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
  userId: string;
  username: string;
  score: number;
  level: number;
  experience: number;
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
    totalShotsFired: number;
    totalShotsHit: number;
    averageAccuracy: number;
    totalDamageDealt: number;
    totalDamageReceived: number;
  };
  survivalStats: {
    totalSurvivalTime: number;
    averageSurvivalTime: number;
    totalSupplyBoxes: number;
    averageLevel: number;
  };
  playerRankings: {
    userId: string;
    username: string;
    totalScore: number;
    totalPlayTime: number;
    averageAccuracy: number;
    enemiesDefeated: number;
    dailyQuestsCompleted: number;
    activityScore: number;
  }[];
}