export interface UserStatsData {
  // Estadísticas de combate
  enemies_defeated: number;
  zombies_killed: number;
  dashers_killed: number;
  tanks_killed: number;
  total_damage_dealt: number;
  total_damage_received: number;
  
  // Estadísticas de supervivencia
  level_reached: number;
  duration_seconds: number;
  survival_sessions: number;
  
  // Estadísticas de precisión
  shots_fired: number;
  shots_hit: number;
  accuracy_percentage: number;
  
  // Estadísticas de recursos
  supply_boxes_total: number;
  barrels_destroyed: number;
  bandages_used: number;
  
  // Puntuaciones
  final_score: number;
  best_score: number;
  total_score: number;
  
  // Progreso
  total_sessions: number;
  victories: number;
  defeats: number;
  win_rate: number;
}

export interface UserProgressData {
  // Experiencia y nivel
  current_level: number;
  total_experience: number;
  levels_gained: number;
  
  // Logros
  achievements_unlocked: number;
  total_achievements: number;
  
  // Misiones diarias
  daily_quests_completed: number;
  total_daily_quests: number;
  
  // Tiempo jugado
  total_playtime_minutes: number;
  sessions_today: number;
  streak_days: number;
}

export interface UserMaterialsData {
  steel: number;
  energy_cells: number;
  medicine: number;
  food: number;
  total_materials: number;
}

export interface UserWeaponsData {
  weapons_unlocked: number;
  total_weapons: number;
  favorite_weapon: string;
  weapons: Array<{
    id: string;
    name: string;
    damage: number;
    fire_rate: number;
    rarity: string;
    usage_count: number;
  }>;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface UserPersonalData {
  id: number;
  username: string;
  email: string;
  nombre: string | null;
  apellido: string | null;
  fechaNacimiento: string | null;
  genero: string | null;
  direccion: string | null;
  documentoID: string | null;
  rol: string | null;
  confirmed: boolean;
  createdAt: string;
}

export interface UserDashboardData {
  user: UserPersonalData;
  stats: UserStatsData;
  progress: UserProgressData;
  materials: UserMaterialsData;
  weapons: UserWeaponsData;
  recent_sessions: Array<{
    date: string;
    score: number;
    duration: number;
    result: 'victory' | 'defeat';
    enemies_killed: number;
  }>;
}

export interface StatCard {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
} 