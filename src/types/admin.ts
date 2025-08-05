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