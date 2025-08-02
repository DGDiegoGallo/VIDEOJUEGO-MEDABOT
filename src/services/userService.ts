import { apiClient } from '@/utils/api';
import type { User, UserGameData } from '@/types/user';
import type { StrapiEntity } from '@/types/api';

export class UserService {
  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const response = await apiClient.get<StrapiEntity<any>[]>('/users', {
        filters: {
          email: { $eq: email }
        }
      });

      if (response.data.length === 0) {
        return null;
      }

      const userData = response.data[0];
      return {
        id: userData.id.toString(),
        username: userData.attributes.username,
        email: userData.attributes.email,
        createdAt: userData.attributes.createdAt,
        updatedAt: userData.attributes.updatedAt,
      };
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  // Get or create user game data
  static async getUserGameData(userId: string): Promise<UserGameData | null> {
    try {
      // First try to get existing game data
      const response = await apiClient.get<StrapiEntity<any>[]>('/user-game-datas', {
        filters: {
          userId: { $eq: userId }
        },
        populate: ['skills', 'achievements']
      });

      if (response.data.length > 0) {
        const gameData = response.data[0];
        return this.mapStrapiToUserGameData(gameData);
      }

      // If no game data exists, create default data
      return this.createDefaultUserGameData(userId);
    } catch (error) {
      console.error('Error fetching user game data:', error);
      return null;
    }
  }

  // Create default user game data
  static async createDefaultUserGameData(userId: string): Promise<UserGameData> {
    const defaultData: Omit<UserGameData, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      level: 1,
      experience: 0,
      skills: [
        {
          id: '1',
          name: 'Concentración',
          rating: 50,
          category: 'cognitive',
          progress: 0
        },
        {
          id: '2',
          name: 'Memoria',
          rating: 30,
          category: 'cognitive',
          progress: 0
        },
        {
          id: '3',
          name: 'Coordinación',
          rating: 40,
          category: 'motor',
          progress: 0
        }
      ],
      achievements: [],
      statistics: {
        totalPlayTime: 0,
        challengesCompleted: 0,
        missionsCompleted: 0,
        favoriteActivities: [],
        lastPlayedAt: new Date().toISOString()
      },
      preferences: {
        difficulty: 'medium',
        categories: ['cognitive', 'motor'],
        notifications: true,
        theme: 'light'
      }
    };

    // Save to localStorage first
    const gameDataWithId = {
      ...defaultData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(`game-data-${userId}`, JSON.stringify(gameDataWithId));

    // TODO: Save to Strapi in background
    this.saveGameDataToStrapi(gameDataWithId);

    return gameDataWithId;
  }

  // Save game data to Strapi (background operation)
  static async saveGameDataToStrapi(gameData: UserGameData): Promise<void> {
    try {
      await apiClient.create('/user-game-datas', {
        userId: gameData.userId,
        level: gameData.level,
        experience: gameData.experience,
        skills: gameData.skills,
        achievements: gameData.achievements,
        statistics: gameData.statistics,
        preferences: gameData.preferences
      });
    } catch (error) {
      console.error('Error saving game data to Strapi:', error);
      // Keep in localStorage for retry later
    }
  }

  // Update game data (localStorage first, then Strapi)
  static async updateGameData(gameData: UserGameData): Promise<void> {
    // Update localStorage immediately
    localStorage.setItem(`game-data-${gameData.userId}`, JSON.stringify({
      ...gameData,
      updatedAt: new Date().toISOString()
    }));

    // Update Strapi in background
    try {
      await apiClient.update('/user-game-datas', gameData.id, {
        level: gameData.level,
        experience: gameData.experience,
        skills: gameData.skills,
        achievements: gameData.achievements,
        statistics: gameData.statistics,
        preferences: gameData.preferences
      });
    } catch (error) {
      console.error('Error updating game data in Strapi:', error);
    }
  }

  // Load game data from localStorage
  static loadGameDataFromStorage(userId: string): UserGameData | null {
    try {
      const stored = localStorage.getItem(`game-data-${userId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading game data from storage:', error);
      return null;
    }
  }

  // Map Strapi response to UserGameData
  private static mapStrapiToUserGameData(strapiData: StrapiEntity<any>): UserGameData {
    return {
      id: strapiData.id.toString(),
      userId: strapiData.attributes.userId,
      level: strapiData.attributes.level || 1,
      experience: strapiData.attributes.experience || 0,
      skills: strapiData.attributes.skills || [],
      achievements: strapiData.attributes.achievements || [],
      statistics: strapiData.attributes.statistics || {
        totalPlayTime: 0,
        challengesCompleted: 0,
        missionsCompleted: 0,
        favoriteActivities: [],
        lastPlayedAt: new Date().toISOString()
      },
      preferences: strapiData.attributes.preferences || {
        difficulty: 'medium',
        categories: ['cognitive', 'motor'],
        notifications: true,
        theme: 'light'
      },
      createdAt: strapiData.attributes.createdAt,
      updatedAt: strapiData.attributes.updatedAt,
    };
  }
}