import type { RegistrationAchievementNFT } from '@/types/api';

/**
 * Creates initial game session data for a new user
 * This session is created with empty stats and the user's first NFT (not equipped)
 */
export function createInitialGameSessionData(
  username: string,
  nftId: number
): any {
  console.log('🎮 Creating initial game session data for:', username);
  console.log('🎨 NFT ID to relate:', nftId);

  const initialSessionData = {
    session_name: `Sesión Inicial - ${username}`,
    session_stats: {
      enemies_defeated: 0,
      total_damage_dealt: 0,
      total_damage_received: 0,
      shots_fired: 0,
      shots_hit: 0,
      accuracy_percentage: 0,
      final_score: 0,
      level_reached: 0,
      duration_seconds: 0,
      started_at: null,
      ended_at: null,
      game_state: 'not_started',
      supply_boxes_total: 0
    },
    materials: {
      steel: 0,
      energy_cells: 0,
      medicine: 0,
      food: 0
    },
    guns: [
      {
        id: "pistol_default",
        name: "Pistola Básica",
        damage: 25,
        fire_rate: 1.0,
        ammo_capacity: 12,
        type: "pistol",
        rarity: "common",
        is_default: true
      }
    ],
    daily_quests_completed: {
      date: new Date().toISOString().split('T')[0],
      quests: []
    },
    equipped_items: {
      nfts: [], // NFT no equipado inicialmente
      weapons: ["pistol_default"], // Pistola equipada por defecto
      active_effects: [],
      bandages: 1 // El usuario empieza con 1 vendaje
    },
    // Relación con el NFT creado (pero no equipado)
    user_nfts: [nftId]
  };

  console.log('📊 Initial session data created:', initialSessionData);
  return initialSessionData;
}

/**
 * Creates a complete initial game session for a new user
 * This includes creating the session and relating it to the user and their first NFT
 */
export async function createInitialGameSession(
  userId: number,
  username: string,
  nftId: number
): Promise<any> {
  try {
    console.log('🎮 Creating initial game session for new user');
    console.log('👤 User ID:', userId);
    console.log('👤 Username:', username);
    console.log('🎨 NFT ID:', nftId);

    // Import API client dynamically to avoid circular dependency
    const { apiClient } = await import('@/utils/api');
    
    // Create initial session data
    const initialSessionData = createInitialGameSessionData(username, nftId);
    
    // Create the game session
    const sessionResponse = await apiClient.create('/game-sessions', {
      users_permissions_user: userId,
      ...initialSessionData
    });
    
    console.log('✅ Initial game session created successfully');
    console.log('🎮 Session ID:', sessionResponse.data?.id);
    
    return sessionResponse;
    
  } catch (error) {
    console.error('❌ Error creating initial game session:', error);
    console.error('❌ Failed for user ID:', userId);
    console.error('❌ Failed for NFT ID:', nftId);
    throw error;
  }
} 