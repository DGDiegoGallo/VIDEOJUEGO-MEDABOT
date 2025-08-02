export interface GameSession {
  id: number;
  documentId: string;
  session_name: string;
  session_id?: string;
  game_mode?: string;
  difficulty_level?: string;
  game_state?: string;
  started_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  final_score?: number;
  level_reached?: number;
  session_stats: {
    enemies_defeated: number;
    total_damage_dealt: number;
    total_damage_received: number;
    shots_fired: number;
    shots_hit: number;
    accuracy_percentage: number;
    resources_collected?: {
      minerals: number;
      energy_orbs: number;
      power_ups: number;
    };
    // Campos adicionales que pueden estar en session_stats
    final_score?: number;
    level_reached?: number;
    duration_seconds?: number;
    started_at?: string;
    ended_at?: string;
    game_state?: string;
  };
  materials: {
    iron: number;
    steel: number;
    energy_crystals: number;
  };
  guns: Array<{
    id: string;
    name: string;
    damage: number;
    fire_rate: number;
    ammo_capacity: number;
  }>;
  daily_quests_completed: {
    date: string;
    quests: Array<{
      id: string;
      name: string;
      completed: boolean;
      progress: number;
      target: number;
    }>;
  };
  equipped_items: {
    nfts: any[];
    weapons: string[];
    active_effects: any[];
  };
  // Relación con NFTs de Strapi
  user_nfts?: any[];
  // Relación con usuario de Strapi
  users_permissions_user?: any;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface TotalStats {
  totalPlayTime: number;
  totalEnemiesDefeated: number;
  bestScore: number;
  totalSessions: number;
}