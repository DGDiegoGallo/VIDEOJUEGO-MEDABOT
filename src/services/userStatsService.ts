import { API_CONFIG } from '@/config/api';
import { UserDashboardData, UserStatsData, UserProgressData, UserMaterialsData, UserWeaponsData, StatCard, UserPersonalData } from '@/types/userStats';

interface GameSession {
  id: number;
  documentId: string;
  session_name: string;
  session_id: string | null;
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
    is_default?: boolean;
  }>;
  daily_quests_completed: {
    date: string;
    quests: Array<{
      id: string;
      title: string;
      description: string;
      type: string;
      target: number;
      progress: number;
      reward: number;
      completed: boolean;
      completedAt?: string;
    }>;
  };
  equipped_items: {
    nfts: any[];
    weapons: string[];
    active_effects: any[];
    bandages: number;
  };
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
    fechaNacimiento: string | null;
    genero: string | null;
    direccion: string | null;
    documentoID: string | null;
    nombre: string | null;
    apellido: string | null;
    rol: string | null;
  };
  user_nfts: any[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

class UserStatsService {
  private readonly baseURL = `${API_CONFIG.STRAPI_URL}/api`;

  private getAuthHeaders() {
    const token = localStorage.getItem('auth-token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Obtiene todas las sesiones de un usuario
   */
  async getUserSessions(userId: number): Promise<GameSession[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/game-sessions?filters[users_permissions_user]=${userId}&populate=*&sort=createdAt:desc`,
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }
  }

  /**
   * Procesa las estadísticas del usuario desde las sesiones
   */
  processUserStats(sessions: GameSession[]): UserStatsData {
    if (sessions.length === 0) {
      return {
        enemies_defeated: 0,
        zombies_killed: 0,
        dashers_killed: 0,
        tanks_killed: 0,
        total_damage_dealt: 0,
        total_damage_received: 0,
        level_reached: 1,
        duration_seconds: 0,
        survival_sessions: 0,
        shots_fired: 0,
        shots_hit: 0,
        accuracy_percentage: 0,
        supply_boxes_total: 0,
        barrels_destroyed: 0,
        bandages_used: 0,
        final_score: 0,
        best_score: 0,
        total_score: 0,
        total_sessions: 0,
        victories: 0,
        defeats: 0,
        win_rate: 0
      };
    }

    const stats = sessions.reduce((acc, session) => {
      const s = session.session_stats;
      
      return {
        enemies_defeated: acc.enemies_defeated + (s.enemies_defeated || 0),
        zombies_killed: acc.zombies_killed + (s.zombies_killed || 0),
        dashers_killed: acc.dashers_killed + (s.dashers_killed || 0),
        tanks_killed: acc.tanks_killed + (s.tanks_killed || 0),
        total_damage_dealt: acc.total_damage_dealt + (s.total_damage_dealt || 0),
        total_damage_received: acc.total_damage_received + (s.total_damage_received || 0),
        level_reached: Math.max(acc.level_reached, s.level_reached || 1),
        duration_seconds: acc.duration_seconds + (s.duration_seconds || 0),
        survival_sessions: acc.survival_sessions + (s.duration_seconds > 60 ? 1 : 0),
        shots_fired: acc.shots_fired + (s.shots_fired || 0),
        shots_hit: acc.shots_hit + (s.shots_hit || 0),
        supply_boxes_total: acc.supply_boxes_total + (s.supply_boxes_total || 0),
        barrels_destroyed: acc.barrels_destroyed + (s.barrels_destroyed_total || 0),
        bandages_used: acc.bandages_used + (s.bandages_used_total || 0),
        total_score: acc.total_score + (s.final_score || 0),
        best_score: Math.max(acc.best_score, s.final_score || 0),
        victories: acc.victories + (s.victories_total || 0),
        defeats: acc.defeats + (s.defeats_total || 0)
      };
    }, {
      enemies_defeated: 0, zombies_killed: 0, dashers_killed: 0, tanks_killed: 0,
      total_damage_dealt: 0, total_damage_received: 0, level_reached: 1,
      duration_seconds: 0, survival_sessions: 0, shots_fired: 0, shots_hit: 0,
      supply_boxes_total: 0, barrels_destroyed: 0, bandages_used: 0,
      total_score: 0, best_score: 0, victories: 0, defeats: 0
    });

    const totalSessions = sessions.reduce((acc, session) => 
      acc + (session.session_stats.games_played_total || 1), 0
    );
    const accuracy = stats.shots_fired > 0 ? (stats.shots_hit / stats.shots_fired) * 100 : 0;
    const winRate = totalSessions > 0 ? (stats.victories / totalSessions) * 100 : 0;

    return {
      ...stats,
      total_sessions: totalSessions,
      final_score: stats.best_score,
      accuracy_percentage: Math.round(accuracy * 100) / 100,
      win_rate: Math.round(winRate * 100) / 100
    };
  }

  /**
   * Procesa los datos de progreso del usuario
   */
  processUserProgress(sessions: GameSession[]): UserProgressData {
    if (sessions.length === 0) {
      return {
        current_level: 1,
        total_experience: 0,
        levels_gained: 0,
        achievements_unlocked: 0,
        total_achievements: 50, // Total estimado
        daily_quests_completed: 0,
        total_daily_quests: 0,
        total_playtime_minutes: 0,
        sessions_today: 0,
        streak_days: 1
      };
    }

    const totalPlaytime = sessions.reduce((acc, session) => 
      acc + (session.session_stats.survival_time_total || session.session_stats.duration_seconds || 0), 0
    ) / 60; // Convertir a minutos

    const questsCompleted = sessions.reduce((acc, session) => {
      if (session.daily_quests_completed?.quests) {
        return acc + session.daily_quests_completed.quests.filter(q => q.completed).length;
      }
      return acc;
    }, 0);

    const totalQuests = sessions.reduce((acc, session) => {
      if (session.daily_quests_completed?.quests) {
        return acc + session.daily_quests_completed.quests.length;
      }
      return acc;
    }, 0);

    const maxLevel = sessions.reduce((acc, session) => 
      Math.max(acc, session.session_stats.level_reached || 1), 1
    );

    const totalLevelsGained = sessions.reduce((acc, session) => 
      acc + (session.session_stats.levels_gained_total || 0), 0
    );

    // Calcular sesiones de hoy
    const today = new Date().toDateString();
    const sessionsToday = sessions.filter(session => 
      new Date(session.createdAt).toDateString() === today
    ).length;

    return {
      current_level: maxLevel,
      total_experience: totalLevelsGained * 100, // Aproximación
      levels_gained: totalLevelsGained,
      achievements_unlocked: Math.min(Math.floor(sessions.length / 2), 45), // Estimación
      total_achievements: 50,
      daily_quests_completed: questsCompleted,
      total_daily_quests: totalQuests,
      total_playtime_minutes: Math.round(totalPlaytime),
      sessions_today: sessionsToday,
      streak_days: this.calculateStreakDays(sessions)
    };
  }

  /**
   * Procesa los materiales del usuario
   */
  processUserMaterials(sessions: GameSession[]): UserMaterialsData {
    if (sessions.length === 0) {
      return {
        steel: 0,
        energy_cells: 0,
        medicine: 0,
        food: 0,
        total_materials: 0
      };
    }

    // Obtener materiales de la sesión más reciente
    const latestSession = sessions[0];
    const materials = latestSession?.materials || { steel: 0, energy_cells: 0, medicine: 0, food: 0 };
    
    const total = materials.steel + materials.energy_cells + materials.medicine + materials.food;

    return {
      ...materials,
      total_materials: total
    };
  }

  /**
   * Procesa las armas del usuario
   */
  processUserWeapons(sessions: GameSession[]): UserWeaponsData {
    if (sessions.length === 0) {
      return {
        weapons_unlocked: 1,
        total_weapons: 10, // Total estimado
        favorite_weapon: 'Pistola Básica',
        weapons: []
      };
    }

    // Obtener todas las armas únicas
    const allWeapons = new Map();
    sessions.forEach(session => {
      session.guns?.forEach(gun => {
        if (allWeapons.has(gun.id)) {
          allWeapons.get(gun.id).usage_count++;
        } else {
          allWeapons.set(gun.id, {
            ...gun,
            usage_count: 1
          });
        }
      });
    });

    const weapons = Array.from(allWeapons.values())
      .sort((a, b) => b.usage_count - a.usage_count);

    const favoriteWeapon = weapons.length > 0 ? weapons[0].name : 'Pistola Básica';

    return {
      weapons_unlocked: allWeapons.size,
      total_weapons: 10,
      favorite_weapon: favoriteWeapon,
      weapons: weapons
    };
  }

  /**
   * Procesa los datos personales del usuario
   */
  processUserPersonalData(session: GameSession): UserPersonalData {
    const user = session.users_permissions_user;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      fechaNacimiento: user.fechaNacimiento,
      genero: user.genero,
      direccion: user.direccion,
      documentoID: user.documentoID,
      rol: user.rol,
      confirmed: user.confirmed,
      createdAt: user.createdAt
    };
  }

  /**
   * Calcula la racha de días jugando
   */
  private calculateStreakDays(sessions: GameSession[]): number {
    if (sessions.length === 0) return 0;

    const dates = [...new Set(sessions.map(session => 
      new Date(session.createdAt).toDateString()
    ))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 1;
    const today = new Date().toDateString();
    
    // Si no jugó hoy, la racha se rompió
    if (dates[0] !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (dates[0] !== yesterday.toDateString()) {
        return 0;
      }
      streak = 0;
    }

    // Contar días consecutivos
    for (let i = 1; i < dates.length; i++) {
      const currentDate = new Date(dates[i]);
      const previousDate = new Date(dates[i - 1]);
      const diffTime = previousDate.getTime() - currentDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Obtiene todos los datos del dashboard del usuario
   */
  async getUserDashboardData(userId: number): Promise<UserDashboardData> {
    try {
      console.log('📊 Obteniendo datos del dashboard para usuario:', userId);
      
      const sessions = await this.getUserSessions(userId);
      console.log('📊 Sesiones encontradas:', sessions.length);

      if (sessions.length === 0) {
        throw new Error('No se encontraron sesiones de juego para este usuario');
      }

      const user = this.processUserPersonalData(sessions[0]); // Obtener datos del usuario de la primera sesión
      const stats = this.processUserStats(sessions);
      const progress = this.processUserProgress(sessions);
      const materials = this.processUserMaterials(sessions);
      const weapons = this.processUserWeapons(sessions);

      // Sesiones recientes (últimas 10)
      const recentSessions = sessions.slice(0, 10).map(session => ({
        date: new Date(session.createdAt).toLocaleDateString(),
        score: session.session_stats.final_score || 0,
        duration: session.session_stats.duration_seconds || 0,
        result: (session.session_stats.game_state === 'victory' ? 'victory' : 'defeat') as 'victory' | 'defeat',
        enemies_killed: session.session_stats.enemies_defeated || 0
      }));

      console.log('📊 Datos procesados exitosamente');

      return {
        user,
        stats,
        progress,
        materials,
        weapons,
        recent_sessions: recentSessions
      };
    } catch (error) {
      console.error('Error obteniendo datos del dashboard:', error);
      
      // En caso de error, crear un usuario básico con datos mínimos
      const fallbackUser: UserPersonalData = {
        id: userId,
        username: 'Usuario',
        email: 'usuario@ejemplo.com',
        nombre: null,
        apellido: null,
        fechaNacimiento: null,
        genero: null,
        direccion: null,
        documentoID: null,
        rol: null,
        confirmed: true,
        createdAt: new Date().toISOString()
      };

      // Retornar datos por defecto en caso de error
      return {
        user: fallbackUser,
        stats: this.processUserStats([]),
        progress: this.processUserProgress([]),
        materials: this.processUserMaterials([]),
        weapons: this.processUserWeapons([]),
        recent_sessions: []
      };
    }
  }

  /**
   * Genera tarjetas de estadísticas para mostrar
   */
  generateStatCards(data: UserDashboardData): StatCard[] {
    return [
      {
        title: 'Enemigos Derrotados',
        value: data.stats.enemies_defeated.toLocaleString(),
        subtitle: `${data.stats.zombies_killed} zombies, ${data.stats.tanks_killed} tanques`,
        icon: 'FaCrosshairs',
        color: 'from-red-500 to-red-600',
        trend: {
          value: data.recent_sessions.length > 0 ? 
            data.recent_sessions[0].enemies_killed : 0,
          isPositive: true
        }
      },
      {
        title: 'Precisión',
        value: `${data.stats.accuracy_percentage}%`,
        subtitle: `${data.stats.shots_hit}/${data.stats.shots_fired} disparos`,
        icon: 'FaBullseye',
        color: 'from-yellow-500 to-orange-500',
        trend: {
          value: data.stats.accuracy_percentage,
          isPositive: data.stats.accuracy_percentage > 50
        }
      },
      {
        title: 'Victorias',
        value: data.stats.victories,
        subtitle: `${data.stats.win_rate}% de victorias`,
        icon: 'FaTrophy',
        color: 'from-green-500 to-green-600',
        trend: {
          value: data.stats.win_rate,
          isPositive: data.stats.win_rate > 50
        }
      },
      {
        title: 'Tiempo Jugado',
        value: `${Math.floor(data.progress.total_playtime_minutes / 60)}h ${data.progress.total_playtime_minutes % 60}m`,
        subtitle: `${data.stats.total_sessions} sesiones`,
        icon: 'FaClock',
        color: 'from-blue-500 to-blue-600',
        trend: {
          value: data.progress.sessions_today,
          isPositive: data.progress.sessions_today > 0
        }
      }
    ];
  }
}

export const userStatsService = new UserStatsService(); 