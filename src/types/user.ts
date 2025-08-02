import type { NFTData } from '@/types/blockchain';

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserGameData {
  id: string;
  userId: string;
  level: number;
  experience: number;
  skills: Skill[];
  achievements: Achievement[];
  statistics: GameStatistics;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  rating: number;
  category: string;
  progress: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  nftData?: NFTData;
  unlockedAt: string;
}

export interface GameStatistics {
  totalPlayTime: number;
  challengesCompleted: number;
  missionsCompleted: number;
  favoriteActivities: string[];
  lastPlayedAt: string;
}

export interface UserPreferences {
  difficulty: 'easy' | 'medium' | 'hard';
  categories: string[];
  notifications: boolean;
  theme: 'light' | 'dark';
}