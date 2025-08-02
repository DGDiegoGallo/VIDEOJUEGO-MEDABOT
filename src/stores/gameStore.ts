import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { UserGameData, Achievement } from '@/types/user';
import type { Challenge, Mission, GameSession, PerformanceMetrics } from '@/types/game';

interface GameState {
  userGameData: UserGameData | null;
  currentSession: GameSession | null;
  availableChallenges: Challenge[];
  availableMissions: Mission[];
  activeMission: Mission | null;
  activeChallenge: Challenge | null;
  isLoading: boolean;
  error: string | null;
}

interface GameActions {
  loadUserGameData: (userId: string) => Promise<void>;
  updateSkill: (skillId: string, newRating: number) => void;
  unlockAchievement: (achievement: Achievement) => void;
  startChallenge: (challengeId: string) => void;
  completeChallenge: (challengeId: string, performance: PerformanceMetrics) => void;
  startMission: (missionId: string) => void;
  completeMission: (missionId: string, performance: PerformanceMetrics) => void;
  startGameSession: () => void;
  endGameSession: () => void;
  clearError: () => void;
}

export const useGameStore = create<GameState & GameActions>()(
  persist(
    immer((set) => ({
      // State
      userGameData: null,
      currentSession: null,
      availableChallenges: [],
      availableMissions: [],
      activeMission: null,
      activeChallenge: null,
      isLoading: false,
      error: null,

      // Actions
      loadUserGameData: async (userId: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          // Import service dynamically to avoid circular dependency
          const { UserService } = await import('@/services/userService');
          
          // First try to load from localStorage
          let gameData = UserService.loadGameDataFromStorage(userId);
          
          if (!gameData) {
            // If not in localStorage, try to get from Strapi or create default
            gameData = await UserService.getUserGameData(userId);
          }

          if (!gameData) {
            throw new Error('Failed to load or create game data');
          }

          set((state) => {
            state.userGameData = gameData;
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to load game data';
            state.isLoading = false;
          });
        }
      },

      updateSkill: (skillId: string, newRating: number) => {
        set((state) => {
          if (state.userGameData) {
            const skill = state.userGameData.skills.find(s => s.id === skillId);
            if (skill) {
              skill.rating = newRating;
              skill.progress = Math.min(100, skill.progress + 5);
            }
          }
        });
      },

      unlockAchievement: (achievement: Achievement) => {
        set((state) => {
          if (state.userGameData) {
            const exists = state.userGameData.achievements.find(a => a.id === achievement.id);
            if (!exists) {
              state.userGameData.achievements.push(achievement);
            }
          }
        });
      },

      startChallenge: (challengeId: string) => {
        set((state) => {
          const challenge = state.availableChallenges.find(c => c.id === challengeId);
          if (challenge) {
            state.activeChallenge = challenge;
          }
        });
      },

      completeChallenge: (challengeId: string, _performance: PerformanceMetrics) => {
        set((state) => {
          if (state.userGameData && state.activeChallenge?.id === challengeId) {
            state.userGameData.statistics.challengesCompleted += 1;
            state.userGameData.experience += 100;
            state.activeChallenge = null;
          }
        });
      },

      startMission: (missionId: string) => {
        set((state) => {
          const mission = state.availableMissions.find(m => m.id === missionId);
          if (mission) {
            state.activeMission = { ...mission, status: 'in_progress' };
          }
        });
      },

      completeMission: (missionId: string, _performance: PerformanceMetrics) => {
        set((state) => {
          if (state.userGameData && state.activeMission?.id === missionId) {
            state.userGameData.statistics.missionsCompleted += 1;
            state.userGameData.experience += 200;
            state.activeMission = null;
          }
        });
      },

      startGameSession: () => {
        set((state) => {
          state.currentSession = {
            id: Date.now().toString(),
            userId: state.userGameData?.userId || '',
            startTime: new Date().toISOString(),
            activitiesCompleted: [],
            experienceGained: 0,
            achievementsUnlocked: []
          };
        });
      },

      endGameSession: () => {
        set((state) => {
          if (state.currentSession) {
            state.currentSession.endTime = new Date().toISOString();
            state.currentSession.duration = 
              new Date(state.currentSession.endTime).getTime() - 
              new Date(state.currentSession.startTime).getTime();
            
            // TODO: Save session to Strapi
            state.currentSession = null;
          }
        });
      },

      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },
    })),
    {
      name: 'game-storage',
      partialize: (state) => ({
        userGameData: state.userGameData,
      }),
    }
  )
);